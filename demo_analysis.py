#!/usr/bin/env python3
"""
Apatheia Observatory - Analysis Demonstration

This script demonstrates the enhanced analytical capabilities of the 
Apatheia Political Rhetoric Observatory platform.
"""

import sys
import os
from datetime import datetime

# Add current directory to path
sys.path.insert(0, os.path.dirname(__file__))

try:
    from analysis_engine import AnalysisEngine
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Please ensure you're running from the project root directory.")
    sys.exit(1)

# Simple tabulate function for formatting tables
def tabulate(data, headers=None, tablefmt=None):
    """Simple table formatting function."""
    result = []
    if headers:
        result.append(" | ".join(headers))
        result.append("-" * 60)
    for row in data:
        result.append(" | ".join(str(item) for item in row))
    return "\n".join(result)

def print_header(title):
    """Print a formatted header."""
    print(f"\n{'='*60}")
    print(f"📊 {title.upper()}")
    print(f"{'='*60}")

def print_section(title):
    """Print a formatted section header."""
    print(f"\n📋 {title}")
    print("-" * 40)

def format_number(num, decimals=2):
    """Format numbers for display."""
    try:
        return f"{num:.{decimals}f}"
    except (ValueError, TypeError):
        return str(num)

def demo_sentiment_analysis(engine):
    """Demonstrate sentiment analysis capabilities."""
    print_header("Sentiment Analysis Demo")
    
    results = engine.run_full_analysis()
    sentiment = results['sentiment_analysis']
    overall = sentiment['overall_sentiment']
    
    print_section("Overall Sentiment Statistics")
    stats_table = [
        ["Average Sentiment Score", format_number(overall['average_sentiment_score'], 3)],
        ["Positive Claims", overall['sentiment_distribution']['positive']],
        ["Neutral Claims", overall['sentiment_distribution']['neutral']],
        ["Negative Claims", overall['sentiment_distribution']['negative']],
        ["Score Range", f"{format_number(overall['score_range']['min'], 3)} to {format_number(overall['score_range']['max'], 3)}"],
    ]
    print(tabulate(stats_table, headers=["Metric", "Value"], tablefmt="grid"))
    
    print_section("Sample Claim Analysis")
    if sentiment['claim_analyses']:
        sample = sentiment['claim_analyses'][0]
        sample_table = [
            ["Claim ID", sample['claim_id']],
            ["Politician", sample['politician_id']],
            ["Issue", sample['issue_id']],
            ["Date", sample['date']],
            ["Sentiment Score", format_number(sample['sentiment_score'], 3)],
            ["Sentiment Label", sample['sentiment_label']],
            ["Intensity", sample['intensity']],
            ["Word Count", sample['word_count']],
        ]
        print(tabulate(sample_table, headers=["Property", "Value"], tablefmt="grid"))
        
        if sample['positive_words']:
            print(f"\n🟢 Positive words: {', '.join(sample['positive_words'][:5])}")
        if sample['negative_words']:
            print(f"🔴 Negative words: {', '.join(sample['negative_words'][:5])}")

def demo_trend_analysis(engine):
    """Demonstrate trend detection capabilities."""
    print_header("Trend Analysis Demo")
    
    results = engine.run_full_analysis()
    trends = results['trend_analysis']
    
    print_section("Trend Overview")
    overview_table = [
        ["Total Trends Detected", len(trends['trends'])],
        ["Overall Volatility", format_number(trends['overall_volatility'], 3)],
        ["Politicians with Trends", len(set(t['politician_id'] for t in trends['trends']))],
        ["Issues with Trends", len(set(t['issue_id'] for t in trends['trends']))],
    ]
    print(tabulate(overview_table, headers=["Metric", "Value"], tablefmt="grid"))
    
    print_section("Significant Position Trends")
    if trends['trends']:
        # Sort by change magnitude
        significant_trends = sorted(
            trends['trends'], 
            key=lambda x: x['change_magnitude'], 
            reverse=True
        )[:5]  # Top 5 most significant
        
        trend_data = []
        for trend in significant_trends:
            trend_data.append([
                trend['politician_id'],
                trend['issue_id'],
                trend['change_direction'],
                format_number(trend['change_magnitude']),
                format_number(trend['volatility']),
                trend['position_count']
            ])
        
        print(tabulate(
            trend_data, 
            headers=["Politician", "Issue", "Direction", "Magnitude", "Volatility", "Positions"],
            tablefmt="grid"
        ))

def demo_contradiction_analysis(engine):
    """Demonstrate contradiction analysis capabilities."""
    print_header("Contradiction Analysis Demo")
    
    results = engine.run_full_analysis()
    contradictions = results['contradiction_analysis']
    summary = contradictions['summary']
    
    print_section("Contradiction Overview")
    overview_table = [
        ["Total Contradictions", summary['total_contradictions']],
        ["High Severity", summary['high_severity_count']],
        ["Unresolved", summary['unresolved_count']],
        ["Unique Actors", len(set(c['actor'] for c in contradictions['analysis']))],
    ]
    print(tabulate(overview_table, headers=["Metric", "Value"], tablefmt="grid"))
    
    print_section("Contradictions by Severity")
    severity_data = [[severity, count] for severity, count in summary['by_severity'].items()]
    print(tabulate(severity_data, headers=["Severity", "Count"], tablefmt="grid"))
    
    print_section("High Severity Contradictions")
    high_severity = [c for c in contradictions['analysis'] if c['severity'] == 'high']
    if high_severity:
        for contra in high_severity[:3]:  # Show top 3
            print(f"\n🔴 {contra['title']}")
            print(f"   Actor: {contra['actor']}")
            print(f"   Counterparty: {contra['counterparty']}")
            print(f"   Date Range: {contra['date_range']}")
            print(f"   Themes: {', '.join(contra['themes'][:3])}")
            print(f"   Summary: {contra['summary'][:100]}...")

