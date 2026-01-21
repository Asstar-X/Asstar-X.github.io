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

    window.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
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
            { msg: "(>////<)", eyeScale: { x: 1, y: 0.15 }, color: { r: 1, g: 0.5, b: 0.6 }, shape: 'sphere' },
            { msg: "😳", eyeScale: { x: 1.8, y: 1.8 }, color: { r: 1, g: 0.4, b: 0.4 }, shape: 'sphere' },
            { msg: "(〃∀〃)", eyeScale: { x: 1.2, y: 1.2 }, color: { r: 1, g: 0.6, b: 0.8 }, shape: 'arc', rot: Math.PI },
            { msg: "✨", eyeScale: { x: 1.5, y: 1.5 }, color: { r: 1, g: 1, b: 0.4 }, shape: 'sphere' },
            { msg: "(/▽＼)", eyeScale: { x: 1, y: 0.1 }, color: { r: 1, g: 0.5, b: 0.7 }, shape: 'arc', rot: 0 }
        ];

        const r = reactions[Math.floor(Math.random() * reactions.length)];
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

// SpriteChatManager defined in global scope or attached to window
window.SpriteChatManager = class SpriteChatManager {
    constructor(options = {}) {
        this.messages = [];
        this.isTyping = false;
        this.configManager = (typeof ConfigManager !== 'undefined') ? new ConfigManager() : null;
        
        this.systemPrompt = options.systemPrompt || '你是一个友好的AI助手，名字叫小精灵。请用简洁、友好的方式回答问题。';
        this.initialMessage = options.initialMessage || '你好！我是小精灵助手，有什么想知道的吗？';
        
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

        // Set initial message
        if (this.chatMessages && this.chatMessages.children.length <= 1) { // 1 because of static HTML message
            // If the HTML already has a message, we update it or keep it.
            // For now, let's just make sure the history matches.
            this.messages.push({
                role: 'assistant',
                content: this.initialMessage,
                timestamp: new Date()
            });
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
            this.addMessage('assistant', '抱歉，发生了错误。请检查您的网络连接，或前往 <a href="lab/prompt-optimizer.html" target="_blank" style="color:white;text-decoration:underline;">Prompt优化器</a> 配置正确的模型和API Key。');
        }
    }

    async callAIAPI(message) {
        if (!this.configManager) throw new Error('ConfigManager not loaded');

        const currentModel = this.configManager.getCurrentModelConfig();
        const currentApiKey = this.configManager.getCurrentApiKey();
        const currentApiUrl = this.configManager.getCurrentApiUrl();
        const useProxy = this.configManager.shouldUseProxy();
        const proxyUrl = this.configManager.getProxyUrl();

        let url, headers, requestBody;

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
                model: currentModel.model || 'qwen-max',
                messages: [
                    { role: 'system', content: this.systemPrompt },
                    ...this.messages.slice(0, -1).map(msg => ({ role: msg.role, content: msg.content })),
                    { role: 'user', content: message }
                ],
                temperature: currentModel.temperature || 0.7,
                max_tokens: currentModel.maxTokens || 1024,
                top_p: currentModel.topP || 0.9,
                stream: true
            };
        } else if (currentModel.requestFormat === 'anthropic') {
            url = currentApiUrl;
            headers = { ...currentModel.headers, 'x-api-key': currentApiKey, 'Accept': 'text/event-stream' };
            const history = this.messages.slice(0, -1).map(msg => `${msg.role}: ${msg.content}`).join('\n');
            requestBody = {
                model: currentModel.model,
                max_tokens: currentModel.maxTokens,
                temperature: currentModel.temperature,
                messages: [{ role: 'user', content: `${this.systemPrompt}\n\n${history}\n\nuser: ${message}` }],
                stream: true
            };
        } else if (currentModel.requestFormat === 'baidu') {
            url = currentApiUrl;
            headers = { ...currentModel.headers, 'Authorization': `Bearer ${currentApiKey}` };
            const history = this.messages.slice(0, -1).map(msg => `${msg.role}: ${msg.content}`).join('\n');
            requestBody = {
                messages: [{ role: 'user', content: `${this.systemPrompt}\n\n${history}\n\nuser: ${message}` }],
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
                        { role: 'system', content: this.systemPrompt },
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

    extractContentFromStream(data, format) {
        if (format === 'openai') return data.choices?.[0]?.delta?.content || '';
        if (format === 'anthropic') return data.content?.[0]?.text || '';
        if (format === 'dashscope') return data.output?.text || '';
        return '';
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
        const contentElement = messageElement.querySelector('.streaming-content');
        if (contentElement) contentElement.textContent = content;
        this.scrollToBottom();
    }

    addMessage(role, content) {
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${role}`;
        const avatar = role === 'user' ? '👤' : '✨';
        messageElement.innerHTML = `
            <div class="chat-message-avatar">${avatar}</div>
            <div class="chat-message-content">${content.replace(/\n/g, '<br>')}</div>
        `;
        this.chatMessages.appendChild(messageElement);
        this.scrollToBottom();
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
