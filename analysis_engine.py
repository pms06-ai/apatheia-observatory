"""NLP-backed analysis engine for claims, trends, and contradictions."""

from __future__ import annotations

import json
import os
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import datetime, timezone
from statistics import pstdev
from typing import Any

from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

POSITION_SCALE = {
    "strongly-oppose": -2.0,
    "oppose": -1.0,
    "lean-oppose": -0.5,
    "neutral": 0.0,
    "lean-support": 0.5,
    "support": 1.0,
    "strongly-support": 2.0,
}


def _load_json(path: str, fallback: Any) -> Any:
    if not os.path.exists(path):
        return fallback
    with open(path, "r", encoding="utf-8") as handle:
        return json.load(handle)


@dataclass
class SentimentAnalyzer:
    _analyzer: SentimentIntensityAnalyzer

    def __init__(self) -> None:
        self._analyzer = SentimentIntensityAnalyzer()

    def analyze_claim(self, claim: dict[str, Any]) -> dict[str, Any]:
        text = claim.get("verbatim") or claim.get("paraphrase") or ""
        scores = self._analyzer.polarity_scores(text)
        compound = scores["compound"]
        if compound >= 0.05:
            label = "positive"
        elif compound <= -0.05:
            label = "negative"
        else:
            label = "neutral"
        return {
            "id": claim.get("id"),
            "politician_id": claim.get("politician_id"),
            "issue_id": claim.get("issue_id"),
            "date": claim.get("date"),
            "venue": claim.get("venue"),
            "sentiment_score": round(compound, 4),
            "sentiment_label": label,
            "vader": {
                "pos": round(scores["pos"], 4),
                "neg": round(scores["neg"], 4),
                "neu": round(scores["neu"], 4),
                "compound": round(scores["compound"], 4),
            },
        }

    def analyze_batch(self, claims: list[dict[str, Any]]) -> dict[str, Any]:
        analyses = [self.analyze_claim(claim) for claim in claims]
        if not analyses:
            return {
                "claim_analyses": [],
                "overall_sentiment": {
                    "average_sentiment_score": 0.0,
                    "sentiment_distribution": {"positive": 0, "neutral": 0, "negative": 0},
                    "score_range": {"min": 0.0, "max": 0.0},
                },
            }
        scores = [row["sentiment_score"] for row in analyses]
        distribution = Counter(row["sentiment_label"] for row in analyses)
        return {
            "claim_analyses": analyses,
            "overall_sentiment": {
                "average_sentiment_score": round(sum(scores) / len(scores), 4),
                "sentiment_distribution": {
                    "positive": distribution.get("positive", 0),
                    "neutral": distribution.get("neutral", 0),
                    "negative": distribution.get("negative", 0),
                },
                "score_range": {"min": round(min(scores), 4), "max": round(max(scores), 4)},
            },
        }


class TrendDetector:
    @staticmethod
    def _position_value(label: str | None) -> float | None:
        if not label:
            return None
        return POSITION_SCALE.get(label)

    def detect_position_trends(self, positions: list[dict[str, Any]]) -> dict[str, Any]:
        groups: dict[tuple[str, str], list[dict[str, Any]]] = defaultdict(list)
        for pos in positions:
            pid = pos.get("politician_id")
            issue_id = pos.get("issue_id")
            if pid and issue_id:
                groups[(pid, issue_id)].append(pos)

        trends = []
        volatilities = []
        for (pid, issue_id), series in groups.items():
            ordered = sorted(series, key=lambda row: row.get("date", ""))
            values = [self._position_value(row.get("position")) for row in ordered]
            values = [value for value in values if value is not None]
            if len(values) < 2:
                continue

            change = values[-1] - values[0]
            if change > 0:
                direction = "toward_support"
            elif change < 0:
                direction = "toward_oppose"
            else:
                direction = "stable"

            volatility = pstdev(values)
            volatilities.append(volatility)
            trends.append(
                {
                    "politician_id": pid,
                    "issue_id": issue_id,
                    "first_position": values[0],
                    "latest_position": values[-1],
                    "change_direction": direction,
                    "change_magnitude": round(abs(change), 4),
                    "volatility": round(volatility, 4),
                    "observations": len(values),
                }
            )

        return {
            "trends": sorted(
                trends,
                key=lambda row: (row["change_magnitude"], row["volatility"]),
                reverse=True,
            ),
            "overall_volatility": round(sum(volatilities) / len(volatilities), 4)
            if volatilities
            else 0.0,
            "trend_count": len(trends),
        }


