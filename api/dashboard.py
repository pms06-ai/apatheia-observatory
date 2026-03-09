"""Vercel serverless dashboard endpoint with contract enforcement."""

import hashlib
import json
import os
import sys
from http.server import BaseHTTPRequestHandler

ROOT_DIR = os.path.dirname(os.path.dirname(__file__))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from dashboard_contract import CONTRACT_VERSION, DASHBOARD_PATH, load_canonical_dashboard

ALLOWED_ORIGIN = os.getenv("APATHEIA_ALLOWED_ORIGIN", "*")


def _etag_for_payload(payload: dict) -> str:
    digest = hashlib.sha256(
        json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    ).hexdigest()
    return f'"{digest}"'


class handler(BaseHTTPRequestHandler):
    def _send_json(self, status_code: int, payload: dict, *, cacheable: bool = False) -> None:
        etag = _etag_for_payload(payload)
        if self.headers.get("If-None-Match") == etag:
            self.send_response(304)
            self.send_header("ETag", etag)
            self.end_headers()
            return

        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", ALLOWED_ORIGIN)
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        self.send_header("ETag", etag)
        self.send_header("Cache-Control", "public, max-age=300" if cacheable else "no-store")
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode("utf-8"))

    def do_GET(self):
        if self.path == "/api/health":
            self._send_json(
                200,
                {"ok": True, "service": "dashboard-api", "contract": CONTRACT_VERSION},
            )
            return
        try:
            payload = load_canonical_dashboard(DASHBOARD_PATH)
            self._send_json(200, payload, cacheable=True)
        except FileNotFoundError:
            self._send_json(500, {"error": "dashboard_data_missing"})
        except Exception as exc:  # pragma: no cover - defensive server boundary
            print(
                json.dumps(
                    {"level": "error", "message": "dashboard_load_failed", "error": str(exc)}
                )
            )
            self._send_json(500, {"error": "dashboard_unavailable"})
