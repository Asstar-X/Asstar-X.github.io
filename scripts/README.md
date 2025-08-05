# GitHub Trending 数据爬虫

这个目录包含了用于抓取GitHub Trending数据的Python爬虫脚本。

## 功能说明

- 抓取GitHub Trending页面的热门项目数据
- 支持每日、每周、每月三种时间周期
- 自动解析项目信息（名称、描述、语言、星标数等）
- 将数据保存为JSON格式供前端使用

## 文件说明

- `fetch_trending.py` - 主要的爬虫脚本
- `requirements.txt` - Python依赖包
- `test_fetch.py` - 测试脚本
- `README.md` - 说明文档

## 使用方法

### 1. 安装依赖

```bash
cd scripts
pip install -r requirements.txt
```

### 2. 运行爬虫

```bash
python fetch_trending.py
```

### 3. 手动测试

```bash
python test_fetch.py
```

## 数据更新

爬虫会自动抓取以下数据：
- 项目名称和URL
- 项目描述
- 编程语言
- 星标数和fork数
- 今日新增星标数
- 贡献者信息

数据会保存到 `../trending-data.json` 文件中，前端页面会自动读取这个文件。

## 自动化部署

建议使用GitHub Actions或cron任务定期运行爬虫：

```bash
# 每6小时运行一次
0 */6 * * * cd /path/to/scripts && python fetch_trending.py
```

## 注意事项

- 请遵守GitHub的使用条款和robots.txt
- 建议在请求之间添加适当的延迟
- 如果遇到网络问题，脚本会自动重试
- 数据文件会自动备份，避免数据丢失

## 故障排除

如果遇到问题，请检查：
1. 网络连接是否正常
2. Python依赖是否正确安装
3. GitHub页面结构是否发生变化
4. 文件权限是否正确 