# Apatheia Political Rhetoric Observatory

A **comprehensive political intelligence platform** for advanced analysis of political positions, claims, rhetoric, and contradictions over time.

## Features

### **Core Visualization**
- **Position Tracking**: Monitor how politicians' stances evolve on key issues
- **Fact-Check Analysis**: Visualize claim verification status distribution
- **Party Dynamics**: Compare messaging and talking points across parties
- **Timeline Analysis**: Track claims and position changes over time
- **Interactive Charts**: Chart.js-powered visualizations with drill-down capabilities

### **Advanced Analysis Engine** 🚀 NEW
- **Sentiment Analysis**: Quantitative measurement of rhetorical tone and intensity
- **Trend Detection**: Automatic identification of position shifts with volatility measurement
- **Contradiction Mapping**: Comprehensive inconsistency tracking with severity classification
- **Rhetoric Patterns**: Recurring term and venue pattern identification
- **Statistical Insights**: Objective metrics for political discourse analysis

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

**Option C — Advanced Analysis Engine** 🚀 NEW

```bash
# Run comprehensive political analysis
python3 analysis_engine.py

# See interactive demonstration
python3 demo_analysis.py

# Access via API (after deploying FastAPI)
curl http://localhost:8000/api/analysis
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

## Advanced Analysis Capabilities 🚀 NEW

The enhanced analysis engine provides **quantitative political insights**:

### **Sentiment Analysis**
- Objective tone measurement (-1.0 to +1.0 scale)
- Intensity classification (normal/medium/high)
- Positive/negative word extraction
- Overall sentiment distribution

### **Trend Detection**
- Position change direction tracking
- Volatility measurement (statistical variance)
- Magnitude quantification
- Multi-issue trend analysis

### **Contradiction Analysis**
- Severity classification (low/medium/high/critical)
- Actor/counterparty mapping
- Theme coverage analysis
- Resolution status tracking

### **Rhetoric Patterns**
- Term frequency analysis
- Venue preference identification
- Issue focus tracking
- Temporal pattern detection

### **API Endpoints**
```
GET /api/analysis              # Full comprehensive analysis
GET /api/analysis/sentiment    # Sentiment analysis only
GET /api/analysis/trends       # Trend detection results
GET /api/analysis/contradictions # Contradiction mapping
GET /api/analysis/patterns     # Rhetoric pattern analysis
```

## License

MIT

---

*Apatheia Labs • Clarity Without Distortion*
