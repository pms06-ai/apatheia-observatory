"""Helpers for taxonomy normalization and payload validation."""

from __future__ import annotations

from typing import Any


def _unique(values: list[str] | None) -> list[str]:
    seen = set()
    ordered = []
    for value in values or []:
        if not value or value in seen:
            continue
        seen.add(value)
        ordered.append(value)
    return ordered


def _theme_alias_map(taxonomy: dict[str, Any] | None) -> dict[str, str]:
    return (taxonomy or {}).get("theme_aliases", {}) or {}


def _tag_alias_map(taxonomy: dict[str, Any] | None) -> dict[str, str]:
    return (taxonomy or {}).get("tag_aliases", {}) or {}


def normalize_dashboard_payload(
    dashboard: dict[str, Any], taxonomy: dict[str, Any] | None
) -> dict[str, Any]:
    """Normalize themes/tags and canonical profile fields in-place."""
    theme_aliases = _theme_alias_map(taxonomy)
    tag_aliases = _tag_alias_map(taxonomy)

    def canonical_theme(theme: str) -> str:
        return theme_aliases.get(theme, theme)

    def canonical_tag(tag: str) -> str:
        return tag_aliases.get(tag, tag)

    for theme in dashboard.get("themes", []) or []:
        theme["name"] = canonical_theme(theme.get("name"))

    for item in dashboard.get("evidence", []) or []:
        item["themes"] = _unique([canonical_theme(t) for t in item.get("themes", []) or []])
        item["tags"] = _unique([canonical_tag(t) for t in item.get("tags", []) or []])

    for item in dashboard.get("contradictions", []) or []:
        item["themes"] = _unique([canonical_theme(t) for t in item.get("themes", []) or []])

    for item in dashboard.get("documents", []) or []:
        item["themes"] = _unique([canonical_theme(t) for t in item.get("themes", []) or []])

    for profile in dashboard.get("profiles", []) or []:
        legacy_themes = profile.get("dominant_themes", []) or []
        profile["themes"] = _unique(
            [canonical_theme(t) for t in (profile.get("themes", []) or legacy_themes)]
        )
        profile["phases"] = profile.get("phases", []) or []
        profile["signals"] = profile.get("signals", []) or []
        profile["watchpoints"] = profile.get("watchpoints", []) or []
        profile["linked_contradictions"] = profile.get("linked_contradictions", []) or []
        profile.setdefault("quote_count", 0)
        profile.setdefault("claim_count", 0)
        profile.setdefault("position_count", 0)

    for actor in dashboard.get("actors", []) or []:
        actor_themes = actor.get("themes", []) or actor.get("dominant_themes", []) or []
        actor["themes"] = _unique([canonical_theme(t) for t in actor_themes])

    return dashboard


def validate_dashboard_payload(
    dashboard: dict[str, Any], taxonomy: dict[str, Any] | None
) -> dict[str, Any]:
    """Run lightweight consistency checks for key entities."""
    warnings: list[str] = []
    taxonomy_theme_names = {
        theme.get("name")
        for theme in ((taxonomy or {}).get("themes") or [])
        if isinstance(theme, dict) and theme.get("name")
    }

    profiles = dashboard.get("profiles", []) or []
    contradictions = dashboard.get("contradictions", []) or []
    profile_names = [p.get("name", "").strip() for p in profiles]
    profile_ids = [p.get("id", "").strip() for p in profiles]
    contradiction_ids = {c.get("id") for c in contradictions if c.get("id")}
    duplicate_names = {name for name in profile_names if name and profile_names.count(name) > 1}
    duplicate_ids = {pid for pid in profile_ids if pid and profile_ids.count(pid) > 1}

    if duplicate_names:
        warnings.append(f"Duplicate profile names: {', '.join(sorted(duplicate_names))}")
    if duplicate_ids:
        warnings.append(f"Duplicate profile ids: {', '.join(sorted(duplicate_ids))}")

    for profile in profiles:
        if not profile.get("id"):
            warnings.append(f"Profile is missing id: {profile.get('name', '<unknown>')}")
        if not profile.get("name"):
            warnings.append(f"Profile id {profile.get('id', '<unknown>')} is missing name")
        for linked_id in profile.get("linked_contradictions", []) or []:
            if linked_id not in contradiction_ids:
                warnings.append(
                    f"Profile {profile.get('id', '<unknown>')} links unknown contradiction {linked_id}"
                )

    if taxonomy_theme_names:
        seen_unknown = set()
        for entity_key in ("themes", "evidence", "contradictions", "documents", "profiles", "actors"):
            for item in dashboard.get(entity_key, []) or []:
                for theme in item.get("themes", []) or []:
                    if theme and theme not in taxonomy_theme_names and theme not in seen_unknown:
                        seen_unknown.add(theme)
        if seen_unknown:
            warnings.append(
                "Unknown themes not in taxonomy: " + ", ".join(sorted(seen_unknown))
            )

    return {
        "ok": len(warnings) == 0,
        "warning_count": len(warnings),
        "warnings": warnings,
    }
