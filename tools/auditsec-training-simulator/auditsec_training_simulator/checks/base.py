from __future__ import annotations

from abc import ABC, abstractmethod

from ..core.engine import ScanContext
from ..core.models import Finding


class Check(ABC):
    id: str
    title: str

    @abstractmethod
    def run(self, ctx: ScanContext) -> list[Finding]:
        raise NotImplementedError
