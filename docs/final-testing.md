# Presale acceptance test

## Preparation status — 29 September 2026

- Passed: all 10 automated tests, ESLint and production build, including the updated email design.
- Passed: BOG OAuth authentication with the exact merchant credentials.
- Passed: Resend domain verification and requested customer/staff sample sends.
- Passed: Vercel CLI identity and project access; HTTPS preview build is Ready.
- Passed: user accepted Neon terms; free Frankfurt test database provisioned, connected and migrated; public HTTPS callback reaches the app and rejects unsigned requests.
- Passed: hosted session cookies, origin rejection, staff list/CSV, email configuration and registration validation. Georgian/English pricing and desktop/mobile layout checked.
- Ready: checkout and payment-confirmation sending are enabled in Preview at https://presale-test.pulsefitness.ge/presale; preview pages send `X-Robots-Tag: noindex, nofollow`.
- Local checkout/sending remain disabled. Public production deployment and its environment were not changed. No bank order, payment or registration has been created during these checks.

## Set up the test environment

1. Use the existing `pulse-fitness` Vercel project and a preview deployment. Keep the current public landing page in place.
2. Provision hosted Neon PostgreSQL for testing and save its pooled TLS URL as `DATABASE_URL`. Keep future production registrations in a separate database or branch. No Docker is required.
3. Apply `db/presale.sql` with `npm run db:migrate` against the test database. Confirm `presale_orders`, `presale_emails` and `presale_rate_limits` exist.
4. Configure preview-only bank, Resend, database and staff/cron secrets. Set `PRESALE_ORIGIN` to the exact HTTPS test hostname. Never upload `.env.local` as a source file or put secrets in command arguments/logs.
5. Ensure BOG can reach `/api/presale/callback` without an interactive Vercel login. Confirm an unsigned request reaches the application and returns its signature error. Do not interpret a Vercel login page as a successful callback test.
6. Confirm deployment protection and test access before enabling `PRESALE_ENABLED` and `PRESALE_EMAIL_ENABLED` for the controlled test. Do not enable the public production checkout until bank approval.

## Checks before any card charge

| Check | Expected result |
|---|---|
| Georgian and English forms on desktop/mobile | Correct labels, readable controls, no horizontal scrolling |
| First unlimited month | 120 GEL crossed out; 20% discount; 96 GEL payable |
| Other packages | Standard catalogue prices; no first-month discount |
| Activation and access fees | First visit after opening; card 10 GEL or wristband 20 GEL at reception |
| Missing/invalid details or unchecked terms | Checkout cannot proceed |
| Create checkout using the designated tester’s details | One persisted registration, bank order ID and BOG payment-page redirect |
| Reload or repeat the same checkout request | Existing order reused, not a second registration/payment request |
| Cancel/abandon bank checkout | No paid confirmation and no confirmation email |
| Unauthenticated staff/CSV/reconciliation requests | Denied; no registration details exposed |
| A second browser requests the first browser’s order | Cannot retrieve that registration |
| Forged/unsigned callback | Rejected; cannot mark an order paid |

Use fictional data for validation-only checks. For the real bank checkout, use the designated tester’s actual contact details and keep any resulting order references for reconciliation. An unpaid first-month order reserves that phone’s offer; resume the same order or wait for a bank-confirmed failure instead of creating repeated offers.

## One user-completed bank payment

The user requested a **2 GEL** real-money test option. Use https://presale-test.pulsefitness.ge/presale?package=test-payment for the initial payment test. The package is explicitly labelled as a test, grants no membership, and is rejected outside the enabled dedicated Preview environment. For this option, check **2 GEL** in the bank receipt, database, confirmation and emails. Keep the 96 GEL pricing/discount checks separate; this small payment does not prove first-month eligibility end to end.

BOG stated that its allowance is **100 GEL total per month across all test transactions**, with real cards and real charges. Confirm the remaining allowance before paying. A 96 GEL membership uses almost all of the allowance. The user completes the card/payment action; preparation does not authorize a charge.

After payment:

