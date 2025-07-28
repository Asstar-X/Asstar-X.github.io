#!/bin/bash

# Asstar网站部署脚本
echo "🚀 开始部署Asstar网站到GitHub Pages..."

# 检查git状态
if [ -d ".git" ]; then
    echo "✅ Git仓库已初始化"
else
    echo "❌ 未找到Git仓库，请先初始化Git"
    exit 1
fi

# 添加所有文件
echo "📁 添加文件到Git..."
git add .

# 提交更改
echo "💾 提交更改..."
git commit -m "Update Asstar website - $(date)"

# 推送到远程仓库
echo "🌐 推送到GitHub..."
git push origin main

echo "✅ 部署完成！"
echo "📝 接下来请："
echo "1. 进入GitHub仓库设置"
echo "2. 找到'Pages'选项"
echo "3. 选择'Deploy from a branch'"
echo "4. 选择main分支"
echo "5. 保存设置"
echo ""
echo "🌍 网站将在几分钟后可通过 https://你的用户名.github.io/Asstar.github.io 访问" 