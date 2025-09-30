#!/usr/bin/env python3
"""
测试HuggingFace数据爬虫
"""

import sys
import os

# 添加父目录到路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scripts.fetch_huggingface import HuggingFaceScraper

def test_huggingface_scraper():
    """测试HuggingFace爬虫"""
    print("开始测试HuggingFace数据爬虫...")
    
    try:
        scraper = HuggingFaceScraper()
        
        # 测试单个分类
        print("\n测试trending分类...")
        result = scraper.fetch_trending_data('trending')
        if result['success']:
            print(f"✓ 成功获取{len(result['data'])}个模型")
            if result['data']:
                print(f"  示例模型: {result['data'][0]['name']}")
        else:
            print(f"✗ 获取失败: {result['error']}")
        
        # 测试所有分类
        print("\n测试所有分类...")
        scraper.update_all_huggingface_data()
        
        print("\n✓ 测试完成!")
        
    except Exception as e:
        print(f"✗ 测试失败: {e}")
        return False
    
    return True

if __name__ == "__main__":
    test_huggingface_scraper()
