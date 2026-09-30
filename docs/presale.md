# Presale checkout

## Production configuration — 30 September 2026

The user confirmed that the bank limit is removed and authorized the production release.
The production origin and canonical site URL are `https://www.pulsefitness.ge`.
Checkout is `/presale`; staff access is `/admin` with the existing staff credentials.
Both `PRESALE_ENABLED` and `PRESALE_EMAIL_ENABLED` are enabled in Vercel Production.
Bank and verified Resend credentials are available to Production; staff API and cron
tokens are separate from Preview. The daily reconciliation cron is `0 4 * * *` (UTC).

Production uses the separate `pulse_production` database and dedicated
`pulse_production` login on the existing hosted Neon resource. The production role
has no database-creation or role-creation privileges, and public database access
was revoked. `db/presale.sql` was applied successfully, with zero orders and emails
at initialization. The existing `neondb` database retains test history; test orders
are not production memberships. Both databases share the Neon resource's compute
and storage limits. Local development continues to use the test database.

The apex domain redirects to `www`. The test hostname is explicitly assigned to
`codex/presale-testing`, preventing production deployments from claiming it.
The 2 GEL test package remains unavailable for new purchases. Existing historical
testing notes below describe the pre-release state. All 11 tests, lint, and the
production build passed for this release.

## Current implementation

The existing Next.js/Vercel site now contains a Georgian/English checkout at `/presale`, a verified payment-status page, purchase terms/privacy information, Bank of Georgia API routes, and a staff list/CSV export at `/admin`.

- Unlimited monthly: GEL 96, normally GEL 120; first month only.
- Other gym memberships retain current prices. Group classes and training are excluded.
- Membership starts on the first visit after opening.
- Access card GEL 10 or wristband GEL 20 is paid at reception.
- No customer account, recurring billing, gym-system integration, or refund implementation.

## Database: hosted PostgreSQL

Use a dedicated **Neon Postgres** project, preferably connected through Vercel Marketplace. Do not run Docker or a local database server for this project. Neon provides a hosted database and a pooled connection URL compatible with the existing `pg` adapter. Use separate databases/branches for development/preview and production; never run tests against the customer database.

On 29 September 2026, the free Neon resource `pulse-presale-test` was provisioned in Frankfurt (`fra1`) through Vercel Marketplace after the user accepted the integration terms. It is connected to Preview and Development only. Its pooled TLS URL is saved in ignored `.env.local` and Vercel; the migration created `presale_orders`, `presale_emails` and `presale_rate_limits`. The previously created empty Docker container/volume are named `pulse-presale-dev`. Docker was already stopped when removal was attempted; they remain on disk. The local Docker database URL has been removed. Do not restart Docker to continue this task.

Create a dedicated database, put its connection URL into `DATABASE_URL` in the ignored `.env.local`, then run:

```sh
npm run db:migrate
```

For an environment where variables are already injected, run `node scripts/presale-migrate.mjs`. The migration is idempotent. The application does not automatically apply schema changes on requests or deploys.

## Server environment

| Name                  | Purpose                                                                                           |
| --------------------- | ------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`        | Hosted Postgres URL with TLS; use the provider's pooled URL for Vercel                            |
| `BOG_CLIENT_ID`       | Merchant Public Key from BOG Business Manager                                                     |
| `BOG_CLIENT_SECRET`   | Merchant Secret Key; server-only                                                                  |
| `PRESALE_ORIGIN`      | Exact canonical origin, e.g. `https://www.pulsefitness.ge`; preview uses its own HTTPS origin     |
| `PRESALE_ENABLED`     | `true` allows new bank checkout creation; absent/false keeps the form visible but payments closed |
| `PRESALE_ADMIN_USERNAME` | Staff login username, server-only |
| `PRESALE_ADMIN_PASSWORD_HASH` | Salted scrypt password hash (`salt:digest`), server-only |
| `PRESALE_ADMIN_TOKEN` | Random staff access token, at least 32 characters                                                 |
| `CRON_SECRET`         | Separate random token, at least 32 characters, for reconciliation                                 |
| `PRESALE_EMAIL_ENABLED` | `true` enables sending queued payment confirmations; leave false until the sender is verified |
| `RESEND_API_KEY` | Server-only Resend sending key for the verified domain |
| `PRESALE_EMAIL_FROM` | Verified sender, e.g. `Pulse Fitness <notifications@pulsefitness.ge>` |
| `PRESALE_EMAIL_STAFF_TO` | Comma-separated staff addresses; defaults to `info@pulsefitness.ge,tevzadzedavit@gmail.com` |

