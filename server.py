"""
Apatheia Political Rhetoric Observatory - API Server
Serves the political tracking data as a JSON API.
"""

import json
import os
import hashlib
from datetime import datetime, timezone
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse
from dashboard_contract import CONTRACT_VERSION, DASHBOARD_PATH, load_canonical_dashboard

from data_quality import normalize_dashboard_payload, validate_dashboard_payload

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

def load_json(filename):
    """Load a JSON file from the data directory."""
    filepath = os.path.join(DATA_DIR, filename)
    if not os.path.exists(filepath):
        return None
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def slugify(value):
    text = "".join(ch.lower() if ch.isalnum() else "-" for ch in str(value or ""))
    while "--" in text:
        text = text.replace("--", "-")
    return text.strip("-")


def truncate_text(text, max_length=220):
    clean = " ".join(str(text or "").split())
    if len(clean) <= max_length:
        return clean
    return clean[: max_length - 1].rstrip() + "…"


def build_actor_directory(dashboard):
    profiles = dashboard.get("profiles", []) or []
    actors = dashboard.get("actors", []) or []
    politicians_payload = load_json("politicians.json") or {"politicians": []}
    politicians = politicians_payload.get("politicians", [])
    sources_payload = load_json("sources.json") or {"sources": []}
    sources = sources_payload.get("sources", [])
    directory_seed = load_json("actor_directory.json") or {}

    profile_by_name = {item.get("name"): item for item in profiles if item.get("name")}
    politician_names = {item.get("name") for item in politicians if item.get("name")}

    source_mentions = {}
    for source in sources:
        publication = source.get("publication")
        author = source.get("author")
        if publication:
            source_mentions[publication] = source_mentions.get(publication, 0) + 1
        if author:
            source_mentions[author] = source_mentions.get(author, 0) + 1

    directory = []
    seen = set()

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
            "affiliation": (
                (profile.get("party") if profile else None)
                or "Political actor"
            ),
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

