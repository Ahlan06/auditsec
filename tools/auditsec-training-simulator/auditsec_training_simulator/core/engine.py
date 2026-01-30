from __future__ import annotations

from dataclasses import dataclass

from .config import ScannerConfig
from .http import SafeHttpClient
from .models import Finding, ScanReport, ScanTarget, iso_now
from ..checks.registry import build_checks


@dataclass
class ScanContext:
    base_url: str
    http: SafeHttpClient


class ScannerEngine:
    def __init__(self, config: ScannerConfig) -> None:
        self._config = config

    def run(self) -> ScanReport:
        ok, reason = self._config.is_target_allowed()
        if not ok:
            raise SystemExit(reason)

        started = iso_now()
        http = SafeHttpClient(timeout_seconds=self._config.timeout_seconds)
        try:
            ctx = ScanContext(base_url=self._config.base_url.rstrip("/"), http=http)
            findings: list[Finding] = []
            for check in build_checks():
                findings.extend(check.run(ctx))
        finally:
            http.close()

        finished = iso_now()
        return ScanReport(
            target=ScanTarget(base_url=self._config.base_url),
            started_at=started,
            finished_at=finished,
            findings=findings,
        )
