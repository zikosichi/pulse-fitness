"use client";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import styles from "./admin.module.css";
type Row = {
  id: string; status: string; bank_status: string | null; package_id: string; package_name: string;
  first_name: string; last_name: string; phone: string; email: string; amount_gel: string;
  created_at: string; paid_at: string | null; bank_order_id: string | null;
  emails: { kind: string; recipient: string; status: string }[] | null;
};
type Summary = { orders: number; paid: number; pending: number; review: number; paid_gel: string; test_paid_gel: string };
const amount = (value: string) => `${Number(value).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₾`;
const date = (value: string) => new Date(value).toLocaleString("en-GB", { timeZone: "Asia/Tbilisi", day:"numeric", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });
const statusLabels: Record<string,string> = { paid:"Paid", pending:"Awaiting payment", initializing:"Starting checkout", failed:"Unsuccessful", review:"Needs review" };
const statusHelp: Record<string,string> = { paid:"Payment confirmed by the bank.", pending:"Checkout opened. Payment has not been confirmed yet.", initializing:"The payment request is being prepared or verified.", failed:"The bank confirmed that this payment did not complete.", review:"Payment details need checking before this order can be treated as paid." };
const emailLabels: Record<string,string> = { sent:"Accepted by email service", pending:"Queued", sending:"Sending", review:"Needs delivery review" };
function Status({value}:{value:string}) { return <span className={styles.status} data-status={value}><i />{statusLabels[value] || value}</span>; }
function EmailSummary({row}:{row:Row}) {
  const emails = row.emails || [];
  if (!emails.length) return <span className={styles.muted}>{row.status === "paid" ? "Not queued" : "After payment"}</span>;
  if (emails.some(e=>e.status === "review")) return <span className={styles.warningText}>Needs review</span>;
  const accepted = emails.filter(e=>e.status === "sent").length;
  return <span className={accepted === emails.length ? styles.successText : styles.muted}>{accepted === emails.length ? `${accepted} accepted` : `${accepted}/${emails.length} accepted`}</span>;
}
function PurchaseDetails({row,onClose}:{row:Row;onClose:()=>void}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(()=>{ dialog.current?.showModal(); },[]);
  return <dialog ref={dialog} className={styles.dialog} onClose={onClose} aria-labelledby="purchase-title">
    <div className={styles.detailHeader}><div><p className={styles.eyebrow}>TRANSACTION DETAILS</p><h2 id="purchase-title">{row.first_name} {row.last_name}</h2></div><button className={styles.iconButton} onClick={()=>dialog.current?.close()} aria-label="Close transaction details">×</button></div>
    <div className={styles.detailBody}>
      <div className={styles.paymentSummary}><Status value={row.status}/><strong>{amount(row.amount_gel)}</strong><p>{statusHelp[row.status] || "Check the bank status below."}</p></div>
      <section><h3>Purchase</h3><dl><div><dt>Membership</dt><dd>{row.package_name}</dd></div><div><dt>Type</dt><dd>{row.package_id === "test-payment" ? "Test payment · no membership" : "Membership purchase"}</dd></div><div><dt>Order reference</dt><dd className={styles.mono}>{row.id}</dd></div><div><dt>Created</dt><dd>{date(row.created_at)}</dd></div><div><dt>Paid</dt><dd>{row.paid_at ? date(row.paid_at) : "Not confirmed"}</dd></div></dl></section>
      <section><h3>Customer</h3><dl><div><dt>Email</dt><dd><a href={`mailto:${row.email}`}>{row.email}</a></dd></div><div><dt>Phone</dt><dd><a href={`tel:${row.phone}`}>{row.phone}</a></dd></div></dl></section>
      <section><h3>Bank of Georgia</h3><dl><div><dt>Bank status</dt><dd>{row.bank_status || "Not received"}</dd></div><div><dt>Bank reference</dt><dd className={styles.mono}>{row.bank_order_id || "Not created yet"}</dd></div></dl></section>
      <section><h3>Email notifications</h3><p className={styles.muted}>“Accepted” means the email service received it, not confirmed inbox delivery.</p>
        {row.emails?.length ? <ul className={styles.emailList}>{row.emails.map(email=><li key={`${email.kind}:${email.recipient}`}><div><strong>{email.kind === "customer" ? "Customer confirmation" : "Staff notification"}</strong><span>{email.recipient}</span></div><span className={email.status === "review" ? styles.warningText : email.status === "sent" ? styles.successText : styles.muted}>{emailLabels[email.status] || email.status}</span></li>)}</ul> : <p className={styles.emptyNote}>No emails queued. Confirmations are sent after payment is confirmed.</p>}
      </section><p className={styles.muted}>All times are shown in Tbilisi time.</p>
    </div>
  </dialog>;
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
  const [selected, setSelected] = useState<Row | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const filterForm = useRef<HTMLFormElement>(null);
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
      setRows(old => before ? [...old, ...data.rows] : data.rows);
      setQuery(filters); setNext(data.next); setSummary(data.summary); setEmailEnabled(data.emailEnabled); setReady(true); setUpdatedAt(new Date().toISOString());
    } catch { setMessage("Unable to load purchases. Please try again."); }
    finally { setChecking(false); setBusy(false); }
  }, [clear]);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/presale/admin", { cache: "no-store" })
      .then(async res => { if (res.status === 401) return null; if (!res.ok) throw new Error(); return res.json(); })
      .then(data => {
        if (cancelled || !data) return;
        setRows(data.rows); setNext(data.next); setSummary(data.summary); setEmailEnabled(data.emailEnabled); setReady(true); setUpdatedAt(new Date().toISOString());
      })
      .catch(() => { if (!cancelled) setMessage("Unable to load purchases. Please try again."); })
      .finally(() => { if (!cancelled) setChecking(false); });
    return () => { cancelled = true; };
  }, []);
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget, values = new FormData(form);
    setBusy(true); setMessage("");
    try {
      const res = await fetch("/api/presale/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: values.get("username"), password: values.get("password") }) });
      if (!res.ok) { setMessage(res.status === 429 ? "Too many sign-in attempts. Try again in 15 minutes." : res.status === 401 ? "Incorrect username or password." : "Sign-in is unavailable. Please try again."); return; }
      form.reset(); setQuery(""); await load();
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
  function filter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const values = new FormData(event.currentTarget);
    const filters = new URLSearchParams({ q: String(values.get("q") || ""), status: String(values.get("status")), kind: String(values.get("kind")) }).toString();
    void load(filters);
  }
  function resetFilters() { filterForm.current?.reset(); void load(); }
  const filtered = Boolean(new URLSearchParams(query).get("q") || ["status","kind"].some(k=>{const v=new URLSearchParams(query).get(k); return v && v!=="all";}));
  return <div className={styles.workspace}>
    <aside className={styles.sidebar}>
      <a href="/admin" className={styles.brand} aria-label="Pulse Fitness admin"><Image src="/brand/pulse-fitness-logo.svg" alt="Pulse Fitness" width={128} height={51}/><span>ADMIN WORKSPACE</span></a>
      {ready && <><p className={styles.navLabel}>WORKSPACE</p><nav aria-label="Administration"><a className={styles.navActive} href="/admin" aria-current="page"><span aria-hidden="true">▤</span> Transactions</a></nav></>}
      <div className={styles.sidebarBottom}><a href="/" target="_blank" rel="noopener">View website <span aria-hidden="true">↗</span></a><a href="/presale" target="_blank" rel="noopener">Open checkout <span aria-hidden="true">↗</span></a><p>Pulse Fitness · Tskaltubo</p></div>
    </aside>
    <div className={styles.content}>
      <header className={styles.topbar}><span>Workspace <span className={styles.breadcrumb}>/ {ready ? "Transactions" : "Sign in"}</span></span>{ready && <div className={styles.account}><span className={styles.avatar}>A</span><span>Administrator</span><button className={styles.textButton} disabled={busy} onClick={logout}>Sign out</button></div>}</header>
      <main className={styles.main}>
        {!ready ? <div className={styles.loginWrap}><form className={styles.login} onSubmit={login}><span className={styles.loginMark} aria-hidden="true">P</span><p className={styles.eyebrow}>PULSE FITNESS ADMIN</p><h1>Welcome back.</h1><p className={styles.subtitle}>Sign in to manage purchases and keep track of payments.</p>
          {checking ? <p role="status">Checking your session…</p> : <><label className={styles.field}>Username<input name="username" autoComplete="username" required maxLength={80}/></label><label className={styles.field}>Password<input name="password" type="password" autoComplete="current-password" required maxLength={256}/></label><button className={styles.primary} disabled={busy}>{busy ? "Signing in…" : "Sign in to workspace →"}</button></>}
          {message && <p role="status" className={styles.message}>{message}</p>}
        </form></div> : <>
          <div className={styles.heading}><div><p className={styles.eyebrow}>PAYMENTS & MEMBERSHIPS</p><h1>Transactions</h1><p className={styles.subtitle}>See who purchased, what was paid, and what needs a closer look.</p></div><button className={styles.secondary} disabled={busy} onClick={download}>Export CSV <span aria-hidden="true">↓</span></button></div>
          <div className={styles.viewMeta}><span>{filtered ? "Overview of filtered results" : "All transactions · all time"}</span><span>{updatedAt ? `Updated ${date(updatedAt)}` : ""} · Tbilisi time</span></div>
          {summary && <div className={styles.stats}>
            <article className={styles.revenue}><span>Membership revenue</span><strong>{amount(summary.paid_gel)}</strong><small>Confirmed payments · excludes tests</small></article>
            <article><span>Paid transactions</span><strong>{summary.paid}<small> / {summary.orders}</small></strong><small>{amount(summary.test_paid_gel)} from test payments</small></article>
            <article><span>Awaiting payment</span><strong>{summary.pending}</strong><small>Starting checkout or waiting for the bank</small></article>
            <article data-attention={summary.review > 0}><span>Needs review</span><strong>{summary.review}</strong><small>{summary.review ? "Check payment details before confirming" : "No payments flagged for review"}</small></article>
          </div>}
          {message && <p role="status" className={styles.message}>{message}</p>}
          {!emailEnabled && <p className={styles.warning}>Email sending is paused. Customer and staff confirmations will remain queued.</p>}
          <section className={styles.transactions} aria-labelledby="purchases-title" aria-busy={busy}>
            <div className={styles.sectionHeader}><div><h2 id="purchases-title">Purchase history <span>{summary?.orders ?? 0}</span></h2><p>Newest purchases first. Select a transaction for the full story.</p></div><button className={styles.secondary} disabled={busy} onClick={()=>load(query)}>{busy ? "Updating…" : "↻ Refresh"}</button></div>
            <form ref={filterForm} className={styles.filters} onSubmit={filter}>
              <label className={styles.field}>Search transactions<input name="q" placeholder="Name, email, phone or reference" maxLength={120}/></label>
              <label className={styles.field}>Payment status<select name="status"><option value="all">All statuses</option><option value="paid">Paid</option><option value="pending">Awaiting payment</option><option value="initializing">Starting checkout</option><option value="failed">Unsuccessful</option><option value="review">Needs review</option></select></label>
              <label className={styles.field}>Purchase type<select name="kind"><option value="all">All purchases</option><option value="membership">Memberships</option><option value="test">Test payments</option></select></label>
              <button className={styles.primary} disabled={busy}>Apply filters</button>{filtered && <button type="button" className={styles.textButton} disabled={busy} onClick={resetFilters}>Clear</button>}
            </form>
            <div className={styles.tableWrap}><table><caption className={styles.srOnly}>Purchases with customer, membership, amount, payment and email status</caption><thead><tr><th scope="col">Customer</th><th scope="col">Purchase</th><th scope="col">Amount</th><th scope="col">Payment</th><th scope="col">Emails</th><th scope="col">Created</th><th scope="col"><span className={styles.srOnly}>Details</span></th></tr></thead><tbody>{rows.map(row=><tr key={row.id}>
              <td><strong>{row.first_name} {row.last_name}</strong><span className={styles.cellSub}>{row.email}</span></td>
              <td><span>{row.package_name}</span><span className={styles.cellSub}>{row.package_id === "test-payment" ? <span className={styles.testTag}>Test · no membership</span> : "Membership"}</span></td>
              <td className={styles.amount}>{amount(row.amount_gel)}</td><td><Status value={row.status}/></td><td><EmailSummary row={row}/></td><td className={styles.date}>{date(row.created_at)}</td><td><button className={styles.detailButton} onClick={()=>setSelected(row)} aria-label={`View transaction for ${row.first_name} ${row.last_name}, ${row.id}`}>View <span aria-hidden="true">↗</span></button></td>
            </tr>)}</tbody></table></div>
            {!rows.length && <div className={styles.empty}><span aria-hidden="true">▤</span><h3>{filtered ? "No matching purchases" : "Your first purchase will appear here"}</h3><p>{filtered ? "Try a different name or adjust the status and type filters." : "Registrations appear when checkout starts. The bank confirms successful payments."}</p>{filtered && <button className={styles.secondary} onClick={resetFilters}>Clear filters</button>}</div>}
            <div className={styles.tableFooter}><span>Showing {rows.length} of {summary?.orders ?? 0} transactions{filtered ? " · filtered" : ""}</span>{next && <button className={styles.secondary} disabled={busy} onClick={()=>load(query,next)}>Load more</button>}<span>CSV export follows these filters</span></div>
          </section>
          <section className={styles.operations} aria-label="Payment checks"><div><h2>Payment & email checks</h2><p>Recheck pending payments with the bank and retry queued confirmation emails.</p><span className={emailEnabled ? styles.successText : styles.warningText}>{emailEnabled ? "● Automatic email sending is on" : "● Email sending is paused"}</span></div><button className={styles.secondary} disabled={busy} onClick={reconcile}>Check payments & retry emails</button></section>
          <p className={styles.footnote}>Payment status comes from Bank of Georgia. Email acceptance does not confirm inbox delivery.</p>
        </>}
      </main>
    </div>
    {selected && <PurchaseDetails row={selected} onClose={()=>setSelected(null)}/>}
  </div>;
}
