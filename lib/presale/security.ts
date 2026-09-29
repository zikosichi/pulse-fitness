import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { CheckoutError } from "./catalog";
import { pool } from "./db";
export const hash = (s: string) => createHash("sha256").update(s).digest("hex");
export function configured() {
  return Boolean(
    process.env.DATABASE_URL &&
    process.env.BOG_CLIENT_ID &&
    process.env.BOG_CLIENT_SECRET &&
    process.env.PRESALE_ORIGIN,
  );
}
export function origin() {
  const url = new URL(process.env.PRESALE_ORIGIN || "http://localhost:3000");
  if (process.env.VERCEL && url.protocol !== "https:")
    throw new Error("HTTPS origin required");
  return url.origin;
}
export function sameOrigin(request: Request) {
  if (request.headers.get("origin") !== origin())
    throw new CheckoutError("forbidden", 403);
}
export async function session(create = false) {
  const jar = await cookies();
  let value = jar.get("pulse-presale")?.value;
  if (!value || !/^[a-f0-9]{64}$/.test(value)) {
    if (!create) throw new CheckoutError("session", 401);
    value = randomBytes(32).toString("hex");
    jar.set("pulse-presale", value, {
      httpOnly: true,
      secure: origin().startsWith("https:"),
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return hash(value);
}
export async function limited(key: string, max: number, seconds: number) {
  const result = await pool().query(
    `INSERT INTO presale_rate_limits(key,hits,resets_at) VALUES($1,1,now()+$2*interval '1 second')
    ON CONFLICT(key) DO UPDATE SET hits=CASE WHEN presale_rate_limits.resets_at < now() THEN 1 ELSE presale_rate_limits.hits+1 END,
    resets_at=CASE WHEN presale_rate_limits.resets_at < now() THEN now()+$2*interval '1 second' ELSE presale_rate_limits.resets_at END RETURNING hits`,
    [key, seconds],
  );
  if (result.rows[0].hits > max) throw new CheckoutError("rate", 429);
}
export function matchesSecret(
  value: string | null,
  expected: string | undefined,
) {
  if (!expected || expected.length < 32 || !value) return false;
  const a = Buffer.from(value),
    b = Buffer.from(`Bearer ${expected}`);
  return a.length === b.length && timingSafeEqual(a, b);
}
export async function readJson(request: Request, max = 4096) {
  return JSON.parse(await readBody(request, max));
}
export async function readBody(request: Request, max: number) {
  if (Number(request.headers.get("content-length")) > max)
    throw new CheckoutError("invalid", 413);
  const reader = request.body?.getReader();
  if (!reader) throw new CheckoutError("invalid");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > max) {
      await reader.cancel();
      throw new CheckoutError("invalid", 413);
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}
export const noStore = {
  "Cache-Control": "no-store, private",
  "X-Robots-Tag": "noindex, nofollow",
  "Referrer-Policy": "no-referrer",
};
export function failure(error: unknown) {
  if (error instanceof CheckoutError)
    return Response.json(
      { error: error.code },
      { status: error.status, headers: noStore },
    );
  if (error instanceof SyntaxError)
    return Response.json(
      { error: "invalid" },
      { status: 400, headers: noStore },
    );
  // Never log bank payloads, credentials or customer data.
  console.error(
    "Presale operation failed",
    error instanceof Error ? error.name : "UnknownError",
  );
  return Response.json(
    { error: "unavailable" },
    { status: 503, headers: noStore },
  );
}
