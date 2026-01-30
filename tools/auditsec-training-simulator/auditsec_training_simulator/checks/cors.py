from __future__ import annotations

from ..core.engine import ScanContext
from ..core.models import Finding
from .base import Check


class CorsMisconfigurationCheck(Check):
    id = "A05-cors"
    title = "Potentially dangerous CORS configuration"

    def run(self, ctx: ScanContext) -> list[Finding]:
        # Safe, passive check: sends an Origin header and inspects the response.
        origin = "https://auditsec-training.invalid"
        r = ctx.http.get(ctx.base_url + "/", headers={"Origin": origin})

        aco = r.headers.get("access-control-allow-origin")
        acc = r.headers.get("access-control-allow-credentials")

        findings: list[Finding] = []
        if not aco:
            return findings

        aco_norm = aco.strip()
        acc_norm = (acc or "").strip().lower()

        if aco_norm == "*" and acc_norm == "true":
            findings.append(
                Finding(
                    id=self.id,
                    title=self.title,
                    owasp_category="A05:2021 Security Misconfiguration",
                    severity="high",
                    description=(
                        "CORS returns Access-Control-Allow-Origin: * together with credentials. Browsers will block some cases, "
                        "but this is still a dangerous configuration signal and often indicates an implementation error."
                    ),
                    evidence={"url": r.url, "acao": aco_norm, "acac": acc_norm},
                    recommendation=(
                        "Do not use '*' with credentials. Use an explicit allowlist of trusted origins and validate Origin strictly."
                    ),
                    references=["https://owasp.org/www-community/attacks/CORS_OriginHeaderScrutiny"],
                )
            )
        elif aco_norm == origin:
            findings.append(
                Finding(
                    id=self.id,
                    title=self.title,
                    owasp_category="A05:2021 Security Misconfiguration",
                    severity="medium",
                    description=(
                        "The response appears to reflect the Origin value. Origin reflection can lead to unintended cross-origin access "
                        "if credentials or sensitive responses are involved."
                    ),
                    evidence={"url": r.url, "reflected_origin": origin, "acac": acc_norm},
                    recommendation="Avoid reflecting Origin dynamically unless validated against a strict allowlist.",
                    references=["https://owasp.org/Top10/A05_2021-Security_Misconfiguration/"],
                )
            )

        return findings
