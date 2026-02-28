// 平滑滚动到指定部分
function scrollToSection(sectionId) {
    const target = document.getElementById(sectionId);
    if (target) {
        target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// 视差滚动效果
// Canvas Background Implementation
class AntigravityBackground {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: null, y: null, radius: 150 };
        this.particleCount = window.innerWidth < 768 ? 60 : 100;
        this.connectionDistance = 150;

        this.init();
        this.animate();
        this.handleResize();
        this.handleMouse();
    }

    init() {
        this.resize();
        this.createParticles();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                color: Math.random() > 0.5 ? '#ffffff' : '#ffffff'
            });
        }
    }

    handleResize() {
        window.addEventListener('resize', () => {
            this.resize();
            this.createParticles();
        });
    }

    handleMouse() {
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        });

        window.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }

    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < this.particles.length; i++) {
            let p = this.particles[i];

            // Movement
            p.x += p.vx;
            p.y += p.vy;

            // Bounce off edges
            if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

            // Mouse interaction
            if (this.mouse.x != null) {
                let dx = this.mouse.x - p.x;
                let dy = this.mouse.y - p.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.mouse.radius) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (this.mouse.radius - distance) / this.mouse.radius;
                    const directionX = forceDirectionX * force * 3;
                    const directionY = forceDirectionY * force * 3;

                    p.x -= directionX;
                    p.y -= directionY;
                }
            }

            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.fill();

            // Connect particles
            for (let j = i; j < this.particles.length; j++) {
                let p2 = this.particles[j];
                let dx = p.x - p2.x;
                let dy = p.y - p2.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.connectionDistance) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(255, 255, 255, ${1 - distance / this.connectionDistance})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                }
            }
        }
    }

    animate() {
        this.drawParticles();
        requestAnimationFrame(this.animate.bind(this));
    }
}

// 移除旧的导航栏滚动背景逻辑，以保持透明垂直导航栏的一致性
// window.addEventListener('scroll', () => { ... });

// 元素进入视口时的动画
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// 为需要动画的元素添加观察
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.project-card, .stat, .contact-item');

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// 鼠标跟随效果
document.addEventListener('mousemove', (e) => {
    const cursor = document.createElement('div');
    cursor.className = 'cursor-trail';
    cursor.style.cssText = `
        position: fixed;
        width: 4px;
        height: 4px;
        background: #ffffff;
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
`;
document.head.appendChild(style);

// 按钮点击效果
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function (e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;

        this.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// 添加涟漪动画CSS
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// 打字机效果
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    text = text.trim(); // 去除首尾空白

    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }

    if (text.length > 0) {
        type();
    }
}

// 通用 Skeleton 加载生成器
window.generateSkeleton = function(count = 6) {
    let items = '';
    for (let i = 0; i < count; i++) {
        items += `
            <div class="skeleton-card">
                <div class="skeleton-shimmer"></div>
                <div class="skeleton-item skeleton-title"></div>
                <div class="skeleton-item skeleton-line"></div>
                <div class="skeleton-item skeleton-line"></div>
                <div class="skeleton-item skeleton-line short"></div>
            </div>
        `;
    }
    return `
        <div class="loading-container">
            <div class="digital-pulse"><div></div><div></div></div>
            <p class="loading-text">正在同步量子数据...</p>
        </div>
        <div class="skeleton-grid">
            ${items}
        </div>
    `;
};

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', () => {
    // 为标题添加打字机效果
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        let titleWord = heroTitle.querySelector('.title-word');
        if (titleWord) {
            const originalText = titleWord.textContent.trim();
            typeWriter(titleWord, originalText, 100);
        } else {
            const originalText = heroTitle.textContent.trim();
            typeWriter(heroTitle, originalText, 100);
        }
    }

    // 添加粒子效果
    // Init Canvas Background
    new AntigravityBackground('canvas-background');
    loadProjects();
    
    // 监听窗口大小变化以适配星系布局
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const galacticTimeline = document.getElementById('galactic-timeline');
            if (galacticTimeline) {
                loadProjects('galactic-timeline');
            }
        }, 250);
    });

    // 汉堡菜单交互
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
            // 添加汉堡按钮动画效果
            navToggle.classList.toggle('active');
        });

        // 点击导航链接后关闭菜单
        navLinks.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-link')) {
                navLinks.classList.remove('open');
                navToggle.classList.remove('active');
            }
        });

        // 点击页面其他区域关闭菜单
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-link')) {
                navLinks.classList.remove('open');
                navToggle.classList.remove('active');
            }
        });
    }

    // 关于区域交互感：光晕随鼠标移动
    const aboutSection = document.querySelector('.about');
    const aboutAura = document.querySelector('.about-aura');
    if (aboutSection && aboutAura) {
        aboutSection.addEventListener('mousemove', (e) => {
            const rect = aboutSection.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // 计算偏移量
            const moveX = (x / rect.width - 0.5) * 50;
            const moveY = (y / rect.height - 0.5) * 50;

            gsap.to(aboutAura, {
                x: moveX,
                y: moveY,
                duration: 2,
                ease: "power2.out"
            });
        });
    }
});



