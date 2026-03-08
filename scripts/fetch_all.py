#!/usr/bin/env python3
"""
Asstar Data Fetcher - Unified CLI
Consolidates all scrapers into a single entry point.
"""

import os
import sys
import json
import time
import re
import argparse
import concurrent.futures
from datetime import datetime, date, timezone
from typing import Dict, List, Any, Optional
from urllib.parse import urlencode

import requests
from bs4 import BeautifulSoup

# --- Common Utilities ---

class BaseScraper:
    def __init__(self, user_agent: Optional[str] = None):
        self.session = requests.Session()
        ua = user_agent or 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
        self.session.headers.update({'User-Agent': ua})
        self.timeout = 30
        self.max_retries = 3

    def get(self, url: str) -> str:
        for attempt in range(1, self.max_retries + 1):
            try:
                resp = self.session.get(url, timeout=self.timeout)
                resp.raise_for_status()
                # Use header encoding if available, otherwise fallback to apparent or utf-8
                if not resp.encoding or resp.encoding.lower() == 'iso-8859-1':
                    resp.encoding = resp.apparent_encoding or 'utf-8'
                return resp.text
            except Exception as e:
                if attempt == self.max_retries:
                    raise
                print(f"  Attempt {attempt} failed for {url}: {e}. Retrying...")
                time.sleep(attempt * 2)
        return ""

def get_output_path(filename: str) -> str:
    script_dir = os.path.dirname(os.path.abspath(__file__))
    feeds_dir = os.path.join(os.path.dirname(script_dir), 'feeds')
    os.makedirs(feeds_dir, exist_ok=True)
    return os.path.join(feeds_dir, filename)

# --- GitHub Trending Scraper ---

class GitHubTrendingScraper(BaseScraper):
    def _parse_repo_article(self, article) -> Optional[Dict[str, Any]]:
        try:
            repo_link = article.find('h2', class_='h3').find('a')
            repo_name = repo_link.get_text(strip=True)
            repo_url = 'https://github.com' + repo_link.get('href')
            description_elem = article.find('p')
            description = description_elem.get_text(strip=True) if description_elem else 'No description available'
            language_elem = article.find(attrs={'itemprop': 'programmingLanguage'})
            language = language_elem.get_text(strip=True) if language_elem else 'Unknown'
            stars_elem = article.find('a', href=re.compile(r'/stargazers'))
            stars_text = stars_elem.get_text(strip=True) if stars_elem else '0'
            stars = re.sub(r'[^\d]', '', stars_text) or '0'
            forks_elem = article.find('a', href=re.compile(r'/forks'))
            forks_text = forks_elem.get_text(strip=True) if forks_elem else '0'
            forks = re.sub(r'[^\d]', '', forks_text) or '0'
            stars_today_elem = article.find('span', class_='d-inline-block float-sm-right')
            stars_today_text = stars_today_elem.get_text(strip=True) if stars_today_elem else '0'
            stars_today = re.sub(r'[^\d]', '', stars_today_text) or '0'
            built_by = []
            avatar_imgs = article.find_all('img', class_='avatar')
            for img in avatar_imgs[:5]:
                username = img.get('alt', '').replace('@', '')
                if username: built_by.append(f"@{username}")
            
            return {
                'name': repo_name, 'description': description, 'language': language,
                'stars': f"{int(stars):,}", 'forks': f"{int(forks):,}",
                'starsToday': f"{int(stars_today):,}", 'url': repo_url, 'builtBy': built_by
            }
        except Exception as e:
            print(f"  Error parsing GitHub repo: {e}")
            return None

    def run(self):
        periods = ['daily', 'weekly', 'monthly']
        all_data = {}
        for period in periods:
            print(f"Fetching GitHub Trending ({period})...")
            url = f'https://github.com/trending?since={period}' if period != 'daily' else 'https://github.com/trending'
            html = self.get(url)
            soup = BeautifulSoup(html, 'lxml')
            repos = []
            for article in soup.find_all('article', class_='Box-row')[:25]:
                data = self._parse_repo_article(article)
                if data: repos.append(data)
            all_data[period] = repos
            time.sleep(2)

        output = {**all_data, 'lastUpdated': datetime.now(timezone.utc).isoformat(), 'totalRepositories': sum(len(r) for r in all_data.values())}
        with open(get_output_path('trending-data.json'), 'w', encoding='utf-8') as f:
            json.dump(output, f, indent=2, ensure_ascii=False)
        print(f"Saved GitHub Trending data. Total: {output['totalRepositories']}")

# --- HuggingFace Models Scraper ---

