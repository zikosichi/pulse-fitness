"use client";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import styles from "./admin.module.css";

type Row = {
  id: string; status: string; bank_status: string | null; package_id: string; package_name: string;
  first_name: string; last_name: string; phone: string; email: string; amount_gel: string;
  created_at: string; paid_at: string | null; bank_order_id: string | null;
  emails: { kind: string; recipient: string; status: string }[] | null;
};
type Summary = { orders: number; paid: number; pending: number; review: number; paid_gel: string; test_paid_gel: string };

const amount = (value: string) =>
  `${Number(value).toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ₾`;
const date = (value: string) =>
  new Date(value).toLocaleString("en-GB", { timeZone: "Asia/Tbilisi", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const fullDate = (value: string) =>
  new Date(value).toLocaleString("en-GB", { timeZone: "Asia/Tbilisi", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const statusLabels: Record<string, string> = { paid: "Paid", pending: "Awaiting payment", initializing: "Starting checkout", failed: "Unsuccessful", review: "Needs review" };
const statusHelp: Record<string, string> = {
  paid: "Payment confirmed by the bank.",
  pending: "Checkout opened. Payment has not been confirmed yet.",
  initializing: "The payment request is being prepared or verified.",
  failed: "The bank confirmed that this payment did not complete.",
  review: "Payment details need checking before this order can be treated as paid.",
};
const emailLabels: Record<string, string> = { sent: "Accepted", pending: "Queued", sending: "Sending", review: "Needs review" };
const statusTabs = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Awaiting" },
  { value: "failed", label: "Unsuccessful" },
  { value: "review", label: "Needs review" },
];

function Status({ value }: { value: string }) {
  return <span className={styles.status} data-status={value}><i />{statusLabels[value] || value}</span>;
}
function EmailSummary({ row }: { row: Row }) {
  const emails = row.emails || [];
  if (!emails.length) return <span className={styles.muted}>{row.status === "paid" ? "Not queued" : "—"}</span>;
  if (emails.some((e) => e.status === "review")) return <span className={styles.warn}>Needs review</span>;
  const accepted = emails.filter((e) => e.status === "sent").length;
  return <span className={accepted === emails.length ? styles.ok : styles.muted}>{accepted}/{emails.length} sent</span>;
}
function Spike() {
  return (
    <svg className={styles.spike} viewBox="0 0 40 20" aria-hidden="true">
      <path d="M1 12h10l3-6 4 12 5-17 4 11h12" />
    </svg>
  );
}

function PurchaseDetails({ row, onClose }: { row: Row; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { dialog.current?.showModal(); }, []);
  const test = row.package_id === "test-payment";
  return (
    <dialog ref={dialog} className={styles.dialog} onClose={onClose} aria-labelledby="purchase-title">
      <header className={styles.drawerHead}>
        <div>
          <h2 id="purchase-title">{row.first_name} {row.last_name}</h2>
          <p className={styles.mono}>{row.id}</p>
        </div>
        <button className={styles.close} onClick={() => dialog.current?.close()} aria-label="Close details">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" /></svg>
        </button>
      </header>
      <div className={styles.drawerBody}>
        <div className={styles.payment}>
          <div>
            <Status value={row.status} />
            <p>{statusHelp[row.status] || "Check the bank status below."}</p>
          </div>
          <strong>{amount(row.amount_gel)}</strong>
        </div>

        <section>
          <h3>Purchase</h3>
          <dl>
            <div><dt>Membership</dt><dd>{row.package_name}{test && <span className={styles.testTag}>Test · no membership</span>}</dd></div>
            <div><dt>Created</dt><dd>{fullDate(row.created_at)}</dd></div>
            <div><dt>Paid</dt><dd>{row.paid_at ? fullDate(row.paid_at) : "Not confirmed"}</dd></div>
          </dl>
        </section>

        <section>
          <h3>Customer</h3>
          <dl>
            <div><dt>Phone</dt><dd><a href={`tel:${row.phone}`}>{row.phone}</a></dd></div>
            <div><dt>Email</dt><dd><a href={`mailto:${row.email}`}>{row.email}</a></dd></div>
          </dl>
        </section>

        <section>
          <h3>Bank of Georgia</h3>
          <dl>
            <div><dt>Bank status</dt><dd>{row.bank_status || "Not received"}</dd></div>
            <div><dt>Reference</dt><dd className={styles.mono}>{row.bank_order_id || "Not created yet"}</dd></div>
          </dl>
        </section>

        <section>
          <h3>Emails</h3>
          {row.emails?.length ? (
            <ul className={styles.emailList}>
              {row.emails.map((email) => (
                <li key={`${email.kind}:${email.recipient}`}>
                  <div>
                    <strong>{email.kind === "customer" ? "Customer confirmation" : "Staff notification"}</strong>
                    <span>{email.recipient}</span>
                  </div>
                  <span className={email.status === "review" ? styles.warn : email.status === "sent" ? styles.ok : styles.muted}>
                    {emailLabels[email.status] || email.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.muted}>No emails yet. Confirmations go out once the bank confirms payment.</p>
          )}
        </section>
        <p className={styles.fine}>“Accepted” means the email service received it, not that it reached the inbox. Times are Tbilisi time.</p>
      </div>
    </dialog>
  );
}

export default function Admin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [next, setNext] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [kind, setKind] = useState("all");
  const [selected, setSelected] = useState<Row | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [emailEnabled, setEmailEnabled] = useState(false);

  const clear = useCallback(() => { setReady(false); setRows([]); setSummary(null); setNext(null); setSelected(null); setUpdatedAt(null); }, []);
  const load = useCallback(async (filters = "", before?: string, quiet = false) => {
    setBusy(true);
    if (!quiet) setMessage("");
    try {
      const params = new URLSearchParams(filters);
      if (before) params.set("before", before);
      const res = await fetch(`/api/presale/admin?${params}`, { cache: "no-store" });
      if (res.status === 401) { clear(); if (!quiet) setMessage("Your session expired. Please sign in again."); return; }
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRows((old) => (before ? [...old, ...data.rows] : data.rows));
      setQuery(filters); setNext(data.next); setSummary(data.summary); setEmailEnabled(data.emailEnabled); setReady(true); setUpdatedAt(new Date().toISOString());
    } catch { setMessage("Unable to load purchases. Please try again."); }
    finally { setChecking(false); setBusy(false); }
  }, [clear]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/presale/admin", { cache: "no-store" })
      .then(async (res) => { if (res.status === 401) return null; if (!res.ok) throw new Error(); return res.json(); })
      .then((data) => {
        if (cancelled || !data) return;
        setRows(data.rows); setNext(data.next); setSummary(data.summary); setEmailEnabled(data.emailEnabled); setReady(true); setUpdatedAt(new Date().toISOString());
      })
      .catch(() => { if (!cancelled) setMessage("Unable to load purchases. Please try again."); })
      .finally(() => { if (!cancelled) setChecking(false); });
    return () => { cancelled = true; };
  }, []);

  const filtersFor = (q: string, s: string, k: string) => new URLSearchParams({ q, status: s, kind: k }).toString();
  const applyFilters = (q = search, s = status, k = kind) => void load(filtersFor(q.trim(), s, k));

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget, values = new FormData(form);
    setBusy(true); setMessage("");
    try {
      const res = await fetch("/api/presale/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: values.get("username"), password: values.get("password") }) });
      if (!res.ok) { setMessage(res.status === 429 ? "Too many sign-in attempts. Try again in 15 minutes." : res.status === 401 ? "Incorrect username or password." : "Sign-in is unavailable. Please try again."); return; }
      form.reset(); setQuery(""); setSearch(""); setStatus("all"); setKind("all"); await load();
    } catch { setMessage("Sign-in is unavailable. Please try again."); }
    finally { setBusy(false); }
  }
  async function logout() {
    setBusy(true);
    try {
      const res = await fetch("/api/presale/admin/logout", { method: "POST" });
      if (!res.ok) throw new Error();
      clear(); setQuery(""); setMessage("");
    } catch { setMessage("Sign-out failed. Please try again."); }
    finally { setBusy(false); }
  }
  async function download() {
    setBusy(true); setMessage("");
    try {
      const params = new URLSearchParams(query); params.set("format", "csv");
      const res = await fetch(`/api/presale/admin?${params}`, { cache: "no-store" });
      if (res.status === 401) { clear(); setMessage("Please sign in again."); return; }
      if (!res.ok) throw new Error();
      const url = URL.createObjectURL(await res.blob()), link = document.createElement("a");
      link.href = url; link.download = "pulse-presales.csv"; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch { setMessage("Export failed. Exports support up to 10,000 matching purchases; narrow your search if needed."); }
    finally { setBusy(false); }
  }
  async function reconcile() {
    setBusy(true); setMessage("");
    try {
      const res = await fetch("/api/presale/admin", { method: "POST" });
      if (res.status === 401) { clear(); setMessage("Please sign in again."); return; }
      if (!res.ok) throw new Error();
      const data = await res.json(); await load(query);
      setMessage(`Checked ${data.checked} pending orders; ${data.errors} could not be checked. Emails: ${data.emails.sent} accepted, ${data.emails.errors} unconfirmed, ${data.emails.review} need review.`);
    } catch { setMessage("Payment check could not finish. Please try again."); }
    finally { setBusy(false); }
  }
  function resetFilters() { setSearch(""); setStatus("all"); setKind("all"); void load(); }

  const params = new URLSearchParams(query);
  const filtered = Boolean(params.get("q") || ["status", "kind"].some((k) => { const v = params.get(k); return v && v !== "all"; }));

  if (!ready) {
    return (
      <div className={styles.page}>
        <span className={styles.bloom} aria-hidden="true" />
        <main className={styles.loginWrap}>
          <form className={styles.login} onSubmit={login}>
            <Image className={styles.loginLogo} src="/brand/pulse-fitness-logo.svg" alt="Pulse Fitness" width={150} height={60} priority />
            <div>
              <h1>Staff sign in</h1>
              <p className={styles.sub}>Presale orders and payments.</p>
            </div>
            {checking ? <p role="status" className={styles.muted}>Checking your session…</p> : <>
              <label className={styles.field}>Username<input name="username" autoComplete="username" required maxLength={80} /></label>
              <label className={styles.field}>Password<input name="password" type="password" autoComplete="current-password" required maxLength={256} /></label>
              <button className={`${styles.btn} ${styles.primary}`} disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
            </>}
            {message && <p role="status" className={styles.notice}>{message}</p>}
          </form>
          <Link className={styles.back} href="/">Back to pulsefitness.ge</Link>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.bar}>
        <a href="/admin" className={styles.brand} aria-label="Pulse Fitness admin">
          <Spike /><span>Pulse</span><em>Admin</em>
        </a>
        <nav className={styles.barLinks} aria-label="Shortcuts">
          <a href="/" target="_blank" rel="noopener">Website</a>
          <a href="/presale" target="_blank" rel="noopener">Checkout</a>
        </nav>
        <button className={styles.signOut} disabled={busy} onClick={logout}>Sign out</button>
      </header>

      <main className={styles.main}>
        <div className={styles.heading}>
          <div>
            <h1>Presale orders</h1>
            <p className={styles.sub}>{updatedAt ? `Updated ${date(updatedAt)}, Tbilisi time` : ""}</p>
          </div>
          <div className={styles.actions}>
            <button className={`${styles.btn} ${styles.ghost}`} disabled={busy} onClick={() => load(query)}>
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13 8a5 5 0 1 1-1.5-3.5M13 2.5V5h-2.5" /></svg>
              {busy ? "Updating…" : "Refresh"}
            </button>
            <button className={`${styles.btn} ${styles.ghost}`} disabled={busy} onClick={download}>
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2.5v8M4.5 7 8 10.5 11.5 7M3 13.5h10" /></svg>
              Export CSV
            </button>
          </div>
        </div>

        {summary && (
          <dl className={styles.stats}>
            <div className={styles.revenue}>
              <dt>Membership revenue</dt>
              <dd>{amount(summary.paid_gel)}</dd>
              <span>Confirmed · excludes tests</span>
            </div>
            <div>
              <dt>Paid orders</dt>
              <dd>{summary.paid}<small>/{summary.orders}</small></dd>
              <span>{Number(summary.test_paid_gel) > 0 ? `${amount(summary.test_paid_gel)} in test payments` : "Of all orders"}</span>
            </div>
            <div>
              <dt>Awaiting payment</dt>
              <dd>{summary.pending}</dd>
              <span>Checkout open, not confirmed</span>
            </div>
            <div data-attention={summary.review > 0}>
              <dt>Needs review</dt>
              <dd>{summary.review}</dd>
              <span>{summary.review ? "Check before confirming" : "Nothing flagged"}</span>
            </div>
          </dl>
        )}

        {message && <p role="status" className={styles.notice}>{message}</p>}
        {!emailEnabled && <p className={`${styles.notice} ${styles.noticeWarn}`}>Email sending is paused. Confirmations stay queued until it is switched on.</p>}

        <section className={styles.panel} aria-labelledby="orders-title" aria-busy={busy}>
          <h2 id="orders-title" className={styles.srOnly}>Orders</h2>
          <div className={styles.toolbar}>
            <div className={styles.tabs} role="group" aria-label="Payment status">
              {statusTabs.map((tab) => (
                <button key={tab.value} type="button" aria-pressed={status === tab.value} disabled={busy}
                  onClick={() => { setStatus(tab.value); applyFilters(search, tab.value, kind); }}>
                  {tab.label}
                </button>
              ))}
            </div>
            <form className={styles.search} role="search" onSubmit={(e) => { e.preventDefault(); applyFilters(); }}>
              <svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.5" /><path d="m10.5 10.5 3 3" /></svg>
              <input name="q" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, phone, email, reference" maxLength={120} aria-label="Search orders" />
            </form>
            <select className={styles.kind} value={kind} aria-label="Purchase type" disabled={busy}
              onChange={(e) => { setKind(e.target.value); applyFilters(search, status, e.target.value); }}>
              <option value="all">All purchases</option>
              <option value="membership">Memberships</option>
              <option value="test">Test payments</option>
            </select>
          </div>

          {rows.length > 0 && (
            <div className={styles.tableWrap}>
              <table>
                <caption className={styles.srOnly}>Orders with customer, membership, amount, payment and email status</caption>
                <thead>
                  <tr>
                    <th scope="col">Customer</th>
                    <th scope="col">Membership</th>
                    <th scope="col" className={styles.num}>Amount</th>
                    <th scope="col">Payment</th>
                    <th scope="col">Emails</th>
                    <th scope="col">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} onClick={() => setSelected(row)}>
                      <td data-cell="customer">
                        <button className={styles.rowLink} onClick={(e) => { e.stopPropagation(); setSelected(row); }}>
                          {row.first_name} {row.last_name}
                        </button>
                        <span className={styles.cellSub}>{row.phone}</span>
                      </td>
                      <td data-cell="membership">
                        {row.package_name}
                        {row.package_id === "test-payment" && <span className={styles.testTag}>Test</span>}
                      </td>
                      <td data-cell="amount" className={styles.num}>{amount(row.amount_gel)}</td>
                      <td data-cell="status"><Status value={row.status} /></td>
                      <td data-cell="emails"><EmailSummary row={row} /></td>
                      <td data-cell="date" className={styles.date}>{date(row.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!rows.length && (
            <div className={styles.empty}>
              <h3>{filtered ? "No matching orders" : "No orders yet"}</h3>
              <p>{filtered ? "Try another name, or clear the filters." : "Orders appear here as soon as someone starts checkout."}</p>
              {filtered && <button className={`${styles.btn} ${styles.ghost}`} onClick={resetFilters}>Clear filters</button>}
            </div>
          )}

          <footer className={styles.panelFoot}>
            <span>Showing {rows.length} of {summary?.orders ?? 0}{filtered ? " · filtered" : ""}</span>
            {filtered && rows.length > 0 && <button className={styles.link} disabled={busy} onClick={resetFilters}>Clear filters</button>}
            {next && <button className={`${styles.btn} ${styles.ghost}`} disabled={busy} onClick={() => load(query, next)}>Load more</button>}
          </footer>
        </section>

        <section className={styles.ops} aria-labelledby="ops-title">
          <div>
            <h2 id="ops-title">Payment & email check</h2>
            <p>Asks the bank about pending orders and retries unsent confirmation emails.</p>
          </div>
          <span className={emailEnabled ? styles.ok : styles.warn}><i />{emailEnabled ? "Email sending on" : "Email sending paused"}</span>
          <button className={`${styles.btn} ${styles.ghost}`} disabled={busy} onClick={reconcile}>Run check</button>
        </section>
      </main>
      {selected && <PurchaseDetails row={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
