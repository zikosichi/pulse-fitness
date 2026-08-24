# Current state and known risks

Snapshot date: **2026-08-20, Asia/Tbilisi**

## Verified healthy

- Local repository `main` matched `origin/main` before this documentation change.
- Active Git remote is `https://github.com/zikosichi/pulse-fitness.git`.
- GitHub repository is public and has `main` as the default branch.
- Latest inspected commit `5a1786a` had a successful status check.
- Vercel project `pulse-fitness` is connected to `zikosichi/pulse-fitness`.
- Vercel Production tracks `main`.
- Latest inspected Vercel deployment for `5a1786a` was `Ready` and Production.
- `www.pulsefitness.ge` showed Valid Configuration in Vercel.
- `pulse-fitness-rust.vercel.app` showed Valid Configuration.
- Apex `pulsefitness.ge` was publicly resolving to `76.76.21.21` and redirecting to `www`.
- `www` was publicly resolving to the project-specific Vercel CNAME.
- Public MX lookup returned both ImprovMX servers with priorities 10 and 20.
- Public TXT lookup returned the ImprovMX SPF record.
- ImprovMX reported `pulsefitness.ge` as Active and verified MX/SPF.
- `info@pulsefitness.ge` was configured to forward to `tevzadzedavit@gmail.com`.

## Known operational risks and gaps

### 1. No repository-owned CI

There is no GitHub Actions workflow. Vercel's build is the only automated gate. A bad direct push to `main` can reach Production if it compiles.

Recommended future action: add GitHub Actions lint/build and require it before merge.

### 2. No automated test suite

`package.json` has no test script. Interactions and visual behavior require manual or browser testing.

### 3. Branch protection not confirmed

The public GitHub view did not expose repository rules. Do not assume `main` requires pull requests or checks.

### 4. Apex DNS warning in Vercel

Vercel marks `pulsefitness.ge` as DNS Change Recommended because it uses the supported legacy `76.76.21.21` apex record. It was working when verified.

Do not change it during unrelated work. If upgrading, use the exact record Vercel shows for this project at that time.

### 5. SEO canonical differs from Vercel primary

Vercel's primary domain is `https://www.pulsefitness.ge`, but `lib/seo.ts` defaults to `https://pulsefitness.ge` because no `NEXT_PUBLIC_SITE_URL` is configured. The default canonical therefore points to an apex URL that permanently redirects to `www`.

Recommended future action: decide the canonical hostname and, if `www` remains primary, set `NEXT_PUBLIC_SITE_URL=https://www.pulsefitness.ge` in Vercel for Production/Preview as appropriate, then redeploy and verify metadata, robots, and sitemap.

### 6. Catch-all email alias

ImprovMX automatically configured `*@pulsefitness.ge` to the destination Gmail account. Undefined addresses will forward and can increase spam.

Recommended action: keep it only if the business wants catch-all behavior; otherwise remove it after explicit approval.

### 7. Receive-only email

The free ImprovMX setup receives/forwards mail but does not provide a normal mailbox or free authenticated SMTP sending from `info@pulsefitness.ge`.

### 8. No documented DKIM/DMARC

The domain is receive/forward-only. Before sending as `info@`, select a sending provider and add its exact DKIM plus a deliberate DMARC policy.

### 9. Cloudflare confusion risk

A historical Cloudflare zone can look authoritative even though ge.domains nameservers currently control the public zone. Always verify NS before editing DNS.

### 10. Legacy projects remain in the Space

`Website Code/` and `Site/` can mislead a new agent. They are not deployment sources.

### 11. Public internal lab routes

`/lab` and `/lab/buttons` are in the deployed Next.js app. Decide whether they are intended to remain publicly reachable.

### 12. Vercel environment variables are empty

This is currently valid because the code has a canonical-URL fallback and no secrets. Revisit if APIs, analytics, a CMS, or a sending provider are introduced.

### 13. Stale GitHub CLI authentication

`gh auth status` reported an invalid token for `zikosichi`. Reauthenticate interactively before relying on GitHub CLI API operations.

### 14. Deployment retention

Vercel deployment retention is enabled, so old deployments may be removed. Git history remains the durable source for rebuilding old states.

## Facts that require periodic re-verification

- Domain expiration date
- Provider account ownership and recovery access
- Vercel project/team membership
- GitHub branch rules
- DNS values and nameservers
- Vercel Node.js version and build defaults
- Email aliases and forwarding destination
- Plan limits/pricing for Vercel and ImprovMX
- Latest known-good Production commit