// 添加滚动进度指示器
function createScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, #ffffff, #000000);
        z-index: 1001;
        transition: width 0.1s ease;
    `;

    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        progressBar.style.width = scrollPercent + '%';
    });
}

// 初始化滚动进度条
createScrollProgress();

// 通用项目加载函数
function loadProjects(containerId = 'galactic-timeline') {
    fetch('projects/list.json')
        .then(res => res.json())
        .then(projectFiles => {
            const container = document.getElementById(containerId);
            if (!container) return;
            
            // 现在的逻辑默认全量展示在星系时间轴中
            renderGalacticTimeline(container, projectFiles);
        })
        .catch(err => console.error('Error loading projects:', err));
}

// 渲染星系时间轴布局 (海量数据优化版)
function renderGalacticTimeline(container, projects) {
    const nodesContainer = container.querySelector('.galactic-nodes') || (function() {
        const div = document.createElement('div');
        div.className = 'galactic-nodes';
        container.appendChild(div);
        return div;
    })();
    
    let svg = container.querySelector('.galactic-svg') || (function() {
        const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        s.setAttribute("class", "galactic-svg");
        container.insertBefore(s, nodesContainer);
        return s;
    })();
    
    nodesContainer.innerHTML = '';
    svg.innerHTML = '';
    
    // 注入梯度定义 (Linear Gradient for the path)
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.innerHTML = `
        <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="white" stop-opacity="0" />
            <stop offset="20%" stop-color="white" stop-opacity="0.1" />
            <stop offset="50%" stop-color="white" stop-opacity="0.3" />
            <stop offset="80%" stop-color="white" stop-opacity="0.1" />
            <stop offset="100%" stop-color="white" stop-opacity="0" />
        </linearGradient>
    `;
    svg.appendChild(defs);
    
    const count = projects.length;
    if (count === 0) return;

    const parentContainer = container.parentElement; // galactic-timeline-container
    const viewportWidth = parentContainer.offsetWidth;
    const containerHeight = 400;
    
    // 智能间距压缩逻辑
    let spacing = viewportWidth / (count + 1);
    const minSpacing = 180; // 节点极多时压缩到 180px
    const maxSpacing = 400; 
    spacing = Math.min(Math.max(spacing, minSpacing), maxSpacing);
    
    const sideMargin = 150; // 左右留白
    const totalContentWidth = spacing * count + sideMargin * 2;
    const startX = (totalContentWidth < viewportWidth) ? (viewportWidth - totalContentWidth) / 2 : sideMargin;
    
    // 设置容器宽度：使其刚好容纳所有节点及留白，严禁滑出界限
    container.style.width = `${Math.max(totalContentWidth, viewportWidth)}px`;
    
    // --- 新增：边缘感应自动滑动 (Magnetic Edge Scrolling) ---
    if (!parentContainer.dataset.magneticInit) {
        let scrollSpeed = 0;
        let animationFrame;
        
        const updateScroll = () => {
            if (scrollSpeed !== 0) {
                parentContainer.scrollLeft += scrollSpeed;
            }
            animationFrame = requestAnimationFrame(updateScroll);
        };
        
        parentContainer.addEventListener('mousemove', (e) => {
            const rect = parentContainer.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const threshold = 200; // 扩大感应区域宽度
            
            if (mouseX < threshold) {
                // 靠近左边缘：产生向左的动力
                scrollSpeed = -((threshold - mouseX) / threshold) * 20; // 提高最大速度
            } else if (mouseX > rect.width - threshold) {
                // 靠近右边缘：产生向右的动力
                const dist = mouseX - (rect.width - threshold);
                scrollSpeed = (dist / threshold) * 20; // 提高最大速度
            } else {
                scrollSpeed = 0;
            }
        });
        
        parentContainer.addEventListener('mouseleave', () => {
            scrollSpeed = 0;
        });
        
        animationFrame = requestAnimationFrame(updateScroll);
        parentContainer.dataset.magneticInit = "true";
    }
    

    
    const points = [];
    
    projects.forEach((file, i) => {
        const x = startX + spacing * (i + 0.5); 
        
        // 动态起伏高度：波浪会随节点顺序平滑波动
        const y = containerHeight / 2 + Math.sin(i * 1.2) * 90;
        
        points.push({x, y});
        
        const node = document.createElement('div');
        // 随机分配大小等级：增加视觉丰富度
        const sizeClass = ['planet-sm', 'planet-md', 'planet-lg'][i % 3]; 
        node.className = `planet-node ${sizeClass}`;
        node.style.left = `${x}px`;
        node.style.top = `${y}px`;
        
        const labelPosClass = (y > containerHeight / 2) ? 'label-top' : 'label-bottom';
        const fileName = file.replace(/\.md$/, '');
        
        node.innerHTML = `
            <div class="planet-visual">
                <div class="planet-ring"></div>
                <div class="planet-body"></div>
                <div class="planet-glow"></div>
            </div>
            <div class="planet-label ${labelPosClass}" title="${fileName}">${fileName}</div>
        `;
        
        node.onclick = () => {
            window.location.href = `project-view.html?file=projects/${encodeURIComponent(file)}`;
        };
        
        nodesContainer.appendChild(node);
    });
    
    // --- 核心重构：以太纤波轨道 (Nebula Threads) ---
    if (points.length > 1) {
        // 定义三种不同扰动的路径
        const createPathD = (offsetY = 0, tension = 0.6) => {
            let d = `M ${points[0].x} ${points[0].y + offsetY}`;
            for (let i = 0; i < points.length - 1; i++) {
                const p0 = points[i];
                const p1 = points[i + 1];
                const cp1x = p0.x + (p1.x - p0.x) * tension;
                const cp2x = p1.x - (p1.x - p0.x) * (tension + 0.05); // 稍微不对称
                d += ` C ${cp1x} ${p0.y + offsetY}, ${cp2x} ${p1.y + offsetY}, ${p1.x} ${p1.y + offsetY}`;
            }
            return d;
        };

        // 1. 渲染三层极细丝线
        const pathConfigs = [
            { class: 'path-core', offset: 0, tension: 0.6 },
            { class: 'path-aura-1', offset: 2, tension: 0.62 },
            { class: 'path-aura-2', offset: -2, tension: 0.58 }
        ];

        pathConfigs.forEach(cfg => {
            const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
            p.setAttribute("d", createPathD(cfg.offset, cfg.tension));
            p.setAttribute("class", `galactic-path ${cfg.class}`);
            svg.appendChild(p);
        });

        // 2. 渲染光子微粒流 (取代刻板的流光段)
        for (let i = 0; i < 5; i++) {
            const photon = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            photon.setAttribute("r", 2);
            photon.setAttribute("class", "galactic-photon");
            // 给每个光子分配不同的动画延迟和速度
            photon.style.animationDelay = `${i * 1.5}s`;
            photon.style.animationDuration = `${5 + Math.random() * 3}s`;
            
            // 为光子创建一个独立的路径引用（隐藏）
            const animatePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
            animatePath.setAttribute("d", createPathD(0, 0.6));
            animatePath.setAttribute("id", `photon-path-${i}`);
            animatePath.style.fill = "none";
            svg.appendChild(animatePath);

            // 使用 mpath 让光子沿路径移动
            const anim = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");
            anim.setAttribute("dur", `${6 + Math.random() * 4}s`);
            anim.setAttribute("repeatCount", "indefinite");
            const mpath = document.createElementNS("http://www.w3.org/2000/svg", "mpath");
            mpath.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", `#photon-path-${i}`);
            anim.appendChild(mpath);
            photon.appendChild(anim);
            
            svg.appendChild(photon);
        }
        
        // 3. 繁星背景（调淡并增加景深感）
        const starsCount = Math.min(count * 10, 200);
        for (let i = 0; i < starsCount; i++) {
            const star = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            star.setAttribute("cx", Math.random() * totalContentWidth);
            star.setAttribute("cy", Math.random() * containerHeight);
            star.setAttribute("r", Math.random() * 1.2);
            star.setAttribute("class", "galactic-dust");
            star.style.animationDelay = `${Math.random() * 5}s`;
            star.style.opacity = Math.random() * 0.3;
            svg.appendChild(star);
        }
    }

    // --- 新增：GSAP 入场动画与动态漂浮 ---
    const nodes = container.querySelectorAll('.planet-node');
    if (typeof gsap !== 'undefined') {
        gsap.from(nodes, {
            y: "+=50",
            opacity: 0,
            scale: 0.5,
            duration: 1,
            stagger: 0.15,
            ease: "back.out(1.7)",
            onComplete: () => {
                // 入场后开启各自的微小漂浮动画
                nodes.forEach((node, i) => {
                    const driftY = 5 + Math.random() * 10;
                    const duration = 3 + Math.random() * 3;
                    gsap.to(node, {
                        y: `+=${driftY}`,
                        duration: duration,
                        repeat: -1,
                        yoyo: true,
                        ease: "sine.inOut",
                        delay: i * 0.2
                    });
                });
            }
        });
    }
}

