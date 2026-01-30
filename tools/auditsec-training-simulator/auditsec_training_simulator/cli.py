from __future__ import annotations

import argparse
import json
from dataclasses import asdict
from pathlib import Path

from .core.config import ScannerConfig
from .core.engine import ScannerEngine
from .reporting.markdown import render_markdown


def main() -> None:
    parser = argparse.ArgumentParser(prog="auditsec-train", description="AuditSec OWASP training simulator")
    sub = parser.add_subparsers(dest="cmd", required=True)

    scan = sub.add_parser("scan", help="Run a safe, educational scan")
    scan.add_argument("--base-url", required=True, help="Base URL, e.g. http://127.0.0.1:8000")
    scan.add_argument("--out-dir", default="./out", help="Output directory")
    scan.add_argument(
        "--allow-host",
        action="append",
        default=[],
        help="Allowlist host(s) for non-local scanning (repeatable)",
    )
    scan.add_argument("--timeout", type=float, default=10.0, help="HTTP timeout seconds")

    args = parser.parse_args()

    if args.cmd == "scan":
        out_dir = Path(args.out_dir)
        out_dir.mkdir(parents=True, exist_ok=True)

        cfg = ScannerConfig(
            base_url=str(args.base_url),
            allow_hosts=list(args.allow_host),
            timeout_seconds=float(args.timeout),
        )

        engine = ScannerEngine(cfg)
        report = engine.run()

        (out_dir / "report.json").write_text(json.dumps(asdict(report), indent=2, ensure_ascii=False), encoding="utf-8")
        (out_dir / "report.md").write_text(render_markdown(report), encoding="utf-8")

        print(f"Wrote {out_dir / 'report.md'}")
        print(f"Wrote {out_dir / 'report.json'}")
