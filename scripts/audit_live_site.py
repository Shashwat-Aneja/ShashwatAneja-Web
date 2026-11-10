#!/usr/bin/env python3
"""Non-intrusive production check for shashwataneja.com, using only public requests.

This script checks a handful of normal HTML and DNS responses. It does not scan
ports, enumerate private paths, submit forms, or request protected resources.
"""
from __future__ import annotations

import datetime as dt
import json
import os
import re
import shutil
import socket
import ssl
import subprocess
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

DOMAIN = "shashwataneja.com"
BASE = f"https://{DOMAIN}"
TIMEOUT = 12
PUBLIC_URLS = {
    "homepage": BASE + "/",
    "privacy": BASE + "/privacy.html",
    "security_txt": BASE + "/.well-known/security.txt",
    "http_redirect": "http://" + DOMAIN + "/",
    "www_redirect": "https://www." + DOMAIN + "/",
}
CAPTURE = (
    "content-security-policy", "strict-transport-security", "x-frame-options",
    "x-content-type-options", "referrer-policy", "permissions-policy",
    "content-type", "cache-control", "server", "cf-cache-status",
)
USER_AGENT = "ShashwatAneja-ReadOnly-PrivacySecurity-Audit/1.0"


def fetch(url: str) -> dict:
    result = {"requested": url, "status": None, "final_url": None, "headers": {},
              "body": "", "error": None}
    req = Request(url, headers={"User-Agent": USER_AGENT, "Accept": "text/html,text/plain;q=0.9,*/*;q=0.1"})
    try:
        response = urlopen(req, timeout=TIMEOUT)
    except HTTPError as exc:
        response = exc
    except (URLError, TimeoutError, OSError, ssl.SSLError) as exc:
        result["error"] = str(exc)[:240]
        return result
    try:
        with response:
            result["status"] = response.status
            result["final_url"] = response.geturl()
            lower = {k.lower(): v for k, v in response.headers.items()}
            result["headers"] = {k: lower.get(k) for k in CAPTURE if k in lower}
            result["body"] = response.read(250_000).decode("utf-8", "replace")
    except (OSError, TimeoutError) as exc:
        result["error"] = str(exc)[:240]
    return result


def dns_record(record_type: str, domain: str) -> dict:
    if not shutil.which("dig"):
        return {"status": "not_run", "reason": "dig utility missing"}
    try:
        p = subprocess.run(["dig", "+time=4", "+tries=1", "+short", record_type, domain],
                           text=True, capture_output=True, timeout=8, check=False)
        records = [line.strip() for line in p.stdout.splitlines() if line.strip()]
        if p.returncode != 0:
            return {"status": "error", "detail": p.stderr.strip()[:180]}
        return {"status": "ok", "records": records[:20]}
    except (OSError, subprocess.TimeoutExpired) as exc:
        return {"status": "error", "detail": str(exc)[:180]}


def tls_check() -> dict:
    try:
        context = ssl.create_default_context()
        with socket.create_connection((DOMAIN, 443), timeout=TIMEOUT) as sock:
            with context.wrap_socket(sock, server_hostname=DOMAIN) as tls:
                cert = tls.getpeercert()
                return {"status": "verified", "protocol": tls.version(),
                        "not_after": cert.get("notAfter", ""),
                        "hostname_verified": True}
    except (OSError, ssl.SSLError) as exc:
        return {"status": "unverified", "error": str(exc)[:220]}


def classify(result: dict) -> list[dict]:
    checks = []
    def check(name: str, ok: bool | None, why: str) -> None:
        checks.append({"check": name, "state": "PASS" if ok else "WARN" if ok is False else "UNKNOWN",
                       "detail": why})

    home = result["http"]["homepage"]
    privacy = result["http"]["privacy"]
    security_txt = result["http"]["security_txt"]
    http_redirect = result["http"]["http_redirect"]
    tls = result["tls"]
    h = home["headers"]
    site_live = home["status"] == 200
    check("Production homepage reachable", site_live if home["status"] is not None else None,
          f"HTTP {home['status']}; final URL {home['final_url']}; error {home['error']}")
    check("Validated HTTPS certificate", tls["status"] == "verified",
          f"{tls['status']} ({tls.get('protocol', 'unknown protocol')})")
    check("HTTP redirects to HTTPS",
          http_redirect["final_url"].startswith("https://") if http_redirect["final_url"] else None,
          f"HTTP {http_redirect['status']}; final URL {http_redirect['final_url']}")
    check("Homepage includes latest privacy notice", "Privacy details" in home["body"] if site_live else None,
          "Expected marker: Privacy details")
    check("Live CSP in HTML", 'http-equiv="Content-Security-Policy"' in home["body"] if site_live else None,
          "HTML policy present on homepage")
    check("Live privacy policy updated",
          all(s in privacy["body"] for s in ("shashwat-theme", "Privacy grievance", "nominate someone", "Cloudflare Email Routing", "Google Gmail"))
          if privacy["status"] == 200 else None,
          f"HTTP {privacy['status']}; disclosure markers")
    check("Security contact published",
          "Contact: mailto:connect@shashwataneja.com" in security_txt["body"]
          if security_txt["status"] == 200 else None,
          f"HTTP {security_txt['status']}")
    check("Header-based CSP", bool(h.get("content-security-policy")) if site_live else None,
          "Header CSP protects resources, and can include frame-ancestors")
    check("Clickjacking restriction",
          bool(h.get("x-frame-options")) or "frame-ancestors" in (h.get("content-security-policy") or "")
          if site_live else None,
          "Either X-Frame-Options or frame-ancestors in a response header")
    check("HSTS", bool(h.get("strict-transport-security")) if site_live else None,
          "Strict-Transport-Security HTTP response header")
    check("MIME sniffing blocked",
          (h.get("x-content-type-options") or "").lower() == "nosniff" if site_live else None,
          "X-Content-Type-Options: nosniff")
    check("Referrer-Policy header", bool(h.get("referrer-policy")) if site_live else None,
          "Header policy for browser navigation")
    return checks