Never prefix secrets with `NEXT_PUBLIC_`. Configure them as encrypted Vercel environment variables. The photo-derived secret caused HTTP 401 `unauthorized_client`. On 28 September the exact credentials were read from the authenticated Business Manager portal and saved in ignored `.env.local` with owner-only file permissions. The client ID was unchanged; the secret was corrected. OAuth authentication then returned HTTP 200 with an access token. No payment was created or charged. No token or secret value is stored in these docs.

BOG confirmed in its 28 September reply (forwarded by David at 11:27 Georgian time) that Public Key is `client_id`, Secret Key is `client_secret`, and the merchant's API service is already active without additional activation. If exact copied credentials still fail, the bank contact offered to involve payment support.

For staff access, open `/admin` and sign in with the configured username and password. `PRESALE_ADMIN_USERNAME` and a salted scrypt `PRESALE_ADMIN_PASSWORD_HASH` are stored only in server environment variables; the plaintext password is not stored in source or the database. The browser receives an HttpOnly, Secure (HTTPS), SameSite=Strict session cookie for eight hours. Only a hash of the session token is stored in `presale_admin_sessions`. Sign-out revokes it; password-hash rotation also invalidates existing sessions. Login is limited to ten attempts per IP per fifteen minutes. Mutations require the configured origin.

The panel lists all website purchases, newest first, with search, status/type filters, payment amounts, bank references, paid dates, and per-recipient email status. Totals and CSV exports follow the applied filters; test revenue is shown separately from membership revenue. Keyset pagination loads older purchases without a fixed list limit. CSV exports neutralize spreadsheet formulas and are capped at 10,000 matching rows. The existing server-only `PRESALE_ADMIN_TOKEN` remains available for CLI operations; it is no longer entered into the browser UI. Refund actions remain absent.

## Payment reliability

1. The server validates the registration and selects price from its own catalogue (`lib/presale/catalog.ts`). Browser totals and discounts are ignored.
2. A pending registration and UUID request key are persisted before the bank call. The same payload/key is reused after a timeout; network errors do not mark the order failed.
3. Bank checkout receives a reference and membership description, with no card details handled by Pulse.
4. Callback signatures are verified on the original body using BOG's published RSA key. The merchant's Public Key is a client ID, not this verification key.
5. The server retrieves the current receipt under a row lock. It checks the bank order, local reference, GEL currency, and requested/processed amount before marking paid. Browser return parameters cannot confirm payment.
6. A phone-normalized unique constraint prevents concurrent first-month offer orders. Bank-confirmed failed orders release the reservation. Paid or uncertain orders do not. This is a practical duplicate guard, not verified identity; staff may need to resolve shared phones or changed numbers.
7. An essential 30-day, HTTP-only session cookie limits customer status access to the checkout browser. The reference alone cannot retrieve personal details. A lost cookie requires staff help.
8. Failed callbacks can be reconciled from the status page, the staff “Check payments & retry emails” action, or the daily Vercel cron at 04:00 UTC. Each batch handles at most 20 pending orders. The daily job does not run on Vercel previews; use the staff action there. Check failures/logs during the bank pilot.

Keep both return URLs and callback URL on the exact `PRESALE_ORIGIN` hostname. Browser redirects must not change between apex and www, or the host-only session cookie will be lost. BOG needs public HTTPS callback access; Vercel preview deployment protection must allow the callback or use an appropriate bank-testing deployment.

## Payment confirmation emails

After the first verified successful payment, the same database transaction adds a customer confirmation and a separate notification for each configured staff address to `presale_emails`. Duplicate callbacks do not create duplicate jobs. Unpaid registrations do not receive confirmation emails. Customer messages follow the checkout language (Georgian/English); staff messages are Georgian. They include the membership, amount, reference, first-visit activation and reception access-card/wristband fees. Staff notifications also include contact details. Both HTML templates use the landing page’s dark green palette, Pulse green accents and existing PNG logo, with generous vertical spacing and stacked mobile details. The PNG is served from the public website; fonts fall back to email-client-safe system fonts.

The space's forwarding records in `../Docs/04-email-forwarding.md` show that both `info@pulsefitness.ge` and the domain catch-all forward to David's Gmail. Both requested recipients are configured, so David may receive duplicate copies. Add future staff recipients to `PRESALE_EMAIL_STAFF_TO`; changes apply to newly confirmed payments, while existing jobs retain their original recipients.

