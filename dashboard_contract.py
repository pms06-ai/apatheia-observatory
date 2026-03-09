"""
Canonical dashboard contract helpers shared by all API paths.
"""

from __future__ import annotations

import json
import os
from typing import Any

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
DASHBOARD_PATH = os.path.join(DATA_DIR, "dashboard.json")
CONTRACT_VERSION = "dashboard.v1"

REQUIRED_ARRAY_KEYS = (
    "top_insights",
    "timeline",
    "profiles",
    "parties",
    "themes",
    "evidence",
    "documents",
    "contradictions",
    "lenses",
    "expansion_tracks",
    "actors",
    "system_model",
)

REQUIRED_OBJECT_KEYS = (
    "manifest",
    "stats",
)


def _first_present(mapping: dict[str, Any], keys: tuple[str, ...], default: int = 0) -> int:
    for key in keys:
        value = mapping.get(key)
        if isinstance(value, (int, float)):
            return int(value)
    return default


def normalize_dashboard_contract(payload: dict[str, Any]) -> dict[str, Any]:
    normalized = dict(payload or {})

    manifest = dict(normalized.get("manifest") or {})
    normalized["manifest"] = {
        "project": manifest.get("project") or "Apatheia Political Rhetoric Observatory",
        "description": manifest.get("description") or "Canonical dashboard payload.",
        "document_count": _first_present(manifest, ("document_count", "sources")),
        "evidence_count": _first_present(manifest, ("evidence_count", "claims")),
        "actor_count": _first_present(manifest, ("actor_count", "politicians")),
        "theme_count": _first_present(manifest, ("theme_count", "issues")),
    }

    for key in REQUIRED_ARRAY_KEYS:
        value = normalized.get(key)
        normalized[key] = value if isinstance(value, list) else []

    for key in REQUIRED_OBJECT_KEYS:
        value = normalized.get(key)
        normalized[key] = value if isinstance(value, dict) else {}

    normalized["schemaVersion"] = normalized.get("schemaVersion") or CONTRACT_VERSION
    return normalized


def validate_dashboard_contract(payload: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    if not isinstance(payload, dict):
        return ["payload must be an object"]

    for key in REQUIRED_OBJECT_KEYS:
        if not isinstance(payload.get(key), dict):
            errors.append(f"missing object key: {key}")

    for key in REQUIRED_ARRAY_KEYS:
        if not isinstance(payload.get(key), list):
            errors.append(f"missing array key: {key}")

    manifest = payload.get("manifest") or {}
    for count_key in ("document_count", "evidence_count", "actor_count", "theme_count"):
        if not isinstance(manifest.get(count_key), int):
            errors.append(f"manifest.{count_key} must be an integer")

    return errors


def load_canonical_dashboard(path: str = DASHBOARD_PATH) -> dict[str, Any]:
    with open(path, "r", encoding="utf-8") as handle:
        data = json.load(handle)
    normalized = normalize_dashboard_contract(data)
    errors = validate_dashboard_contract(normalized)
    if errors:
        raise ValueError("invalid dashboard contract: " + "; ".join(errors))
    return normalized

