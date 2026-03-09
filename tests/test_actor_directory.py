import os
import sys
import unittest

ROOT = os.path.dirname(os.path.dirname(__file__))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from dashboard_contract import DASHBOARD_PATH, load_canonical_dashboard
from dashboard_builder import build_actor_directory


class ActorDirectoryTests(unittest.TestCase):
    def test_actor_directory_has_expected_categories(self):
        payload = build_actor_directory(load_canonical_dashboard(DASHBOARD_PATH))
        self.assertIsInstance(payload["actors"], list)
        category_ids = {item["id"] for item in payload["categories"]}
        self.assertIn("all", category_ids)
        self.assertIn("politicians", category_ids)
        self.assertIn("news_networks", category_ids)
        self.assertIn("reporters", category_ids)

    def test_actor_entries_have_required_shape(self):
        payload = build_actor_directory(load_canonical_dashboard(DASHBOARD_PATH))
        self.assertGreater(len(payload["actors"]), 0)
        sample = payload["actors"][0]
        for key in ("id", "name", "category", "affiliation", "summary", "evidence_count", "themes", "profile_id"):
            self.assertIn(key, sample)


if __name__ == "__main__":
    unittest.main()
