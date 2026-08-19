/* The tuning panel's knobs and starting points. Lab-only — the shader and
   the values the site ships live in components/pulse. */

import { DEFAULTS, type Settings } from "@/components/pulse/settings";

export type Control = {
  key: keyof Settings;
  label: string;
  min: number; max: number; step: number;
  group: string;
  hint?: string;
};

export const CONTROLS: readonly Control[] = [
  { group: "Line", key: "core",      label: "Core radius",   min: 1,    max: 40,   step: 0.5,   hint: "12 = the drawn stroke" },
  { group: "Line", key: "thick",     label: "Core hardness", min: 0,    max: 1,    step: 0.01 },
  { group: "Line", key: "halo",      label: "Bloom",         min: 0,    max: 1,    step: 0.01 },
  { group: "Line", key: "haloR",     label: "Bloom radius",  min: 2,    max: 120,  step: 1 },
  { group: "Line", key: "taper",     label: "Tip taper",     min: 0,    max: 0.5,  step: 0.005, hint: "fraction of the length" },

  { group: "Electricity", key: "filAlong",  label: "Filament length",  min: 0.002, max: 0.08, step: 0.001, hint: "lower = longer streaks" },
  { group: "Electricity", key: "filAcross", label: "Filament density", min: 0.01,  max: 0.6,  step: 0.005 },
  { group: "Electricity", key: "flow",      label: "Flow speed",       min: -400,  max: 400,  step: 5,     hint: "units/sec along the line" },
  { group: "Electricity", key: "ridge",     label: "Ridge sharpness",  min: 0.5,   max: 6,    step: 0.05 },
  { group: "Electricity", key: "dodge",     label: "Colour dodge",     min: 0,     max: 1,    step: 0.01,  hint: "0 = multiply, 1 = dodge" },
  { group: "Electricity", key: "sparkDens", label: "Spark density",    min: 0.01,  max: 0.4,  step: 0.005 },
  { group: "Electricity", key: "sparkAmt",  label: "Spark amount",     min: 0,     max: 0.6,  step: 0.01 },
  { group: "Electricity", key: "filReach",  label: "Filament reach",   min: 4,     max: 160,  step: 1,     hint: "how far sparks carry" },
  { group: "Electricity", key: "corner",    label: "Corner blend",     min: 1,     max: 200,  step: 1,     hint: "smooths the fold at the spike" },

  { group: "Life", key: "nodeSpeed", label: "Node speed",  min: 0, max: 1.5, step: 0.01, hint: "traversals/sec" },
  { group: "Life", key: "nodeWidth", label: "Node width",  min: 5, max: 400, step: 5 },
  { group: "Life", key: "nodeGain",  label: "Node swell",  min: 0, max: 6,   step: 0.05 },
  { group: "Life", key: "flicker",   label: "Flicker",     min: 0, max: 1,   step: 0.01, hint: "40ms jitter" },

  { group: "Colour", key: "exposure", label: "Exposure",  min: 0.1, max: 4, step: 0.05 },
  { group: "Colour", key: "white",    label: "Core white", min: 0,  max: 1, step: 0.01 },

  { group: "Render", key: "scale", label: "Render scale", min: 0.25, max: 2, step: 0.05, hint: "cost lever for phones" },
];

/* Starting points to argue with, not answers. */
export const PRESETS: Record<string, Partial<Settings>> = {
  Signature: DEFAULTS,
  Whisper: {
    core: 7, thick: 0.7, halo: 0.05, haloR: 18, taper: 0.22,
    filAlong: 0.008, filAcross: 0.08, flow: 45, ridge: 1.6,
    dodge: 0.4, sparkDens: 0.05, sparkAmt: 0.05, filReach: 20, corner: 30,
    nodeSpeed: 0.16, nodeWidth: 150, nodeGain: 1.1, flicker: 0.05,
    exposure: 0.8, white: 0.4,
  },
  /* Same line, much more weather around it. Widening the core instead just
     saturates the long flatlines into a white bar — the electricity has to
     come from the filaments and sparks, not from more light. */
  Storm: {
    core: 9, thick: 0.8, halo: 0.35, haloR: 60, taper: 0.1,
    filAlong: 0.032, filAcross: 0.3, flow: 260, ridge: 3.2,
    dodge: 1, sparkDens: 0.2, sparkAmt: 0.4, filReach: 60, corner: 55,
    nodeSpeed: 0.55, nodeWidth: 60, nodeGain: 3.0, flicker: 0.45,
    exposure: 0.95, white: 0.8,
  },
  "Huly-faithful": {
    core: 8, thick: 1, halo: 0.18, haloR: 34, taper: 0.05,
    filAlong: 0.006, filAcross: 0.34, flow: 90, ridge: 2.8,
    dodge: 1, sparkDens: 0.14, sparkAmt: 0.22, filReach: 48, corner: 45,
    nodeSpeed: 0.33, nodeWidth: 70, nodeGain: 2.0, flicker: 0.5,
    exposure: 1.0, white: 0.9,
  },
};

export const DEBUG_MODES = ["Off", "Distance field", "Arc length", "Filaments", "Taper"] as const;
