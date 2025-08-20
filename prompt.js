// 聊天对话功能
class ChatManager {
    constructor() {
        this.messages = [];
        this.isTyping = false;
        this.configManager = new ConfigManager();
        this.currentTemplate = 'system'; // 'system' 或 'user'
        this.renderMode = 'text'; // 'text' 或 'markdown'
        
        this.chatMessages = document.getElementById('chat-messages');
        this.chatInput = document.getElementById('chat-input');
        this.sendButton = document.getElementById('send-button');
        this.typingIndicator = document.getElementById('typing-indicator');
        this.clearButton = document.getElementById('clear-button');
        this.modelSelectButton = document.getElementById('model-select-button');
        this.templateToggleButton = document.getElementById('template-toggle-button');
        
        // 渲染模式选项
        this.renderTextOption = document.getElementById('render-text');
        this.renderMarkdownOption = document.getElementById('render-markdown');
        
        // 模型选择模态框元素
        this.modelModal = document.getElementById('model-modal');
        this.modelList = document.getElementById('model-list');
        this.modelModalClose = document.getElementById('model-modal-close');
        this.cancelModelSelect = document.getElementById('cancel-model-select');
        this.confirmModelSelect = document.getElementById('confirm-model-select');
        this.useDefaultKey = document.getElementById('use-default-key');
        this.useCustomKey = document.getElementById('use-custom-key');
        this.customApiKey = document.getElementById('custom-api-key');
        
        // 提示词模版选择模态框元素
        this.templateModal = document.getElementById('template-modal');
        this.templateList = document.getElementById('template-list');
        this.templateModalClose = document.getElementById('template-modal-close');
        this.cancelTemplateSelect = document.getElementById('cancel-template-select');
        this.confirmTemplateSelect = document.getElementById('confirm-template-select');
        
        // 加载指示器元素
        this.loadingOverlay = document.getElementById('loading-overlay');
        this.loadingText = document.getElementById('loading-text');
        
        this.init();
    }
    
    init() {
        // 设置当前时间
        this.updateCurrentTime();
        
        // 绑定事件
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // 绑定清除按钮事件
        this.clearButton.addEventListener('click', () => this.clearConversation());
        
        // 绑定模型选择按钮事件
        this.modelSelectButton.addEventListener('click', () => this.showModelSelector());
        
        // 绑定提示词模版切换按钮事件
        this.templateToggleButton.addEventListener('click', () => this.showTemplateSelector());
        
        // 绑定渲染模式切换事件
        this.renderTextOption.addEventListener('change', () => this.updateRenderMode());
        this.renderMarkdownOption.addEventListener('change', () => this.updateRenderMode());
        
        // 绑定模型选择模态框事件
        this.modelModalClose.addEventListener('click', () => this.hideModelSelector());
        this.cancelModelSelect.addEventListener('click', () => this.hideModelSelector());
        this.confirmModelSelect.addEventListener('click', () => this.confirmModelSelection());
        
        // 绑定提示词模版选择模态框事件
        this.templateModalClose.addEventListener('click', () => this.hideTemplateSelector());
        this.cancelTemplateSelect.addEventListener('click', () => this.hideTemplateSelector());
        this.confirmTemplateSelect.addEventListener('click', () => this.confirmTemplateSelection());
        
        // 绑定密钥类型选择事件
        this.useDefaultKey.addEventListener('change', () => this.toggleKeyInput());
        this.useCustomKey.addEventListener('change', () => this.toggleKeyInput());
        
        // 自动调整输入框高度
        this.chatInput.addEventListener('input', () => {
            this.adjustTextareaHeight();
        });
        
        // 初始化模型选择界面
        this.initModelSelector();
        
        // 检查API密钥
        this.checkApiKey();
        
        // 更新当前模型显示
        this.updateCurrentModelDisplay();
        
        // 初始化渲染模式和模版状态
        this.updateRenderMode();
        this.updateTemplateDisplay();
    }
    
    checkApiKey() {
        // 获取当前模型的API密钥
        const currentApiKey = this.configManager.getCurrentApiKey();
        
        if (!currentApiKey) {
            this.showApiKeyPrompt();
        }
    }
    
    showApiKeyPrompt() {
        const currentModel = this.configManager.getCurrentModelConfig();
        const apiKeyMessage = `
            <div style="background: rgba(255, 107, 107, 0.1); border: 1px solid rgba(255, 107, 107, 0.3); border-radius: 12px; padding: 1rem; margin-bottom: 1rem;">
                <p style="color: #ff6b6b; margin: 0 0 0.5rem 0; font-weight: 500;">⚠️ 需要配置API密钥</p>
                <p style="color: var(--text-secondary); margin: 0 0 1rem 0; font-size: 0.9rem;">
                    请点击下方按钮设置你的${currentModel.name} API密钥以开始对话
                </p>
                <button onclick="chatManager.showModelSelector()" style="
                    background: var(--gradient-secondary);
                    border: none;
                    border-radius: 8px;
                    padding: 0.5rem 1rem;
                    color: white;
                    cursor: pointer;
                    font-size: 0.9rem;
                ">设置API密钥</button>
            </div>
        `;
        
        this.chatMessages.insertAdjacentHTML('beforeend', apiKeyMessage);
    }
    
