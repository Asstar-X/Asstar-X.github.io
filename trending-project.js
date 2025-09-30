(function() {
    class TrendingProject {
        constructor() {
            this.source = 'github'; // 'github' | 'huggingface'
            this.period = 'daily'; // github periods: daily | weekly | monthly
            this.category = 'trending'; // hf categories: trending | likes | downloads
            this.githubData = [];
            this.hfData = [];
            this.init();
        }

        init() {
            this.bindSourceTabs();
            this.renderControls();
            this.loadData();
            this.addExtras();
            // Auto refresh every 6 hours
            setInterval(() => this.loadData(), 6 * 60 * 60 * 1000);
        }

        bindSourceTabs() {
            const tabs = document.querySelectorAll('.source-tab');
            tabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    tabs.forEach(t => t.classList.remove('active'));
                    e.currentTarget.classList.add('active');
                    this.source = e.currentTarget.dataset.source;
                    this.renderControls();
                    this.loadData();
                });
            });
        }

        renderControls() {
            const controls = document.getElementById('controls');
            if (!controls) return;
            if (this.source === 'github') {
                controls.innerHTML = `
                    <div class="time-filter">
                        <button class="time-btn ${this.period==='daily'?'active':''}" data-period="daily">今日</button>
                        <button class="time-btn ${this.period==='weekly'?'active':''}" data-period="weekly">本周</button>
                        <button class="time-btn ${this.period==='monthly'?'active':''}" data-period="monthly">本月</button>
                    </div>`;
                controls.querySelectorAll('.time-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        controls.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
                        e.currentTarget.classList.add('active');
                        this.period = e.currentTarget.dataset.period;
                        this.loadData();
                    });
                });
            } else {
                controls.innerHTML = `
                    <div class="category-filter">
                        <button class="category-btn ${this.category==='trending'?'active':''}" data-category="trending">Trending</button>
                        <button class="category-btn ${this.category==='likes'?'active':''}" data-category="likes">Most Likes</button>
                        <button class="category-btn ${this.category==='downloads'?'active':''}" data-category="downloads">Most Downloads</button>
                    </div>`;
                controls.querySelectorAll('.category-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        controls.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                        e.currentTarget.classList.add('active');
                        this.category = e.currentTarget.dataset.category;
                        this.loadData();
                    });
                });
            }
        }

        async loadData() {
            const container = document.getElementById('trending-content');
            if (!container) return;
            container.innerHTML = `
                <div class="loading">
                    <div class="loading-spinner"></div>
                    <p>正在加载热门内容...</p>
                </div>
            `;
            try {
                if (this.source === 'github') {
                    const list = await this.fetchGithub();
                    this.githubData = list;
                    this.renderGithub();
                } else {
                    const list = await this.fetchHuggingface();
                    this.hfData = list;
                    this.renderHuggingface();
                }
            } catch (err) {
                console.error('加载失败', err);
                this.showError();
            }
        }

        async fetchGithub() {
            try {
                const res = await fetch('trending-data.json');
                if (res.ok) {
                    const json = await res.json();
                    if (json[this.period] && Array.isArray(json[this.period])) return json[this.period];
                }
            } catch (e) { /* ignore, fall back */ }
            // fallback to simple mock subset (reuse logic from trending.js)
            const mock = {
                daily: [
                    { name: 'dyad-sh/dyad', description: 'Free, local, open-source AI app builder', language: 'TypeScript', stars: '5,513', forks: '630', starsToday: '751', url: 'https://github.com/dyad-sh/dyad', builtBy: ['@wwwillchen','@graphite-app','@cubic-dev-ai'] }
                ],
                weekly: [
                    { name: 'cloudwego/eino', description: 'The ultimate LLM/AI application development framework in Golang.', language: 'Go', stars: '6,350', forks: '488', starsToday: '981', url: 'https://github.com/cloudwego/eino', builtBy: ['@meguminnnnnnnnn','@shentongmartin','@luohq-bytedance'] }
                ],
                monthly: [
                    { name: 'OpenBB-finance/OpenBB', description: 'Investment Research for Everyone, Everywhere.', language: 'Python', stars: '47,829', forks: '4,380', starsToday: '5,667', url: 'https://github.com/OpenBB-finance/OpenBB', builtBy: ['@jmaslek','@colin99d','@deeleeramone'] }
                ]
            };
            return mock[this.period] || mock.daily;
        }

        async fetchHuggingface() {
            try {
                const res = await fetch('huggingface-data.json');
                if (res.ok) {
                    const json = await res.json();
                    if (json[this.category] && Array.isArray(json[this.category])) return json[this.category];
                }
            } catch (e) { /* ignore */ }
            const mock = {
                trending: [
                    { name: 'microsoft/VibeVoice-1.5B', description: 'Text-to-Speech model', task: 'Text-to-Speech', parameters: '3B', likes: '134k', downloads: '1.27k', url: 'https://huggingface.co/microsoft/VibeVoice-1.5B', tags: ['Audio Generation'] }
                ],
                likes: [
                    { name: 'deepseek-ai/DeepSeek-R1', description: 'Text Generation', task: 'Text Generation', parameters: '685B', likes: '456k', downloads: '12.7k', url: 'https://huggingface.co/deepseek-ai/DeepSeek-R1', tags: ['LLM'] }
                ],
                downloads: [
                    { name: 'sentence-transformers/all-MiniLM-L6-v2', description: 'Sentence Similarity', task: 'Sentence Similarity', parameters: '0.0B', likes: '3.83k', downloads: '92M', url: 'https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2', tags: ['Embeddings'] }
                ]
            };
            return mock[this.category] || mock.trending;
        }

        renderGithub() {
            const container = document.getElementById('trending-content');
            if (!this.githubData || this.githubData.length === 0) {
                container.innerHTML = this.emptyHtml('trendingApp');
                return;
            }
            const grid = document.createElement('div');
            grid.className = 'trending-grid';
            this.githubData.forEach(repo => grid.appendChild(this.githubCard(repo)));
            container.innerHTML = '';
            container.appendChild(grid);
            this.animateCards(grid);
        }

        renderHuggingface() {
            const container = document.getElementById('trending-content');
            if (!this.hfData || this.hfData.length === 0) {
                container.innerHTML = this.emptyHtml('huggingfaceTrendingApp');
                return;
            }
            const grid = document.createElement('div');
            grid.className = 'trending-grid';
            this.hfData.forEach(model => grid.appendChild(this.hfCard(model)));
            container.innerHTML = '';
            container.appendChild(grid);
            this.animateCards(grid);
        }

        githubCard(repo) {
            const card = document.createElement('div');
            card.className = 'trending-card';
            const languages = repo.language ? [repo.language] : [];
            card.innerHTML = `
                <div class="trending-card-content">
                    <div class="repo-header">
                        <div class="repo-icon">📦</div>
                        <div class="repo-info">
                            <h3>${repo.name}</h3>
                            <p>${Array.isArray(repo.builtBy)?`Built by ${repo.builtBy.slice(0,3).join(', ')}${repo.builtBy.length>3?' and others':''}`:''}</p>
                        </div>
                    </div>
                    <p class="repo-description">${repo.description || ''}</p>
                    <div class="repo-stats">
                        <div class="stat-item"><i>⭐</i><span>${repo.stars || ''}</span></div>
                        <div class="stat-item"><i>🔄</i><span>${repo.forks || ''}</span></div>
                        <div class="stat-item"><i>🚀</i><span>${repo.starsToday ? `${repo.starsToday} today` : ''}</span></div>
                    </div>
                    ${languages.length?`<div class="repo-languages">${languages.map(l=>`<span class="language-tag">${l}</span>`).join('')}</div>`:''}
                    <a href="${repo.url}" target="_blank" class="repo-link">查看项目 <span>→</span></a>
                </div>
            `;
            return card;
        }

        hfCard(model) {
            const card = document.createElement('div');
            card.className = 'trending-card';
            const tags = model.tags || [];
            card.innerHTML = `
                <div class="trending-card-content">
                    <div class="model-header">
                        <div class="model-icon">🤖</div>
                        <div class="model-info">
                            <h3>${model.name}</h3>
                            <p>${model.task || ''} • ${model.parameters || ''}</p>
                        </div>
                    </div>
                    <p class="model-description">${model.description || ''}</p>
                    <div class="model-stats">
                        <div class="stat-item"><i>❤️</i><span>${model.likes || ''}</span></div>
                        <div class="stat-item"><i>⬇️</i><span>${model.downloads || ''}</span></div>
                        <div class="stat-item"><i>📊</i><span>${model.parameters || ''}</span></div>
                    </div>
                    ${tags.length?`<div class="model-tags">${tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>`:''}
                    <a href="${model.url}" target="_blank" class="model-link">查看模型 <span>→</span></a>
                </div>
            `;
            return card;
        }

        animateCards(grid) {
            const cards = grid.querySelectorAll('.trending-card');
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

        showError() {
            const container = document.getElementById('trending-content');
            container.innerHTML = `
                <div class="error-message">
                    <p>加载数据时出现错误</p>
                    <button class="refresh-btn" id="refresh-btn">重新加载</button>
                </div>
            `;
            const btn = document.getElementById('refresh-btn');
            if (btn) btn.addEventListener('click', () => this.loadData());
        }

        emptyHtml(handler) {
            return `
                <div class="error-message">
                    <p>暂无数据</p>
                    <button class="refresh-btn" id="refresh-btn">重新加载</button>
                </div>
            `;
        }

        addExtras() {
            // Hover scaling like other pages
            document.addEventListener('mouseover', (e) => {
                const target = e.target.closest('.trending-card');
                if (target) target.style.transform = 'translateY(-5px) scale(1.02)';
            });
            document.addEventListener('mouseout', (e) => {
                const target = e.target.closest('.trending-card');
                if (target) target.style.transform = 'translateY(0) scale(1)';
            });
            // Keyboard nav within controls
            document.addEventListener('keydown', (e) => {
                if (this.source === 'github') {
                    const btns = Array.from(document.querySelectorAll('.time-btn'));
                    const active = document.querySelector('.time-btn.active');
                    const idx = btns.indexOf(active);
                    if (e.key === 'ArrowLeft' && idx > 0) btns[idx - 1].click();
                    else if (e.key === 'ArrowRight' && idx < btns.length - 1) btns[idx + 1].click();
                } else {
                    const btns = Array.from(document.querySelectorAll('.category-btn'));
                    const active = document.querySelector('.category-btn.active');
                    const idx = btns.indexOf(active);
                    if (e.key === 'ArrowLeft' && idx > 0) btns[idx - 1].click();
                    else if (e.key === 'ArrowRight' && idx < btns.length - 1) btns[idx + 1].click();
                }
            });
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        new TrendingProject();
    });
})();


