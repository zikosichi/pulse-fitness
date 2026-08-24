# Operations runbooks

## Routine website change

1. Work in `pulse-web/`.
2. Read `AGENTS.md` and the repository README.
3. Pull the latest `main` with a fast-forward-only pull.
4. Create a branch unless an immediate direct production push is explicitly intended.
5. Make the smallest scoped change.
6. Run:

   ```bash
   npm ci
   npm run lint
   npm run build
   ```

7. Review `git diff` and ensure no secrets, `.env`, `.vercel`, generated `.next`, or unrelated assets are included.
8. Commit and push the branch.
9. Review the Vercel Preview deployment.
10. Merge to `main` and monitor the Production deployment.
11. Smoke-test both public hostnames and any changed behavior.

## Content/contact update

- Site copy: edit `lib/content.ts`.
- Phone, email, address, map, or social links: edit `lib/config.ts`.
- Canonical URL behavior: inspect `lib/seo.ts` and Vercel domain settings together.
- Do not edit legacy configuration in `Website Code/` or `Site/`.

After changing public business details, inspect JSON-LD in `app/layout.tsx`, because it derives from `lib/config.ts`.

## Bad production deployment

1. Confirm the failure is the deployment and not DNS.
2. Record the bad commit SHA and deployment URL.
3. Choose:
   - Git revert and push the revert to `main`; or
   - Promote/redeploy the previous known-good Vercel deployment, followed immediately by a Git reconciliation.
4. Verify `www`, apex redirect, assets, and logs.
5. Add a brief incident note to this handbook if the failure teaches a reusable lesson.

## Website unreachable

1. Open `https://pulse-fitness-rust.vercel.app`.
   - If it fails, inspect Vercel deployment status/logs.
   - If it works, the application is probably healthy and custom-domain/DNS routing is the likely issue.
2. Run:

   ```bash
   dig +short NS pulsefitness.ge
   dig +short A pulsefitness.ge
   dig +short CNAME www.pulsefitness.ge
   curl -I https://pulsefitness.ge
   curl -I https://www.pulsefitness.ge
   ```

3. Compare results with `03-domains-and-dns.md`.
4. Check Vercel Domains.
5. Make DNS changes only at the provider named by the public NS response.
6. Do not remove email MX/TXT records while repairing website A/CNAME records.

## Email not arriving

1. Test from an account different from `tevzadzedavit@gmail.com`.
2. Check Gmail Spam and All Mail.
3. Run `dig +short MX pulsefitness.ge`.
4. Confirm ImprovMX status `Active` and all DNS check marks.
5. Check ImprovMX Logs for the test sender/subject.
6. If ImprovMX forwarded successfully, troubleshoot Gmail filtering.
7. If ImprovMX has no record, wait for recent DNS caches or investigate the sender.
8. Do not repeatedly replace working MX records.

## Change forwarding destination

1. Confirm the new destination address with the business owner.
2. In ImprovMX, edit both the `info` alias and catch-all if both should change.
3. Save and verify the displayed destination.
4. Send a test from a third-party account.
5. MX/SPF records normally remain unchanged.
6. Update this handbook and any account-handoff documentation.

## Remove the catch-all

This is a deletion and must be explicitly approved.

1. Confirm `info@pulsefitness.ge` has the correct destination.
2. Delete only `*@pulsefitness.ge` from ImprovMX.
3. Keep `info@pulsefitness.ge`.
4. Test `info@` again.
5. Confirm a random undefined address now bounces rather than forwards.

## Domain renewal

1. Start renewal checks at least 30 days before 15 March 2027.
2. Log in to ge.domains with the owner identity.
3. Verify contact/recovery email and renewal payment details.
4. Renew without changing nameservers or DNS records.
5. Re-check the registrar's new expiration date.
6. Record the new date in `05-accounts-and-access.md` and `07-current-state-and-risks.md`.

## Deliberate DNS-provider migration

1. Export/copy every current record.
2. Recreate the full zone at the destination provider.
3. Include Vercel A/CNAME and ImprovMX MX/TXT records.
4. Lower TTL in advance if the current provider allows it.
5. Validate the new provider's zone before switching nameservers.
6. Change nameservers at ge.domains only after explicit approval.
7. Verify web, redirect, TLS, email delivery, SPF, and provider dashboards.
8. Keep the old zone intact until caches have expired and rollback is no longer needed.

## Quarterly operational check

- `main` builds successfully.
- Vercel Production deployment is Ready.
- `www.pulsefitness.ge` is the Vercel primary domain.
- Apex redirects to `www`.
- Public NS, A, CNAME, MX, and TXT match the documented table.
- ImprovMX is Active and a third-party test arrives.
- ge.domains renewal date and owner recovery access are valid.
- GitHub and Vercel have at least one current business-approved owner.
- No secrets have entered Git history.
- This handbook still matches reality.

