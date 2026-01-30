from __future__ import annotations

from dataclasses import dataclass
from urllib.parse import urlparse


@dataclass(frozen=True)
class ScannerConfig:
    base_url: str
    allow_hosts: list[str]
    timeout_seconds: float = 10.0

    def parsed_base(self):
        return urlparse(self.base_url)

    def is_target_allowed(self) -> tuple[bool, str]:
        """Safe-by-design guardrails.

        - Allow localhost/127.0.0.1 by default.
        - Allow explicitly allowlisted hosts.
        """
        u = self.parsed_base()
        host = (u.hostname or "").lower()

        if host in {"localhost", "127.0.0.1"}:
            return True, "local target"

        if host in {h.lower() for h in self.allow_hosts}:
            return True, "allowlisted target"

        return False, (
            "Target refused (safe mode). Use --allow-host to allowlist a non-local host. "
            "Only scan systems you own or have explicit authorization to test."
        )
