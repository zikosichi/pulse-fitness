import "server-only";
import { verify } from "node:crypto";

// Bank's verification key, not the merchant's Public Key/client ID.
export const CALLBACK_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu4RUyAw3+CdkS3ZNILQh
zHI9Hemo+vKB9U2BSabppkKjzjjkf+0Sm76hSMiu/HFtYhqWOESryoCDJoqffY0Q
1VNt25aTxbj068QNUtnxQ7KQVLA+pG0smf+EBWlS1vBEAFbIas9d8c9b9sSEkTrr
TYQ90WIM8bGB6S/KLVoT1a7SnzabjoLc5Qf/SLDG5fu8dH8zckyeYKdRKSBJKvhx
tcBuHV4f7qsynQT+f2UYbESX/TLHwT5qFWZDHZ0YUOUIvb8n7JujVSGZO9/+ll/g
4ZIWhC1MlJgPObDwRkRd8NFOopgxMcMsDIZIoLbWKhHVq67hdbwpAq9K9WMmEhPn
PwIDAQAB
-----END PUBLIC KEY-----`;
export function validSignature(
  raw: string,
  signature: string | null,
  publicKey = CALLBACK_PUBLIC_KEY,
) {
  if (
    !signature ||
    signature.length > 1024 ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(signature)
  )
    return false;
  try {
    return verify(
      "RSA-SHA256",
      Buffer.from(raw),
      publicKey,
      Buffer.from(signature, "base64"),
    );
  } catch {
    return false;
  }
}
let cached: { value: string; until: number } | undefined;
async function token() {
  if (cached && Date.now() < cached.until) return cached.value;
  const id = process.env.BOG_CLIENT_ID,
    secret = process.env.BOG_CLIENT_SECRET;
  if (!id || !secret) throw new Error("Bank credentials missing");
  const res = await fetch(
    "https://oauth2.bog.ge/auth/realms/bog/protocol/openid-connect/token",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    },
  );
  if (!res.ok) throw new Error("Bank authentication failed");
  const data = await res.json();
  if (typeof data.access_token !== "string")
    throw new Error("Invalid bank token response");
  cached = {
    value: data.access_token,
    until:
      Date.now() +
      Math.max(0, Math.min(Number(data.expires_in) || 60, 300) - 30) * 1000,
  };
  return cached.value;
}
async function bank(path: string, init?: RequestInit) {
  const res = await fetch(`https://api.bog.ge/payments/v1/${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${await token()}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(12000),
  });
  if (res.status === 401) cached = undefined;
  if (!res.ok) throw new Error("Bank request failed");
  return res.json();
}
export type BankOrder = {
  id: string;
  request_key: string;
  origin: string;
  lang: "ka" | "en";
  amount: number;
  package_id: string;
  package_name: string;
};
export function orderPayload(order: BankOrder) {
  const back = `${order.origin}/presale/confirmation?order=${encodeURIComponent(order.id)}&lang=${order.lang}`;
  return {
    callback_url: `${order.origin}/api/presale/callback`,
    external_order_id: order.id,
    capture: "automatic",
    purchase_units: {
      currency: "GEL",
      total_amount: order.amount / 100,
      basket: [
        {
          product_id: order.package_id,
          description: order.package_name,
          quantity: 1,
          unit_price: order.amount / 100,
        },
      ],
    },
    redirect_urls: { success: back, fail: back },
    ttl: 15,
    payment_method: ["card"],
  };
}
export async function createBankOrder(order: BankOrder) {
  const data = await bank("ecommerce/orders", {
    method: "POST",
    headers: {
      "Idempotency-Key": order.request_key,
      "Accept-Language": order.lang,
      Theme: "dark",
    },
    body: JSON.stringify(orderPayload(order)),
  });
  const url = new URL(data?._links?.redirect?.href);
  if (
    url.protocol !== "https:" ||
    url.hostname !== "payment.bog.ge" ||
    url.username ||
    url.password ||
    typeof data.id !== "string" ||
    data.id.length > 100
  )
    throw new Error("Invalid bank order response");
  return { id: data.id as string, url: url.href };
}
export type Receipt = {
  order_id: string;
  external_order_id: string;
  order_status: { key: string };
  purchase_units: {
    currency_code: string;
    request_amount: string | number;
    transfer_amount: string | number;
  };
};
export async function receipt(id: string): Promise<Receipt> {
  return bank(`receipt/${encodeURIComponent(id)}`);
}
export function receiptState(
  data: Receipt,
  order: { id: string; bank_order_id: string | null; amount: number },
) {
  if (
    data.external_order_id !== order.id ||
    (order.bank_order_id && data.order_id !== order.bank_order_id) ||
    data.purchase_units?.currency_code !== "GEL" ||
    Math.round(Number(data.purchase_units.request_amount) * 100) !==
      order.amount
  )
    throw new Error("Payment identity/amount mismatch");
  const status = data.order_status?.key;
  if (status === "completed") {
    if (
      Math.round(Number(data.purchase_units.transfer_amount) * 100) !==
      order.amount
    )
      throw new Error("Payment total mismatch");
    return "paid";
  }
  if (status === "rejected") return "failed";
  if (status === "created" || status === "processing") return "pending";
  return "review";
}
