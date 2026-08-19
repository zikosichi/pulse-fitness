"use client";

import Image from "next/image";
import { useLang } from "./LangProvider";
import { classes, groupMeta, membership, ui } from "@/lib/content";

export default function Classes() {
  const { t } = useLang();

  return (
    <section className="sec" id="classes">
      <div className="wrap">
        <div className="sec-head sec-head--wide classes__head">
          <h2>{t(groupMeta.title)}</h2>
          <p>{t(groupMeta.lede)}</p>
        </div>

        <div className="tiles">
          {classes.map((c, n) => (
            <article className="tile" key={c.name.en}>
              <div className="tile__media">
                <Image
                  src={c.photo}
                  alt={t(c.name)}
                  width={900}
                  height={600}
                  sizes="(max-width: 720px) 100vw, (max-width: 1180px) 50vw, 410px"
                  quality={80}
                />
                {c.who && <span className="tile__who">{t(c.who)}</span>}
              </div>
              <div className="tile__row">
                <span className="tile__num" aria-hidden="true">
                  {String(n + 1).padStart(2, "0")}
                </span>
                <div className="tile__body">
                  <h3>{t(c.name)}</h3>
                  <p>{t(c.body)}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="classes__foot">
          <p>{t(membership.groupNote)}</p>
          <a href="#membership">{t(ui.seePrices)}</a>
        </div>
      </div>
    </section>
  );
}
