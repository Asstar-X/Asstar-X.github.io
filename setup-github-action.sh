#!/bin/bash

# GitHub Action 设置脚本
# 用于设置自动更新GitHub Trending数据的功能

echo "🚀 设置GitHub Action自动更新功能..."

# 检查是否在Git仓库中
if [ ! -d ".git" ]; then
    echo "❌ 错误: 当前目录不是Git仓库"
    echo "请确保在项目根目录中运行此脚本"
    exit 1
fi

# 创建必要的目录
echo "📁 创建必要的目录..."
mkdir -p .github/workflows
mkdir -p scripts

# 检查文件是否存在
if [ ! -f ".github/workflows/update-trending.yml" ]; then
    echo "❌ 错误: GitHub Action工作流文件不存在"
    echo "请确保 .github/workflows/update-trending.yml 文件存在"
    exit 1
fi

if [ ! -f "scripts/fetch_trending.py" ]; then
    echo "❌ 错误: Python爬虫脚本不存在"
    echo "请确保 scripts/fetch_trending.py 文件存在"
    exit 1
fi

# 设置文件权限
echo "🔧 设置文件权限..."
chmod +x scripts/fetch_trending.py
chmod +x scripts/test_fetch.py

# 测试Python脚本
echo "🧪 测试Python爬虫脚本..."
if python scripts/test_fetch.py; then
    echo "✅ Python脚本测试通过"
else
    echo "❌ Python脚本测试失败"
    exit 1
fi

# 提交更改
echo "📝 提交更改到Git..."
git add .
git commit -m "Add GitHub Action for automatic trending data updates" || echo "没有新的更改需要提交"

echo ""
echo "🎉 GitHub Action设置完成！"
echo ""
echo "📋 下一步操作："
echo "1. 推送代码到GitHub: git push origin main"
echo "2. 在GitHub仓库页面查看Actions标签页"
echo "3. 手动触发一次工作流来测试功能"
echo "4. 设置完成后，每天凌晨2点（UTC）会自动更新数据"
echo ""
echo "📖 更多信息请查看："
echo "- scripts/README.md - 脚本使用说明"
echo "- .github/workflows/update-trending.yml - 工作流配置"
echo "" 