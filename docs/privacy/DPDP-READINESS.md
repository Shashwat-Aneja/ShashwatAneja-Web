# DPDP readiness register | shashwataneja.com

**Reviewed:** 10 November 2026  
**Status:** Work in progress. Not a compliance certification or full penetration test.  
**Scope:** Personal portfolio at the apex domain, not Studio, Dashboard or any other subdomain.

## Verified from repository
- Static site, no visitor login, no server-side contact form and no site-operated payment flow in reviewed HTML/JS.
- Browser-local settings: `shashwat-theme` and `shashwat-privacy-notice-seen`.
- Image Lab reads user-selected files into browser canvas; reviewed implementation has no upload endpoint.
- No external executable script URLs in the inspected page source. Project archive executable inline JS was moved into a same-origin JS file.
- Privacy notice has a contact route and rights/grievance instructions.
- CSP meta is installed on examined HTML pages. Its effect must be checked in a real browser.
- `_headers` is **conditional**: it only takes effect in Cloudflare Pages static-asset deployments. Cloudflare DNS alone does not enable it.

## New verified provider findings (10 November 2026)
- The connected Gmail account contains multiple messages addressed to `connect@shashwataneja.com`, including messages received on 9 November 2026. This supports working inbound delivery to that mailbox; it does **not** prove all senders and privacy requests will be delivered, and does not identify the domain's MX or forwarding service.
- Resend lists a verified outbound-only sending domain `mail.shashwataneja.com`, with sending enabled, receiving disabled, and click/open tracking disabled. Verified DKIM and SPF records relate to that **sending subdomain**. Do not mistake this for receiving or a confirmed part of the portfolio's data processing; its usage may relate to other services.
- Vercel's linked account returned no project connected to `ShashwatAneja-Web` and rejected access to the apex domain (403). Vercel's unauthenticated domain-configuration query identifies Cloudflare nameservers and Cloudflare IPs. This is **not evidence of a Vercel site misconfiguration** because this apex domain is not controlled through the accessible Vercel account.
- Direct GET/HEAD requests to the public domain could not be completed from the assistant's execution environment. GitHub Actions now performs an independent read-only production audit and records whether the live source and headers are verifiable. Review its results before changing severity or asserting deployment.

## Not yet verified
| Control or data flow | Evidence needed | Owner action |
| --- | --- | --- |
| Origin hosting / deployment pipeline | Hosting dashboard, domain attachment, production deployment/version | Identify source of truth for production |
| HTTP headers, TLS and redirects | Fresh HTTP response and independent TLS scan | Check CSP, X-Frame-Options, HSTS, nosniff, HTTPS |
| Cloudflare zone settings | HTTPS mode, cache, bot protection, WAF, access accounts | Audit relevant zone |
| Hosting security logs | Whether IP/request logs exist; purpose, access, region, retention | Obtain provider settings and contractual terms |
| Email provider for connect@ address | Recent incoming messages were confirmed in a connected Google Gmail inbox on 9 November 2026; upstream forwarding/MX routing, deletion, backups and mailbox MFA are unverified | Verify provider configuration and retention |
| MFA and privilege separation | Host, GitHub, DNS, email account security settings | Enable MFA or passkeys, revoke unused access |
| Backups and incident readiness | Recovery test and evidence/notification route | Test without personal data |
| Data processor contracts | Applicable provider terms and safeguards | Review where DPDP applies |
| Data subject rights process | Working mailbox, identity checks and private tracking | Test with a controlled request |
| Production privacy text | Live origin content vs GitHub branch | Confirm merge actually reaches production |

## Working data inventory (reconcile with providers before relying on it)
| Processing context | Potential data | Stated purpose | Storage / processor | Retention |
| --- | --- | --- | --- | --- |
| Page delivery and abuse prevention | IP address, user agent, requested path, timing | Serve site, prevent misuse | Cloudflare network and **unverified origin host** | **Unknown; verify** |
| Visitor email | Sender email/name, message, attachments | Respond to inquiry | **Google Gmail inbox verified for the published contact address; forwarding route unknown** | **Unknown; define and verify** |
| Theme choice | Theme identifier | Remember site appearance | Visitor's localStorage | Until cleared or overwritten |
| Privacy notice dismissal | Dismissal flag | Avoid re-showing notice | Visitor's localStorage | Until cleared |
| Image Lab | User-selected image pixels and displayed filename | Local image processing | Browser canvas/object URL; reviewed code shows no upload | During page session; file not intentionally retained server-side |
| External profile links | Browser navigation to external service | User-directed navigation | Destination provider | Governed by provider's practices |

**Important:** Do not publish personal correspondence or DSAR records in this public repo. Use access-controlled, minimal internal records.

## Applicability and deadlines
The DPDP Act, 2023 and notified DPDP Rules, 2025 have phased commencement. Principal processing, rights and safeguards provisions are scheduled for **13 May 2027** (18 months after Gazette publication, 13 November 2025). Applicability depends on facts, including whether an activity is personal/domestic and the nature of processing. Do not assert a blanket exemption for a professional portfolio.

When applicable, review requirements for itemised notices, processing basis, individual rights including nomination, protective safeguards, processor terms, breach communication and retention. Rules 6 and 8 contain one-year retention provisions in specified circumstances; avoid asserting that all logs can be deleted immediately or that every record must always be retained one year. Obtain legal advice for the actual processing and exceptions.

Official rules: https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf

## Next steps before asserting compliance
1. Verify which provider actually deploys shashwataneja.com. Review the live-audit GitHub Actions report for the production site's privacy HTML, TLS, DNS, and response headers. Ensure production carries latest privacy HTML and security headers.
2. Inspect browser DevTools > Network with a clean profile for cookies, analytics, cross-origin requests, CSP violations and local storage.
3. Inspect Cloudflare zone access, DNS, encryption mode, HTTPS redirect, caching and security rules; do not purge or alter unrelated subdomains without review.
4. Verify domain-email provider, receiving mailbox, SPF/DKIM/DMARC and retention settings.
5. Enforce MFA/passkeys for DNS, hosting, code repository and email accounts; record owner/recovery controls privately.
6. Test the deletion/rights inbox and incident workflow with non-personal test data.
7. Conduct a separate review for Studio and Dashboard. Repeat review on every change that adds analytics, forms, auth or third-party embeds.
