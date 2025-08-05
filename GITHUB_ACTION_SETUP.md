# GitHub Action 自动更新设置指南

本项目已配置GitHub Action来自动更新GitHub Trending数据，解决GitHub Pages无法自动更新的问题。

## 🎯 解决方案概述

### 问题
- GitHub Pages是静态网站，无法运行服务器端脚本
- 原有的Node.js爬虫无法在GitHub Pages环境中自动执行
- 需要手动更新trending数据

### 解决方案
- 使用GitHub Actions定时执行Python爬虫
- 自动抓取GitHub Trending数据
- 自动提交更新到仓库
- 无需手动干预

## 📁 新增文件结构

```
.github/
└── workflows/
    └── update-trending.yml          # GitHub Action工作流配置

scripts/
├── fetch_trending.py                # Python爬虫主脚本
├── test_fetch.py                    # 测试脚本
├── requirements.txt                 # Python依赖包
└── README.md                        # 脚本说明文档

setup-github-action.sh               # 设置脚本
GITHUB_ACTION_SETUP.md               # 本说明文档
```

## 🚀 快速开始

### 1. 自动设置（推荐）
```bash
./setup-github-action.sh
```

### 2. 手动设置
```bash
# 1. 确保所有文件已创建
# 2. 设置文件权限
chmod +x scripts/fetch_trending.py
chmod +x scripts/test_fetch.py

# 3. 测试脚本
python scripts/test_fetch.py

# 4. 提交并推送
git add .
git commit -m "Add GitHub Action for automatic trending data updates"
git push origin main
```

## ⚙️ 配置详情

### GitHub Action工作流
- **触发方式**: 
  - 定时触发：每天凌晨2点（UTC时间）
  - 手动触发：可在GitHub Actions页面手动运行
- **运行环境**: Ubuntu最新版本
- **Python版本**: 3.11
- **依赖包**: requests, beautifulsoup4, lxml

### Python爬虫功能
- 抓取GitHub Trending页面数据
- 支持每日、每周、每月三个时间周期
- 解析仓库信息：名称、描述、语言、星标数、fork数等
- 自动保存为JSON格式
- 包含错误处理和重试机制

## 📊 数据更新流程

1. **定时触发** → GitHub Action在指定时间自动启动
2. **环境准备** → 设置Python环境和安装依赖
3. **数据抓取** → 执行Python爬虫抓取GitHub Trending数据
4. **数据保存** → 更新`trending-data.json`文件
5. **自动提交** → 将更新提交到Git仓库
6. **部署更新** → GitHub Pages自动部署最新数据

## 🔧 自定义配置

### 修改更新频率
编辑`.github/workflows/update-trending.yml`文件中的cron表达式：
```yaml
schedule:
  - cron: '0 2 * * *'  # 每天凌晨2点
  # 其他选项：
  # '0 */6 * * *'     # 每6小时
  # '0 2 * * 1'       # 每周一凌晨2点
```

### 修改抓取数量
编辑`scripts/fetch_trending.py`文件中的限制：
```python
if index >= 25:  # 修改这个数字来改变抓取数量
    break
```

### 添加更多时间周期
在`scripts/fetch_trending.py`中添加新的时间周期：
```python
time_params = {
    'daily': '',
    'weekly': 'since=weekly',
    'monthly': 'since=monthly',
    'new_period': 'since=new_period'  # 添加新的时间周期
}
```

## 🧪 测试和调试

### 本地测试
```bash
# 测试单个功能
python scripts/test_fetch.py

# 手动运行爬虫
python scripts/fetch_trending.py
```

### GitHub Actions测试
1. 访问GitHub仓库页面
2. 点击"Actions"标签页
3. 选择"Update GitHub Trending Data"工作流
4. 点击"Run workflow"手动触发

### 查看日志
- 在GitHub Actions页面查看运行日志
- 检查是否有错误信息
- 验证数据是否正确更新

## 📈 监控和维护

### 监控指标
- 工作流运行状态
- 数据更新频率
- 抓取成功率
- 数据质量

### 常见问题
1. **工作流失败**: 检查Python依赖和网络连接
2. **数据不更新**: 检查GitHub Trending页面结构是否变化
3. **权限问题**: 确保GitHub Actions有写入权限

### 维护建议
- 定期检查GitHub Trending页面结构变化
- 监控工作流运行状态
- 及时更新Python依赖包
- 备份重要数据

## 🎉 完成设置

设置完成后，你的GitHub Trending功能将：
- ✅ 每天自动更新数据
- ✅ 无需手动干预
- ✅ 保持数据实时性
- ✅ 支持手动触发更新
- ✅ 自动部署到GitHub Pages

## 📞 技术支持

如果遇到问题，请：
1. 查看GitHub Actions运行日志
2. 检查Python脚本错误信息
3. 验证网络连接和GitHub API状态
4. 在GitHub Issues中提交问题

---

**恭喜！你的GitHub Trending功能现在可以自动更新了！** 🎊 