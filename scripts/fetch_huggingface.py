#!/usr/bin/env python3
"""
HuggingFace Model Trending Data Fetcher
使用 Hugging Face Hub API 抓取模型列表并保存为 JSON

类别：
- trending: sort=trending
- likes: sort=likes
- downloads: sort=downloads
"""

import requests
import json
import time
from datetime import datetime
import os
from typing import Dict, List, Any
from urllib.parse import urlencode

class HuggingFaceScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        # 适度的超时与重试
        self.timeout_seconds = 20
        self.max_retries = 3
        self.api_base = 'https://huggingface.co/api/models'
        
    def fetch_trending_data(self, category: str = 'trending') -> Dict[str, Any]:
        """
        抓取指定分类的HuggingFace数据
        
        Args:
            category: 分类 ('trending', 'likes', 'downloads')
            
        Returns:
            包含抓取结果的字典
        """
        try:
            # 构建 API URL（trending 在 API 上不可用，做多候选兜底）
            url_candidates: List[str] = []
            if category == 'trending':
                # 1) 非官方：尝试 trending=true
                url_candidates.append(f"{self.api_base}?{urlencode({'trending': 'true', 'limit': 25})}")
                # 2) 最近更新排序
                url_candidates.append(f"{self.api_base}?{urlencode({'sort': 'lastModified', 'direction': '-1', 'limit': 25})}")
                # 3) 点赞排序作为最终兜底
                url_candidates.append(f"{self.api_base}?{urlencode({'sort': 'likes', 'limit': 25})}")
            else:
                url_candidates.append(f"{self.api_base}?{urlencode({'sort': category, 'limit': 25})}")

            items: List[Dict[str, Any]] = []
            last_error: Exception | None = None
            picked_url: str | None = None

            print(f"Fetching HuggingFace {category} data via API")
            for candidate in url_candidates:
                print(f"Trying URL: {candidate}")
                response = None
                for attempt in range(1, self.max_retries + 1):
                    try:
                        response = self.session.get(candidate, timeout=self.timeout_seconds)
                        response.raise_for_status()
                        data = response.json() if response.content else []
                        if isinstance(data, list) and len(data) > 0:
                            items = data
                            picked_url = candidate
                            break
                        else:
                            # 即使 200 也可能返回空，继续尝试下一个候选
                            last_error = Exception("Empty list returned")
                    except Exception as req_error:
                        last_error = req_error
                        print(f"Attempt {attempt} failed: {req_error}")
                        time.sleep(2 * attempt)
                if items:
                    break

            if not items and last_error:
                raise RuntimeError(f"All candidates failed or returned empty: {last_error}")

            if picked_url:
                print(f"Picked URL: {picked_url}")

            if not isinstance(items, list):
                items = []

            trending_models: List[Dict[str, Any]] = []
            for index, item in enumerate(items[:25]):
                parsed = self._map_api_item_to_model(item)
                if parsed:
                    trending_models.append(parsed)

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
    
    def _map_api_item_to_model(self, item: Dict[str, Any]) -> Dict[str, Any] | None:
        """将 HF API 返回的模型条目映射为前端所需结构。"""
        try:
            model_id = item.get('modelId') or item.get('id') or ''
            if not model_id:
                return None

            url = f"https://huggingface.co/{model_id}"
            description = item.get('description') or item.get('cardData', {}).get('description') or 'No description available'
            task = item.get('pipeline_tag') or 'Unknown'
            # likes / downloads 为数字，这里转为带千分位的字符串
            likes_num = item.get('likes') or 0
            downloads_num = item.get('downloads') or 0
            likes = f"{int(likes_num):,}"
            downloads = f"{int(downloads_num):,}"
            # 参数量：API 通常没有明确参数量字段，这里尝试从 tags 或 cardData 中获取，否则 Unknown
            parameters = item.get('cardData', {}).get('parameters') or 'Unknown'
            # 标签：优先使用 tags，其次从 cardData.tags
            tags = []
            if isinstance(item.get('tags'), list):
                tags = [t for t in item['tags'] if isinstance(t, str)][:5]
            elif isinstance(item.get('cardData', {}).get('tags'), list):
                tags = [t for t in item['cardData']['tags'] if isinstance(t, str)][:5]

            return {
                'name': model_id,
                'description': description,
                'task': task,
                'parameters': parameters,
                'likes': likes,
                'downloads': downloads,
                'url': url,
                'tags': tags,
            }
        except Exception as error:
            print(f"Error mapping api item: {error}")
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
            
            # 如果所有分类都为空，尝试保留旧文件，避免写入空列表覆盖
            output_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'feeds', 'huggingface-data.json')
            if data_to_save.get('totalModels', 0) == 0:
                if os.path.exists(output_path):
                    print("No models fetched; preserving existing huggingface-data.json")
                    return
                else:
                    print("No models fetched and no existing file; writing empty structure anyway")

            # 保存到文件
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
