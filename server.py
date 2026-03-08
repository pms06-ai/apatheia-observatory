"""
Apatheia Political Rhetoric Observatory - API Server
Serves the political tracking data as a JSON API.
"""

import json
import os
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

def load_json(filename):
    """Load a JSON file from the data directory."""
    filepath = os.path.join(DATA_DIR, filename)
    if not os.path.exists(filepath):
        return None
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)

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
            "linked_contradictions": []
        }

        # Add position history as phases
        politician_positions = sorted(
            [pos for pos in positions if pos.get("politician_id") == p.get("id")],
            key=lambda x: x.get("date", "")
        )
        for pos in politician_positions:
            profile["phases"].append({
                "date": pos.get("date"),
                "label": pos.get("stance_label"),
                "summary": pos.get("explanation"),
                "focus": [pos.get("issue_id")]
            })
            if pos.get("issue_id") and pos.get("issue_id") not in profile["themes"]:
                profile["themes"].append(pos.get("issue_id"))

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
    dashboard = {
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
            "politicians": len(politicians),
            "issues": len(issues),
            "claims": len(claims),
            "talking_points": len(talking_points),
            "sources": len(sources),
            "positions": len(positions),
            "contradictions": len(contradictions)
        },

        # Lenses for filtering
        "lenses": [
            {
                "id": "all",
                "label": "All issues",
                "themes": None
            },
            {
                "id": "foreign-policy",
                "label": "Foreign Policy",
                "themes": [i.get("name") for i in issues if i.get("category") == "Foreign Policy"]
            },
            {
                "id": "economic",
                "label": "Economic Policy",
                "themes": [i.get("name") for i in issues if i.get("category") == "Economic Policy"]
            },
            {
                "id": "social",
                "label": "Social Policy",
                "themes": [i.get("name") for i in issues if i.get("category") == "Social Policy"]
            },
            {
                "id": "constitutional",
                "label": "Constitutional",
                "themes": [i.get("name") for i in issues if i.get("category") == "Constitutional"]
            },
            {
                "id": "immigration",
                "label": "Immigration",
                "themes": [i.get("name") for i in issues if i.get("category") == "Immigration"]
            }
        ],

        # Matrix for actor x theme
        "matrix": build_matrix(politicians, issues, claims, positions)
    }

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

    def do_GET(self):
        parsed = urlparse(self.path)

        if parsed.path == "/api/dashboard":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()

            data = build_dashboard_data()
            self.wfile.write(json.dumps(data, indent=2).encode("utf-8"))
            return

        if parsed.path == "/api/politicians":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()

            data = load_json("politicians.json")
            self.wfile.write(json.dumps(data, indent=2).encode("utf-8"))
            return

        if parsed.path == "/api/issues":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()

            data = load_json("issues.json")
            self.wfile.write(json.dumps(data, indent=2).encode("utf-8"))
            return

        if parsed.path == "/api/claims":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()

            data = load_json("claims.json")
            self.wfile.write(json.dumps(data, indent=2).encode("utf-8"))
            return

        if parsed.path == "/api/talking-points":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()

            data = load_json("talking_points.json")
            self.wfile.write(json.dumps(data, indent=2).encode("utf-8"))
            return

        if parsed.path == "/api/positions":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()

            data = load_json("position_history.json")
            self.wfile.write(json.dumps(data, indent=2).encode("utf-8"))
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