def main() -> None:
    checks = {key: fetch(url) for key, url in PUBLIC_URLS.items()}
    dns = {
        "NS": dns_record("NS", DOMAIN),
        "MX": dns_record("MX", DOMAIN),
        "SPF": dns_record("TXT", DOMAIN),
        "DMARC": dns_record("TXT", "_dmarc." + DOMAIN),
    }
    raw = {"checked_utc": dt.datetime.now(dt.timezone.utc).isoformat(), "http": checks,
           "tls": tls_check(), "dns": dns}
    raw["checks"] = classify(raw)
    # Do not publish response bodies. They are used only for fixed marker checks.
    for item in raw["http"].values():
        item.pop("body", None)

    with open("production-security-audit.json", "w", encoding="utf-8") as out:
        json.dump(raw, out, indent=2, ensure_ascii=False)
    print("Production audit (public, read-only):")
    for item in raw["checks"]:
        print(f"  {item['state']:<7} {item['check']}: {item['detail']}")
    spf = [v.replace('"', '') for v in dns["SPF"].get("records", []) if "v=spf1" in v.lower()]
    dmarc = [v.replace('"', '') for v in dns["DMARC"].get("records", []) if "v=dmarc1" in v.lower()]
    spf_ending = "hard fail (-all)" if any("-all" in v for v in spf) else (
        "soft fail (~all)" if any("~all" in v for v in spf) else "other/none")
    dmarc_match = re.search(r"(?:^|;)\s*p\s*=\s*(none|quarantine|reject)", dmarc[0], re.I) if dmarc else None
    dmarc_policy = dmarc_match.group(1).lower() if dmarc_match else "not identified"
    print(f"  DNS SPF policy: {spf_ending}; record present: {bool(spf)}")
    print(f"  DNS DMARC policy: {dmarc_policy}; record present: {bool(dmarc)}")
    for name in ("NS", "MX", "SPF", "DMARC"):
        item = dns[name]
        if name in ("SPF", "DMARC"):
            records = item.get("records", [])
            prefix = "v=spf1" if name == "SPF" else "v=DMARC1"
            matching = [entry for entry in records if prefix.lower() in entry.lower()]
            print(f"  DNS {name}: {'present' if matching else 'not identified'} ({item['status']})")
        else:
            print(f"  DNS {name}: {item.get('records', [])} ({item['status']})")
    summary = os.getenv("GITHUB_STEP_SUMMARY")
    if summary:
        with open(summary, "a", encoding="utf-8") as out:
            out.write("## Public-site privacy and security check\n\n")
            out.write("This is read-only evidence, not a penetration test or DPDP compliance certification.\n\n")
            out.write("| Check | Result | Evidence |\n| --- | --- | --- |\n")
            for item in raw["checks"]:
                detail = item["detail"].replace("|", "/").replace("\n", " ")
                out.write(f"| {item['check']} | {item['state']} | {detail} |\n")
            out.write("\nChecks marked UNKNOWN were not verified. Check Cloudflare and hosting account settings separately.\n")
    for item in raw["checks"]:
        if item["state"] == "WARN":
            print(f"::warning title=Live-site security gap::{item['check']}: {item['detail']}")
    print("Machine-readable report: production-security-audit.json")
    # CI succeeds if checks are executed; WARN/UNKNOWN are intentionally not treated as
    # successful security compliance. Review the report, do not use the job status as a pass.


if __name__ == "__main__":
    main()
