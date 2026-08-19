import { MARK } from "@/lib/content";

/* The official pulse keeps its exact aspect ratio. A separate full-width
   flatline runs underneath it, so only the arms stretch responsively and
   there can never be a visible join at the tapered ends. */
export default function Divider() {
  return (
    <div className="divider" aria-hidden="true">
      <span>{MARK}</span>
      <svg className="divider__line" viewBox="0 0 1440 160" preserveAspectRatio="none">
        <path
          d="M0 100H1440"
          fill="none"
          stroke="#3DC26C"
          strokeWidth="2.5"
          vectorEffect="non-scaling-stroke"
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
