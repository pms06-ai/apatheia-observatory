import json
import os
import sys
import time

ROOT = os.path.dirname(os.path.dirname(__file__))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from dashboard_contract import DASHBOARD_PATH, load_canonical_dashboard


MAX_PAYLOAD_BYTES = 3_500_000
MAX_PARSE_SECONDS = 0.35


def main() -> None:
    with open(DASHBOARD_PATH, "rb") as handle:
        payload_bytes = handle.read()
    size = len(payload_bytes)
    if size > MAX_PAYLOAD_BYTES:
        raise SystemExit(
            f"dashboard payload exceeds budget: {size} > {MAX_PAYLOAD_BYTES} bytes"
        )

    start = time.perf_counter()
    load_canonical_dashboard(DASHBOARD_PATH)
    elapsed = time.perf_counter() - start
    if elapsed > MAX_PARSE_SECONDS:
        raise SystemExit(
            f"dashboard parse/validation exceeded budget: {elapsed:.3f}s > {MAX_PARSE_SECONDS:.3f}s"
        )

    print(
        json.dumps(
            {
                "dashboard_bytes": size,
                "parse_seconds": round(elapsed, 4),
                "status": "ok",
            }
        )
    )


if __name__ == "__main__":
    main()
