import sqlite3
import json
import os
from typing import Any, Dict, List

DB_PATH = "apatheia.db"
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

# Tables and their corresponding JSON files with data extraction paths
TABLE_CONFIGS = {
    # Core political tracking tables
    "politicians": {
        "file": "politicians.json",
        "data_path": "politicians",
        "id_field": "id"
    },
    "issues": {
        "file": "issues.json",
        "data_path": "issues",
        "id_field": "id"
    },
    "talking_points": {
        "file": "talking_points.json",
        "data_path": "talking_points",
        "id_field": "id"
    },
    "claims": {
        "file": "claims.json",
        "data_path": "claims",
        "id_field": "id"
    },
    "sources": {
        "file": "sources.json",
        "data_path": "sources",
        "id_field": "id"
    },
    "position_history": {
        "file": "position_history.json",
        "data_path": "positions",
        "id_field": "id"
    },
    "contradictions": {
        "file": "contradictions.json",
        "data_path": None,  # Root level array
        "id_field": "id"
    },
    # Legacy tables from original dashboard
    "profiles": {
        "file": "profiles.json",
        "data_path": None,
        "id_field": "id"
    },
    "parties": {
        "file": "parties.json",
        "data_path": None,
        "id_field": "party"
    },
    "themes": {
        "file": "themes.json",
        "data_path": None,
        "id_field": "name"
    },
    "timeline": {
        "file": "timeline.json",
        "data_path": None,
        "id_field": None  # Will use index
    },
    "matrix": {
        "file": "matrix.json",
        "data_path": None,
        "id_field": None
    }
}

def create_table(cursor: sqlite3.Cursor, table: str) -> None:
    """Create a table with id and JSON data columns."""
    cursor.execute(f'''
        CREATE TABLE IF NOT EXISTS "{table}" (
            id TEXT PRIMARY KEY,
            data JSON NOT NULL
        )
    ''')

def create_indexes(cursor: sqlite3.Cursor) -> None:
    """Create indexes for common queries."""
    indexes = [
        # Politicians by party
        ("idx_politicians_party", "politicians", "json_extract(data, '$.party')"),
        # Talking points by issue
        ("idx_talking_points_issue", "talking_points", "json_extract(data, '$.issue_id')"),
        # Claims by politician
        ("idx_claims_politician", "claims", "json_extract(data, '$.politician_id')"),
        # Claims by issue
        ("idx_claims_issue", "claims", "json_extract(data, '$.issue_id')"),
        # Position history by politician
        ("idx_positions_politician", "position_history", "json_extract(data, '$.politician_id')"),
        # Position history by issue
        ("idx_positions_issue", "position_history", "json_extract(data, '$.issue_id')"),
    ]

    for idx_name, table, column in indexes:
        try:
            cursor.execute(f'CREATE INDEX IF NOT EXISTS {idx_name} ON "{table}" ({column})')
        except sqlite3.OperationalError:
            pass  # Table might not exist yet

def insert_data(cursor: sqlite3.Cursor, table: str, item: Any, item_id: str) -> None:
    """Insert or replace a record in the table."""
    cursor.execute(f'''
        INSERT OR REPLACE INTO "{table}" (id, data)
        VALUES (?, ?)
    ''', (str(item_id), json.dumps(item)))

def extract_data(data: Any, path: str | None) -> List[Any]:
    """Extract data from a JSON structure using a dot-separated path."""
    if path is None:
        return data if isinstance(data, list) else [data]

    result = data
    for key in path.split('.'):
        if isinstance(result, dict):
            result = result.get(key, [])
        else:
            return []

    return result if isinstance(result, list) else [result]

def load_json_file(filepath: str) -> Any:
    """Load and parse a JSON file."""
    if not os.path.exists(filepath):
        return None

    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)

def init_table(cursor: sqlite3.Cursor, table: str, config: Dict) -> int:
    """Initialize a single table from its JSON file. Returns count of records."""
    filepath = os.path.join(DATA_DIR, config["file"])
    data = load_json_file(filepath)

    if data is None:
        print(f"  Skipped {table}: file not found ({config['file']})")
        return 0

    create_table(cursor, table)

    items = extract_data(data, config["data_path"])
    id_field = config["id_field"]

    count = 0
    for i, item in enumerate(items):
        if isinstance(item, dict):
            if id_field:
                item_id = item.get(id_field, f"{table}_{i}")
            else:
                item_id = f"{table}_{i}"
        else:
            item_id = f"{table}_{i}"

        insert_data(cursor, table, item, item_id)
        count += 1

    return count

