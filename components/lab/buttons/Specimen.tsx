"use client";

import { useState, type PointerEvent } from "react";
import { PhoneIcon } from "@/components/bits";
import ArcCanvas from "./ArcCanvas";
import BladeCanvas from "./BladeCanvas";
import s from "./buttons.module.css";

export type Fx =
  | "shine" | "blade" | "key" | "flip" | "glass" | "rise"
  | "arc" | "rim" | "flare" | "rim1" | "rimf" | "trace" | "flood" | "ecg" | "charge"
  | "static" | "magnet";

export const FX: ReadonlyArray<{ key: Fx; name: string; note: string; batch: 1 | 2 }> = [
  { key: "shine",  batch: 2, name: "Shine",  note: "A sword shine: a soft flank and a white core a beat behind it, crossing the face left to right. Pure CSS, one pass per hover." },
  { key: "blade",  batch: 2, name: "Blade",  note: "The same shine drawn on canvas — parallel glints, a halo that escapes the pill, and a star that fires as it crosses the middle." },
  { key: "key",    batch: 2, name: "Key",    note: "A keycap on a hard 4px edge. Rises to 7px on hover, bottoms out flat on press. Overshoots slightly on the way up." },
  { key: "flip",   batch: 2, name: "Flip",   note: "Split-flap. The label rotates out and a second copy lands in its place while the fill changes underneath, both edge-on." },
  { key: "glass",  batch: 2, name: "Glass",  note: "A frosted plate that sharpens rather than moves — more blur, more saturation, a brighter top edge. Judge it over the photo." },
  { key: "rise",   batch: 2, name: "Rise",   note: "The fill comes up like liquid with a curved surface that rocks, and the label inverts as the level passes it." },

  { key: "arc", batch: 1,    name: "Arc",      note: "Filaments peel off the rim and snap back into it. Drawn on canvas — the only one CSS could not do." },
  { key: "rim", batch: 1,    name: "Rim",      note: "A single light runs the border and throws its bloom behind the pill. Idles at a quarter strength." },
  { key: "flare", batch: 1,  name: "Rim flare", note: "The original loop, plus a lift. Hovering strikes it at full, then ring, bloom and halo fade evenly to nothing over 3s. Press puts it down." },
  { key: "rim1", batch: 1,   name: "Rim once", note: "Enters bottom-left, runs the left cap and the whole top edge, stops on the top-right shoulder. Lifts 2px on hover, back down on press." },
  { key: "rimf", batch: 1,   name: "Rim follow", note: "No clock at all — the light sits wherever the cursor is. Tightens near the edge, spreads when you sit in the middle. Same lift and press." },
  { key: "trace", batch: 1,  name: "Trace",    note: "Two sparks race the outline in opposite directions and cross twice a lap." },
  { key: "flood", batch: 1,  name: "Flood",    note: "Colour arrives from wherever the cursor entered, and the label flips to ink under it." },
  { key: "ecg", batch: 1,    name: "Flatline", note: "The logo's own line runs through the button, flat until hover, then it spikes." },
  { key: "charge", batch: 1, name: "Charge",   note: "Fills like a capacitor. The label inverts behind the wavefront as it passes." },
  { key: "static", batch: 1, name: "Static",   note: "Noise, scanlines and a chromatic split on the label — an under-powered sign." },
  { key: "magnet", batch: 1, name: "Magnet",   note: "Leans into the cursor under a specular that tracks it. The label trails by a hair." },
];

/* Set as CSS custom properties rather than React state: the pointer moves at
   frame rate and none of this needs to re-render the tree. */
function track(e: PointerEvent<HTMLButtonElement>) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width;
  const y = (e.clientY - r.top) / r.height;
  el.style.setProperty("--fx-px", `${x * 100}%`);
  el.style.setProperty("--fx-py", `${y * 100}%`);
  const nx = (x - 0.5) * 2;
  const ny = (y - 0.5) * 2;
  el.style.setProperty("--fx-dx", `${nx}`);
  el.style.setProperty("--fx-dy", `${ny}`);

  /* Bearing clockwise from twelve o'clock, to match conic-gradient. Taken from
     pixels, not from the normalised pair — on a pill twice as wide as it is
     tall those two disagree by a lot and the light would sit off the cursor. */
  const px = e.clientX - r.left - r.width / 2;
  const py = e.clientY - r.top - r.height / 2;
  el.style.setProperty("--fx-ang", `${(Math.atan2(px, -py) * 180) / Math.PI}deg`);
  el.style.setProperty("--fx-r", `${Math.min(1, Math.hypot(nx, ny))}`);
}

