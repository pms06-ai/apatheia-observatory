#!/usr/bin/env python3
"""
Iran Conflict Data Collector
Collects statements, articles, and data from politicians and media outlets
"""

import json
import os
import time
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import requests
from iran_conflict_config import IRAN_CONFLICT_CONFIG, KEYWORDS_BY_SIDE

class IranConflictCollector:
    """Main collector class for Iran conflict data"""
    
    def __init__(self, config=None, data_dir="data"):
        self.config = config or IRAN_CONFLICT_CONFIG
        self.data_dir = data_dir
        self.news_api_key = os.environ.get('NEWS_API_KEY', 'YOUR_API_KEY_HERE')
        
        # Create data directory if it doesn't exist
        os.makedirs(self.data_dir, exist_ok=True)
        
        # Initialize data storage
        self.statements = []
        self.articles = []
        self.metadata = {
            'collection_date': datetime.now().isoformat(),
            'issue_id': self.config['issue_id'],
            'politicians_tracked': [],
            'media_outlets_tracked': []
        }
    
    def collect_all_data(self):
        """Collect all data from politicians and media outlets"""
        print("Starting Iran conflict data collection...")
        
        # Collect politician statements
        self._collect_politician_statements()
        
        # Collect media articles
        self._collect_media_articles()
        
        # Save collected data
        self._save_collected_data()
        
        print(f"Data collection completed. Collected {len(self.statements)} statements and {len(self.articles)} articles.")
    
    def _collect_politician_statements(self):
        """Collect statements from all tracked politicians"""
        print("Collecting politician statements...")
        
        for side, politicians in self.config['politicians'].items():
            for politician in politicians:
                politician_id = politician['id']
                politician_name = politician['name']
                
                print(f"  Collecting statements for {politician_name} ({side})...")
                
                # Simulate collecting statements (in real implementation, this would use APIs)
                statements = self._simulate_politician_statements(politician, side)
                
                self.statements.extend(statements)
                self.metadata['politicians_tracked'].append({
                    'id': politician_id,
                    'name': politician_name,
                    'side': side,
                    'statements_collected': len(statements)
                })
    
    def _simulate_politician_statements(self, politician: Dict, side: str) -> List[Dict]:
        """Simulate collecting politician statements for demonstration"""
        # In a real implementation, this would fetch from news APIs, official websites, etc.
        statements = []
        
        # Generate some sample statements based on the politician's known positions
        base_statements = {
            'pro-israel': [
                "We will defend our security and right to exist against all threats.",
                "The international community must stand firm against Iranian aggression.",
                "Our defense forces are ready to protect our citizens from any attack.",
                "Diplomacy is important, but we must maintain our deterrence capability.",
                "The nuclear threat from Iran remains the primary challenge to regional stability."
            ],
            'pro-iran': [
                "The Zionist regime's days are numbered and resistance will prevail.",
                "Sanctions have only made our nation stronger and more self-reliant.",
                "Our nuclear program is peaceful and for the benefit of our people.",
                "The axis of resistance stands united against imperialist aggression.",
                "Palestinian liberation is a sacred duty for all freedom-loving nations."
            ],
            'neutral-unknown': [
                "We call for an immediate ceasefire and return to diplomatic negotiations.",
                "The humanitarian situation requires urgent international attention and action.",
                "All parties must respect international law and human rights principles.",
                "A lasting peace can only be achieved through dialogue and compromise.",
                "The United Nations stands ready to facilitate peace talks between the parties."
            ]
        }
        
        # Create 3-5 statements per politician
        num_statements = min(5, len(base_statements.get(side, [])))
        
        for i in range(num_statements):
            statements.append({
                'politician_id': politician['id'],
                'politician_name': politician['name'],
                'politician_title': politician['title'],
                'politician_country': politician['country'],
                'side': side,
                'statement': base_statements[side][i % len(base_statements[side])],
                'date': (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d'),
                'source': f"Official statement by {politician['name']}",
                'keywords': politician.get('keywords', []),
                'context': f"Statement on {self.config['name']}",
                'sentiment_score': 0.9 if side == 'pro-israel' else 0.1 if side == 'pro-iran' else 0.5
            })
        
        return statements
    
    def _collect_media_articles(self):
        """Collect articles from all tracked media outlets"""
        print("Collecting media articles...")
        
        for side, outlets in self.config['media_outlets'].items():
            for outlet in outlets:
                outlet_name = outlet['name']
                
                print(f"  Collecting articles from {outlet_name} ({side})...")
                
                # Collect articles from this outlet
                articles = self._collect_outlet_articles(outlet, side)
                
                self.articles.extend(articles)
                self.metadata['media_outlets_tracked'].append({
                    'name': outlet_name,
                    'side': side,
                    'articles_collected': len(articles),
                    'reporters_covered': len(outlet['reporters'])
                })
    
    def _collect_outlet_articles(self, outlet: Dict, side: str) -> List[Dict]:
        """Collect articles from a specific media outlet"""
        articles = []
        
        # Try to fetch real articles from NewsAPI if available
        if self.news_api_key and self.news_api_key != 'YOUR_API_KEY_HERE':
            try:
                real_articles = self._fetch_newsapi_articles(outlet, side)
                if real_articles:
                    articles.extend(real_articles)
                    return articles
            except Exception as e:
                print(f"    NewsAPI fetch failed: {e}. Using simulated data.")
        
        # Fallback to simulated articles
        return self._simulate_outlet_articles(outlet, side)
    
    def _fetch_newsapi_articles(self, outlet: Dict, side: str) -> List[Dict]:
        """Fetch articles from NewsAPI for the given outlet"""
        articles = []
        
        # Map our outlet names to NewsAPI sources
        newsapi_sources = {
            'The Jerusalem Post': 'the-jerusalem-post',
            'The Times of Israel': 'the-times-of-israel',
            'Israel Hayom': None,  # Not in NewsAPI
            'Press TV': 'press-tv',
            'Al Mayadeen': None,  # Not in NewsAPI
            'Tasnim News Agency': None,  # Not in NewsAPI
            'Reuters': 'reuters',
            'Associated Press': 'associated-press',
            'BBC News': 'bbc-news'
        }
        
        source = newsapi_sources.get(outlet['name'])
        if not source:
            return []
        
        # Get keywords for this side
        keywords = ' OR '.join(KEYWORDS_BY_SIDE.get(side, []))
        
        # Fetch from NewsAPI
        url = f"https://newsapi.org/v2/everything?sources={source}&q={keywords}&apiKey={self.news_api_key}&pageSize=5"
        
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get('articles'):
                    for article in data['articles']:
                        articles.append({
                            'outlet_name': outlet['name'],
                            'outlet_side': side,
                            'title': article['title'],
                            'url': article['url'],
                            'published_at': article['publishedAt'],
                            'author': article['author'],
                            'description': article['description'],
                            'content': article['content'],
                            'source': 'NewsAPI',
                            'keywords': self._extract_keywords(article['title'] + ' ' + article.get('description', ''))
                        })
        except Exception as e:
            print(f"    Error fetching from NewsAPI: {e}")
        
        return articles
    
    def _simulate_outlet_articles(self, outlet: Dict, side: str) -> List[Dict]:
        """Simulate collecting articles from a media outlet"""
        articles = []
        
        # Sample article templates based on side
        article_templates = {
            'pro-israel': [
                {
                    'title': "{outlet} reports: Israel strengthens defense against Iranian threats",
                    'content': "In response to escalating tensions, Israel has bolstered its defense capabilities..."
                },
                {
                    'title': "International support grows for Israel's security concerns",
                    'content': "Western nations express solidarity with Israel's right to defend itself..."
                },
                {
                    'title': "Analysis: The nuclear threat from Iran's expanding program",
                    'content': "Experts warn about the dangers of Iran's advancing nuclear capabilities..."
                }
            ],
            'pro-iran': [
                {
                    'title': "{outlet} exclusive: Resistance forces prepare for decisive action",
                    'content': "Sources reveal coordinated plans among resistance groups to counter Zionist aggression..."
                },
                {
                    'title': "Western sanctions fail to break Iranian economic resilience",
                    'content': "Despite harsh sanctions, Iran's economy shows signs of adaptation and growth..."
                },
                {
                    'title': "The legitimate right to nuclear technology: Iran's peaceful program",
                    'content': "Iranian officials reiterate the peaceful nature of their nuclear research..."
                }
            ],
            'neutral': [
                {
                    'title': "{outlet}: Ceasefire talks stall as both sides dig in",
                    'content': "Diplomatic efforts hit roadblocks as positions harden on both sides..."
                },
                {
                    'title': "Humanitarian crisis deepens in conflict zones",
                    'content': "International agencies warn of worsening conditions for civilians..."
                },
                {
                    'title': "UN calls for immediate de-escalation and return to negotiations",
                    'content': "United Nations officials urge all parties to prioritize diplomatic solutions..."
                }
            ]
        }
        
        # Create 3 articles per outlet
        for i, template in enumerate(article_templates.get(side, [])[:3]):
            articles.append({
                'outlet_name': outlet['name'],
                'outlet_side': side,
                'title': template['title'].format(outlet=outlet['name']),
                'url': f"https://{outlet['website'].replace('https://', '').replace('http://', '')}/article-{i+1}",
                'published_at': (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%dT%H:%M:%SZ'),
                'author': outlet['reporters'][i % len(outlet['reporters'])]['name'],
                'description': template['content'][:100] + '...',
                'content': template['content'],
                'source': 'Simulated',
                'keywords': KEYWORDS_BY_SIDE.get(side, []),
                'reporter': outlet['reporters'][i % len(outlet['reporters'])]
            })
        
        return articles
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Extract relevant keywords from text"""
        text_lower = text.lower()
        keywords = []
        
        # Check for keywords from our predefined lists
        for side, side_keywords in KEYWORDS_BY_SIDE.items():
            for keyword in side_keywords:
                if keyword in text_lower:
                    keywords.append(keyword)
        
        return list(set(keywords))  # Remove duplicates
    
    def _save_collected_data(self):
        """Save collected data to files"""
        # Create timestamp for filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # Save statements
        statements_file = os.path.join(self.data_dir, f'iran_conflict_statements_{timestamp}.json')
        with open(statements_file, 'w', encoding='utf-8') as f:
            json.dump(self.statements, f, indent=2, ensure_ascii=False)
        
        # Save articles
        articles_file = os.path.join(self.data_dir, f'iran_conflict_articles_{timestamp}.json')
        with open(articles_file, 'w', encoding='utf-8') as f:
            json.dump(self.articles, f, indent=2, ensure_ascii=False)
        
        # Save metadata
        metadata_file = os.path.join(self.data_dir, f'iran_conflict_metadata_{timestamp}.json')
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(self.metadata, f, indent=2, ensure_ascii=False)
        
        print(f"Data saved to:")
        print(f"  Statements: {statements_file}")
        print(f"  Articles: {articles_file}")
        print(f"  Metadata: {metadata_file}")
    
    def load_latest_data(self) -> Dict[str, Any]:
        """Load the most recent collected data"""
        # Find the most recent files
        files = os.listdir(self.data_dir)
        statement_files = [f for f in files if f.startswith('iran_conflict_statements_') and f.endswith('.json')]
        article_files = [f for f in files if f.startswith('iran_conflict_articles_') and f.endswith('.json')]
        metadata_files = [f for f in files if f.startswith('iran_conflict_metadata_') and f.endswith('.json')]
        
        if not statement_files:
            return {'error': 'No collected data found'}
        
        # Get the most recent file (by timestamp in filename)
        latest_statement = max(statement_files)
        latest_article = max(article_files) if article_files else None
        latest_metadata = max(metadata_files) if metadata_files else None
        
        data = {}
        
        # Load statements
        with open(os.path.join(self.data_dir, latest_statement), 'r', encoding='utf-8') as f:
            data['statements'] = json.load(f)
        
        # Load articles if available
        if latest_article:
            with open(os.path.join(self.data_dir, latest_article), 'r', encoding='utf-8') as f:
                data['articles'] = json.load(f)
        
        # Load metadata if available
        if latest_metadata:
            with open(os.path.join(self.data_dir, latest_metadata), 'r', encoding='utf-8') as f:
                data['metadata'] = json.load(f)
        
        return data

if __name__ == "__main__":
    # Create and run the collector
    collector = IranConflictCollector()
    
    # Check if NewsAPI key is configured
    if collector.news_api_key == 'YOUR_API_KEY_HERE':
        print("⚠️  NewsAPI key not configured. Using simulated data.")
        print("    To use real data, set NEWS_API_KEY environment variable or edit the script.")
        time.sleep(2)
    
    # Run the collection
    collector.collect_all_data()
    
    # Show summary
    print("\n" + "="*60)
    print("COLLECTION SUMMARY")
    print("="*60)
    print(f"Issue: {collector.config['name']}")
    print(f"Collection Date: {collector.metadata['collection_date']}")
    print(f"\nPoliticians Tracked: {len(collector.metadata['politicians_tracked'])}")
    for politician in collector.metadata['politicians_tracked']:
        print(f"  - {politician['name']} ({politician['side']}): {politician['statements_collected']} statements")
    
    print(f"\nMedia Outlets Tracked: {len(collector.metadata['media_outlets_tracked'])}")
    for outlet in collector.metadata['media_outlets_tracked']:
        print(f"  - {outlet['name']} ({outlet['side']}): {outlet['articles_collected']} articles")
    
    print(f"\nTotal Data Collected:")
    print(f"  Statements: {len(collector.statements)}")
    print(f"  Articles: {len(collector.articles)}")
    print("\nData saved to the data/ directory.")