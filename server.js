const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// GitHub Trending API
app.get('/api/github-trending', async (req, res) => {
    try {
        const { period = 'daily', language = 'any' } = req.query;
        
        // 构建GitHub Trending URL
        let url = 'https://github.com/trending';
        if (language && language !== 'any') {
            url += `/${language}`;
        }
        
        // 添加时间参数
        const timeParams = {
            daily: '', // 每日不需要参数
            weekly: 'since=weekly', 
            monthly: 'since=monthly'
        };
        
        if (timeParams[period]) {
            url += `?${timeParams[period]}`;
        }

        // 获取GitHub Trending页面
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        const trendingRepos = [];

        // 解析GitHub Trending页面
        $('article.Box-row').each((index, element) => {
            if (index >= 25) return; // 限制数量

            const $repo = $(element);
            
            // 获取仓库名称
            const repoName = $repo.find('h2.h3 a').text().trim();
            const repoUrl = 'https://github.com' + $repo.find('h2.h3 a').attr('href');
            
            // 获取描述
            const description = $repo.find('p').text().trim();
            
            // 获取编程语言
            const language = $repo.find('[itemprop="programmingLanguage"]').text().trim();
            
            // 获取星标数
            const starsText = $repo.find('a.Link--muted[href*="/stargazers"]').text().trim();
            const stars = starsText.replace(/[^\d]/g, '') || '0';
            
            // 获取fork数
            const forksText = $repo.find('a.Link--muted[href*="/forks"]').text().trim();
            const forks = forksText.replace(/[^\d]/g, '') || '0';
            
            // 获取今日星标数
            const starsTodayText = $repo.find('span.d-inline-block.float-sm-right').text().trim();
            const starsToday = starsTodayText.replace(/[^\d]/g, '') || '0';
            
            // 获取贡献者
            const builtBy = [];
            $repo.find('img.avatar').each((i, img) => {
                const username = $(img).attr('alt')?.replace('@', '');
                if (username) {
                    builtBy.push(`@${username}`);
                }
            });

            if (repoName) {
                trendingRepos.push({
                    name: repoName,
                    description: description || 'No description available',
                    language: language || 'Unknown',
                    stars: parseInt(stars).toLocaleString(),
                    forks: parseInt(forks).toLocaleString(),
                    starsToday: parseInt(starsToday).toLocaleString(),
                    url: repoUrl,
                    builtBy: builtBy.slice(0, 5) // 限制贡献者数量
                });
            }
        });

        res.json({
            success: true,
            data: trendingRepos,
            period: period,
            language: language,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error fetching GitHub trending data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch trending data',
            message: error.message
        });
    }
});

// 健康检查端点
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`GitHub Trending API: http://localhost:${PORT}/api/github-trending`);
});

module.exports = app; 