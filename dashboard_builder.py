"""Build canonical dashboard and actor-directory payloads."""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from typing import Any

from data_quality import normalize_dashboard_payload, validate_dashboard_payload

BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, "data")


def load_json(filename: str) -> Any:
    filepath = os.path.join(DATA_DIR, filename)
    if not os.path.exists(filepath):
        return None
    with open(filepath, "r", encoding="utf-8") as handle:
        return json.load(handle)


def slugify(value: Any) -> str:
    text = "".join(ch.lower() if ch.isalnum() else "-" for ch in str(value or ""))
    while "--" in text:
        text = text.replace("--", "-")
    return text.strip("-")


def truncate_text(text: str | None, max_length: int = 220) -> str:
    clean = " ".join(str(text or "").split())
    if len(clean) <= max_length:
        return clean
    return clean[: max_length - 1].rstrip() + "…"


def build_actor_directory(dashboard: dict[str, Any]) -> dict[str, Any]:
    profiles = dashboard.get("profiles", []) or []
    actors = dashboard.get("actors", []) or []
    politicians_payload = load_json("politicians.json") or {"politicians": []}
    politicians = politicians_payload.get("politicians", [])
    sources_payload = load_json("sources.json") or {"sources": []}
    sources = sources_payload.get("sources", [])
    directory_seed = load_json("actor_directory.json") or {}

    profile_by_name = {item.get("name"): item for item in profiles if item.get("name")}
    politician_names = {item.get("name") for item in politicians if item.get("name")}

    source_mentions: dict[str, int] = {}
    for source in sources:
        publication = source.get("publication")
        author = source.get("author")
        if publication:
            source_mentions[publication] = source_mentions.get(publication, 0) + 1
        if author:
            source_mentions[author] = source_mentions.get(author, 0) + 1

    directory = []
    seen: set[tuple[str, str]] = set()

    for actor in actors:
        name = actor.get("name")
        if not name:
            continue
        profile = profile_by_name.get(name)
        category = "politicians" if name in politician_names or profile else "politicians"
        entry = {
            "id": f"{category}:{slugify(name)}",
            "name": name,
            "category": category,
            "affiliation": (profile.get("party") if profile else None) or "Political actor",
            "summary": (
                (profile.get("summary") if profile else None)
                or truncate_text(actor.get("sample_excerpt"), 200)
                or "Referenced in the archive evidence set."
            ),
            "evidence_count": actor.get("evidence_count", 0),
            "themes": actor.get("themes", []),
            "profile_id": profile.get("id") if profile else None,
        }
        key = (entry["category"], entry["name"].lower())
        if key not in seen:
            seen.add(key)
            directory.append(entry)

    for category in ("news_networks", "reporters"):
        for seed_item in directory_seed.get(category, []):
            name = seed_item.get("name")
            if not name:
                continue
            aliases = seed_item.get("aliases", [])
            mention_count = source_mentions.get(name, 0)
            for alias in aliases:
                mention_count += source_mentions.get(alias, 0)
            entry = {
                "id": f"{category}:{slugify(name)}",
                "name": name,
                "category": category,
                "affiliation": seed_item.get("affiliation", "Unspecified"),
                "summary": seed_item.get("summary", "Curated media entity in observatory scope."),
                "evidence_count": mention_count,
                "themes": [],
                "profile_id": None,
            }
            key = (entry["category"], entry["name"].lower())
            if key not in seen:
                seen.add(key)
                directory.append(entry)

    directory.sort(
        key=lambda item: (
            item.get("category") != "politicians",
            -int(item.get("evidence_count", 0)),
            item.get("name", ""),
        )
    )

    categories = [
        {"id": "all", "label": "All categories", "count": len(directory)},
        {
            "id": "politicians",
            "label": "Politicians",
            "count": len([item for item in directory if item.get("category") == "politicians"]),
        },
        {
            "id": "news_networks",
            "label": "News networks",
            "count": len([item for item in directory if item.get("category") == "news_networks"]),
        },
        {
            "id": "reporters",
            "label": "Reporters",
            "count": len([item for item in directory if item.get("category") == "reporters"]),
        },
    ]

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "categories": categories,
        "actors": directory,
    }


def build_matrix(
    politicians: list[dict[str, Any]],
    issues: list[dict[str, Any]],
    claims: list[dict[str, Any]],
    positions: list[dict[str, Any]],
) -> dict[str, Any]:
    matrix = {
        "rows": [],
        "cols": [issue.get("name") for issue in issues[:10]],
        "data": [],
    }

    politician_claims: dict[str, int] = {}
    for politician in politicians:
        count = len([c for c in claims if c.get("politician_id") == politician.get("id")])
        politician_claims[politician.get("id")] = count

    top_politicians = sorted(
        politicians, key=lambda p: politician_claims.get(p.get("id"), 0), reverse=True
    )[:12]

    for politician in top_politicians:
        matrix["rows"].append(politician.get("name"))
        row_data = []
        for issue in issues[:10]:
            count = len(
                [
                    c
                    for c in claims
                    if c.get("politician_id") == politician.get("id")
                    and c.get("issue_id") == issue.get("id")
                ]
            )
            count += len(
                [
                    pos
                    for pos in positions
                    if pos.get("politician_id") == politician.get("id")
                    and pos.get("issue_id") == issue.get("id")
                ]
            )
            row_data.append(count)
        matrix["data"].append(row_data)

    return matrix


