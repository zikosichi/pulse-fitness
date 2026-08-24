# Domains and DNS

## Ownership and authority

- Domain: `pulsefitness.ge`
- Registrar: [ge.domains](https://ge.domains)
- Registrar manager: [`https://ge.domains/profile/domain-manager/manage/pulsefitness.ge`](https://ge.domains/profile/domain-manager/manage/pulsefitness.ge)
- Registrar account identity observed: `tevzadzedavit@gmail.com`
- Registration date shown by ge.domains: 14 March 2026
- Expiration/shutoff date shown by ge.domains: 15 March 2027
- Authoritative nameservers:
  - `ns1.ge.domains`
  - `ns2.ge.domains`

The public nameservers decide which DNS dashboard matters. At the time of verification, ge.domains is authoritative.

## Exact current DNS records

| Type | Host/name | Value/target | Priority | TTL |
|---|---|---|---:|---:|
| SOA | `pulsefitness.ge` | Managed by ge.domains | — | 300 |
| A | `pulsefitness.ge` | `76.76.21.21` | — | 300 |
| CNAME | `www.pulsefitness.ge` | `32657445e753044a.vercel-dns-017.com` | — | 300 |
| MX | `pulsefitness.ge` | `mx1.improvmx.com` | 10 | 300 |
| MX | `pulsefitness.ge` | `mx2.improvmx.com` | 20 | 300 |
| TXT | `pulsefitness.ge` | `v=spf1 include:spf.improvmx.com ~all` | — | 300 |

The ge.domains table does not visibly show MX priority in its summary row, but the add form stores it and ImprovMX verified priorities 10 and 20.

## Website routing

```text
pulsefitness.ge
  A 76.76.21.21
  -> Vercel
  -> HTTP 308 to https://www.pulsefitness.ge/

www.pulsefitness.ge
  CNAME 32657445e753044a.vercel-dns-017.com
  -> Vercel Production project pulse-fitness
```

Vercel reports `www.pulsefitness.ge` as **Valid Configuration**. It reports **DNS Change Recommended** for the apex because `76.76.21.21` is the supported legacy apex record rather than Vercel's newer project-specific recommendation. The apex was publicly resolving and redirecting correctly when verified; the warning is not an outage.

If replacing the legacy apex value later, copy the exact replacement shown by Vercel at that time. Do not guess a new target from documentation or another project.

## Email routing

```text
info@pulsefitness.ge
  -> MX priority 10 mx1.improvmx.com
  -> MX priority 20 mx2.improvmx.com
  -> ImprovMX
  -> tevzadzedavit@gmail.com
```

Website and email records coexist in the same authoritative ge.domains DNS zone. Changing one group must not remove the other.

## Cloudflare history and warning

A Cloudflare zone exists or existed for this domain and was initially assumed to be authoritative. It was not authoritative after public verification because the domain delegated to `ns1.ge.domains` and `ns2.ge.domains`.

Consequences:

- Editing only the Cloudflare DNS dashboard currently has no public effect.
- Do not delete the working ge.domains records because matching records appear in Cloudflare.
- Do not switch nameservers to Cloudflare casually. A nameserver change moves authority for the entire zone and can break both the website and email.
- If a deliberate move to Cloudflare is ever approved, first reproduce **all** A, CNAME, MX, TXT, and any future verification records in Cloudflare, verify them, then change nameservers.

## Public verification commands

```bash
dig +short NS pulsefitness.ge
dig +short A pulsefitness.ge
dig +short CNAME www.pulsefitness.ge
dig +short MX pulsefitness.ge
dig +short TXT pulsefitness.ge
curl -I https://pulsefitness.ge
curl -I https://www.pulsefitness.ge
```

Expected important values:

```text
ns1.ge.domains.
ns2.ge.domains.
76.76.21.21
32657445e753044a.vercel-dns-017.com.
10 mx1.improvmx.com.
20 mx2.improvmx.com.
"v=spf1 include:spf.improvmx.com ~all"
```

The exact order returned by `dig MX` may vary.

## Safe DNS-change procedure

1. Capture the entire current zone before editing.
2. Identify the authoritative nameservers with `dig NS`.
3. Confirm whether the change is for website routing, email routing, or ownership verification.
4. Add or edit only the required record.
5. Keep TTL at 300 during a migration unless there is a specific reason not to.
6. Verify through a public resolver, not only the registrar table.
7. Verify Vercel domain status or ImprovMX domain status as appropriate.
8. Test the public service end to end.
9. Record the change in this handbook.

## Migration history

On 2026-08-20:

- The old website records pointing the apex and `www` at `75.2.60.5` were replaced.
- The apex was connected to Vercel with `A 76.76.21.21`.
- `www` was connected with the Vercel project-specific CNAME.
- Vercel was configured so the apex redirects permanently to `www`.
- ImprovMX MX and SPF records were added for free incoming-email forwarding.
- Public DNS and both Vercel and ImprovMX dashboards were verified.

