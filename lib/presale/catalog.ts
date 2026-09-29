import { promotionActive } from "./promotion";
import type { Bi } from "../content";

export const TERMS_VERSION = "2026-09-29";
export type PresalePackage = {
  id: string;
  name: Bi;
  price: number;
  regular: number;
  note?: Bi;
};
// Retained only for historical receipts and emails; never offered for new orders.
export const testPaymentPackage: PresalePackage = {
  id: "test-payment",
  name: { ka: "სატესტო გადახდა · 2 ₾", en: "Test payment · 2 GEL" },
  price: 200,
  regular: 200,
  note: {
    ka: "რეალური 2 ₾-ის სატესტო გადახდა. აბონემენტს არ ააქტიურებს.",
    en: "A real 2 GEL test payment. This does not activate a membership.",
  },
};
const basePackages: PresalePackage[] = [
  {
    id: "monthly",
    name: { ka: "ულიმიტო · 1 თვე", en: "Unlimited · 1 month" },
    price: 9600,
    regular: 12000,
  },
  {
    id: "day",
    name: { ka: "ერთჯერადი ვიზიტი", en: "Day pass" },
    price: 1500,
    regular: 1500,
  },
  {
    id: "week",
    name: { ka: "1 კვირა", en: "1 week" },
    price: 5000,
    regular: 5000,
  },
  {
    id: "fortnight",
    name: { ka: "2 კვირა", en: "2 weeks" },
    price: 8000,
    regular: 8000,
  },
  {
    id: "quarter",
    name: { ka: "3 თვე", en: "3 months" },
    price: 30000,
    regular: 30000,
  },
  {
    id: "half-year",
    name: { ka: "6 თვე", en: "6 months" },
    price: 55000,
    regular: 55000,
  },
  {
    id: "annual",
    name: { ka: "12 თვე", en: "12 months" },
    price: 100000,
    regular: 100000,
  },
  {
    id: "12-visits",
    name: { ka: "12 ვიზიტი · 1 თვე", en: "12 visits · 1 month" },
    price: 10000,
    regular: 10000,
  },
  {
    id: "student",
    name: {
      ka: "სტუდენტი / სკოლის მოსწავლე · 1 თვე",
      en: "Student / school pupil · 1 month",
    },
    price: 10000,
    regular: 10000,
    note: {
      ka: "პირველ ვიზიტზე წარმოადგინე სტუდენტის ან მოსწავლის სტატუსის დამადასტურებელი დოკუმენტი.",
      en: "Bring proof of student or school-pupil status on your first visit.",
    },
  },
];
export const getPackages = (now = Date.now()): PresalePackage[] =>
  basePackages.map(p => p.id === "monthly" && !promotionActive(now) ? { ...p, price: p.regular } : p);
export const getPackage = (id: string, allowTest = false, now = Date.now()) =>
  getPackages(now).find((p) => p.id === id) ||
  (allowTest && id === testPaymentPackage.id ? testPaymentPackage : undefined);
export const money = (tetri: number) =>
  new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(tetri / 100);

export class CheckoutError extends Error {
  constructor(
    public code: string,
    public status = 400,
  ) {
    super(code);
  }
}
export type Registration = {
  packageId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  lang: "ka" | "en";
  requestKey: string;
  termsVersion: string;
  expectedAmount: number;
};
export const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function normalizePhone(value: string) {
  let phone = value.replace(/[\s().-]/g, "");
  if (/^5\d{8}$/.test(phone)) phone = "+995" + phone;
  if (/^9955\d{8}$/.test(phone)) phone = "+" + phone;
  if (phone.startsWith("00")) phone = "+" + phone.slice(2);
  if (!/^\+[1-9]\d{7,14}$/.test(phone)) throw new CheckoutError("phone");
  return phone;
}
export function validateRegistration(raw: unknown): Registration {
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    throw new CheckoutError("invalid");
  const v = raw as Record<string, unknown>;
  const str = (key: string, max: number) => {
    if (typeof v[key] !== "string") throw new CheckoutError("invalid");
    const s = (v[key] as string).trim();
    if (!s || s.length > max || /[\x00-\x1f\x7f]/.test(s))
      throw new CheckoutError("invalid");
    return s;
  };
  const packageId = str("packageId", 30);
  if (!getPackage(packageId)) throw new CheckoutError("package");
  if (!Number.isSafeInteger(v.expectedAmount) || Number(v.expectedAmount) <= 0)
    throw new CheckoutError("price", 409);
  if (v.accepted !== true || v.termsVersion !== TERMS_VERSION)
    throw new CheckoutError("terms");
  if (v.website) throw new CheckoutError("invalid");
  const email = str("email", 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new CheckoutError("email");
  const requestKey = str("requestKey", 36);
  if (!UUID.test(requestKey)) throw new CheckoutError("invalid");
  return {
    packageId,
    expectedAmount: Number(v.expectedAmount),
    firstName: str("firstName", 80),
    lastName: str("lastName", 80),
    phone: normalizePhone(str("phone", 30)),
    email,
    requestKey,
    termsVersion: TERMS_VERSION,
    lang: v.lang === "en" ? "en" : "ka",
  };
}