class HuggingFaceScraper(BaseScraper):
    def run(self):
        api_base = 'https://huggingface.co/api/models'
        categories = ['trending', 'likes', 'downloads']
        all_data = {}
        for cat in categories:
            print(f"Fetching HuggingFace Models ({cat})...")
            url = f"{api_base}?{urlencode({'sort': cat, 'limit': 25})}"
            if cat == 'trending':
                url = f"{api_base}?{urlencode({'trending': 'true', 'limit': 25})}"
            
            resp = self.session.get(url, timeout=self.timeout)
            items = resp.json() if resp.status_code == 200 else []
            
            parsed_models = []
            for item in items[:25]:
                model_id = item.get('modelId') or item.get('id') or ''
                if not model_id: continue
                parsed_models.append({
                    'name': model_id,
                    'description': item.get('description') or item.get('cardData', {}).get('description') or 'No description available',
                    'task': item.get('pipeline_tag') or 'Unknown',
                    'parameters': item.get('cardData', {}).get('parameters') or 'Unknown',
                    'likes': f"{int(item.get('likes') or 0):,}",
                    'downloads': f"{int(item.get('downloads') or 0):,}",
                    'url': f"https://huggingface.co/{model_id}",
                    'tags': (item.get('tags') or item.get('cardData', {}).get('tags') or [])[:5]
                })
            all_data[cat] = parsed_models
            time.sleep(2)

        output = {**all_data, 'lastUpdated': datetime.now(timezone.utc).isoformat(), 'totalModels': sum(len(m) for m in all_data.values())}
        dest = get_output_path('huggingface-data.json')
        if output['totalModels'] > 0 or not os.path.exists(dest):
            with open(dest, 'w', encoding='utf-8') as f:
                json.dump(output, f, indent=2, ensure_ascii=False)
        print(f"Saved HuggingFace Models data. Total: {output['totalModels']}")

# --- HuggingFace Papers Scraper ---

class HFPapersScraper(BaseScraper):
    def _parse_papers(self, html: str) -> List[Dict[str, Any]]:
        soup = BeautifulSoup(html, 'lxml')
        items = []
        for article in soup.select('article, div[data-testid="paper-card"], li'):
            a = article.select_one('a[href^="/papers/"]')
            if not a: continue
            href = a.get('href', '')
            url = f"https://huggingface.co{href}" if href.startswith('/') else href
            title_node = article.find(['h2', 'h3']) or a.find(['h2', 'h3'])
            title = (title_node.get_text(strip=True) if title_node else None) or a.get('title') or a.get_text(strip=True)
            if not title: continue
            card_text = article.get_text(separator=' ', strip=True)
            abstract = re.sub(re.escape(title), '', card_text).strip()[:240] if card_text else 'No abstract available.'
            items.append({'title': title, 'authors': 'Unknown', 'abstract': abstract, 'url': url})
        
        if not items: # Fallback
            for a in soup.select('a[href^="/papers/"]'):
                href = a.get('href', ''); url = f"https://huggingface.co{href}" if href.startswith('/') else href
                title = a.get('title') or a.get_text(strip=True)
                if title: items.append({'title': title, 'authors': 'Unknown', 'abstract': 'No abstract available.', 'url': url})
        
        dedup = {f"{it['title']}|{it['url']}": it for it in items}
        return list(dedup.values())[:50]

    def run(self):
        today = date.today()
        year, week_num, _ = today.isocalendar()
        print(f"Fetching HuggingFace Papers...")
        payload = {}
        targets = {
            'daily': f"https://huggingface.co/papers/date/{today.strftime('%Y-%m-%d')}",
            'weekly': f"https://huggingface.co/papers/week/{year}-W{week_num:02d}",
            'monthly': f"https://huggingface.co/papers/month/{today.year}-{today.month:02d}",
            'trending': "https://huggingface.co/papers/trending"
        }
        for key, url in targets.items():
            try:
                payload[key] = self._parse_papers(self.get(url))
                time.sleep(2)
            except Exception as e:
                print(f"  Failed {key}: {e}"); payload[key] = []
        
        payload['lastUpdated'] = datetime.now(timezone.utc).isoformat()
        payload['totals'] = {k: len(v) for k, v in payload.items() if isinstance(v, list)}
        dest = get_output_path('huggingface-papers-data.json')
        if sum(payload['totals'].values()) > 0 or not os.path.exists(dest):
            with open(dest, 'w', encoding='utf-8') as f:
                json.dump(payload, f, indent=2, ensure_ascii=False)
        print(f"Saved HuggingFace Papers data. Total: {sum(payload['totals'].values())}")

# --- Tophub Focus Scraper ---

