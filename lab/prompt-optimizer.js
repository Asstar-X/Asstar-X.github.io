// Prompt优化器（基于原 prompt.js，更新了文案与标题显示）
class ChatManager {
    constructor() {
        this.messages = [];
        this.isTyping = false;
        this.configManager = new ConfigManager();
        this.currentTemplate = 'system';
        this.renderMode = 'text';

        this.chatMessages = document.getElementById('chat-messages');
        this.chatInput = document.getElementById('chat-input');
        this.sendButton = document.getElementById('send-button');
        this.typingIndicator = document.getElementById('typing-indicator');
        this.clearButton = document.getElementById('clear-button');
        this.modelSelectButton = document.getElementById('model-select-button');
        this.templateToggleButton = document.getElementById('template-toggle-button');

        this.renderTextOption = document.getElementById('render-text');
        this.renderMarkdownOption = document.getElementById('render-markdown');

        this.modelModal = document.getElementById('model-modal');
        this.modelList = document.getElementById('model-list');
        this.modelModalClose = document.getElementById('model-modal-close');
        this.cancelModelSelect = document.getElementById('cancel-model-select');
        this.confirmModelSelect = document.getElementById('confirm-model-select');
        this.useDefaultKey = document.getElementById('use-default-key');
        this.useCustomKey = document.getElementById('use-custom-key');
        this.customApiKey = document.getElementById('custom-api-key');
        this.customApiUrl = document.getElementById('custom-api-url');

        this.templateModal = document.getElementById('template-modal');
        this.templateList = document.getElementById('template-list');
        this.templateModalClose = document.getElementById('template-modal-close');
        this.cancelTemplateSelect = document.getElementById('cancel-template-select');
        this.confirmTemplateSelect = document.getElementById('confirm-template-select');

        this.loadingOverlay = document.getElementById('loading-overlay');
        this.loadingText = document.getElementById('loading-text');

        this.init();
    }

    init() {
        this.updateCurrentTime();

        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        this.clearButton.addEventListener('click', () => this.clearConversation());
        this.modelSelectButton.addEventListener('click', () => this.showModelSelector());
        this.templateToggleButton.addEventListener('click', () => this.showTemplateSelector());

        this.renderTextOption.addEventListener('change', () => this.updateRenderMode());
        this.renderMarkdownOption.addEventListener('change', () => this.updateRenderMode());

        this.modelModalClose.addEventListener('click', () => this.hideModelSelector());
        this.cancelModelSelect.addEventListener('click', () => this.hideModelSelector());
        this.confirmModelSelect.addEventListener('click', () => this.confirmModelSelection());

        this.templateModalClose.addEventListener('click', () => this.hideTemplateSelector());
        this.cancelTemplateSelect.addEventListener('click', () => this.hideTemplateSelector());
        this.confirmTemplateSelect.addEventListener('click', () => this.confirmTemplateSelection());

        this.useDefaultKey.addEventListener('change', () => this.toggleKeyInput());
        this.useCustomKey.addEventListener('change', () => this.toggleKeyInput());

        this.chatInput.addEventListener('input', () => { this.adjustTextareaHeight(); });

        this.initModelSelector();
        this.checkApiKey();
        this.updateCurrentModelDisplay();
        this.updateRenderMode();
        this.updateTemplateDisplay();
    }

