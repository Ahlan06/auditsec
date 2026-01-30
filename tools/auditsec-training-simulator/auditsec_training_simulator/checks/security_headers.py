from __future__ import annotations

from ..core.engine import ScanContext
from ..core.models import Finding
from .base import Check


class SecurityHeadersCheck(Check):
    id = "A05-headers"
    title = "Missing recommended security headers"

    def run(self, ctx: ScanContext) -> list[Finding]:
        r = ctx.http.get(ctx.base_url + "/")
        h = {k.lower(): v for k, v in r.headers.items()}

        required = {
            "content-security-policy": "Define a strong CSP to reduce XSS impact.",
            "x-content-type-options": "Set X-Content-Type-Options: nosniff.",
            "x-frame-options": "Set X-Frame-Options to prevent clickjacking (or use CSP frame-ancestors).",
            "referrer-policy": "Set a Referrer-Policy to limit referrer leakage.",
        }

        missing = [k for k in required.keys() if k not in h]
        findings: list[Finding] = []

        if missing:
            evidence = {"url": r.url, "missing": ", ".join(missing)}
            findings.append(
                Finding(
                    id=self.id,
                    title=self.title,
                    owasp_category="A05:2021 Security Misconfiguration",
                    severity="medium" if len(missing) >= 2 else "low",
                    description=(
                        "Some baseline response headers are missing. This is a common hardening gap and can "
                        "increase exposure to client-side attacks or data leakage."
                    ),
                    evidence=evidence,
                    recommendation=(
                        "Add the missing headers at the edge (CDN/WAF) or application layer. "
                        "Start with CSP (report-only), nosniff, and clickjacking protections."
                    ),
                    references=[
                        "https://owasp.org/Top10/A05_2021-Security_Misconfiguration/",
                        "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy",
                    ],
                )
            )

        # HSTS only makes sense on HTTPS
        if ctx.base_url.lower().startswith("https://") and "strict-transport-security" not in h:
            findings.append(
                Finding(
                    id="A05-hsts",
                    title="HSTS not set for HTTPS site",
                    owasp_category="A05:2021 Security Misconfiguration",
                    severity="low",
                    description="HSTS is missing. Without HSTS, users may be vulnerable to SSL stripping in some scenarios.",
                    evidence={"url": r.url},
                    recommendation="Set Strict-Transport-Security with an appropriate max-age (start small), includeSubDomains if applicable.",
                    references=[
                        "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security",
                    ],
                )
            )

        return findings
