(function() {
    class FocusNews {
        constructor() {
            this.category = 'all'; // 'all' | 'domestic' | 'international' | 'securities' | 'company'
            this.newsData = [];
            this.init();
        }

        init() {
            this.bindCategoryTabs();
            this.loadData();
            this.addExtras();
            // Auto refresh every 2 hours
            setInterval(() => this.loadData(), 2 * 60 * 60 * 1000);
        }

        bindCategoryTabs() {
            const tabs = document.querySelectorAll('.category-tab');
            tabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    tabs.forEach(t => t.classList.remove('active'));
                    e.currentTarget.classList.add('active');
                    this.category = e.currentTarget.dataset.category;
                    this.renderNews();
                });
            });
        }

        async loadData() {
            const container = document.getElementById('focus-content');
            if (!container) return;
            container.innerHTML = `
                <div class="loading">
                    <div class="loading-spinner"></div>
                    <p>正在加载财经焦点...</p>
                </div>
            `;
            try {
                const list = await this.fetchFocusNews();
                this.newsData = list;
                this.renderNews();
            } catch (err) {
                console.error('加载失败', err);
                this.showError();
            }
        }

        async fetchFocusNews() {
            try {
                const res = await fetch('feeds/focus-data.json');
                if (res.ok) {
                    const json = await res.json();
                    if (json.news && Array.isArray(json.news)) {
                        console.log(`成功加载 ${json.news.length} 条焦点新闻`);
                        return json.news;
                    }
                }
            } catch (e) { 
                console.error('加载焦点新闻数据失败:', e);
            }
            // 如果没有数据，返回空数组
            console.warn('没有可用的焦点新闻数据');
            return [];
        }

        renderNews() {
            const container = document.getElementById('focus-content');
            if (!this.newsData || this.newsData.length === 0) {
                container.innerHTML = this.emptyHtml();
                return;
            }
            
            // Filter by category
            let filteredNews = this.newsData;
            if (this.category !== 'all') {
                filteredNews = this.newsData.filter(news => news.category === this.category);
            }
            
            if (filteredNews.length === 0) {
                container.innerHTML = `
                    <div class="error-message">
                        <p>该分类暂无数据</p>
                        <button class="refresh-btn" id="refresh-btn">重新加载</button>
                    </div>
                `;
                const btn = document.getElementById('refresh-btn');
                if (btn) btn.addEventListener('click', () => this.loadData());
                return;
            }
            
            const grid = document.createElement('div');
            grid.className = 'focus-grid';
            filteredNews.forEach(news => grid.appendChild(this.newsCard(news)));
            container.innerHTML = '';
            container.appendChild(grid);
            this.animateCards(grid);
        }

        newsCard(news) {
            const card = document.createElement('div');
            card.className = 'focus-card';
            const tags = news.tags || [];
            card.innerHTML = `
                <div class="focus-card-content">
                    <div class="news-header">
                        <div class="news-icon">📰</div>
                        <div class="news-info">
                            <h3>${news.title}</h3>
                            <p>${news.source} • ${news.time}</p>
                        </div>
                    </div>
                    <p class="news-content">${news.content}</p>
                    <div class="news-meta">
                        <div class="meta-item"><i>🏷️</i><span>${news.category}</span></div>
                        <div class="meta-item"><i>🕒</i><span>${news.time}</span></div>
                        <div class="meta-item"><i>📡</i><span>${news.source}</span></div>
                    </div>
                    ${tags.length?`<div class="news-tags">${tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>`:''}
                    <a href="${news.url}" target="_blank" class="news-link">查看详情 <span>→</span></a>
                </div>
            `;
            return card;
        }

        animateCards(grid) {
            const cards = grid.querySelectorAll('.focus-card');
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
            const container = document.getElementById('focus-content');
            container.innerHTML = `
                <div class="error-message">
                    <p>加载数据时出现错误</p>
                    <button class="refresh-btn" id="refresh-btn">重新加载</button>
                </div>
            `;
            const btn = document.getElementById('refresh-btn');
            if (btn) btn.addEventListener('click', () => this.loadData());
        }

        emptyHtml() {
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
                const target = e.target.closest('.focus-card');
                if (target) target.style.transform = 'translateY(-5px) scale(1.02)';
            });
            document.addEventListener('mouseout', (e) => {
                const target = e.target.closest('.focus-card');
                if (target) target.style.transform = 'translateY(0) scale(1)';
            });
            // Keyboard nav within controls
            document.addEventListener('keydown', (e) => {
                const btns = Array.from(document.querySelectorAll('.category-tab'));
                const active = document.querySelector('.category-tab.active');
                const idx = btns.indexOf(active);
                if (e.key === 'ArrowLeft' && idx > 0) btns[idx - 1].click();
                else if (e.key === 'ArrowRight' && idx < btns.length - 1) btns[idx + 1].click();
            });
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        new FocusNews();
    });
})();
