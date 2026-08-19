"use client";

import { Fragment, type ReactNode } from "react";
import { useLang } from "./LangProvider";
import { ribbons } from "@/lib/content";

/* Two bands crossing between pricing and contact. Each run is rendered
   twice and the keyframe travels -50%, so the loop is seamless. The dark
   band is second in the DOM because it passes in front at the crossing. */

/* Each set carries its own trailing gap, so two of them butt together
   exactly and a -50% travel lands seamlessly. A set has to be at least as
   wide as the band or a hole opens up at the end of the loop, which is why
   the phrase lists repeat far more than a 1440 frame needs. */
function Run({ children }: { children: ReactNode }) {
  return (
    <div className="band__run">
      <div className="band__set">{children}</div>
      <div className="band__set">{children}</div>
    </div>
  );
}

const GREEN_REPEATS = 8;
const MID_REPEATS = 5;

export default function Ribbons() {
  const { t } = useLang();

  const green = Array.from({ length: GREEN_REPEATS }, (_, n) =>
    ribbons.green.map((item, index) => (
      <Fragment key={`${n}-${index}`}>
        <em className={item.latin ? "lat" : undefined}>{t(item.text)}</em>
        <i />
      </Fragment>
    )),
  );

  const mid = Array.from({ length: MID_REPEATS }, (_, n) =>
    ribbons.mid.map((v) => (
      <Fragment key={`${n}-${v.en}`}>
        <em>{t(v)}</em>
        <i />
      </Fragment>
    )),
  );

  return (
    <div className="ribbons" aria-hidden="true">
      <div className="band band--green">
        <Run>{green}</Run>
      </div>
      <div className="band band--mid">
        <Run>{mid}</Run>
      </div>
    </div>
  );
}
