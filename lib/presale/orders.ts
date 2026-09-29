import "server-only";
import { promotionActive } from "./promotion";
import { randomBytes } from "node:crypto";
import { CheckoutError, getPackage, type Registration } from "./catalog";
import { pool, transaction } from "./db";
import { createBankOrder, receipt, receiptState, type BankOrder } from "./bog";
import { hash, origin } from "./security";
import { queuePaymentEmails, sendPendingEmails } from "./emails";

export type Order = BankOrder & {
  session_hash: string;
  fingerprint: string;
  status: string;
  bank_order_id: string | null;
  checkout_url: string | null;
  regular_amount: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  created_at: Date;
  checked_at: Date | null;
  paid_at: Date | null;
};
export async function findOrder(
  id: string,
  sessionHash?: string,
): Promise<Order | undefined> {
  const res = await pool().query(
    `SELECT * FROM presale_orders WHERE id=$1${sessionHash ? " AND session_hash=$2" : ""}`,
    sessionHash ? [id, sessionHash] : [id],
  );
  return res.rows[0];
}
export async function register(
  input: Registration,
  sessionHash: string,
): Promise<Order> {
  const pack = getPackage(input.packageId);
  if (!pack) throw new CheckoutError("package");
  const fingerprint = hash(JSON.stringify(input));
  const existing = await pool().query(
    "SELECT * FROM presale_orders WHERE request_key=$1",
    [input.requestKey],
  );
  if (existing.rows[0])
    return reuse(existing.rows[0], sessionHash, fingerprint);
  if (input.expectedAmount !== pack.price) throw new CheckoutError("price", 409);
  const id = `PF-${randomBytes(10).toString("hex").toUpperCase()}`;
  try {
    const res = await pool().query(
      `INSERT INTO presale_orders (id,request_key,session_hash,fingerprint,package_id,package_name,amount,regular_amount,first_name,last_name,phone,email,lang,terms_version,origin)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [
        id,
        input.requestKey,
        sessionHash,
        fingerprint,
        pack.id,
        pack.name[input.lang],
        pack.price,
        pack.regular,
        input.firstName,
        input.lastName,
        input.phone,
        input.email,
        input.lang,
        input.termsVersion,
        origin(),
      ],
    );
    return res.rows[0];
  } catch (error) {
    if ((error as { code?: string }).code !== "23505") throw error;
    const retry = await pool().query(
      "SELECT * FROM presale_orders WHERE request_key=$1",
      [input.requestKey],
    );
    if (retry.rows[0]) return reuse(retry.rows[0], sessionHash, fingerprint);
    throw new CheckoutError("existing", 409);
  }
}
function reuse(row: Order, sessionHash: string, fingerprint: string) {
  if (row.session_hash !== sessionHash || row.fingerprint !== fingerprint)
    throw new CheckoutError("conflict", 409);
  return row;
}
export async function checkout(order: Order): Promise<Order> {
  if (order.bank_order_id || order.status !== "initializing") return order;
  if (order.amount < order.regular_amount && !promotionActive()) throw new CheckoutError("price", 409);
  // Retries always reconstruct the SAME payload with the SAME persisted UUID.
  // A timeout stays uncertain rather than allowing a second discounted order.
  const bank = await createBankOrder(order);
  const result = await pool().query(
    `UPDATE presale_orders SET bank_order_id=$2,checkout_url=$3,
    status=CASE WHEN status='initializing' THEN 'pending' ELSE status END,updated_at=now()
    WHERE id=$1 AND (bank_order_id IS NULL OR bank_order_id=$2) RETURNING *`,
    [order.id, bank.id, bank.url],
  );
  if (!result.rows[0]) throw new Error("Bank order conflict");
  return result.rows[0];
}
export async function reconcile(
  id: string,
  bankId?: string,
  force = false,
): Promise<Order> {
  return transaction(async (db) => {
    const result = await db.query(
      "SELECT * FROM presale_orders WHERE id=$1 FOR UPDATE",
      [id],
    );
    const order: Order | undefined = result.rows[0];
    if (!order) throw new CheckoutError("not_found", 404);
    if (bankId && order.bank_order_id && bankId !== order.bank_order_id)
      throw new Error("Bank order mismatch");
    const target = order.bank_order_id || bankId;
    if (!target) return order;
    // Serialize fresh receipt reads with writes so delayed callbacks cannot roll back payment state.
    if (
      !force &&
      order.checked_at &&
      Date.now() - new Date(order.checked_at).getTime() < 10000
    )
      return order;
    const details = await receipt(target);
    const state = receiptState(details, { ...order, bank_order_id: target });
    // A previously paid order never becomes eligible for a second first-month discount.
    const status =
      order.paid_at && (state === "failed" || state === "pending")
        ? "review"
        : state;
    const updated = await db.query(
      `UPDATE presale_orders SET bank_order_id=$2,status=$3,bank_status=$4,
      paid_at=CASE WHEN $3='paid' THEN COALESCE(paid_at,now()) ELSE paid_at END,
      checked_at=now(),updated_at=now() WHERE id=$1 RETURNING *`,
      [id, target, status, details.order_status.key],
    );
    const confirmed: Order = updated.rows[0];
    if (status === "paid" && !order.paid_at && confirmed.paid_at)
      await queuePaymentEmails(db, { ...confirmed, paid_at: confirmed.paid_at });
    return confirmed;
  });
}
export function publicOrder(order: Order) {
  return {
    id: order.id,
    packageId: order.package_id,
    amount: order.amount,
    status: order.status,
    createdAt: order.created_at,
    paidAt: order.paid_at,
  };
}
export async function reconcilePending() {
  const res = await pool().query(
    `SELECT * FROM presale_orders WHERE status IN ('initializing','pending') AND (checked_at IS NULL OR checked_at < now()-interval '1 minute') ORDER BY checked_at ASC NULLS FIRST,created_at LIMIT 20`,
  );
  let checked = 0,
    errors = 0;
  for (const row of res.rows) {
    try {
      const order = await checkout(row);
      await reconcile(order.id, undefined, true);
      checked++;
    } catch {
      errors++;
      await pool().query(
        "UPDATE presale_orders SET checked_at=now() WHERE id=$1",
        [row.id],
      );
    }
  }
  await pool().query(
    "DELETE FROM presale_rate_limits WHERE resets_at < now()-interval '1 day'",
  );
  let emails;
  try {
    emails = await sendPendingEmails();
  } catch {
    emails = { enabled: false, sent: 0, errors: 1, review: 0 };
  }
  return { checked, errors, emails };
}
