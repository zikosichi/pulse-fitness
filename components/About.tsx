"use client";

import Image from "next/image";
import { useLang } from "./LangProvider";
import { MARK, about } from "@/lib/content";

/* The town name used to be baked into the photograph, which meant it could
   not translate, could not be selected, and went soft whenever the card was
   drawn at anything other than its export size. It is live text now — the
   photograph underneath is only a photograph. */
export default function About() {
  const { t } = useLang();

  return (
    <section className="sec sec--alt" id="about">
      <div className="wrap about">
        <figure className="about__media">
          <Image
            src="/space/tskaltubo-city.jpg"
            alt=""
            width={1800}
            height={1013}
            sizes="(max-width: 980px) 100vw, 730px"
            quality={82}
          />
          <figcaption className="citycard__word">{t(about.place)}</figcaption>
        </figure>

        <div className="about__copy">
          <h2>{t(about.title)}</h2>
          {about.body.map((p) => (
            <p key={p.en}>{t(p)}</p>
          ))}
          <p className="about__promise">
            <b>{MARK}</b>
          </p>
        </div>
      </div>
    </section>
  );
}
