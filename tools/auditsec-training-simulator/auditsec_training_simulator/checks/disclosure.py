from __future__ import annotations

from ..core.engine import ScanContext
from ..core.models import Finding
from .base import Check


class BannerDisclosureCheck(Check):
    id = "A01-disclosure"
    title = "Technology/version disclosure via headers"

    def run(self, ctx: ScanContext) -> list[Finding]:
        r = ctx.http.head(ctx.base_url + "/")
        findings: list[Finding] = []

        server = r.headers.get("server")
        powered = r.headers.get("x-powered-by")

        if server or powered:
            findings.append(
                Finding(
                    id=self.id,
                    title=self.title,
                    owasp_category="A01:2021 Broken Access Control (Info Disclosure signal)",
                    severity="informational",
                    description=(
                        "The application discloses server/framework identifiers. This can help attackers fingerprint your stack and "
                        "target known vulnerabilities. It's not a vulnerability by itself, but reducing disclosure is good hygiene."
                    ),
                    evidence={"url": r.url, "server": server or "", "x-powered-by": powered or ""},
                    recommendation="Remove or normalize identifying headers at the edge/proxy when possible.",
                    references=["https://owasp.org/Top10/"],
                )
            )

        return findings