class ContradictionAnalyzer:
    def analyze_contradictions(
        self, contradictions: list[dict[str, Any]], claims: list[dict[str, Any]]
    ) -> dict[str, Any]:
        severity_counts = Counter(item.get("severity", "unknown") for item in contradictions)
        actor_counts = Counter(item.get("actor", "Unknown") for item in contradictions)
        theme_counts = Counter()
        for contradiction in contradictions:
            for theme in contradiction.get("themes", []) or []:
                theme_counts[theme] += 1

        claim_ids = {claim.get("id") for claim in claims}
        unresolved = 0
        for contradiction in contradictions:
            status = (contradiction.get("resolution_status") or "").strip().lower()
            if not status or status == "unresolved":
                unresolved += 1
        referenced_claims = len([c for c in contradictions if c.get("id") in claim_ids])

        return {
            "analysis": contradictions,
            "summary": {
                "total_contradictions": len(contradictions),
                "severity_distribution": dict(severity_counts),
                "top_actors": actor_counts.most_common(10),
                "top_themes": theme_counts.most_common(10),
                "high_severity_count": severity_counts.get("high", 0)
                + severity_counts.get("critical", 0),
                "unresolved_count": unresolved,
                "contradiction_ids_also_claim_ids": referenced_claims,
            },
        }


class AnalysisEngine:
    def __init__(self, data_dir: str | None = None) -> None:
        self.data_dir = data_dir or os.path.join(os.path.dirname(__file__), "data")
        self.sentiment_analyzer = SentimentAnalyzer()
        self.trend_detector = TrendDetector()
        self.contradiction_analyzer = ContradictionAnalyzer()

    def load_data(self) -> dict[str, list[dict[str, Any]]]:
        claims_payload = _load_json(os.path.join(self.data_dir, "claims.json"), {"claims": []})
        positions_payload = _load_json(
            os.path.join(self.data_dir, "position_history.json"), {"positions": []}
        )
        contradictions_payload = _load_json(
            os.path.join(self.data_dir, "contradictions.json"), []
        )
        politicians_payload = _load_json(
            os.path.join(self.data_dir, "politicians.json"), {"politicians": []}
        )
        issues_payload = _load_json(os.path.join(self.data_dir, "issues.json"), {"issues": []})

        contradictions = (
            contradictions_payload
            if isinstance(contradictions_payload, list)
            else contradictions_payload.get("contradictions", [])
        )
        return {
            "claims": claims_payload.get("claims", []),
            "positions": positions_payload.get("positions", []),
            "contradictions": contradictions,
            "politicians": politicians_payload.get("politicians", []),
            "issues": issues_payload.get("issues", []),
        }

    def run_full_analysis(self) -> dict[str, Any]:
        data = self.load_data()
        sentiment = self.sentiment_analyzer.analyze_batch(data["claims"])
        trends = self.trend_detector.detect_position_trends(data["positions"])
        contradictions = self.contradiction_analyzer.analyze_contradictions(
            data["contradictions"], data["claims"]
        )
        return {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data_sources": {
                "claims_count": len(data["claims"]),
                "positions_count": len(data["positions"]),
                "contradictions_count": len(data["contradictions"]),
                "politicians_count": len(data["politicians"]),
                "issues_count": len(data["issues"]),
            },
            "sentiment_analysis": sentiment,
            "trend_analysis": trends,
            "contradiction_analysis": contradictions,
        }
