"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useLang } from "../LangProvider";
import {
  getPackages,
  getPackage,
  money,
  TERMS_VERSION,
} from "@/lib/presale/catalog";
import { usePromotionTime } from "../PromotionProvider";
import { promotionCountdown } from "@/lib/presale/promotion";
import Shell from "./Shell";
import styles from "./presale.module.css";
const errors: Record<string, { ka: string; en: string }> = {
  price: {
    ka: "შეთავაზების ვადა დასრულდა ან ფასი შეიცვალა. განაახლე გვერდი და გადაამოწმე ფასი გადახდამდე.",
    en: "The offer ended or the price changed. Refresh this page and review the price before paying.",
  },
  phone: {
    ka: "შეიყვანე სწორი მობილურის ნომერი ქვეყნის კოდით.",
    en: "Enter a valid mobile number, including country code.",
  },
  email: {
    ka: "შეიყვანე სწორი ელფოსტის მისამართი.",
    en: "Enter a valid email address.",
  },
  terms: {
    ka: "გასაგრძელებლად დაეთანხმე შეძენის პირობებს.",
    en: "Accept the purchase terms to continue.",
  },
  existing: {
    ka: "ამ ნომერზე პირველი თვის შეთავაზების შეკვეთა უკვე არსებობს. შეამოწმე წინა გადახდა ან დაგვიკავშირდი.",
    en: "A first-month offer order already exists for this number. Check your previous payment or contact us.",
  },
  rate: {
    ka: "ძალიან ბევრი მცდელობაა. ცოტა ხანში სცადე ხელახლა.",
    en: "Too many attempts. Please try again later.",
  },
  closed: {
    ka: "ონლაინ გადახდა ჯერ არ არის ხელმისაწვდომი. ამ ეტაპზე შეგიძლია გაეცნო აბონემენტებსა და ფასებს.",
    en: "Online payments are not available yet. You can browse memberships and prices below.",
  },
  conflict: {
    ka: "შეკვეთის მონაცემები შეიცვალა. ჯერ შეამოწმე წინა გადახდის სტატუსი.",
    en: "The order details changed. Check your previous payment before starting again.",
  },
  failed: {
    ka: "წინა გადახდა ვერ შესრულდა. შეგიძლია ახალი შეკვეთა დაიწყო.",
    en: "The previous payment failed. You can start a new order.",
  },
  unavailable: {
    ka: "გადახდის დაწყება ვერ დადასტურდა. შეამოწმე წინა შეკვეთა ან სცადე ხელახლა იგივე მონაცემებით.",
    en: "We couldn’t confirm checkout started. Check your previous order or retry with the same details.",
  },
  invalid: {
    ka: "გადაამოწმე შეყვანილი მონაცემები.",
    en: "Please check the details you entered.",
  },
};
export default function Checkout({
  initialPackage,
  enabled,
}: {
  initialPackage: string;
  enabled: boolean;
}) {
  const { t, lang } = useLang();
  const [selected, setSelected] = useState(
    getPackage(initialPackage)?.id || "monthly",
  );
  const now = usePromotionTime();
  const packages = getPackages(now);
  const pack = getPackage(selected, false, now)!;
  const offer = pack.regular > pack.price;
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [recent, setRecent] = useState<{ id: string; status: string } | null>(
    null,
  );
  const attempt = useRef<{ key: string; payload: string } | null>(null);
  const active =
    recent && ["initializing", "pending", "review"].includes(recent.status);
  async function refreshSession() {
    const res = await fetch("/api/presale/session", { method: "POST" });
    if (!res.ok) throw new Error("session");
    const data = await res.json();
    setRecent(data.recent || null);
    return data;
  }
  useEffect(() => {
    let cancelled = false;
    if (enabled)
      fetch("/api/presale/session", { method: "POST" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!cancelled && data) setRecent(data.recent || null);
        })
        .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [enabled]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !enabled || active) return;
    const form = new FormData(event.currentTarget);
    const payload = {
      packageId: selected,
      expectedAmount: pack.price,
      firstName: form.get("firstName"),
      lastName: form.get("lastName"),
      phone: form.get("phone"),
      email: form.get("email"),
      website: form.get("website"),
      accepted: form.get("accepted") === "on",
      termsVersion: TERMS_VERSION,
      lang,
    };
    const serialized = JSON.stringify(payload);
    if (!attempt.current || attempt.current.payload !== serialized)
      attempt.current = { key: crypto.randomUUID(), payload: serialized };
    setBusy(true);
    setError("");
    try {
      const session = await refreshSession();
      if (
        session.recent &&
        ["initializing", "pending", "review"].includes(session.recent.status)
      ) {
        setBusy(false);
        return;
      }
      const res = await fetch("/api/presale/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, requestKey: attempt.current.key }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "unavailable");
        await refreshSession();
        setBusy(false);
        return;
      }
      window.location.assign(data.redirect);
    } catch {
      setError("unavailable");
      await refreshSession().catch(() => {});
      setBusy(false);
    }
  }
  return (
    <Shell>
      <div className={styles.intro}>
        <h1>
          {t({ ka: "შენი პირველი ნაბიჯი", en: "Your first move" })}
          <span>{t({ ka: "Pulse-ში.", en: "starts at Pulse." })}</span>
        </h1>
        <p>
          {t({
            ka: "შეარჩიე აბონემენტი და შემოგვიერთდი გახსნისთანავე. მოქმედების ვადა პირველი ვიზიტიდან დაიწყება.",
            en: "Choose your membership and join us when we open. Your membership starts on your first visit.",
          })}
        </p>
      </div>
      {!enabled && (
        <div className={styles.notice} role="status">
          {t(errors.closed)}
        </div>
      )}
      {recent && (
        <div className={styles.notice}>
          {t({
            ka: "უკვე გაქვს შეკვეთა ამ ბრაუზერში.",
            en: "You already have an order in this browser.",
          })}{" "}
          <a href={`/presale/confirmation?order=${recent.id}&lang=${lang}`}>
            {t({ ka: "ნახე გადახდის სტატუსი →", en: "Check payment status →" })}
          </a>
        </div>
      )}
      <form onSubmit={submit} className={styles.checkout}>
        <div className={styles.formPanel}>
          <fieldset disabled={busy || Boolean(active)}>
            <legend>
              <span>01</span>
              {t({ ka: "აირჩიე აბონემენტი", en: "Choose your membership" })}
            </legend>
            <label className={styles.field}>
              {t({ ka: "აბონემენტი", en: "Membership" })}
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                name="packageId"
              >
                {packages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {t(p.name)} — {money(p.price)} ₾
                    {p.regular > p.price &&
                      t({
                        ka: " · −20% პირველ თვეზე",
                        en: " · 20% off first month",
                      })}
                  </option>
                ))}
              </select>
            </label>
            <p className={styles.hint}>
              {pack.note
                ? t(pack.note)
                : t({
                    ka: "სავარჯიშო დარბაზით სარგებლობა. ჯგუფური და პირადი ვარჯიშები ცალკე ფასადაა.",
                    en: "Gym floor access. Group classes and personal training are priced separately.",
                  })}
            </p>
          </fieldset>
          <fieldset disabled={busy || Boolean(active)}>
            <legend>
              <span>02</span>
              {t({ ka: "შენი მონაცემები", en: "Your details" })}
            </legend>
            <div className={styles.fields}>
              <label className={styles.field}>
                {t({ ka: "სახელი", en: "First name" })}
                <input
                  name="firstName"
                  autoComplete="given-name"
                  required
                  maxLength={80}
                />
              </label>
              <label className={styles.field}>
                {t({ ka: "გვარი", en: "Last name" })}
                <input
                  name="lastName"
                  autoComplete="family-name"
                  required
                  maxLength={80}
                />
              </label>
              <label className={styles.field}>
                {t({ ka: "მობილური", en: "Mobile number" })}
                <input
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+995 5XX XX XX XX"
                  required
                  maxLength={30}
                />
              </label>
              <label className={styles.field}>
                {t({ ka: "ელფოსტა", en: "Email address" })}
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                  maxLength={254}
                />
              </label>
            </div>
            <p className={styles.hint}>
              {t({
                ka: "მიუთითე იმ ადამიანის მონაცემები, ვინც აბონემენტით ისარგებლებს.",
                en: "Enter the details of the person who will use the membership.",
              })}
            </p>
            <label className={styles.trap} aria-hidden="true">
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </fieldset>
        </div>
        <aside
          className={styles.summary}
          aria-label={t({ ka: "შეკვეთის შეჯამება", en: "Order summary" })}
        >
          <h2>{t(pack.name)}</h2>
          <dl className={styles.totals}>
            <div>
              <dt>{t({ ka: "სტანდარტული ფასი", en: "Regular price" })}</dt>
              <dd>{money(pack.regular)} ₾</dd>
            </div>
            {offer && (
              <div className={styles.saving}>
                <dt>
                  <span className={styles.offerTag}>
                    <b>−20%</b>
                    {t(promotionCountdown(now))}
                  </span>
                  <span className={styles.srOnly}>
                    {t({ ka: "გახსნის ფასდაკლება", en: "Opening discount" })}
                  </span>
                </dt>
                <dd>−{money(pack.regular - pack.price)} ₾</dd>
              </div>
            )}
            <div className={styles.total}>
              <dt>{t({ ka: "ახლა გადასახდელი", en: "Pay today" })}</dt>
              <dd>
                {money(pack.price)}
                <small> ₾</small>
              </dd>
            </div>
          </dl>
          <ul className={styles.facts}>
            {offer && (
              <li>
                {t({
                  ka: "ფასდაკლება მხოლოდ პირველ თვეზეა, ერთხელ თითო წევრზე. მოქმედებს 4 ოქტომბრის 23:59-მდე, თბილისის დროით.",
                  en: "Discount covers your first month only, once per member. Ends 4 October, 23:59 Tbilisi time.",
                })}
              </li>
            )}
            <li>
              {t({
                ka: "აქტიურდება პირველი ვიზიტიდან, გახსნის შემდეგ.",
                en: "Starts on your first visit after opening.",
              })}
            </li>
            <li>
              {t({
                ka: "ბარათი 10 ₾ ან სამაჯური 20 ₾ — გადაიხდი ადგილზე.",
                en: "Access card ₾10 or wristband ₾20, paid at reception.",
              })}
            </li>
            <li>
              {t({
                ka: "ერთჯერადი გადახდა. ავტომატური განახლების გარეშე.",
                en: "One-time payment. No automatic renewal.",
              })}
            </li>
          </ul>
          <label className={styles.consent}>
            <input
              type="checkbox"
              name="accepted"
              required
              disabled={busy || Boolean(active)}
            />
            <span>
              {t({ ka: "ვეთანხმები", en: "I accept the" })}{" "}
              <a
                href={`/presale/terms?lang=${lang}`}
                target="_blank"
                rel="noopener"
              >
                {t({ ka: "შეძენის პირობებს", en: "purchase terms" })}
              </a>{" "}
              {t({ ka: "და გავეცანი", en: "and have read the" })}{" "}
              <a
                href={`/presale/privacy?lang=${lang}`}
                target="_blank"
                rel="noopener"
              >
                {t({
                  ka: "კონფიდენციალურობის ინფორმაციას",
                  en: "privacy notice",
                })}
              </a>
              .
            </span>
          </label>
          {error && (
            <p role="alert" className={styles.error}>
              {t(errors[error] || errors.unavailable)}
            </p>
          )}
          <button
            className={`btn btn--pulse btn--lg ${styles.pay}`}
            type="submit"
            disabled={busy || !enabled || Boolean(active)}
            aria-describedby={!enabled ? "payment-availability" : undefined}
          >
            {busy
              ? t({ ka: "გადახდაზე გადასვლა…", en: "Opening checkout…" })
              : `${t({ ka: "გადახდა", en: "Pay" })} ${money(pack.price)} ₾`}{" "}
            <span aria-hidden="true">↗</span>
          </button>
          {!enabled && (
            <p id="payment-availability" className={styles.availability}>
              {t({
                ka: "გადახდა ჯერ არ არის ხელმისაწვდომი.",
                en: "Payments are not available yet.",
              })}
            </p>
          )}
          <p className={styles.secure}>
            {t({
              ka: "უსაფრთხო გადახდა საქართველოს ბანკის გვერდზე",
              en: "Secure checkout on Bank of Georgia",
            })}
          </p>
        </aside>
      </form>
    </Shell>
  );
}
