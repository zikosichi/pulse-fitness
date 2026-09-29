import "server-only";
import { pool } from "./db";
import { CheckoutError } from "./catalog";

export async function listPurchases(url: URL) {
  const q = (url.searchParams.get("q") || "").trim();
  const status = url.searchParams.get("status") || "all";
  const kind = url.searchParams.get("kind") || "all";
  const before = url.searchParams.get("before");
  const csv = url.searchParams.get("format") === "csv";
  if (q.length > 120 || !["all", "paid", "pending", "initializing", "failed", "review"].includes(status) || !["all", "membership", "test"].includes(kind) || (before && !/^PF-[A-F0-9]{20}$/.test(before))) throw new CheckoutError("invalid");
  const filter = `($1='' OR strpos(lower(concat_ws(' ',o.id,o.first_name,o.last_name,o.phone,o.email,o.package_name,o.bank_order_id)),lower($1))>0)
    AND ($2='all' OR o.status=$2)
    AND ($3='all' OR ($3='test' AND o.package_id='test-payment') OR ($3='membership' AND o.package_id<>'test-payment'))`;
  const rows = (await pool().query(`SELECT o.id,o.status,o.bank_status,o.package_id,o.package_name,o.first_name,o.last_name,o.phone,o.email,o.amount/100.0 AS amount_gel,o.currency,o.created_at,o.paid_at,o.bank_order_id,o.terms_version,
    (SELECT json_agg(json_build_object('kind',e.kind,'recipient',e.recipient,'status',e.status) ORDER BY e.kind,e.recipient) FROM presale_emails e WHERE e.order_id=o.id) AS emails
    FROM presale_orders o WHERE ${filter}
    AND ($4::text IS NULL OR (o.created_at,o.id)<(SELECT created_at,id FROM presale_orders WHERE id=$4))
    ORDER BY o.created_at DESC,o.id DESC LIMIT $5`, [q, status, kind, csv ? null : before, csv ? 10001 : 101])).rows;
  if (csv) {
    if (rows.length > 10000) throw new CheckoutError("export_limit", 400);
    return { rows, next: null, summary: null };
  }
  const summary = (await pool().query(`SELECT count(*)::int AS orders,
    count(*) FILTER (WHERE o.status='paid')::int AS paid,
    count(*) FILTER (WHERE o.status IN ('initializing','pending'))::int AS pending,
    count(*) FILTER (WHERE o.status='review')::int AS review,
    COALESCE(sum(o.amount) FILTER (WHERE o.status='paid' AND o.package_id<>'test-payment'),0)/100.0 AS paid_gel,
    COALESCE(sum(o.amount) FILTER (WHERE o.status='paid' AND o.package_id='test-payment'),0)/100.0 AS test_paid_gel
    FROM presale_orders o WHERE ${filter}`, [q, status, kind])).rows[0];
  return { rows: rows.slice(0,100), next: rows.length > 100 ? rows[99].id : null, summary };
}
