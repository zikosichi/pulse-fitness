/* The electric pulse line.

   Built from the same primitives as the Huly laser we took apart, generalised
   from a straight vertical beam to an arbitrary polyline:

     glow        brightness = radius / distance, the classic 1/d falloff
     filaments   ridged fbm sampled in PATH SPACE, then colour-dodged over the
                 glow so it is invisible in the dark and blows out where the
                 beam is already hot — that dodge is what makes it read as
                 crackling filaments rather than a plain gaussian blur
     life        a travelling node running left -> right along the line, plus a
                 40ms radius jitter (four frames of flicker does most of the
                 work)

   Path space is (distance along the line, signed distance across it). Sampling
   the noise there rather than in screen space is the whole trick for a bent
   line: filaments run parallel to the ECG and travel *around* the spike
   instead of sliding over it. */

export const MAX_PTS = 8;

export const VERT = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

export const FRAG = `#version 300 es
precision highp float;
out vec4 fragColor;

uniform vec2  uResolution;
uniform float uTime;
uniform vec2  uPan;          // px, top-left origin, where logo (0,0) lands
uniform float uZoom;         // px per logo unit

uniform vec2  uPts[${MAX_PTS}];
uniform float uCum[${MAX_PTS}];
uniform int   uSegs;
uniform float uLen;

uniform float uCore;         // core radius, logo units
uniform float uThick;        // 0..1, squares the falloff -> harder core
uniform float uHalo;         // broad bloom gain
uniform float uHaloR;        // broad bloom radius, logo units
uniform float uTaper;        // fraction of the length that fades at each tip

uniform float uFilAlong;     // filament frequency along the path
uniform float uFilAcross;    // filament frequency across the path
uniform float uFlow;         // drift speed along the path
uniform float uRidge;        // ridge sharpness
uniform float uDodge;        // 0 = multiply, 1 = colour dodge
uniform float uSparkDens;
uniform float uSparkAmt;
uniform float uFilReach;     // how far from the line filaments survive
uniform float uCorner;       // corner blend radius, logo units

uniform float uNodeSpeed;
uniform float uNodeWidth;
uniform float uNodeGain;
uniform float uFlicker;

uniform float uExposure;
uniform float uWhite;
uniform vec3  uPulse;
uniform vec3  uGlow;
uniform vec3  uBg;
uniform int   uDebug;        // 0 off · 1 distance · 2 arc length · 3 filaments
uniform int   uPremul;       // 1 = emit premultiplied light for additive compositing
uniform float uEdgeFade;     // logo units; fade the field out before the canvas edge (0 = off)

float hash11(float n) { return fract(sin(n * 78.233) * 43758.5453); }

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i),               hash21(i + vec2(1, 0)), f.x),
             mix(hash21(i + vec2(0, 1)),  hash21(i + vec2(1, 1)), f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * vnoise(p); p *= 2.03; a *= 0.5; }
  return v;
}

/* Nearest point on the polyline.
   x = exact distance, y = blended arc length, z = blended signed cross-track
   offset, w = plain clamped arc length.

   Distance is a hard min — the glow needs it exact. Arc length is *not*: it is
   a distance-weighted blend of every segment's UNCLAMPED projection. That
   matters because outside a sharp corner a whole wedge of pixels shares one
   nearest point, so any function of the clamped nearest point is constant
   across that wedge — which showed up as a dead cone beside the spike. The
   unclamped projections keep varying through the wedge, and weighting them by
   distance hands off smoothly from one segment to the next, so filaments flow
   around the corner instead of snapping at it.

   w carries the plain clamped arc length as well. Anything that is a property
   of position along the REAL line — the tip taper, the travelling node — has
   to use that one; fed the extrapolated coordinate it swings out of range in
   the far field and paints broad soft wedges across the background. */
vec4 pathField(vec2 p) {
  float bd = 1e20, bs = 0.0;
  float wsum = 0.0, ssum = 0.0, osum = 0.0;
  for (int i = 0; i < ${MAX_PTS - 1}; i++) {
    if (i >= uSegs) break;
    vec2 a = uPts[i], b = uPts[i + 1];
    vec2 pa = p - a, ba = b - a;
    float bb = max(dot(ba, ba), 1e-6);
    float t = dot(pa, ba) / bb;
    float h = clamp(t, 0.0, 1.0);
    float d = length(pa - ba * h);
    if (d < bd) {
      bd = d;
      bs = uCum[i] + h * sqrt(bb);
    }
    /* Extrapolate a little past each end to bridge the corner, but not
       indefinitely — an unbounded projection keeps its coherence out into the
       far field and draws a visible seam off the spike. */
    float te = clamp(t, -0.35, 1.35);
    float w = exp(-d / max(uCorner, 1.0));
    wsum += w;
    ssum += w * (uCum[i] + te * sqrt(bb));
    /* Signed offset from this segment's infinite line, blended the same way.
       Taking the sign from the nearest segment alone makes it flip hard where
       the nearest segment changes, and q.y jumps from +d to -d — a hard-edged
       wedge radiating out of the spike. A weighted average is smooth. */
    osum += w * (ba.x * pa.y - ba.y * pa.x) / sqrt(bb);
  }
  float iw = 1.0 / max(wsum, 1e-6);
  return vec4(bd, ssum * iw, osum * iw, bs);
}

void main() {
  vec2 frag = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);
  vec2 p = (frag - uPan) / uZoom;

  vec4 f = pathField(p);
  float d = f.x, s = f.y, off = f.z, sClamped = f.w;

  /* The drawn logo line tapers to nothing at both tips. Keep that — it is
     also what stops the glow ending in two hard stubs. */
  float edge = max(uTaper * uLen, 1e-3);
  float taper = smoothstep(0.0, edge, sClamped) * smoothstep(0.0, edge, uLen - sClamped);

  /* Travelling node, left -> right, matching the logo's lean.

     This reads the BLENDED arc length, not the clamped one. Outside a sharp
     corner a whole wedge of pixels shares a single nearest point, so the
     clamped value is constant across it — and since the node scales the glow
     radius, that entire wedge brightened and dimmed as one block with hard
     edges as the swell went past. It read as a cone of light firing off the
     spike. The blended coordinate keeps varying through the wedge, so the
     swell sweeps across the corner instead of switching it on. */
  float head = fract(uTime * uNodeSpeed) * uLen;
  float node = exp(-pow((s - head) / max(uNodeWidth, 1.0), 2.0));

  /* 40ms jitter. */
  float fl = hash11(floor(uTime * 25.0));
  float radius = uCore * taper
               * (1.0 + node * uNodeGain)
               * (1.0 + uFlicker * (fl - 0.5) * 2.0);

  float dd = max(d, 0.35);
  float core = radius / dd;
  core = mix(core, core * core, uThick);

  float halo = (uHaloR * taper) / dd;
  halo = halo * halo * uHalo;

  /* ---- electricity, in path space ---- */
  float sShift = uTime * uFlow;
  vec2 q = vec2(s - sShift, off);

  float fil = 1.0 - abs(fbm(vec2(q.x * uFilAlong, q.y * uFilAcross)) * 2.0 - 1.0);
  fil = pow(clamp(fil, 0.0, 1.0), uRidge);

  /* Filaments live in a band hugging the line. Without this the dodge below
     amplifies the far field — and because (arc length, offset) folds into a
     wedge on the outside of a sharp corner, that far field smears into
     concentric arcs around the spike. Confining the band keeps the fold small
     enough to read as sparks flaring off the corner, which is what we want. */
  float band = exp(-d / max(uFilReach, 1.0));
  fil *= band;

  vec2 sp = q * uSparkDens;
  vec2 cell = floor(sp);
  float h = hash21(cell);
  vec2 seed = vec2(hash21(cell + 11.3), hash21(cell + 27.7));
  float blink = 0.5 + 0.5 * sin(uTime * 6.0 + h * 6.2831853);
  float spark = smoothstep(0.34, 0.0, length(fract(sp) - seed))
              * step(1.0 - uSparkAmt, h) * blink * band;

  /* Colour dodge: dst / (1 - src). Filaments stay invisible in the dark and
     blow out where the core is already hot. */
  /* Cap the dodge by the band as well as absolutely. Unbounded, it amplifies
     the far field by up to 50x, which lights up both the noise floor and the
     seam where the corner blend hands from one segment to the next. Tying the
     ceiling to the band keeps the hard blow-out at the core and nothing at all
     out where the field is meaningless. */
  float dodged = min(core / max(1.0 - fil * 0.98, 0.02), core * (1.0 + 7.0 * band));
  float lit = mix(core * mix(1.0, fil, 0.85), dodged, uDodge);

  float I = lit + halo + spark * clamp(core, 0.0, 3.0) * 2.0;

  if (uDebug == 1) { fragColor = vec4(vec3(fract(d / 40.0)), 1.0); return; }
  if (uDebug == 2) { fragColor = vec4(vec3(fract(s / 120.0)), 1.0); return; }
  if (uDebug == 4) { fragColor = vec4(vec3(taper), 1.0); return; }
  if (uDebug == 3) { fragColor = vec4(vec3(fil), 1.0); return; }

  /* The faint outer bloom carries --glow; the body carries --pulse. Exposure
     tonemapping whitens the core on its own — green saturates first, then
     blue, then red — which is how a very bright green light actually reads. */
  vec3 tint = mix(uGlow, uPulse, smoothstep(0.0, 0.8, I));
  vec3 col = vec3(1.0) - exp(-tint * I * uExposure);
  col = mix(col, vec3(1.0), smoothstep(0.7, 2.5, I) * uWhite);

  /* The 1/d falloff decays too slowly for any practical canvas to contain it,
     so a box big enough to hide its own edge is not affordable. Instead take
     the field to zero just before the edge. Cheap, and it holds for any canvas
     size or fit mode. */
  if (uEdgeFade > 0.0) {
    vec2 lo = -uPan / uZoom;
    vec2 hi = (uResolution - uPan) / uZoom;
    vec2 a = smoothstep(vec2(0.0), vec2(uEdgeFade), p - lo);
    vec2 b = smoothstep(vec2(0.0), vec2(uEdgeFade), hi - p);
    col *= a.x * a.y * b.x * b.y;
  }

  col += uBg;
  col += (hash21(gl_FragCoord.xy + fract(uTime)) - 0.5) / 255.0;  /* deband */

  /* Composite as light rather than as an opaque plate. The hero's h1 is an
     isolated stacking context, so a CSS blend mode has no backdrop to reach
     and an opaque canvas would paint a black rectangle over the photograph.

     Alpha is the brightest channel, which keeps RGB <= A — valid premultiplied
     data. Do NOT be tempted back to alpha = 0 to get a purely additive result:
     RGB > A is undefined premultiplied input and implementations are free to
     clamp it to nothing, which is exactly what happened — the shader ran, the
     first frame reported, and the line was invisible on screen.

     "over" with this alpha gives col + dst * (1 - a): the core replaces what
     is behind it, and the faint halo is near-additive. */
  if (uPremul == 1) {
    vec3 c = clamp(col, 0.0, 1.0);
    fragColor = vec4(c, max(max(c.r, c.g), c.b));
  } else {
    fragColor = vec4(col, 1.0);
  }
}`;
