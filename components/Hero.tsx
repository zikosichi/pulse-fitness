"use client";

import LaunchOffer from "./LaunchOffer";
import Image from "next/image";
import { useLang } from "./LangProvider";
import HeroMark from "./HeroMark";
import { CallButton } from "./bits";
import { HOURS, hero, ui } from "@/lib/content";

/* The wordmark is the H1. It is a custom face and cannot be set as live
   text, so the alt carries the name for anything that cannot see it.
   HeroMark lights its pulse line with WebGL and falls back to the plain
   drawn logo — see that file for the conditions. */
export default function Hero() {
  const { t, lang } = useLang();

  return (
    <section className="hero" id="top">
      <div className="hero__plate">
        <div className="hero__stage">
          <Image
            src="/space/venue-hall.jpg"
            alt=""
            fill
            priority
            sizes="(min-width: 1800px) 1800px, 100vw"
            quality={82}
          />
          <span className="hero__vignette" />
        </div>
      </div>

      <div className="hero__inner">
        <span className="hero__bloom" aria-hidden="true" />

        <p className="pill">
          <i aria-hidden="true" />
          {t(ui.eyebrow)}
        </p>

        <h1>
          <HeroMark />
        </h1>

        <LaunchOffer />

        <p className="hero__sub">{t(hero.sub)}</p>

        <div className="hero__cta">
          <CallButton
            href={`/presale?lang=${lang}`}
            label={{ ka: "შეიძინე წინასწარ", en: "Join the presale" }}
          />
          <a className="btn btn--ghost" href="#classes">
            {t(ui.viewClasses)}
          </a>
        </div>
      </div>

      {/* Plain DOM, never dependent on a script: if everything else fails,
          the business card still works. */}
      <dl className="hero__readout">
        <div>
          <dt>{t(ui.open)}</dt>
          <dd className="num">{HOURS}</dd>
        </div>
        <span className="hero__rule" aria-hidden="true" />
        <div>
          <dt>{t(ui.address)}</dt>
          <dd>{t(ui.city)}</dd>
        </div>
        <span className="hero__rule" aria-hidden="true" />
        <div>
          <dt>{t(ui.training)}</dt>
          <dd className="accent">{t(ui.trainingModes)}</dd>
        </div>
      </dl>
    </section>
  );
}