function recentre(e: PointerEvent<HTMLButtonElement>) {
  const el = e.currentTarget;
  el.style.setProperty("--fx-dx", "0");
  el.style.setProperty("--fx-dy", "0");
  el.style.setProperty("--fx-r", "0");
}

/* Flat, spike, flat — the same event the nav mark and the divider draw.
   preserveAspectRatio is off, so the flatlines stretch to the button's width
   while the spike keeps its shape. */
const ECG = "M0 20 H58 L64 27 L72 6 L80 34 L86 20 H160";
const ECG_SPIKE = "M58 20 L64 27 L72 6 L80 34 L86 20";

export default function Specimen({
  fx,
  base,
  label,
  icon = true,
  hold = false,
  speed = 1,
  gain = 1,
}: {
  fx: Fx;
  base: "solid" | "ghost";
  label: string;
  icon?: boolean;
  hold?: boolean;
  speed?: number;
  gain?: number;
}) {
  const [over, setOver] = useState(false);
  const [sweep, setSweep] = useState(0);
  const live = hold || over;

  /* Rim once fires its lap by remounting .out — a fresh element restarts the
     animation from zero — so the light finishes the circuit even if the
     pointer has already left. Holding hover is the other way in, hence the
     flag in the key. */
  const once = fx === "rim1";
  const fires = once || fx === "blade";
  const lap = once ? `${sweep}${hold ? "h" : ""}` : undefined;

  const inner = (
    <span className={s.clip}>
      {fx === "ecg" && (
        <svg className={s.ecgSvg} viewBox="0 0 160 40" preserveAspectRatio="none" aria-hidden="true">
          <path className={s.ecgBase} d={ECG} />
          <path className={s.ecgRun} d={ECG} pathLength={100} />
          <path className={s.ecgSpike} d={ECG_SPIKE} />
        </svg>
      )}
    </span>
  );

  const outer = (
    <span
      className={s.out}
      key={lap}
      data-sweep={once && (sweep > 0 || hold) ? "" : undefined}
      data-loop={once && hold ? "" : undefined}
    >
      {fx === "trace" && (
        <svg className={s.traceSvg} aria-hidden="true">
          <rect className={s.traceBase} />
          <rect className={s.traceRun} pathLength={100} />
          <rect className={s.traceRun2} pathLength={100} />
        </svg>
      )}
    </span>
  );

  const face = (
    <>
      {icon && <PhoneIcon />}
      <span>{label}</span>
    </>
  );

  return (
    <button
      type="button"
      className={`${s.b} ${s[fx]} ${s[base]}`}
      data-hot={hold ? "" : undefined}
      onPointerMove={track}
      onPointerEnter={(e) => { track(e); setOver(true); if (fires) setSweep((n) => n + 1); }}
      onPointerLeave={(e) => { recentre(e); setOver(false); }}
    >
      {inner}
      {outer}
      {fx === "arc" && <ArcCanvas className={s.bolt} live={live} speed={speed} gain={gain} />}
      {fx === "blade" && (
        <BladeCanvas className={s.bladeCv} trigger={sweep} loop={hold} speed={speed} gain={gain} />
      )}

      <span className={s.label}>
        {fx === "flip" ? <span className={s.flipFront}>{face}</span> : face}
        {fx === "flip" && <span className={s.flipBack} aria-hidden="true">{face}</span>}
        {fx === "charge" && <span className={s.chargeInk} aria-hidden="true">{face}</span>}
        {fx === "rise" && <span className={s.riseInk} aria-hidden="true">{face}</span>}
      </span>
    </button>
  );
}
