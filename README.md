# Apatheia Political Rhetoric Observatory

A data-rich dashboard for tracking political positions, claims, and rhetoric over time.

## Features

- **Position Tracking**: Monitor how politicians' stances evolve on key issues
- **Fact-Check Analysis**: Visualize claim verification status distribution
- **Party Dynamics**: Compare messaging and talking points across parties
- **Timeline Analysis**: Track claims and position changes over time
- **Interactive Charts**: Chart.js-powered visualizations with drill-down capabilities

## Quick Start

**Option A — JSON backend (simplest)**

```bash
python server.py
# Open http://localhost:8000
```

**Option B — SQLite + FastAPI (profiles, evidence, documents)**

```bash
python init_db.py          # Build apatheia.db from data/*.json
python build_profiles.py   # Enrich profiles (optional)
uvicorn main:app --reload  # Start FastAPI at http://localhost:8000
```

## Data Structure

The application uses JSON files in the `data/` directory:

| File | Description |
|------|-------------|
| `politicians.json` | Politician profiles and metadata |
| `issues.json` | Policy issues and categories |
| `claims.json` | Recorded statements and fact-checks |
| `talking_points.json` | Party messaging frameworks |
| `position_history.json` | Stance changes over time |
| `sources.json` | Source attribution and reliability |
| `contradictions.json` | Detected inconsistencies |

## Tech Stack

- **Frontend**: Vanilla JS, CSS Grid, Chart.js
- **Backend**: `server.py` (JSON) or `main.py` (FastAPI + SQLite)
- **Data**: JSON files in `data/`; SQLite (`apatheia.db`) via `init_db.py` + `build_profiles.py`
- **Theme**: Metallic dark mode with gold accents

## Analytics Dashboard

The Analytics section provides:

- Summary stats grid (politicians, claims, issues, positions)
- Fact-check distribution donut chart
- Party breakdown comparison
- Issue category radar chart
- Position evolution line chart
- Talking points by party
- Activity timeline

## License

MIT

---

*Apatheia Labs • Clarity Without Distortion*
