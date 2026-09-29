import test from "node:test";
import assert from "node:assert/strict";
import { randomBytes, randomUUID, scryptSync } from "node:crypto";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import type { Pool } from "pg";
import { createAdminSession, revokeAdminSession, validAdminSession, verifyAdminCredentials } from "../lib/presale/admin-auth";
import { listPurchases } from "../lib/presale/admin-data";
import { hash } from "../lib/presale/security";

test("admin credentials, expiring/revocable sessions and purchase filters", async () => {
  const pg = await PGlite.create();
  const globals = globalThis as unknown as { presalePool?: Pool };
  const saved = { username: process.env.PRESALE_ADMIN_USERNAME, hash: process.env.PRESALE_ADMIN_PASSWORD_HASH };
  process.env.DATABASE_URL = "test-only";
  const salt = randomBytes(16).toString("hex");
  process.env.PRESALE_ADMIN_USERNAME = "admin";
  process.env.PRESALE_ADMIN_PASSWORD_HASH = `${salt}:${scryptSync("test-only-password", salt, 64).toString("hex")}`;
  globals.presalePool = { query: async (sql: string, params?: unknown[]) => { const result = await pg.query(sql, params); return { ...result, rowCount: result.rows.length }; } } as unknown as Pool;
  try {
    await pg.exec(await readFile(new URL("../db/presale.sql", import.meta.url), "utf8"));
    assert.equal(verifyAdminCredentials("admin", "test-only-password"), true);
    assert.equal(verifyAdminCredentials("other", "test-only-password"), false);
    assert.equal(verifyAdminCredentials("admin", "wrong"), false);
    assert.equal(verifyAdminCredentials(null, null), false);
    assert.equal(await validAdminSession("forged"), false);
    const session = await createAdminSession();
    assert.equal(await validAdminSession(session), true);
    const stored = (await pg.query<{ token_hash: string }>("SELECT token_hash FROM presale_admin_sessions")).rows[0];
    assert.equal(stored.token_hash, hash(session)); assert.notEqual(stored.token_hash, session);
    await revokeAdminSession(session); assert.equal(await validAdminSession(session), false);
    const expired = await createAdminSession();
    await pg.query("UPDATE presale_admin_sessions SET expires_at=now()-interval '1 second'");
    assert.equal(await validAdminSession(expired), false);
    const rotated = await createAdminSession();
    process.env.PRESALE_ADMIN_PASSWORD_HASH += "changed";
    assert.equal(await validAdminSession(rotated), false);
    assert.equal(verifyAdminCredentials("admin", "test-only-password"), false);
    for (let i = 0; i < 103; i++) {
      await pg.query(`INSERT INTO presale_orders(id,request_key,session_hash,fingerprint,package_id,package_name,amount,regular_amount,first_name,last_name,phone,email,lang,terms_version,origin,status,created_at)
        VALUES($1,$2,'session','fingerprint',$3,$3,$4,$4,'Buyer',$5,$6,'buyer@example.test','en','test','https://test.example',$7,$8)`,
      [`PF-${String(103-i).padStart(20,"0")}`, randomUUID(), i===0 ? "test-payment" : "day", i===0 ? 200 : 1500, `Row ${i}`, `+995555${String(i).padStart(6,"0")}`, i < 2 ? "paid" : "pending", new Date(Date.UTC(2026,0,1,0,0,i))]);
    }
    const url = (query="") => new URL(`https://test.example/api/presale/admin?${query}`);
    const first = await listPurchases(url());
    assert.equal(first.rows.length,100); assert.ok(first.next); assert.equal(first.summary.orders,103);
    assert.equal(Number(first.summary.paid_gel),15); assert.equal(Number(first.summary.test_paid_gel),2);
    const second = await listPurchases(url(`before=${first.next}`));
    assert.equal(second.rows.length,3); assert.equal(second.next,null);
    assert.equal(new Set([...first.rows,...second.rows].map(r=>r.id)).size,103);
    assert.ok(new Date(first.rows[0].created_at)>new Date(first.rows[99].created_at));
    const tests = await listPurchases(url("kind=test&status=paid")); assert.equal(tests.rows.length,1); assert.equal(Number(tests.rows[0].amount_gel),2);
    const search = await listPurchases(url("q=Row%20102")); assert.equal(search.rows.length,1);
    const injection = await listPurchases(url("q=%27%20OR%201%3D1--")); assert.equal(injection.rows.length,0);
    const csv = await listPurchases(url("format=csv&kind=membership&status=paid")); assert.equal(csv.rows.length,1);
    await assert.rejects(listPurchases(url("status=invalid")));
    await assert.rejects(listPurchases(url("before=invalid")));
  } finally {
    delete globals.presalePool; await pg.close();
    if(saved.username===undefined)delete process.env.PRESALE_ADMIN_USERNAME;else process.env.PRESALE_ADMIN_USERNAME=saved.username;
    if(saved.hash===undefined)delete process.env.PRESALE_ADMIN_PASSWORD_HASH;else process.env.PRESALE_ADMIN_PASSWORD_HASH=saved.hash;
  }
});
