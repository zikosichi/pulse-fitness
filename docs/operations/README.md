# Pulse Fitness operations handbook

Last verified: **2026-08-20 (Asia/Tbilisi)**

This folder is the operational source of truth for the live Pulse Fitness website, deployment pipeline, domains, DNS, and email forwarding. It is written so a new human or agent can pick up the system without relying on prior chat history.

Do not put passwords, one-time codes, recovery codes, API tokens, or private keys in this repository. Account names and public infrastructure identifiers are documented; authentication secrets are not.

## Current state at a glance

| Area | Current source of truth |
|---|---|
| Active application | This repository (`pulse-web`) |
| GitHub | [`zikosichi/pulse-fitness`](https://github.com/zikosichi/pulse-fitness), public repository |
| Production branch | `main` |
| CI/CD | Vercel Git integration; every `main` commit builds and deploys to Production |
| Vercel project | Team `zikosichi's projects`, project `pulse-fitness` |
| Vercel project ID | `prj_6B8Ax4cpMFJsq9Gs5NV5Rx1cfqSE` |
| Primary public URL | [`https://www.pulsefitness.ge`](https://www.pulsefitness.ge) |
| Apex behavior | `https://pulsefitness.ge` returns a permanent `308` redirect to `https://www.pulsefitness.ge/` |
| Vercel fallback URL | [`https://pulse-fitness-rust.vercel.app`](https://pulse-fitness-rust.vercel.app) |
| Registrar and authoritative DNS | [ge.domains](https://ge.domains), `ns1.ge.domains` and `ns2.ge.domains` |
| Incoming email provider | [ImprovMX](https://app.improvmx.com), free forwarding plan |
| Public email | `info@pulsefitness.ge` |
| Forwarding destination | `tevzadzedavit@gmail.com` |
| Email status | ImprovMX domain status `Active`; MX and SPF verified |

## Source-of-truth order

When two places disagree, use this order:

1. `pulse-web/` in this repository is the active application.
2. GitHub `zikosichi/pulse-fitness`, branch `main`, is the deployable code history.
3. Vercel project `pulse-fitness` is the production build and hosting state.
4. ge.domains is the authoritative DNS state because the public nameservers are `ns1.ge.domains` and `ns2.ge.domains`.
5. ImprovMX is the incoming-email routing state.
6. Cloudflare is historical/non-authoritative unless the nameservers are deliberately changed in the future.

The workspace-root folders `Website Code/` and `Site/` are old implementations. Do not deploy or copy from them. The old bookmarked GitHub repository `tevzadzedavit-coder/tskaltubofitness` is not the active repository.

## Read these next

- [01-system-map.md](./01-system-map.md) — application architecture and workspace map
- [02-ci-cd-and-deployments.md](./02-ci-cd-and-deployments.md) — GitHub, checks, Vercel builds, previews, production, and rollback
- [03-domains-and-dns.md](./03-domains-and-dns.md) — authoritative DNS, exact records, redirects, and Cloudflare history
- [04-email-forwarding.md](./04-email-forwarding.md) — `info@`, ImprovMX, testing, limitations, and troubleshooting
- [05-accounts-and-access.md](./05-accounts-and-access.md) — provider ownership, login identities, links, and secret-handling rules
- [06-runbooks.md](./06-runbooks.md) — routine changes, outages, recovery, and handoff procedures
- [07-current-state-and-risks.md](./07-current-state-and-risks.md) — dated verification snapshot and unresolved operational risks

## Golden rules for agents

1. Read `AGENTS.md` before changing Next.js code.
2. Work inside `pulse-web/`, not from the workspace root and not in either legacy implementation.
3. Run `npm run lint` and `npm run build` before pushing.
4. A push to `main` is a production deployment. Treat it accordingly.
5. Never replace or delete DNS records without first recording the current full DNS table.
6. Preserve the Vercel `A` and `CNAME` records when changing email records; preserve the ImprovMX `MX` and `TXT` records when changing website records.
7. Test forwarding from an address different from the destination Gmail account.
8. Never store authentication secrets in code, documentation, issues, commits, or chat transcripts.

