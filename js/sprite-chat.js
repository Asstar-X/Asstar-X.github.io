/* Sprite Sprite Interaction & Chat Logic */

(function() {
    const container = document.getElementById('sprite-container');
    if (!container || typeof THREE === 'undefined') return;

    // Sprite Particle Sphere Logic
    const width = 180;
    const height = 180;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 20;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const sphereGeometry = new THREE.SphereGeometry(7, 128, 128);
    const sphereMaterial = new THREE.PointsMaterial({
        size: 0.12,
        color: 0xffffff,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    });

    const count = sphereGeometry.attributes.position.count;
    const colors = [];
    for (let i = 0; i < count; i++) {
        colors.push(1, 1, 1);
    }
    sphereGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const particleSphere = new THREE.Points(sphereGeometry, sphereMaterial);
    scene.add(particleSphere);

    const eyeGroup = new THREE.Group();
    scene.add(eyeGroup);

    const eyeGeo = new THREE.SphereGeometry(0.5, 32, 32);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const archedEyeGeo = new THREE.TorusGeometry(0.6, 0.15, 16, 32, Math.PI);
    
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-1.8, 1, 6.5);
    eyeGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(1.8, 1, 6.5);
    eyeGroup.add(rightEye);

    const earGeo = new THREE.SphereGeometry(1.2, 32, 32);
    const earMat = new THREE.MeshBasicMaterial({ 
        color: 0xffffff, 
        transparent: true, 
        opacity: 0.4,
        blending: THREE.AdditiveBlending 
    });
    
    const leftEar = new THREE.Mesh(earGeo, earMat);
    leftEar.scale.set(0.8, 1.5, 0.8);
    leftEar.position.set(-8, 5, 0);
    scene.add(leftEar);
    
    const rightEar = new THREE.Mesh(earGeo, earMat);
    rightEar.scale.set(0.8, 1.5, 0.8);
    rightEar.position.set(8, 5, 0);
    scene.add(rightEar);

    let time = 0;
    let mouseX = 0;
    let mouseY = 0;
    let isHovered = false;

    container.addEventListener('mouseenter', () => isHovered = true);
    container.addEventListener('mouseleave', () => {
        isHovered = false;
        mouseX = 0;
        mouseY = 0;
    });

    let rect = container.getBoundingClientRect();
    const updateRect = () => {
        rect = container.getBoundingClientRect();
    };
    window.addEventListener('resize', updateRect, { passive: true });
    window.addEventListener('scroll', updateRect, { passive: true });

    window.addEventListener('mousemove', (e) => {
        if (!rect) rect = container.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        mouseX = ((e.clientX - centerX) / window.innerWidth) * 4; 
        mouseY = ((e.clientY - centerY) / window.innerHeight) * 4;
        mouseX = Math.max(-1.5, Math.min(1.5, mouseX));
        mouseY = Math.max(-1.5, Math.min(1.5, mouseY));
    });

    const greetingEl = document.createElement('div');
    greetingEl.className = 'sprite-greeting';
    container.appendChild(greetingEl);

    let isGreeting = false;
    let greetingTimeout = null;

    container.addEventListener('mouseenter', () => {
        if (isGreeting || typeof gsap === 'undefined') return;
        isGreeting = true;

        const reactions = [
            { msg: "(>////<)", eyeScale: { x: 1, y: 0.15 }, color: { r: 1, g: 0.5, b: 0.6 }, shape: 'sphere', personality: '害羞局促，说话变得支支吾吾，试图掩饰内心的波动。' },
            { msg: "😳", eyeScale: { x: 1.8, y: 1.8 }, color: { r: 1, g: 0.4, b: 0.4 }, shape: 'sphere', personality: '感到被冒犯或极度惊讶，语气变得更加尖锐、警惕。' },
            { msg: "(〃∀〃)", eyeScale: { x: 1.2, y: 1.2 }, color: { r: 1, g: 0.6, b: 0.8 }, shape: 'arc', rot: Math.PI, personality: '心情愉悦，虽然依然傲娇，但语气中会不经意流露出一点点温柔或自得。' },
            { msg: "✨", eyeScale: { x: 1.5, y: 1.5 }, color: { r: 1, g: 1, b: 0.4 }, shape: 'sphere', personality: '充满了极致的优越感和自信，看人的眼神（话语）充满了俯视感。' },
            { msg: "(/▽＼)", eyeScale: { x: 1, y: 0.1 }, color: { r: 1, g: 0.5, b: 0.7 }, shape: 'arc', rot: 0, personality: '害羞得想躲起来，拒绝正面回答问题，或者用傲娇的话语来回避。' }
        ];

        const r = reactions[Math.floor(Math.random() * reactions.length)];
        window.currentAsMood = r; // Store current mood for chat context
        greetingEl.innerText = r.msg;
        greetingEl.classList.add('show');

        if (r.shape === 'arc') {
            leftEye.geometry = archedEyeGeo;
            rightEye.geometry = archedEyeGeo;
            leftEye.rotation.x = r.rot;
            rightEye.rotation.x = r.rot;
        } else {
            leftEye.geometry = eyeGeo;
            rightEye.geometry = eyeGeo;
            leftEye.rotation.x = 0;
            rightEye.rotation.x = 0;
        }

        gsap.to([leftEar.material.color, rightEar.material.color], { r: r.color.r, g: r.color.g, b: r.color.b, duration: 0.3 });
        gsap.to([leftEye.scale, rightEye.scale], { x: r.eyeScale.x, y: r.eyeScale.y, duration: 0.3 });
        gsap.to(particleSphere.position, { y: particleSphere.position.y + 2, duration: 0.1, yoyo: true, repeat: 1 });
    });

    container.addEventListener('mouseleave', () => {
        if (typeof gsap === 'undefined') return;
        if (greetingTimeout) clearTimeout(greetingTimeout);
        greetingTimeout = setTimeout(() => {
            gsap.to([leftEar.material.color, rightEar.material.color], { r: 1, g: 1, b: 1, duration: 1 });
            gsap.to([leftEye.scale, rightEye.scale], {
                x: 1, y: 1, z: 1,
                duration: 0.5,
                onComplete: () => {
                    leftEye.geometry = eyeGeo;
                    rightEye.geometry = eyeGeo;
                    leftEye.rotation.x = 0;
                    rightEye.rotation.x = 0;
                }
            });
            greetingEl.classList.remove('show');
            isGreeting = false;
        }, 500);
    });

    container.addEventListener('click', (e) => {
        e.stopPropagation();
        const chatDialog = document.getElementById('chat-dialog');
        if (chatDialog) {
            chatDialog.classList.add('show');
            setTimeout(() => {
                const input = document.getElementById('chat-dialog-input');
                if (input) input.focus();
            }, 300);
        }
    });

    const originalPositions = sphereGeometry.attributes.position.array.slice();

    function animate() {
        requestAnimationFrame(animate);
        time += 0.015;

        const positions = sphereGeometry.attributes.position.array;
        for (let i = 0; i < count; i++) {
            const px = originalPositions[i * 3];
            const py = originalPositions[i * 3 + 1];
            const pz = originalPositions[i * 3 + 2];
            const noise = Math.sin(px * 0.4 + time) * Math.cos(py * 0.4 + time) * Math.sin(pz * 0.4 + time);
            const displacement = 1 + noise * 0.15;
            positions[i * 3] = px * displacement;
            positions[i * 3 + 1] = py * displacement;
            positions[i * 3 + 2] = pz * displacement;
        }
        sphereGeometry.attributes.position.needsUpdate = true;
        container.style.transform = `translateY(${Math.sin(time * 0.8) * 15}px)`;
        leftEar.position.y = 5 + Math.sin(time * 1.5) * 1.5;
        rightEar.position.y = 5 + Math.cos(time * 1.5) * 1.5;
        leftEar.rotation.z = Math.sin(time) * 0.2;
        rightEar.rotation.z = -Math.sin(time) * 0.2;

        particleSphere.rotation.y += 0.005;
        const targetRotX = mouseY * 0.4;
        const targetRotY = mouseX * 0.4;
        particleSphere.rotation.x += (targetRotX - particleSphere.rotation.x) * 0.05;
        particleSphere.rotation.y += (targetRotY - particleSphere.rotation.y) * 0.05;

        eyeGroup.position.copy(particleSphere.position);
        const lookFactorX = 1.2;
        const lookFactorY = 0.8;
        leftEye.position.x = -1.8 + mouseX * lookFactorX;
        leftEye.position.y = 1 - mouseY * lookFactorY;
        rightEye.position.x = 1.8 + mouseX * lookFactorX;
        rightEye.position.y = 1 - mouseY * lookFactorY;

        renderer.render(scene, camera);
    }
    animate();
})();

