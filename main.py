import json
import sqlite3
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, APIRouter
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

from data_quality import normalize_dashboard_payload, validate_dashboard_payload
from analysis_engine import AnalysisEngine

app = FastAPI(title="Apatheia API", version="1.0.0", description="API for Apatheia Political Rhetoric Observatory backed by SQLite")

DB_PATH = os.path.join(os.path.dirname(__file__), "apatheia.db")
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

def query_db(query, args=(), one=False):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute(query, args)
    rv = cur.fetchall()
    conn.close()
    return (rv[0] if rv else None) if one else rv


def load_json(filename, fallback):
    filepath = os.path.join(DATA_DIR, filename)
    if not os.path.exists(filepath):
        return fallback
    with open(filepath, "r", encoding="utf-8") as handle:
        return json.load(handle)

api_router = APIRouter(prefix="/api")

# Initialize analysis engine
analysis_engine = AnalysisEngine()

@api_router.get("/dashboard")
def get_dashboard():
    """Returns the full dataset reconstructed from the SQLite DB for frontend compatibility."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [row["name"] for row in cursor.fetchall()]

    dashboard_data = {}
    for table in tables:
        cursor.execute(f'SELECT id, data FROM "{table}"')
        rows = cursor.fetchall()
        
        # Determine if original shape was dict/scalar or list based on ID convention
        if len(rows) == 1 and rows[0]["id"] == table:
            data_val = json.loads(rows[0]["data"])
            if len(data_val) == 1 and "value" in data_val:
                dashboard_data[table] = data_val["value"]
            else:
                dashboard_data[table] = data_val
        else:
            dashboard_data[table] = [json.loads(row["data"]) for row in rows]
            
    conn.close()
    taxonomy = load_json("taxonomy.json", {})
    normalize_dashboard_payload(dashboard_data, taxonomy)
    dashboard_data["taxonomy"] = taxonomy
    dashboard_data["data_quality"] = validate_dashboard_payload(dashboard_data, taxonomy)
    return dashboard_data

@api_router.get("/profiles")
def get_profiles():
    rows = query_db('SELECT data FROM "profiles"')
    return [json.loads(r["data"]) for r in rows]

@api_router.get("/profiles/{profile_id}")
def get_profile(profile_id: str):
    row = query_db('SELECT data FROM "profiles" WHERE id = ?', (profile_id,), one=True)
    if row:
        return json.loads(row["data"])
    return {"error": "Profile not found"}

@api_router.get("/contradictions")
def get_contradictions():
    rows = query_db('SELECT data FROM "contradictions"')
    return [json.loads(r["data"]) for r in rows]

@api_router.get("/evidence")
def get_evidence():
    rows = query_db('SELECT data FROM "evidence"')
    return [json.loads(r["data"]) for r in rows]

@api_router.get("/documents")
def get_documents():
    rows = query_db('SELECT data FROM "documents"')
    return [json.loads(r["data"]) for r in rows]

@api_router.get("/themes")
def get_themes():
    rows = query_db('SELECT data FROM "themes"')
    return [json.loads(r["data"]) for r in rows]

@api_router.get("/analysis")
def get_analysis():
    """Run comprehensive political analysis on all available data."""
    return analysis_engine.run_full_analysis()

@api_router.get("/analysis/sentiment")
def get_sentiment_analysis():
    """Get sentiment analysis of political claims."""
    results = analysis_engine.run_full_analysis()
    return results.get('sentiment_analysis', {})

@api_router.get("/analysis/trends")
def get_trend_analysis():
    """Get trend analysis of position changes."""
    results = analysis_engine.run_full_analysis()
    return results.get('trend_analysis', {})

@api_router.get("/analysis/contradictions")
def get_contradiction_analysis():
    """Get detailed contradiction analysis."""
    results = analysis_engine.run_full_analysis()
    return results.get('contradiction_analysis', {})

@api_router.get("/analysis/patterns")
def get_rhetoric_patterns():
    """Get rhetoric pattern analysis."""
    results = analysis_engine.run_full_analysis()
    return results.get('rhetoric_patterns', {})

app.include_router(api_router)

app.mount("/css", StaticFiles(directory=".", html=False), name="static_css")
app.mount("/js", StaticFiles(directory=".", html=False), name="static_js")

@app.get("/")
def read_root():
    html_path = os.path.join(os.path.dirname(__file__), "index.html")
    with open(html_path, "r", encoding="utf-8") as f:
        return HTMLResponse(f.read())

@app.get("/base.css", include_in_schema=False)
def get_base_css():
    with open(os.path.join(os.path.dirname(__file__), "base.css"), "r", encoding="utf-8") as f:
        return HTMLResponse(f.read(), media_type="text/css")
        
@app.get("/style.css", include_in_schema=False)
def get_style_css():
    with open(os.path.join(os.path.dirname(__file__), "style.css"), "r", encoding="utf-8") as f:
        return HTMLResponse(f.read(), media_type="text/css")

@app.get("/premium-theme.css", include_in_schema=False)
def get_premium_theme_css():
    with open(os.path.join(os.path.dirname(__file__), "premium-theme.css"), "r", encoding="utf-8") as f:
        return HTMLResponse(f.read(), media_type="text/css")

@app.get("/app.js", include_in_schema=False)
def get_app_js():
    with open(os.path.join(os.path.dirname(__file__), "app.js"), "r", encoding="utf-8") as f:
        return HTMLResponse(f.read(), media_type="application/javascript")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
