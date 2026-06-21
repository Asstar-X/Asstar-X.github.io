/**
 * Shared UI Components
 */

window.injectSharedComponents = function() {
    // Inject transition curtain
    if (!document.querySelector('.page-transition-curtain')) {
        const curtain = document.createElement('div');
        curtain.className = 'page-transition-curtain init-hidden';
        curtain.innerHTML = `
            <div class="transition-eyes-container">
                <img src="assets/images/Alien22.jpg" class="transition-alien-img" alt="Loading...">
            </div>
        `;
        document.body.appendChild(curtain);
        
        // Show loading screen only if page load takes longer than 350ms
        setTimeout(() => {
            if (!document.body.classList.contains('page-ready')) {
                curtain.classList.remove('init-hidden');
            }
        }, 350);
    }
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
            else if (window.location.pathname.includes('atlas')) pageContext = 'Atlas 的提效工具';
            else if (window.location.pathname.includes('nova')) pageContext = 'Nova的前沿项目、论文和焦点新闻';
            else if (window.location.pathname.includes('orbit')) pageContext = 'Orbit的项目时间轴';
            else if (window.location.pathname.includes('voice')) pageContext = '智能语音交互服务';

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

    // Inject Ambient Space Background & Stars
    if (!document.querySelector('.slide-bg')) {
        const bg = document.createElement('div');
        bg.className = 'slide-bg';
        const stars = document.createElement('div');
        stars.className = 'slide-stars';
        bg.appendChild(stars);
        document.body.prepend(bg);

        // Track mouse movement to apply smooth parallax shifting
        document.addEventListener('mousemove', (e) => {
            const mx = (e.clientX / window.innerWidth - 0.5) * 40;
            const my = (e.clientY / window.innerHeight - 0.5) * 40;
            bg.style.transform = `translate3d(${mx * -0.4}px, ${my * -0.4}px, 0)`;
        });
    }

    // Common Noise Overlay and Canvas Container
    if (!document.querySelector('.noise-overlay')) {
        const noise = document.createElement('div');
        noise.className = 'noise-overlay';
        document.body.prepend(noise);
    }
    if (!document.getElementById('canvas-container')) {
        const canvas = document.createElement('div');
        canvas.id = 'canvas-container';
        document.body.prepend(canvas);
    }

    // Smoothly fade in the page after scripts load and render cached SWR data
    const triggerPageReady = () => {
        requestAnimationFrame(() => {
            document.body.classList.add('page-ready');
        });
    };

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(triggerPageReady, 20);
    } else {
        window.addEventListener('DOMContentLoaded', () => {
            setTimeout(triggerPageReady, 20);
        });
    }

    // Fade in from back-forward cache (bfcache) immediately
    window.addEventListener('pageshow', (event) => {
        document.body.classList.add('page-ready');
    });

    // Pupil Cursor-Tracking (Parallax) & Smooth Idle drifting
    let targetTx = 0;
    let targetTy = 0;
    let currentTx = 0;
    let currentTy = 0;
    let lastMoveTime = Date.now();

    document.addEventListener('mousemove', (e) => {
        lastMoveTime = Date.now();
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);
        const maxDist = Math.max(cx, cy) || 1;
        const intensity = Math.min(dist / maxDist, 1) * 11; // max 11px shift
        const angle = Math.atan2(dy, dx);
        targetTx = Math.cos(angle) * intensity;
        targetTy = Math.sin(angle) * intensity;
    });

    function updateEyes() {
        const now = Date.now();
        // If mouse hasn't moved for 1.8s, generate subtle random drift
        if (now - lastMoveTime > 1800) {
            if (Math.random() < 0.02) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * 6; // max 6px drift
                targetTx = Math.cos(angle) * dist;
                targetTy = Math.sin(angle) * dist;
            }
        }
        // Linear interpolation (lerp) for ultra-smooth rendering
        currentTx += (targetTx - currentTx) * 0.08;
        currentTy += (targetTy - currentTy) * 0.08;

        document.documentElement.style.setProperty('--eye-tx', `${currentTx.toFixed(2)}px`);
        document.documentElement.style.setProperty('--eye-ty', `${currentTy.toFixed(2)}px`);

        // 联动左反光和右反光微动，实现立体眼球聚焦
        const hlL = document.getElementById('pupil-highlight-left');
        const hlR = document.getElementById('pupil-highlight-right');
        if (hlL && hlR) {
            hlL.setAttribute('cx', (-2.5 + currentTx * 0.12).toFixed(2));
            hlL.setAttribute('cy', (-2.5 + currentTy * 0.12).toFixed(2));
            hlR.setAttribute('cx', (-2.5 + currentTx * 0.12).toFixed(2));
            hlR.setAttribute('cy', (-2.5 + currentTy * 0.12).toFixed(2));
        }

        requestAnimationFrame(updateEyes);
    }
    requestAnimationFrame(updateEyes);

    // Smoothly fade out before navigating same-domain links
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link && link.href && link.target !== '_blank') {
            const isPlainClick = e.button === 0 && !e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey;
            if (isPlainClick && link.host === window.location.host && !link.hash && !link.href.startsWith('javascript:')) {
                // Do NOT preventDefault! Let browser navigate naturally at normal speed.
                
                // Track spatial click coordinates to center the portal shrink transition
                document.documentElement.style.setProperty('--click-x', `${e.clientX}px`);
                document.documentElement.style.setProperty('--click-y', `${e.clientY}px`);
                
                // Show loading screen only if page navigation takes longer than 350ms
                setTimeout(() => {
                    const curtain = document.querySelector('.page-transition-curtain');
                    if (curtain) {
                        document.body.classList.remove('page-ready');
                        curtain.classList.remove('init-hidden');
                    }
                }, 350);
            }
        }
    });
};

// Auto-run immediately
window.injectSharedComponents();
