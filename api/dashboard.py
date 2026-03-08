"""
Vercel Serverless Function for Apatheia Dashboard API
Serves the pre-built dashboard.json directly.
"""

import json
import os
from http.server import BaseHTTPRequestHandler

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()

        try:
            files = os.listdir(DATA_DIR) if os.path.isdir(DATA_DIR) else []
            filepath = os.path.join(DATA_DIR, "dashboard.json")
            if os.path.exists(filepath):
                with open(filepath, "r", encoding="utf-8") as f:
                    data = json.load(f)
                self.wfile.write(json.dumps(data).encode("utf-8"))
            else:
                self.wfile.write(json.dumps({
                    "error": "dashboard.json not found",
                    "data_dir": DATA_DIR,
                    "files_in_dir": files
                }).encode("utf-8"))
        except Exception as e:
            self.wfile.write(json.dumps({
                "error": str(e),
                "data_dir": DATA_DIR
            }).encode("utf-8"))
