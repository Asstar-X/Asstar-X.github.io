#!/usr/bin/env python3
"""
HuggingFace Model Trending Data Fetcher
使用Python爬虫抓取HuggingFace Trending数据并保存为JSON格式
"""

import requests
import json
import time
from datetime import datetime
from bs4 import BeautifulSoup
import re
import os
from typing import Dict, List, Any

class HuggingFaceScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
    def fetch_trending_data(self, category: str = 'trending') -> Dict[str, Any]:
        """
        抓取指定分类的HuggingFace数据
        
        Args:
            category: 分类 ('trending', 'likes', 'downloads')
            
        Returns:
            包含抓取结果的字典
        """
        try:
            # 构建URL
            url = 'https://huggingface.co/models'
            sort_params = {
                'trending': '?sort=trending',
                'likes': '?sort=likes',
                'downloads': '?sort=downloads'
            }
            
            if sort_params[category]:
                url += sort_params[category]
                
            print(f"Fetching HuggingFace {category} data")
            print(f"URL: {url}")
            
            # 发送请求
            response = self.session.get(url)
            response.raise_for_status()
            
            # 解析HTML
            soup = BeautifulSoup(response.content, 'html.parser')
            trending_models = []
            
            # 查找所有模型条目
            model_cards = soup.find_all('article', class_='Box-row')
            
            for index, card in enumerate(model_cards):
                if index >= 25:  # 限制数量
                    break
                    
                model_data = self._parse_model_card(card)
                if model_data:
                    trending_models.append(model_data)
            
            return {
                'success': True,
                'data': trending_models,
                'category': category,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as error:
            print(f"Error fetching {category} data: {error}")
            return {
                'success': False,
                'error': f'Failed to fetch {category} data',
                'slug': category,
                'message': str(error)
            }
    
    def _parse_model_card(self, card) -> Dict[str, Any]:
        """
        解析单个模型卡片元素
        
        Args:
            card: BeautifulSoup article元素
            
        Returns:
            模型数据字典
        """
        try:
            # 获取模型名称和URL
            model_link = card.find('h4').find('a') if card.find('h4') else None
            if not model_link:
                return None
                
            model_name = model_link.get_text(strip=True)
            model_url = 'https://huggingface.co' + model_link.get('href')
            
            # 获取描述
            description_elem = card.find('p', class_='text-gray-700')
            description = description_elem.get_text(strip=True) if description_elem else 'No description available'
            
            # 获取任务类型
            task_elem = card.find('span', class_='text-sm')
            task = task_elem.get_text(strip=True) if task_elem else 'Unknown'
            
            # 获取参数数量
            params_elem = card.find('span', string=re.compile(r'\d+[Bb]'))
            parameters = params_elem.get_text(strip=True) if params_elem else 'Unknown'
            
            # 获取点赞数
            likes_elem = card.find('span', string=re.compile(r'\d+[kKmM]'))
            likes = likes_elem.get_text(strip=True) if likes_elem else '0'
            
            # 获取下载数
            downloads_elem = card.find('span', string=re.compile(r'\d+[kKmM]'))
            downloads = downloads_elem.get_text(strip=True) if downloads_elem else '0'
            
            # 获取标签
            tags = []
            tag_elements = card.find_all('span', class_='text-xs')
            for tag_elem in tag_elements:
                tag_text = tag_elem.get_text(strip=True)
                if tag_text and len(tag_text) > 2:
                    tags.append(tag_text)
            
            # 限制标签数量
            tags = tags[:5]
            
            return {
                'name': model_name,
                'description': description,
                'task': task,
                'parameters': parameters,
                'likes': likes,
                'downloads': downloads,
                'url': model_url,
                'tags': tags
            }
            
        except Exception as error:
            print(f"Error parsing model card: {error}")
            return None
    
    def update_all_huggingface_data(self):
        """
        更新所有分类的HuggingFace数据
        """
        try:
            categories = ['trending', 'likes', 'downloads']
            all_data = {}
            
            for category in categories:
                print(f"Fetching {category} data...")
                result = self.fetch_trending_data(category)
                
                if result['success']:
                    all_data[category] = result['data']
                    print(f"Successfully fetched {len(result['data'])} models for {category}")
                else:
                    print(f"Failed to fetch {category} data: {result['error']}")
                
                # 添加延迟避免请求过快
                if category != categories[-1]:  # 不是最后一个分类
                    time.sleep(3)
            
            # 准备保存的数据
            data_to_save = {
                **all_data,
                'lastUpdated': datetime.now().isoformat(),
                'totalModels': sum(len(models) for models in all_data.values())
            }
            
            # 保存到文件
            output_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'huggingface-data.json')
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(data_to_save, f, indent=2, ensure_ascii=False)
            
            print(f"HuggingFace data saved to {output_path}")
            print(f"Total models: {data_to_save['totalModels']}")
            print(f"Last updated: {data_to_save['lastUpdated']}")
            
        except Exception as error:
            print(f"Error updating HuggingFace data: {error}")
            raise

def main():
    """主函数"""
    scraper = HuggingFaceScraper()
    scraper.update_all_huggingface_data()

if __name__ == "__main__":
    main()
