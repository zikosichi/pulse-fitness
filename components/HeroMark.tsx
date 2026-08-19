"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useState, useSyncExternalStore } from "react";
import PulseCanvas from "@/components/pulse/PulseCanvas";
import { HERO_SETTINGS } from "@/components/pulse/settings";

/* The in-place tuning panel. Kept for future tweaking but off by default: it
   renders only in development AND only when the URL carries ?tune. The dev
   server still serves its chunk either way — Turbopack prefetches it — but
   nothing renders and it costs nothing at runtime. In a production build the
   NODE_ENV branch is dead, so the import is eliminated and the chunk is never
   emitted at all.

   To tune again: http://localhost:3000/?tune */
const Tuner =
  process.env.NODE_ENV === "development"
    ? dynamic(() => import("./HeroTuner"), { ssr: false })
    : null;

let tuneFlag: boolean | null = null;
const wantsTuner = () => {
  if (tuneFlag === null) tuneFlag = new URLSearchParams(window.location.search).has("tune");
  return tuneFlag;
};

/* The wordmark with its pulse line lit rather than drawn.

   Two images, one canvas, and a deliberate order of events:

   - Server and first paint render the ORIGINAL logo, drawn green line and all.
     That is also the permanent fallback, so a browser that never runs the
     shader gets a complete mark rather than one with a line missing.
   - Only once the shader has put a frame on screen do we swap to the
     pulse-less duplicate and reveal the canvas. Both come from one state
     update, so the swap is atomic — there is never a frame with no line.

   Kill switches are from Brand & Identity/Visual Direction.md, which is
   explicit that this page has to survive a phone on a Georgian mobile
   network. Small screens drop render quality rather than losing the effect;
   everything else falls back to the static mark. */

const BLACK = [0, 0, 0] as const;
const NARROW = "(max-width: 700px)";

/* Whether this browser should run the shader at all. Constant for the life of
   the document, so it is probed once and cached. */
let capable: boolean | null = null;

function canRun(): boolean {
  if (capable !== null) return capable;

  capable = (() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;

    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return false;

    /* Probe for WebGL2 before committing, and hand the probe's context back
       immediately — browsers cap how many can be alive at once. */
    try {
      const probe = document.createElement("canvas").getContext("webgl2");
      if (!probe) return false;
      probe.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      return false;
    }
    return true;
  })();

  return capable;
}

const neverChanges = () => () => {};
const onServer = () => false;

const watchNarrow = (notify: () => void) => {
  const m = window.matchMedia(NARROW);
  m.addEventListener("change", notify);
  return () => m.removeEventListener("change", notify);
};
const isNarrow = () => window.matchMedia(NARROW).matches;

export default function HeroMark() {
  /* Both of these are readings of the platform, not React state — the store
     hook is the honest way to express that, and it keeps the server render
     (static logo) consistent with hydration. */
  const capableNow = useSyncExternalStore(neverChanges, canRun, onServer);
  const narrow = useSyncExternalStore(watchNarrow, isNarrow, onServer);
  const tuning = useSyncExternalStore(neverChanges, wantsTuner, onServer);

  const [failed, setFailed] = useState(false);
  const [lit, setLit] = useState(false);
  const [tuned, setTuned] = useState(HERO_SETTINGS);

  const live = capableNow && !failed;

  return (
    <span className="hero__markstack" data-lit={lit ? "" : undefined}>
      <Image
        className="hero__mark"
        src={lit ? "/brand/pulse-fitness-wordmark.svg" : "/brand/pulse-fitness-logo.svg"}
        alt="Pulse Fitness"
        width={1283}
        height={511}
        priority
      />
      {live && (
        <PulseCanvas
          settings={{ ...tuned, scale: narrow ? 0.7 : 1 }}
          fit="viewbox"
          background={BLACK}
          transparent
          edgeFade={90}
          onReady={() => setLit(true)}
          onError={() => { setFailed(true); setLit(false); }}
        />
      )}
      {Tuner && tuning && <Tuner value={tuned} onChange={setTuned} />}
    </span>
  );
}
