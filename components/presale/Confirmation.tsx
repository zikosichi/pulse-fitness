"use client";
import { useEffect, useState } from "react";
import { useLang } from "../LangProvider";
import { getPackage, money, testPaymentPackage } from "@/lib/presale/catalog";
import Shell from "./Shell";
import styles from "./presale.module.css";
type Result = { id: string; packageId: string; amount: number; status: string };
export default function Confirmation({ id }: { id: string }) {
  const { t, lang } = useLang();
  const [order, setOrder] = useState<Result | null>(null),
    [error, setError] = useState(false),
    [busy, setBusy] = useState(false),
    [tick, setTick] = useState(0);
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    let count = 0;
    async function check() {
      try {
        const res = await fetch(
          `/api/presale/status?order=${encodeURIComponent(id)}`,
          { cache: "no-store" },
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (cancelled) return;
        setOrder(data);
        setError(false);
        if (["pending", "initializing"].includes(data.status) && ++count < 18)
          timer = setTimeout(check, 5000);
      } catch {
        if (!cancelled) setError(true);
      }
    }
    check();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [id, tick]);
  async function resume() {
    setBusy(true);
    try {
      const res = await fetch("/api/presale/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error();
      window.location.assign(data.redirect);
    } catch {
      setError(true);
      setTick((v) => v + 1);
      setBusy(false);
    }
  }
  const paid = order?.status === "paid",
    failed = order?.status === "failed",
    review = order?.status === "review";
  const isTest = order?.packageId === testPaymentPackage.id;
  const heading = paid && isTest
    ? { ka: "სატესტო გადახდა დადასტურებულია.", en: "Test payment confirmed." }
    : paid
    ? { ka: "შენ უკვე Pulse-ის ნაწილი ხარ.", en: "You’re part of Pulse." }
    : failed
      ? { ka: "გადახდა ვერ შესრულდა.", en: "Payment wasn’t completed." }
      : review
        ? { ka: "გადახდა გადასამოწმებელია.", en: "Your payment needs a check." }
        : { ka: "ვამოწმებთ გადახდას…", en: "Checking your payment…" };
  return (
    <Shell>
      <section className={styles.confirmation} aria-live="polite">
        <div
          className={`${styles.statusIcon} ${paid ? styles.paid : ""}`}
          aria-hidden="true"
        >
          {paid ? "✓" : failed ? "×" : "⋯"}
        </div>
        <h1>
          {error && !order
            ? t({
                ka: "სტატუსის ნახვა ვერ მოხერხდა.",
                en: "We couldn’t load your payment.",
              })
            : t(heading)}
        </h1>
        <p>
          {paid && isTest
            ? t(testPaymentPackage.note!)
            : paid
            ? t({
                ka: "მადლობა! აბონემენტი გახსნის შემდეგ, პირველი ვიზიტიდან გააქტიურდება. შეინახე შეკვეთის ნომერი და აჩვენე ადმინისტრატორს.",
                en: "Thank you! Your membership starts on your first visit after opening. Save your reference and show it at reception.",
              })
            : failed
              ? t({
                  ka: "ეს შეკვეთა არ დადასტურებულა. შეგიძლია თავიდან სცადო.",
                  en: "This order hasn’t been confirmed. You can try again.",
                })
              : t({
                  ka: "ახალ გადახდას ნუ დაიწყებ, სანამ ამ შეკვეთის სტატუსს არ გადაამოწმებ. დახმარებისთვის დაგვიკავშირდი და მიუთითე შეკვეთის ნომერი.",
                  en: "Check this order before making another payment. If you need help, contact us with your reference.",
                })}
        </p>
        <dl className={styles.receipt}>
          <div>
            <dt>{t({ ka: "შეკვეთის ნომერი", en: "Your reference" })}</dt>
            <dd>{id || "—"}</dd>
          </div>
          {order && (
            <>
              <div>
                <dt>{t({ ka: "აბონემენტი", en: "Membership" })}</dt>
                <dd>
                  {t(
                    getPackage(order.packageId, true)?.name || {
                      ka: order.packageId,
                      en: order.packageId,
                    },
                  )}
                </dd>
              </div>
              <div>
                <dt>
                  {paid
                    ? t({ ka: "გადახდილია", en: "Paid" })
                    : t({ ka: "თანხა", en: "Amount" })}
                </dt>
                <dd>{money(order.amount)} ₾</dd>
              </div>
            </>
          )}
        </dl>
        {error && (
          <p className={styles.error} role="alert">
            {t({
              ka: "თუ სხვა ბრაუზერში ხარ, გახსენი ეს გვერდი იმ ბრაუზერში, სადაც გადახდა დაიწყე, ან დაგვიკავშირდი.",
              en: "Use the same browser where you started checkout, or contact us for help.",
            })}
          </p>
        )}
        <div className={styles.actions}>
          {paid ? (
            <button className="btn btn--outline" onClick={() => window.print()}>
              {t({
                ka: "დადასტურების შენახვა / ბეჭდვა",
                en: "Save / print confirmation",
              })}
            </button>
          ) : (
            <button
              className="btn btn--outline"
              onClick={() => setTick((v) => v + 1)}
            >
              {t({ ka: "სტატუსის განახლება", en: "Refresh status" })}
            </button>
          )}
          {order && ["pending", "initializing"].includes(order.status) && (
            <button disabled={busy} className="btn btn--pulse" onClick={resume}>
              {busy
                ? "…"
                : t({ ka: "გადახდის გაგრძელება", en: "Continue payment" })}
            </button>
          )}
          {failed && (
            <a
              className="btn btn--pulse"
              href={`/presale?package=${order?.packageId}&lang=${lang}`}
            >
              {t({ ka: "თავიდან ცდა", en: "Try again" })}
            </a>
          )}
          <a href={`/?lang=${lang}`}>
            {t({ ka: "მთავარ გვერდზე დაბრუნება", en: "Back to the gym" })}
          </a>
        </div>
      </section>
    </Shell>
  );
}
