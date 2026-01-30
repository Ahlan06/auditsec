from __future__ import annotations

from .base import Check
from .security_headers import SecurityHeadersCheck
from .cors import CorsMisconfigurationCheck
from .cookies import CookieFlagsCheck
from .disclosure import BannerDisclosureCheck


def build_checks() -> list[Check]:
    return [
        SecurityHeadersCheck(),
        CorsMisconfigurationCheck(),
        CookieFlagsCheck(),
        BannerDisclosureCheck(),
    ]
