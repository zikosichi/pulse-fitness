"use client";

import { Fragment } from "react";
import { useLang } from "./LangProvider";
import { offer } from "@/lib/content";

/* A numbered list rather than a row of cards — information living directly
   on the ground, with the numerals doing the structural work. */
export default function Offer() {
  const { t } = useLang();

  return (
    <section className="sec offer" id="offer">
      <div className="wrap">
        <h2>{t(offer.title)}</h2>

        <div className="offer__grid">
          {offer.items.map((item, n) => (
            <Fragment key={item.title.en}>
              {n === 2 && <span className="offer__rule" aria-hidden="true" />}
              <div className={`offer__item${item.mark ? " offer__item--mark" : ""}`}>
                <span className="offer__num" aria-hidden="true">
                  {String(n + 1).padStart(2, "0")}
                </span>
                <div className="offer__body">
                  <h3>{t(item.title)}</h3>
                  <p>{t(item.body)}</p>
                  {item.hours && <span className="offer__hours">{item.hours}</span>}
                </div>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
