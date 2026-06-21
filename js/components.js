/**
 * Shared UI Components
 */

window.injectSharedComponents = function() {
    // Inject transition curtain
    if (!document.querySelector('.page-transition-curtain')) {
        const curtain = document.createElement('div');
        
        // Check if we came from an internal transition click
        const isTransition = sessionStorage.getItem('page-transitioning') === 'true';
        sessionStorage.removeItem('page-transitioning');
        
        let alienNum = 22; // default
        if (isTransition) {
            const prevClickX = sessionStorage.getItem('click-x');
            const prevClickY = sessionStorage.getItem('click-y');
            if (prevClickX && prevClickY) {
                document.documentElement.style.setProperty('--click-x', prevClickX + 'px');
                document.documentElement.style.setProperty('--click-y', prevClickY + 'px');
            }
            
            const savedAlien = sessionStorage.getItem('transition-alien');
            if (savedAlien) {
                alienNum = parseInt(savedAlien, 10);
            } else {
                alienNum = Math.floor(Math.random() * 5) + 18; // fallback
            }
            sessionStorage.removeItem('transition-alien'); // Clean up
            
            curtain.className = 'page-transition-curtain init-covering';
        } else {
            // Direct entry: select random alien image (18-22)
            alienNum = Math.floor(Math.random() * 5) + 18;
            curtain.className = 'page-transition-curtain init-covering';
        }
        
        curtain.innerHTML = `
            <div class="transition-eyes-container">
                <img src="assets/images/Alien${alienNum}.jpg" class="transition-alien-img" alt="Loading...">
            </div>
        `;
        document.body.appendChild(curtain);
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

    // Inject Sprite Chat Dialog if container is present in HTML (Opt-in Component Pattern)
    const spriteContainer = document.getElementById('sprite-container');
    if (spriteContainer && !document.getElementById('chat-dialog')) {
        // Determine page context for initial message from container's data-context attribute
        const contextAttr = spriteContainer.getAttribute('data-context');
        let pageContext = '这些信息';
        if (contextAttr === 'focus') pageContext = '这些焦点新闻';
        else if (contextAttr === 'papers') pageContext = '这些论文';
        else if (contextAttr === 'trending') pageContext = '这些热门项目';
        else if (contextAttr === 'atlas') pageContext = 'Atlas 的提效工具';
        else if (contextAttr === 'nova') pageContext = 'Nova的前沿项目、论文 and 焦点新闻';
        else if (contextAttr === 'orbit') pageContext = 'Orbit的项目时间轴';
        else if (contextAttr === 'voice') pageContext = '智能语音交互服务';
        else {
            // Fallback to URL matching if no data-context attribute is present
            if (window.location.pathname.includes('focus')) pageContext = '这些焦点新闻';
            else if (window.location.pathname.includes('papers')) pageContext = '这些论文';
            else if (window.location.pathname.includes('trending')) pageContext = '这些热门项目';
            else if (window.location.pathname.includes('atlas')) pageContext = 'Atlas 的提效工具';
            else if (window.location.pathname.includes('nova')) pageContext = 'Nova的前沿项目、论文 and 焦点新闻';
            else if (window.location.pathname.includes('orbit')) pageContext = 'Orbit的项目时间轴';
            else if (window.location.pathname.includes('voice')) pageContext = '智能语音交互服务';
        }

        const chatDialog = document.createElement('div');
        chatDialog.className = 'chat-dialog';
        chatDialog.id = 'chat-dialog';
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

    // Inject Ambient Space Background & Stars
    if (!document.querySelector('.slide-bg')) {
        const bg = document.createElement('div');
        bg.className = 'slide-bg';
        const stars = document.createElement('div');
        stars.className = 'slide-stars';
        bg.appendChild(stars);
        document.body.prepend(bg);

        // Track mouse movement to apply smooth parallax shifting (throttled via requestAnimationFrame)
        let parallaxTimeout = null;
        document.addEventListener('mousemove', (e) => {
            if (parallaxTimeout) return;
            parallaxTimeout = requestAnimationFrame(() => {
                const mx = (e.clientX / window.innerWidth - 0.5) * 40;
                const my = (e.clientY / window.innerHeight - 0.5) * 40;
                bg.style.transform = `translate3d(${mx * -0.4}px, ${my * -0.4}px, 0)`;
                parallaxTimeout = null;
            });
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
            // Hide the curtain completely after transition completes to save rendering cost
            const curtain = document.querySelector('.page-transition-curtain');
            if (curtain) {
                setTimeout(() => {
                    curtain.style.display = 'none';
                    stopEyesLoop();
                }, 400); // 400ms corresponds to transition duration (0.35s + buffer)
            }
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
    let isEyesActive = false;

    document.addEventListener('mousemove', (e) => {
        if (!isEyesActive) return; // Only process mousemove if eyes are active
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

    function startEyesLoop() {
        if (isEyesActive) return;
        isEyesActive = true;
        updateEyes();
    }

    function stopEyesLoop() {
        isEyesActive = false;
    }

    function updateEyes() {
        if (!isEyesActive) return;
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
    
    // Start eyes loop initially
    startEyesLoop();

    // Smoothly fade out before navigating same-domain links
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link && link.href && link.target !== '_blank') {
            const isPlainClick = e.button === 0 && !e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey;
            if (isPlainClick && link.host === window.location.host && !link.hash && !link.href.startsWith('javascript:')) {
                e.preventDefault();
                const targetUrl = link.href;
                
                // Track spatial click coordinates to center the portal shrink transition
                const clickX = e.clientX;
                const clickY = e.clientY;
                document.documentElement.style.setProperty('--click-x', `${clickX}px`);
                document.documentElement.style.setProperty('--click-y', `${clickY}px`);
                
                // Choose a random alien number (18-22) for the outbound transition
                const randomAlien = Math.floor(Math.random() * 5) + 18;
                
                // Save coordinates and chosen alien for the next page load transition
                sessionStorage.setItem('page-transitioning', 'true');
                sessionStorage.setItem('click-x', clickX.toString());
                sessionStorage.setItem('click-y', clickY.toString());
                sessionStorage.setItem('transition-alien', randomAlien.toString());
                
                const curtain = document.querySelector('.page-transition-curtain');
                if (curtain) {
                    // Update image to the chosen random alien for the outbound animation
                    const alienImg = curtain.querySelector('.transition-alien-img');
                    if (alienImg) {
                        alienImg.src = `assets/images/Alien${randomAlien}.jpg`;
                    }
                    
                    curtain.style.display = '';
                    curtain.classList.remove('init-hidden');
                    curtain.style.pointerEvents = 'auto'; // Block user interaction while transitioning
                    
                    // Force a reflow
                    curtain.getBoundingClientRect();
                    
                    curtain.classList.add('closing');
                    startEyesLoop();
                }
                
                // Navigate after transition is completed (e.g. 250ms)
                setTimeout(() => {
                    window.location.href = targetUrl;
                }, 250);
            }
        }
    });

    // Prefetch internal pages during idle time or hover
    function initLinkPrefetching() {
        const links = document.querySelectorAll('a');
        const prefetchedUrls = new Set();
        
        function prefetch(url) {
            if (prefetchedUrls.has(url)) return;
            prefetchedUrls.add(url);
            
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = url;
            document.head.appendChild(link);
        }
        
        links.forEach(link => {
            if (link.href && 
                link.host === window.location.host && 
                !link.hash && 
                !link.href.startsWith('javascript:') &&
                link.target !== '_blank') {
                
                // Prefetch on hover (mouseenter) / focus / touchstart
                link.addEventListener('mouseenter', () => prefetch(link.href), { passive: true });
                link.addEventListener('focus', () => prefetch(link.href), { passive: true });
                link.addEventListener('touchstart', () => prefetch(link.href), { passive: true });
            }
        });
        
        // Also prefetch main navigation links automatically after 2 seconds
        setTimeout(() => {
            const navPages = ['index.html', 'nova.html', 'atlas.html', 'voice-interaction.html', 'orbit.html', 'space.html'];
            navPages.forEach(page => {
                const segments = window.location.pathname.split('/').filter(s => s.length > 0);
                const depth = segments.length > 0 && segments[segments.length - 1].includes('.') ? segments.length - 1 : segments.length;
                let rootPath = './';
                if (depth > 0) {
                    rootPath = '../'.repeat(depth);
                }
                const fullUrl = new URL(rootPath + page, window.location.href).href;
                if (fullUrl !== window.location.href) {
                    prefetch(fullUrl);
                }
            });
        }, 2000);
    }

    // Initialize prefetching
    initLinkPrefetching();
};

// Auto-run immediately
window.injectSharedComponents();
