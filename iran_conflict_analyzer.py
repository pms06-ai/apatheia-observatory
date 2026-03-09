#!/usr/bin/env python3
"""
Iran Conflict Analyzer
Analyzes collected data to provide insights into the Iran-Israel conflict
"""

import json
import os
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple
from collections import defaultdict, Counter
import statistics
from iran_conflict_config import IRAN_CONFLICT_CONFIG, KEYWORDS_BY_SIDE

class IranConflictAnalyzer:
    """Main analyzer class for Iran conflict data"""
    
    def __init__(self, config=None, data_dir="data"):
        self.config = config or IRAN_CONFLICT_CONFIG
        self.data_dir = data_dir
        self.collected_data = None
        self.analysis_results = {
            'analysis_date': datetime.now().isoformat(),
            'issue_id': self.config['issue_id'],
            'politician_analysis': [],
            'media_analysis': [],
            'side_comparison': {},
            'trend_analysis': {},
            'contradiction_analysis': {},
            'reporter_analysis': []
        }
    
    def load_data(self, data=None):
        """Load data to analyze - either from files or provided data"""
        if data is None:
            # Load the latest collected data
            from iran_conflict_collector import IranConflictCollector
            collector = IranConflictCollector()
            self.collected_data = collector.load_latest_data()
            if 'error' in self.collected_data:
                raise ValueError("No collected data found. Run the collector first.")
        else:
            self.collected_data = data
        
        print(f"Loaded data for analysis:")
        print(f"  Statements: {len(self.collected_data['statements'])}")
        print(f"  Articles: {len(self.collected_data.get('articles', []))}")
    
    def analyze_all(self):
        """Run comprehensive analysis on all collected data"""
        print("Starting comprehensive Iran conflict analysis...")
        
        # Analyze politician statements
        self._analyze_politician_statements()
        
        # Analyze media coverage
        self._analyze_media_coverage()
        
        # Generate side-by-side comparison
        self._generate_side_comparison()
        
        # Perform trend analysis
        self._perform_trend_analysis()
        
        # Detect contradictions
        self._detect_contradictions()
        
        # Analyze reporter patterns
        self._analyze_reporter_patterns()
        
        # Save analysis results
        self._save_analysis_results()
        
        print("Analysis completed successfully!")
    
    def _analyze_politician_statements(self):
        """Analyze statements from all politicians"""
        print("Analyzing politician statements...")
        
        # Group statements by politician
        statements_by_politician = defaultdict(list)
        for statement in self.collected_data['statements']:
            statements_by_politician[statement['politician_id']].append(statement)
        
        # Analyze each politician
        for politician_id, statements in statements_by_politician.items():
            politician_info = self._find_politician_info(politician_id)
            if not politician_info:
                continue
                
            analysis = self._analyze_individual_politician(politician_info, statements)
            self.analysis_results['politician_analysis'].append(analysis)
    
    def _find_politician_info(self, politician_id: str) -> Dict:
        """Find politician info from config"""
        for side, politicians in self.config['politicians'].items():
            for politician in politicians:
                if politician['id'] == politician_id:
                    return {**politician, 'side': side}
        return None
    
    def _analyze_individual_politician(self, politician: Dict, statements: List[Dict]) -> Dict:
        """Analyze statements from a single politician"""
        # Calculate sentiment metrics
        sentiment_scores = [s['sentiment_score'] for s in statements]
        avg_sentiment = statistics.mean(sentiment_scores) if sentiment_scores else 0.5
        
        # Determine sentiment category
        sentiment_category = self._get_sentiment_category(avg_sentiment, politician['side'])
        
        # Extract keywords
        all_keywords = []
        for statement in statements:
            all_keywords.extend(statement['keywords'])
        
        keyword_counts = Counter(all_keywords)
        top_keywords = [kw for kw, count in keyword_counts.most_common(5)]
        
        # Calculate consistency
        consistency_score = self._calculate_consistency(statements)
        
        return {
            'politician_id': politician['id'],
            'name': politician['name'],
            'title': politician['title'],
            'country': politician['country'],
            'side': politician['side'],
            'statements_analyzed': len(statements),
            'average_sentiment': avg_sentiment,
            'sentiment_category': sentiment_category,
            'consistency_score': consistency_score,
            'top_keywords': top_keywords,
            'first_statement_date': min(s['date'] for s in statements) if statements else None,
            'last_statement_date': max(s['date'] for s in statements) if statements else None,
            'sample_statement': statements[0]['statement'] if statements else None
        }
    
    def _get_sentiment_category(self, score: float, side: str) -> str:
        """Categorize sentiment score based on thresholds"""
        thresholds = self.config['analysis_parameters']['sentiment_thresholds']
        
        if score >= thresholds['strongly_pro']:
            return 'strongly_pro'
        elif score >= thresholds['moderately_pro']:
            return 'moderately_pro'
        elif score >= thresholds['neutral']:
            return 'neutral'
        elif score >= thresholds['moderately_against']:
            return 'moderately_against'
        else:
            return 'strongly_against'
    
    def _calculate_consistency(self, statements: List[Dict]) -> float:
        """Calculate consistency score (0-1 where 1 is perfectly consistent)"""
        if len(statements) < 2:
            return 1.0
        
        sentiment_scores = [s['sentiment_score'] for s in statements]
        avg_score = statistics.mean(sentiment_scores)
        
        # Calculate variance from average
        variance = statistics.variance(sentiment_scores) if len(sentiment_scores) > 1 else 0
        
        # Convert variance to consistency score (lower variance = higher consistency)
        max_variance = 0.25  # Maximum expected variance
        consistency = max(0, 1 - (variance / max_variance))
        
        return round(consistency, 2)
    
    def _analyze_media_coverage(self):
        """Analyze media coverage from all outlets"""
        print("Analyzing media coverage...")
        
        if 'articles' not in self.collected_data or not self.collected_data['articles']:
            print("  No media articles to analyze")
            return
        
        # Group articles by outlet
        articles_by_outlet = defaultdict(list)
        for article in self.collected_data['articles']:
            articles_by_outlet[article['outlet_name']].append(article)
        
        # Analyze each outlet
        for outlet_name, articles in articles_by_outlet.items():
            outlet_info = self._find_outlet_info(outlet_name)
            if not outlet_info:
                continue
                
            analysis = self._analyze_individual_outlet(outlet_info, articles)
            self.analysis_results['media_analysis'].append(analysis)
    
    def _find_outlet_info(self, outlet_name: str) -> Dict:
        """Find outlet info from config"""
        for side, outlets in self.config['media_outlets'].items():
            for outlet in outlets:
                if outlet['name'] == outlet_name:
                    return {**outlet, 'side': side}
        return None
    
    def _analyze_individual_outlet(self, outlet: Dict, articles: List[Dict]) -> Dict:
        """Analyze articles from a single media outlet"""
        # Calculate sentiment (based on keywords and content analysis)
        sentiment_scores = []
        for article in articles:
            score = self._calculate_article_sentiment(article)
            sentiment_scores.append(score)
        
        avg_sentiment = statistics.mean(sentiment_scores) if sentiment_scores else 0.5
        sentiment_category = self._get_sentiment_category(avg_sentiment, outlet['side'])
        
        # Extract keywords
        all_keywords = []
        for article in articles:
            all_keywords.extend(article['keywords'])
        
        keyword_counts = Counter(all_keywords)
        top_keywords = [kw for kw, count in keyword_counts.most_common(5)]
        
        # Analyze reporter coverage
        reporters_covered = set()
        for article in articles:
            if 'reporter' in article and article['reporter']:
                reporters_covered.add(article['reporter']['name'])
        
        return {
            'outlet_name': outlet['name'],
            'country': outlet['country'],
            'bias': outlet['bias'],
            'side': outlet['side'],
            'articles_analyzed': len(articles),
            'average_sentiment': avg_sentiment,
            'sentiment_category': sentiment_category,
            'top_keywords': top_keywords,
            'reporters_covered': len(reporters_covered),
            'first_article_date': min(a['published_at'] for a in articles) if articles else None,
            'last_article_date': max(a['published_at'] for a in articles) if articles else None,
            'sample_article_title': articles[0]['title'] if articles else None
        }
    
    def _calculate_article_sentiment(self, article: Dict) -> float:
        """Calculate sentiment score for an article based on keywords and content"""
        text = (article['title'] + ' ' + article['description'] + ' ' + 
               (article['content'] or '')).lower()
        
        # Count keywords from each side
        pro_israel_count = sum(1 for kw in KEYWORDS_BY_SIDE['pro-israel'] if kw in text)
        pro_iran_count = sum(1 for kw in KEYWORDS_BY_SIDE['pro-iran'] if kw in text)
        neutral_count = sum(1 for kw in KEYWORDS_BY_SIDE['neutral'] if kw in text)
        
        total_keywords = pro_israel_count + pro_iran_count + neutral_count
        
        if total_keywords == 0:
            return 0.5  # Neutral if no keywords found
        
        # Calculate weighted score (pro-Israel keywords increase score, pro-Iran decrease)
        score = 0.5  # Start neutral
        score += (pro_israel_count / total_keywords) * 0.4  # Can add up to +0.4
        score -= (pro_iran_count / total_keywords) * 0.4  # Can subtract up to -0.4
        
        return round(score, 2)
    
    def _generate_side_comparison(self):
        """Generate comparison between pro-Israel and pro-Iran sides"""
        print("Generating side-by-side comparison...")
        
        # Group politician results by side
        pro_israel = [r for r in self.analysis_results['politician_analysis'] 
                     if r['side'] == 'pro-israel']
        pro_iran = [r for r in self.analysis_results['politician_analysis'] 
                   if r['side'] == 'pro-iran']
        neutral = [r for r in self.analysis_results['politician_analysis'] 
                  if r['side'] == 'neutral-unknown']
        
        # Group media results by side
        pro_israel_media = [r for r in self.analysis_results['media_analysis'] 
                          if r['side'] == 'pro-israel']
        pro_iran_media = [r for r in self.analysis_results['media_analysis'] 
                        if r['side'] == 'pro-iran']
        neutral_media = [r for r in self.analysis_results['media_analysis'] 
                       if r['side'] == 'neutral']
        
        # Calculate averages
        def calc_avg(results, field):
            values = [r[field] for r in results if field in r]
            return round(statistics.mean(values), 3) if values else None
        
        comparison = {
            'politicians': {
                'pro_israel': {
                    'count': len(pro_israel),
                    'avg_sentiment': calc_avg(pro_israel, 'average_sentiment'),
                    'avg_consistency': calc_avg(pro_israel, 'consistency_score')
                },
                'pro_iran': {
                    'count': len(pro_iran),
                    'avg_sentiment': calc_avg(pro_iran, 'average_sentiment'),
                    'avg_consistency': calc_avg(pro_iran, 'consistency_score')
                },
                'neutral': {
                    'count': len(neutral),
                    'avg_sentiment': calc_avg(neutral, 'average_sentiment'),
                    'avg_consistency': calc_avg(neutral, 'consistency_score')
                }
            },
            'media_outlets': {
                'pro_israel': {
                    'count': len(pro_israel_media),
                    'avg_sentiment': calc_avg(pro_israel_media, 'average_sentiment')
                },
                'pro_iran': {
                    'count': len(pro_iran_media),
                    'avg_sentiment': calc_avg(pro_iran_media, 'average_sentiment')
                },
                'neutral': {
                    'count': len(neutral_media),
                    'avg_sentiment': calc_avg(neutral_media, 'average_sentiment')
                }
            },
            'overall_sentiment_balance': self._calculate_sentiment_balance()
        }
        
        self.analysis_results['side_comparison'] = comparison
    
    def _calculate_sentiment_balance(self) -> Dict:
        """Calculate overall sentiment balance in the conflict"""
        all_sentiments = []
        
        # Add politician sentiments
        for politician in self.analysis_results['politician_analysis']:
            all_sentiments.append(politician['average_sentiment'])
        
        # Add media sentiments
        for media in self.analysis_results['media_analysis']:
            all_sentiments.append(media['average_sentiment'])
        
        if not all_sentiments:
            return {'balance': 0, 'interpretation': 'neutral'}
        
        avg_sentiment = statistics.mean(all_sentiments)
        
        # Interpret the balance
        if avg_sentiment > 0.6:
            interpretation = 'pro-Israel sentiment dominant'
        elif avg_sentiment > 0.55:
            interpretation = 'slight pro-Israel sentiment'
        elif avg_sentiment < 0.4:
            interpretation = 'pro-Iran sentiment dominant'
        elif avg_sentiment < 0.45:
            interpretation = 'slight pro-Iran sentiment'
        else:
            interpretation = 'balanced sentiment'
        
        return {
            'balance_score': avg_sentiment,
            'interpretation': interpretation,
            'sample_size': len(all_sentiments)
        }
    
    def _perform_trend_analysis(self):
        """Analyze trends over time"""
        print("Performing trend analysis...")
        
        # Group statements by date
        statements_by_date = defaultdict(list)
        for statement in self.collected_data['statements']:
            statements_by_date[statement['date']].append(statement)
        
        # Calculate daily sentiment averages
        daily_sentiments = {}
        for date, statements in statements_by_date.items():
            sentiment_scores = [s['sentiment_score'] for s in statements]
            daily_sentiments[date] = statistics.mean(sentiment_scores) if sentiment_scores else 0.5
        
        # Sort by date
        sorted_dates = sorted(daily_sentiments.keys())
        sorted_sentiments = [daily_sentiments[date] for date in sorted_dates]
        
        # Calculate trend
        if len(sorted_sentiments) >= 2:
            # Simple linear trend
            x_values = list(range(len(sorted_sentiments)))
            y_values = sorted_sentiments
            
            # Calculate slope (simple linear regression)
            n = len(x_values)
            if n > 1:
                numerator = (n * sum(x * y for x, y in zip(x_values, y_values)) - 
                           sum(x_values) * sum(y_values))
                denominator = (n * sum(x * x for x in x_values) - sum(x_values) ** 2)
                slope = numerator / denominator if denominator != 0 else 0
            else:
                slope = 0
            
            trend_direction = 'increasing pro-Israel sentiment' if slope > 0.01 else \
                            'increasing pro-Iran sentiment' if slope < -0.01 else \
                            'stable sentiment'
        else:
            slope = 0
            trend_direction = 'insufficient data'
        
        self.analysis_results['trend_analysis'] = {
            'period_analyzed': f"{sorted_dates[0]} to {sorted_dates[-1]}" if sorted_dates else "N/A",
            'data_points': len(sorted_sentiments),
            'trend_slope': slope,
            'trend_direction': trend_direction,
            'daily_sentiments': daily_sentiments
        }
    
    def _detect_contradictions(self):
        """Detect contradictions in politician statements"""
        print("Detecting contradictions...")
        
        contradictions = []
        
        # Group statements by politician
        statements_by_politician = defaultdict(list)
        for statement in self.collected_data['statements']:
            statements_by_politician[statement['politician_id']].append(statement)
        
        # Check each politician for contradictions
        for politician_id, statements in statements_by_politician.items():
            if len(statements) < 2:
                continue
            
            politician_info = self._find_politician_info(politician_id)
            if not politician_info:
                continue
            
            # Calculate sentiment range
            sentiment_scores = [s['sentiment_score'] for s in statements]
            score_range = max(sentiment_scores) - min(sentiment_scores)
            
            # Check if range exceeds contradiction threshold
            threshold = self.config['analysis_parameters']['contradiction_threshold']
            if score_range >= threshold:
                contradictions.append({
                    'politician_id': politician_id,
                    'name': politician_info['name'],
                    'side': politician_info['side'],
                    'sentiment_range': score_range,
                    'min_sentiment': min(sentiment_scores),
                    'max_sentiment': max(sentiment_scores),
                    'statements_analyzed': len(statements),
                    'most_contradictory_pair': self._find_most_contradictory_pair(statements)
                })
        
        self.analysis_results['contradiction_analysis'] = {
            'total_contradictions': len(contradictions),
            'contradictions': contradictions,
            'contradiction_rate': len(contradictions) / len(statements_by_politician) if statements_by_politician else 0
        }
    
    def _find_most_contradictory_pair(self, statements: List[Dict]) -> Dict:
        """Find the pair of statements with the greatest sentiment difference"""
        if len(statements) < 2:
            return None
        
        max_diff = 0
        pair = None
        
        for i, stmt1 in enumerate(statements):
            for j, stmt2 in enumerate(statements):
                if i != j:
                    diff = abs(stmt1['sentiment_score'] - stmt2['sentiment_score'])
                    if diff > max_diff:
                        max_diff = diff
                        pair = {
                            'statement1': {
                                'date': stmt1['date'],
                                'sentiment': stmt1['sentiment_score'],
                                'text': stmt1['statement'][:100] + '...'
                            },
                            'statement2': {
                                'date': stmt2['date'],
                                'sentiment': stmt2['sentiment_score'],
                                'text': stmt2['statement'][:100] + '...'
                            },
                            'difference': diff
                        }
        
        return pair
    
    def _analyze_reporter_patterns(self):
        """Analyze patterns in reporter coverage"""
        print("Analyzing reporter patterns...")
        
        if 'articles' not in self.collected_data or not self.collected_data['articles']:
            print("  No article data for reporter analysis")
            return
        
        # Count articles by reporter
        reporter_articles = defaultdict(list)
        for article in self.collected_data['articles']:
            if 'reporter' in article and article['reporter']:
                reporter = article['reporter']
                reporter_articles[reporter['name']].append(article)
        
        # Analyze each reporter
        for reporter_name, articles in reporter_articles.items():
            # Find which outlet this reporter works for
            outlet_name = None
            for outlet in self.config['media_outlets'][article['outlet_side']]:
                for outlet_reporter in outlet['reporters']:
                    if outlet_reporter['name'] == reporter_name:
                        outlet_name = outlet['name']
                        break
                if outlet_name:
                    break
            
            # Calculate sentiment for this reporter's articles
            sentiment_scores = [self._calculate_article_sentiment(article) for article in articles]
            avg_sentiment = statistics.mean(sentiment_scores) if sentiment_scores else 0.5
            
            # Find outlet side
            outlet_side = None
            for side, outlets in self.config['media_outlets'].items():
                for outlet in outlets:
                    if outlet['name'] == outlet_name:
                        outlet_side = side
                        break
                if outlet_side:
                    break
            
            self.analysis_results['reporter_analysis'].append({
                'reporter_name': reporter_name,
                'outlet': outlet_name,
                'outlet_side': outlet_side,
                'articles_written': len(articles),
                'average_sentiment': avg_sentiment,
                'sentiment_category': self._get_sentiment_category(avg_sentiment, outlet_side or 'neutral'),
                'first_article_date': min(a['published_at'] for a in articles),
                'last_article_date': max(a['published_at'] for a in articles)
            })
    
    def _save_analysis_results(self):
        """Save analysis results to file"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = os.path.join(self.data_dir, f'iran_conflict_analysis_{timestamp}.json')
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.analysis_results, f, indent=2, ensure_ascii=False)
        
        print(f"Analysis results saved to: {filename}")
    
    def generate_report(self, output_file=None):
        """Generate a human-readable report from analysis results"""
        if not self.analysis_results['politician_analysis']:
            print("No analysis results available. Run analyze_all() first.")
            return
        
        report = []
        report.append("="*80)
        report.append("IRAN CONFLICT ANALYSIS REPORT")
        report.append("="*80)
        report.append(f"Issue: {self.config['name']}")
        report.append(f"Analysis Date: {self.analysis_results['analysis_date']}")
        report.append(f"Data Period: {self.collected_data['metadata']['collection_date']}")
        report.append("")
        
        # Side Comparison
        report.append("SIDE COMPARISON")
        report.append("-" * 40)
        side_comp = self.analysis_results['side_comparison']
        
        report.append(f"Politicians Analyzed:")
        report.append(f"  Pro-Israel: {side_comp['politicians']['pro_israel']['count']} (Avg Sentiment: {side_comp['politicians']['pro_israel']['avg_sentiment']:.3f})")
        report.append(f"  Pro-Iran: {side_comp['politicians']['pro_iran']['count']} (Avg Sentiment: {side_comp['politicians']['pro_iran']['avg_sentiment']:.3f})")
        report.append(f"  Neutral: {side_comp['politicians']['neutral']['count']} (Avg Sentiment: {side_comp['politicians']['neutral']['avg_sentiment']:.3f})")
        
        report.append(f"\nMedia Outlets Analyzed:")
        report.append(f"  Pro-Israel: {side_comp['media_outlets']['pro_israel']['count']} (Avg Sentiment: {side_comp['media_outlets']['pro_israel']['avg_sentiment']:.3f})")
        report.append(f"  Pro-Iran: {side_comp['media_outlets']['pro_iran']['count']} (Avg Sentiment: {side_comp['media_outlets']['pro_iran']['avg_sentiment']:.3f})")
        report.append(f"  Neutral: {side_comp['media_outlets']['neutral']['count']} (Avg Sentiment: {side_comp['media_outlets']['neutral']['avg_sentiment']:.3f})")
        
        report.append(f"\nOverall Sentiment Balance:")
        balance = side_comp['overall_sentiment_balance']
        report.append(f"  Score: {balance['balance_score']:.3f} ({balance['interpretation']})")
        
        # Trend Analysis
        report.append("\n" + "="*80)
        report.append("TREND ANALYSIS")
        report.append("-" * 40)
        trend = self.analysis_results['trend_analysis']
        report.append(f"Period: {trend['period_analyzed']}")
        report.append(f"Trend: {trend['trend_direction']} (slope: {trend['trend_slope']:.4f})")
        
        # Contradiction Analysis
        report.append("\n" + "="*80)
        report.append("CONTRADICTION ANALYSIS")
        report.append("-" * 40)
        contradictions = self.analysis_results['contradiction_analysis']
        report.append(f"Total Contradictions Detected: {contradictions['total_contradictions']}")
        report.append(f"Contradiction Rate: {contradictions['contradiction_rate']:.1%}")
        
        if contradictions['total_contradictions'] > 0:
            report.append("\nMost Significant Contradictions:")
            for i, contradiction in enumerate(contradictions['contradictions'][:3]):  # Top 3
                report.append(f"  {i+1}. {contradiction['name']} ({contradiction['side']})")
                report.append(f"     Sentiment Range: {contradiction['min_sentiment']:.2f} to {contradiction['max_sentiment']:.2f}")
                report.append(f"     Difference: {contradiction['sentiment_range']:.2f}")
        
        # Top Politicians by Sentiment
        report.append("\n" + "="*80)
        report.append("TOP POLITICIANS BY SENTIMENT")
        report.append("-" * 40)
        
        # Sort politicians by sentiment (most pro-Israel to most pro-Iran)
        sorted_politicians = sorted(
            self.analysis_results['politician_analysis'],
            key=lambda x: x['average_sentiment'],
            reverse=True
        )
        
        report.append("Most Pro-Israel:")
        for i, politician in enumerate(sorted_politicians[:3]):
            report.append(f"  {i+1}. {politician['name']} ({politician['country']}): {politician['average_sentiment']:.3f}")
        
        report.append("\nMost Pro-Iran:")
        for i, politician in enumerate(reversed(sorted_politicians[-3:])):
            report.append(f"  {i+1}. {politician['name']} ({politician['country']}): {politician['average_sentiment']:.3f}")
        
        # Reporter Analysis
        if self.analysis_results['reporter_analysis']:
            report.append("\n" + "="*80)
            report.append("REPORTER ANALYSIS")
            report.append("-" * 40)
            report.append(f"Reporters Analyzed: {len(self.analysis_results['reporter_analysis'])}")
            
            # Top reporters by article count
            sorted_reporters = sorted(
                self.analysis_results['reporter_analysis'],
                key=lambda x: x['articles_written'],
                reverse=True
            )[:3]
            
            report.append("Most Active Reporters:")
            for reporter in sorted_reporters:
                report.append(f"  - {reporter['reporter_name']} ({reporter['outlet']}): {reporter['articles_written']} articles")
        
        # Save or print report
        report_content = '\n'.join(report)
        
        if output_file:
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(report_content)
            print(f"Report saved to: {output_file}")
        else:
            print(report_content)

if __name__ == "__main__":
    # Create and run the analyzer
    analyzer = IranConflictAnalyzer()
    
    # Load the collected data
    analyzer.load_data()
    
    # Run comprehensive analysis
    analyzer.analyze_all()
    
    # Generate and display report
    print("\n" + "="*80)
    print("ANALYSIS REPORT")
    print("="*80)
    analyzer.generate_report()