1. Confirm the bank receipt’s order reference, GEL currency and the selected test amount (2 GEL for `test-payment`) match the local order.
2. Verify a signed bank callback reaches the deployment and saves `paid` with `paid_at`.
3. Verify the customer confirmation page, database, staff list and CSV all show the same order and amount.
4. Verify the customer receives the correct language and amount, and both configured staff recipients receive Georgian notifications. `info@pulsefitness.ge` forwards to David’s Gmail, so the two staff destinations may produce two copies for him.
5. Verify the branded logo, top/bottom spacing, discount and reception notes in the actual inbox. Provider acceptance alone is not proof of inbox delivery; check Resend delivery status and spam if necessary.
6. Refresh the confirmation page and use staff reconciliation: no extra registration, charge or email should result. Duplicate signed-callback behavior is also covered by automated tests; do not manufacture a bank signature.
7. Verify the first-month discount cannot be purchased again with the same phone after payment.

## Recovery and handover

- A browser redirect alone must never mark a payment paid.
- If callback delivery fails, use the customer status page or the staff “Check payments & retry emails” action and compare the bank receipt.
- Email sends can be retried after five minutes using the same saved payload/key. After 23 hours an uncertain send requires provider-log review before any resend.
- Check production cron configuration separately; Vercel previews do not run the daily cron.
- Record the test hostname, order reference, bank status, email delivery result and any failure in this document without card data, credentials or unnecessary customer details.
- Once the bank approves the working integration and removes its test limit, configure the separate production database, production hostname and environment variables, deploy and enable public sales.
- Refund implementation remains outside this scope, as requested.

## Execution results

| Item | Result |
|---|---|
| Hosted database/migration | Passed: Neon `pulse-presale-test`, free plan, `fra1`; all three tables created |
| HTTPS test deployment | Ready: https://presale-test.pulsefitness.ge/presale (public HTTPS, checkout enabled) |
| Bank checkout created without charge | Passed as part of the user-completed 2 GEL test |
| User-completed payment | Passed: 2 GEL, reference `PF-267B326126DCFD7B63B3`, 29 September 2026 |
| Signed callback and stored paid status | Stored status `paid`, bank status `completed`, paid_at 18:44:11 UTC verified; callback-specific delivery still needs log evidence |
| Customer/staff emails triggered by real payment | Customer plus two staff jobs marked sent at 18:44:15 UTC; user reports success, individual inbox delivery not independently checked |
| Staff list and CSV | Passed against hosted database; no registrations yet |
| Bank approval for public sales | Pending |

### Preview preparation results — 29 September

- Deployment ID: `dpl_8GtJQ89Uk2BYXG8pDUuRs68Nw7xA`; Preview build `pulse-fitness-j0zwcsboz-zikosichis-projects.vercel.app`; state `READY`. Lint and this production build passed. Nine automated tests pass, including the preview-only 2 GEL option, exact bank payload amount and test-specific email wording.
- Test origin: `https://presale-test.pulsefitness.ge`. Plain unauthenticated HTTPS requests reach the application: callback POST returns 401 `signature`; staff GET returns 401 `forbidden`. Authorized staff JSON/CSV return 200, and the staff response confirms `emailEnabled: true`.
- Session POST returns 200 and a Secure, HttpOnly, SameSite=Lax cookie. Wrong-origin POST returns 403. Invalid email, unchecked terms and unknown package return 400 (`email`, `terms`, `package`). The initial test harness expected `invalid` for an unknown package; the application correctly returned its documented `package` error. No application fix was needed.
- Neon resource `store_6gtVGhMU48gbOaA7` / integration `icfg_fHEfHPYMueZGE6dXfLCH0qlm`; free plan `free_v3`, Frankfurt `fra1`, Neon Auth disabled. Connected to Preview and Development only. The pooled TLS URL is saved in Vercel and ignored owner-only `.env.local`; never copy it into this document.
- Preview has bank, email, staff/cron secrets, database URL and exact test origin. `PRESALE_ENABLED=true` and `PRESALE_EMAIL_ENABLED=true` are Preview-only. Local flags remain false; no production environment variables were changed.
- The custom test domain was added to the project and manually aliased to the Preview build. Project-wide deployment protection was not disabled. The generated Preview URLs still require Vercel authentication. The branch is local and unpushed, so this is not a branch domain. A future production deployment may reassign the test domain; reapply the explicit test alias and verify public callback access before another test.
- DNS: CNAME `presale-test` → `cname.vercel-dns.com`, TTL 300, confirmed through Google Public DNS; HTTPS certificate issued. Existing website/email records were retained.
- Hosted validation used no valid checkout request and sent no emails. The real bank order, signed callback, user payment, and resulting customer/staff delivery remain to be tested.

- Two-lari deployment verified: the hosted page preselects `test-payment`, shows 2 ₾, and states that no membership is activated. The server recognizes the package and rejects missing consent; unsigned callbacks remain rejected. No valid checkout was submitted and no charge was made by the agent.