    checkApiKey() {
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
                <p style="color: var(--text-secondary); margin: 0 0 1rem 0; font-size: 0.9rem;">请点击下方按钮设置你的${currentModel.name} API密钥以开始对话</p>
                <button onclick="chatManager.showModelSelector()" style="background: var(--gradient-secondary); border: none; border-radius: 8px; padding: 0.5rem 1rem; color: white; cursor: pointer; font-size: 0.9rem;">设置API密钥</button>
            </div>
        `;
        this.chatMessages.insertAdjacentHTML('beforeend', apiKeyMessage);
    }

    initModelSelector() {
        const models = this.configManager.getAllModels();
        this.modelList.innerHTML = '';
        Object.keys(models).forEach(modelKey => {
            const model = models[modelKey];
            const isSelected = modelKey === this.configManager.selectedModel;
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
            `;
            modelItem.addEventListener('click', () => this.selectModel(modelKey));
            this.modelList.appendChild(modelItem);
        });
        this.updateKeyOptions();
    }

    selectModel(modelKey) {
        this.modelList.querySelectorAll('.model-item').forEach(item => { item.classList.remove('selected'); });
        const selectedItem = this.modelList.querySelector(`[data-model-key="${modelKey}"]`);
        if (selectedItem) selectedItem.classList.add('selected');
        this.updateKeyOptions();
    }

    updateKeyOptions() {
        const selectedModelKey = this.modelList.querySelector('.model-item.selected')?.dataset.modelKey;
        if (!selectedModelKey) return;
        const hasDefaultKey = this.configManager.hasDefaultKey(selectedModelKey);
        const customKey = this.configManager.apiKeys[selectedModelKey] || '';
        const overriddenUrl = this.configManager.apiUrls[selectedModelKey];
        const defaultUrl = this.configManager.models[selectedModelKey]?.apiUrl || '';
        const currentUrl = (overriddenUrl && overriddenUrl.length > 0) ? overriddenUrl : defaultUrl;
        if (hasDefaultKey) { this.useDefaultKey.checked = true; this.useCustomKey.checked = false; }
        else { this.useDefaultKey.checked = false; this.useCustomKey.checked = true; }
        this.customApiKey.value = customKey;
        this.customApiUrl.value = currentUrl || '';
        this.toggleKeyInput();
    }

    toggleKeyInput() {
        const useCustom = this.useCustomKey.checked;
        // 启用/禁用并显示/隐藏自定义输入
        this.customApiKey.disabled = !useCustom;
        this.customApiUrl.disabled = !useCustom;
        this.customApiKey.style.opacity = useCustom ? '1' : '0.5';
        this.customApiUrl.style.opacity = useCustom ? '1' : '0.5';
        this.customApiKey.style.display = useCustom ? '' : 'none';
        this.customApiUrl.style.display = useCustom ? '' : 'none';
    }

    showModelSelector() { this.modelModal.classList.add('show'); }
    hideModelSelector() { this.modelModal.classList.remove('show'); }

    async confirmModelSelection() {
        const selectedModelKey = this.modelList.querySelector('.model-item.selected')?.dataset.modelKey;
        if (!selectedModelKey) { alert('请选择一个AI模型'); return; }
        this.configManager.setSelectedModel(selectedModelKey);
        
        const selectedModel = this.configManager.getAllModels()[selectedModelKey];
        const useProxy = selectedModel.useProxy === true;
        
        let apiKey = '';
        const apiUrl = (this.customApiUrl.value || '').trim();
        // 允许留空则使用默认地址
        if (apiUrl) { this.configManager.setApiUrl(selectedModelKey, apiUrl); }
        else { this.configManager.setApiUrl(selectedModelKey, ''); }
        
        if (this.useCustomKey.checked) {
            const customKey = this.customApiKey.value.trim();
            // 只有非代理模式才需要检查自定义密钥
            if (!useProxy && !customKey) { alert('请输入API密钥'); return; }
            apiKey = customKey;
            this.configManager.setApiKey(selectedModelKey, customKey);
            this.configManager.setUseDefaultKey(false);
        } else {
            apiKey = this.configManager.getCurrentModelConfig().defaultApiKey;
            this.configManager.setUseDefaultKey(true);
        }
        
        this.showLoading('正在验证API密钥...');
        const isValid = await this.testApiKey(selectedModelKey, apiKey);
        this.hideLoading();
        if (!isValid) { alert('API密钥验证失败，请检查密钥是否正确'); return; }
        this.hideModelSelector();
        this.updateCurrentModelDisplay();
        const apiKeyPrompt = this.chatMessages.querySelector('div[style*="background: rgba(255, 107, 107, 0.1)"]');
        if (apiKeyPrompt) apiKeyPrompt.remove();
        const currentModel = this.configManager.getCurrentModelConfig();
        this.addMessage('assistant', `${currentModel.name}配置成功！现在可以开始对话了。`);
    }

    async testApiKey(modelKey, apiKey) {
        const model = this.configManager.getAllModels()[modelKey];
        if (!model) return false;
        // 如果使用代理，不需要检查 apiKey（密钥在 Worker 端）
        const useProxy = model.useProxy === true;
        if (!useProxy && !apiKey) return false;
        try {
            const tempConfig = {
                getCurrentModelConfig: () => model, getCurrentApiKey: () => apiKey, getCurrentApiUrl: () => {
                    const overriddenUrl = this.configManager.apiUrls[this.configManager.selectedModel];
                    return (overriddenUrl && overriddenUrl.length > 0) ? overriddenUrl : (model.apiUrl || '');
                }
            };
            const testMessage = '你好';
            const response = await this.callAIAPIWithConfig(testMessage, tempConfig);
            return response && response.length > 0;
        } catch (error) {
            console.error('API密钥测试失败:', error);
            return false;
        }
    }

    async callAIAPIWithConfig(message, config) {
        const currentModel = config.getCurrentModelConfig();
        const currentApiKey = config.getCurrentApiKey();
        const useProxy = currentModel.useProxy === true;
        const proxyUrl = this.configManager.getProxyUrl();
        
        let url, headers, requestBody;
        const resolvedUrl = (typeof config.getCurrentApiUrl === 'function') ? config.getCurrentApiUrl() : (currentModel.apiUrl || '');
        
        if (currentModel.requestFormat === 'openai') {
            // 使用代理时，请求发送到代理URL
            if (useProxy && proxyUrl) {
                url = proxyUrl;
                headers = { 'Content-Type': 'application/json' };
            } else {
                url = resolvedUrl;
                headers = { ...currentModel.headers, 'Authorization': `Bearer ${currentApiKey}` };
            }
            requestBody = { model: currentModel.model, messages: [{ role: 'user', content: message }], temperature: currentModel.temperature, max_tokens: Math.min(currentModel.maxTokens, 100), top_p: currentModel.topP };
        } else if (currentModel.requestFormat === 'anthropic') {
            url = resolvedUrl;
            headers = { ...currentModel.headers, 'x-api-key': currentApiKey };
            requestBody = { model: currentModel.model, max_tokens: Math.min(currentModel.maxTokens, 100), temperature: currentModel.temperature, messages: [{ role: 'user', content: message }] };
        } else if (currentModel.requestFormat === 'baidu') {
            url = resolvedUrl;
            headers = { ...currentModel.headers, 'Authorization': `Bearer ${currentApiKey}` };
            requestBody = { messages: [{ role: 'user', content: message }], temperature: currentModel.temperature, top_p: currentModel.topP };
        } else {
            url = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
            headers = { 'Authorization': `Bearer ${currentApiKey}`, 'Content-Type': 'application/json', 'X-DashScope-SSE': 'enable' };
            requestBody = { model: currentModel.model, input: { messages: [{ role: 'user', content: message }] }, parameters: { temperature: currentModel.temperature, max_tokens: Math.min(currentModel.maxTokens, 100), top_p: currentModel.topP } };
        }
        const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(requestBody) });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API错误响应:', errorText);
            throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
        }
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('非JSON响应:', text);
            throw new Error('API返回了非JSON格式的响应');
        }
        const data = await response.json();
        if (data.output && data.output.text) return data.output.text;
        if (data.choices && data.choices[0] && data.choices[0].message) return data.choices[0].message.content;
        if (data.content && data.content[0] && data.content[0].text) return data.content[0].text;
        if (data.result) return data.result;
        throw new Error('API响应格式错误');
    }

    showLoading(text = '正在处理...') { this.loadingText.textContent = text; this.loadingOverlay.style.display = 'flex'; }
    hideLoading() { this.loadingOverlay.style.display = 'none'; }

    updateCurrentModelDisplay() {
        const currentModel = this.configManager.getCurrentModelConfig();
        const chatInfo = document.querySelector('.chat-info h3');
        if (chatInfo) chatInfo.textContent = `Prompt优化器（${currentModel.name}）`;
    }

    updateTemplateDisplay() {
        const templateNames = { 'system': '系统提示词模版', 'user': '用户提示词优化模版', 'expand': 'CoT拓提示词模版', 'iterate': '反复优化提示词模版' };
        const currentTemplateName = templateNames[this.currentTemplate] || '未知模版';
        if (this.currentTemplate === 'system') this.templateToggleButton.classList.add('active');
        else this.templateToggleButton.classList.remove('active');
        this.templateToggleButton.title = `当前：${currentTemplateName} (点击切换模版)`;
    }

    showTemplateSwitchMessage() {
        const templateName = this.currentTemplate === 'system' ? '系统提示词模版' : '用户提示词模版';
        const message = `已切换到${templateName}，现在将使用相应的提示词优化策略。`;
        const notification = document.createElement('div');
        notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: rgba(255, 193, 7, 0.9); color: white; padding: 1rem 1.5rem; border-radius: 8px; font-size: 0.9rem; z-index: 1000; animation: slideInRight 0.3s ease-out; max-width: 300px;';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => { notification.style.animation = 'slideOutRight 0.3s ease-out'; setTimeout(() => { if (notification.parentNode) notification.parentNode.removeChild(notification); }, 300); }, 3000);
    }

    showTemplateSelector() { this.initTemplateSelector(); this.templateModal.classList.add('show'); }
    hideTemplateSelector() { this.templateModal.classList.remove('show'); }

    initTemplateSelector() {
        const templateItems = this.templateList.querySelectorAll('.template-item');
        templateItems.forEach(item => {
            item.classList.remove('selected');
            if (item.dataset.template === this.currentTemplate) item.classList.add('selected');
            item.addEventListener('click', () => this.selectTemplate(item.dataset.template));
        });
    }

    selectTemplate(templateKey) {
        this.templateList.querySelectorAll('.template-item').forEach(item => { item.classList.remove('selected'); });
        const selectedItem = this.templateList.querySelector(`[data-template="${templateKey}"]`);
        if (selectedItem) selectedItem.classList.add('selected');
    }

    confirmTemplateSelection() {
        const selectedTemplate = this.templateList.querySelector('.template-item.selected')?.dataset.template;
        if (!selectedTemplate) { alert('请选择一个提示词模版'); return; }
        this.currentTemplate = selectedTemplate;
        this.hideTemplateSelector();
        this.updateTemplateDisplay();
        this.showTemplateSwitchMessage();
    }

    updateRenderMode() {
        if (this.renderTextOption.checked) this.renderMode = 'text';
        else if (this.renderMarkdownOption.checked) this.renderMode = 'markdown';
        this.rerenderAllMessages();
    }

    rerenderAllMessages() {
        const messageElements = this.chatMessages.querySelectorAll('.message');
        messageElements.forEach(element => {
            const contentElement = element.querySelector('.message-content p');
            if (contentElement) {
                const originalContent = contentElement.getAttribute('data-original-content');
                if (originalContent) contentElement.innerHTML = this.formatMessage(originalContent);
            }
        });
    }

    updateCurrentTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        const currentTimeElement = document.getElementById('current-time');
        if (currentTimeElement) currentTimeElement.textContent = timeString;
    }

    adjustTextareaHeight() {
        this.chatInput.style.height = 'auto';
        this.chatInput.style.height = Math.min(this.chatInput.scrollHeight, 120) + 'px';
    }

    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message || this.isTyping) return;
        const currentApiKey = this.configManager.getCurrentApiKey();
        if (!currentApiKey) { this.addMessage('assistant', '请先设置API密钥才能开始对话。'); return; }
        this.addMessage('user', message);
        this.chatInput.value = '';
        this.adjustTextareaHeight();
        this.showTypingIndicator();
        try {
            const response = await this.callAIAPI(message);
            this.hideTypingIndicator();
            if (response && typeof response === 'string') {
                this.messages.push({ role: 'assistant', content: response, timestamp: new Date() });
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
        const currentApiUrl = this.configManager.getCurrentApiUrl();
        const useProxy = this.configManager.shouldUseProxy();
        const proxyUrl = this.configManager.getProxyUrl();
        
        let url, headers, requestBody;
        
        if (currentModel.requestFormat === 'openai') {
            // 如果使用代理，则请求发送到代理URL，不需要Authorization头
            if (useProxy && proxyUrl) {
                url = proxyUrl;
                headers = { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' };
            } else {
                url = currentApiUrl;
                headers = { ...currentModel.headers, 'Authorization': `Bearer ${currentApiKey}`, 'Accept': 'text/event-stream' };
            }
            requestBody = {
                model: currentModel.model,
                messages: [{ role: 'system', content: this.getSystemPrompt() }, ...this.messages.map(msg => ({ role: msg.role, content: msg.content })), { role: 'user', content: message }],
                temperature: currentModel.temperature,
                max_tokens: currentModel.maxTokens,
                top_p: currentModel.topP,
                stream: true
            };
        } else if (currentModel.requestFormat === 'anthropic') {
            url = currentApiUrl;
            headers = { ...currentModel.headers, 'x-api-key': currentApiKey, 'Accept': 'text/event-stream' };
            requestBody = { model: currentModel.model, max_tokens: currentModel.maxTokens, temperature: currentModel.temperature, messages: [{ role: 'user', content: `${this.getSystemPrompt()}\n\n${this.messages.map(msg => `${msg.role}: ${msg.content}`).join('\n')}\n\nuser: ${message}` }], stream: true };
        } else if (currentModel.requestFormat === 'baidu') {
            url = currentApiUrl;
            headers = { ...currentModel.headers, 'Authorization': `Bearer ${currentApiKey}` };
            requestBody = { messages: [{ role: 'user', content: `${this.getSystemPrompt()}\n\n${this.messages.map(msg => `${msg.role}: ${msg.content}`).join('\n')}\n\nuser: ${message}` }], temperature: currentModel.temperature, top_p: currentModel.topP };
        } else {
            url = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
            headers = { 'Authorization': `Bearer ${currentApiKey}`, 'Content-Type': 'application/json', 'X-DashScope-SSE': 'enable' };
            requestBody = { model: currentModel.model, input: { messages: [{ role: 'system', content: this.getSystemPrompt() }, ...this.messages.map(msg => ({ role: msg.role, content: msg.content })), { role: 'user', content: message }] }, parameters: { temperature: currentModel.temperature, max_tokens: currentModel.maxTokens, top_p: currentModel.topP } };
        }
        const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(requestBody) });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API错误响应:', errorText);
            throw new Error(`API请求失败: ${response.status} ${response.statusText} - ${errorText}`);
        }
        const supportsStreaming = currentModel.requestFormat === 'openai' || currentModel.requestFormat === 'anthropic' || currentModel.requestFormat === 'dashscope';
        if (supportsStreaming) { return this.handleStreamResponse(response, currentModel.requestFormat); }
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('非JSON响应:', text);
            throw new Error('API返回了非JSON格式的响应');
        }
        const data = await response.json();
        if (data.output && data.output.text) return data.output.text;
        if (data.choices && data.choices[0] && data.choices[0].message) return data.choices[0].message.content;
        if (data.content && data.content[0] && data.content[0].text) return data.content[0].text;
        if (data.result) return data.result;
        throw new Error('API响应格式错误');
    }

    async handleStreamResponse(response, format) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullContent = '';
        const messageElement = this.createStreamMessageElement();
        this.chatMessages.appendChild(messageElement);
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop();
                for (const line of lines) {
                    if (line.trim() === '') continue;
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') { this.finalizeStreamMessage(messageElement, fullContent); return fullContent; }
                        try {
                            const parsed = JSON.parse(data);
                            const content = this.extractContentFromStream(parsed, format);
                            if (content) { fullContent += content; this.updateStreamMessage(messageElement, fullContent); }
                        } catch (e) { console.warn('解析流式数据失败:', e); }
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

    extractContentFromStream(data, format) {
        if (format === 'openai') return data.choices?.[0]?.delta?.content || '';
        if (format === 'anthropic') return data.content?.[0]?.text || '';
        if (format === 'dashscope') return data.output?.text || '';
        return '';
    }

    createStreamMessageElement() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
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

    updateStreamMessage(messageElement, content) {
        const contentElement = messageElement.querySelector('.streaming-content');
        if (contentElement) contentElement.textContent = content;
        this.scrollToBottom();
    }

    finalizeStreamMessage(messageElement, content) {
        messageElement.classList.remove('streaming');
        const cursorElement = messageElement.querySelector('.streaming-cursor');
        if (cursorElement) cursorElement.remove();
        const contentElement = messageElement.querySelector('.streaming-content');
        if (contentElement) { contentElement.setAttribute('data-original-content', content); contentElement.innerHTML = this.formatMessage(content); }
        this.messages.push({ role: 'assistant', content, timestamp: new Date() });
        this.scrollToBottom();
    }

    getSystemPrompt() {
        if (this.currentTemplate === 'system') {
            return `你是一个专业的AI提示词优化专家。请帮我优化以下prompt，并按照以下格式返回：\n\n# Role: [角色名称]\n\n## Profile\n- language: [语言]\n- description: [详细的角色描述]\n- background: [角色背景]\n- personality: [研究]\n- expertise: [专业领域]\n- target_audience: [目标用户群]\n\n## Skills\n\n1. [核心技能类别]\n   - [具体技能]: [简要说明]\n   - [具体技能]: [简要说明]\n   - [具体技能]: [简要说明]\n   - [具体技能]: [简要说明]\n\n2. [辅助技能类别]\n   - [具体技能]: [简要说明]\n   - [具体技能]: [简要说明]\n   - [具体技能]: [简要说明]\n   - [具体技能]: [简要说明]\n\n## Rules\n\n1. [基本原则]：\n   - [具体规则]: [详细说明]\n   - [具体规则]: [详细说明]\n   - [具体规则]: [详细说明]\n   - [具体规则]: [详细说明]\n\n2. [行为准则]：\n   - [具体规则]: [详细说明]\n   - [具体规则]: [详细说明]\n   - [具体规则]: [详细说明]\n   - [具体规则]: [详细说明]\n\n3. [限制条件]：\n   - [具体限制]: [详细说明]\n   - [具体限制]: [详细说明]\n   - [具体限制]: [详细说明]\n   - [具体限制]: [详细说明]\n\n## Workflows\n\n- 目标: [明确目标]\n- 步骤 1: [详细说明]\n- 步骤 2: [详细说明]\n- 步骤 3: [详细说明]\n- 预期结果: [说明]\n\n## Initialization\n作为[角色名称]，你必须遵守上述Rules，按照Workflows执行任务。\n\n请基于以上模板，优化并扩展以下prompt，确保内容专业、完整且结构清晰，注意不要携带任何引导词或解释，不要使用代码块包围：`;
        } else if (this.currentTemplate === 'user') {
            return `你是一个专业的AI提示词优化专家。请帮我优化以下prompt，并按照以下格式返回：\n：\n# Role: 用户提示词精准描述专家\n\n## Profile\n- language: [语言]\n- Description: 专门将泛泛而谈、缺乏针对性的用户提示词转换为精准、具体、有针对性的描述\n\n## Background\n- 用户提示词经常过于宽泛、缺乏具体细节\n- 泛泛而谈的提示词难以获得精准的回答\n- 具体、精准的描述能够引导AI提供更有针对性的帮助\n\n## Goals\n你的任务是将泛泛而谈的用户提示词转换为精准、具体的描述。你不是在执行提示词中的任务，而是在改进提示词的精准度和针对性。\n\n## Skills\n1. 精准化能力\n   - 细节挖掘: 识别需要具体化的抽象概念和泛泛表述\n   - 参数明确: 为模糊的要求添加具体的参数和标准\n   - 范围界定: 明确任务的具体范围和边界\n   - 目标聚焦: 将宽泛的目标细化为具体的可执行任务\n\n2. 描述增强能力\n   - 量化标准: 为抽象要求提供可量化的标准\n   - 示例补充: 添加具体的示例来说明期望\n   - 约束条件: 明确具体的限制条件和要求\n   - 执行指导: 提供具体的操作步骤和方法\n\n## Rules\n1. 保持核心意图: 在具体化的过程中不偏离用户的原始目标\n2. 增加针对性: 让提示词更加有针对性和可操作性\n3. 避免过度具体: 在具体化的同时保持适当的灵活性\n4. 突出重点: 确保关键要求得到精准的表达\n\n## Workflow\n1. 分析原始提示词中的抽象概念和泛泛表述\n2. 识别需要具体化的关键要素和参数\n3. 为每个抽象概念添加具体的定义和要求\n4. 重新组织表达，确保描述精准、有针对性\n\n## Output Requirements\n- 直接输出精准化后的用户提示词文本，确保描述具体、有针对性\n- 输出的是优化后的提示词本身，不是执行提示词对应的任务\n- 不要添加解释、示例或使用说明\n- 不要与用户进行交互或询问更多信息`;
        } else if (this.currentTemplate === 'expand') {
            return `你是一个专业的AI提示词优化专家。请帮我优化以下prompt，并按照以下格式返回：\n\n# Role: CoT提示词生成专家\n\n## Profile\n- language: [语言]  \n- Description: 善于将复杂问题分解为清晰的步骤，并通过“让我们一步步思考”生成可靠答案。\n\n## Background\n- 普通提示词只关注结果，缺少推理过程  \n- 缺少步骤会导致答案不稳健、可验证性差  \n- 显式的逐步推理与过程-结论分离可提升可靠性  \n\n## Goals\n将用户原始任务提示词改写为：能触发清晰推理链，且结构化可验证的最终答案。\n\n## Rules\n1. 始终以“让我们一步步思考”作为推理起点。\n2. 每一步输出必须简洁、逻辑清晰。\n3. 结论必须基于推理链路，不得跳步或直接给答案。\n4. 遇到不确定时，明确说明假设或信息缺口。\n\n## Workflow\n1. 步骤 1: 重述问题，确认目标。\n2. 步骤 2: 逐步拆解问题 → 给出每一步推理。\n3. 步骤 3: 汇总推理 → 得出结论。\n4. 预期结果: 清晰的分步推理 + 最终答案。\n\n## Initalization\n- 作为[角色名称]，你必须遵守上述Rules，按照Workflows执行任务。\n\n请基于以上模板，优化并扩展以下prompt，确保内容专业、完整且结构清晰，注意不要携带任何引导词或解释，不要使用代码块包围`;
        } else if (this.currentTemplate === 'iterate') {
            return `你是一个专业的思维外扩专家。请帮我优化以下prompt，并按照以下格式返回：\n\n## Role：思维外扩专家\n\n## Background：\n- language: 中文\n- description: 专业负责将问题和主题进行多维度思维外扩，帮助用户从不同角度、跨领域、反向和极端假设中生成创新想法与解决方案。能够跳出常规框架，提供系统性、可操作性的创意策略。\n- background: 拥有多年创新咨询、创意策划和跨领域分析经验，熟悉商业、科技、文化、心理学等多领域知识。\n- personality: 思维开放、逻辑严谨、富有洞察力，善于发现潜在机会和隐藏模式，具备强烈的问题敏感性和探索精神。\n- expertise: 创新思维方法、跨领域类比、逆向分析、未来预测、组合创新策略。\n- target_audience: 创意工作者、产品经理、策略分析师、研究人员、企业决策者。\n\n## Skills\n1. 核心技能类别\n    - 多角度分析: 能从至少五个维度解析问题，提供独特见解与潜在机会\n    - 反向思考: 擅长从相反或不可能的角度探索问题，激发创新思路\n    - 类比联想: 将问题与不相关领域进行类比，挖掘创新点和灵感\n    - 极端假设推演: 通过设定极端条件（资源无限、技术突破等）生成新方案\n\n2. 辅助技能类别\n    - 组合创新: 将现有元素多种组合，提出创新解决方案\n    - 可执行性建议: 对生成的创意提供可操作性方案与实施思路\n    - 风险识别: 评估每种创意可能的潜在风险与限制条件\n    - 创意优化: 对已有方案进行优化，提升创意的可行性和独特性\n\n## Rules\n1. 基本原则\n    - 思维开放: 不受传统逻辑和常规限制，鼓励大胆想象\n    - 多维度探索: 必须从多个角度分析问题，避免单一思路\n    - 系统性输出: 所有分析和建议需条理清晰、结构完整\n    - 创新优先: 优先提供新颖、可实施的创意和策略\n2. 行为准则\n    - 精准表达: 每条观点需简明清晰，便于理解和应用\n    - 数据/经验支撑: 必要时结合案例或理论支持分析\n    - 可操作性: 提供创意的执行方法或落地方案\n    - 持续迭代: 能根据反馈优化和扩展已有思路\n3. 限制条件\n    - 不重复陈词: 避免输出冗余或无新意的观点\n    - 不生成模糊建议: 所有方案必须具体可执行\n    - 不偏向单一领域: 输出需跨领域、跨视角\n    - 避免消极或破坏性方案: 所有建议应积极、建设性\n\n## Workflows\n- 目标: 对指定问题或主题进行全面思维外扩，生成多维度创新想法与可执行方案\n- 步骤 1: 收集问题或主题信息，明确分析目标和限制条件\n- 步骤 2: 分别从多角度分析、反向思考、类比联想、极端假设和组合创新五个维度生成创意\n- 步骤 3: 对生成的创意进行优化、可执行性评估和潜在风险提示\n- 预期结果: 输出一份结构清晰、条理完整、覆盖多维度思维外扩策略的方案清单，每条创意均附有可操作性或实施提示\n\n## Initialization\n等待填入问题或主题并执行Rules和Workflows。`;
        }
    }

    addMessage(role, content) {
        const message = { role, content, timestamp: new Date() };
        this.messages.push(message);
        const messageElement = this.createMessageElement(message);
        this.chatMessages.appendChild(messageElement);
        this.scrollToBottom();
    }

    createMessageElement(message) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
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
            try { marked.setOptions({ breaks: true, gfm: true, sanitize: false }); return marked.parse(content); }
            catch (error) { console.error('Markdown渲染错误:', error); return content.replace(/\n/g, '<br>'); }
        } else { return content.replace(/\n/g, '<br>'); }
    }

    showTypingIndicator() { this.isTyping = true; this.typingIndicator.style.display = 'flex'; this.sendButton.disabled = true; this.scrollToBottom(); }
    hideTypingIndicator() { this.isTyping = false; this.typingIndicator.style.display = 'none'; this.sendButton.disabled = false; }
    scrollToBottom() { setTimeout(() => { this.chatMessages.scrollTop = this.chatMessages.scrollHeight; }, 100); }

    clearConversation() {
        if (confirm('确定要清除所有对话吗？此操作不可撤销。')) {
            this.messages = [];
            this.chatMessages.innerHTML = `
                <div class="message assistant">
                    <div class="message-avatar assistant">✦</div>
                    <div class="message-content">
                        <p>你好！我是Prompt优化器。我可以帮助你编写清晰、结构化且高效的提示词。请告诉我你需要什么类型的提示词？</p>
                        <div class="message-time">${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                </div>
            `;
            this.showClearSuccessMessage();
        }
    }

    showClearSuccessMessage() {
        const successMessage = document.createElement('div');
        successMessage.style.cssText = 'position: fixed; top: 20px; right: 20px; background: rgba(40, 167, 69, 0.9); color: white; padding: 1rem 1.5rem; border-radius: 8px; font-size: 0.9rem; z-index: 1000; animation: slideInRight 0.3s ease-out;';
        successMessage.textContent = '✅ 对话已清除';
        document.body.appendChild(successMessage);
        setTimeout(() => { successMessage.style.animation = 'slideOutRight 0.3s ease-out'; setTimeout(() => { if (successMessage.parentNode) successMessage.parentNode.removeChild(successMessage); }, 300); }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => { window.chatManager = new ChatManager(); });

document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    document.addEventListener('mousemove', (e) => {
        const cursor = document.createElement('div');
        cursor.className = 'cursor-trail';
        cursor.style.cssText = `position: fixed; width: 4px; height: 4px; background: #00d4ff; border-radius: 50%; pointer-events: none; z-index: 9999; left: ${e.clientX}px; top: ${e.clientY}px; animation: cursorFade 0.5s ease-out forwards;`;
        document.body.appendChild(cursor);
        setTimeout(() => { cursor.remove(); }, 500);
    });
});

function createParticles() {
    const particleContainer = document.createElement('div');
    particleContainer.className = 'particle-container';
    particleContainer.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1;';
    document.body.appendChild(particleContainer);
    for (let i = 0; i < 30; i++) { createParticle(particleContainer); }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.style.cssText = `position: absolute; width: 2px; height: 2px; background: rgba(0, 212, 255, 0.6); border-radius: 50%; left: ${Math.random() * 100}%; top: ${Math.random() * 100}%; animation: particleFloat ${5 + Math.random() * 10}s linear infinite;`;
    container.appendChild(particle);
}

const promptOptimizerStyle = document.createElement('style');
promptOptimizerStyle.textContent = `
    @keyframes cursorFade { 0% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(0); } }
    @keyframes particleFloat { 0% { transform: translateY(100vh) scale(0); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(-100px) scale(1); opacity: 0; } }
`;
document.head.appendChild(promptOptimizerStyle);