def init_legacy_dashboard(cursor: sqlite3.Cursor) -> None:
    """Load legacy dashboard.json into appropriate tables."""
    dashboard_path = os.path.join(DATA_DIR, "dashboard.json")
    data = load_json_file(dashboard_path)

    if data is None:
        return

    print("  Loading legacy dashboard.json...")
    for key, items in data.items():
        create_table(cursor, key)
        if isinstance(items, list):
            for i, item in enumerate(items):
                item_id = item.get("id", f"{key}_{i}") if isinstance(item, dict) else f"{key}_{i}"
                insert_data(cursor, key, item, item_id)
        elif isinstance(items, dict):
            insert_data(cursor, key, items, key)
        else:
            insert_data(cursor, key, {"value": items}, key)
    print(f"    Loaded {len(data)} legacy tables")

def create_views(cursor: sqlite3.Cursor) -> None:
    """Create useful views for common queries."""
    views = [
        # Politicians with claim counts
        ("""
        CREATE VIEW IF NOT EXISTS v_politician_stats AS
        SELECT
            p.id,
            json_extract(p.data, '$.name') as name,
            json_extract(p.data, '$.party') as party,
            json_extract(p.data, '$.chamber') as chamber,
            COUNT(DISTINCT c.id) as claim_count,
            COUNT(DISTINCT pos.id) as position_count
        FROM politicians p
        LEFT JOIN claims c ON json_extract(c.data, '$.politician_id') = p.id
        LEFT JOIN position_history pos ON json_extract(pos.data, '$.politician_id') = p.id
        GROUP BY p.id
        """),

        # Issues with claim counts
        ("""
        CREATE VIEW IF NOT EXISTS v_issue_stats AS
        SELECT
            i.id,
            json_extract(i.data, '$.name') as name,
            json_extract(i.data, '$.category') as category,
            COUNT(DISTINCT c.id) as claim_count,
            COUNT(DISTINCT tp.id) as talking_point_count
        FROM issues i
        LEFT JOIN claims c ON json_extract(c.data, '$.issue_id') = i.id
        LEFT JOIN talking_points tp ON json_extract(tp.data, '$.issue_id') = i.id
        GROUP BY i.id
        """),

        # Talking points by party
        ("""
        CREATE VIEW IF NOT EXISTS v_talking_points_by_party AS
        SELECT
            json_extract(data, '$.party') as party,
            json_extract(data, '$.issue_id') as issue_id,
            COUNT(*) as count
        FROM talking_points
        GROUP BY json_extract(data, '$.party'), json_extract(data, '$.issue_id')
        """)
    ]

    for view_sql in views:
        try:
            cursor.execute(view_sql)
        except sqlite3.OperationalError as e:
            print(f"  Warning: Could not create view: {e}")

def init_db() -> None:
    """Initialize the complete database."""
    # Remove existing database for clean start
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
        print(f"Removed existing {DB_PATH}")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    print("Initializing Apatheia Political Tracking Database...")
    print("-" * 50)

    # Initialize all configured tables
    total_records = 0
    for table, config in TABLE_CONFIGS.items():
        count = init_table(cursor, table, config)
        if count > 0:
            print(f"  {table}: {count} records")
            total_records += count

    # Load legacy dashboard
    init_legacy_dashboard(cursor)

    # Create indexes
    print("\nCreating indexes...")
    create_indexes(cursor)

    # Create views
    print("Creating views...")
    create_views(cursor)

    conn.commit()
    conn.close()

    print("-" * 50)
    print(f"Database initialization complete: {total_records} records total")
    print(f"Database saved to: {DB_PATH}")

def query_example() -> None:
    """Run some example queries to verify the database."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    print("\n=== Example Queries ===\n")

    # Count politicians by party
    cursor.execute("""
        SELECT json_extract(data, '$.party') as party, COUNT(*) as count
        FROM politicians
        GROUP BY json_extract(data, '$.party')
        ORDER BY count DESC
    """)
    print("Politicians by party:")
    for row in cursor.fetchall():
        print(f"  {row[0]}: {row[1]}")

    # Count issues by category
    cursor.execute("""
        SELECT json_extract(data, '$.category') as category, COUNT(*) as count
        FROM issues
        GROUP BY json_extract(data, '$.category')
        ORDER BY count DESC
    """)
    print("\nIssues by category:")
    for row in cursor.fetchall():
        print(f"  {row[0]}: {row[1]}")

    # Count talking points by party
    cursor.execute("""
        SELECT json_extract(data, '$.party') as party, COUNT(*) as count
        FROM talking_points
        GROUP BY json_extract(data, '$.party')
        ORDER BY count DESC
    """)
    print("\nTalking points by party:")
    for row in cursor.fetchall():
        print(f"  {row[0]}: {row[1]}")

    # Top issues by claim count
    cursor.execute("""
        SELECT json_extract(data, '$.issue_id') as issue, COUNT(*) as count
        FROM claims
        GROUP BY json_extract(data, '$.issue_id')
        ORDER BY count DESC
        LIMIT 5
    """)
    print("\nTop issues by claim count:")
    for row in cursor.fetchall():
        print(f"  {row[0]}: {row[1]}")

    conn.close()

if __name__ == "__main__":
    init_db()
    query_example()
