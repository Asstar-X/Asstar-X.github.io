// 全局配置与模型管理
class ConfigManager {
    constructor() {
        this.storageKeys = {
            selectedModel: 'prompt.selectedModel',
            apiKeys: 'prompt.apiKeys',
            useDefaultKey: 'prompt.useDefaultKey',
            apiUrls: 'prompt.apiUrls',
            defaultKeys: 'prompt.defaultKeys'
        };

        // 可用模型配置（可按需扩展与调整）
        this.models = {
            qwen: {
                name: 'Qwen3-Max',
                description: '阿里通义千问 OpenAI 兼容推理接口',
                icon: '🧠',
                requestFormat: 'openai',
                apiUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
                headers: { 'Content-Type': 'application/json' },
                model: 'qwen3-max',
                temperature: 0.7,
                topP: 0.9,
                maxTokens: 1024,
                defaultApiKey: 'sk-33f1ab763eb24d10a49b513527774eab'
            },
            openai: {
                name: 'OpenAI',
                description: 'OpenAI Chat Completions 接口',
                icon: '🤖',
                requestFormat: 'openai',
                apiUrl: 'https://api.openai.com/v1/chat/completions',
                headers: { 'Content-Type': 'application/json' },
                model: 'gpt-4o-mini',
                temperature: 0.7,
                topP: 0.95,
                maxTokens: 1024,
                defaultApiKey: ''
            },
            claude: {
                name: 'Claude',
                description: 'Anthropic Claude Messages 接口（SSE）',
                icon: '🟣',
                requestFormat: 'anthropic',
                apiUrl: 'https://api.anthropic.com/v1/messages',
                headers: {
                    'Content-Type': 'application/json',
                    'anthropic-version': '2023-06-01'
                },
                model: 'claude-3-5-sonnet-20241022',
                temperature: 0.7,
                topP: 0.95,
                maxTokens: 1024,
                defaultApiKey: ''
            },
            doubao: {
                name: 'Doubao',
                description: '字节豆包 OpenAI 兼容接口',
                icon: '🫘',
                requestFormat: 'openai',
                apiUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
                headers: { 'Content-Type': 'application/json' },
                model: 'doubao-pro-32k',
                temperature: 0.7,
                topP: 0.95,
                maxTokens: 1024,
                defaultApiKey: ''
            },
            deepseek: {
                name: 'DeepSeek',
                description: 'DeepSeek OpenAI 兼容接口',
                icon: '🧭',
                requestFormat: 'openai',
                apiUrl: 'https://api.deepseek.com/v1/chat/completions',
                headers: { 'Content-Type': 'application/json' },
                model: 'deepseek-chat',
                temperature: 0.7,
                topP: 0.95,
                maxTokens: 1024,
                defaultApiKey: ''
            },
            chatglm: {
                name: 'ChatGLM',
                description: '智谱 GLM OpenAI 兼容接口',
                icon: '🧩',
                requestFormat: 'openai',
                apiUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
                headers: { 'Content-Type': 'application/json' },
                model: 'glm-4',
                temperature: 0.7,
                topP: 0.95,
                maxTokens: 1024,
                defaultApiKey: ''
            },
            kimi: {
                name: 'Kimi',
                description: 'Moonshot Kimi OpenAI 兼容接口',
                icon: '🌙',
                requestFormat: 'openai',
                apiUrl: 'https://api.moonshot.cn/v1/chat/completions',
                headers: { 'Content-Type': 'application/json' },
                model: 'moonshot-v1-8k',
                temperature: 0.7,
                topP: 0.95,
                maxTokens: 1024,
                defaultApiKey: ''
            }
        };

        // 读取本地存储
        this.selectedModel = this.#safeRead(this.storageKeys.selectedModel) || 'qwen';
        this.apiKeys = this.#safeRead(this.storageKeys.apiKeys) || {};
        this.useDefaultKey = this.#safeRead(this.storageKeys.useDefaultKey);
        this.apiUrls = this.#safeRead(this.storageKeys.apiUrls) || {};
        this.defaultKeys = this.#safeRead(this.storageKeys.defaultKeys) || {};
        if (typeof this.useDefaultKey !== 'boolean') this.useDefaultKey = false;
    }

    getAllModels() {
        return this.models;
    }

    setSelectedModel(modelKey) {
        if (!this.models[modelKey]) return;
        this.selectedModel = modelKey;
        this.#safeWrite(this.storageKeys.selectedModel, modelKey);
    }

    setApiKey(modelKey, key) {
        if (!modelKey) return;
        this.apiKeys[modelKey] = key || '';
        this.#safeWrite(this.storageKeys.apiKeys, this.apiKeys);
    }

    setUseDefaultKey(flag) {
        this.useDefaultKey = !!flag;
        this.#safeWrite(this.storageKeys.useDefaultKey, this.useDefaultKey);
    }

    setApiUrl(modelKey, url) {
        if (!modelKey) return;
        this.apiUrls[modelKey] = (url || '').trim();
        this.#safeWrite(this.storageKeys.apiUrls, this.apiUrls);
    }

    hasDefaultKey(modelKey) {
        const m = this.models[modelKey];
        return !!(m && m.defaultApiKey);
    }

    getCurrentModelConfig() {
        return this.models[this.selectedModel] || this.models.qwen;
    }

    getCurrentApiUrl() {
        const cfg = this.getCurrentModelConfig();
        const overridden = this.apiUrls[this.selectedModel];
        return (overridden && overridden.length > 0) ? overridden : (cfg.apiUrl || '');
    }

    getCurrentApiKey() {
        const cfg = this.getCurrentModelConfig();
        if (this.useDefaultKey) {
            const injected = this.defaultKeys?.[this.selectedModel];
            if (injected && typeof injected === 'string' && injected.length > 0) return injected;
            if (cfg.defaultApiKey) return cfg.defaultApiKey;
        }
        return this.apiKeys[this.selectedModel] || '';
    }

    // 安全存取localStorage
    #safeRead(key) {
        try {
            const raw = localStorage.getItem(key);
            if (raw == null) return null;
            try {
                return JSON.parse(raw);
            } catch (_) {
                return raw;
            }
        } catch (_) {
            return null;
        }
    }

    #safeWrite(key, value) {
        try {
            const raw = typeof value === 'string' ? value : JSON.stringify(value);
            localStorage.setItem(key, raw);
        } catch (_) {}
    }
}

// 作为全局暴露（供 prompt-optimizer 页面脚本使用）
window.ConfigManager = ConfigManager;



