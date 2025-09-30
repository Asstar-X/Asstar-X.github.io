#!/usr/bin/env python3
"""
测试GitHub Trending爬虫功能
"""

import sys
import os
sys.path.append(os.path.dirname(__file__))

from fetch_trending import GitHubTrendingScraper

def test_scraper():
    """测试爬虫功能"""
    print("开始测试GitHub Trending爬虫...")
    
    scraper = GitHubTrendingScraper()
    
    # 测试单个时间周期
    print("\n1. 测试每日数据抓取...")
    daily_result = scraper.fetch_trending_data('daily')
    
    if daily_result['success']:
        print(f"✅ 成功抓取 {len(daily_result['data'])} 个每日热门仓库")
        if daily_result['data']:
            first_repo = daily_result['data'][0]
            print(f"   示例: {first_repo['name']} - {first_repo['language']}")
    else:
        print(f"❌ 抓取失败: {daily_result['error']}")
        return False
    
    # 测试所有时间周期
    print("\n2. 测试所有时间周期数据抓取...")
    try:
        scraper.update_all_trending_data()
        print("✅ 所有数据抓取成功")
        return True
    except Exception as e:
        print(f"❌ 抓取失败: {e}")
        return False

if __name__ == "__main__":
    success = test_scraper()
    if success:
        print("\n🎉 所有测试通过！")
        sys.exit(0)
    else:
        print("\n💥 测试失败！")
        sys.exit(1) 