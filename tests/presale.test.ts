import test, { beforeEach } from "node:test";
import { PROMOTION_END, promotionActive } from "../lib/presale/promotion";
beforeEach(t => { if ("mock" in t) t.mock.timers.enable({ apis: ["Date"], now: Date.parse("2026-09-29T12:00:00Z") }); });
import assert from "node:assert/strict";
import { generateKeyPairSync, randomUUID, sign } from "node:crypto";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import {
  getPackage,
  normalizePhone,
  getPackages,
  TERMS_VERSION,
  testPaymentPackage,
  validateRegistration,
} from "../lib/presale/catalog";
import {
  createBankOrder,
  orderPayload,
  receiptState,
  validSignature,
  type Receipt,
} from "../lib/presale/bog";
import { toCsv } from "../lib/presale/export";
import {
  register,
  checkout,
  findOrder,
  reconcile,
} from "../lib/presale/orders";
import {
  limited,
  matchesSecret,
  readBody,
  sameOrigin,
} from "../lib/presale/security";
import type { Pool } from "pg";
import { sendPendingEmails, staffRecipients } from "../lib/presale/emails";
import { paymentEmail } from "../lib/presale/email-template";

const input = (overrides = {}) => ({
  packageId: "monthly",
  expectedAmount: 9600,
  firstName: "Test",
  lastName: "Member",
  phone: "555 12 34 56",
  email: "member@example.test",
  accepted: true,
  termsVersion: TERMS_VERSION,
  lang: "en",
  requestKey: randomUUID(),
  ...overrides,
});

test("email recipients are configurable; confirmation HTML escapes registration data", () => {
  assert.deepEqual(staffRecipients("INFO@pulsefitness.ge, info@pulsefitness.ge,other@example.test"), ["info@pulsefitness.ge", "other@example.test"]);
  assert.throws(() => staffRecipients("not-an-email"));
  assert.throws(() => staffRecipients("ok@example.test\r\nBcc:bad@example.test"));
  const order = {
    id: "PF-TEST", first_name: "<img src=x>", last_name: "Member & Co", phone: "+995555000000",
    email: "member@example.test", package_name: "Unlimited", amount: 9600, regular_amount: 12000,
    lang: "en" as const, paid_at: new Date("2026-09-28T10:00:00Z"),
  };
  const customer = paymentEmail(order, "customer");
  assert.ok(customer.html.includes("&lt;img src=x&gt;"));
  assert.ok(!customer.html.includes("<img src=x>"));
  assert.ok(customer.text.includes("96 ₾"));
  assert.ok(customer.text.includes("24 ₾ (20%)"));
  assert.ok(customer.text.includes("first visit after the gym opens"));
  assert.ok(!customer.text.includes(order.phone));
  const staff = paymentEmail(order, "staff");
  assert.ok(staff.subject.includes("ახალი გადახდილი რეგისტრაცია"));
  assert.ok(staff.text.includes(order.phone));
  assert.ok(staff.text.includes(order.email));
  assert.ok(paymentEmail({ ...order, lang: "ka" }, "customer").subject.includes("შენი გადახდა დადასტურებულია"));
});

test("retired 2 GEL package is rejected for new registrations but historical receipts remain valid", () => {
  assert.equal(getPackage(testPaymentPackage.id), undefined);
  assert.ok(!getPackages().some(p => p.id === testPaymentPackage.id));
  assert.throws(() => validateRegistration(input({ packageId: testPaymentPackage.id })));
  assert.equal(getPackage(testPaymentPackage.id, true)?.price, 200);
  const order = {
    id: "PF-TEST", first_name: "Test", last_name: "User", phone: "+995555000000",
    email: "test@example.test", package_id: testPaymentPackage.id, package_name: testPaymentPackage.name.en,
    amount: 200, regular_amount: 200, lang: "en" as const, paid_at: new Date(),
  };
  const customer = paymentEmail(order, "customer"), staff = paymentEmail(order, "staff");
  assert.ok(customer.subject.includes("Test payment confirmed"));
  assert.ok(customer.text.includes("2 ₾"));
  assert.ok(customer.text.includes("No membership has been activated"));
  assert.ok(!customer.text.includes("membership starts on your first visit"));
  assert.ok(!customer.html.includes("FIRST MONTH"));
  assert.ok(staff.subject.includes("სატესტო"));
  assert.ok(!staff.text.includes("აბონემენტის მოქმედების ვადა დაიწყება"));
});

