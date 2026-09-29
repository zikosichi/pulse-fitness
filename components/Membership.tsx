"use client";

import { usePromotionTime } from "./PromotionProvider";
import {
  promotionActive,
  promotionCountdown,
  promotionEnds,
} from "@/lib/presale/promotion";
import { useLang } from "./LangProvider";
import { CallButton, Check } from "./bits";
import { LARI, membership, ui } from "@/lib/content";
import { getPackage, money } from "@/lib/presale/catalog";

/* Three plans plus everything else in plain rows. No tabs — someone
   scanning for a number should just find it. */
export default function Membership() {
  const { t, lang } = useLang();
  const now = usePromotionTime();
  const promo = promotionActive(now);

  return (
    <section className="sec sec--alt" id="membership">
      <div className="wrap plans">
        <div className="sec-head sec-head--center">
          <h2>{t(membership.title)}</h2>
          <p>{t(membership.lede)}</p>
        </div>

        <div className="plans__grid">
          {membership.plans.map((p) => {
            const offer = promo && p.id === "monthly";
            return (
            <article
              className={`plan${p.featured ? " plan--hi" : ""}`}
              key={p.name.en}
            >
              {p.featured && (
                <span className="plan__flag">{offer
                    ? t({ ka: "გახსნის შეთავაზება", en: "Opening offer" })
                    : t(membership.mostPopular)}</span>
              )}
              <span className="plan__kicker">{t(p.name)}</span>
              <p className="plan__price">
                <b>{money(getPackage(p.id, false, now)!.price)}</b>
                {offer && <s>{p.price}</s>}
                <span>{t(p.unit)}</span>
              </p>
              {offer && (
                <p className="plan__offer">
                  <span>
                    {t({
                      ka: "−20% პირველ თვეზე",
                      en: "−20% on your first month",
                    })}
                  </span>
                  <span>
                    {t(promotionEnds)} · <b>{t(promotionCountdown(now))}</b>
                  </span>
                </p>
              )}
              <p className="plan__blurb">{t(p.blurb)}</p>
              <span className="plan__rule" aria-hidden="true" />
              <ul className="plan__list">
                {p.features.map((f) => (
                  <li key={f.en}>
                    <Check />
                    {t(f)}
                  </li>
                ))}
              </ul>
              <span className="plan__spacer" />
              <CallButton
                size="lg"
                icon={false}
                variant={p.featured ? "pulse" : "outline"}
                label={
                  offer
                    ? { ka: "პირველი თვე 96 ₾-ად", en: "Get your first month for 96 ₾" }
                    : { ka: "შეიძინე", en: "Buy membership" }
                }
                href={`/presale?package=${p.id}&lang=${lang}`}
                className="btn--block"
              />
            </article>
            );
          })}
        </div>

        <div className="rates">
          <div>
            <h3>{t(ui.alsoAvailable)}</h3>
            <ul>
              {membership.also.map((r) => (
                <li key={r.label.en}>
                  <span>{t(r.label)}</span>
                  <b>
                    {r.price} {LARI}
                  </b>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3>{t(ui.withTrainer)}</h3>
            <ul>
              {membership.trainer.map((r) => (
                <li key={r.label.en}>
                  <span>{t(r.label)}</span>
                  <b>
                    {r.price} {LARI}
                  </b>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3>{t(ui.groupPricing)}</h3>
            <ul>
              {membership.group.map((r) => (
                <li key={r.label.en}>
                  <span>{t(r.label)}</span>
                  <b>
                    {r.price} / {r.withGym} {LARI}
                  </b>
                </li>
              ))}
            </ul>
            <p>{t(membership.groupNote)}</p>
          </div>
        </div>

        <p className="plans__fine">{t(membership.fine)}</p>
      </div>
    </section>
  );
}
