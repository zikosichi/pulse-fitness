"use client";

import { useEffect, useRef } from "react";

/* A sword shine, drawn rather than gradiented.

   CSS can slide a bright bar across a button, and that is what the Shine
   specimen does. What it cannot do is the part that makes light off a blade
   read as metal: several parallel glints at slightly different depths, a halo
   that escapes the shape, and a star that fires the instant the streak crosses
   the middle. Those want compositing, so this one is canvas.

   It is deliberately 2D and not WebGL. A single travelling highlight needs no
   per-pixel shading, and a GL context per button is a real cost on a page that
   might carry several — the pulse line earns its context by evaluating a
   distance field every frame; a moving gradient does not.

   Nothing runs at rest. A pass is fired by `trigger` changing, lasts about
   three quarters of a second, and then the loop stops itself. */

const PAD = 36;              // px of canvas beyond the pill, room for the halo
const TILT = -0.3;           // radians the streak leans off vertical
const DUR = 760;             // ms for one pass
const GAP = 820;             // ms between passes, held hover only

const pill = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  const r = Math.min(h, w) / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

/** One streak, drawn in a space rotated about the pill's centre. */
function streak(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  at: number, halfW: number, halfLen: number,
  stops: Array<[number, string]>,
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(TILT);
  const g = ctx.createLinearGradient(at - halfW, 0, at + halfW, 0);
  for (const [o, c] of stops) g.addColorStop(o, c);
  ctx.fillStyle = g;
  ctx.fillRect(at - halfW, -halfLen, halfW * 2, halfLen * 2);
  ctx.restore();
}

/** An ellipse of light — scaling the context is what makes it elliptical. */
function flare(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, a: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(rx, ry);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  g.addColorStop(0, `rgba(255,255,255,${a})`);
  g.addColorStop(0.35, `rgba(190,255,220,${a * 0.4})`);
  g.addColorStop(1, "rgba(95,224,140,0)");
  ctx.fillStyle = g;
  ctx.fillRect(-1, -1, 2, 2);
  ctx.restore();
}

export default function BladeCanvas({
  trigger,
  loop = false,
  className,
  speed = 1,
  gain = 1,
}: {
  trigger: number;
  loop?: boolean;
  className?: string;
  speed?: number;
  gain?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  /* Read inside the loop so the sliders retune a pass in flight. */
  const cfg = useRef({ loop, speed, gain });
  useEffect(() => { cfg.current = { loop, speed, gain }; }, [loop, speed, gain]);

  useEffect(() => {
    const cv = ref.current;
    const host = cv?.parentElement;
    if (!cv || !host) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    let box = { w: 0, h: 0 };
    const size = () => {
      const r = host.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      box = { w: r.width, h: r.height };
      cv.width = Math.round((r.width + PAD * 2) * dpr);
      cv.height = Math.round((r.height + PAD * 2) * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(host);

    let t0 = 0;

    const frame = (ms: number) => {
      const { loop: rep, speed: sp, gain: g } = cfg.current;
      const dur = DUR / Math.max(0.05, sp);
      if (!t0) t0 = ms;

      const W = box.w + PAD * 2, H = box.h + PAD * 2;
      ctx.clearRect(0, 0, W, H);

      const p = (ms - t0) / dur;
      if (p < 0) { raf.current = requestAnimationFrame(frame); return; }   // resting between passes
      if (p > 1) {
        if (!rep) { raf.current = 0; return; }
        t0 = ms + GAP / Math.max(0.05, sp);
        raf.current = requestAnimationFrame(frame);
        return;
      }

      const { w, h } = box;
      const cx = PAD + w / 2, cy = PAD + h / 2;

      /* Barely eased. A blade catches the light at a near-constant rate; the
         drama belongs to the envelope and the glint, not to the travel. */
      const e = 1 - Math.pow(1 - p, 1.45);
      const span = w / 2 + h * 1.4;
      const at = -span + 2 * span * e;
      const env = Math.pow(Math.sin(Math.PI * p), 0.55);
      const len = (w + h) * 1.2;

      ctx.globalCompositeOperation = "lighter";

      /* 1 — the halo, unclipped, so light escapes the shape the way it would
         off a real edge. */
      streak(ctx, cx, cy, at, h * 1.15, len, [
        [0, "rgba(61,194,108,0)"],
        [0.5, `rgba(95,224,140,${0.2 * env * g})`],
        [1, "rgba(61,194,108,0)"],
      ]);

      /* 2 — everything on the face, held inside the pill. */
      ctx.save();
      pill(ctx, PAD, PAD, w, h);
      ctx.clip();

      streak(ctx, cx, cy, at, h * 0.62, len, [
        [0, "rgba(158,255,199,0)"],
        [0.5, `rgba(158,255,199,${0.34 * env})`],
        [1, "rgba(158,255,199,0)"],
      ]);
      streak(ctx, cx, cy, at, h * 0.16, len, [
        [0, "rgba(255,255,255,0)"],
        [0.5, `rgba(255,255,255,${0.92 * env})`],
        [1, "rgba(255,255,255,0)"],
      ]);
      /* Two thin glints riding just off the core. Real brushed metal never
         returns one clean highlight, and the pair is what stops this reading
         as a rectangle with soft edges. */
      for (const [off, a, wid] of [[-h * 0.34, 0.3, 0.05], [h * 0.26, 0.22, 0.04]] as const) {
        streak(ctx, cx, cy, at + off, h * wid, len, [
          [0, "rgba(255,255,255,0)"],
          [0.5, `rgba(226,255,238,${a * env})`],
          [1, "rgba(255,255,255,0)"],
        ]);
      }
      ctx.restore();

      /* 3 — the glint, fired as the streak crosses the middle. Unclipped, so
         its spikes carry past the edge of the pill. */
      const spark = Math.exp(-Math.pow((p - 0.52) / 0.085, 2));
      if (spark > 0.01) {
        const gx = cx + at * Math.cos(TILT);
        const gy = cy + at * Math.sin(TILT);
        const a = spark * g;
        flare(ctx, gx, gy, h * 1.5, 2.2, 0.85 * a);   // horizontal spike
        flare(ctx, gx, gy, 2.6, h * 0.62, 0.7 * a);   // vertical spike
        flare(ctx, gx, gy, h * 0.3, h * 0.3, 0.5 * a); // core bloom
      }

      ctx.globalCompositeOperation = "source-over";
      raf.current = requestAnimationFrame(frame);
    };

    /* trigger starts at 0 and only a hover bumps it, so nothing fires on load. */
    if (trigger > 0 || loop) {
      t0 = 0;
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(frame);
    }

    return () => {
      ro.disconnect();
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = 0;
    };
  }, [trigger, loop]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
