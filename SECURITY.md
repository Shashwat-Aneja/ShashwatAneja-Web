# Security policy and disclosure

This repository contains the public, static source for shashwataneja.com.

## Reporting
Send suspected security issues privately to **connect@shashwataneja.com** with the subject `Security report`, including the affected URL, reproducible steps and impact. Please do not publish exploitable details, secrets, or another person's information in public GitHub issues.

There is no published bug bounty or guaranteed response time. Only perform authorised, non-disruptive testing: no credential guessing, denial-of-service activity, data extraction, account takeover attempts or probing third-party systems.

## Scope and limitations
The portfolio does not provide visitor login or a server-side contact form in the reviewed source. Other subdomains (including Studio and Dashboard) are **out of scope** and need independent security reviews.

The HTML CSP protects against some classes of unwanted script/resource loading. If deployment is through **Cloudflare Pages**, the repository `_headers` file adds header-based frame protection and related response headers. **GitHub Pages does not consume `_headers`.** Deployment headers, MFA, email security, rate limits, logs and TLS have not been verified by this repository change.

Security findings and audit actions live in `docs/privacy/DPDP-READINESS.md`. Do not place credentials or actual data-subject request details in this public repository.
