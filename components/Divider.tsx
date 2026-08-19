import { MARK } from "@/lib/content";

/* The official pulse keeps its exact aspect ratio. A separate full-width
   baseline runs underneath it, tapering to a point at both viewport edges;
   this stretches only the arms and leaves no visible join around the mark. */
export default function Divider() {
  return (
    <div className="divider" aria-hidden="true">
      <span>{MARK}</span>
      <svg className="divider__line" viewBox="0 0 1440 160" preserveAspectRatio="none">
        <defs>
          <linearGradient
            id="divider-edge-feather"
            x1="0"
            y1="0"
            x2="1440"
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#3DC26C" stopOpacity="0" />
            <stop offset="0.04" stopColor="#3DC26C" stopOpacity="0.45" />
            <stop offset="0.09" stopColor="#3DC26C" stopOpacity="0.86" />
            <stop offset="0.125" stopColor="#3DC26C" />
            <stop offset="0.875" stopColor="#3DC26C" />
            <stop offset="0.91" stopColor="#3DC26C" stopOpacity="0.86" />
            <stop offset="0.96" stopColor="#3DC26C" stopOpacity="0.45" />
            <stop offset="1" stopColor="#3DC26C" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0 100L180 98.75H1260L1440 100L1260 101.25H180Z"
          fill="url(#divider-edge-feather)"
          shapeRendering="geometricPrecision"
        />
      </svg>
      <svg className="divider__pulse" viewBox="0 0 1283 511">
        <rect x="620" y="0" width="160" height="511" fill="var(--ink)" />
        <path
          className="divider__pulse-mark"
          d="M627.5 308.001L63 319.001L640.5 328.501L700.5 134V407L756 293.5V327.501L1238 319.001L770 308.001V224L715.5 342.501V35L627.5 308.001Z"
          fill="#3DC26C"
        />
      </svg>
    </div>
  );
}
