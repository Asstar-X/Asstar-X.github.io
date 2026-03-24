/**
 * Shared UI Components
 */

window.injectSharedComponents = function() {
    // Inject Back Button if not on index.html
    const isIndex = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '';
    if (!isIndex && !document.querySelector('.back-button')) {
        const backBtn = document.createElement('a');
        
        // Calculate relative path to root index.html
        const segments = window.location.pathname.split('/').filter(s => s.length > 0);
        const depth = segments.length > 0 && segments[segments.length - 1].includes('.') ? segments.length - 1 : segments.length;
        let rootPath = './';
        if (depth > 0) {
            rootPath = '../'.repeat(depth);
        }
        
        backBtn.href = rootPath + 'index.html';
        backBtn.className = 'back-button glass-panel';
        backBtn.innerText = '← 返回首页';
        document.body.appendChild(backBtn);
    }

    // Inject Sprite Chat if not present
    if (!document.getElementById('sprite-container') && !isIndex) {
        // Sprite Container
        const spriteContainer = document.createElement('div');
        spriteContainer.id = 'sprite-container';
        document.body.appendChild(spriteContainer);

        // Chat Dialog
        if (!document.getElementById('chat-dialog')) {
            const chatDialog = document.createElement('div');
            chatDialog.className = 'chat-dialog';
            chatDialog.id = 'chat-dialog';
            
            // Determine page context for initial message
            let pageContext = '这些信息';
            if (window.location.pathname.includes('focus')) pageContext = '这些焦点新闻';
            else if (window.location.pathname.includes('papers')) pageContext = '这些论文';
            else if (window.location.pathname.includes('trending')) pageContext = '这些热门项目';
            else if (window.location.pathname.includes('tools')) pageContext = '这些提效工具';

            chatDialog.innerHTML = `
                <div class="chat-dialog-header">
                    <div class="chat-dialog-title">
                        <span>✨</span>
                        <span>As</span>
                    </div>
                    <button class="chat-dialog-close" id="chat-dialog-close">&times;</button>
                </div>
                <div class="chat-dialog-messages" id="chat-dialog-messages">
                    <div class="chat-message assistant">
                        <div class="chat-message-avatar">✨</div>
                        <div class="chat-message-content">
                            你好！我是As，可以帮你了解${pageContext}的信息。有什么想知道的吗？
                        </div>
                    </div>
                </div>
                <div class="chat-dialog-input-container">
                    <div class="chat-dialog-input-wrapper">
                        <textarea class="chat-dialog-input" id="chat-dialog-input" placeholder="输入消息..." rows="1"></textarea>
                        <button class="chat-dialog-send" id="chat-dialog-send">发送</button>
                    </div>
                    <div class="typing-indicator" id="chat-typing-indicator">
                        <span>As 正在思考</span>
                        <div class="typing-dots">
                            <div class="typing-dot"></div>
                            <div class="typing-dot"></div>
                            <div class="typing-dot"></div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(chatDialog);
        }
    }

    // Common Noise Overlay and Canvas Container
    if (!document.querySelector('.noise-overlay')) {
        const noise = document.createElement('div');
        noise.className = 'noise-overlay';
        document.body.prepend(noise);
    }
    if (!document.getElementById('canvas-container') && !document.getElementById('canvas-background')) {
        const canvas = document.createElement('div');
        canvas.id = 'canvas-container';
        document.body.prepend(canvas);
    }
};

// Auto-run immediately
window.injectSharedComponents();
