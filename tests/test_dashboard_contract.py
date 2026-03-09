import os
import sys
import unittest

ROOT = os.path.dirname(os.path.dirname(__file__))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from dashboard_contract import DASHBOARD_PATH, CONTRACT_VERSION, load_canonical_dashboard


class DashboardContractTests(unittest.TestCase):
    def test_dashboard_contract_loads(self):
        payload = load_canonical_dashboard(DASHBOARD_PATH)
        self.assertEqual(payload["schemaVersion"], CONTRACT_VERSION)
        self.assertIsInstance(payload["profiles"], list)
        self.assertIsInstance(payload["themes"], list)
        self.assertIsInstance(payload["evidence"], list)
        self.assertIsInstance(payload["documents"], list)
        self.assertIsInstance(payload["manifest"]["document_count"], int)

    def test_dashboard_file_exists(self):
        self.assertTrue(os.path.exists(DASHBOARD_PATH))


if __name__ == "__main__":
    unittest.main()
