// HuggingFace Papers 功能
class HuggingFacePapers {
    constructor() {
        this.currentCategory = 'daily';
        this.papersData = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadPapersData();
        this.startAutoRefresh();
    }

    bindEvents() {
        const categoryButtons = document.querySelectorAll('.category-btn');
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                categoryButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentCategory = e.target.dataset.category;
                this.loadPapersData();
            });
        });
    }

    async loadPapersData() {
        const container = document.getElementById('papers-content');
        container.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>正在加载论文...</p>
            </div>
        `;

        try {
            const data = await this.fetchPapersData();
            this.papersData = data;
            this.renderPapers();
        } catch (error) {
            console.error('加载论文失败:', error);
            this.showError();
        }
    }

    async fetchPapersData() {
        try {
            const response = await fetch('feeds/huggingface-papers-data.json');
            if (response.ok) {
                const all = await response.json();
                const arr = all[this.currentCategory];
                if (Array.isArray(arr) && arr.length > 0) return arr;
            }
        } catch (e) {
            console.warn('无法加载本地论文数据:', e);
        }

        // 兜底模拟数据，防止页面空白
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const weekNumber = this.getISOWeek(now);
        const yyyyW = `${yyyy}-W${String(weekNumber).padStart(2, '0')}`;
        const dailyUrl = `https://huggingface.co/papers/date/${yyyy}-${mm}-${dd}`;
        const weeklyUrl = `https://huggingface.co/papers/week/${yyyyW}`;
        const monthlyUrl = `https://huggingface.co/papers/month/${yyyy}-${mm}`;

        const mock = {
            daily: [
                { title: 'Sample Paper (Daily)', authors: 'Doe et al.', date: `${yyyy}-${mm}-${dd}`, url: dailyUrl, tags: ['LLM', 'Vision'], abstract: 'A placeholder abstract for daily papers.' }
            ],
            weekly: [
                { title: 'Sample Paper (Weekly)', authors: 'Doe et al.', week: yyyyW, url: weeklyUrl, tags: ['NLP'], abstract: 'A placeholder abstract for weekly papers.' }
            ],
            monthly: [
                { title: 'Sample Paper (Monthly)', authors: 'Doe et al.', month: `${yyyy}-${mm}`, url: monthlyUrl, tags: ['GenAI'], abstract: 'A placeholder abstract for monthly papers.' }
            ],
            trending: [
                { title: 'Sample Paper (Trending)', authors: 'Doe et al.', url: 'https://huggingface.co/papers/trending', tags: ['Trending'], abstract: 'A placeholder abstract for trending papers.' }
            ]
        };

        return mock[this.currentCategory] || mock.daily;
    }

    renderPapers() {
        const container = document.getElementById('papers-content');
        if (!this.papersData || this.papersData.length === 0) {
            container.innerHTML = `
                <div class="error-message">
                    <p>暂无数据</p>
                    <button class="refresh-btn" onclick="huggingfacePapersApp.loadPapersData()">重新加载</button>
                </div>
            `;
            return;
        }

        const grid = document.createElement('div');
        grid.className = 'trending-grid';

        this.papersData.forEach((paper) => {
            const card = document.createElement('div');
            card.className = 'trending-card';
            const tags = Array.isArray(paper.tags) ? paper.tags : [];
            card.innerHTML = `
                <div class="trending-card-content">
                    <div class="paper-title">${paper.title}</div>
                    <div class="paper-meta">${paper.authors || 'Unknown authors'}</div>
                    <p class="paper-abstract">${paper.abstract || 'No abstract available.'}</p>
                    ${tags.length ? `<div class="model-tags">${tags.map(t => `<span class=\"tag\">${t}</span>`).join('')}</div>` : ''}
                    <a href="${paper.url}" target="_blank" class="model-link">查看论文 <span>→</span></a>
                </div>
            `;
            grid.appendChild(card);
        });

        container.innerHTML = '';
        container.appendChild(grid);
    }

    showError() {
        const container = document.getElementById('papers-content');
        container.innerHTML = `
            <div class="error-message">
                <p>加载数据时出现错误</p>
                <button class="refresh-btn" onclick="huggingfacePapersApp.loadPapersData()">重新加载</button>
            </div>
        `;
    }

    startAutoRefresh() {
        setInterval(() => this.loadPapersData(), 6 * 60 * 60 * 1000);
    }

    getISOWeek(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
        return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
    }
}

let huggingfacePapersApp;
document.addEventListener('DOMContentLoaded', () => {
    huggingfacePapersApp = new HuggingFacePapers();
});


