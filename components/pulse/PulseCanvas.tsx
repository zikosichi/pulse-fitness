"use client";

import { useEffect, useRef } from "react";
import { FRAG, MAX_PTS, VERT } from "./pulseShader";
import type { Settings } from "./settings";
import {
  LOGO_VIEWBOX, PULSE_CUM_F32, PULSE_LENGTH, PULSE_PATH,
  PULSE_PTS_F32, PULSE_SEGMENTS,
} from "@/lib/pulse-path";

/* Bounding box of the line itself, not the logo frame — the glow should be
   centred on the drawing, not on the whitespace around it. */
const BB = PULSE_PATH.reduce(
  (b, [x, y]) => ({
    x0: Math.min(b.x0, x), y0: Math.min(b.y0, y),
    x1: Math.max(b.x1, x), y1: Math.max(b.y1, y),
  }),
  { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity },
);

const RGB = (hex: string): [number, number, number] => [
  parseInt(hex.slice(1, 3), 16) / 255,
  parseInt(hex.slice(3, 5), 16) / 255,
  parseInt(hex.slice(5, 7), 16) / 255,
];

const PULSE = RGB("#3DC26C");   // --pulse
const GLOW = RGB("#5FE08C");    // --glow
const INK = RGB("#08120E");     // --ink

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(sh) ?? "shader compile failed");
  }
  return sh;
}

type Props = {
  settings: Settings;
  debug?: number;
  paused?: boolean;
  zoom?: number;
  /* "line"    fits the line's bounding box into the canvas, with breathing
                room and a zoom multiplier — the lab's view.
     "viewbox" maps the logo's 1283x511 viewBox 1:1 onto the canvas box, so a
                wordmark image drawn over the same box lines up exactly and
                cannot drift. */
  fit?: "line" | "viewbox";
  /* Ink by default. The hero passes black: the canvas is screen-blended over
     the wordmark there, and screening a non-black ground would paint the
     canvas's own rectangle over the page. */
  background?: readonly [number, number, number];
  /* Emit light additively over whatever is behind the canvas instead of
     painting an opaque ground. Pair with background = black. */
  transparent?: boolean;
  /* Logo units of soft fade at the canvas edge. Needed wherever the canvas is
     composited over something (the hero), so its box can never show. */
  edgeFade?: number;
  /* Fired after the first frame actually reaches the screen. */
  onReady?: () => void;
  onFps?: (fps: number) => void;
  onError?: (msg: string) => void;
  /* Reports the logo-units -> CSS-pixels transform so an overlay can be lined
     up exactly against what the shader drew. */
  onFit?: (fit: { scale: number; x: number; y: number }) => void;
};

