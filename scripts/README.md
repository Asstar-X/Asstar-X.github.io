# GitHub Trending & HuggingFace 数据爬虫

这个目录包含了用于抓取GitHub Trending和HuggingFace Model Trending数据的Python爬虫脚本。

## 功能说明

### GitHub Trending
- 抓取GitHub Trending页面的热门项目数据
- 支持每日、每周、每月三种时间周期
- 自动解析项目信息（名称、描述、语言、星标数等）
- 将数据保存为JSON格式供前端使用

### HuggingFace Model Trending
- 抓取HuggingFace模型页面的热门模型数据
- 支持Trending、Most Likes、Most Downloads三种分类
- 自动解析模型信息（名称、描述、任务类型、参数数量、点赞数、下载数等）
- 将数据保存为JSON格式供前端使用

## 文件说明

### GitHub Trending
- `fetch_trending.py` - GitHub Trending爬虫脚本
- `test_fetch.py` - GitHub Trending测试脚本

### HuggingFace Model Trending
- `fetch_huggingface.py` - HuggingFace Model Trending爬虫脚本
- `test_huggingface.py` - HuggingFace Model Trending测试脚本
- `update_huggingface.sh` - 自动化更新脚本

### 通用
- `requirements.txt` - Python依赖包
- `README.md` - 说明文档

## 使用方法

### 1. 安装依赖

```bash
cd scripts
pip install -r requirements.txt
```

### 2. 运行GitHub Trending爬虫

```bash
python fetch_trending.py
```

### 3. 运行HuggingFace Model Trending爬虫

```bash
python fetch_huggingface.py
```

### 4. 手动测试

```bash
# 测试GitHub Trending
python test_fetch.py

# 测试HuggingFace Model Trending
python test_huggingface.py
```

### 5. 自动化更新

```bash
# 使用shell脚本自动更新HuggingFace数据
chmod +x update_huggingface.sh
./update_huggingface.sh
```

## 数据更新

### GitHub Trending
爬虫会自动抓取以下数据：
- 项目名称和URL
- 项目描述
- 编程语言
- 星标数和fork数
- 今日新增星标数
- 贡献者信息

数据会保存到 `../trending-data.json` 文件中，前端页面会自动读取这个文件。

### HuggingFace Model Trending
爬虫会自动抓取以下数据：
- 模型名称和URL
- 模型描述
- 任务类型
- 参数数量
- 点赞数
- 下载数
- 标签信息

数据会保存到 `../huggingface-data.json` 文件中，前端页面会自动读取这个文件。

## 自动化部署

建议使用GitHub Actions或cron任务定期运行爬虫：

```bash
# GitHub Trending - 每6小时运行一次
0 */6 * * * cd /path/to/scripts && python fetch_trending.py

# HuggingFace Model Trending - 每天运行一次
0 2 * * * cd /path/to/scripts && python fetch_huggingface.py

# 或者使用自动化脚本
0 2 * * * cd /path/to/scripts && ./update_huggingface.sh
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