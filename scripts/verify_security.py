#!/usr/bin/env python3
"""Dependency-free safety checks for the public portfolio's static HTML."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
PAGES = [
    "index.html",
    "privacy.html",
    "terms.html",
    "projects/index.html",
    "projects/arc/index.html",
    "projects/mnist/index.html",
    "projects/sorting/index.html",
    "projects/vr-cricket/index.html",
    "projects/xylo/index.html",
]


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.csp = []
        self.referrer = []
        self.scripts = []
        self.unsafe = []

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if any(k.lower().startswith("on") for k, _ in attrs):
            self.unsafe.append((tag, "inline event handler"))
        if tag == "meta":
            if attributes.get("http-equiv", "").lower() == "content-security-policy":
                self.csp.append(attributes.get("content", ""))
            if attributes.get("name", "").lower() == "referrer":
                self.referrer.append(attributes.get("content", ""))
        if tag == "script":
            self.scripts.append(attributes)


def check_page(relative_path):
    page = ROOT / relative_path
    assert page.is_file(), f"Missing page: {relative_path}"
    html = page.read_text(encoding="utf-8")
    parser = PageParser()
    parser.feed(html)
    assert not parser.unsafe, f"{relative_path}: inline event handlers found"
    assert len(parser.csp) == 1, f"{relative_path}: expected one CSP meta element"
    policy = parser.csp[0]
    for required in ("script-src 'self'", "object-src 'none'", "base-uri 'self'",
                     "connect-src 'self'", "upgrade-insecure-requests"):
        assert required in policy, f"{relative_path}: missing CSP directive {required}"
    assert "'unsafe-inline'" not in policy.split("script-src", 1)[1].split(";", 1)[0], (
        f"{relative_path}: inline script execution is not restricted"
    )
    assert parser.referrer == ["no-referrer"], f"{relative_path}: missing referrer policy"
    for script in parser.scripts:
        src = script.get("src")
        if not src:
            assert script.get("type") == "application/ld+json", (
                f"{relative_path}: executable inline script is not allowed"
            )
            continue
        parsed = urlparse(src)
        assert not parsed.scheme and not parsed.netloc, (
            f"{relative_path}: unexpected external script {src}"
        )
        local_path = (page.parent / parsed.path).resolve()
        assert local_path.is_relative_to(ROOT.resolve()) and local_path.is_file(), (
            f"{relative_path}: missing or unsafe script source {src}"
        )


def main():
    for page in PAGES:
        check_page(page)
        print(f"PASS {page}")
    policy = (ROOT / "privacy.html").read_text(encoding="utf-8")
    for text in ("shashwat-theme", "shashwat-privacy-notice-seen",
                 "Privacy grievance", "connect@shashwataneja.com"):
        assert text in policy, f"Privacy policy missing {text}"
    headers = (ROOT / "_headers").read_text(encoding="utf-8")
    for control in ("frame-ancestors 'none'", "X-Content-Type-Options: nosniff",
                    "Strict-Transport-Security:"):
        assert control in headers, f"_headers missing {control}"
    print("Static security checks passed. Deployment and account security still need external verification.")


if __name__ == "__main__":
    main()