export default function PulseCanvas({
  settings, debug = 0, paused = false, zoom = 1,
  fit: fitMode = "line", background = INK, transparent = false, edgeFade = 0,
  onFps, onError, onFit, onReady,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* Live values the animation loop reads without being torn down and rebuilt
     on every slider drag. The callbacks go the same way: the loop is built
     once, so a freshly-identified callback would otherwise never be seen.
     Synced in an effect rather than during render — mutating a ref while
     rendering is not safe under concurrent rendering. */
  const live = useRef({ settings, debug, paused, zoom, fitMode, background, edgeFade });
  const cb = useRef({ onFps, onError, onFit, onReady });

  useEffect(() => {
    live.current = { settings, debug, paused, zoom, fitMode, background, edgeFade };
    cb.current = { onFps, onError, onFit, onReady };
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", {
      antialias: false, alpha: transparent, premultipliedAlpha: true,
      depth: false, stencil: false,
      powerPreference: "high-performance",
    });
    if (!gl) { cb.current.onError?.("WebGL2 is not available in this browser."); return; }

    let program: WebGLProgram;
    try {
      program = gl.createProgram()!;
      gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
      gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program) ?? "link failed");
      }
    } catch (e) {
      cb.current.onError?.(String(e instanceof Error ? e.message : e));
      return;
    }

    gl.useProgram(program);
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const U = (n: string) => gl.getUniformLocation(program, n);
    const u = {
      resolution: U("uResolution"), time: U("uTime"), pan: U("uPan"), zoom: U("uZoom"),
      pts: U("uPts"), cum: U("uCum"), segs: U("uSegs"), len: U("uLen"),
      core: U("uCore"), thick: U("uThick"), halo: U("uHalo"), haloR: U("uHaloR"), taper: U("uTaper"),
      filAlong: U("uFilAlong"), filAcross: U("uFilAcross"), flow: U("uFlow"), ridge: U("uRidge"),
      dodge: U("uDodge"), sparkDens: U("uSparkDens"), sparkAmt: U("uSparkAmt"), filReach: U("uFilReach"), corner: U("uCorner"),
      nodeSpeed: U("uNodeSpeed"), nodeWidth: U("uNodeWidth"), nodeGain: U("uNodeGain"), flicker: U("uFlicker"),
      exposure: U("uExposure"), white: U("uWhite"),
      pulse: U("uPulse"), glow: U("uGlow"), bg: U("uBg"), debug: U("uDebug"),
      premul: U("uPremul"), edgeFade: U("uEdgeFade"),
    };

    /* Geometry never changes — upload once, padded to the array size the
       shader declares. */
    const pts = new Float32Array(MAX_PTS * 2);
    pts.set(PULSE_PTS_F32);
    const cum = new Float32Array(MAX_PTS);
    cum.set(PULSE_CUM_F32);
    gl.uniform2fv(u.pts, pts);
    gl.uniform1fv(u.cum, cum);
    gl.uniform1i(u.segs, PULSE_SEGMENTS);
    gl.uniform1f(u.len, PULSE_LENGTH);
    gl.uniform3fv(u.pulse, PULSE);
    gl.uniform3fv(u.glow, GLOW);
    gl.uniform1i(u.premul, transparent ? 1 : 0);

    let raf = 0;
    let start = performance.now();
    let clock = 0;            // seconds of *animation* time, pausable
    let last = start;
    let frames = 0, fpsAt = start;
    let lost = false;
    let lastFit = { scale: 0, x: 0, y: 0 };
    let announced = false;
    let onScreen = true;

    const onLost = (e: Event) => { e.preventDefault(); lost = true; cancelAnimationFrame(raf); };
    const onRestored = () => { lost = false; start = performance.now(); raf = requestAnimationFrame(frame); };
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    function sizeTo(scale: number) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2) * scale;
      const w = Math.max(1, Math.round(canvas!.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas!.clientHeight * dpr));
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width = w; canvas!.height = h;
        gl!.viewport(0, 0, w, h);
      }
      return { w, h };
    }

    function frame(now: number) {
      if (lost) return;
      const { settings: s, debug: dbg, paused: pz, zoom: zm, fitMode: fm, background: bg, edgeFade: ef } = live.current;

      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (!pz && onScreen) clock += dt;

      const { w, h } = sizeTo(s.scale);

      /* Everything the shader does is in logo units, so this is the only
         place pixels enter the picture. */
      let fit: number, panX: number, panY: number;
      if (fm === "viewbox") {
        fit = w / LOGO_VIEWBOX.w;
        panX = 0;
        panY = (h - LOGO_VIEWBOX.h * fit) / 2;
      } else {
        const bw = BB.x1 - BB.x0, bh = BB.y1 - BB.y0;
        fit = Math.min(w / (bw * 1.18), h / (bh * 2.4)) * zm;
        panX = w / 2 - ((BB.x0 + BB.x1) / 2) * fit;
        panY = h / 2 - ((BB.y0 + BB.y1) / 2) * fit;
      }

      const dpr = w / Math.max(canvas!.clientWidth, 1);
      const nextFit = { scale: fit / dpr, x: panX / dpr, y: panY / dpr };
      if (Math.abs(nextFit.scale - lastFit.scale) > 1e-4 ||
          Math.abs(nextFit.x - lastFit.x) > 0.25 ||
          Math.abs(nextFit.y - lastFit.y) > 0.25) {
        lastFit = nextFit;
        cb.current.onFit?.(nextFit);
      }

      gl!.uniform2f(u.resolution, w, h);
      gl!.uniform1f(u.time, clock);
      gl!.uniform2f(u.pan, panX, panY);
      gl!.uniform1f(u.zoom, fit);

      gl!.uniform1f(u.core, s.core);
      gl!.uniform1f(u.thick, s.thick);
      gl!.uniform1f(u.halo, s.halo);
      gl!.uniform1f(u.haloR, s.haloR);
      gl!.uniform1f(u.taper, s.taper);
      gl!.uniform1f(u.filAlong, s.filAlong);
      gl!.uniform1f(u.filAcross, s.filAcross);
      gl!.uniform1f(u.flow, s.flow);
      gl!.uniform1f(u.ridge, s.ridge);
      gl!.uniform1f(u.dodge, s.dodge);
      gl!.uniform1f(u.sparkDens, s.sparkDens);
      gl!.uniform1f(u.sparkAmt, s.sparkAmt);
      gl!.uniform1f(u.filReach, s.filReach);
      gl!.uniform1f(u.corner, s.corner);
      gl!.uniform1f(u.nodeSpeed, s.nodeSpeed);
      gl!.uniform1f(u.nodeWidth, s.nodeWidth);
      gl!.uniform1f(u.nodeGain, s.nodeGain);
      gl!.uniform1f(u.flicker, s.flicker);
      gl!.uniform1f(u.exposure, s.exposure);
      gl!.uniform1f(u.white, s.white);
      gl!.uniform1i(u.debug, dbg);
      gl!.uniform3fv(u.bg, new Float32Array(bg));
      gl!.uniform1f(u.edgeFade, ef);

      gl!.drawArrays(gl!.TRIANGLES, 0, 3);

      if (!announced) { announced = true; cb.current.onReady?.(); }

      frames++;
      if (now - fpsAt >= 500) {
        cb.current.onFps?.(Math.round((frames * 1000) / (now - fpsAt)));
        frames = 0; fpsAt = now;
      }
      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);

    /* Stop burning GPU when the tab is not visible. */
    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !lost) { last = performance.now(); raf = requestAnimationFrame(frame); }
    };
    document.addEventListener("visibilitychange", onVis);

    /* Scrolled out of view costs nothing. */
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (onScreen && !document.hidden && !lost) { last = performance.now(); raf = requestAnimationFrame(frame); }
    }, { rootMargin: "120px" });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      io.disconnect();
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      gl.deleteProgram(program);
      gl.deleteVertexArray(vao);
    };
    // The loop reads everything through the refs above, so it is built once.
    // `transparent` is a context-creation flag: changing it needs a remount.
  }, [transparent]);

  return <canvas ref={canvasRef} aria-hidden="true" />;
}