def build_dashboard_data():
    """Build the complete dashboard data object from all JSON files."""

    # Load all data files
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

    # Load legacy dashboard data for backwards compatibility
    dashboard_data = load_json("dashboard.json") or {}

    # Extract arrays from nested structures
    politicians = politicians_data.get("politicians", [])
    issues = issues_data.get("issues", [])
    categories = issues_data.get("categories", [])
    talking_points = talking_points_data.get("talking_points", [])
    claims = claims_data.get("claims", [])
    sources = sources_data.get("sources", [])
    positions = position_history_data.get("positions", [])
    contradictions = contradictions_data if isinstance(contradictions_data, list) else contradictions_data.get("contradictions", [])

    # Build profiles from politicians for backwards compatibility
    profiles = []
    if isinstance(profiles_data, list) and profiles_data:
        profiles = profiles_data
    else:
        for p in politicians:
            profile = {
                "id": p.get("id"),
                "name": p.get("name"),
                "party": p.get("party"),
                "role": p.get("role", p.get("title")),
                "bloc": p.get("bloc"),
                "chamber": p.get("chamber"),
                "state": p.get("state"),
                "summary": f"{p.get('title', '')} from {p.get('state', '')}",
                "positioning": p.get("bloc", ""),
                "signals": [p.get("bloc")] if p.get("bloc") else [],
                "watchpoints": [],
                "phases": [],
                "themes": [],
                "evidence_count": len([c for c in claims if c.get("politician_id") == p.get("id")]),
                "claim_count": len([c for c in claims if c.get("politician_id") == p.get("id")]),
                "position_count": len([pos for pos in positions if pos.get("politician_id") == p.get("id")]),
                "linked_contradictions": [],
            }

            politician_positions = sorted(
                [pos for pos in positions if pos.get("politician_id") == p.get("id")],
                key=lambda x: x.get("date", "")
            )
            for pos in politician_positions:
                profile["phases"].append({
                    "date": pos.get("date"),
                    "label": pos.get("stance_label"),
                    "stance": pos.get("position"),
                    "detail": pos.get("explanation"),
                })
                issue_name = next(
                    (i.get("name") for i in issues if i.get("id") == pos.get("issue_id")),
                    None
                )
                if issue_name and issue_name not in profile["themes"]:
                    profile["themes"].append(issue_name)

            profiles.append(profile)

    # Build themes from issues for backwards compatibility
    themes = []
    for issue in issues:
        theme = {
            "name": issue.get("name"),
            "id": issue.get("id"),
            "category": issue.get("category"),
            "examples": [],
            "evidence_count": len([c for c in claims if c.get("issue_id") == issue.get("id")]),
            "talking_point_count": len([tp for tp in talking_points if tp.get("issue_id") == issue.get("id")])
        }
        # Add key dates as examples
        for kd in issue.get("key_dates", []):
            theme["examples"].append(f"{kd.get('date')}: {kd.get('event')}")
        themes.append(theme)

    # Build timeline from key dates across all issues
    timeline = []
    for issue in issues:
        for kd in issue.get("key_dates", []):
            timeline.append({
                "date": kd.get("date"),
                "title": kd.get("event"),
                "summary": f"Related to {issue.get('name')}",
                "focus": [issue.get("name"), issue.get("category")]
            })
    timeline.sort(key=lambda x: x.get("date", ""), reverse=True)

    # Build evidence from claims for backwards compatibility
    evidence = []
    for claim in claims:
        politician = next((p for p in politicians if p.get("id") == claim.get("politician_id")), None)
        issue = next((i for i in issues if i.get("id") == claim.get("issue_id")), None)

        ev = {
            "id": claim.get("id"),
            "title": claim.get("verbatim", "")[:80] + "..." if len(claim.get("verbatim", "")) > 80 else claim.get("verbatim", ""),
            "text": claim.get("verbatim"),
            "kind": "claim",
            "doc_id": claim.get("source_id"),
            "doc_title": claim.get("context"),
            "date": claim.get("date"),
            "actors": [politician.get("name")] if politician else [],
            "themes": [issue.get("name")] if issue else [],
            "fact_check_status": claim.get("fact_check_status"),
            "fact_check_detail": claim.get("fact_check_detail")
        }
        evidence.append(ev)

    # Build documents from sources for backwards compatibility
    documents = []
    for src in sources:
        doc = {
            "id": src.get("id"),
            "label": src.get("title"),
            "title": src.get("title"),
            "type": src.get("type"),
            "scope": src.get("publication"),
            "date": src.get("date"),
            "word_count": len(src.get("full_text", "").split()) if src.get("full_text") else 0,
            "themes": [],
            "reliability": src.get("reliability")
        }
        documents.append(doc)

    # Build parties summary
    parties = {}
    for p in politicians:
        party = p.get("party", "Unknown")
        if party not in parties:
            parties[party] = {"party": party, "count": 0, "claims": 0, "blocs": set()}
        parties[party]["count"] += 1
        parties[party]["claims"] += len([c for c in claims if c.get("politician_id") == p.get("id")])
        if p.get("bloc"):
            parties[party]["blocs"].add(p.get("bloc"))

    parties_list = []
    for party, data in parties.items():
        parties_list.append({
            "party": party,
            "count": data["count"],
            "claims": data["claims"],
            "blocs": list(data["blocs"])
        })

    # Calculate statistics
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
        "party_breakdown": {}
    }

    # Fact check breakdown
    for claim in claims:
        status = claim.get("fact_check_status", "unchecked")
        stats["fact_check_breakdown"][status] = stats["fact_check_breakdown"].get(status, 0) + 1

    # Party breakdown
    for p in politicians:
        party = p.get("party", "Unknown")
        stats["party_breakdown"][party] = stats["party_breakdown"].get(party, 0) + 1

    # Build the complete dashboard object
    base_dashboard = {
        # Core data
        "politicians": politicians,
        "issues": issues,
        "categories": categories,
        "talking_points": talking_points,
        "claims": claims,
        "sources": sources,
        "position_history": positions,
        "contradictions": contradictions,

        # Backwards compatible structures
        "profiles": profiles,
        "themes": themes,
        "timeline": timeline,
        "evidence": evidence,
        "documents": documents,
        "parties": parties_list,

        # Statistics
        "stats": stats,

        # Manifest
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

        # Lenses for filtering
        "lenses": [
            {
                "id": "all",
                "label": "All issues",
                "title": "All issues",
                "summary": "Show all issues and themes across the archive.",
                "themes": None
            },
            {
                "id": "foreign-policy",
                "label": "Foreign Policy",
                "title": "Foreign Policy",
                "summary": "Focus on foreign policy issues and related themes.",
                "themes": [i.get("name") for i in issues if i.get("category") == "Foreign Policy"]
            },
            {
                "id": "economic",
                "label": "Economic Policy",
                "title": "Economic Policy",
                "summary": "Focus on economic policy issues and related themes.",
                "themes": [i.get("name") for i in issues if i.get("category") == "Economic Policy"]
            },
            {
                "id": "social",
                "label": "Social Policy",
                "title": "Social Policy",
                "summary": "Focus on social policy issues and related themes.",
                "themes": [i.get("name") for i in issues if i.get("category") == "Social Policy"]
            },
            {
                "id": "constitutional",
                "label": "Constitutional",
                "title": "Constitutional",
                "summary": "Focus on constitutional and institutional governance issues.",
                "themes": [i.get("name") for i in issues if i.get("category") == "Constitutional"]
            },
            {
                "id": "immigration",
                "label": "Immigration",
                "title": "Immigration",
                "summary": "Focus on immigration and border-policy issues.",
                "themes": [i.get("name") for i in issues if i.get("category") == "Immigration"]
            }
        ],

        # Matrix for actor x theme
        "matrix": build_matrix(politicians, issues, claims, positions)
    }

    # Preserve richer legacy structures where present, then override core arrays.
    dashboard = {**dashboard_data, **base_dashboard}
    if isinstance(actors_data, list) and actors_data:
        dashboard["actors"] = actors_data
    else:
        dashboard.setdefault("actors", [])
    dashboard["taxonomy"] = taxonomy_data
    normalize_dashboard_payload(dashboard, taxonomy_data)
    dashboard["data_quality"] = validate_dashboard_payload(dashboard, taxonomy_data)
    return dashboard

