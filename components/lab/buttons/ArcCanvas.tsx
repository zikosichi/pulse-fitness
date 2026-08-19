"use client";

import { useEffect, useRef } from "react";

/* Lightning that hugs the button's outline.

   CSS cannot make a line that wanders off its own path, so this one is drawn:
   the pill's perimeter is sampled as an arc-length curve, and each filament is
   a slice of that curve pushed along its own normal by a little stack of sines.
   Because the displacement rides the normal, the bolt peels away from the edge
   and snaps back to it — the same trick the pulse-line shader uses to keep its
   filaments travelling *along* the ECG rather than across it.

   It only runs while the button is live, and eases its amplitude to zero before
   stopping, so leaving the button does not cut the arc mid-flash. */

const PAD = 30;        // px of canvas beyond the pill, room for the bloom
const BOLTS = 3;

type Sample = { x: number; y: number; nx: number; ny: number };

type Seg =
  | { kind: "line"; len: number; x0: number; y0: number; x1: number; y1: number; nx: number; ny: number }
  | { kind: "arc"; len: number; cx: number; cy: number; r: number; a0: number; a1: number };

/** The pill's outline, clockwise from the top-left corner, as walkable segments. */
function outline(w: number, h: number) {
  const x = PAD, y = PAD;
  const r = Math.min(h / 2, w / 2);
  const sx = w - 2 * r;                       // straight run, top and bottom
  const sy = h - 2 * r;                       // straight run, left and right
  const q = (Math.PI / 2) * r;                // quarter turn
  const H = Math.PI / 2;

  const segs: Seg[] = [
    { kind: "line", len: sx, x0: x + r, y0: y, x1: x + w - r, y1: y, nx: 0, ny: -1 },
    { kind: "arc", len: q, cx: x + w - r, cy: y + r, r, a0: -H, a1: 0 },
    { kind: "line", len: sy, x0: x + w, y0: y + r, x1: x + w, y1: y + h - r, nx: 1, ny: 0 },
    { kind: "arc", len: q, cx: x + w - r, cy: y + h - r, r, a0: 0, a1: H },
    { kind: "line", len: sx, x0: x + w - r, y0: y + h, x1: x + r, y1: y + h, nx: 0, ny: 1 },
    { kind: "arc", len: q, cx: x + r, cy: y + h - r, r, a0: H, a1: Math.PI },
    { kind: "line", len: sy, x0: x, y0: y + h - r, x1: x, y1: y + r, nx: -1, ny: 0 },
    { kind: "arc", len: q, cx: x + r, cy: y + r, r, a0: Math.PI, a1: 3 * H },
  ];

  const total = segs.reduce((n, s) => n + s.len, 0);

  /** u wraps, so a filament can run off the end of the loop and back on. */
  const at = (u: number): Sample => {
    let d = ((u % 1) + 1) % 1 * total;
    for (const s of segs) {
      if (d > s.len) { d -= s.len; continue; }
      const t = s.len === 0 ? 0 : d / s.len;
      if (s.kind === "line") {
        return {
          x: s.x0 + (s.x1 - s.x0) * t,
          y: s.y0 + (s.y1 - s.y0) * t,
          nx: s.nx, ny: s.ny,
        };
      }
      const a = s.a0 + (s.a1 - s.a0) * t;
      const nx = Math.cos(a), ny = Math.sin(a);
      return { x: s.cx + nx * s.r, y: s.cy + ny * s.r, nx, ny };
    }
    return { x: PAD, y: PAD, nx: 0, ny: -1 };
  };

  return { at, total };
}

/* Three octaves is enough to read as electricity: one long wander, one kink,
   one buzz. More just turns to fur at this scale. */
function wobble(u: number, t: number, seed: number) {
  return (
    Math.sin(u * 6.1 + t * 2.7 + seed) * 0.58 +
    Math.sin(u * 15.7 - t * 4.3 + seed * 2.3) * 0.29 +
    Math.sin(u * 38.9 + t * 7.1 + seed * 5.1) * 0.13
  );
}

type Bolt = { u: number; drift: number; span: number; seed: number; reach: number };

