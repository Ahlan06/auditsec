from __future__ import annotations

from dataclasses import dataclass
from typing import Mapping

from urllib.request import Request, build_opener
from urllib.error import HTTPError, URLError


class _NoRedirect:
    def redirect_request(self, req, fp, code, msg, headers, newurl):  # pragma: no cover
        return None


@dataclass(frozen=True)
class HttpResult:
    url: str
    status_code: int
    headers: Mapping[str, str]
    text_snippet: str


class SafeHttpClient:
    def __init__(self, timeout_seconds: float) -> None:
        self._timeout = timeout_seconds
        # Disable redirects to keep behavior deterministic and passive.
        self._opener = build_opener(_NoRedirect())

    def close(self) -> None:
        return

    def get(self, url: str, headers: dict[str, str] | None = None) -> HttpResult:
        return self._request("GET", url, headers=headers)

    def head(self, url: str, headers: dict[str, str] | None = None) -> HttpResult:
        return self._request("HEAD", url, headers=headers)

    def _request(self, method: str, url: str, headers: dict[str, str] | None = None) -> HttpResult:
        hdrs = headers or {}
        req = Request(url=url, method=method, headers=hdrs)
        try:
            with self._opener.open(req, timeout=self._timeout) as resp:
                status = getattr(resp, "status", 200)
                resp_headers = {k.lower(): v for (k, v) in resp.getheaders()}
                body = ""
                if method != "HEAD":
                    raw = resp.read(2000)
                    body = raw.decode("utf-8", errors="replace")
                return HttpResult(url=str(url), status_code=int(status), headers=resp_headers, text_snippet=body)
        except HTTPError as e:
            resp_headers = {k.lower(): v for (k, v) in (e.headers.items() if e.headers else [])}
            body = ""
            if method != "HEAD":
                try:
                    raw = e.read(2000)
                    body = raw.decode("utf-8", errors="replace")
                except Exception:
                    body = ""
            return HttpResult(url=str(url), status_code=int(e.code), headers=resp_headers, text_snippet=body)
        except URLError as e:
            raise RuntimeError(f"Network error for {url}: {e}") from e
