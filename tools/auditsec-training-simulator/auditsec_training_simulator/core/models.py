from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime


@dataclass(frozen=True)
class Finding:
    id: str
    title: str
    owasp_category: str
    severity: str  # informational|low|medium|high
    description: str
    evidence: dict[str, str] = field(default_factory=dict)
    recommendation: str = ""
    references: list[str] = field(default_factory=list)


@dataclass(frozen=True)
class ScanTarget:
    base_url: str


@dataclass(frozen=True)
class ScanReport:
    target: ScanTarget
    started_at: str
    finished_at: str
    findings: list[Finding]


def iso_now() -> str:
    return datetime.utcnow().replace(microsecond=0).isoformat() + "Z"