const makeBolts = (): Bolt[] =>
  Array.from({ length: BOLTS }, (_, i) => ({
    u: i / BOLTS,
    drift: (i % 2 ? -1 : 1) * (0.11 + i * 0.05),   // opposing directions read busier
    span: 0.2 + i * 0.07,
    seed: i * 12.9898,
    reach: 7 + i * 3,
  }));

export default function ArcCanvas({
  live,
  className,
  speed = 1,
  gain = 1,
}: {
  live: boolean;
  className?: string;
  speed?: number;
  gain?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const amp = useRef(0);
  const raf = useRef(0);
  /* Read inside the loop so the sliders retune a running arc instead of
     restarting it. */
  const cfg = useRef({ live, speed, gain });
  useEffect(() => { cfg.current = { live, speed, gain }; }, [live, speed, gain]);

  useEffect(() => {
    const cv = ref.current;
    const host = cv?.parentElement;
    if (!cv || !host) return;

    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const bolts = makeBolts();
    let path = outline(0, 0);
    let box = { w: 0, h: 0 };

    const size = () => {
      const r = host.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      box = { w: r.width, h: r.height };
      cv.width = Math.round((r.width + PAD * 2) * dpr);
      cv.height = Math.round((r.height + PAD * 2) * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      path = outline(r.width, r.height);
    };
    size();

    const ro = new ResizeObserver(size);
    ro.observe(host);

    const frame = (ms: number) => {
      const { live: on, speed: sp, gain: g } = cfg.current;
      const t = (ms / 1000) * sp;

      amp.current += ((on ? 1 : 0) - amp.current) * 0.14;
      const a = amp.current;

      ctx.clearRect(0, 0, box.w + PAD * 2, box.h + PAD * 2);

      if (a < 0.004 && !on) { amp.current = 0; raf.current = 0; return; }

      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      for (const b of bolts) {
        /* Whole filaments blink out now and then. The gaps are what stop it
           reading as a rotating ring of light. */
        const flick = 0.55 + 0.45 * Math.sin(t * 21 + b.seed * 3.7);
        if (flick < 0.62 && Math.sin(t * 6.3 + b.seed) > 0.4) continue;

        const head = b.u + t * b.drift * 0.35;
        const steps = 30;
        const pts: Array<[number, number]> = [];

        for (let i = 0; i <= steps; i++) {
          const k = i / steps;
          const u = head + k * b.span;
          const p = path.at(u);
          /* Zero at both ends: each filament grows out of the rim and melts
             back into it rather than stopping in mid-air. */
          const env = Math.sin(k * Math.PI) ** 1.3;
          const d = wobble(u * path.total * 0.03, t, b.seed) * b.reach * env * a;
          pts.push([p.x + p.nx * d, p.y + p.ny * d]);
        }

        const draw = () => {
          ctx.beginPath();
          ctx.moveTo(pts[0][0], pts[0][1]);
          for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
          ctx.stroke();
        };

        ctx.shadowColor = "#5FE08C";

        ctx.shadowBlur = 16 * g;
        ctx.lineWidth = 3.4;
        ctx.strokeStyle = `rgba(61,194,108,${0.34 * a * flick * g})`;
        draw();

        ctx.shadowBlur = 7 * g;
        ctx.lineWidth = 1.15;
        ctx.strokeStyle = `rgba(226,255,238,${0.9 * a * flick})`;
        draw();

        /* A hot point riding the filament — the eye needs something to track. */
        const hp = pts[Math.floor((0.5 + 0.48 * Math.sin(t * 3.1 + b.seed)) * steps)];
        ctx.shadowBlur = 12 * g;
        ctx.fillStyle = `rgba(255,255,255,${0.75 * a * flick})`;
        ctx.beginPath();
        ctx.arc(hp[0], hp[1], 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = "source-over";
      raf.current = requestAnimationFrame(frame);
    };

    if (live || amp.current > 0) raf.current = requestAnimationFrame(frame);

    return () => {
      ro.disconnect();
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = 0;
    };
  }, [live]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
