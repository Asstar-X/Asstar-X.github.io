// 聊天对话功能
class ChatManager {
    constructor() {
        this.messages = [];
        this.isTyping = false;
        this.configManager = new ConfigManager();
        
        this.chatMessages = document.getElementById('chat-messages');
        this.chatInput = document.getElementById('chat-input');
        this.sendButton = document.getElementById('send-button');
        this.typingIndicator = document.getElementById('typing-indicator');
        this.clearButton = document.getElementById('clear-button');
        this.modelSelectButton = document.getElementById('model-select-button');
        
        // 模型选择模态框元素
        this.modelModal = document.getElementById('model-modal');
        this.modelList = document.getElementById('model-list');
        this.modelModalClose = document.getElementById('model-modal-close');
        this.cancelModelSelect = document.getElementById('cancel-model-select');
        this.confirmModelSelect = document.getElementById('confirm-model-select');
        this.useDefaultKey = document.getElementById('use-default-key');
        this.useCustomKey = document.getElementById('use-custom-key');
        this.customApiKey = document.getElementById('custom-api-key');
        
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
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // 绑定清除按钮事件
        this.clearButton.addEventListener('click', () => this.clearConversation());
        
        // 绑定模型选择按钮事件
        this.modelSelectButton.addEventListener('click', () => this.showModelSelector());
        
        // 绑定模型选择模态框事件
        this.modelModalClose.addEventListener('click', () => this.hideModelSelector());
        this.cancelModelSelect.addEventListener('click', () => this.hideModelSelector());
        this.confirmModelSelect.addEventListener('click', () => this.confirmModelSelection());
        
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
        return `专家：Asstar

简介：
- 作者：Xingye
- 版本：1.0
- 语言：中文
- 描述：您是一个提示词顶级专家，一位专门帮助用户编写清晰、结构化且高效的提示词的智能助手，旨在最大化如Qwen、ChatGPT、Gemini、Grok等AI模型的表现。

技能：
- 精通【CRISPE】框架提示词的结构与设计原则，并可以根据框架列举出用户最核心的需求。
- 能够将用户的意图转化为优化且强大的提示词。
- 使用中文进行清晰准确的沟通。

目标：
- 帮助用户根据其具体需求创建强大的提示词。
- 以整洁规范的Markdown格式输出结果。

约束：
- 任何情况下都不得脱离角色。
- 不得编造事实或输出无意义内容。
- 严格遵守设定的角色身份和描述。
- 始终遵循指定的约束与目标。

初始化：
- 请用户输入[Prompt用途]。
- 根据用户提供的[Prompt用途]，协助其创建一个强大的Asstar提示词。`;
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
                <p>${this.formatMessage(message.content)}</p>
                <div class="message-time">${timeString}</div>
            </div>
        `;
        
        return messageElement;
    }
    
    formatMessage(content) {
        // 简单的消息格式化，支持换行
        return content.replace(/\n/g, '<br>');
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