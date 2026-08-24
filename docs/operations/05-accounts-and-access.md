# Accounts and access

This file records identities and ownership boundaries, not credentials.

## Provider ownership map

| Service | Resource | Identity/account observed | Access purpose |
|---|---|---|---|
| GitHub | `zikosichi/pulse-fitness` | Owner namespace `zikosichi` | Source control and Git integration |
| Vercel | Team `zikosichi's projects`, project `pulse-fitness` | Browser session observed as `zviadsichinava@gmail.com`; Vercel profile/team shown as `zikosichi` | Builds, deployments, domains, logs, rollback |
| ge.domains | `pulsefitness.ge` | `tevzadzedavit@gmail.com` | Registration, renewal, nameservers, authoritative DNS |
| ImprovMX | `pulsefitness.ge` | `tevzadzedavit@gmail.com` | Incoming-email aliases and delivery logs |
| Gmail | Forwarding destination | `tevzadzedavit@gmail.com` | Receives `info@pulsefitness.ge` mail |
| Cloudflare | Historical zone | Account/zone exists or existed; not authoritative | Do not use for current DNS unless nameservers change |

## Direct links

### GitHub

- Repository: [`https://github.com/zikosichi/pulse-fitness`](https://github.com/zikosichi/pulse-fitness)
- Commits: [`https://github.com/zikosichi/pulse-fitness/commits/main`](https://github.com/zikosichi/pulse-fitness/commits/main)
- Branches: [`https://github.com/zikosichi/pulse-fitness/branches`](https://github.com/zikosichi/pulse-fitness/branches)

### Vercel

- Project: [`https://vercel.com/zikosichis-projects/pulse-fitness`](https://vercel.com/zikosichis-projects/pulse-fitness)
- Deployments: [`https://vercel.com/zikosichis-projects/pulse-fitness/deployments`](https://vercel.com/zikosichis-projects/pulse-fitness/deployments)
- Git settings: [`https://vercel.com/zikosichis-projects/pulse-fitness/settings/git`](https://vercel.com/zikosichis-projects/pulse-fitness/settings/git)
- Build settings: [`https://vercel.com/zikosichis-projects/pulse-fitness/settings/build-and-deployment`](https://vercel.com/zikosichis-projects/pulse-fitness/settings/build-and-deployment)
- Domains: [`https://vercel.com/zikosichis-projects/pulse-fitness/settings/domains`](https://vercel.com/zikosichis-projects/pulse-fitness/settings/domains)
- Environment variables: [`https://vercel.com/zikosichis-projects/pulse-fitness/settings/environment-variables`](https://vercel.com/zikosichis-projects/pulse-fitness/settings/environment-variables)

### Domain and email

- ge.domains manager: [`https://ge.domains/profile/domain-manager/manage/pulsefitness.ge`](https://ge.domains/profile/domain-manager/manage/pulsefitness.ge)
- ImprovMX aliases: [`https://app.improvmx.com/domains/pulsefitness.ge/aliases`](https://app.improvmx.com/domains/pulsefitness.ge/aliases)
- ImprovMX DNS status: [`https://app.improvmx.com/domains/pulsefitness.ge/dns`](https://app.improvmx.com/domains/pulsefitness.ge/dns)
- ImprovMX logs: [`https://app.improvmx.com/domains/pulsefitness.ge/logs`](https://app.improvmx.com/domains/pulsefitness.ge/logs)

## Authentication boundaries

An agent may navigate dashboards and prepare changes, but the human owner must handle passwords, passkeys, Google sign-in challenges, 2FA, CAPTCHAs, recovery codes, and payment confirmation.

Never ask a human to paste a password or one-time code into chat. Let the human enter it directly in the provider UI.

## Secret storage rules

- `.env*` is ignored by Git in the active repository.
- `.vercel` is ignored by Git.
- There are currently no project environment variables in Vercel.
- No provider passwords or API keys are required by the current code.
- If secrets are introduced, store Production/Preview/Development values in Vercel and use `.env.local` locally.
- Document variable **names and purpose**, never secret values.
- Rotate any credential immediately if it appears in a commit, issue, screenshot, or chat.

## Git authentication note

The local `gh` CLI reported a stale/invalid token for account `zikosichi` on 2026-08-20. This does not change the Git remote and does not necessarily mean ordinary `git push` credentials are invalid. If GitHub API/PR work is needed, reauthenticate `gh` interactively rather than storing a token in the repository.

## Legacy and confusing identities

- A workspace bookmark points to `tevzadzedavit-coder/tskaltubofitness`. It is an older/unrelated repository for current deployment purposes.
- The active GitHub source is `zikosichi/pulse-fitness`.
- Vercel project name is `pulse-fitness`, while its stable generated hostname is `pulse-fitness-rust.vercel.app`.
- Cloudflare may display a zone and DNS records, but authority remains with ge.domains while the public nameservers are `ns1.ge.domains` and `ns2.ge.domains`.

## Ownership handoff checklist

Before changing staff or contractors, confirm the business has durable access to:

1. GitHub repository owner/collaborator settings.
2. Vercel team and project.
3. ge.domains account, recovery email, 2FA, and renewal payment method.
4. ImprovMX account and recovery email.
5. Destination Gmail account, 2FA, and recovery methods.
6. Any Cloudflare account retained for historical reasons.

Do not transfer the domain, Vercel project, or repository during an active incident unless ownership loss is the incident itself.