def build_dashboard_data() -> dict[str, Any]:
    politicians_data = load_json("politicians.json") or {"politicians": []}
    issues_data = load_json("issues.json") or {"issues": [], "categories": []}
    talking_points_data = load_json("talking_points.json") or {"talking_points": []}
    claims_data = load_json("claims.json") or {"claims": []}
    sources_data = load_json("sources.json") or {"sources": []}
    position_history_data = load_json("position_history.json") or {"positions": []}
    contradictions_data = load_json("contradictions.json") or []
    taxonomy_data = load_json("taxonomy.json") or {}
    profiles_data = load_json("profiles.json") or []
    actors_data = load_json("actors.json") or []
    dashboard_data = load_json("dashboard.json") or {}

    politicians = politicians_data.get("politicians", [])
    issues = issues_data.get("issues", [])
    categories = issues_data.get("categories", [])
    talking_points = talking_points_data.get("talking_points", [])
    claims = claims_data.get("claims", [])
    sources = sources_data.get("sources", [])
    positions = position_history_data.get("positions", [])
    contradictions = (
        contradictions_data
        if isinstance(contradictions_data, list)
        else contradictions_data.get("contradictions", [])
    )

    profiles = []
    if isinstance(profiles_data, list) and profiles_data:
        profiles = profiles_data
    else:
        for politician in politicians:
            profile = {
                "id": politician.get("id"),
                "name": politician.get("name"),
                "party": politician.get("party"),
                "role": politician.get("role", politician.get("title")),
                "bloc": politician.get("bloc"),
                "chamber": politician.get("chamber"),
                "state": politician.get("state"),
                "summary": f"{politician.get('title', '')} from {politician.get('state', '')}",
                "positioning": politician.get("bloc", ""),
                "signals": [politician.get("bloc")] if politician.get("bloc") else [],
                "watchpoints": [],
                "phases": [],
                "themes": [],
                "evidence_count": len(
                    [c for c in claims if c.get("politician_id") == politician.get("id")]
                ),
                "claim_count": len(
                    [c for c in claims if c.get("politician_id") == politician.get("id")]
                ),
                "position_count": len(
                    [p for p in positions if p.get("politician_id") == politician.get("id")]
                ),
                "linked_contradictions": [],
            }
            politician_positions = sorted(
                [p for p in positions if p.get("politician_id") == politician.get("id")],
                key=lambda x: x.get("date", ""),
            )
            for pos in politician_positions:
                profile["phases"].append(
                    {
                        "date": pos.get("date"),
                        "label": pos.get("stance_label"),
                        "stance": pos.get("position"),
                        "detail": pos.get("explanation"),
                    }
                )
                issue_name = next(
                    (i.get("name") for i in issues if i.get("id") == pos.get("issue_id")),
                    None,
                )
                if issue_name and issue_name not in profile["themes"]:
                    profile["themes"].append(issue_name)
            profiles.append(profile)

    themes = []
    for issue in issues:
        theme = {
            "name": issue.get("name"),
            "id": issue.get("id"),
            "category": issue.get("category"),
            "examples": [],
            "evidence_count": len([c for c in claims if c.get("issue_id") == issue.get("id")]),
            "talking_point_count": len(
                [tp for tp in talking_points if tp.get("issue_id") == issue.get("id")]
            ),
        }
        for key_date in issue.get("key_dates", []):
            theme["examples"].append(f"{key_date.get('date')}: {key_date.get('event')}")
        themes.append(theme)

    timeline = []
    for issue in issues:
        for key_date in issue.get("key_dates", []):
            timeline.append(
                {
                    "date": key_date.get("date"),
                    "title": key_date.get("event"),
                    "summary": f"Related to {issue.get('name')}",
                    "focus": [issue.get("name"), issue.get("category")],
                }
            )
    timeline.sort(key=lambda x: x.get("date", ""), reverse=True)

    evidence = []
    for claim in claims:
        politician = next((p for p in politicians if p.get("id") == claim.get("politician_id")), None)
        issue = next((i for i in issues if i.get("id") == claim.get("issue_id")), None)
        verbatim = claim.get("verbatim") or ""
        evidence.append(
            {
                "id": claim.get("id"),
                "title": (verbatim[:80] + "...") if len(verbatim) > 80 else verbatim,
                "text": verbatim,
                "kind": "claim",
                "doc_id": claim.get("source_id"),
                "doc_title": claim.get("context"),
                "date": claim.get("date"),
                "actors": [politician.get("name")] if politician else [],
                "themes": [issue.get("name")] if issue else [],
                "fact_check_status": claim.get("fact_check_status"),
                "fact_check_detail": claim.get("fact_check_detail"),
            }
        )

    documents = []
    for source in sources:
        documents.append(
            {
                "id": source.get("id"),
                "label": source.get("title"),
                "title": source.get("title"),
                "type": source.get("type"),
                "scope": source.get("publication"),
                "date": source.get("date"),
                "word_count": len(source.get("full_text", "").split())
                if source.get("full_text")
                else 0,
                "themes": [],
                "reliability": source.get("reliability"),
            }
        )

    parties: dict[str, dict[str, Any]] = {}
    for politician in politicians:
        party = politician.get("party", "Unknown")
        if party not in parties:
            parties[party] = {"party": party, "count": 0, "claims": 0, "blocs": set()}
        parties[party]["count"] += 1
        parties[party]["claims"] += len(
            [c for c in claims if c.get("politician_id") == politician.get("id")]
        )
        if politician.get("bloc"):
            parties[party]["blocs"].add(politician.get("bloc"))

    parties_list = []
    for party, party_data in parties.items():
        parties_list.append(
            {
                "party": party,
                "count": party_data["count"],
                "claims": party_data["claims"],
                "blocs": list(party_data["blocs"]),
            }
        )

    stats = {
        "total_politicians": len(politicians),
        "total_issues": len(issues),
        "total_claims": len(claims),
        "total_talking_points": len(talking_points),
        "total_sources": len(sources),
        "total_positions": len(positions),
        "total_contradictions": len(contradictions),
        "parties": parties_list,
        "categories": categories,
        "fact_check_breakdown": {},
        "party_breakdown": {},
    }
    for claim in claims:
        status = claim.get("fact_check_status", "unchecked")
        stats["fact_check_breakdown"][status] = stats["fact_check_breakdown"].get(status, 0) + 1
    for politician in politicians:
        party = politician.get("party", "Unknown")
        stats["party_breakdown"][party] = stats["party_breakdown"].get(party, 0) + 1

    base_dashboard = {
        "politicians": politicians,
        "issues": issues,
        "categories": categories,
        "talking_points": talking_points,
        "claims": claims,
        "sources": sources,
        "position_history": positions,
        "contradictions": contradictions,
        "profiles": profiles,
        "themes": themes,
        "timeline": timeline,
        "evidence": evidence,
        "documents": documents,
        "parties": parties_list,
        "stats": stats,
        "manifest": {
            "project": "Apatheia Political Rhetoric Observatory",
            "document_count": len(documents),
            "evidence_count": len(evidence),
            "actor_count": len(actors_data) if isinstance(actors_data, list) else len(politicians),
            "theme_count": len(themes),
            "politicians": len(politicians),
            "issues": len(issues),
            "claims": len(claims),
            "talking_points": len(talking_points),
            "sources": len(sources),
            "positions": len(positions),
            "contradictions": len(contradictions),
        },
        "lenses": [
            {
                "id": "all",
                "label": "All issues",
                "title": "All issues",
                "summary": "Show all issues and themes across the archive.",
                "themes": None,
            },
            {
                "id": "foreign-policy",
                "label": "Foreign Policy",
                "title": "Foreign Policy",
                "summary": "Focus on foreign policy issues and related themes.",
                "themes": [i.get("name") for i in issues if i.get("category") == "Foreign Policy"],
            },
            {
                "id": "economic",
                "label": "Economic Policy",
                "title": "Economic Policy",
                "summary": "Focus on economic policy issues and related themes.",
                "themes": [i.get("name") for i in issues if i.get("category") == "Economic Policy"],
            },
            {
                "id": "social",
                "label": "Social Policy",
                "title": "Social Policy",
                "summary": "Focus on social policy issues and related themes.",
                "themes": [i.get("name") for i in issues if i.get("category") == "Social Policy"],
            },
            {
                "id": "constitutional",
                "label": "Constitutional",
                "title": "Constitutional",
                "summary": "Focus on constitutional and institutional governance issues.",
                "themes": [i.get("name") for i in issues if i.get("category") == "Constitutional"],
            },
            {
                "id": "immigration",
                "label": "Immigration",
                "title": "Immigration",
                "summary": "Focus on immigration and border-policy issues.",
                "themes": [i.get("name") for i in issues if i.get("category") == "Immigration"],
            },
        ],
        "matrix": build_matrix(politicians, issues, claims, positions),
    }

    dashboard = {**dashboard_data, **base_dashboard}
    if isinstance(actors_data, list) and actors_data:
        dashboard["actors"] = actors_data
    else:
        dashboard.setdefault("actors", [])
    dashboard["taxonomy"] = taxonomy_data
    normalize_dashboard_payload(dashboard, taxonomy_data)
    dashboard["data_quality"] = validate_dashboard_payload(dashboard, taxonomy_data)
    return dashboard
