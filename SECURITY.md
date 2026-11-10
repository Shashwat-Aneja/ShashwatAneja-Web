# Security policy and disclosure

This repository contains the public, static source for shashwataneja.com.

## Reporting
Send suspected security issues privately to **connect@shashwataneja.com** with the subject `Security report`, including the affected URL, reproducible steps and impact. Please do not publish exploitable details, secrets, or another person's information in public GitHub issues.

There is no published bug bounty or guaranteed response time. Only perform authorised, non-disruptive testing: no credential guessing, denial-of-service activity, data extraction, account takeover attempts or probing third-party systems.

## Scope and limitations
The portfolio does not provide visitor login or a server-side contact form in the reviewed source. Other subdomains (including Studio and Dashboard) are **out of scope** and need independent security reviews.

The HTML CSP protects against some classes of unwanted script/resource loading. **The production origin is confirmed as GitHub Pages (from the Pages API), behind Cloudflare. GitHub Pages does not consume `_headers`.** A production audit on 10 November 2026 confirmed valid TLS 1.3 but found **no HTTP-to-HTTPS redirect**, **no header-based CSP**, **no HSTS**, **no clickjacking-protection header**, **no nosniff header**, and **no Referrer-Policy HTTP header**. The GitHub Pages API also reported `https_enforced: false`. These risks remain open until remedied at the appropriate control plane and retested. See `docs/privacy/CLOUDFLARE-EDGE-REMEDIATION.md` for exact host-specific rules. MFA, log retention and account-level controls have not been verified.

Security findings and audit actions live in `docs/privacy/DPDP-READINESS.md`. Do not place credentials or actual data-subject request details in this public repository.
