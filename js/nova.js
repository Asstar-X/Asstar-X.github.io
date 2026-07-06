(function () {
    class NovaApp {
        constructor() {
            this.activeTab = 'projects'; // 'projects' | 'papers' | 'focus'
            
            // Projects state
            this.projectSource = 'github'; // 'github' | 'huggingface' | 'interest'
            this.projectPeriod = 'daily'; // github: daily | weekly | monthly
            this.projectCategory = 'trending'; // hf: trending | likes | downloads
            this.projectInterestCat = 'voice'; // interest: voice | multimodal | vision
            this.projectInterestSubCat = 'text-to-speech';
            this.projectSubCategories = {
                voice: ['text-to-speech', 'automatic-speech-recognition', 'text-to-audio', 'voice-activity-detection', 'audio-to-audio', 'audio-classification'],
                multimodal: ['audio-text-to-text', 'image-text-to-video', 'image-text-to-image', 'image-text-to-image', 'visual-question-answering', 'document-question-answering'],
                vision: ['image-classification', 'object-detection', 'image-segmentation', 'zero-shot-image-classification', 'zero-shot-object-detection', 'image-feature-extraction']
            };

            // Papers state
            this.paperCategory = 'daily'; // daily | weekly | monthly | trending

            // Focus state
            this.focusCategory = 'finance'; // finance | tech | ai
            this.focusSource = ''; // dynamic source
            this.rawFocusSections = null;

            // Data caches
            this.githubData = [];
            this.hfData = [];
            this.interestData = {};
            this.papersData = [];
            this.focusData = [];

            this.init();
        }

        init() {
            window.initEntranceAnimation();
            this.parseUrlParams();
            this.bindPrimaryTabs();
            this.renderActiveTab();
            
            // Auto refresh every 6 hours
            setInterval(() => this.loadActiveTabData(true), 6 * 60 * 60 * 1000);
        }

        parseUrlParams() {
            const urlParams = new URLSearchParams(window.location.search);
            const tabParam = urlParams.get('tab');
            if (tabParam && ['projects', 'papers', 'focus'].includes(tabParam)) {
                this.activeTab = tabParam;
            } else if (window.location.hash) {
                const hash = window.location.hash.substring(1);
                if (['projects', 'papers', 'focus'].includes(hash)) {
                    this.activeTab = hash;
                }
            }
        }

        bindPrimaryTabs() {
            const tabs = document.querySelectorAll('#nova-primary-tabs .source-tab');
            tabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    tabs.forEach(t => t.classList.remove('active'));
                    e.currentTarget.classList.add('active');
                    this.activeTab = e.currentTarget.dataset.tab;
                    
                    // Update URL hash
                    history.replaceState(null, '', `#${this.activeTab}`);
                    
                    this.renderActiveTab();
                });
            });

            // Set initial active tab
            tabs.forEach(tab => {
                if (tab.dataset.tab === this.activeTab) {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            });
        }

        renderActiveTab() {
            this.renderSecondaryControls();
            this.loadActiveTabData();
        }

        renderSecondaryControls() {
            const controls = document.getElementById('nova-secondary-controls');
            if (!controls) return;
            controls.innerHTML = '';

            if (this.activeTab === 'projects') {
                // Render Project source tabs (GitHub, HuggingFace, Interest)
                const sourceTabsWrapper = document.createElement('div');
                sourceTabsWrapper.className = 'source-tabs';
                sourceTabsWrapper.style.marginBottom = '16px';
                sourceTabsWrapper.innerHTML = `
                    <button class="source-tab ${this.projectSource === 'github' ? 'active' : ''}" data-source="github">GitHub</button>
                    <button class="source-tab ${this.projectSource === 'huggingface' ? 'active' : ''}" data-source="huggingface">HuggingFace</button>
                    <button class="source-tab ${this.projectSource === 'interest' ? 'active' : ''}" data-source="interest">Interest</button>
                `;
                controls.appendChild(sourceTabsWrapper);

                sourceTabsWrapper.querySelectorAll('.source-tab').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        sourceTabsWrapper.querySelectorAll('.source-tab').forEach(b => b.classList.remove('active'));
                        e.currentTarget.classList.add('active');
                        this.projectSource = e.currentTarget.dataset.source;
                        this.renderActiveTab();
                    });
                });

                // Render sub-filters
                const filterWrapper = document.createElement('div');
                filterWrapper.className = 'category-filter';
                
                if (this.projectSource === 'github') {
                    filterWrapper.innerHTML = `
                        <button class="category-btn ${this.projectPeriod === 'daily' ? 'active' : ''}" data-period="daily">今日</button>
                        <button class="category-btn ${this.projectPeriod === 'weekly' ? 'active' : ''}" data-period="weekly">本周</button>
                        <button class="category-btn ${this.projectPeriod === 'monthly' ? 'active' : ''}" data-period="monthly">本月</button>
                    `;
                    filterWrapper.querySelectorAll('.category-btn').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            filterWrapper.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                            e.currentTarget.classList.add('active');
                            this.projectPeriod = e.currentTarget.dataset.period;
                            this.loadActiveTabData();
                        });
                    });
                    controls.appendChild(filterWrapper);
                } else if (this.projectSource === 'huggingface') {
                    filterWrapper.innerHTML = `
                        <button class="category-btn ${this.projectCategory === 'trending' ? 'active' : ''}" data-category="trending">Trending</button>
                        <button class="category-btn ${this.projectCategory === 'likes' ? 'active' : ''}" data-category="likes">Most Likes</button>
                        <button class="category-btn ${this.projectCategory === 'downloads' ? 'active' : ''}" data-category="downloads">Most Downloads</button>
                    `;
                    filterWrapper.querySelectorAll('.category-btn').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            filterWrapper.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                            e.currentTarget.classList.add('active');
                            this.projectCategory = e.currentTarget.dataset.category;
                            this.loadActiveTabData();
                        });
                    });
                    controls.appendChild(filterWrapper);
                } else if (this.projectSource === 'interest') {
                    filterWrapper.className = 'category-filter interest-main-filter';
                    filterWrapper.style.marginBottom = '12px';
                    filterWrapper.innerHTML = `
                        <button class="category-btn ${this.projectInterestCat === 'voice' ? 'active' : ''}" data-cat="voice">语音</button>
                        <button class="category-btn ${this.projectInterestCat === 'multimodal' ? 'active' : ''}" data-cat="multimodal">多模态</button>
                        <button class="category-btn ${this.projectInterestCat === 'vision' ? 'active' : ''}" data-cat="vision">视觉</button>
                    `;
                    controls.appendChild(filterWrapper);

                    filterWrapper.querySelectorAll('.category-btn').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            this.projectInterestCat = e.currentTarget.dataset.cat;
                            this.projectInterestSubCat = this.projectSubCategories[this.projectInterestCat][0];
                            this.renderActiveTab();
                        });
                    });

                    const subFilterWrapper = document.createElement('div');
                    subFilterWrapper.className = 'category-filter interest-sub-filter';
                    subFilterWrapper.style.display = 'flex';
                    subFilterWrapper.style.flexWrap = 'wrap';
                    subFilterWrapper.style.justifyContent = 'center';
                    subFilterWrapper.style.gap = '8px';
                    
                    const subs = this.projectSubCategories[this.projectInterestCat] || [];
                    subs.forEach(sub => {
                        subFilterWrapper.innerHTML += `
                            <button class="category-btn sub-btn ${this.projectInterestSubCat === sub ? 'active' : ''}" 
                                    data-subcat="${sub}" 
                                    style="font-size: 0.85rem; padding: 6px 14px; border-radius: 20px;">
                                ${sub.replace(/-/g, ' ')}
                            </button>`;
                    });
                    controls.appendChild(subFilterWrapper);

                    subFilterWrapper.querySelectorAll('.sub-btn').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            subFilterWrapper.querySelectorAll('.sub-btn').forEach(b => b.classList.remove('active'));
                            e.currentTarget.classList.add('active');
                            this.projectInterestSubCat = e.currentTarget.dataset.subcat;
                            this.renderInterestGrid();
                        });
                    });
                }
            } else if (this.activeTab === 'papers') {
                const filterWrapper = document.createElement('div');
                filterWrapper.className = 'category-filter';
                filterWrapper.innerHTML = `
                    <button class="category-btn ${this.paperCategory === 'daily' ? 'active' : ''}" data-category="daily">Daily</button>
                    <button class="category-btn ${this.paperCategory === 'weekly' ? 'active' : ''}" data-category="weekly">Weekly</button>
                    <button class="category-btn ${this.paperCategory === 'monthly' ? 'active' : ''}" data-category="monthly">Monthly</button>
                    <button class="category-btn ${this.paperCategory === 'trending' ? 'active' : ''}" data-category="trending">Trending</button>
                `;
                filterWrapper.querySelectorAll('.category-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        filterWrapper.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                        e.currentTarget.classList.add('active');
                        this.paperCategory = e.currentTarget.dataset.category;
                        this.loadActiveTabData();
                    });
                });
                controls.appendChild(filterWrapper);
            } else if (this.activeTab === 'focus') {
                const filterWrapper = document.createElement('div');
                filterWrapper.className = 'category-filter focus-main-filter';
                filterWrapper.style.marginBottom = '12px';
                filterWrapper.innerHTML = `
                    <button class="category-btn ${this.focusCategory === 'finance' ? 'active' : ''}" data-category="finance">财经</button>
                    <button class="category-btn ${this.focusCategory === 'tech' ? 'active' : ''}" data-category="tech">科技</button>
                    <button class="category-btn ${this.focusCategory === 'ai' ? 'active' : ''}" data-category="ai">AI</button>
                `;
                filterWrapper.querySelectorAll('.category-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        filterWrapper.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                        e.currentTarget.classList.add('active');
                        this.focusCategory = e.currentTarget.dataset.category;
                        this.focusSource = ''; // Reset on category change
                        
                        // Clear sub-filters container immediately
                        const subFilterContainer = document.getElementById('focus-sub-filter-container');
                        if (subFilterContainer) subFilterContainer.innerHTML = '';
                        
                        this.renderActiveTab();
                    });
                });
                controls.appendChild(filterWrapper);

                const subFilterContainer = document.createElement('div');
                subFilterContainer.id = 'focus-sub-filter-container';
                subFilterContainer.className = 'category-filter focus-sub-filter';
                subFilterContainer.style.display = 'flex';
                subFilterContainer.style.flexWrap = 'wrap';
                subFilterContainer.style.justifyContent = 'center';
                subFilterContainer.style.gap = '8px';
                controls.appendChild(subFilterContainer);
            }
        }

        async loadActiveTabData(forceFetch = false) {
            const container = document.getElementById('nova-content');
            const timeEl = document.getElementById('last-updated');
            if (!container) return;

            let url = '';
            let cacheKey = '';
            let renderFn = () => {};

            if (this.activeTab === 'projects') {
                cacheKey = `asstar_cache_project_${this.projectSource}`;
                if (this.projectSource === 'github') {
                    url = 'feeds/trending-data.json';
                    renderFn = (data) => {
                        this.githubData = data[this.projectPeriod] || [];
                        this.renderGithubGrid();
                    };
                } else if (this.projectSource === 'huggingface') {
                    url = 'feeds/huggingface-data.json';
                    renderFn = (data) => {
                        this.hfData = data[this.projectCategory] || [];
                        this.renderHuggingFaceGrid();
                    };
                } else if (this.projectSource === 'interest') {
                    url = 'feeds/huggingface-interest-data.json';
                    renderFn = (data) => {
                        this.interestData = data[this.projectInterestCat] || {};
                        this.renderInterestGrid();
                    };
                }
            } else if (this.activeTab === 'papers') {
                url = 'feeds/huggingface-papers-data.json';
                cacheKey = 'asstar_cache_papers';
                renderFn = (data) => {
                    this.papersData = data[this.paperCategory] || [];
                    this.renderPapersGrid();
                };
            } else if (this.activeTab === 'focus') {
                url = 'feeds/realtime-focus.json';
                cacheKey = 'asstar_cache_focus';
                renderFn = (data) => {
                    // JSON structure: data.categories[category].sections[sourceName][{section, items[]}]
                    const catData = (data.categories || data)[this.focusCategory];
                    if (!catData) { 
                        this.rawFocusSections = null;
                        this.focusData = []; 
                        this.renderFocusGrid(); 
                        return; 
                    }
                    this.rawFocusSections = catData.sections || {};
                    
                    // Extract sources and render sub-filters dynamically
                    const sources = Object.keys(this.rawFocusSections);
                    if (sources.length > 0) {
                        if (!this.focusSource || !sources.includes(this.focusSource)) {
                            this.focusSource = sources[0];
                        }
                    } else {
                        this.focusSource = '';
                    }
                    this.renderFocusSubFilters(sources);
                    
                    this.filterAndRenderFocus();
                };
            }

            if (!localStorage.getItem(cacheKey) || forceFetch) {
                container.innerHTML = window.generateSkeleton(this.activeTab === 'papers' ? 4 : 6);
            }

            try {
                await window.fetchWithSWR(url, cacheKey, renderFn, timeEl, 'lastUpdated');
            } catch (err) {
                console.error(`Nova load data error [${this.activeTab}]:`, err);
                this.showErrorMsg(container);
            }
        }

        renderFocusSubFilters(sources) {
            const subFilterContainer = document.getElementById('focus-sub-filter-container');
            if (!subFilterContainer) return;
            
            subFilterContainer.innerHTML = '';
            
            sources.forEach(src => {
                const btn = document.createElement('button');
                btn.className = `category-btn sub-btn ${this.focusSource === src ? 'active' : ''}`;
                btn.dataset.source = src;
                btn.style.fontSize = '0.85rem';
                btn.style.padding = '6px 14px';
                btn.style.borderRadius = '20px';
                btn.textContent = src;
                subFilterContainer.appendChild(btn);
            });
            
            subFilterContainer.querySelectorAll('.sub-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    subFilterContainer.querySelectorAll('.sub-btn').forEach(b => b.classList.remove('active'));
                    e.currentTarget.classList.add('active');
                    this.focusSource = e.currentTarget.dataset.source;
                    this.filterAndRenderFocus();
                });
            });
        }

        filterAndRenderFocus() {
            if (!this.rawFocusSections) {
                this.focusData = [];
                this.renderFocusGrid();
                return;
            }
            const flat = [];
            Object.entries(this.rawFocusSections).forEach(([sourceName, sectionList]) => {
                if (this.focusSource !== sourceName) return;
                
                (sectionList || []).forEach(sectionObj => {
                    (sectionObj.items || []).forEach(item => {
                        flat.push({
                            title: item.title,
                            url: item.url,
                            source: sourceName,
                            section: sectionObj.section || '',
                            extra: item.extra || '',
                            rank: item.rank || ''
                        });
                    });
                });
            });
            this.focusData = flat;
            this.renderFocusGrid();
        }

        renderGithubGrid() {
            const container = document.getElementById('nova-content');
            if (!this.githubData || this.githubData.length === 0) {
                container.innerHTML = this.emptyHtml();
                return;
            }
            const grid = document.createElement('div');
            grid.className = 'trending-grid';
            this.githubData.forEach(repo => grid.appendChild(this.createGithubCard(repo)));
            container.innerHTML = '';
            container.appendChild(grid);
            window.animateCards(grid);
        }

        renderHuggingFaceGrid() {
            const container = document.getElementById('nova-content');
            if (!this.hfData || this.hfData.length === 0) {
                container.innerHTML = this.emptyHtml();
                return;
            }
            const grid = document.createElement('div');
            grid.className = 'trending-grid';
            this.hfData.forEach(model => grid.appendChild(this.createHuggingFaceCard(model)));
            container.innerHTML = '';
            container.appendChild(grid);
            window.animateCards(grid);
        }

        renderInterestGrid() {
            const container = document.getElementById('nova-content');
            if (!this.interestData || Object.keys(this.interestData).length === 0) {
                container.innerHTML = this.emptyHtml();
                return;
            }
            
            const models = this.interestData[this.projectInterestSubCat] || [];
            if (models.length === 0) {
                container.innerHTML = this.emptyHtml();
                return;
            }

            const grid = document.createElement('div');
            grid.className = 'trending-grid';
            models.forEach(model => grid.appendChild(this.createHuggingFaceCard(model)));
            container.innerHTML = '';
            container.appendChild(grid);
            window.animateCards(grid);
        }

        renderPapersGrid() {
            const container = document.getElementById('nova-content');
            if (!this.papersData || this.papersData.length === 0) {
                container.innerHTML = this.emptyHtml();
                return;
            }
            const grid = document.createElement('div');
            grid.className = 'trending-grid';
            this.papersData.forEach(paper => grid.appendChild(this.createPaperCard(paper)));
            container.innerHTML = '';
            container.appendChild(grid);
            window.animateCards(grid);
        }

        renderFocusGrid() {
            const container = document.getElementById('nova-content');
            if (!this.focusData || this.focusData.length === 0) {
                container.innerHTML = this.emptyHtml();
                return;
            }
            const grid = document.createElement('div');
            grid.className = 'trending-grid';
            this.focusData.slice(0, 90).forEach(item => grid.appendChild(this.createFocusCard(item)));
            container.innerHTML = '';
            container.appendChild(grid);
            window.animateCards(grid);
        }

        createGithubCard(repo) {
            const card = document.createElement('div');
            card.className = 'trending-card';
            const languages = repo.language ? [repo.language] : [];
            card.innerHTML = `
                <div class="trending-card-content">
                    <div class="repo-header">
                        <div class="repo-icon">📦</div>
                        <div class="repo-info">
                            <h3>${repo.name}</h3>
                            <p>${Array.isArray(repo.builtBy) ? `Built by ${repo.builtBy.slice(0, 3).join(', ')}${repo.builtBy.length > 3 ? ' and others' : ''}` : ''}</p>
                        </div>
                    </div>
                    <p class="repo-description">${repo.description || ''}</p>
                    <div class="repo-stats">
                        <div class="stat-item"><i>⭐</i><span>${repo.stars || ''}</span></div>
                        <div class="stat-item"><i>🔄</i><span>${repo.forks || ''}</span></div>
                        <div class="stat-item"><i>🚀</i><span>${repo.starsToday ? `${repo.starsToday} today` : ''}</span></div>
                    </div>
                    ${languages.length ? `<div class="repo-languages">${languages.map(l => `<span class="language-tag">${l}</span>`).join('')}</div>` : ''}
                    <a href="${repo.url}" target="_blank" class="repo-link">查看项目 <span>→</span></a>
                </div>
            `;
            this.addCardHoverEffect(card);
            return card;
        }

        createHuggingFaceCard(model) {
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
                    ${tags.length ? `<div class="model-tags">${tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>` : ''}
                    <a href="${model.url}" target="_blank" class="model-link">查看模型 <span>→</span></a>
                </div>
            `;
            this.addCardHoverEffect(card);
            return card;
        }

        createPaperCard(paper) {
            const card = document.createElement('div');
            card.className = 'trending-card';
            const tags = Array.isArray(paper.tags) ? paper.tags : [];
            card.innerHTML = `
                <div class="trending-card-content">
                    <div class="paper-title">${paper.title}</div>
                    <div class="paper-meta">${paper.authors || 'Unknown authors'}</div>
                    <p class="paper-abstract">${paper.abstract || 'No abstract available.'}</p>
                    ${tags.length ? `<div class="model-tags">${tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>` : ''}
                    <a href="${paper.url}" target="_blank" class="model-link">查看论文 <span>→</span></a>
                </div>
            `;
            this.addCardHoverEffect(card);
            return card;
        }

        createFocusCard(item) {
            const card = document.createElement('div');
            card.className = 'trending-card';
            const subtitle = [item.source, item.section].filter(Boolean).join(' · ');
            const rankLabel = item.rank ? `#${item.rank} ` : '';
            card.innerHTML = `
                <div class="trending-card-content">
                    <div class="model-header">
                        <div class="model-icon">📰</div>
                        <div class="model-info">
                            <h3>${rankLabel}${window.escapeHtml(item.title)}</h3>
                            <p>${window.escapeHtml(subtitle)}</p>
                        </div>
                    </div>
                    ${item.extra ? `<p class="repo-description" style="font-size:0.85rem;color:rgba(255,255,255,0.5);margin:6px 0;">${window.escapeHtml(item.extra)}</p>` : ''}
                    <a href="${item.url}" target="_blank" class="model-link">查看详情 <span>→</span></a>
                </div>
            `;
            this.addCardHoverEffect(card);
            return card;
        }

        addCardHoverEffect(card) {
            card.addEventListener('mouseover', () => {
                card.style.transform = 'translateY(-5px) scale(1.02)';
            });
            card.addEventListener('mouseout', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        }

        showErrorMsg(container) {
            container.innerHTML = `
                <div class="error-message">
                    <p>加载数据时出现错误</p>
                    <button class="refresh-btn" id="nova-refresh-btn">重新加载</button>
                </div>
            `;
            const btn = document.getElementById('nova-refresh-btn');
            if (btn) btn.addEventListener('click', () => this.loadActiveTabData());
        }

        emptyHtml() {
            return `
                <div class="error-message">
                    <p>暂无数据</p>
                    <button class="refresh-btn" id="nova-empty-btn">重新加载</button>
                </div>
            `;
        }
    }

    function initNova() {
        new NovaApp();
        if (window.SpriteChatManager) {
            window.spriteChatManager = new window.SpriteChatManager();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNova);
    } else {
        initNova();
    }
})();
