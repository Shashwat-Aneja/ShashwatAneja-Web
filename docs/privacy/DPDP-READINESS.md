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
- `_headers` does not apply to the current production origin: GitHub Pages, confirmed through the GitHub Pages API. Host-specific Cloudflare edge rules are needed for header protections.

## New verified provider findings (10 November 2026)
- The connected Gmail account contains multiple messages addressed to `connect@shashwataneja.com`, including messages received on 9 November 2026. This supports working inbound delivery to that mailbox; it does **not** prove all senders and privacy requests will be delivered, and alone would not identify the domain's MX or forwarding service. The external DNS audit separately confirmed Cloudflare Email Routing MX records.
- Resend lists a verified outbound-only sending domain `mail.shashwataneja.com`, with sending enabled, receiving disabled, and click/open tracking disabled. Verified DKIM and SPF records relate to that **sending subdomain**. Do not mistake this for receiving or a confirmed part of the portfolio's data processing; its usage may relate to other services.
- Vercel's linked account returned no project connected to `ShashwatAneja-Web` and rejected access to the apex domain (403). Vercel's unauthenticated domain-configuration query identifies Cloudflare nameservers and Cloudflare IPs. This is **not evidence of a Vercel site misconfiguration** because this apex domain is not controlled through the accessible Vercel account.
- Direct GET/HEAD requests from the assistant's execution environment failed, so the GitHub Actions runner was used instead. On 10 November 2026 it verified: HTTPS page and certificate (TLS 1.3), the latest privacy policy, the current homepage notice and security.txt live on the production domain. It also confirmed HTTP returns 200 without HTTPS redirect and there are no CSP, HSTS, nosniff, framing or Referrer-Policy response headers. The HTML CSP is live.
- The GitHub Pages API confirms that `ShashwatAneja-Web` publishes `main` from repository root, custom domain `shashwataneja.com`, with `https_enforced: false` and status `built`.
- Public DNS MX records are `route1.mx.cloudflare.net`, `route2.mx.cloudflare.net` and `route3.mx.cloudflare.net`, supporting Cloudflare Email Routing as the inbound provider. SPF and DMARC TXT records were detected; strength and applicability need interpretation.

## Confirmed weaknesses and remaining account-level verification
| Control or data flow | Evidence needed | Owner action |
| --- | --- | --- |
| Origin hosting / deployment pipeline | **Verified GitHub Pages (main, /) with Cloudflare as edge**; actual Cloudflare zone account access remains unavailable | Audit Cloudflare zone settings and deployment cache |
| HTTP headers, TLS and redirects | **Verified live defect**: HTTP 200 without HTTPS redirect; missing CSP header, clickjacking header, HSTS, nosniff, Referrer-Policy; valid HTTPS/TLS 1.3 and HTML CSP | Deploy and verify apex-only Cloudflare rules in `CLOUDFLARE-EDGE-REMEDIATION.md` |
| Cloudflare zone settings | HTTPS mode, cache, bot protection, WAF, access accounts | Audit relevant zone |
| Hosting security logs | Whether IP/request logs exist; purpose, access, region, retention | Obtain provider settings and contractual terms |
| Email provider for connect@ address | Google Gmail inbox receiving verified; Cloudflare Email Routing verified via public MX; exact forwarding-rule settings, deletion, backups and mailbox MFA unverified | Audit routing and retention in service dashboards |
| MFA and privilege separation | Host, GitHub, DNS, email account security settings | Enable MFA or passkeys, revoke unused access |
| Backups and incident readiness | Recovery test and evidence/notification route | Test without personal data |
| Data processor contracts | Applicable provider terms and safeguards | Review where DPDP applies |
| Data subject rights process | Working mailbox, identity checks and private tracking | Test with a controlled request |
| Production privacy text | **Verified live** via external GitHub Actions runner (homepage notice, policy and disclosure file) | Recheck after each change |

## Working data inventory (reconcile with providers before relying on it)
| Processing context | Potential data | Stated purpose | Storage / processor | Retention |
| --- | --- | --- | --- | --- |
| Page delivery and abuse prevention | IP address, user agent, requested path, timing | Serve site, prevent misuse | Cloudflare network and **GitHub Pages origin** | **Unknown; verify** |
| Visitor email | Sender email/name, message, attachments | Respond to inquiry | **Cloudflare Email Routing indicated by MX; Google Gmail inbox verified for published address (exact forwarding rule unverified)** | **Unknown; define and verify** |
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
1. **Verified:** GitHub Pages publishes the portfolio from `main`; the external runner confirms latest privacy HTML is live. **Open:** Deploy Cloudflare HTTPS redirect and response-header rules, then rerun the live audit.
2. Inspect browser DevTools > Network with a clean profile for cookies, analytics, cross-origin requests, CSP violations and local storage.
3. Inspect Cloudflare zone access, DNS, encryption mode, HTTPS redirect, caching and security rules; do not purge or alter unrelated subdomains without review.
4. Verify domain-email provider, receiving mailbox, SPF/DKIM/DMARC and retention settings.
5. Enforce MFA/passkeys for DNS, hosting, code repository and email accounts; record owner/recovery controls privately.
6. Test the deletion/rights inbox and incident workflow with non-personal test data.
7. Conduct a separate review for Studio and Dashboard. Repeat review on every change that adds analytics, forms, auth or third-party embeds.
