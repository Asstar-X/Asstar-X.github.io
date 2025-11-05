#!/usr/bin/env python3
"""
Fetch and parse Tophub pages (finance, tech, developer) and write a single
structured JSON file. No HTML snapshots or meta files are produced.

Outputs:
  feeds/realtime-focus.json

Usage:
  python3 scripts/fetch_tophub_all.py
"""

import os
import sys
import json
from datetime import datetime

import requests
from bs4 import BeautifulSoup


CATEGORY_SPECS = {
    'finance': {
        'url': 'https://tophub.today/c/finance',
        'targets': ['第一财经', '雪球', '华尔街见闻', '集思录']
    },
    'tech': {
        'url': 'https://tophub.today/c/tech',
        'targets': ['36氪', '少数派', 'IT之家']
    },
    'developer': {
        'url': 'https://tophub.today/c/developer',
        'targets': ['CSDN', '人人都是产品经理', '掘金']
    }
}


def fetch_html(url: str, timeout: int = 30) -> str:
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
    })
    resp = session.get(url, timeout=timeout)
    resp.raise_for_status()
    resp.encoding = resp.apparent_encoding or 'utf-8'
    return resp.text


def extract_card_info(card):
    section_el = card.select_one('.cc-cd-sb-st')
    section_title = section_el.get_text(strip=True) if section_el else ''

    items = []
    for a in card.select('.cc-cd-cb a[href]'):
        href = a.get('href', '').strip()
        if not (href.startswith('http://') or href.startswith('https://')):
            continue
        row = a.select_one('.cc-cd-cb-ll')
        if not row:
            continue
        rank_el = row.select_one('.s')
        title_el = row.select_one('.t')
        extra_el = row.select_one('.e')
        items.append({
            'rank': (rank_el.get_text(strip=True) if rank_el else ''),
            'title': (title_el.get_text(strip=True) if title_el else ''),
            'extra': (extra_el.get_text(strip=True) if extra_el else ''),
            'url': href
        })
    return section_title, items


def parse_category(html: str, targets: list[str]) -> dict:
    soup = BeautifulSoup(html, 'lxml')
    cards = soup.select('.cc-cd')
    parsed = {t: [] for t in targets}

    for card in cards:
        label_el = card.select_one('.cc-cd-lb')
        label_text = label_el.get_text(strip=True) if label_el else ''
        target = next((t for t in targets if t in label_text), None)
        if not target:
            continue
        section_title, items = extract_card_info(card)
        parsed[target].append({
            'section': section_title,
            'items': items
        })

    return parsed


def main():
    repo_root = os.path.dirname(os.path.dirname(__file__))
    feeds_dir = os.path.join(repo_root, 'feeds')
    os.makedirs(feeds_dir, exist_ok=True)

    all_output = {
        'savedAt': datetime.now().isoformat(),
        'categories': {}
    }

    # Fetch and parse each category
    for cat, spec in CATEGORY_SPECS.items():
        url = spec['url']
        targets = spec['targets']
        print(f"Fetching: {url}")
        html = fetch_html(url)
        print(f"Parsing category: {cat}")
        parsed = parse_category(html, targets)
        all_output['categories'][cat] = {
            'sourceUrl': url,
            'sections': parsed
        }

    # Integrate EastMoney focus news into finance category
    try:
        eastmoney_items = []
        em_url = 'https://finance.eastmoney.com/yaowen.html'
        print(f"Fetching EastMoney: {em_url}")
        em_html = fetch_html(em_url)
        em_soup = BeautifulSoup(em_html, 'lxml')

        # Prefer links matching /a/ style; fall back to broader selectors
        candidates = em_soup.select('a[href*="/a/"]')
        if not candidates:
            candidates = em_soup.find_all('a', href=True)

        seen_titles = set()
        for idx, a in enumerate(candidates):
            href = a.get('href', '').strip()
            title = a.get_text(strip=True)
            if not title or len(title) < 6:
                continue
            if '查看更多' in title or '广告' in title or '推广' in title or '合作' in title:
                continue
            if not (href.startswith('http://') or href.startswith('https://') or href.startswith('/')):
                continue
            if href.startswith('/'):
                href = 'https://finance.eastmoney.com' + href
            key = title + '|' + href
            if key in seen_titles:
                continue
            seen_titles.add(key)
            eastmoney_items.append({
                'rank': '',
                'title': title,
                'extra': '',
                'url': href
            })
            if len(eastmoney_items) >= 30:
                break

        finance_cat = all_output['categories'].setdefault('finance', {
            'sourceUrl': CATEGORY_SPECS['finance']['url'],
            'sections': {t: [] for t in CATEGORY_SPECS['finance']['targets']}
        })
        sections = finance_cat.setdefault('sections', {})
        sections['东方财富网'] = [{ 'section': '焦点要闻', 'items': eastmoney_items }]
    except Exception as e:
        print(f"Warning: failed to integrate EastMoney: {e}")

    # Write JSON file
    out_json = os.path.join(feeds_dir, 'realtime-focus.json')
    with open(out_json, 'w', encoding='utf-8') as f:
        json.dump(all_output, f, ensure_ascii=False, indent=2)
    print(f"Saved consolidated data JSON to {out_json}")


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


