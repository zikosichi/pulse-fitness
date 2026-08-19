/* The ECG line — taken from the logo, not redrawn.

   In `public/brand/pulse-fitness-logo.svg` the pulse line is a *filled
   outline* (one closed 12-point ribbon with sharp tips), not a stroked path,
   so there is no centreline to read off directly. The ribbon runs out along
   one edge and back along the other. Walking both edges tip-to-tip and
   averaging the vertices pairwise recovers the centreline exactly: at a
   symmetric miter join both offset vertices lie on the angle bisector,
   equidistant from the centreline vertex, so their midpoint *is* that vertex.

   Source path:
     M627.5 308.001L63 319.001L640.5 328.501L700.5 134V407L756 293.5V327.501
     L1238 319.001L770 308.001V224L715.5 342.501V35L627.5 308.001Z

   Verified by overlaying the result on the filled path — it tracks the middle
   and every vertex lands on a corner.

   Coordinates are in the logo's own viewBox units (1283 x 511). Everything
   downstream works in those units so the tunables stay resolution- and
   zoom-independent. */

export const LOGO_VIEWBOX = { w: 1283, h: 511 } as const;

export type Pt = readonly [number, number];

export const PULSE_PATH: readonly Pt[] = [
  [63, 319],        // left tip — tapers to nothing
  [634, 318.25],    // start of the rise
  [708, 84.5],      // the spike
  [708, 374.75],    // the plunge
  [763, 258.75],    // the rebound
  [763, 317.75],    // back to baseline
  [1238, 319],      // right tip — tapers to nothing
] as const;

/* Half-width of the drawn stroke along the flat sections. The corner pairs in
   the outline are miter joints, so their spread is larger; 12 is the real one
   and it is the natural default for the glow core. */
export const PULSE_HALF_WIDTH = 12;

/* Cumulative arc length at each vertex. The shader needs this to turn a
   nearest-point lookup into a position *along* the line, which is what lets
   sparks travel the ECG shape instead of sliding over it. */
export const PULSE_CUM: readonly number[] = (() => {
  const cum = [0];
  for (let i = 1; i < PULSE_PATH.length; i++) {
    const [ax, ay] = PULSE_PATH[i - 1];
    const [bx, by] = PULSE_PATH[i];
    cum.push(cum[i - 1] + Math.hypot(bx - ax, by - ay));
  }
  return cum;
})();

export const PULSE_LENGTH = PULSE_CUM[PULSE_CUM.length - 1];

export const PULSE_SEGMENTS = PULSE_PATH.length - 1;

/* Flat Float32Arrays, ready for uniform upload. */
export const PULSE_PTS_F32 = new Float32Array(PULSE_PATH.flatMap(([x, y]) => [x, y]));
export const PULSE_CUM_F32 = new Float32Array(PULSE_CUM);
