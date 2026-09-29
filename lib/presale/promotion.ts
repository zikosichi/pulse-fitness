// Sunday 4 October is the final offer day, in Georgia (UTC+4).
export const PROMOTION_END = Date.parse("2026-10-05T00:00:00+04:00");
export const promotionActive = (now = Date.now()) => now < PROMOTION_END;
export const promotionDeadline = {
  ka: "მხოლოდ კვირის, 4 ოქტომბრის ჩათვლით",
  en: "Only through Sunday, 4 October",
};
export const promotionEnds = {
  ka: "4 ოქტომბრის ჩათვლით",
  en: "Ends Sun 4 Oct",
};
/* Whole days remaining, counted the way a person reads a calendar: on the
   final day it is "last day", not "0 days". */
export function promotionCountdown(now = Date.now()) {
  const days = Math.ceil((PROMOTION_END - now) / 86_400_000);
  if (days <= 1) return { ka: "ბოლო დღე", en: "Last day" };
  return { ka: `დარჩა ${days} დღე`, en: `${days} days left` };
}
