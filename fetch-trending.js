const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

async function fetchGitHubTrending(period = 'daily') {
    try {
        // 构建GitHub Trending URL
        let url = 'https://github.com/trending';
        
        // 添加时间参数
        const timeParams = {
            daily: '', // 每日不需要参数
            weekly: 'since=weekly', 
            monthly: 'since=monthly'
        };
        
        if (timeParams[period]) {
            url += `?${timeParams[period]}`;
        }

        console.log(`Fetching GitHub trending data for period: ${period}`);
        console.log(`URL: ${url}`);

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

        return {
            success: true,
            data: trendingRepos,
            period: period,
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error('Error fetching GitHub trending data:', error);
        return {
            success: false,
            error: 'Failed to fetch trending data',
            message: error.message
        };
    }
}

async function updateTrendingData() {
    try {
        // 获取所有时间周期的数据
        const periods = ['daily', 'weekly', 'monthly'];
        const allData = {};

        for (const period of periods) {
            console.log(`Fetching ${period} trending data...`);
            const result = await fetchGitHubTrending(period);
            
            if (result.success) {
                allData[period] = result.data;
                console.log(`Successfully fetched ${result.data.length} repositories for ${period}`);
            } else {
                console.error(`Failed to fetch ${period} data:`, result.error);
            }
            
            // 添加延迟避免请求过快
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // 保存数据到文件
        const dataPath = path.join(__dirname, 'trending-data.json');
        const dataToSave = {
            ...allData,
            lastUpdated: new Date().toISOString(),
            totalRepositories: Object.values(allData).reduce((sum, repos) => sum + repos.length, 0)
        };

        fs.writeFileSync(dataPath, JSON.stringify(dataToSave, null, 2));
        console.log(`Trending data saved to ${dataPath}`);
        console.log(`Total repositories: ${dataToSave.totalRepositories}`);
        console.log(`Last updated: ${dataToSave.lastUpdated}`);

    } catch (error) {
        console.error('Error updating trending data:', error);
        process.exit(1);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    updateTrendingData();
}

module.exports = { fetchGitHubTrending, updateTrendingData }; 