def demo_rhetoric_patterns(engine):
    """Demonstrate rhetoric pattern detection."""
    print_header("Rhetoric Pattern Analysis Demo")
    
    results = engine.run_full_analysis()
    patterns = results['rhetoric_patterns']
    
    print_section("Pattern Overview")
    overview_table = [
        ["Total Patterns Detected", patterns['pattern_count']],
        ["Politicians Analyzed", len(patterns['patterns'])],
        ["Total Claims Analyzed", sum(p['claim_count'] for p in patterns['patterns'])],
    ]
    print(tabulate(overview_table, headers=["Metric", "Value"], tablefmt="grid"))
    
    print_section("Politician Rhetoric Patterns")
    if patterns['patterns']:
        pattern_data = []
        for pattern in sorted(patterns['patterns'], key=lambda x: x['claim_count'], reverse=True)[:5]:
            time_span = f"{pattern['time_span']['start']} to {pattern['time_span']['end']}"
            pattern_data.append([
                pattern['politician_id'],
                pattern['claim_count'],
                time_span,
                pattern['average_claim_frequency'],
                len(pattern['top_terms']),
                ', '.join(list(pattern['top_venues'].keys())[:2])
            ])
        
        print(tabulate(
            pattern_data,
            headers=["Politician", "Claims", "Time Span", "Avg Frequency (days)", "Top Terms", "Top Venues"],
            tablefmt="grid"
        ))

def demo_comprehensive_analysis(engine):
    """Run and display comprehensive analysis."""
    print_header("Comprehensive Analysis Dashboard")
    
    results = engine.run_full_analysis()
    
    # Create dashboard-style summary
    dashboard_data = [
        ["Analysis Timestamp", results['timestamp'].split('T')[0]],
        ["Total Claims Analyzed", results['data_sources']['claims_count']],
        ["Total Positions Analyzed", results['data_sources']['positions_count']],
        ["Total Contradictions", results['data_sources']['contradictions_count']],
        ["Politicians Tracked", results['data_sources']['politicians_count']],
        ["Issues Monitored", results['data_sources']['issues_count']],
    ]
    
    print_section("Data Overview")
    print(tabulate(dashboard_data, headers=["Metric", "Value"], tablefmt="grid"))
    
    # Analysis summaries
    sentiment = results['sentiment_analysis']['overall_sentiment']
    trends = results['trend_analysis']
    contradictions = results['contradiction_analysis']['summary']
    patterns = results['rhetoric_patterns']
    
    analysis_summary = [
        ["Sentiment Analysis", f"Score: {format_number(sentiment['average_sentiment_score'], 3)}"],
        ["Trend Detection", f"{len(trends['trends'])} trends, volatility: {format_number(trends['overall_volatility'], 2)}"],
        ["Contradiction Analysis", f"{contradictions['total_contradictions']} total, {contradictions['high_severity_count']} high severity"],
        ["Rhetoric Patterns", f"{patterns['pattern_count']} patterns detected"],
    ]
    
    print_section("Analysis Summary")
    print(tabulate(analysis_summary, headers=["Analysis Type", "Key Findings"], tablefmt="grid"))

def main():
    """Main demonstration function."""
    print("🚀 APATHEIA OBSERVATORY - ANALYSIS DEMONSTRATION")
    print("=" * 60)
    print("Transforming political data into actionable intelligence")
    print("=" * 60)
    
    # Initialize analysis engine
    print("\n🔄 Initializing Analysis Engine...")
    try:
        engine = AnalysisEngine()
        print("✅ Engine ready!")
    except Exception as e:
        print(f"❌ Failed to initialize engine: {e}")
        return
    
    # Run demonstrations
    try:
        demo_comprehensive_analysis(engine)
        demo_sentiment_analysis(engine)
        demo_trend_analysis(engine)
        demo_contradiction_analysis(engine)
        demo_rhetoric_patterns(engine)
        
        # Final summary
        print_header("Demonstration Complete")
        print("🎯 All analysis modules demonstrated successfully!")
        print("\n📊 Key Capabilities Showcased:")
        print("   ✅ Sentiment Analysis - Political tone assessment")
        print("   ✅ Trend Detection - Position change tracking")
        print("   ✅ Contradiction Analysis - Inconsistency mapping")
        print("   ✅ Rhetoric Patterns - Recurring term identification")
        print("\n🚀 Ready for production use!")
        
    except KeyboardInterrupt:
        print("\n\n🛑 Demonstration interrupted by user.")
    except Exception as e:
        print(f"\n❌ Demonstration failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()