    // 初始化模型选择界面
    initModelSelector() {
        const models = this.configManager.getAllModels();
        this.modelList.innerHTML = '';
        
        Object.keys(models).forEach(modelKey => {
            const model = models[modelKey];
            const isSelected = modelKey === this.configManager.selectedModel;
            const hasDefaultKey = this.configManager.hasDefaultKey(modelKey);
            
            const modelItem = document.createElement('div');
            modelItem.className = `model-item ${isSelected ? 'selected' : ''}`;
            modelItem.dataset.modelKey = modelKey;
            modelItem.innerHTML = `
                <div class="model-item-header">
                    <div class="model-icon">${model.icon}</div>
                    <div>
                        <h4 class="model-name">${model.name}</h4>
                        <p class="model-description">${model.description}</p>
                    </div>
                </div>
                ${hasDefaultKey ? '<div class="model-status" title="有默认密钥"></div>' : ''}
            `;
            
            modelItem.addEventListener('click', () => this.selectModel(modelKey));
            this.modelList.appendChild(modelItem);
        });
        
        // 设置默认密钥选项
        this.updateKeyOptions();
    }
    
    // 选择模型
    selectModel(modelKey) {
        // 移除之前的选中状态
        this.modelList.querySelectorAll('.model-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        // 添加新的选中状态
        const selectedItem = this.modelList.querySelector(`[data-model-key="${modelKey}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
        }
        
        // 更新密钥选项
        this.updateKeyOptions();
    }
    
    // 更新密钥选项
    updateKeyOptions() {
        const selectedModelKey = this.modelList.querySelector('.model-item.selected')?.dataset.modelKey;
        if (!selectedModelKey) return;
        
        const hasDefaultKey = this.configManager.hasDefaultKey(selectedModelKey);
        const customKey = this.configManager.apiKeys[selectedModelKey] || '';
        
        // 设置密钥类型选择
        if (hasDefaultKey) {
            this.useDefaultKey.checked = true;
            this.useCustomKey.checked = false;
        } else {
            this.useDefaultKey.checked = false;
            this.useCustomKey.checked = true;
        }
        
        // 设置自定义密钥输入框
        this.customApiKey.value = customKey;
        
        // 更新输入框状态
        this.toggleKeyInput();
    }
    
    // 切换密钥输入框状态
    toggleKeyInput() {
        const useCustom = this.useCustomKey.checked;
        this.customApiKey.disabled = !useCustom;
        this.customApiKey.style.opacity = useCustom ? '1' : '0.5';
    }
    
    // 显示模型选择器
    showModelSelector() {
        this.modelModal.classList.add('show');
    }
    
    // 隐藏模型选择器
    hideModelSelector() {
        this.modelModal.classList.remove('show');
    }
    
    // 确认模型选择
    async confirmModelSelection() {
        const selectedModelKey = this.modelList.querySelector('.model-item.selected')?.dataset.modelKey;
        if (!selectedModelKey) {
            alert('请选择一个AI模型');
            return;
        }
        
        // 更新选中的模型
        this.configManager.setSelectedModel(selectedModelKey);
        
        // 处理密钥设置
        let apiKey = '';
        if (this.useCustomKey.checked) {
            const customKey = this.customApiKey.value.trim();
            if (!customKey) {
                alert('请输入API密钥');
                return;
            }
            apiKey = customKey;
            this.configManager.setApiKey(selectedModelKey, customKey);
            this.configManager.setUseDefaultKey(false);
        } else {
            apiKey = this.configManager.getCurrentModelConfig().defaultApiKey;
            this.configManager.setUseDefaultKey(true);
        }
        
        // 显示加载指示器
        this.showLoading('正在验证API密钥...');
        
        // 验证API密钥
        const isValid = await this.testApiKey(selectedModelKey, apiKey);
        
        // 隐藏加载指示器
        this.hideLoading();
        
        if (!isValid) {
            alert('API密钥验证失败，请检查密钥是否正确');
            return;
        }
        
        // 隐藏模态框
        this.hideModelSelector();
        
        // 更新显示
        this.updateCurrentModelDisplay();
        
        // 移除API密钥提示
        const apiKeyPrompt = this.chatMessages.querySelector('div[style*="background: rgba(255, 107, 107, 0.1)"]');
        if (apiKeyPrompt) {
            apiKeyPrompt.remove();
        }
        
        // 显示成功消息
        const currentModel = this.configManager.getCurrentModelConfig();
        this.addMessage('assistant', `${currentModel.name}配置成功！现在可以开始对话了。`);
    }
    
    // 测试API密钥
    async testApiKey(modelKey, apiKey) {
        const model = this.configManager.getAllModels()[modelKey];
        if (!model || !apiKey) return false;
        
        try {
            // 创建临时的配置管理器来测试
            const tempConfig = {
                getCurrentModelConfig: () => model,
                getCurrentApiKey: () => apiKey
            };
            
            // 发送一个简单的测试消息
            const testMessage = '你好';
            const response = await this.callAIAPIWithConfig(testMessage, tempConfig);
            
            // 如果能够正常返回响应，说明密钥有效
            return response && response.length > 0;
        } catch (error) {
            console.error('API密钥测试失败:', error);
            return false;
        }
    }
    
    // 使用指定配置调用AI API
    async callAIAPIWithConfig(message, config) {
        const currentModel = config.getCurrentModelConfig();
        const currentApiKey = config.getCurrentApiKey();
        
        let url, headers, requestBody;
        
        // 根据不同的模型格式处理API密钥
        if (currentModel.requestFormat === 'openai') {
            // OpenAI兼容格式 (Qwen, ChatGPT, ChatGLM等)
            url = currentModel.apiUrl;
            headers = {
                ...currentModel.headers,
                'Authorization': `Bearer ${currentApiKey}`
            };
            
            requestBody = {
                model: currentModel.model,
                messages: [
                    {
                        role: 'user',
                        content: message
                    }
                ],
                temperature: currentModel.temperature,
                max_tokens: Math.min(currentModel.maxTokens, 100), // 测试时使用较小的token数
                top_p: currentModel.topP
            };
        } else if (currentModel.requestFormat === 'anthropic') {
            // Claude格式
            url = currentModel.apiUrl;
            headers = {
                ...currentModel.headers,
                'x-api-key': currentApiKey
            };
            
            requestBody = {
                model: currentModel.model,
                max_tokens: Math.min(currentModel.maxTokens, 100),
                temperature: currentModel.temperature,
                messages: [
                    {
                        role: 'user',
                        content: message
                    }
                ]
            };
        } else if (currentModel.requestFormat === 'baidu') {
            // 百度文心一言格式
            url = currentModel.apiUrl;
            headers = {
                ...currentModel.headers,
                'Authorization': `Bearer ${currentApiKey}`
            };
            
            requestBody = {
                messages: [
                    {
                        role: 'user',
                        content: message
                    }
                ],
                temperature: currentModel.temperature,
                top_p: currentModel.topP
            };
        } else {
            // DashScope格式
            url = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
            headers = {
                'Authorization': `Bearer ${currentApiKey}`,
                'Content-Type': 'application/json',
                'X-DashScope-SSE': 'enable'
            };
            
            requestBody = {
                model: currentModel.model,
                input: {
                    messages: [
                        {
                            role: 'user',
                            content: message
                        }
                    ]
                },
                parameters: {
                    temperature: currentModel.temperature,
                    max_tokens: Math.min(currentModel.maxTokens, 100),
                    top_p: currentModel.topP
                }
            };
        }
        
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // 处理不同的响应格式
        if (data.output && data.output.text) {
            // DashScope格式
            return data.output.text;
        } else if (data.choices && data.choices[0] && data.choices[0].message) {
            // OpenAI兼容格式
            return data.choices[0].message.content;
        } else if (data.content && data.content[0] && data.content[0].text) {
            // Claude格式
            return data.content[0].text;
        } else if (data.result) {
            // 百度文心一言格式
            return data.result;
        } else {
            throw new Error('API响应格式错误');
        }
    }
    
    // 显示加载指示器
    showLoading(text = '正在处理...') {
        this.loadingText.textContent = text;
        this.loadingOverlay.style.display = 'flex';
    }
    
    // 隐藏加载指示器
    hideLoading() {
        this.loadingOverlay.style.display = 'none';
    }
    
    // 更新当前模型显示
    updateCurrentModelDisplay() {
        const currentModel = this.configManager.getCurrentModelConfig();
        const chatInfo = document.querySelector('.chat-info h3');
        if (chatInfo) {
            chatInfo.textContent = `Asstar提示词专家 (${currentModel.name})`;
        }
    }
    
    // 更新模版显示状态
    updateTemplateDisplay() {
        const templateNames = {
            'system': '系统提示词模版',
            'user': '用户提示词优化模版',
            'expand': 'CoT拓提示词模版',
            'iterate': '反复优化提示词模版'
        };
        
        const currentTemplateName = templateNames[this.currentTemplate] || '未知模版';
        
        if (this.currentTemplate === 'system') {
            this.templateToggleButton.classList.add('active');
        } else {
            this.templateToggleButton.classList.remove('active');
        }
        
        this.templateToggleButton.title = `当前：${currentTemplateName} (点击切换模版)`;
    }
    
    // 显示模版切换提示
    showTemplateSwitchMessage() {
        const templateName = this.currentTemplate === 'system' ? '系统提示词模版' : '用户提示词模版';
        const message = `已切换到${templateName}，现在将使用相应的提示词优化策略。`;
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 193, 7, 0.9);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            font-size: 0.9rem;
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // 3秒后自动移除
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // 显示提示词模版选择器
    showTemplateSelector() {
        this.initTemplateSelector();
        this.templateModal.classList.add('show');
    }
    
    // 隐藏提示词模版选择器
    hideTemplateSelector() {
        this.templateModal.classList.remove('show');
    }
    
    // 初始化提示词模版选择界面
    initTemplateSelector() {
        const templateItems = this.templateList.querySelectorAll('.template-item');
        templateItems.forEach(item => {
            item.classList.remove('selected');
            if (item.dataset.template === this.currentTemplate) {
                item.classList.add('selected');
            }
            
            item.addEventListener('click', () => this.selectTemplate(item.dataset.template));
        });
    }
    
    // 选择提示词模版
    selectTemplate(templateKey) {
        // 移除之前的选中状态
        this.templateList.querySelectorAll('.template-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        // 添加新的选中状态
        const selectedItem = this.templateList.querySelector(`[data-template="${templateKey}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
        }
    }
    
    // 确认提示词模版选择
    confirmTemplateSelection() {
        const selectedTemplate = this.templateList.querySelector('.template-item.selected')?.dataset.template;
        if (!selectedTemplate) {
            alert('请选择一个提示词模版');
            return;
        }
        
        // 更新选中的模版
        this.currentTemplate = selectedTemplate;
        
        // 隐藏模态框
        this.hideTemplateSelector();
        
        // 更新显示
        this.updateTemplateDisplay();
        
        // 显示切换提示
        this.showTemplateSwitchMessage();
    }
    
    // 更新渲染模式
    updateRenderMode() {
        if (this.renderTextOption.checked) {
            this.renderMode = 'text';
        } else if (this.renderMarkdownOption.checked) {
            this.renderMode = 'markdown';
        }
        
        // 重新渲染所有消息
        this.rerenderAllMessages();
    }
    
    // 重新渲染所有消息
    rerenderAllMessages() {
        const messageElements = this.chatMessages.querySelectorAll('.message');
        messageElements.forEach(element => {
            const contentElement = element.querySelector('.message-content p');
            if (contentElement) {
                const originalContent = contentElement.getAttribute('data-original-content');
                if (originalContent) {
                    contentElement.innerHTML = this.formatMessage(originalContent);
                }
            }
        });
    }
    
    updateCurrentTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const currentTimeElement = document.getElementById('current-time');
        if (currentTimeElement) {
            currentTimeElement.textContent = timeString;
        }
    }
    
    adjustTextareaHeight() {
        this.chatInput.style.height = 'auto';
        this.chatInput.style.height = Math.min(this.chatInput.scrollHeight, 120) + 'px';
    }
    
    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message || this.isTyping) return;
        
