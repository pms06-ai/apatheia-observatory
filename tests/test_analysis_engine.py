import os
import sys
import unittest

ROOT = os.path.dirname(os.path.dirname(__file__))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from analysis_engine import AnalysisEngine, ContradictionAnalyzer, SentimentAnalyzer, TrendDetector


class SentimentAnalyzerTests(unittest.TestCase):
    def setUp(self):
        self.analyzer = SentimentAnalyzer()

    def test_positive_sentiment(self):
        claim = {
            "id": "c1",
            "verbatim": "This policy is excellent and a strong success for peace.",
            "politician_id": "p1",
            "issue_id": "i1",
            "date": "2026-03-08",
        }
        result = self.analyzer.analyze_claim(claim)
        self.assertEqual(result["sentiment_label"], "positive")
        self.assertGreater(result["sentiment_score"], 0.05)

    def test_negative_sentiment(self):
        claim = {
            "id": "c2",
            "verbatim": "This is a disastrous and terrible decision that harms everyone.",
            "politician_id": "p2",
            "issue_id": "i1",
            "date": "2026-03-08",
        }
        result = self.analyzer.analyze_claim(claim)
        self.assertEqual(result["sentiment_label"], "negative")
        self.assertLess(result["sentiment_score"], -0.05)

    def test_empty_batch(self):
        result = self.analyzer.analyze_batch([])
        self.assertEqual(result["overall_sentiment"]["average_sentiment_score"], 0.0)
        self.assertEqual(result["overall_sentiment"]["sentiment_distribution"]["neutral"], 0)


class TrendDetectorTests(unittest.TestCase):
    def setUp(self):
        self.detector = TrendDetector()

    def test_detect_trend_direction(self):
        positions = [
            {
                "politician_id": "p1",
                "issue_id": "i1",
                "date": "2026-01-01",
                "position": "neutral",
            },
            {
                "politician_id": "p1",
                "issue_id": "i1",
                "date": "2026-01-10",
                "position": "oppose",
            },
            {
                "politician_id": "p1",
                "issue_id": "i1",
                "date": "2026-01-20",
                "position": "strongly-oppose",
            },
        ]
        result = self.detector.detect_position_trends(positions)
        self.assertEqual(result["trend_count"], 1)
        self.assertEqual(result["trends"][0]["change_direction"], "toward_oppose")
        self.assertGreater(result["trends"][0]["change_magnitude"], 0)

    def test_empty_positions(self):
        result = self.detector.detect_position_trends([])
        self.assertEqual(result["trend_count"], 0)
        self.assertEqual(result["overall_volatility"], 0.0)


class ContradictionAnalyzerTests(unittest.TestCase):
    def setUp(self):
        self.analyzer = ContradictionAnalyzer()

    def test_summary_counts(self):
        contradictions = [
            {"id": "x1", "severity": "high", "actor": "A", "themes": ["T1"]},
            {"id": "x2", "severity": "medium", "actor": "B", "themes": ["T1", "T2"]},
        ]
        claims = [{"id": "x1"}]
        result = self.analyzer.analyze_contradictions(contradictions, claims)
        self.assertEqual(result["summary"]["total_contradictions"], 2)
        self.assertEqual(result["summary"]["high_severity_count"], 1)
        self.assertEqual(result["summary"]["contradiction_ids_also_claim_ids"], 1)


class IntegrationTests(unittest.TestCase):
    def test_full_analysis_pipeline(self):
        engine = AnalysisEngine(data_dir=os.path.join(ROOT, "data"))
        result = engine.run_full_analysis()
        self.assertIn("sentiment_analysis", result)
        self.assertIn("trend_analysis", result)
        self.assertIn("contradiction_analysis", result)
        self.assertGreater(result["data_sources"]["claims_count"], 0)


if __name__ == "__main__":
    unittest.main()
