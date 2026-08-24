# Email forwarding

## What the email service is

`info@pulsefitness.ge` is an **email-forwarding alias**, not a hosted mailbox.

```text
Sender
  -> info@pulsefitness.ge
  -> ImprovMX
  -> tevzadzedavit@gmail.com
```

There is no separate webmail inbox, IMAP account, mailbox storage, or password for `info@pulsefitness.ge`.

## Provider and account

- Provider: [ImprovMX](https://app.improvmx.com)
- Plan: Free forwarding plan
- ImprovMX login identity: `tevzadzedavit@gmail.com`
- Domain dashboard: [`https://app.improvmx.com/domains/pulsefitness.ge/aliases`](https://app.improvmx.com/domains/pulsefitness.ge/aliases)
- DNS status: [`https://app.improvmx.com/domains/pulsefitness.ge/dns`](https://app.improvmx.com/domains/pulsefitness.ge/dns)
- Delivery logs: [`https://app.improvmx.com/domains/pulsefitness.ge/logs`](https://app.improvmx.com/domains/pulsefitness.ge/logs)
- Domain state verified: `Active`

## Current aliases

| Alias | Destination | Notes |
|---|---|---|
| `info@pulsefitness.ge` | `tevzadzedavit@gmail.com` | Public business address requested for the website |
| `*@pulsefitness.ge` | `tevzadzedavit@gmail.com` | Catch-all created automatically by ImprovMX |

The catch-all means any otherwise undefined address at the domain also forwards to Gmail. This is convenient for typo tolerance but can attract more spam. If the business wants only `info@`, remove the catch-all in ImprovMX after explicit approval.

## DNS required for forwarding

| Type | Host | Value | Priority | TTL |
|---|---|---|---:|---:|
| MX | `pulsefitness.ge` | `mx1.improvmx.com` | 10 | 300 |
| MX | `pulsefitness.ge` | `mx2.improvmx.com` | 20 | 300 |
| TXT | `pulsefitness.ge` | `v=spf1 include:spf.improvmx.com ~all` | — | 300 |

ImprovMX showed check marks for both MX records and the SPF record after public propagation.

## Normal delivery time

After DNS is active, forwarding is normally measured in seconds or a few minutes. During a fresh DNS change, caches can delay recognition; the current TTL is 300 seconds, but some resolvers and sender systems may take longer.

Gmail may classify the first forwarded messages as Spam. The ImprovMX account-activation email itself initially arrived in Spam, so Spam and All Mail must be checked during testing.

## Correct way to test

1. Send from an external address that is **not** `tevzadzedavit@gmail.com`.
2. Send to `info@pulsefitness.ge`.
3. Wait a few minutes.
4. Check Gmail Inbox, Spam, Promotions, and All Mail.
5. Open ImprovMX Logs and locate the message.

Do not rely on sending from the destination Gmail account to its own forwarding alias. Gmail can suppress, thread, or hide apparent self-delivery/duplicate messages, making a working forward look broken.

## Troubleshooting: mail not received

Work in this order:

1. **Check public MX records**

   ```bash
   dig +short MX pulsefitness.ge
   ```

   Expect both ImprovMX servers with priorities 10 and 20.

2. **Check ImprovMX domain status**

   Open the DNS page and confirm `Active` and check marks for both MX records and SPF.

3. **Check ImprovMX Logs**

   - No log entry: the sender may not have reached ImprovMX, may still be using cached DNS, or may have rejected the address before delivery.
   - Accepted/forwarded entry: focus on Gmail spam/filtering.
   - Rejected/bounced entry: read the provider reason before changing DNS.

4. **Check Gmail thoroughly**

   Search `to:tevzadzedavit@gmail.com` plus the sender or subject, then inspect Spam and All Mail.

5. **Retest from a different sender**

   Use another Gmail/Outlook account or a business account. Avoid testing from the forwarding destination itself.

6. **Wait for cache expiry only when DNS was recently changed**

   Do not repeatedly change correct MX records; that resets the troubleshooting baseline.

## Receiving versus sending

The free setup solves **incoming mail only**.

If someone replies normally in Gmail, the From address is usually `tevzadzedavit@gmail.com`, not `info@pulsefitness.ge`. Sending or replying as `info@pulsefitness.ge` requires one of these future options:

- Paid ImprovMX SMTP service
- A paid hosted mailbox (Google Workspace, Namecheap Private Email, mailbox.ge, etc.)
- Another authenticated SMTP provider configured in Gmail's “Send mail as” settings

Do not configure unauthenticated “Send mail as” behavior; it can fail SPF/DKIM/DMARC and land in spam.

No DKIM or DMARC record is currently documented because the domain is receive/forward-only. Add provider-specific DKIM and a deliberate DMARC policy before sending business mail from the domain.

## Security and privacy

- Never store the ImprovMX password in this repository.
- Never publish activation links, password-reset links, or one-time codes.
- Keep the destination Gmail account secured with 2FA and recovery methods.
- Review ImprovMX logs only for troubleshooting; do not copy customer message content into tickets or documentation.
- If the forwarding destination changes, update the alias in ImprovMX. MX records normally remain unchanged.