/* ===== Cosmic Universe Background (Three.js) ===== */
class CosmicUniverse {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container || typeof THREE === 'undefined') return;

        this.init();
        this.animate();
        this.handleResize();
    }

    init() {
        // Scene & Fog
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x050505, 0.002);

        // Camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        // Clock
        this.clock = new THREE.Clock();

        // Particles Layer 1
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 3000;
        const posArray = new Float32Array(particlesCount * 3);
        const sizesArray = new Float32Array(particlesCount);

        for (let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 25;
        }
        for (let i = 0; i < particlesCount; i++) {
            sizesArray[i] = Math.random();
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizesArray, 1));

        const material = new THREE.PointsMaterial({
            size: 0.03,
            color: 0xffffff,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        this.particlesMesh = new THREE.Points(particlesGeometry, material);
        this.scene.add(this.particlesMesh);

        // Particles Layer 2 (Blue Stars)
        const bgStarsGeometry = new THREE.BufferGeometry();
        const bgStarsCount = 5000;
        const bgPosArray = new Float32Array(bgStarsCount * 3);
        for (let i = 0; i < bgStarsCount * 3; i++) {
            bgPosArray[i] = (Math.random() - 0.5) * 80;
        }
        bgStarsGeometry.setAttribute('position', new THREE.BufferAttribute(bgPosArray, 3));

        const starsMaterial = new THREE.PointsMaterial({
            size: 0.05,
            color: 0x88ccff,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });

        this.bgStarsMesh = new THREE.Points(bgStarsGeometry, starsMaterial);
        this.scene.add(this.bgStarsMesh);

        // Mouse interaction state
        this.mouseX = 0;
        this.mouseY = 0;
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX - window.innerWidth / 2;
            this.mouseY = e.clientY - window.innerHeight / 2;
        });

        // Intro Animation
        if (typeof gsap !== 'undefined') {
            gsap.from(this.camera.position, {
                z: 10,
                duration: 3,
                ease: "power3.inOut"
            });
        }
    }

    handleResize() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    animate() {
        const elapsedTime = this.clock.getElapsedTime();

        // Rotation
        this.particlesMesh.rotation.y = elapsedTime * 0.05;
        this.particlesMesh.rotation.x = elapsedTime * 0.02;
        this.bgStarsMesh.rotation.y = elapsedTime * 0.01;

        // Parallax
        const targetX = this.mouseX * 0.001;
        const targetY = this.mouseY * 0.001;
        this.particlesMesh.rotation.y += 0.5 * (targetX - this.particlesMesh.rotation.y);
        this.particlesMesh.rotation.x += 0.05 * (targetY - this.particlesMesh.rotation.x);

        this.camera.position.x += (this.mouseX * 0.005 - this.camera.position.x) * 0.05;
        this.camera.position.y += (-this.mouseY * 0.005 - this.camera.position.y) * 0.05;

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(() => this.animate());
    }
}

// Auto-initialize background if container exists
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('canvas-container')) {
        new CosmicUniverse('canvas-container');
    } else if (document.getElementById('canvas-background')) {
        // Some pages use 'canvas-background' ID
        const container = document.getElementById('canvas-background').parentElement;
        // In case 'canvas-background' is a container not a canvas
        const bgEl = document.getElementById('canvas-background');
        if (bgEl.tagName !== 'CANVAS') {
            new CosmicUniverse('canvas-background');
        } else {
            // If it IS a canvas, we might need a container or replace it.
            // For simplicity, let's assume it's a wrapper ID in most of our pages.
            new CosmicUniverse('canvas-background');
        }
    }
});