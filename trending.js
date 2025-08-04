// GitHub Trending 功能
class GitHubTrending {
    constructor() {
        this.currentPeriod = 'daily';
        this.trendingData = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadTrendingData();
        this.startAutoRefresh();
    }

    bindEvents() {
        // 时间筛选按钮事件
        const timeButtons = document.querySelectorAll('.time-btn');
        timeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                timeButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentPeriod = e.target.dataset.period;
                this.loadTrendingData();
            });
        });
    }

    async loadTrendingData() {
        const contentContainer = document.getElementById('trending-content');
        
        // 显示加载状态
        contentContainer.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>正在加载热门项目...</p>
            </div>
        `;

        try {
            // 由于CORS限制，我们需要使用代理或模拟数据
            // 这里我们使用模拟数据来展示功能
            const data = await this.fetchTrendingData();
            this.trendingData = data;
            this.renderTrendingData();
        } catch (error) {
            console.error('加载数据失败:', error);
            this.showError();
        }
    }

    async fetchTrendingData() {
        try {
            // 首先尝试从本地JSON文件获取数据
            const response = await fetch('trending-data.json');
            if (response.ok) {
                const data = await response.json();
                if (data[this.currentPeriod]) {
                    return data[this.currentPeriod];
                }
            }
        } catch (error) {
            console.warn('无法加载本地数据文件:', error);
        }

        try {
            // 尝试从真实API获取数据
            const response = await fetch(`/api/github-trending?period=${this.currentPeriod}`);
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    return result.data;
                }
            }
        } catch (error) {
            console.warn('无法连接到真实API，使用模拟数据:', error);
        }

        // 如果API不可用，使用模拟数据
        const mockData = {
            daily: [
                {
                    name: "dyad-sh/dyad",
                    description: "Free, local, open-source AI app builder | v0 / lovable / Bolt alternative | 🌟 Star if you like it!",
                    language: "TypeScript",
                    stars: "5,513",
                    forks: "630",
                    starsToday: "751",
                    url: "https://github.com/dyad-sh/dyad",
                    builtBy: ["@wwwillchen", "@graphite-app", "@cubic-dev-ai", "@pwilkin"]
                },
                {
                    name: "wg-easy/wg-easy",
                    description: "The easiest way to run WireGuard VPN + Web-based Admin UI.",
                    language: "TypeScript",
                    stars: "21,208",
                    forks: "2,007",
                    starsToday: "274",
                    url: "https://github.com/wg-easy/wg-easy",
                    builtBy: ["@pheiduck", "@peterlewis", "@kaaax0815", "@github-actions", "@dependabot"]
                },
                {
                    name: "eclipse-sumo/sumo",
                    description: "Eclipse SUMO is an open source, highly portable, microscopic and continuous traffic simulation package designed to handle large networks.",
                    language: "C++",
                    stars: "3,401",
                    forks: "1,595",
                    starsToday: "39",
                    url: "https://github.com/eclipse-sumo/sumo",
                    builtBy: ["@namdre", "@palvarezlopez", "@behrisch", "@m-kro", "@angelobanse"]
                },
                {
                    name: "trekhleb/javascript-algorithms",
                    description: "📝 Algorithms and data structures implemented in JavaScript with explanations and links to further readings",
                    language: "JavaScript",
                    stars: "192,802",
                    forks: "30,813",
                    starsToday: "158",
                    url: "https://github.com/trekhleb/javascript-algorithms",
                    builtBy: ["@trekhleb", "@alexstulov", "@m-maksyutin", "@appleJax", "@albertstill"]
                },
                {
                    name: "XTLS/Xray-core",
                    description: "Xray, Penetrates Everything. Also the best v2ray-core. Where the magic happens. An open platform for various uses.",
                    language: "Go",
                    stars: "30,430",
                    forks: "4,475",
                    starsToday: "30",
                    url: "https://github.com/XTLS/Xray-core",
                    builtBy: ["@RPRX", "@dependabot", "@yuhan6665", "@Fangliding", "@mmmray"]
                }
            ],
            weekly: [
                {
                    name: "cloudwego/eino",
                    description: "The ultimate LLM/AI application development framework in Golang.",
                    language: "Go",
                    stars: "6,350",
                    forks: "488",
                    starsToday: "981",
                    url: "https://github.com/cloudwego/eino",
                    builtBy: ["@meguminnnnnnnnn", "@shentongmartin", "@luohq-bytedance", "@hi-pender", "@N3kox"]
                },
                {
                    name: "Shubhamsaboo/awesome-llm-apps",
                    description: "Collection of awesome LLM apps with AI Agents and RAG using OpenAI, Anthropic, Gemini and opensource models.",
                    language: "Python",
                    stars: "55,218",
                    forks: "6,469",
                    starsToday: "3,271",
                    url: "https://github.com/Shubhamsaboo/awesome-llm-apps",
                    builtBy: ["@Shubhamsaboo", "@Madhuvod", "@libw0430", "@AndrewHoh", "@CodeWithCharan"]
                },
                {
                    name: "linshenkx/prompt-optimizer",
                    description: "一款提示词优化器，助力于编写高质量的提示词",
                    language: "TypeScript",
                    stars: "12,185",
                    forks: "1,471",
                    starsToday: "1,739",
                    url: "https://github.com/linshenkx/prompt-optimizer",
                    builtBy: ["@linshenkx", "@hexart", "@lanyuanxiaoyao", "@mrzzcn", "@zzzhouuu"]
                },
                {
                    name: "pointfreeco/swift-composable-architecture",
                    description: "A library for building applications in a consistent and understandable way, with composition, testing, and ergonomics in mind.",
                    language: "Swift",
                    stars: "13,709",
                    forks: "1,564",
                    starsToday: "160",
                    url: "https://github.com/pointfreeco/swift-composable-architecture",
                    builtBy: ["@stephencelis", "@mbrandonw", "@tgrapperon", "@iampatbrown", "@Jager-yoo"]
                },
                {
                    name: "outline/outline",
                    description: "The fastest knowledge base for growing teams. Beautiful, realtime collaborative, feature packed, and markdown compatible.",
                    language: "TypeScript",
                    stars: "34,027",
                    forks: "2,753",
                    starsToday: "931",
                    url: "https://github.com/outline/outline",
                    builtBy: ["@tommoor", "@jorilallo", "@dependabot", "@outline-translations", "@hmacr"]
                }
            ],
            monthly: [
                {
                    name: "OpenBB-finance/OpenBB",
                    description: "Investment Research for Everyone, Everywhere.",
                    language: "Python",
                    stars: "47,829",
                    forks: "4,380",
                    starsToday: "5,667",
                    url: "https://github.com/OpenBB-finance/OpenBB",
                    builtBy: ["@jmaslek", "@colin99d", "@deeleeramone", "@montezdesousa", "@DidierRLopes"]
                },
                {
                    name: "Alibaba-NLP/WebAgent",
                    description: "🌐 WebAgent for Information Seeking built by Tongyi Lab: WebWalker & WebDancer & WebSailor & WebShaper",
                    language: "Python",
                    stars: "5,669",
                    forks: "420",
                    starsToday: "4,389",
                    url: "https://github.com/Alibaba-NLP/WebAgent",
                    builtBy: ["@callanwu", "@likuanppd", "@BaixuanLi", "@HuifengYin", "@sjtuzzw"]
                },
                {
                    name: "googleapis/genai-toolbox",
                    description: "MCP Toolbox for Databases is an open source MCP server for databases.",
                    language: "Go",
                    stars: "8,749",
                    forks: "630",
                    starsToday: "6,942",
                    url: "https://github.com/googleapis/genai-toolbox",
                    builtBy: ["@Yuan325", "@twishabansal", "@kurtisvg", "@duwenxin99", "@release-please"]
                },
                {
                    name: "musistudio/claude-code-router",
                    description: "Use Claude Code as the foundation for coding infrastructure, allowing you to decide how to interact with the model while enjoying updates from Anthropic.",
                    language: "TypeScript",
                    stars: "9,805",
                    forks: "716",
                    starsToday: "6,951",
                    url: "https://github.com/musistudio/claude-code-router",
                    builtBy: ["@musistudio", "@claude", "@sbtobb", "@BigUncle", "@Thlnking"]
                },
                {
                    name: "rustfs/rustfs",
                    description: "🚀 High-performance distributed object storage for MinIO alternative.",
                    language: "Rust",
                    stars: "6,817",
                    forks: "306",
                    starsToday: "6,322",
                    url: "https://github.com/rustfs/rustfs",
                    builtBy: ["@houseme", "@weisd", "@overtrue", "@guojidan", "@loverustfs"]
                }
            ]
        };

        return mockData[this.currentPeriod] || mockData.daily;
    }

    renderTrendingData() {
        const contentContainer = document.getElementById('trending-content');
        
        if (!this.trendingData || this.trendingData.length === 0) {
            contentContainer.innerHTML = `
                <div class="error-message">
                    <p>暂无数据</p>
                    <button class="refresh-btn" onclick="trendingApp.loadTrendingData()">重新加载</button>
                </div>
            `;
            return;
        }

        const trendingGrid = document.createElement('div');
        trendingGrid.className = 'trending-grid';

        this.trendingData.forEach((repo, index) => {
            const card = this.createRepoCard(repo, index);
            trendingGrid.appendChild(card);
        });

        contentContainer.innerHTML = '';
        contentContainer.appendChild(trendingGrid);

        // 添加动画效果
        const cards = trendingGrid.querySelectorAll('.trending-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            setTimeout(() => {
                card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    createRepoCard(repo, index) {
        const card = document.createElement('div');
        card.className = 'trending-card';
        
        const languages = repo.language ? [repo.language] : [];
        
        card.innerHTML = `
            <div class="trending-card-content">
                <div class="repo-header">
                    <div class="repo-icon">📦</div>
                    <div class="repo-info">
                        <h3>${repo.name}</h3>
                        <p>Built by ${repo.builtBy.slice(0, 3).join(', ')}${repo.builtBy.length > 3 ? ' and others' : ''}</p>
                    </div>
                </div>
                
                <p class="repo-description">${repo.description}</p>
                
                <div class="repo-stats">
                    <div class="stat-item">
                        <i>⭐</i>
                        <span>${repo.stars}</span>
                    </div>
                    <div class="stat-item">
                        <i>🔄</i>
                        <span>${repo.forks}</span>
                    </div>
                    <div class="stat-item">
                        <i>🚀</i>
                        <span>${repo.starsToday} today</span>
                    </div>
                </div>
                
                ${languages.length > 0 ? `
                    <div class="repo-languages">
                        ${languages.map(lang => `<span class="language-tag">${lang}</span>`).join('')}
                    </div>
                ` : ''}
                
                <a href="${repo.url}" target="_blank" class="repo-link">
                    查看项目 <span>→</span>
                </a>
            </div>
        `;

        return card;
    }

    showError() {
        const contentContainer = document.getElementById('trending-content');
        contentContainer.innerHTML = `
            <div class="error-message">
                <p>加载数据时出现错误</p>
                <button class="refresh-btn" onclick="trendingApp.loadTrendingData()">重新加载</button>
            </div>
        `;
    }

    startAutoRefresh() {
        // 每6小时自动刷新一次数据
        setInterval(() => {
            this.loadTrendingData();
        }, 6 * 60 * 60 * 1000);
    }

    // 获取真实GitHub数据的函数（需要后端支持）
    async fetchRealGitHubData() {
        // 这里需要设置一个后端服务来获取GitHub Trending数据
        // 由于GitHub API的CORS限制，前端无法直接访问
        // 建议使用以下方案之一：
        // 1. 设置一个简单的后端服务（Node.js/Python等）
        // 2. 使用GitHub Actions定期更新数据文件
        // 3. 使用第三方服务如GitHub Trending API
        
        const response = await fetch('/api/github-trending', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch trending data');
        }

        return await response.json();
    }
}

// 初始化应用
let trendingApp;

document.addEventListener('DOMContentLoaded', () => {
    trendingApp = new GitHubTrending();
});

// 添加一些额外的交互效果
document.addEventListener('DOMContentLoaded', () => {
    // 鼠标悬停效果
    document.addEventListener('mouseover', (e) => {
        if (e.target.classList.contains('trending-card')) {
            e.target.style.transform = 'translateY(-5px) scale(1.02)';
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.classList.contains('trending-card')) {
            e.target.style.transform = 'translateY(0) scale(1)';
        }
    });

    // 键盘导航支持
    document.addEventListener('keydown', (e) => {
        const timeButtons = document.querySelectorAll('.time-btn');
        const activeButton = document.querySelector('.time-btn.active');
        const activeIndex = Array.from(timeButtons).indexOf(activeButton);

        if (e.key === 'ArrowLeft' && activeIndex > 0) {
            timeButtons[activeIndex - 1].click();
        } else if (e.key === 'ArrowRight' && activeIndex < timeButtons.length - 1) {
            timeButtons[activeIndex + 1].click();
        }
    });
}); 