Sending uses [Resend's email API](https://resend.com/docs/api-reference/emails/send-email). Connect a Resend account, verify its sending domain with the exact DNS records it supplies, and configure the environment variables above. Preserve existing ImprovMX inbound MX records. Apply `npm run db:migrate` again to create the email queue, then enable sending. Resend has verified `pulsefitness.ge` in the Ireland region and the local sender is `Pulse Fitness <notifications@pulsefitness.ge>`. A domain-restricted Sending access key is saved in ignored `.env.local` (owner-only permissions). Two clearly labelled template examples were sent at the user’s request; Resend reports both delivered. Automatic sending is enabled in the test Preview environment after verified payment. It remains disabled locally. The deployment has its own server-only key configuration.

Callbacks and customer status checks process queued emails after the response. The staff action and daily cron also process up to ten due emails per run. Failed sends are eligible for retry after five minutes. Sending failures do not undo a confirmed payment. A database lease prevents concurrent workers from claiming the same job; persisted message content and a stable idempotency key protect retries after uncertain responses.

[Resend retains idempotency keys for 24 hours](https://resend.com/docs/dashboard/emails/idempotency-keys). Uncertain attempts older than 23 hours move to `review` instead of being blindly resent. During the pilot, check email statuses and use the staff retry action promptly; the daily cron alone cannot guarantee retry within that window. For `review`, inspect Resend delivery logs before resolving the queue record or arranging a resend. Do not reset an uncertain job without checking whether the original was accepted.

The admin page displays queue status per recipient. “Accepted by email service” means the provider accepted the request, not that the message arrived in the inbox. Delivery/bounce webhooks are not implemented; check provider logs and spam folders for delivery issues. The registration and payment records remain in `presale_orders`; email payloads, attempts and provider references are stored separately in `presale_emails`.

## Verification and launch

`npm test` uses ephemeral, in-process Postgres (PGlite) and mocked bank/email responses. It starts no Docker container, database service, or persistent local database. Tests cover pricing, validation, signatures, payment matching, registration ownership, duplicate eligibility, uncertain retries, reconciliation, rate limits, CSV safety, email escaping, confirmed-payment-only queueing, duplicate callbacks, email leases, identical retry payloads and the retry review window. This does not replace hosted Postgres, bank and email end-to-end tests.

Run `npm run lint` and `npm run build` before deploying. The dependency update includes Next.js 16.3.6 and patched transitive dependencies.

Deployment/testing sequence:

1. Provision hosted Postgres and apply the migration; configure the exact BOG credentials.
2. Deploy a bank-testable HTTPS build, configure its origin and callback accessibility, then enable checkout for controlled testing.
3. Verify authentication, hosted order creation/redirect, bank-confirmed payment, failed/expired checkout and callback delivery. BOG confirmed on 28 September that the testing limit is **GEL 100 per month across all transactions**, and testing uses **real cards and real charges**. Check the remaining limit before a test; a GEL 96 membership payment would consume almost the entire monthly allowance. No card charge was performed during implementation.
4. Ask the bank to approve the working integration and remove its test limit before opening public sales. Refund work is deferred per the user, even though the original bank email lists policy requirements.

The user completed a real 2 GEL test payment successfully; the bank confirmed it and the customer plus two staff emails were accepted by Resend. On 30 September the user confirmed removal of the bank limit and authorized public sales. See the production configuration above and `final-testing.md` for historical testing evidence.

## Retired two-lari payment test

The user completed the real 2 GEL payment successfully. The test option has now been removed from checkout and server-side order creation. Existing test transactions, confirmation pages, emails and admin reporting remain available. The old `?package=test-payment` link falls back to the monthly membership. The former test-payment environment flag no longer enables purchases.

## Opening promotion deadline

The first unlimited month is 96 GEL (normally 120 GEL) through Sunday, 4 October 2026. The shared cutoff is `2026-10-05T00:00:00+04:00` (Tbilisi), or 4 October at 20:00 UTC. Dynamic server rendering supplies the promotion clock for the landing page and checkout; open tabs hide the offer and update pricing at the deadline or when brought back into focus. New registrations use server-calculated prices and must match the price the customer saw. An expired quote returns HTTP 409 `price`, without creating a payment. Existing receipts retain their agreed amounts. A discounted checkout that has already been issued by BOG can finish within its existing 15-minute validity; unissued discounted orders cannot start after the cutoff.

The first-month uniqueness rule now applies only to discounted monthly orders, preserving one offer per phone while allowing regular-price purchases after the campaign. Applied migration to the hosted test database. Terms version is now `2026-09-29`. No production deployment was made.

## Admin workspace

The staff dashboard is now at `/admin`; `/presale/admin` permanently redirects there (308). UI components and styling live under `components/admin/`, separate from the public checkout shell. Existing authentication and protected presale API endpoints are unchanged, so the same credentials and sessions continue to work.

The workspace shows filtered membership revenue, paid/pending/review counts, searchable purchase history, CSV export and a transaction detail drawer with customer, bank and per-recipient email details. Test payments are labelled and excluded from membership revenue. “Accepted” email statuses refer to provider acceptance. Reconciliation and email retries remain an explicit staff action.