def build_matrix(politicians, issues, claims, positions):
    """Build actor x theme matrix data."""
    matrix = {
        "rows": [],
        "cols": [issue.get("name") for issue in issues[:10]],  # Top 10 issues
        "data": []
    }

    # Get top politicians by claim count
    politician_claims = {}
    for p in politicians:
        count = len([c for c in claims if c.get("politician_id") == p.get("id")])
        politician_claims[p.get("id")] = count

    top_politicians = sorted(politicians, key=lambda p: politician_claims.get(p.get("id"), 0), reverse=True)[:12]

    for p in top_politicians:
        matrix["rows"].append(p.get("name"))
        row_data = []
        for issue in issues[:10]:
            count = len([c for c in claims
                        if c.get("politician_id") == p.get("id")
                        and c.get("issue_id") == issue.get("id")])
            count += len([pos for pos in positions
                         if pos.get("politician_id") == p.get("id")
                         and pos.get("issue_id") == issue.get("id")])
            row_data.append(count)
        matrix["data"].append(row_data)

    return matrix


class DashboardHandler(SimpleHTTPRequestHandler):
    """HTTP handler that serves static files and the dashboard API."""

    def send_json(self, payload, status=200, cacheable=False):
        encoded = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        etag = '"' + hashlib.sha256(encoded).hexdigest() + '"'
        if self.headers.get("If-None-Match") == etag:
            self.send_response(304)
            self.send_header("ETag", etag)
            self.end_headers()
            return
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", os.getenv("APATHEIA_ALLOWED_ORIGIN", "*"))
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("ETag", etag)
        self.send_header("Cache-Control", "public, max-age=300" if cacheable else "no-store")
        self.end_headers()
        self.wfile.write(encoded)

    def do_GET(self):
        parsed = urlparse(self.path)

        if parsed.path == "/api/dashboard":
            try:
                data = load_canonical_dashboard(DASHBOARD_PATH)
                self.send_json(data, cacheable=True)
            except Exception as exc:
                print(json.dumps({"level": "error", "message": "dashboard_load_failed", "error": str(exc)}))
                self.send_json({"error": "dashboard_unavailable"}, status=500)
            return

        if parsed.path == "/api/actors":
            try:
                dashboard = load_canonical_dashboard(DASHBOARD_PATH)
                payload = build_actor_directory(dashboard)
                self.send_json(payload, cacheable=True)
            except Exception as exc:
                print(json.dumps({"level": "error", "message": "actor_directory_failed", "error": str(exc)}))
                self.send_json({"error": "actor_directory_unavailable"}, status=500)
            return

        if parsed.path == "/api/health":
            self.send_json({"ok": True, "service": "server.py", "contract": CONTRACT_VERSION})
            return

        if parsed.path == "/api/politicians":
            data = load_json("politicians.json")
            self.send_json(data)
            return

        if parsed.path == "/api/issues":
            data = load_json("issues.json")
            self.send_json(data)
            return

        if parsed.path == "/api/claims":
            data = load_json("claims.json")
            self.send_json(data)
            return

        if parsed.path == "/api/talking-points":
            data = load_json("talking_points.json")
            self.send_json(data)
            return

        if parsed.path == "/api/positions":
            data = load_json("position_history.json")
            self.send_json(data)
            return

        # Serve static files
        return super().do_GET()


def main():
    port = 8000
    server = HTTPServer(("", port), DashboardHandler)
    print(f"Apatheia Observatory server running at http://localhost:{port}")
    print("Press Ctrl+C to stop")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down...")
        server.shutdown()


if __name__ == "__main__":
    main()
