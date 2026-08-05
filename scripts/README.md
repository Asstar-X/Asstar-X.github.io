# Asstar 自动化数据更新脚本

这是 Asstar 项目的统一数据爬取入口。

## 快速开始

所有的爬虫功能都已整合到 `fetch_all.py` 中。

### 安装依赖
```bash
pip install -r scripts/requirements.txt
```

### 使用方法
```bash
# 更新所有数据 (GitHub, HuggingFace Models, HuggingFace Papers, Tophub/Focus)
python scripts/fetch_all.py all

# 仅更新 GitHub Trending
python scripts/fetch_all.py github

# 仅更新 HuggingFace Models
python scripts/fetch_all.py huggingface

# 仅更新 HuggingFace Papers
python scripts/fetch_all.py papers

# 仅更新 实时焦点 (Tophub)
python scripts/fetch_all.py focus
```

## 输出文件
脚本会将结果保存到项目根目录下的 `feeds/` 文件夹中：
- `feeds/trending-data.json`
- `feeds/huggingface-data.json`
- `feeds/huggingface-papers-data.json`
- `feeds/realtime-focus.json`

## GitHub Actions
本项目配置了 GitHub Actions 自动更新。配置文件位于 `.github/workflows/update-feeds.yml`，每天会自动运行两次。
