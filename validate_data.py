"""Validate taxonomy/profile consistency for dashboard payloads."""

import json
import os
import sys

from data_quality import normalize_dashboard_payload, validate_dashboard_payload


ROOT = os.path.dirname(__file__)
DATA_DIR = os.path.join(ROOT, "data")


def load_json(path):
    with open(path, "r", encoding="utf-8") as handle:
        return json.load(handle)


def main():
    dashboard_path = os.path.join(DATA_DIR, "dashboard.json")
    taxonomy_path = os.path.join(DATA_DIR, "taxonomy.json")

    if not os.path.exists(dashboard_path):
        print("Missing data/dashboard.json")
        sys.exit(1)

    dashboard = load_json(dashboard_path)
    taxonomy = load_json(taxonomy_path) if os.path.exists(taxonomy_path) else {}
    normalize_dashboard_payload(dashboard, taxonomy)
    report = validate_dashboard_payload(dashboard, taxonomy)

    print(f"Data quality ok: {report['ok']}")
    print(f"Warnings: {report['warning_count']}")
    for warning in report["warnings"]:
        print(f"- {warning}")

    sys.exit(0 if report["ok"] else 2)


if __name__ == "__main__":
    main()