class TophubScraper(BaseScraper):
    def run(self):
        specs = {
            'finance': [
                {'url': 'https://tophub.today/c/finance', 'targets': ['第一财经', '雪球', '华尔街见闻', '集思录']},
                {'url': 'https://tophub.today/c/finance?&p=3', 'targets': ['格隆汇', '金融界', '慧博投研资讯', '英为财情', '证券日报网', '美股市值']},
                {'url': 'https://tophub.today/c/finance?&p=4', 'targets': ['同花顺财经']}
            ],
            'tech': [
                {'url': 'https://tophub.today/c/tech', 'targets': ['36氪', '少数派', 'IT之家']},
                {'url': 'https://tophub.today/c/developer', 'targets': ['人人都是产品经理', '掘金']},
                {'url': 'https://tophub.today/c/ai', 'targets': ['量子位', '超神经']},
                {'url': 'https://tophub.today/c/ai?&p=3', 'targets': ['增长黑客']},
                {'url': 'https://tophub.today/c/ai?&p=4', 'targets': ['首席安全官']}
            ],
            'ai': [
                {'url': 'https://tophub.today/c/ai', 'targets': ['AIbase', 'AI工具集', 'AI产品榜']},
                {'url': 'https://tophub.today/c/ai?&p=2', 'targets': ['智源社区', 'AIHub', 'Hugging Face']},
                {'url': 'https://tophub.today/c/ai?&p=3', 'targets': ['Aminer', '三花 AI']},
                {'url': 'https://tophub.today/c/ai?&p=5', 'targets': ['AI开发者de频道']}
            ]
        }
        output = {'savedAt': datetime.now(timezone.utc).isoformat(), 'categories': {}}
        for cat, page_specs in specs.items():
            print(f"Fetching Tophub ({cat})...")
            # Initialize parsed dict with all targets for this category
            all_targets = []
            for spec in page_specs:
                all_targets.extend(spec['targets'])
            parsed = {t: [] for t in all_targets}
            
            for spec in page_specs:
                print(f"  Fetching page: {spec['url']}")
                html = self.get(spec['url'])
                soup = BeautifulSoup(html, 'lxml')
                cards = soup.select('.cc-cd')
                for card in cards:
                    label_el = card.select_one('.cc-cd-lb')
                    label = label_el.get_text(strip=True) if label_el else ''
                    # Match target if it's in the current page's target list
                    target = next((t for t in spec['targets'] if t in label), None)
                    if not target: continue
                    
                    s_title_el = card.select_one('.cc-cd-sb-st')
                    s_title = s_title_el.get_text(strip=True) if s_title_el else ''
                    items = []
                    for a in card.select('.cc-cd-cb a[href]'):
                        href = a.get('href', '').strip()
                        if not (href.startswith('http')): continue
                        # Fix malformed URLs like https:https:// found in some sources
                        if href.startswith('https:https://'):
                            href = href.replace('https:https://', 'https://', 1)
                        elif href.startswith('http:http://'):
                            href = href.replace('http:http://', 'http://', 1)
                        
                        row = a.select_one('.cc-cd-cb-ll')
                        if not row: continue
                        items.append({
                            'rank': row.select_one('.s').get_text(strip=True) if row.select_one('.s') else '',
                            'title': row.select_one('.t').get_text(strip=True) if row.select_one('.t') else '',
                            'extra': row.select_one('.e').get_text(strip=True) if row.select_one('.e') else '',
                            'url': href
                        })
                    parsed[target].append({'section': s_title, 'items': items})
                time.sleep(1)

            output['categories'][cat] = {'sourceUrl': page_specs[0]['url'], 'sections': parsed}

        # EastMoney Integration
        try:
            print("Fetching EastMoney...")
            em_html = self.get('https://finance.eastmoney.com/yaowen.html')
            em_soup = BeautifulSoup(em_html, 'lxml')
            em_items = []
            seen = set()
            for a in em_soup.select('a[href*="/a/"]')[:30]:
                href = a.get('href', '').strip()
                title = a.get_text(strip=True)
                if not title or len(title) < 6 or '查看' in title: continue
                if href.startswith('/'): href = 'https://finance.eastmoney.com' + href
                if title not in seen:
                    seen.add(title)
                    em_items.append({'rank': '', 'title': title, 'extra': '', 'url': href})
            output['categories'].setdefault('finance', {}) \
                  .setdefault('sections', {})['东方财富网'] = [{'section': '焦点要闻', 'items': em_items}]
        except Exception as e:
            print(f"  Warning: EastMoney failed: {e}")

        with open(get_output_path('realtime-focus.json'), 'w', encoding='utf-8') as f:
            json.dump(output, f, indent=2, ensure_ascii=False)
        print("Saved Tophub Focus data.")

# --- CLI Entry Point ---

def main():
    parser = argparse.ArgumentParser(description="Asstar Data Fetcher")
    parser.add_argument('target', choices=['github', 'huggingface', 'papers', 'focus', 'all'], help="Target data to fetch")
    args = parser.parse_args()

    scrapers = {
        'github': GitHubTrendingScraper(),
        'huggingface': HuggingFaceScraper(),
        'papers': HFPapersScraper(),
        'focus': TophubScraper()
    }

    if args.target == 'all':
        print(f"Starting parallel fetch for all {len(scrapers)} targets...")
        with concurrent.futures.ThreadPoolExecutor(max_workers=len(scrapers)) as executor:
            future_to_name = {executor.submit(scraper.run): name for name, scraper in scrapers.items()}
            for future in concurrent.futures.as_completed(future_to_name):
                name = future_to_name[future]
                try:
                    future.result()
                    print(f"Successfully completed: {name}")
                except Exception as e:
                    print(f"Critical error in {name}: {e}")
        print("All fetch operations completed.")
    else:
        scrapers[args.target].run()

if __name__ == "__main__":
    main()
