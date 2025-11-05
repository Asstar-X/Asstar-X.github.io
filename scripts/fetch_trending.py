#!/usr/bin/env python3
"""
GitHub Trending Data Fetcher
使用Python爬虫抓取GitHub Trending数据并保存为JSON格式
"""

import requests
import json
import time
from datetime import datetime
from bs4 import BeautifulSoup
import re
import os
from typing import Dict, List, Any

class GitHubTrendingScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
    def fetch_trending_data(self, period: str = 'daily') -> Dict[str, Any]:
        """
        抓取指定时间周期的GitHub Trending数据
        
        Args:
            period: 时间周期 ('daily', 'weekly', 'monthly')
            
        Returns:
            包含抓取结果的字典
        """
        try:
            # 构建URL
            url = 'https://github.com/trending'
            time_params = {
                'daily': '',
                'weekly': 'since=weekly',
                'monthly': 'since=monthly'
            }
            
            if time_params[period]:
                url += f"?{time_params[period]}"
                
            print(f"Fetching GitHub trending data for period: {period}")
            print(f"URL: {url}")
            
            # 发送请求
            response = self.session.get(url)
            response.raise_for_status()
            
            # 解析HTML
            soup = BeautifulSoup(response.content, 'html.parser')
            trending_repos = []
            
            # 查找所有仓库条目
            repo_articles = soup.find_all('article', class_='Box-row')
            
            for index, article in enumerate(repo_articles):
                if index >= 25:  # 限制数量
                    break
                    
                repo_data = self._parse_repo_article(article)
                if repo_data:
                    trending_repos.append(repo_data)
            
            return {
                'success': True,
                'data': trending_repos,
                'period': period,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as error:
            print(f"Error fetching {period} trending data: {error}")
            return {
                'success': False,
                'error': f'Failed to fetch {period} trending data',
                'message': str(error)
            }
    
    def _parse_repo_article(self, article) -> Dict[str, Any]:
        """
        解析单个仓库文章元素
        
        Args:
            article: BeautifulSoup article元素
            
        Returns:
            仓库数据字典
        """
        try:
            # 获取仓库名称和URL
            repo_link = article.find('h2', class_='h3').find('a')
            repo_name = repo_link.get_text(strip=True)
            repo_url = 'https://github.com' + repo_link.get('href')
            
            # 获取描述
            description_elem = article.find('p')
            description = description_elem.get_text(strip=True) if description_elem else 'No description available'
            
            # 获取编程语言
            language_elem = article.find(attrs={'itemprop': 'programmingLanguage'})
            language = language_elem.get_text(strip=True) if language_elem else 'Unknown'
            
            # 获取星标数
            stars_elem = article.find('a', href=re.compile(r'/stargazers'))
            stars_text = stars_elem.get_text(strip=True) if stars_elem else '0'
            stars = re.sub(r'[^\d]', '', stars_text) or '0'
            
            # 获取fork数
            forks_elem = article.find('a', href=re.compile(r'/forks'))
            forks_text = forks_elem.get_text(strip=True) if forks_elem else '0'
            forks = re.sub(r'[^\d]', '', forks_text) or '0'
            
            # 获取今日星标数
            stars_today_elem = article.find('span', class_='d-inline-block float-sm-right')
            stars_today_text = stars_today_elem.get_text(strip=True) if stars_today_elem else '0'
            stars_today = re.sub(r'[^\d]', '', stars_today_text) or '0'
            
            # 获取贡献者
            built_by = []
            avatar_imgs = article.find_all('img', class_='avatar')
            for img in avatar_imgs[:5]:  # 限制贡献者数量
                username = img.get('alt', '').replace('@', '')
                if username:
                    built_by.append(f"@{username}")
            
            return {
                'name': repo_name,
                'description': description,
                'language': language,
                'stars': f"{int(stars):,}",
                'forks': f"{int(forks):,}",
                'starsToday': f"{int(stars_today):,}",
                'url': repo_url,
                'builtBy': built_by
            }
            
        except Exception as error:
            print(f"Error parsing repo article: {error}")
            return None
    
    def update_all_trending_data(self):
        """
        更新所有时间周期的trending数据
        """
        try:
            periods = ['daily', 'weekly', 'monthly']
            all_data = {}
            
            for period in periods:
                print(f"Fetching {period} trending data...")
                result = self.fetch_trending_data(period)
                
                if result['success']:
                    all_data[period] = result['data']
                    print(f"Successfully fetched {len(result['data'])} repositories for {period}")
                else:
                    print(f"Failed to fetch {period} data: {result['error']}")
                
                # 添加延迟避免请求过快
                if period != periods[-1]:  # 不是最后一个周期
                    time.sleep(2)
            
            # 准备保存的数据
            data_to_save = {
                **all_data,
                'lastUpdated': datetime.now().isoformat(),
                'totalRepositories': sum(len(repos) for repos in all_data.values())
            }
            
            # 保存到文件
            output_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'feeds', 'trending-data.json')
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(data_to_save, f, indent=2, ensure_ascii=False)
            
            print(f"Trending data saved to {output_path}")
            print(f"Total repositories: {data_to_save['totalRepositories']}")
            print(f"Last updated: {data_to_save['lastUpdated']}")
            
        except Exception as error:
            print(f"Error updating trending data: {error}")
            raise

def main():
    """主函数"""
    scraper = GitHubTrendingScraper()
    scraper.update_all_trending_data()

if __name__ == "__main__":
    main() 