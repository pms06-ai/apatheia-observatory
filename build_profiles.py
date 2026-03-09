import sqlite3
import json
import re

def create_slug(name):
    return re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')

HARDCODED_PROFILES = [
    {
        "name": "Tim Kaine",
        "summary": "Focuses heavily on the legality of war and the War Powers Resolution, maintaining that no president can circumvent Congress for offensive military action.",
        "positioning": "Constitutional restraint advocate",
        "signals": ["War Powers emphasis", "Article I defense", "No imminence language"],
        "watchpoints": ["Checks against all executive actions regardless of party", "Bipartisan bridge on war powers"],
        "phases": [{"date": "2026-01-29", "label": "Legislative push", "stance": "War Powers Resolution", "detail": "Introduced resolution to restrict executive war-making."}],
        "linked_contradictions": ["admin-initiation-conflict"],
        "party": "Democrat", "bloc": "Senate Foreign Relations", "role": "Senator",
        "themes": ["Legality and War Powers", "Historical Comparisons", "Imminence and Threat"],
        "sample_excerpt": "That doesn't meet the definition of imminence under any legal criteria I'm aware of."
    },
    {
        "name": "Elizabeth Warren",
        "summary": "Connects international military conflict with domestic economic issues and progressive anti-corruption narratives, attacking endless wars.",
        "positioning": "Progressive anti-war voice",
        "signals": ["Lies and deception rhetoric", "Pro-diplomacy", "Anti-escalation"],
        "watchpoints": ["Class and economic framing of war", "Distrust of intelligence apparatus"],
        "phases": [{"date": "2026-02-28", "label": "Full rejection", "stance": "Categorical anti-war", "detail": "Declared the war illegal and based on lies."}],
        "linked_contradictions": ["democratic-fiscal-consistency"],
        "party": "Democrat", "bloc": "Progressive Caucus", "role": "Senator",
        "themes": ["Imminence and Threat", "Legality and War Powers", "Historical Comparisons"],
        "sample_excerpt": "This illegal war is based on lies."
    },
    {
        "name": "Marco Rubio",
        "summary": "Key GOP intelligence voice defending preemptive military action against adversaries and framing the conflict as an unavoidable response to Iranian aggression.",
        "positioning": "Hawkish intelligence validator",
        "signals": ["Deterrence framing", "Preemptive justification", "Shared threat with Israel"],
        "watchpoints": ["Alignment with Israeli timeline", "Justification of preemptive rather than retaliatory strikes"],
        "phases": [{"date": "2026-02-24", "label": "Intel alignment", "stance": "Preemptive defense", "detail": "Briefed the Gang of Eight on the necessity of action."}],
        "linked_contradictions": ["admin-initiation-conflict"],
        "party": "Republican", "bloc": "Senate Intelligence Committee", "role": "Senator",
        "themes": ["Israel and Delegation", "Imminence and Threat", "Legality and War Powers"],
        "sample_excerpt": "You cannot wait for the enemy to strike first when the evidence is clear."
    },
    {
        "name": "Ro Khanna",
        "summary": "Leading progressive voice in the House combining anti-interventionism with a strong push for a vote on the War Powers Resolution.",
        "positioning": "House progressive anti-war leader",
        "signals": ["Regime change war terminology", "Diplomatic necessity", "Anti-interventionist"],
        "watchpoints": ["Cross-aisle alliances with libertarian Republicans", "Friction with Democratic leadership"],
        "phases": [{"date": "2026-01-29", "label": "House resolution", "stance": "Legislative check", "detail": "Co-authored House War Powers Resolution with Thomas Massie."}],
        "linked_contradictions": ["left-vs-leadership-gap"],
        "party": "Democrat", "bloc": "Progressive Caucus", "role": "Representative",
        "themes": ["Legality and War Powers", "Intra-party Division", "Diplomacy"],
        "sample_excerpt": "An illegal regime change war."
    },
    {
        "name": "Alexandria Ocasio-Cortez",
        "summary": "Frames military conflict through a highly publicized anti-imperialist lens, stressing the failure of diplomacy and the cost to working-class Americans.",
        "positioning": "Vocal anti-imperialist progressive",
        "signals": ["Diplomatic failure critique", "Class war impact", "Anti-colonial framing"],
        "watchpoints": ["Focuses on mass mobilization and public opposition", "Frequent target of conservative media"],
        "phases": [{"date": "2026-03-01", "label": "Public mobilization", "stance": "Anti-war campaigning", "detail": "Argued that negotiations were working before military escalation disrupted them."}],
        "linked_contradictions": ["left-vs-leadership-gap"],
        "party": "Democrat", "bloc": "The Squad", "role": "Representative",
        "themes": ["Diplomacy", "Legality and War Powers", "Public Opinion"],
        "sample_excerpt": "Just this week, negotiations were underway... that could have prevented war."
    },
    {
        "name": "Rand Paul",
        "summary": "Libertarian conservative opposing foreign intervention and endless wars, frequently cooperating with progressive Democrats on War Powers.",
        "positioning": "Libertarian non-interventionist",
        "signals": ["America First non-intervention", "Constitutional adherence", "Anti-nation building"],
        "watchpoints": ["Willingness to buck GOP presidents", "Emphasis on congressional declaration of war"],
        "phases": [{"date": "2026-01-29", "label": "Bipartisan check", "stance": "War Powers cooperation", "detail": "Partnered with Tim Kaine on War Powers Resolution."}],
        "linked_contradictions": ["admin-initiation-conflict"],
        "party": "Republican", "bloc": "Libertarian Wing", "role": "Senator",
        "themes": ["Legality and War Powers", "Intra-party Division", "Imminence and Threat"],
        "sample_excerpt": "The Constitution is clear: only Congress can declare war."
    },
    {
        "name": "Benjamin Netanyahu",
        "summary": "Foreign leader positioned as the primary catalyst and beneficiary of the U.S. military escalation according to critics, pursuing long-term strategic destruction of adversarial capabilities.",
        "positioning": "Foreign allied instigator",
        "signals": ["Existential threat language", "Preemptive necessity", "U.S.-Israel unity"],
        "watchpoints": ["Timeline differences with U.S. administration", "Impact on U.S. domestic politics"],
        "phases": [{"date": "2026-02-28", "label": "Coordinated strike", "stance": "Defensive aggression", "detail": "Launched Operation Epic Fury in coordination with U.S. forces."}],
        "linked_contradictions": ["admin-initiation-conflict"],
        "party": "Likud", "bloc": "Israeli Government", "role": "Prime Minister",
        "themes": ["Israel and Delegation", "Imminence and Threat", "Strategy and Exit Plan"],
        "sample_excerpt": "We will not wait for our enemies to bring destruction; we will bring it to them."
    },
    {
        "name": "Ali Khamenei",
        "summary": "Adversary leader serving as the focal point of the conflict's rhetorical justification, assassinated during the escalation, prompting questions on the legality of targeting foreign leaders.",
        "positioning": "Foreign adversary leader",
        "signals": ["Axis of resistance framing", "Anti-American imperialism"],
        "watchpoints": ["Retaliatory proxy attacks", "Post-assassination power vacuum"],
        "phases": [{"date": "2026-02-28", "label": "Targeted strike", "stance": "Martyrdom framing", "detail": "Killed in the initial wave of Operation Epic Fury."}],
        "linked_contradictions": ["admin-initiation-conflict"],
        "party": "Islamic Republic", "bloc": "Iranian Leadership", "role": "Supreme Leader",
        "themes": ["Legality and War Powers", "Diplomacy", "Imminence and Threat"],
        "sample_excerpt": "Severe revenge awaits the criminals."
    }
]

