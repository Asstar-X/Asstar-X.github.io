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
                <svg class="staring-eyes-svg" viewBox="0 0 680 240" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <!-- 粒子云团融合滤镜 -->
                        <filter id="points-blur-filter" x="-100%" y="-100%" width="300%" height="300%">
                            <feGaussianBlur id="blur-node" stdDeviation="5.5" result="blur" />
                            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
                            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
                        </filter>

                        <!-- 腮红星云径向渐变 -->
                        <radialGradient id="blush-grad" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stop-color="#ff1493" stop-opacity="0.25" />
                            <stop offset="100%" stop-color="#ff1493" stop-opacity="0" />
                        </radialGradient>
                    </defs>

                    <!-- 小精灵高保真粒子投影网格 -->
                    <g class="sprite-parallax-mesh additive-glow" filter="url(#points-blur-filter)">

                        <!-- 1. 小精灵发光猫耳轮廓 (Cat Ears Path Outline) -->
                        <g fill="none" stroke="rgba(255,255,255, 0.45)" stroke-width="1.5">
                            <!-- 左耳 (X=230, Y=110) -->
                            <path id="sprite-ear-left" d="M 230 110 L 210 20 Q 240 10, 260 70 Z" class="eyelid-path" style="transform: scaleY(var(--ear-height-scale, 1.5)); transform-origin: 230px 110px;" />
                            <!-- 右耳 (X=450, Y=110) -->
                            <path id="sprite-ear-right" d="M 450 110 L 470 20 Q 440 10, 420 70 Z" class="eyelid-path" style="transform: scaleY(var(--ear-height-scale, 1.5)); transform-origin: 450px 110px;" />
                        </g>
                        <!-- 可调节的发光半透明耳朵内部填充 -->
                        <g fill="rgba(255,255,255,0.06)">
                            <path d="M 230 110 L 210 20 Q 240 10, 260 70 Z" style="transform: scaleY(var(--ear-height-scale, 1.5)); transform-origin: 230px 110px;" />
                            <path d="M 450 110 L 470 20 Q 440 10, 420 70 Z" style="transform: scaleY(var(--ear-height-scale, 1.5)); transform-origin: 450px 110px;" />
                        </g>

                        <!-- 2. 面颊软萌腮红粒子 (Blush gradient triggered by mood) -->
                        <g id="sprite-blush" opacity="0.0">
                            <ellipse cx="270" cy="155" rx="35" ry="12" fill="url(#blush-grad)" />
                            <ellipse cx="410" cy="155" rx="35" ry="12" fill="url(#blush-grad)" />
                        </g>

                        <!-- 3. 背景星轨微粒布局 (Sprite Particle Shell Geometry) -->
                        <g fill="rgba(255, 255, 255, 0.22)" id="ambient-shell-particles" opacity="var(--particle-density, 0.85)">
                            <!-- 绘制小精灵球体的伪3D星尘圆弧 -->
                            <circle cx="340" cy="120" r="1.5" />
                            <circle cx="280" cy="100" r="1.2" />
                            <circle cx="400" cy="100" r="1.2" />
                            <circle cx="250" cy="140" r="1.8" />
                            <circle cx="430" cy="140" r="1.8" />
                            <circle cx="300" cy="160" r="1.0" />
                            <circle cx="380" cy="160" r="1.0" />
                            <circle cx="340" cy="180" r="1.5" />
                            <circle cx="220" cy="115" r="1.3" />
                            <circle cx="460" cy="115" r="1.3" />
                            <!-- 耳朵顶端的闪烁微光 -->
                            <circle cx="210" cy="20" r="2.0" fill="#ffffff" />
                            <circle cx="470" cy="20" r="2.0" fill="#ffffff" />
                        </g>

                        <!-- 4. 小精灵双瞳（大眼萌）核心 -->
                        <!-- 左眼结构 (X=280) -->
                        <g id="left-eye-group" transform="translate(280, 125)">
                            <ellipse cx="0" cy="0" rx="16" ry="16" fill="rgba(255, 255, 255, 0.05)" />
                            <g id="left-eyes-shape">
                                <circle class="pupil-iris" cx="0" cy="0" r="7.5" fill="#ffffff" />
                                <path class="pupil-iris-arc" d="M -10 3 A 10 10 0 0 1 10 3" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" display="none" />
                            </g>
                            <circle cx="-2.5" cy="-2.5" r="2.2" fill="#ffffff" id="pupil-highlight-left"/>
                        </g>

                        <!-- 右眼结构 (X=400) -->
                        <g id="right-eye-group" transform="translate(400, 125)">
                            <ellipse cx="0" cy="0" rx="16" ry="16" fill="rgba(255, 255, 255, 0.05)" />
                            <g id="right-eyes-shape">
                                <circle class="pupil-iris" cx="0" cy="0" r="7.5" fill="#ffffff" />
                                <path class="pupil-iris-arc" d="M -10 3 A 10 10 0 0 1 10 3" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" display="none" />
                            </g>
                            <circle cx="-2.5" cy="-2.5" r="2.2" fill="#ffffff" id="pupil-highlight-right"/>
                        </g>

                        <!-- 拱形小巧嘴部 -->
                        <g transform="translate(340, 142)">
                            <path d="M -5 -2 Q 0 4, 5 -2" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" id="sprite-mouth" />
                        </g>
                    </g>
                </svg>
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