test("only the first unlimited month is discounted; browser amounts are ignored", () => {
  assert.equal(getPackage("monthly")?.price, 9600);
  for (const p of getPackages())
    if (p.id !== "monthly") assert.equal(p.price, p.regular);
  const r = validateRegistration(
    input({ amount: 1, discount: 100, packageId: "annual" }),
  );
  assert.equal(getPackage(r.packageId)?.price, 100000);
  assert.equal("amount" in r, false);
  assert.throws(() => validateRegistration(input({ packageId: "not-a-plan" })));
  assert.throws(() => validateRegistration(input({ accepted: false })));
  assert.throws(() => validateRegistration(input({ termsVersion: "old" })));
  assert.throws(() => validateRegistration(input({ firstName: "\u0000" })));
  assert.throws(() => validateRegistration(input({ email: "invalid" })));
  assert.throws(() => validateRegistration(input({ website: "spam" })));
});
test("phone normalization prevents formatting variants from claiming another discount", () => {
  for (const value of [
    "555123456",
    "995555123456",
    "+995 (555) 12-34-56",
    "00995555123456",
  ])
    assert.equal(normalizePhone(value), "+995555123456");
  assert.throws(() => normalizePhone("123"));
});
test("callback signatures cover the original bytes", () => {
  const { privateKey, publicKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
  });
  const pem = publicKey.export({ type: "spki", format: "pem" }).toString();
  const raw = '{"event":"order_payment","body":{"amount":96}}';
  const sig = sign("RSA-SHA256", Buffer.from(raw), privateKey).toString(
    "base64",
  );
  assert.equal(validSignature(raw, sig, pem), true);
  assert.equal(validSignature(raw.replace("96", "1"), sig, pem), false);
  assert.equal(validSignature(raw + " ", sig, pem), false);
  assert.equal(validSignature(raw, null, pem), false);
});
test("paid requires matching bank order, reference, GEL and both amounts", () => {
  const order = { id: "PF-REFERENCE", bank_order_id: "bank-id", amount: 9600 };
  const data: Receipt = {
    order_id: "bank-id",
    external_order_id: order.id,
    order_status: { key: "completed" },
    purchase_units: {
      currency_code: "GEL",
      request_amount: "96.00",
      transfer_amount: 96,
    },
  };
  assert.equal(receiptState(data, order), "paid");
  for (const mutation of [
    { order_id: "other" },
    { external_order_id: "other" },
    { purchase_units: { ...data.purchase_units, currency_code: "USD" } },
    { purchase_units: { ...data.purchase_units, request_amount: 1 } },
    { purchase_units: { ...data.purchase_units, transfer_amount: 0 } },
  ])
    assert.throws(() => receiptState({ ...data, ...mutation }, order));
  assert.equal(
    receiptState({ ...data, order_status: { key: "processing" } }, order),
    "pending",
  );
  assert.equal(
    receiptState({ ...data, order_status: { key: "rejected" } }, order),
    "failed",
  );
  assert.equal(
    receiptState({ ...data, order_status: { key: "unrecognized" } }, order),
    "review",
  );
});
test("export neutralizes spreadsheet formulas and quotes", () => {
  const csv = toCsv([
    {
      first_name: '=HYPERLINK("bad")',
      phone: "+995555123456",
      last_name: 'A,"B"',
    },
  ]);
  assert.ok(csv.includes("'=HYPERLINK"));
  assert.ok(csv.includes("'+995555123456"));
  assert.ok(csv.includes('A,""B""'));
});
test("security rejects wrong origins, missing admin credentials and oversized bodies", async () => {
  process.env.PRESALE_ORIGIN = "https://pulse.example";
  assert.throws(() =>
    sameOrigin(
      new Request("https://pulse.example/api", {
        headers: { origin: "https://evil.example" },
      }),
    ),
  );
  sameOrigin(
    new Request("https://pulse.example/api", {
      headers: { origin: "https://pulse.example" },
    }),
  );
  assert.equal(matchesSecret("Bearer short", "short"), false);
  assert.equal(matchesSecret("Bearer " + "x".repeat(32), "x".repeat(32)), true);
  assert.equal(
    matchesSecret("Bearer " + "y".repeat(32), "x".repeat(32)),
    false,
  );
  await assert.rejects(
    readBody(
      new Request("http://localhost", {
        method: "POST",
        body: "x".repeat(101),
      }),
      100,
    ),
  );
});
test("registration, bank retry, confirmation and eligibility with real SQL in memory", async (t) => {
  // PGlite is a short-lived test process; no Docker, server or database files.
  const pg = await PGlite.create();
  const globals = globalThis as unknown as { presalePool?: Pool };
  const originalFetch = globalThis.fetch;
  process.env.DATABASE_URL = "test-only";
  process.env.PRESALE_ORIGIN = "https://pulse.example";
  process.env.BOG_CLIENT_ID = "test-client";
  process.env.BOG_CLIENT_SECRET = "test-secret";
  process.env.PRESALE_EMAIL_STAFF_TO = "info@pulsefitness.ge,tevzadzedavit@gmail.com";
  delete process.env.PRESALE_EMAIL_ENABLED;
  const query = (sql: string, params?: unknown[]) => pg.query(sql, params);
  globals.presalePool = {
    query,
    connect: async () => ({ query, release() {} }),
  } as unknown as Pool;
  try {
    await pg.exec(
      await readFile(new URL("../db/presale.sql", import.meta.url), "utf8"),
    );
    // Migration can be applied twice.
    await pg.exec(
      await readFile(new URL("../db/presale.sql", import.meta.url), "utf8"),
    );
    await assert.rejects(register({ ...validateRegistration(input()), packageId: testPaymentPackage.id }, "test-session"), /package/);
    const registration = validateRegistration(input());
    const a = await register(registration, "session-a");
    const retry = await register(registration, "session-a");
    assert.equal(a.id, retry.id);
    assert.equal(await findOrder(a.id, "session-b"), undefined);
    await assert.rejects(register(registration, "session-b"));
    await assert.rejects(
      register({ ...registration, firstName: "Changed" }, "session-a"),
    );
    await assert.rejects(
      register({ ...registration, requestKey: randomUUID() }, "session-b"),
    );
    const payload = orderPayload(a);
    assert.equal(payload.purchase_units.total_amount, 96);
    assert.equal(payload.capture, "automatic");
    assert.equal("buyer" in payload, false);
    const keys: string[] = [];
    let receiptStatus = "completed";
    let wrongAmount = false;
    let createAttempts = 0;
    globalThis.fetch = async (url, init) => {
      const href = String(url);
      if (href.includes("openid-connect"))
        return Response.json({ access_token: "test-token", expires_in: 300 });
      if (href.endsWith("/ecommerce/orders")) {
        keys.push((init?.headers as Record<string, string>)["Idempotency-Key"]);
        assert.equal(
          JSON.parse(String(init?.body)).purchase_units.total_amount,
          96,
        );
        if (createAttempts++ === 0)
          throw new Error(
            "Simulated network timeout after bank accepted order",
          );
        return Response.json({
          id: "bank-one",
          _links: {
            redirect: { href: "https://payment.bog.ge/?order_id=bank-one" },
          },
        });
      }
      if (href.endsWith("/receipt/bank-one"))
        return Response.json({
          order_id: "bank-one",
          external_order_id: a.id,
          order_status: { key: receiptStatus },
          purchase_units: {
            currency_code: "GEL",
            request_amount: 96,
            transfer_amount: wrongAmount ? 1 : 96,
          },
        });
      throw new Error("Unexpected URL in test");
    };
    await assert.rejects(checkout(a));
    assert.equal((await findOrder(a.id))?.status, "initializing");
    const created = await checkout((await findOrder(a.id))!);
    assert.equal(created.status, "pending");
    assert.equal((await pg.query("SELECT * FROM presale_emails")).rows.length, 0);
    assert.deepEqual(keys, [registration.requestKey, registration.requestKey]);
    wrongAmount = true;
    await assert.rejects(reconcile(a.id, undefined, true));
    assert.equal((await findOrder(a.id))?.status, "pending");
    assert.equal((await pg.query("SELECT * FROM presale_emails")).rows.length, 0);
    wrongAmount = false;
    const paid = await reconcile(a.id, undefined, true);
    assert.equal(paid.status, "paid");
    assert.ok(paid.paid_at);
    const duplicate = await reconcile(a.id, undefined, true);
    assert.equal(
      new Date(duplicate.paid_at!).getTime(),
      new Date(paid.paid_at!).getTime(),
    );
    // Repeated callbacks create one customer message and one per staff address.
    assert.equal((await pg.query("SELECT * FROM presale_emails")).rows.length, 3);
    assert.equal((await sendPendingEmails(a.id)).enabled, false);
    assert.equal((await pg.query("SELECT * FROM presale_emails WHERE first_attempt_at IS NOT NULL")).rows.length, 0);
    process.env.PRESALE_EMAIL_ENABLED = "true";
    process.env.RESEND_API_KEY = "test-email-key";
    process.env.PRESALE_EMAIL_FROM = "Pulse <notifications@example.test>";
    const bankFetch = globalThis.fetch;
    const emailRequests: { key: string; body: string }[] = [];
    let timeout = true;
    globalThis.fetch = async (url, init) => {
      assert.equal(String(url), "https://api.resend.com/emails");
      const key = (init?.headers as Record<string, string>)["Idempotency-Key"];
      emailRequests.push({ key, body: String(init?.body) });
      if (timeout) { timeout = false; throw new Error("Timeout after provider accepted message"); }
      return Response.json({ id: "email-" + key });
    };
    const firstSend = await sendPendingEmails(a.id);
    assert.equal(firstSend.sent, 2);
    assert.equal(firstSend.errors, 1);
    assert.equal((await findOrder(a.id))?.status, "paid");
    // A leased job cannot be claimed by another worker.
    await pg.query("UPDATE presale_emails SET next_attempt_at=now(),lease_until=now()+interval '2 minutes' WHERE status='pending'");
    assert.equal((await sendPendingEmails(a.id)).sent, 0);
    await pg.query("UPDATE presale_emails SET lease_until=now()-interval '1 second' WHERE status='pending'");
    // Freeze the payload even if sender configuration changes during an uncertain retry.
    process.env.PRESALE_EMAIL_FROM = "Changed <changed@example.test>";
    assert.equal((await sendPendingEmails(a.id)).sent, 1);
    assert.deepEqual(emailRequests[3], emailRequests[0]);
    assert.equal((await sendPendingEmails(a.id)).sent, 0);
    assert.equal(emailRequests.length, 4);
    // Do not resend an ambiguous attempt after the provider's deduplication window expires.
    await pg.query("UPDATE presale_emails SET status='pending',next_attempt_at=now(),first_attempt_at=now()-interval '25 hours' WHERE kind='customer'");
    assert.equal((await sendPendingEmails(a.id)).review, 1);
    assert.equal(emailRequests.length, 4);
    globalThis.fetch = bankFetch;
    await assert.rejects(reconcile(a.id, "wrong-bank", true));
    receiptStatus = "rejected";
    assert.equal((await reconcile(a.id, undefined, true)).status, "review");
    await assert.rejects(
      register({ ...registration, requestKey: randomUUID() }, "session-b"),
    );
    // A bank-confirmed failure on an unpaid order releases the offer.
    const b = await register(
      validateRegistration(input({ phone: "555999999" })),
      "session-b",
    );
    await pg.query("UPDATE presale_orders SET status='failed' WHERE id=$1", [
      b.id,
    ]);
    const c = await register(
      validateRegistration(input({ phone: "+995555999999" })),
      "session-b",
    );
    assert.notEqual(b.id, c.id);
    // Concurrent first-month attempts cannot both reserve the same phone.
    const concurrent = await Promise.allSettled([
      register(
        validateRegistration(input({ phone: "555888888" })),
        "session-c",
      ),
      register(
        validateRegistration(input({ phone: "555888888" })),
        "session-d",
      ),
    ]);
    assert.equal(concurrent.filter((x) => x.status === "fulfilled").length, 1);
    await limited("test", 2, 60);
    await limited("test", 2, 60);
    await assert.rejects(limited("test", 2, 60));
    // Bank redirect must stay on the known bank checkout host.
    globalThis.fetch = async () =>
      Response.json({
        id: "x",
        _links: { redirect: { href: "https://evil.example" } },
      });
    await assert.rejects(createBankOrder(a));
    // The boundary is enforced on the server, independent of the browser's clock.
    t.mock.timers.setTime(PROMOTION_END);
    const beforeCount = (await pg.query("SELECT count(*)::int AS n FROM presale_orders")).rows[0];
    await assert.rejects(register(validateRegistration(input({phone:"555777777"})), "expired-tab"), /price/);
    assert.deepEqual((await pg.query("SELECT count(*)::int AS n FROM presale_orders")).rows[0], beforeCount);
    await assert.rejects(checkout(c), /price/);
    const regular = await register(validateRegistration(input({ expectedAmount:12000 })), "regular-session");
    assert.equal(regular.amount, 12000);
    assert.equal(orderPayload(regular).purchase_units.total_amount, 120);
    const renewal = await register(validateRegistration(input({ expectedAmount:12000 })), "regular-session");
    assert.notEqual(regular.id, renewal.id);
    // Existing payment history retains its original agreed price.
    assert.equal((await findOrder(a.id))?.amount, 9600);
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.PRESALE_EMAIL_ENABLED;
    delete process.env.RESEND_API_KEY;
    delete process.env.PRESALE_EMAIL_FROM;
    delete process.env.PRESALE_EMAIL_STAFF_TO;
    delete globals.presalePool;
    await pg.close();
  }
});

test("promotion ends exactly at Monday midnight in Tbilisi", () => {
  assert.equal(promotionActive(PROMOTION_END - 1), true);
  assert.equal(promotionActive(PROMOTION_END), false);
  assert.equal(getPackage("monthly", false, PROMOTION_END - 1)?.price, 9600);
  assert.equal(getPackage("monthly", false, PROMOTION_END)?.price, 12000);
  for (const p of getPackages(PROMOTION_END)) assert.equal(p.price, p.regular);
});
