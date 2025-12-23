#!/usr/bin/env python3
"""
HuggingFace Papers Fetcher

抓取 Hugging Face Papers 页面：
- Daily:   https://huggingface.co/papers/date/YYYY-MM-DD
- Weekly:  https://huggingface.co/papers/week/YYYY-Www
- Monthly: https://huggingface.co/papers/month/YYYY-MM
- Trending:https://huggingface.co/papers/trending

将解析后的列表保存到项目根目录的 huggingface-papers-data.json
"""

from __future__ import annotations
import os
import json
import time
import re
from datetime import datetime, date
from typing import Dict, List, Any

import requests
from bs4 import BeautifulSoup


class HFPapersScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
        })
        self.timeout_seconds = 20
        self.max_retries = 3

    def _get(self, url: str) -> str:
        last_error: Exception | None = None
        for attempt in range(1, self.max_retries + 1):
            try:
                resp = self.session.get(url, timeout=self.timeout_seconds)
                resp.raise_for_status()
                return resp.text
            except Exception as e:
                last_error = e
                time.sleep(attempt * 2)
        raise RuntimeError(f"GET failed for {url}: {last_error}")

    def _parse_papers(self, html: str) -> List[Dict[str, Any]]:
        soup = BeautifulSoup(html, 'lxml')
        items: List[Dict[str, Any]] = []

        # 优先从明显的卡片/文章结构中提取标题
        # 1) 文章卡片中查找链接与标题
        for article in soup.select('article, div[data-testid="paper-card"], li'):  # 尽量覆盖
            a = article.select_one('a[href^="/papers/"]')
            if not a:
                continue
            href = a.get('href', '')
            url = f"https://huggingface.co{href}" if href.startswith('/') else href

            # 标题优先取卡片内的 h2/h3/strong，退化为链接文本或 title 属性
            title_node = article.find(['h2', 'h3']) or a.find(['h2', 'h3'])
            title = (title_node.get_text(strip=True) if title_node else None) or a.get('title') or a.get_text(strip=True)
            if not title:
                continue

            # 作者与摘要从卡片文本中提取（尽量保守）
            authors = None
            abstract = None
            card_text = article.get_text(separator=' ', strip=True)
            if card_text:
                # 去掉标题本身，避免重复
                cleaned = re.sub(re.escape(title), '', card_text).strip()
                abstract = cleaned[:240] if cleaned else None

            items.append({
                'title': title,
                'authors': authors or 'Unknown',
                'abstract': abstract or 'No abstract available.',
                'url': url,
            })

        # 2) 兜底：页面中所有 /papers/ 链接（防止结构变动）
        if not items:
            for a in soup.select('a[href^="/papers/"]'):
                href = a.get('href', '')
                url = f"https://huggingface.co{href}" if href.startswith('/') else href
                title = a.get('title') or a.get_text(strip=True)
                if not title:
                    continue
                items.append({
                    'title': title,
                    'authors': 'Unknown',
                    'abstract': 'No abstract available.',
                    'url': url,
                })

        # 去重（按标题+url）
        dedup: Dict[str, Dict[str, Any]] = {}
        for it in items:
            key = f"{it['title']}|{it['url']}"
            dedup[key] = it
        return list(dedup.values())[:50]

    def fetch_daily(self, dt: date) -> List[Dict[str, Any]]:
        url = f"https://huggingface.co/papers/date/{dt.strftime('%Y-%m-%d')}"
        html = self._get(url)
        data = self._parse_papers(html)
        for it in data:
            it['date'] = dt.strftime('%Y-%m-%d')
        return data

    def fetch_weekly(self, year: int, week: int) -> List[Dict[str, Any]]:
        url = f"https://huggingface.co/papers/week/{year}-W{week:02d}"
        html = self._get(url)
        data = self._parse_papers(html)
        for it in data:
            it['week'] = f"{year}-W{week:02d}"
        return data

    def fetch_monthly(self, year: int, month: int) -> List[Dict[str, Any]]:
        url = f"https://huggingface.co/papers/month/{year}-{month:02d}"
        html = self._get(url)
        data = self._parse_papers(html)
        for it in data:
            it['month'] = f"{year}-{month:02d}"
        return data

    def fetch_trending(self) -> List[Dict[str, Any]]:
        url = "https://huggingface.co/papers/trending"
        html = self._get(url)
        return self._parse_papers(html)

    @staticmethod
    def iso_week_of(dt: date) -> tuple[int, int]:
        # ISO week number
        return dt.isocalendar().year, dt.isocalendar().week

    def update_all(self) -> Dict[str, Any]:
        today = date.today()
        year, week = self.iso_week_of(today)
        print(f"Fetching papers for date={today}, week={year}-W{week:02d}, month={today.year}-{today.month:02d}")

        payload: Dict[str, Any] = {}

        try:
            payload['daily'] = self.fetch_daily(today)
            time.sleep(2)
        except Exception as e:
            print('Daily fetch failed:', e)
            payload['daily'] = []

        try:
            payload['weekly'] = self.fetch_weekly(year, week)
            time.sleep(2)
        except Exception as e:
            print('Weekly fetch failed:', e)
            payload['weekly'] = []

        try:
            payload['monthly'] = self.fetch_monthly(today.year, today.month)
            time.sleep(2)
        except Exception as e:
            print('Monthly fetch failed:', e)
            payload['monthly'] = []

        try:
            payload['trending'] = self.fetch_trending()
        except Exception as e:
            print('Trending fetch failed:', e)
            payload['trending'] = []

        payload['lastUpdated'] = datetime.now().isoformat()
        payload['totals'] = {k: len(v) for k, v in payload.items() if isinstance(v, list)}
        return payload


def main():
    scraper = HFPapersScraper()
    data = scraper.update_all()
    out_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'feeds', 'huggingface-papers-data.json')

    # 如果全部为空，尽量保留旧文件
    if sum(data['totals'].values()) == 0 and os.path.exists(out_path):
        print('No papers fetched; preserve existing huggingface-papers-data.json')
        return

    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f'Saved papers to {out_path}')


if __name__ == '__main__':
    main()