### First real payment verification

Read-only database check confirmed order `PF-267B326126DCFD7B63B3`, package `test-payment`, amount 200 tetri (2 GEL), currency GEL, status `paid`, bank status `completed`. Three email queue rows (one customer, two staff) are `sent`. Do not confuse provider acceptance with independently verified inbox delivery. The payment is in the hosted test database, not a production membership database.

### Admin panel verification

The test site now has username/password login at `/presale/admin`. Server-only username and salted password hash are configured; the plaintext password is not in source or these docs. Added `presale_admin_sessions` via the idempotent migration.

All ten tests, lint, TypeScript and Vercel build passed. Tests cover invalid credentials, token hashing, expiry, revocation, password rotation, chronological pagination across 103 purchases, literal search, filters and separate test/member totals. Hosted checks passed for anonymous list/CSV denial, wrong-origin and wrong-password rejection, correct login, secure cookie flags, authenticated list/CSV, membership filtering, logout and rejection of the revoked cookie. The paid 2 GEL test purchase is visible with 0 GEL membership revenue and 2 GEL test revenue.

### Checkout polish and retirement of test payments

Removed the 2 GEL option from checkout, registration validation and server-side order creation. The old package query falls back to the monthly membership. Preview's former test flag is false and no longer consumed by application code. Hosted POST for `test-payment` returned HTTP 400 `package` before creating a bank order. Read-only database verification confirmed the existing test order remains `paid` for 200 tetri.

Presale pages reuse the landing navigation with home-section links, a persistent logo, language switch and responsive menu. Navigation, main/form and footer share the same width; the form now has a matching bordered card and improved spacing. Verified desktop alignment at 1280px, tablet menu at 1024px, and no horizontal overflow at 390px and 320px. Georgian/English switching and ordinary package selection work; no payment was submitted.

All 10 automated tests, lint, TypeScript and the Vercel production build passed. Latest Preview: `https://pulse-fitness-mwj5xqw40-zikosichis-projects.vercel.app` (`dpl_GYPDmbcDRF4ybu6dwG3Xeemyj8DX`), aliased to `https://presale-test.pulsefitness.ge`. Production remains unchanged.

### Limited opening promotion

Added a gold opening-offer banner in the landing hero and pricing section, highlighted the monthly card, and added the cutoff to checkout and purchase terms. Deadline: Sunday 4 October 2026, 23:59 Tbilisi; at Monday 5 October 00:00 the promotional displays disappear and new monthly orders cost 120 GEL. Already-issued bank sessions retain their existing 15-minute validity.

Eleven tests, lint, TypeScript and the Vercel build pass. Boundary tests cover the exact Georgia midnight cutoff, unchanged other package prices, stale quote rejection without an inserted order, blocking unissued discounted checkout after expiry, regular-price renewals, and preservation of historical prices. Updated the hosted unique index to restrict only discounted monthly purchases. A hosted deliberately mismatched amount returned 409 `price`; no bank order or payment was created.

Verified Georgian hero/pricing banners on desktop and mobile, no horizontal overflow, and the offer link opens the monthly checkout at 96 GEL with the explicit deadline. Latest Preview `pulse-fitness-i7ucjdo64-zikosichis-projects.vercel.app` (`dpl_9PMMgxFEGBKGfEjyFmFqnRf87dE6`) is aliased to the test domain. Production is unchanged.

### Root admin workspace

Moved the staff UI to `/admin` and added a permanent 308 redirect from `/presale/admin`. The dashboard has its own responsive workspace shell, light readable content, revenue/payment summaries, filterable history, empty states, refresh time and a native modal details drawer for customer, bank and email information. Authentication and API permissions are unchanged.

Verified the 308 redirect, existing session continuity, logout/login with the configured credentials, membership filtering and clear filters, drawer opening/Escape dismissal, CSV access and anonymous API denial (401). Desktop table fits its container; at a 390px viewport the document has no horizontal overflow and the wide table scrolls internally. The mobile detail drawer fits the viewport. No reconciliation or email retry was triggered during UI checks.

All 11 automated tests passed. Final lint, TypeScript and Vercel build passed. Preview `pulse-fitness-cv1wzidyk-zikosichis-projects.vercel.app` (`dpl_7u7d1WGNk5d1FHS6rByDfTmvcBLv`) is aliased to `presale-test.pulsefitness.ge`. Production remains unchanged.
