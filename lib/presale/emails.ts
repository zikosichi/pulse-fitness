import "server-only";
import { createHash, randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import { pool, transaction } from "./db";
import { paymentEmail, type EmailKind, type EmailOrder } from "./email-template";

const defaultStaff = "info@pulsefitness.ge,tevzadzedavit@gmail.com";
export function staffRecipients(value = process.env.PRESALE_EMAIL_STAFF_TO || defaultStaff) {
  const recipients = [...new Set(value.split(",").map(v => v.trim().toLowerCase()).filter(Boolean))];
  if (!recipients.length || recipients.length > 20 || recipients.some(v => !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(v)))
    throw new Error("Invalid staff email configuration");
  return recipients;
}
export function emailConfigured() {
  return Boolean(process.env.PRESALE_EMAIL_ENABLED === "true" && process.env.RESEND_API_KEY && process.env.PRESALE_EMAIL_FROM);
}
// Enqueue in the same transaction that first records verified payment.
export async function queuePaymentEmails(db: PoolClient, order: EmailOrder) {
  const destinations: { kind: EmailKind; recipient: string }[] = [
    { kind: "customer", recipient: order.email.toLowerCase() },
    ...staffRecipients().map(recipient => ({ kind: "staff" as const, recipient })),
  ];
  for (const { kind, recipient } of destinations) {
    const hash = createHash("sha256").update(recipient).digest("hex").slice(0, 24);
    await db.query(
      `INSERT INTO presale_emails(id,order_id,kind,recipient) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
      [`${order.id}-${kind}-${hash}`, order.id, kind, recipient],
    );
  }
}
type Payload = ReturnType<typeof paymentEmail> & { from: string; to: string[]; reply_to: string };
type Job = {
  id: string; order_id: string; kind: EmailKind; recipient: string;
  first_attempt_at: Date | null; payload: Payload | null;
};
async function claim(orderId?: string) {
  return transaction(async db => {
    const result = await db.query<Job>(
      `SELECT e.* FROM presale_emails e JOIN presale_orders o ON o.id=e.order_id
       WHERE o.status='paid' AND e.status IN ('pending','sending') AND e.next_attempt_at<=now()
       AND (e.lease_until IS NULL OR e.lease_until<now()) AND ($1::text IS NULL OR e.order_id=$1)
       ORDER BY e.created_at,e.id LIMIT 1 FOR UPDATE OF e SKIP LOCKED`, [orderId || null],
    );
    const job = result.rows[0];
    if (!job) return null;
    // Resend retains idempotency keys for 24h. Do not blindly resend old uncertain attempts.
    if (job.first_attempt_at && Date.now() - new Date(job.first_attempt_at).getTime() >= 23 * 3600000) {
      await db.query("UPDATE presale_emails SET status='review',last_error='retry_window_expired',lease_until=NULL WHERE id=$1", [job.id]);
      return { review: true as const };
    }
    const order = (await db.query("SELECT * FROM presale_orders WHERE id=$1", [job.order_id])).rows[0];
    const payload: Payload = job.payload || {
      from: process.env.PRESALE_EMAIL_FROM!, to: [job.recipient], reply_to: "info@pulsefitness.ge",
      ...paymentEmail(order, job.kind),
    };
    const lease = randomUUID();
    // Persist the exact payload and first-attempt time BEFORE the provider request.
    await db.query(`UPDATE presale_emails SET status='sending',payload=$2::jsonb,attempts=attempts+1,
      first_attempt_at=COALESCE(first_attempt_at,now()),lease_until=now()+interval '2 minutes',lease_token=$3 WHERE id=$1`,
      [job.id, JSON.stringify(payload), lease]);
    return { review: false as const, id: job.id, payload, lease };
  });
}
export async function sendPendingEmails(orderId?: string) {
  const report = { enabled: emailConfigured(), sent: 0, errors: 0, review: 0 };
  if (!report.enabled) return report;
  // Stay below route duration limits; remaining records persist for the next run.
  for (let i = 0; i < 10; i++) {
    const job = await claim(orderId);
    if (!job) break;
    if (job.review) { report.review++; continue; }
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": job.id },
        // JSONB can reorder keys: keep wire bytes identical across idempotent retries.
        body: JSON.stringify({
          from: job.payload.from, to: job.payload.to, reply_to: job.payload.reply_to,
          subject: job.payload.subject, text: job.payload.text, html: job.payload.html,
        }), signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) throw new Error("Email provider rejected request");
      const data = await res.json();
      if (typeof data.id !== "string" || !data.id || data.id.length > 200) throw new Error("Invalid email response");
      await pool().query(`UPDATE presale_emails SET status='sent',provider_id=$2,sent_at=now(),lease_until=NULL,last_error=NULL
        WHERE id=$1 AND lease_token=$3`, [job.id, data.id, job.lease]);
      report.sent++;
    } catch {
      // Do not log provider bodies, keys or customer data; keep uncertain sends retryable.
      await pool().query(`UPDATE presale_emails SET status='pending',next_attempt_at=now()+interval '5 minutes',
        lease_until=NULL,last_error='send_unconfirmed' WHERE id=$1 AND lease_token=$2`, [job.id, job.lease]);
      report.errors++;
    }
  }
  return report;
}
export async function safelySendPendingEmails(orderId: string) {
  try { await sendPendingEmails(orderId); }
  catch { console.error("Presale email processing failed"); }
}
