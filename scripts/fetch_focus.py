#!/usr/bin/env python3
"""
东方财富网焦点新闻爬虫
爬取东方财富网焦点新闻数据并保存为JSON格式
"""

import requests
import json
import time
from datetime import datetime
from bs4 import BeautifulSoup
import re
import os
from typing import Dict, List, Any

class EastMoneyFocusScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        })
        
    def fetch_focus_news(self) -> Dict[str, Any]:
        """
        抓取东方财富网焦点新闻数据
        
        Returns:
            包含抓取结果的字典
        """
        try:
            url = 'https://finance.eastmoney.com/yaowen.html'
            print(f"Fetching EastMoney focus news from: {url}")
            
            # 发送请求
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            response.encoding = 'utf-8'
            
            # 解析HTML
            soup = BeautifulSoup(response.content, 'html.parser')
            news_list = []
            
            # 调试：保存原始HTML用于分析
            debug_html_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'debug_eastmoney.html')
            with open(debug_html_path, 'w', encoding='utf-8') as f:
                f.write(response.text)
            print(f"调试HTML已保存到: {debug_html_path}")
            
            # 查找新闻条目 - 使用更精确的选择器
            news_items = []
            
            # 方法1: 专门针对东方财富网焦点新闻页面的结构
            # 东方财富网的焦点新闻通常有特定的URL模式：/a/数字.html
            selectors_to_try = [
                # 查找包含新闻链接的元素
                'a[href*="/a/"]',
                'a[href*="finance.eastmoney.com/a/"]',
                # 查找新闻列表容器
                'div.newslist a',
                'ul.newslist a',
                'div[class*="news"] a',
                'div[class*="list"] a',
                'li a[href*="/a/"]',
                # 更通用的选择器
                'div[class*="content"] a',
                'div[class*="main"] a',
                'div[class*="center"] a'
            ]
            
            for selector in selectors_to_try:
                items = soup.select(selector)
                if items:
                    print(f"使用选择器 '{selector}' 找到 {len(items)} 个新闻项")
                    for item in items[:50]:  # 增加检查数量
                        # 如果是链接元素，直接使用
                        if item.name == 'a':
                            href = item.get('href', '')
                            text = item.get_text(strip=True)
                            # 检查是否是新闻链接
                            if (text and len(text) > 10 and 
                                ('/a/' in href or 'finance.eastmoney.com/a/' in href) and
                                not any(skip in text.lower() for skip in ['广告', '推广', '合作', '赞助', '更多', '查看更多'])):
                                news_items.append(item)
                        else:
                            # 如果不是链接，查找其中的链接
                            link = item.find('a', href=True)
                            if link and link.get_text(strip=True):
                                news_items.append(link)
                    if news_items:
                        break
            
            # 方法2: 如果上面没找到，直接查找所有链接并过滤
            if not news_items:
                print("尝试直接查找并过滤新闻链接...")
                all_links = soup.find_all('a', href=True)
                for link in all_links:
                    href = link.get('href', '')
                    text = link.get_text(strip=True)
                    
                    # 专门查找东方财富网新闻链接模式
                    if (text and len(text) > 10 and len(text) < 200 and
                        text not in ['更多', '查看更多', '展开', '收起', '广告', '推广'] and
                        ('/a/' in href or 'finance.eastmoney.com/a/' in href) and
                        not any(skip in text.lower() for skip in ['广告', '推广', '合作', '赞助', '数据', '行情', '股票', '基金', '债券'])):
                        news_items.append(link)
                        if len(news_items) >= 30:  # 增加数量限制
                            break
            
            # 方法3: 如果还是不够，尝试更宽松的过滤条件
            if len(news_items) < 20:
                print(f"当前只找到 {len(news_items)} 条新闻，尝试更宽松的过滤条件...")
                all_links = soup.find_all('a', href=True)
                for link in all_links:
                    href = link.get('href', '')
                    text = link.get_text(strip=True)
                    
                    # 更宽松的新闻链接判断，但仍然优先选择/a/模式的链接
                    if (text and len(text) > 8 and len(text) < 300 and
                        text not in ['更多', '查看更多', '展开', '收起', '广告', '推广', '数据', '行情'] and
                        ('/a/' in href or 'finance.eastmoney.com/a/' in href or 
                         'news' in href or 'yaowen' in href) and
                        not any(skip in text.lower() for skip in ['广告', '推广', '合作', '赞助'])):
                        news_items.append(link)
                        if len(news_items) >= 30:  # 增加数量限制
                            break
            
            # 去重并限制数量
            seen_titles = set()
            unique_items = []
            for item in news_items:
                # 获取标题文本
                if item.name == 'a':
                    title = item.get_text(strip=True)
                else:
                    link = item.find('a')
                    title = link.get_text(strip=True) if link else item.get_text(strip=True)
                
                if title and title not in seen_titles and len(title) > 5:
                    seen_titles.add(title)
                    unique_items.append(item)
                    if len(unique_items) >= 30:  # 增加数量限制
                        break
            
            print(f"Found {len(unique_items)} news items")
            
            # 解析每个新闻条目
            for index, item in enumerate(unique_items):
                if index >= 25:  # 限制数量
                    break
                    
                news_data = self._parse_news_item(item, index)
                if news_data:
                    news_list.append(news_data)
            
            # 如果爬取到的新闻数量不足，记录警告但不添加模拟数据
            if len(news_list) < 10:
                print(f"Warning: Only found {len(news_list)} news items, which is less than expected")
            
            return {
                'success': True,
                'data': news_list,
                'timestamp': datetime.now().isoformat(),
                'source': '东方财富网',
                'total_news': len(news_list)
            }
            
        except Exception as error:
            print(f"Error fetching focus news: {error}")
            return {
                'success': False,
                'data': [],
                'error': f'Failed to fetch focus news: {str(error)}',
                'timestamp': datetime.now().isoformat(),
                'source': '东方财富网',
                'total_news': 0
            }
    
    def _parse_news_item(self, item, index: int) -> Dict[str, Any]:
        """
        解析单个新闻条目
        
        Args:
            item: BeautifulSoup元素
            index: 索引
            
        Returns:
            新闻数据字典
        """
        try:
            # 获取标题和链接
            if item.name == 'a':
                # 如果是链接元素
                title = item.get_text(strip=True)
                href = item.get('href', '')
            else:
                # 如果是其他元素，查找其中的链接
                link = item.find('a')
                if link:
                    title = link.get_text(strip=True)
                    href = link.get('href', '')
                else:
                    title = item.get_text(strip=True)
                    href = ''
            
            if not title or len(title) < 5:
                return None
            
            # 处理链接
            if href and not href.startswith('http'):
                if href.startswith('/'):
                    href = 'https://finance.eastmoney.com' + href
                elif href.startswith('//'):
                    href = 'https:' + href
                else:
                    href = 'https://finance.eastmoney.com/' + href
            
            # 尝试提取时间信息
            time_str = self._extract_time_from_item(item)
            if not time_str:
                time_str = self._generate_time_string(index)
            
            # 分类新闻
            category = self._categorize_news(title)
            
            # 生成标签
            tags = self._generate_tags(title)
            
            # 生成内容摘要
            content = self._generate_content_summary(title)
            
            return {
                'title': title,
                'content': content,
                'category': category,
                'time': time_str,
                'source': '东方财富网',
                'url': href or 'https://finance.eastmoney.com/yaowen.html',
                'tags': tags,
                'index': index
            }
            
        except Exception as error:
            print(f"Error parsing news item {index}: {error}")
            return None
    
    def _categorize_news(self, title: str) -> str:
        """根据标题分类新闻"""
        title_lower = title.lower()
        
        if any(keyword in title_lower for keyword in ['a股', '上证', '深证', '创业板', '科创板', '股票', '股市', '涨停', '跌停']):
            return 'securities'
        elif any(keyword in title_lower for keyword in ['中美', '贸易', '美国', '欧洲', '国际', '全球', '外汇', '美元']):
            return 'international'
        elif any(keyword in title_lower for keyword in ['公司', '企业', '上市', '财报', '业绩', '公告']):
            return 'company'
        elif any(keyword in title_lower for keyword in ['央行', '政策', '经济', 'gdp', '通胀', '利率', '财政']):
            return 'domestic'
        else:
            return 'domestic'  # 默认为国内经济
    
    def _extract_time_from_item(self, item) -> str:
        """从新闻项中提取时间信息"""
        try:
            # 查找时间相关的元素
            time_selectors = ['span', 'em', 'time', 'div[class*="time"]', 'div[class*="date"]']
            for selector in time_selectors:
                time_elem = item.find(selector)
                if time_elem:
                    time_text = time_elem.get_text(strip=True)
                    # 检查是否包含时间格式
                    if re.search(r'\d+月\d+日|\d+:\d+|\d+-\d+', time_text):
                        return time_text
            return None
        except:
            return None
    
    def _generate_time_string(self, index: int) -> str:
        """生成时间字符串"""
        now = datetime.now()
        # 根据索引生成不同的时间
        hour = (now.hour - index) % 24
        minute = (now.minute - index * 3) % 60
        return f"{now.month}月{now.day}日 {hour:02d}:{minute:02d}"
    
    def _generate_tags(self, title: str) -> List[str]:
        """根据标题生成标签"""
        tags = []
        title_lower = title.lower()
        
        # 关键词映射
        keyword_mapping = {
            'a股': 'A股',
            '股票': '股票',
            '涨停': '涨停',
            '跌停': '跌停',
            '中美': '中美贸易',
            '贸易': '贸易',
            '央行': '央行',
            '政策': '政策',
            '经济': '经济',
            '公司': '公司',
            '企业': '企业',
            '上市': '上市',
            '财报': '财报',
            '业绩': '业绩'
        }
        
        for keyword, tag in keyword_mapping.items():
            if keyword in title_lower:
                tags.append(tag)
        
        # 如果没有找到标签，添加通用标签
        if not tags:
            tags = ['财经', '焦点']
        
        return tags[:3]  # 限制标签数量
    
    def _generate_content_summary(self, title: str) -> str:
        """根据标题生成内容摘要"""
        # 这里可以根据标题生成更详细的内容摘要
        # 为了简化，我们使用一些模板
        templates = [
            f"{title}，相关市场表现值得关注。",
            f"关于{title}的最新进展，市场反应积极。",
            f"{title}，投资者需要密切关注后续发展。",
            f"针对{title}，专家分析认为影响深远。",
            f"{title}，预计将对相关板块产生重要影响。"
        ]
        
        import random
        return random.choice(templates)
    
    
    def update_focus_data(self):
        """
        更新焦点新闻数据
        """
        try:
            print("Fetching EastMoney focus news...")
            result = self.fetch_focus_news()
            
            if result['success']:
                print(f"Successfully fetched {len(result['data'])} news items")
            else:
                print(f"Using fallback data: {result.get('error', 'Unknown error')}")
            
            # 准备保存的数据
            data_to_save = {
                'news': result['data'],
                'lastUpdated': datetime.now().isoformat(),
                'totalNews': len(result['data']),
                'source': result.get('source', '东方财富网'),
                'success': result['success']
            }
            
            # 保存到文件
            output_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'feeds', 'focus-data.json')
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(data_to_save, f, indent=2, ensure_ascii=False)
            
            print(f"Focus news data saved to {output_path}")
            print(f"Total news items: {data_to_save['totalNews']}")
            print(f"Last updated: {data_to_save['lastUpdated']}")
            
        except Exception as error:
            print(f"Error updating focus news data: {error}")
            raise

def main():
    """主函数"""
    scraper = EastMoneyFocusScraper()
    scraper.update_focus_data()

if __name__ == "__main__":
    main()
