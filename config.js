// AI模型配置文件
const AI_MODELS = {
    // 通义千问 (Qwen)
    qwen: {
        name: '通义千问 (Qwen)',
        icon: '🌟',
        description: '阿里云通义千问，强大的中文理解能力',
        defaultApiKey: 'sk-379ad5f75fd44524bcc22cd04f86c4d2',
        apiUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
        model: 'qwen3-coder-plus',
        headers: {
            'Content-Type': 'application/json'
        },
        requestFormat: 'openai',
        maxTokens: 1500,
        temperature: 0.7,
        topP: 0.8
    },
    
    // ChatGPT (OpenAI)
    chatgpt: {
        name: 'ChatGPT (OpenAI)',
        icon: '🤖',
        description: 'OpenAI GPT系列，强大的通用AI能力',
        defaultApiKey: '',
        apiUrl: 'https://api.openai.com/v1/chat/completions',
        model: 'gpt-3.5-turbo',
        headers: {
            'Content-Type': 'application/json'
        },
        requestFormat: 'openai',
        maxTokens: 1500,
        temperature: 0.7,
        topP: 0.8
    },
    
    // Claude (Anthropic)
    claude: {
        name: 'Claude (Anthropic)',
        icon: '🧠',
        description: 'Anthropic Claude，安全可靠的AI助手',
        defaultApiKey: '',
        apiUrl: 'https://api.anthropic.com/v1/messages',
        model: 'claude-3-sonnet-20240229',
        headers: {
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
        },
        requestFormat: 'anthropic',
        maxTokens: 1500,
        temperature: 0.7,
        topP: 0.8
    },
    
    // 智谱AI (ChatGLM)
    chatglm: {
        name: '智谱AI (ChatGLM)',
        icon: '🎯',
        description: '智谱AI，优秀的中文对话模型',
        defaultApiKey: '',
        apiUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
        model: 'glm-4',
        headers: {
            'Content-Type': 'application/json'
        },
        requestFormat: 'openai',
        maxTokens: 1500,
        temperature: 0.7,
        topP: 0.8
    },
    
    // 文心一言 (百度)
    wenxin: {
        name: '文心一言 (百度)',
        icon: '💎',
        description: '百度文心一言，强大的中文AI模型',
        defaultApiKey: '',
        apiUrl: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions',
        model: 'ernie-bot-4',
        headers: {
            'Content-Type': 'application/json'
        },
        requestFormat: 'baidu',
        maxTokens: 1500,
        temperature: 0.7,
        topP: 0.8
    }
};

// 默认模型
const DEFAULT_MODEL = 'qwen';

// 本地存储键名
const STORAGE_KEYS = {
    SELECTED_MODEL: 'asstar_selected_model',
    API_KEYS: 'asstar_api_keys',
    USE_DEFAULT_KEY: 'asstar_use_default_key'
};

// 配置管理类
class ConfigManager {
    constructor() {
        this.selectedModel = this.getSelectedModel();
        this.apiKeys = this.getApiKeys();
        this.useDefaultKey = this.getUseDefaultKey();
    }
    
    // 获取选中的模型
    getSelectedModel() {
        return localStorage.getItem(STORAGE_KEYS.SELECTED_MODEL) || DEFAULT_MODEL;
    }
    
    // 设置选中的模型
    setSelectedModel(modelKey) {
        this.selectedModel = modelKey;
        localStorage.setItem(STORAGE_KEYS.SELECTED_MODEL, modelKey);
    }
    
    // 获取API密钥
    getApiKeys() {
        const keys = localStorage.getItem(STORAGE_KEYS.API_KEYS);
        return keys ? JSON.parse(keys) : {};
    }
    
    // 设置API密钥
    setApiKey(modelKey, apiKey) {
        this.apiKeys[modelKey] = apiKey;
        localStorage.setItem(STORAGE_KEYS.API_KEYS, JSON.stringify(this.apiKeys));
    }
    
    // 获取是否使用默认密钥
    getUseDefaultKey() {
        return localStorage.getItem(STORAGE_KEYS.USE_DEFAULT_KEY) === 'true';
    }
    
    // 设置是否使用默认密钥
    setUseDefaultKey(useDefault) {
        this.useDefaultKey = useDefault;
        localStorage.setItem(STORAGE_KEYS.USE_DEFAULT_KEY, useDefault.toString());
    }
    
    // 获取当前模型的配置
    getCurrentModelConfig() {
        return AI_MODELS[this.selectedModel];
    }
    
    // 获取当前模型的API密钥
    getCurrentApiKey() {
        if (this.useDefaultKey) {
            return this.getCurrentModelConfig().defaultApiKey;
        }
        return this.apiKeys[this.selectedModel] || '';
    }
    
    // 获取所有可用模型
    getAllModels() {
        return AI_MODELS;
    }
    
    // 检查模型是否有默认密钥
    hasDefaultKey(modelKey) {
        return AI_MODELS[modelKey] && AI_MODELS[modelKey].defaultApiKey;
    }
}

// 导出配置
window.AI_MODELS = AI_MODELS;
window.DEFAULT_MODEL = DEFAULT_MODEL;
window.STORAGE_KEYS = STORAGE_KEYS;
window.ConfigManager = ConfigManager; 