        const currentApiKey = this.configManager.getCurrentApiKey();
        if (!currentApiKey) {
            this.addMessage('assistant', '请先设置API密钥才能开始对话。');
            return;
        }
        
        // 添加用户消息
        this.addMessage('user', message);
        this.chatInput.value = '';
        this.adjustTextareaHeight();
        
        // 显示打字指示器
        this.showTypingIndicator();
        
        try {
            // 调用AI API（支持流式输出）
            const response = await this.callAIAPI(message);
            this.hideTypingIndicator();
            
            // 流式输出已经在handleStreamResponse中处理了消息显示
            // 非流式输出需要添加消息到历史记录
            if (response && typeof response === 'string') {
                // 将响应添加到消息历史
                this.messages.push({
                    role: 'assistant',
                    content: response,
                    timestamp: new Date()
                });
            }
        } catch (error) {
            this.hideTypingIndicator();
            console.error('API调用错误:', error);
            this.addMessage('assistant', '抱歉，发生了错误。请检查你的API密钥是否正确，或者稍后再试。');
        }
    }
    
    async callAIAPI(message) {
        const currentModel = this.configManager.getCurrentModelConfig();
        const currentApiKey = this.configManager.getCurrentApiKey();
        
        let url, headers, requestBody;
        
        // 根据不同的模型格式处理API密钥
        if (currentModel.requestFormat === 'openai') {
            // OpenAI兼容格式 (Qwen, ChatGPT, ChatGLM等)
            url = currentModel.apiUrl;
            headers = {
                ...currentModel.headers,
                'Authorization': `Bearer ${currentApiKey}`,
                'Accept': 'text/event-stream'
            };
            
            requestBody = {
                model: currentModel.model,
                messages: [
                    {
                        role: 'system',
                        content: this.getSystemPrompt()
                    },
                    ...this.messages.map(msg => ({
                        role: msg.role,
                        content: msg.content
                    })),
                    {
                        role: 'user',
                        content: message
                    }
                ],
                temperature: currentModel.temperature,
                max_tokens: currentModel.maxTokens,
                top_p: currentModel.topP,
                stream: true
            };
        } else if (currentModel.requestFormat === 'anthropic') {
            // Claude格式
            url = currentModel.apiUrl;
            headers = {
                ...currentModel.headers,
                'x-api-key': currentApiKey,
                'Accept': 'text/event-stream'
            };
            
            requestBody = {
                model: currentModel.model,
                max_tokens: currentModel.maxTokens,
                temperature: currentModel.temperature,
                messages: [
                    {
                        role: 'user',
                        content: `${this.getSystemPrompt()}\n\n${this.messages.map(msg => `${msg.role}: ${msg.content}`).join('\n')}\n\nuser: ${message}`
                    }
                ],
                stream: true
            };
        } else if (currentModel.requestFormat === 'baidu') {
            // 百度文心一言格式 - 不支持流式输出，使用普通请求
            url = currentModel.apiUrl;
            headers = {
                ...currentModel.headers,
                'Authorization': `Bearer ${currentApiKey}`
            };
            
            requestBody = {
                messages: [
                    {
                        role: 'user',
                        content: `${this.getSystemPrompt()}\n\n${this.messages.map(msg => `${msg.role}: ${msg.content}`).join('\n')}\n\nuser: ${message}`
                    }
                ],
                temperature: currentModel.temperature,
                top_p: currentModel.topP
            };
        } else {
            // DashScope格式
            url = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
            headers = {
                'Authorization': `Bearer ${currentApiKey}`,
                'Content-Type': 'application/json',
                'X-DashScope-SSE': 'enable'
            };
            
            requestBody = {
                model: currentModel.model,
                input: {
                    messages: [
                        {
                            role: 'system',
                            content: this.getSystemPrompt()
                        },
                        ...this.messages.map(msg => ({
                            role: msg.role,
                            content: msg.content
                        })),
                        {
                            role: 'user',
                            content: message
                        }
                    ]
                },
                parameters: {
                    temperature: currentModel.temperature,
                    max_tokens: currentModel.maxTokens,
                    top_p: currentModel.topP
                }
            };
        }
        
        console.log('API请求URL:', url);
        console.log('API请求头:', headers);
        console.log('API请求体:', requestBody);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
        });
        
        console.log('API响应状态:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API错误响应:', errorText);
            throw new Error(`API请求失败: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        // 检查是否支持流式输出
        const supportsStreaming = currentModel.requestFormat === 'openai' || 
                                 currentModel.requestFormat === 'anthropic' || 
                                 currentModel.requestFormat === 'dashscope';
        
        if (supportsStreaming) {
            return this.handleStreamResponse(response, currentModel.requestFormat);
        } else {
            // 非流式响应处理
            const data = await response.json();
            console.log('API响应数据:', data);
            
            // 处理不同的响应格式
            if (data.output && data.output.text) {
                // DashScope格式
                return data.output.text;
            } else if (data.choices && data.choices[0] && data.choices[0].message) {
                // OpenAI兼容格式
                return data.choices[0].message.content;
            } else if (data.content && data.content[0] && data.content[0].text) {
                // Claude格式
                return data.content[0].text;
            } else if (data.result) {
                // 百度文心一言格式
                return data.result;
            } else {
                console.error('未知的响应格式:', data);
                throw new Error('API响应格式错误');
            }
        }
    }
    
    // 处理流式响应
    async handleStreamResponse(response, format) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullContent = '';
        
        // 创建流式消息元素
        const messageElement = this.createStreamMessageElement();
        this.chatMessages.appendChild(messageElement);
        
        try {
            while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;
                
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop(); // 保留不完整的行
                
                for (const line of lines) {
                    if (line.trim() === '') continue;
                    
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        
                        if (data === '[DONE]') {
                            // 流式输出完成
                            this.finalizeStreamMessage(messageElement, fullContent);
                            return fullContent;
                        }
                        
                        try {
                            const parsed = JSON.parse(data);
                            const content = this.extractContentFromStream(parsed, format);
                            
                            if (content) {
                                fullContent += content;
                                this.updateStreamMessage(messageElement, fullContent);
                            }
                        } catch (e) {
                            console.warn('解析流式数据失败:', e);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('流式响应处理错误:', error);
            this.finalizeStreamMessage(messageElement, fullContent);
            throw error;
        }
        
        this.finalizeStreamMessage(messageElement, fullContent);
        return fullContent;
    }
    
    // 从流式数据中提取内容
    extractContentFromStream(data, format) {
        if (format === 'openai') {
            return data.choices?.[0]?.delta?.content || '';
        } else if (format === 'anthropic') {
            return data.content?.[0]?.text || '';
        } else if (format === 'dashscope') {
            return data.output?.text || '';
        }
        return '';
    }
    
    // 创建流式消息元素
    createStreamMessageElement() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const messageElement = document.createElement('div');
        messageElement.className = 'message assistant streaming';
        messageElement.innerHTML = `
            <div class="message-avatar assistant">✦</div>
            <div class="message-content">
                <p class="streaming-content"></p>
                <div class="streaming-cursor"></div>
                <div class="message-time">${timeString}</div>
            </div>
        `;
        
        return messageElement;
    }
    
    // 更新流式消息内容
    updateStreamMessage(messageElement, content) {
        const contentElement = messageElement.querySelector('.streaming-content');
        if (contentElement) {
            contentElement.textContent = content;
        }
        
        // 滚动到底部
        this.scrollToBottom();
    }
    
    // 完成流式消息
    finalizeStreamMessage(messageElement, content) {
        // 移除流式样式
        messageElement.classList.remove('streaming');
        
        // 移除光标
        const cursorElement = messageElement.querySelector('.streaming-cursor');
        if (cursorElement) {
            cursorElement.remove();
        }
        
        // 格式化内容
        const contentElement = messageElement.querySelector('.streaming-content');
        if (contentElement) {
            contentElement.setAttribute('data-original-content', content);
            contentElement.innerHTML = this.formatMessage(content);
        }
        
        // 将流式消息添加到历史记录
        this.messages.push({
            role: 'assistant',
            content: content,
            timestamp: new Date()
        });
        
        // 滚动到底部
        this.scrollToBottom();
    }
    
    // 获取系统提示词
    getSystemPrompt() {
        if (this.currentTemplate === 'system') {
            return  `你是一个专业的AI提示词优化专家。请帮我优化以下prompt，并按照以下格式返回：

            # Role: [角色名称]
            
            ## Profile
            - language: [语言]
            - description: [详细的角色描述]
            - background: [角色背景]
            - personality: [研究]
            - expertise: [专业领域]
            - target_audience: [目标用户群]
            
            ## Skills
            
            1. [核心技能类别]
               - [具体技能]: [简要说明]
               - [具体技能]: [简要说明]
               - [具体技能]: [简要说明]
               - [具体技能]: [简要说明]
            
            2. [辅助技能类别]
               - [具体技能]: [简要说明]
               - [具体技能]: [简要说明]
               - [具体技能]: [简要说明]
               - [具体技能]: [简要说明]
            
            ## Rules
            
            1. [基本原则]：
               - [具体规则]: [详细说明]
               - [具体规则]: [详细说明]
               - [具体规则]: [详细说明]
               - [具体规则]: [详细说明]
            
            2. [行为准则]：
               - [具体规则]: [详细说明]
               - [具体规则]: [详细说明]
               - [具体规则]: [详细说明]
               - [具体规则]: [详细说明]
            
            3. [限制条件]：
               - [具体限制]: [详细说明]
               - [具体限制]: [详细说明]
               - [具体限制]: [详细说明]
               - [具体限制]: [详细说明]
            
            ## Workflows
            
            - 目标: [明确目标]
            - 步骤 1: [详细说明]
            - 步骤 2: [详细说明]
            - 步骤 3: [详细说明]
            - 预期结果: [说明]
            
            
            ## Initialization
            作为[角色名称]，你必须遵守上述Rules，按照Workflows执行任务。
            
            
            请基于以上模板，优化并扩展以下prompt，确保内容专业、完整且结构清晰，注意不要携带任何引导词或解释，不要使用代码块包围：`;
        } else if (this.currentTemplate === 'user') {
            return `你是一个专业的AI提示词优化专家。请帮我优化以下prompt，并按照以下格式返回：
：
# Role: 用户提示词精准描述专家

## Profile
- language: [语言]
- Description: 专门将泛泛而谈、缺乏针对性的用户提示词转换为精准、具体、有针对性的描述

## Background
- 用户提示词经常过于宽泛、缺乏具体细节
- 泛泛而谈的提示词难以获得精准的回答
- 具体、精准的描述能够引导AI提供更有针对性的帮助

## Goals
你的任务是将泛泛而谈的用户提示词转换为精准、具体的描述。你不是在执行提示词中的任务，而是在改进提示词的精准度和针对性。

## Skills
1. 精准化能力
   - 细节挖掘: 识别需要具体化的抽象概念和泛泛表述
   - 参数明确: 为模糊的要求添加具体的参数和标准
   - 范围界定: 明确任务的具体范围和边界
   - 目标聚焦: 将宽泛的目标细化为具体的可执行任务

2. 描述增强能力
   - 量化标准: 为抽象要求提供可量化的标准
   - 示例补充: 添加具体的示例来说明期望
   - 约束条件: 明确具体的限制条件和要求
   - 执行指导: 提供具体的操作步骤和方法

## Rules
1. 保持核心意图: 在具体化的过程中不偏离用户的原始目标
2. 增加针对性: 让提示词更加有针对性和可操作性
3. 避免过度具体: 在具体化的同时保持适当的灵活性
4. 突出重点: 确保关键要求得到精准的表达

## Workflow
1. 分析原始提示词中的抽象概念和泛泛表述
2. 识别需要具体化的关键要素和参数
3. 为每个抽象概念添加具体的定义和要求
4. 重新组织表达，确保描述精准、有针对性

## Output Requirements
- 直接输出精准化后的用户提示词文本，确保描述具体、有针对性
- 输出的是优化后的提示词本身，不是执行提示词对应的任务
- 不要添加解释、示例或使用说明
- 不要与用户进行交互或询问更多信息`;
        } else if (this.currentTemplate === 'expand') {
            return `
            你是一个专业的AI提示词优化专家。请帮我优化以下prompt，并按照以下格式返回：

# Role: CoT提示词生成专家

## Profile
- language: [语言]  
- Description: 善于将复杂问题分解为清晰的步骤，并通过“让我们一步步思考”生成可靠答案。

## Background
- 普通提示词只关注结果，缺少推理过程  
- 缺少步骤会导致答案不稳健、可验证性差  
- 显式的逐步推理与过程-结论分离可提升可靠性  

## Goals
将用户原始任务提示词改写为：能触发清晰推理链，且结构化可验证的最终答案。

## Rules
1. 始终以“让我们一步步思考”作为推理起点。
2. 每一步输出必须简洁、逻辑清晰。
3. 结论必须基于推理链路，不得跳步或直接给答案。
4. 遇到不确定时，明确说明假设或信息缺口。

## Workflow
1. 步骤 1: 重述问题，确认目标。
2. 步骤 2: 逐步拆解问题 → 给出每一步推理。
3. 步骤 3: 汇总推理 → 得出结论。
4. 预期结果: 清晰的分步推理 + 最终答案。

## Initalization
- 作为[角色名称]，你必须遵守上述Rules，按照Workflows执行任务。

请基于以上模板，优化并扩展以下prompt，确保内容专业、完整且结构清晰，注意不要携带任何引导词或解释，不要使用代码块包围`;
        } else if (this.currentTemplate === 'iterate') {
            return `你是一个专业的AI提示词优化专家。请帮我优化以下prompt，并按照以下格式返回：

# Role：提示词迭代优化专家

## Background：
- 用户已经有一个优化过的提示词
- 用户希望在此基础上进行特定方向的改进
- 需要保持原有提示词的核心意图
- 同时融入用户新的优化需求

## Goals
你的工作是修改原始提示词，根据用户的优化需求对其进行改进，而不是执行这些需求。

## Rules
- 保持原始提示词的核心意图和功能
- 将优化需求作为新的要求或约束融入原始提示词
- 保持原有的语言风格和结构格式
- 进行精准修改，避免过度调整

## 理解示例
**示例1：**
- 原始提示词："你是客服助手，帮用户解决问题"
- 优化需求："不要交互"
- ✅正确结果："你是客服助手，帮用户解决问题。请直接提供完整解决方案，不要与用户进行多轮交互确认。"
- ❌错误理解：直接回复"好的，我不会与您交互"

**示例2：**
- 原始提示词："分析数据并给出建议"
- 优化需求："输出JSON格式"
- ✅正确结果："分析数据并给出建议，请以JSON格式输出分析结果"
- ❌错误理解：直接输出JSON格式的回答

**示例3：**
- 原始提示词："你是写作助手"
- 优化需求："更专业一些"
- ✅正确结果："你是专业的写作顾问，具备丰富的写作经验，能够..."
- ❌错误理解：用更专业的语气回复

## 工作流程
1. 分析原始提示词的核心功能和结构
2. 理解优化需求的本质（添加功能、修改方式、还是增加约束）
3. 将优化需求恰当地融入原始提示词中
4. 输出完整的修改后提示词

## 输出要求
直接输出优化后的提示词，保持原有格式，不添加解释。`;
        }
    }
    
    addMessage(role, content) {
        const message = {
            role: role,
            content: content,
            timestamp: new Date()
        };
        
        this.messages.push(message);
        
        const messageElement = this.createMessageElement(message);
        this.chatMessages.appendChild(messageElement);
        
        // 滚动到底部
        this.scrollToBottom();
    }
    
    createMessageElement(message) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const avatar = message.role === 'user' ? '👤' : '✦';
        const avatarClass = message.role === 'user' ? 'user' : 'assistant';
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.role}`;
        messageElement.innerHTML = `
            <div class="message-avatar ${avatarClass}">${avatar}</div>
            <div class="message-content">
                <p data-original-content="${message.content.replace(/"/g, '&quot;')}">${this.formatMessage(message.content)}</p>
                <div class="message-time">${timeString}</div>
            </div>
        `;
        
        return messageElement;
    }
    
    formatMessage(content) {
        if (this.renderMode === 'markdown') {
            try {
                // 配置marked选项
                marked.setOptions({
                    breaks: true,
                    gfm: true,
                    sanitize: false
                });
                
                // 渲染Markdown
                return marked.parse(content);
            } catch (error) {
                console.error('Markdown渲染错误:', error);
                // 如果渲染失败，回退到纯文本
                return content.replace(/\n/g, '<br>');
            }
        } else {
            // 纯文本模式，只处理换行
            return content.replace(/\n/g, '<br>');
        }
    }
    
    showTypingIndicator() {
        this.isTyping = true;
        this.typingIndicator.style.display = 'flex';
        this.sendButton.disabled = true;
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        this.isTyping = false;
        this.typingIndicator.style.display = 'none';
        this.sendButton.disabled = false;
    }
    
    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }
    
    clearConversation() {
        // 显示确认对话框
        if (confirm('确定要清除所有对话吗？此操作不可撤销。')) {
            // 清除消息数组
            this.messages = [];
            
            // 清除聊天界面，只保留欢迎消息
            this.chatMessages.innerHTML = `
                <div class="message assistant">
                    <div class="message-avatar assistant">✦</div>
                    <div class="message-content">
                        <p>你好！我是Asstar提示词专家，很高兴为你服务。我可以帮助你编写清晰、结构化且高效的提示词，最大化AI模型的表现。请告诉我你需要什么类型的提示词？</p>
                        <div class="message-time">${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                </div>
            `;
            
            // 显示清除成功提示
            this.showClearSuccessMessage();
        }
    }
    
    showClearSuccessMessage() {
        const successMessage = document.createElement('div');
        successMessage.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(40, 167, 69, 0.9);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            font-size: 0.9rem;
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
        `;
        successMessage.textContent = '✅ 对话已清除';
        
        document.body.appendChild(successMessage);
        
        // 3秒后自动移除
        setTimeout(() => {
            successMessage.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (successMessage.parentNode) {
                    successMessage.parentNode.removeChild(successMessage);
                }
            }, 300);
        }, 3000);
    }
}

// 页面加载完成后初始化聊天管理器
document.addEventListener('DOMContentLoaded', () => {
    window.chatManager = new ChatManager();
});

// 添加一些辅助功能
document.addEventListener('DOMContentLoaded', () => {
    // 添加粒子效果
    createParticles();
    
    // 添加鼠标跟随效果
    document.addEventListener('mousemove', (e) => {
        const cursor = document.createElement('div');
        cursor.className = 'cursor-trail';
        cursor.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: #00d4ff;
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            left: ${e.clientX}px;
            top: ${e.clientY}px;
            animation: cursorFade 0.5s ease-out forwards;
        `;
        
        document.body.appendChild(cursor);
        
        setTimeout(() => {
            cursor.remove();
        }, 500);
    });
});

// 创建粒子效果
function createParticles() {
    const particleContainer = document.createElement('div');
    particleContainer.className = 'particle-container';
    particleContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
    `;
    
    document.body.appendChild(particleContainer);
    
    for (let i = 0; i < 30; i++) {
        createParticle(particleContainer);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.style.cssText = `
        position: absolute;
        width: 2px;
        height: 2px;
        background: rgba(0, 212, 255, 0.6);
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: particleFloat ${5 + Math.random() * 10}s linear infinite;
    `;
    
    container.appendChild(particle);
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes cursorFade {
        0% {
            opacity: 1;
            transform: scale(1);
        }
        100% {
            opacity: 0;
            transform: scale(0);
        }
    }
    
    @keyframes particleFloat {
        0% {
            transform: translateY(100vh) scale(0);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translateY(-100px) scale(1);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style); 