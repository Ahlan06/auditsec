from __future__ import annotations

from ..core.engine import ScanContext
from ..core.models import Finding
from .base import Check


class CookieFlagsCheck(Check):
    id = "A07-cookies"
    title = "Session cookie flags might be missing"

    def run(self, ctx: ScanContext) -> list[Finding]:
        r = ctx.http.get(ctx.base_url + "/")
        set_cookie = r.headers.get("set-cookie")
        if not set_cookie:
            return []

        sc = set_cookie.lower()
        missing = []
        if "httponly" not in sc:
            missing.append("HttpOnly")
        if ctx.base_url.lower().startswith("https://") and "secure" not in sc:
            missing.append("Secure")
        if "samesite" not in sc:
            missing.append("SameSite")

        if not missing:
            return []

        return [
            Finding(
                id=self.id,
                title=self.title,
                owasp_category="A07:2021 Identification and Authentication Failures",
                severity="medium" if "HttpOnly" in missing else "low",
                description=(
                    "At least one Set-Cookie header is missing recommended flags. This can increase risk from XSS or cross-site request scenarios."
                ),
                evidence={"url": r.url, "set-cookie": set_cookie, "missing": ", ".join(missing)},
                recommendation=(
                    "For session cookies, set HttpOnly, Secure (on HTTPS), and SameSite=Lax/Strict depending on flows."
                ),
                references=["https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"],
            )
        ]