def main():
    conn = sqlite3.connect("apatheia.db")
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    # Get existing profiles to avoid overwriting them unless they are basic
    cur.execute("SELECT id, data FROM profiles")
    existing_profiles = {row['id']: json.loads(row['data']) for row in cur.fetchall()}

    # Get all evidence to build data for generic actors
    cur.execute("SELECT data FROM evidence")
    evidence_items = [json.loads(row['data']) for row in cur.fetchall()]

    # Extract all unique actors and their evidence count
    actor_stats = {}
    for ev in evidence_items:
        for actor in ev.get("actors", []):
            if actor not in actor_stats:
                actor_stats[actor] = {"count": 0, "themes": set(), "snippets": []}
            actor_stats[actor]["count"] += 1
            if ev.get("themes"):
                actor_stats[actor]["themes"].update(ev.get("themes"))
            if ev.get("text"):
                actor_stats[actor]["snippets"].append(ev.get("text"))

    # Add hardcoded profiles
    for hp in HARDCODED_PROFILES:
        slug = create_slug(hp["name"])
        # Merge physical stats if missing
        hp["id"] = slug
        if hp["name"] in actor_stats:
            hp["evidence_count"] = actor_stats[hp["name"]]["count"]
            if not hp.get("quote_count"):
                hp["quote_count"] = 0
        else:
            hp["evidence_count"] = 0
            hp["quote_count"] = 0
            
        cur.execute("INSERT OR REPLACE INTO profiles (id, data) VALUES (?, ?)", (slug, json.dumps(hp)))
        existing_profiles[slug] = hp

    # Generate generic profiles for remaining actors
    for actor, stats in actor_stats.items():
        slug = create_slug(actor)
        if slug in existing_profiles:
            continue
            
        # Attempt to guess party/role based on name or simple heuristic (mocking the AI)
        party = "Democrat"
        if actor in ["Thomas Massie", "Angus King", "Rand Paul", "Donald Trump", "Marco Rubio"]:
            party = "Republican" if actor != "Angus King" else "Independent"
            
        themes_list = list(stats["themes"])[:4]
        
        snippet = stats["snippets"][0] if stats["snippets"] else "No public excerpt located."
        if len(snippet) > 200:
            snippet = snippet[:197] + "..."

        generic_profile = {
            "id": slug,
            "name": actor,
            "summary": f"Public figure actively participating in the rhetoric surrounding the Iran conflict. Commonly focuses on themes like {', '.join(themes_list) if themes_list else 'foreign policy'}.",
            "positioning": "Active political commentator" if stats["count"] < 5 else "Key legislative actor",
            "signals": themes_list,
            "watchpoints": [f"Changes in stance on {themes_list[0] if themes_list else 'military action'}", "Alignment with party leadership"],
            "phases": [{"date": "2026-03-01", "label": "Recorded stance", "stance": "Public participation", "detail": f"Documented statements regarding {themes_list[0] if themes_list else 'the conflict'}."}],
            "linked_contradictions": [],
            "party": party,
            "bloc": "Congressional Member",
            "role": "Representative",
            "evidence_count": stats["count"],
            "quote_count": 0,
            "themes": themes_list,
            "sample_excerpt": snippet
        }

        cur.execute("INSERT OR REPLACE INTO profiles (id, data) VALUES (?, ?)", (slug, json.dumps(generic_profile)))

    conn.commit()
    conn.close()
    print("Successfully built and expanded structured profiles in the database.")

if __name__ == "__main__":
    main()
