/* Every knob the shader exposes, described as data so the panel is generated
   rather than hand-written — adding a control is one line here.

   All distances are in logo viewBox units (the line is ~1769 units long and
   the drawn stroke is 24 units wide), so the numbers mean the same thing at
   any canvas size or zoom. */

export type Settings = {
  core: number; thick: number; halo: number; haloR: number; taper: number;
  filAlong: number; filAcross: number; flow: number; ridge: number;
  dodge: number; sparkDens: number; sparkAmt: number; filReach: number; corner: number;
  nodeSpeed: number; nodeWidth: number; nodeGain: number; flicker: number;
  exposure: number; white: number;
  scale: number;
};

export const DEFAULTS: Settings = {
  core: 12, thick: 0.55, halo: 0.12, haloR: 26, taper: 0.16,
  filAlong: 0.012, filAcross: 0.12, flow: 120, ridge: 2.2,
  dodge: 0.75, sparkDens: 0.09, sparkAmt: 0.12, filReach: 34, corner: 40,
  nodeSpeed: 0.28, nodeWidth: 90, nodeGain: 1.6, flicker: 0.14,
  exposure: 1.15, white: 0.7,
  scale: 1,
};

/* Tuned in /lab and locked. Thin core, long tip taper, and the core white
   pulled almost all the way out so the line stays --pulse green instead of
   blowing to white — which is what keeps it reading as the brand's green
   rather than as generic neon. */
export const HERO_SETTINGS: Settings = {
  core: 6.5, thick: 0.66, halo: 0.13, haloR: 21, taper: 0.27,
  filAlong: 0.016, filAcross: 0.12, flow: 135, ridge: 2.05,
  dodge: 0.71, sparkDens: 0.09, sparkAmt: 0.12, filReach: 34, corner: 40,
  nodeSpeed: 0.28, nodeWidth: 90, nodeGain: 1.6, flicker: 0.14,
  exposure: 1.25, white: 0.05,
  scale: 1,
};
