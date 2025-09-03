// HuggingFace Model Trending 功能
class HuggingFaceTrending {
    constructor() {
        this.currentCategory = 'trending';
        this.trendingData = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadTrendingData();
        this.startAutoRefresh();
    }

    bindEvents() {
        // 分类筛选按钮事件
        const categoryButtons = document.querySelectorAll('.category-btn');
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                categoryButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentCategory = e.target.dataset.category;
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
                <p>正在加载热门模型...</p>
            </div>
        `;

        try {
            // 从本地JSON文件获取数据（由Python爬虫更新）
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
            // 从本地JSON文件获取数据（由Python爬虫更新）
            const response = await fetch('huggingface-data.json');
            if (response.ok) {
                const data = await response.json();
                if (data[this.currentCategory]) {
                    const arr = data[this.currentCategory];
                    if (Array.isArray(arr) && arr.length > 0) {
                        return arr;
                    }
                }
            }
        } catch (error) {
            console.warn('无法加载本地数据文件:', error);
        }

        // 如果API不可用，使用模拟数据
        const mockData = {
            trending: [
                {
                    name: "microsoft/VibeVoice-1.5B",
                    description: "Text-to-Speech model with 3B parameters, updated 2 days ago",
                    task: "Text-to-Speech",
                    parameters: "3B",
                    likes: "134k",
                    downloads: "1.27k",
                    url: "https://huggingface.co/microsoft/VibeVoice-1.5B",
                    tags: ["Text-to-Speech", "Audio Generation", "Microsoft"]
                },
                {
                    name: "openbmb/MiniCPM-V-4_5",
                    description: "Image-Text-to-Text model with 9B parameters, updated about 14 hours ago",
                    task: "Image-Text-to-Text",
                    parameters: "9B",
                    likes: "13.9k",
                    downloads: "837",
                    url: "https://huggingface.co/openbmb/MiniCPM-V-4_5",
                    tags: ["Vision-Language", "Multimodal", "OpenBMB"]
                },
                {
                    name: "tencent/Hunyuan-MT-7B",
                    description: "Translation model with 8B parameters, updated about 14 hours ago",
                    task: "Translation",
                    parameters: "8B",
                    likes: "487",
                    downloads: "379",
                    url: "https://huggingface.co/tencent/Hunyuan-MT-7B",
                    tags: ["Translation", "Multilingual", "Tencent"]
                },
                {
                    name: "meituan-longcat/LongCat-Flash-Chat",
                    description: "Text Generation model with 562B parameters, updated 3 days ago",
                    task: "Text Generation",
                    parameters: "562B",
                    likes: "5.24k",
                    downloads: "363",
                    url: "https://huggingface.co/meituan-longcat/LongCat-Flash-Chat",
                    tags: ["Text Generation", "Chat", "Meituan"]
                },
                {
                    name: "Qwen/Qwen-Image-Edit",
                    description: "Image-to-Image model, updated 9 days ago",
                    task: "Image-to-Image",
                    parameters: "Unknown",
                    likes: "84.5k",
                    downloads: "1.63k",
                    url: "https://huggingface.co/Qwen/Qwen-Image-Edit",
                    tags: ["Image Editing", "Qwen", "Alibaba"]
                }
            ],
            likes: [
                {
                    name: "deepseek-ai/DeepSeek-R1",
                    description: "Text Generation model with 685B parameters, updated Mar 27",
                    task: "Text Generation",
                    parameters: "685B",
                    likes: "456k",
                    downloads: "12.7k",
                    url: "https://huggingface.co/deepseek-ai/DeepSeek-R1",
                    tags: ["Text Generation", "Large Language Model", "DeepSeek"]
                },
                {
                    name: "black-forest-labs/FLUX.1-dev",
                    description: "Text-to-Image model, updated Jun 27",
                    task: "Text-to-Image",
                    parameters: "Unknown",
                    likes: "1.4M",
                    downloads: "11.3k",
                    url: "https://huggingface.co/black-forest-labs/FLUX.1-dev",
                    tags: ["Text-to-Image", "Image Generation", "Black Forest Labs"]
                },
                {
                    name: "CompVis/stable-diffusion-v1-4",
                    description: "Text-to-Image model, updated Aug 23, 2023",
                    task: "Text-to-Image",
                    parameters: "Unknown",
                    likes: "726k",
                    downloads: "6.91k",
                    url: "https://huggingface.co/CompVis/stable-diffusion-v1-4",
                    tags: ["Text-to-Image", "Stable Diffusion", "CompVis"]
                },
                {
                    name: "stabilityai/stable-diffusion-xl-base-1.0",
                    description: "Text-to-Image model, updated Oct 30, 2023",
                    task: "Text-to-Image",
                    parameters: "Unknown",
                    likes: "2.17M",
                    downloads: "6.89k",
                    url: "https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0",
                    tags: ["Text-to-Image", "Stable Diffusion XL", "Stability AI"]
                },
                {
                    name: "meta-llama/Meta-Llama-3-8B",
                    description: "Text Generation model with 8B parameters, updated Sep 27, 2024",
                    task: "Text Generation",
                    parameters: "8B",
                    likes: "456k",
                    downloads: "6.3k",
                    url: "https://huggingface.co/meta-llama/Meta-Llama-3-8B",
                    tags: ["Text Generation", "Large Language Model", "Meta"]
                }
            ],
            downloads: [
                {
                    name: "Falconsai/nsfw_image_detection",
                    description: "Image Classification model with 0.1B parameters, updated Apr 6",
                    task: "Image Classification",
                    parameters: "0.1B",
                    likes: "Unknown",
                    downloads: "111M",
                    url: "https://huggingface.co/Falconsai/nsfw_image_detection",
                    tags: ["Image Classification", "Content Moderation", "Falconsai"]
                },
                {
                    name: "timm/mobilenetv3_small_100.lamb_in1k",
                    description: "Image Classification model, updated Jan 21",
                    task: "Image Classification",
                    parameters: "0.0B",
                    likes: "33",
                    downloads: "96.8M",
                    url: "https://huggingface.co/timm/mobilenetv3_small_100.lamb_in1k",
                    tags: ["Image Classification", "MobileNet", "TIMM"]
                },
                {
                    name: "sentence-transformers/all-MiniLM-L6-v2",
                    description: "Sentence Similarity model, updated Mar 6",
                    task: "Sentence Similarity",
                    parameters: "0.0B",
                    likes: "3.83k",
                    downloads: "92M",
                    url: "https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2",
                    tags: ["Sentence Similarity", "Embeddings", "Sentence Transformers"]
                },
                {
                    name: "dima806/fairface_age_image_detection",
                    description: "Image Classification model with 0.1B parameters, updated Dec 15, 2024",
                    task: "Image Classification",
                    parameters: "0.1B",
                    likes: "Unknown",
                    downloads: "69M",
                    url: "https://huggingface.co/dima806/fairface_age_image_detection",
                    tags: ["Image Classification", "Age Detection", "Fair Face"]
                },
                {
                    name: "openai-community/gpt2",
                    description: "Text Generation model with 0.1B parameters, updated Feb 19, 2024",
                    task: "Text Generation",
                    parameters: "0.1B",
                    likes: "2.92k",
                    downloads: "11.3M",
                    url: "https://huggingface.co/openai-community/gpt2",
                    tags: ["Text Generation", "GPT-2", "OpenAI"]
                }
            ]
        };

        return mockData[this.currentCategory] || mockData.trending;
    }

    renderTrendingData() {
        const contentContainer = document.getElementById('trending-content');
        
        if (!this.trendingData || this.trendingData.length === 0) {
            contentContainer.innerHTML = `
                <div class="error-message">
                    <p>暂无数据</p>
                    <button class="refresh-btn" onclick="huggingfaceTrendingApp.loadTrendingData()">重新加载</button>
                </div>
            `;
            return;
        }

        const trendingGrid = document.createElement('div');
        trendingGrid.className = 'trending-grid';

        this.trendingData.forEach((model, index) => {
            const card = this.createModelCard(model, index);
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

    createModelCard(model, index) {
        const card = document.createElement('div');
        card.className = 'trending-card';
        
        const tags = model.tags || [];
        
        card.innerHTML = `
            <div class="trending-card-content">
                <div class="model-header">
                    <div class="model-icon">🤖</div>
                    <div class="model-info">
                        <h3>${model.name}</h3>
                        <p>${model.task} • ${model.parameters}</p>
                    </div>
                </div>
                
                <p class="model-description">${model.description}</p>
                
                <div class="model-stats">
                    <div class="stat-item">
                        <i>❤️</i>
                        <span>${model.likes}</span>
                    </div>
                    <div class="stat-item">
                        <i>⬇️</i>
                        <span>${model.downloads}</span>
                    </div>
                    <div class="stat-item">
                        <i>📊</i>
                        <span>${model.parameters}</span>
                    </div>
                </div>
                
                ${tags.length > 0 ? `
                    <div class="model-tags">
                        ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
                
                <a href="${model.url}" target="_blank" class="model-link">
                    查看模型 <span>→</span>
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
                <button class="refresh-btn" onclick="huggingfaceTrendingApp.loadTrendingData()">重新加载</button>
            </div>
        `;
    }

    startAutoRefresh() {
        // 每6小时自动刷新一次数据
        setInterval(() => {
            this.loadTrendingData();
        }, 6 * 60 * 60 * 1000);
    }
}

// 初始化应用
let huggingfaceTrendingApp;

document.addEventListener('DOMContentLoaded', () => {
    huggingfaceTrendingApp = new HuggingFaceTrending();
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
        const categoryButtons = document.querySelectorAll('.category-btn');
        const activeButton = document.querySelector('.category-btn.active');
        const activeIndex = Array.from(categoryButtons).indexOf(activeButton);

        if (e.key === 'ArrowLeft' && activeIndex > 0) {
            categoryButtons[activeIndex - 1].click();
        } else if (e.key === 'ArrowRight' && activeIndex < categoryButtons.length - 1) {
            categoryButtons[activeIndex + 1].click();
        }
    });
});
