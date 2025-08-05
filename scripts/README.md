# GitHub Trending 自动更新脚本

这个目录包含了用于自动更新GitHub Trending数据的Python爬虫脚本。

## 文件说明

- `fetch_trending.py` - 主要的Python爬虫脚本
- `requirements.txt` - Python依赖包列表
- `README.md` - 本说明文档

## 功能特性

- 抓取GitHub Trending页面的数据（每日、每周、每月）
- 解析仓库信息：名称、描述、编程语言、星标数、fork数、今日星标数、贡献者
- 自动保存为JSON格式
- 支持GitHub Action定时执行

## 本地运行

1. 安装依赖：
```bash
pip install -r requirements.txt
```

2. 运行脚本：
```bash
python fetch_trending.py
```

## GitHub Action

脚本已配置为通过GitHub Action自动运行：

- **定时触发**：每天凌晨2点（UTC时间）
- **手动触发**：可在GitHub仓库的Actions页面手动运行
- **自动提交**：更新数据后自动提交到仓库

## 数据格式

生成的`trending-data.json`文件包含以下结构：

```json
{
  "daily": [...],
  "weekly": [...],
  "monthly": [...],
  "lastUpdated": "2024-01-01T02:00:00.000000",
  "totalRepositories": 75
}
```

每个仓库对象包含：
- `name`: 仓库名称
- `description`: 仓库描述
- `language`: 编程语言
- `stars`: 星标数
- `forks`: fork数
- `starsToday`: 今日星标数
- `url`: 仓库URL
- `builtBy`: 贡献者列表

## 注意事项

- 脚本包含请求延迟以避免被GitHub限制
- 每个时间周期最多抓取25个仓库
- 确保网络连接正常以访问GitHub 