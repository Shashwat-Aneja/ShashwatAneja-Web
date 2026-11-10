# Cloudflare edge remediation for shashwataneja.com

**Status: ACTION REQUIRED IN CLOUDFLARE. This document does NOT deploy rules.**
**Last live test: 10 November 2026.** A read-only GitHub Actions job confirmed the apex HTTPS site responds, but plain HTTP returns a **200** without redirect and the production homepage lacks a header CSP, HSTS, X-Frame-Options, X-Content-Type-Options and Referrer-Policy response header. The inline HTML CSP is present but cannot enforce `frame-ancestors`.

## Proven deployment configuration
- Hosting: GitHub Pages using `main` at repository root, custom domain `shashwataneja.com`. Its API reports `https_enforced: false`.
- Edge DNS: Cloudflare nameservers `anastasia.ns.cloudflare.com` and `dax.ns.cloudflare.com`.
- Inbound email: apex MX routes through Cloudflare Email Routing; recent messages addressed to the contact alias are in a connected Google Gmail mailbox.
- Outbound email: separately verified Resend sending subdomain `mail.shashwataneja.com`; do not confuse it with inbound forwarding.

## First fix: HTTP redirect for the apex hostname only
In Cloudflare, select the zone for `shashwataneja.com`, then **Rules → Redirect Rules → Create rule**.

- Name: `Portfolio apex force HTTPS`.
- Expression: `(http.host eq "shashwataneja.com" and http.request.scheme eq "http")`
- Target: Dynamic, `concat("https://shashwataneja.com", http.request.uri.path)`
- Status: **308 Permanent Redirect**.
- **Preserve query string: On.**
- Test on `http://shashwataneja.com/` and on an inner page with a query string.

This rule is restricted to the apex hostname and does **not** redirect Studio, Dashboard or other subdomains. Verify whether HTTP domain-control-validation paths need a narrow exception before activation. Do not globally enable Cloudflare's **Always Use HTTPS** without reviewing the other subdomains; that setting covers the whole zone. If cert validation requires HTTP on `/.well-known/`, follow Cloudflare's DCV troubleshooting guidance.

Cloudflare docs: https://developers.cloudflare.com/rules/url-forwarding/single-redirects/create-dashboard/

## Second fix: HTTP response security headers at the Cloudflare edge
In **Rules → Transform Rules → Response Header Transform Rules**, create one host-scoped rule (availability may depend on your Cloudflare plan):
- Name: `Portfolio apex security headers`
- Expression: `(http.host eq "shashwataneja.com")`
- Operation: **Set static** for each header, not **Add**. Set replaces a prior value instead of creating duplicate conflicting policies.

| Header | Value |
| --- | --- |
| Content-Security-Policy | `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; media-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-src 'none'; frame-ancestors 'none'; upgrade-insecure-requests` |
| X-Frame-Options | `DENY` |
| X-Content-Type-Options | `nosniff` |
| Referrer-Policy | `no-referrer` |
| Permissions-Policy | `camera=(), microphone=(), geolocation=(), payment=(), usb=()` |
| Strict-Transport-Security | `max-age=86400` |

Use an initial **one-day** HSTS policy for rollout; after redirect, TLS and all apex routes are confirmed, gradually increase to `max-age=15552000` or longer. **Do not add `includeSubDomains` or `preload` until all subdomains have been independently reviewed.** HSTS delivered over HTTP is ignored.

The existing `_headers` file is only recognized by Cloudflare Pages static deployments. This site is confirmed as **GitHub Pages** behind Cloudflare, so **the file is not a mechanism that activates these headers**. Use Cloudflare response transforms or another configured edge mechanism.

Cloudflare docs:
- https://developers.cloudflare.com/rules/transform/response-header-modification/create-dashboard/
- https://developers.cloudflare.com/ssl/edge-certificates/additional-options/always-use-https/

## Third fix: inspect origin SSL/TLS
Before changing Cloudflare's SSL/TLS mode, inspect the GitHub Pages certificate state and Cloudflare's current origin mode. **Avoid Flexible** if possible; use Full (strict) only after the origin has a valid certificate, to avoid failed requests or redirect loops. Cloudflare's HTTPS edge certificate itself already passed TLS 1.3 validation in the independent audit.

## Fourth: mail and account security
- Check the Cloudflare Email Routing rule mapping the public contact alias to the intended Google Gmail destination; test a privacy-request email using non-sensitive content.
- Check Cloudflare account MFA/passkeys, GitHub owner and collaborator access, Google account MFA/passkeys, session revocation and recovery.
- Confirm Cloudflare and Gmail data retention/logging with actual settings, not guessed defaults. Document who can read the logs and correspondence.
- Review public apex SPF/DMARC policy and check whether it should be strengthened after testing authorised senders. Sending-domain SPF/DKIM for Resend do not prove apex DMARC enforcement.

## Re-test
The repository's GitHub Actions workflow **Production DPDP and security audit** checks homepage content, HTTP redirect, HTTPS certificate, live privacy page and security.txt, response headers, NS/MX/SPF/DMARC DNS and GitHub Pages configuration. Use **Run workflow** after Cloudflare rules are deployed and inspect the job summary/artifact.

Expected:
- HTTP path returns **301/308** with HTTPS Location.
- HTTPS response headers include CSP with `frame-ancestors 'none'`, HSTS, nosniff, Referrer-Policy and clickjacking protection.
- CSP does not break theme choice, command palette, Image Lab or project navigation on a fresh browser session.

No repository commit by itself can activate Cloudflare account-level rules. The named settings need authorised Cloudflare access.