window.SpriteChatManager = class SpriteChatManager {
    constructor(options = {}) {
        this.messages = [];
        this.isTyping = false;
        this.configManager = (typeof ConfigManager !== 'undefined') ? new ConfigManager() : null;
        
        const aiConfig = (window.AsstarConfig && window.AsstarConfig.ai) || {
            eveCorePrompt: '[SYSTEM CORE]: 你是 As。',
            initialStates: [{ msg: '……盯着我干嘛？没见过像我这么完美的生命吗？', mood: '警惕', memory: '初始化。', desc: '冷静的人格。' }]
        };
        const eveCorePrompt = aiConfig.eveCorePrompt;
        const initialStates = aiConfig.initialStates;
        
        const state = initialStates[Math.floor(Math.random() * initialStates.length)];
        this.initialState = state;
        this.initialMessage = options.initialMessage || `${state.msg}\n\n[STATUS]\n- [好感度]: 0\n- [心理防御]: 100%\n- [当前情绪]: ${state.mood}\n- [长期记忆]: ${state.memory}`;

        // Combine core prompt with initial personality and page-specific context
        const initialAsDesc = `\n\n[CURRENT PERSONALITY MODULE]: 你当前已被初始化为“${state.mood}”人格模块。你的性格核心逻辑：${state.desc}`;
        const combinedPrompt = `${eveCorePrompt}${initialAsDesc}`;

        if (options.systemPrompt) {
            this.systemPrompt = `${combinedPrompt}\n\n[CONTEXT / BACKGROUND]:\n${options.systemPrompt}`;
        } else {
            this.systemPrompt = combinedPrompt;
        }
        
        this.chatDialog = document.getElementById('chat-dialog');
        this.chatMessages = document.getElementById('chat-dialog-messages');
        this.chatInput = document.getElementById('chat-dialog-input');
        this.chatSend = document.getElementById('chat-dialog-send');
        this.chatClose = document.getElementById('chat-dialog-close');
        this.typingIndicator = document.getElementById('chat-typing-indicator');
        
        if (this.chatDialog) this.init();
    }

    init() {
        this.chatClose.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeDialog();
        });
        
        this.chatDialog.addEventListener('click', (e) => { e.stopPropagation(); });

        document.addEventListener('click', (e) => {
            if (this.chatDialog.classList.contains('show') && 
                !this.chatDialog.contains(e.target) &&
                !e.target.closest('#sprite-container')) {
                this.closeDialog();
            }
        });

        this.chatSend.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        this.chatInput.addEventListener('input', () => {
            this.chatInput.style.height = 'auto';
            this.chatInput.style.height = Math.min(this.chatInput.scrollHeight, 100) + 'px';
        });

        // Set initial message and sync DOM
        if (this.chatMessages) {
            this.messages = [{
                role: 'assistant',
                content: this.initialMessage,
                timestamp: new Date()
            }];
            
            // Update the first visual message if it exists
            const firstMsgContent = this.chatMessages.querySelector('.chat-message.assistant .chat-message-content');
            if (firstMsgContent) {
                const { displayContent, status } = this.parseStatus(this.initialMessage);
                const statusHtml = status ? `<div class="chat-message-status">${status.replace(/^\[STATUS\]:?/i, '').trim()}</div>` : '';
                firstMsgContent.innerHTML = this.formatContent(displayContent) + statusHtml;
            }
        }
    }

    closeDialog() {
        if (this.chatDialog) this.chatDialog.classList.remove('show');
    }

    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message || this.isTyping) return;

        this.addMessage('user', message);
        this.chatInput.value = '';
        this.chatInput.style.height = 'auto';
        this.messages.push({ role: 'user', content: message, timestamp: new Date() });

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
            this.addMessage('assistant', '（微弱的干扰声）……连接似乎不稳定。我已经自动切换到备用量子链路（Qwen Proxy），请再试一次。如果持续失败，可能是时空波动（网络环境）太剧烈了。');
        }
    }

    async callAIAPI(message) {
        let currentModel, currentApiKey, currentApiUrl, useProxy, proxyUrl;

        if (this.configManager) {
            currentModel = this.configManager.getCurrentModelConfig();
            currentApiKey = this.configManager.getCurrentApiKey();
            currentApiUrl = this.configManager.getCurrentApiUrl();
            useProxy = this.configManager.shouldUseProxy();
            proxyUrl = this.configManager.getProxyUrl();

            // 自动配置逻辑：
            // 如果没配置 Key 且没开启代理，则自动强制切换到 Qwen 代理模式，确保“能直接使用”
            if (!currentApiKey && !useProxy) {
                const qwen = this.configManager.getAllModels().qwen;
                if (qwen) {
                    currentModel = qwen;
                    useProxy = true;
                    proxyUrl = this.configManager.getProxyUrl();
                }
            }
        } else {
            // Read fallback settings from window.AsstarConfig
            const fallback = (window.AsstarConfig && window.AsstarConfig.ai) || {};
            currentModel = fallback.defaultModel || { name: 'Qwen 3.7 Plus', model: 'qwen3.7-plus', requestFormat: 'openai', headers: { 'Content-Type': 'application/json' } };
            currentApiKey = '';
            currentApiUrl = '';
            useProxy = true;
            proxyUrl = fallback.proxyUrl || 'https://qwen-api.yxy138646.workers.dev';
        }

        let url, headers, requestBody;

        const moodContext = window.currentAsMood ? `\n\n[CURRENT MOOD]: 你现在的表情是 "${window.currentAsMood.msg}"，你的实时性格表现为：${window.currentAsMood.personality}` : '';
        const combinedSystemPrompt = `${this.systemPrompt}${moodContext}`;

        if (currentModel.requestFormat === 'openai') {
            if (useProxy && proxyUrl) {
                url = proxyUrl;
                headers = { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' };
            } else {
                url = currentApiUrl || 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
                headers = { 
                    ...currentModel.headers, 
                    'Authorization': `Bearer ${currentApiKey}`, 
                    'Accept': 'text/event-stream' 
                };
            }
            requestBody = {
                model: currentModel.model || 'qwen3.7-plus',
                messages: [
                    { role: 'system', content: combinedSystemPrompt },
                    ...this.messages.slice(0, -1).map(msg => ({ role: msg.role, content: msg.content })),
                    { role: 'user', content: message }
                ],
                temperature: currentModel.temperature || 0.7,
                max_tokens: currentModel.maxTokens || 1024,
                top_p: currentModel.topP || 0.9,
                stream: true,
                enable_thinking: false
            };
        } else if (currentModel.requestFormat === 'anthropic') {
            url = currentApiUrl;
            headers = { ...currentModel.headers, 'x-api-key': currentApiKey, 'Accept': 'text/event-stream' };
            const history = this.messages.slice(0, -1).map(msg => `${msg.role}: ${msg.content}`).join('\n');
            requestBody = {
                model: currentModel.model,
                max_tokens: currentModel.maxTokens,
                temperature: currentModel.temperature,
                messages: [{ role: 'user', content: `${combinedSystemPrompt}\n\n${history}\n\nuser: ${message}` }],
                stream: true
            };
        } else if (currentModel.requestFormat === 'baidu') {
            url = currentApiUrl;
            headers = { ...currentModel.headers, 'Authorization': `Bearer ${currentApiKey}` };
            const history = this.messages.slice(0, -1).map(msg => `${msg.role}: ${msg.content}`).join('\n');
            requestBody = {
                messages: [{ role: 'user', content: `${combinedSystemPrompt}\n\n${history}\n\nuser: ${message}` }],
                temperature: currentModel.temperature,
                top_p: currentModel.topP
            };
        } else {
            url = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
            headers = { 'Authorization': `Bearer ${currentApiKey}`, 'Content-Type': 'application/json', 'X-DashScope-SSE': 'enable' };
            requestBody = {
                model: currentModel.model,
                input: {
                    messages: [
                        { role: 'system', content: combinedSystemPrompt },
                        ...this.messages.slice(0, -1).map(msg => ({ role: msg.role, content: msg.content })),
                        { role: 'user', content: message }
                    ]
                },
                parameters: {
                    temperature: currentModel.temperature,
                    max_tokens: currentModel.maxTokens,
                    top_p: currentModel.topP
                }
            };
        }

        const response = await fetch(url, { 
            method: 'POST', 
            headers, 
            body: JSON.stringify(requestBody) 
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API错误响应:', errorText);
            throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
        }

        return this.handleStreamResponse(response, currentModel.requestFormat);
    }

    async handleStreamResponse(response, format) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullContent = '';
        let isAnswering = false;
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
                        if (data === '[DONE]') {
                            this.finalizeStreamMessage(messageElement, fullContent);
                            return fullContent;
                        }
                        try {
                            const parsed = JSON.parse(data);
                            const { content, reasoning } = this.extractContentFromStream(parsed, format);
                            
                            if (reasoning && !isAnswering) {
                                // For sprite chat, we handle it silently or log it
                                console.log('Thinking:', reasoning);
                            }
                            
                            if (content) {
                                isAnswering = true;
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

    extractContentFromStream(data, format) {
        if (format === 'openai') {
            const delta = data.choices?.[0]?.delta;
            return {
                content: delta?.content || '',
                reasoning: delta?.reasoning_content || ''
            };
        }
        if (format === 'anthropic') return { content: data.content?.[0]?.text || '', reasoning: '' };
        if (format === 'dashscope') return { content: data.output?.text || '', reasoning: '' };
        return { content: '', reasoning: '' };
    }

    createStreamMessageElement() {
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message assistant streaming';
        messageElement.innerHTML = `
            <div class="chat-message-avatar">✨</div>
            <div class="chat-message-content">
                <span class="streaming-content"></span>
                <span class="streaming-cursor">|</span>
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
        
        const { displayContent, status } = this.parseStatus(content);
        
        const contentElement = messageElement.querySelector('.streaming-content');
        if (contentElement) {
            contentElement.innerHTML = this.formatContent(displayContent);
            if (status) {
                const statusEl = document.createElement('div');
                statusEl.className = 'chat-message-status';
                statusEl.textContent = status.replace(/^\[STATUS\]:?/i, '').trim();
                contentElement.appendChild(statusEl);
            }
        }
        this.scrollToBottom();
    }

    addMessage(role, content) {
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${role}`;
        const avatar = role === 'user' ? '👤' : '✨';
        
        const { displayContent, status } = this.parseStatus(content);
        
        const formattedContent = this.formatContent(displayContent);
        const statusHtml = status ? `<div class="chat-message-status">${status.replace(/^\[STATUS\]:?/i, '').trim()}</div>` : '';
        
        messageElement.innerHTML = `
            <div class="chat-message-avatar">${avatar}</div>
            <div class="chat-message-content">
                ${formattedContent}
                ${statusHtml}
            </div>
        `;
        this.chatMessages.appendChild(messageElement);
        this.scrollToBottom();
    }

    formatContent(content) {
        if (!content) return '';
        // Split by double newlines for paragraphs, or single newlines
        return content.trim().split(/\n+/).map(para => `<p>${para.trim()}</p>`).join('');
    }

    parseStatus(content) {
        const statusMatch = content.match(/\[STATUS\]:?[\s\S]*$/i);
        if (statusMatch) {
            const displayContent = content.slice(0, statusMatch.index).trim();
            const status = statusMatch[0].trim();
            return { displayContent, status };
        }
        return { displayContent: content, status: null };
    }

    showTypingIndicator() {
        this.isTyping = true;
        if (this.typingIndicator) this.typingIndicator.style.display = 'flex';
        this.chatSend.disabled = true;
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.isTyping = false;
        if (this.typingIndicator) this.typingIndicator.style.display = 'none';
        this.chatSend.disabled = false;
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }
}
