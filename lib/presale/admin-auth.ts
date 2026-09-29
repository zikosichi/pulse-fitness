import "server-only";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { pool } from "./db";
import { CheckoutError } from "./catalog";
import { hash, matchesSecret, origin } from "./security";

const cookieName = "pulse-admin";
const lifetime = 8 * 60 * 60;
export function verifyAdminCredentials(username: unknown, password: unknown) {
  const encoded = process.env.PRESALE_ADMIN_PASSWORD_HASH || "";
  const [salt, digest] = encoded.split(":");
  if (!/^[a-f0-9]{32}$/.test(salt || "") || !/^[a-f0-9]{128}$/.test(digest || "")) return false;
  if (typeof username !== "string" || typeof password !== "string" || password.length > 256) return false;
  const actual = scryptSync(password, salt, 64);
  const validPassword = timingSafeEqual(actual, Buffer.from(digest, "hex"));
  return validPassword && username === process.env.PRESALE_ADMIN_USERNAME;
}
export async function createAdminSession() {
  const value = randomBytes(32).toString("hex");
  await pool().query("DELETE FROM presale_admin_sessions WHERE expires_at <= now()");
  await pool().query("INSERT INTO presale_admin_sessions(token_hash,credential_version,expires_at) VALUES($1,$2,now()+interval '8 hours')", [hash(value), hash(process.env.PRESALE_ADMIN_PASSWORD_HASH || "")]);
  return value;
}
export async function validAdminSession(value?: string) {
  if (!value || !/^[a-f0-9]{64}$/.test(value) || !process.env.PRESALE_ADMIN_PASSWORD_HASH) return false;
  return (await pool().query("SELECT 1 FROM presale_admin_sessions WHERE token_hash=$1 AND credential_version=$2 AND expires_at>now()", [hash(value), hash(process.env.PRESALE_ADMIN_PASSWORD_HASH)])).rowCount === 1;
}
export async function revokeAdminSession(value?: string) {
  if (value) await pool().query("DELETE FROM presale_admin_sessions WHERE token_hash=$1", [hash(value)]);
}
export async function setAdminCookie(value: string) {
  (await cookies()).set(cookieName, value, { httpOnly: true, secure: origin().startsWith("https:"), sameSite: "strict", path: "/", maxAge: value ? lifetime : 0 });
}
export async function adminCookie() { return (await cookies()).get(cookieName)?.value; }
export async function authorizeAdmin(request: Request) {
  // Keep the server-only operations token available for CLI reconciliation.
  if (matchesSecret(request.headers.get("authorization"), process.env.PRESALE_ADMIN_TOKEN)) return;
  if (!await validAdminSession(await adminCookie())) throw new CheckoutError("forbidden", 401);
}
