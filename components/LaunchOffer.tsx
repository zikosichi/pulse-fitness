"use client";
import { useLang } from "./LangProvider";
import { usePromotionTime } from "./PromotionProvider";
import {
  promotionActive,
  promotionCountdown,
} from "@/lib/presale/promotion";

/* The opening offer as a glass ticket under the wordmark — same material as
   the nav pill, so it reads as part of the hero rather than an ad on top of
   it. The whole ticket is the link. */
export default function LaunchOffer() {
  const { t, lang } = useLang();
  const now = usePromotionTime();
  if (!promotionActive(now)) return null;
  return (
    <a
      className="offer-ticket"
      href={`/presale?package=monthly&lang=${lang}`}
    >
      <span className="offer-ticket__cut">−20%</span>
      <span className="offer-ticket__deal">
        {t({ ka: "პირველი თვე", en: "First month" })}{" "}
        <b>96 ₾</b> <s>120 ₾</s>
      </span>
      <span className="offer-ticket__time">
        <i aria-hidden="true" />
        {t(promotionCountdown(now))}
      </span>
      <svg className="offer-ticket__go" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M6 3.5 10.5 8 6 12.5" />
      </svg>
    </a>
  );
}
