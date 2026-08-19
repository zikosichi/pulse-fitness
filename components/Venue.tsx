"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useLang } from "./LangProvider";
import { Arrow } from "./bits";
import { ui, venue } from "@/lib/content";

/* Active slide plus a peek at the one behind it. The peek is already on
   screen, so the caption below names the slide after that — otherwise it
   would be labelling something the visitor can already see. */

const PEEK = 260;
const GAP = 20;

export default function Venue() {
  const { t } = useLang();
  const [i, setI] = useState(0);
  const last = venue.slides.length - 1;
  const touchX = useRef<number | null>(null);

  const go = (n: number) => setI(Math.min(Math.max(n, 0), last));
  const trackOffset =
    i === last
      ? `calc(-${i * (PEEK + GAP)}px + max(0px, calc(100cqw - 1000px)))`
      : `-${i * (PEEK + GAP)}px`;

  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 48) go(i + (dx < 0 ? 1 : -1));
    touchX.current = null;
  };

  const upNext = venue.slides[(i + 2) % venue.slides.length];

  return (
    <section className="sec" id="venue">
      <div className="wrap">
        <div className="sec-head venue__head">
          <h2>{t(venue.title)}</h2>
          <p>{t(venue.lede)}</p>
        </div>

        <div
          className="venue__viewport"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") go(i + 1);
            if (e.key === "ArrowLeft") go(i - 1);
          }}
          tabIndex={0}
          role="group"
          aria-roledescription="carousel"
          aria-label={t(venue.title)}
        >
          <div
            className="venue__track"
            style={{ transform: `translateX(${trackOffset})` }}
          >
            {venue.slides.map((s, n) => {
              const on = n === i;
              const isNext = n === i + 1;
              const isVisiblePrevious = i === last && n === i - 1;
              return (
                <div
                  key={s.photo}
                  className={`slide${on ? " is-active" : ""}`}
                  aria-hidden={!on && !isNext && !isVisiblePrevious}
                >
                  <Image
                    src={s.photo}
                    alt={t(s.title)}
                    fill
                    sizes="(max-width: 600px) 100vw, 1000px"
                    quality={80}
                  />
                  <span className="slide__dim" aria-hidden="true" />
                  <span className="slide__scrim" aria-hidden="true" />

                  <span className="pill slide__tag">
                    <i aria-hidden="true" />
                    {t(ui.visualisation)}
                  </span>

                  <div className="slide__caption">
                    <span className="slide__index">
                      {String(n + 1).padStart(2, "0")} /{" "}
                      {String(venue.slides.length).padStart(2, "0")}
                    </span>
                    <span className="slide__title">{t(s.title)}</span>
                  </div>

                  {(isNext || isVisiblePrevious) && (
                    <button
                      type="button"
                      className="slide__navigate"
                      aria-label={`${t(isVisiblePrevious ? ui.prevSlide : ui.nextSlide)}: ${t(s.title)}`}
                      onClick={() => go(n)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="venue__controls">
          <div className="venue__dots">
            {venue.slides.map((s, n) => (
              <button
                key={s.photo}
                type="button"
                className={n === i ? "is-on" : undefined}
                aria-label={t(s.title)}
                aria-current={n === i}
                onClick={() => go(n)}
              />
            ))}
            <span className="venue__next">
              {t(upNext.title)} — {t(ui.upNext)}
            </span>
          </div>

          <div className="venue__arrows">
            <button
              type="button"
              aria-label={t(ui.prevSlide)}
              disabled={i === 0}
              onClick={() => go(i - 1)}
            >
              <Arrow back />
            </button>
            <button
              type="button"
              aria-label={t(ui.nextSlide)}
              disabled={i === last}
              onClick={() => go(i + 1)}
            >
              <Arrow />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
