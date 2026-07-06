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

// 鼠标跟随粒子拖尾效果 (Canvas 高性能优化版，集成全局配置开关)
(function() {
    // 延迟读取配置，确保 config.js 已加载，或者使用默认参数
    const getUiConfig = () => {
        return (window.AsstarConfig && window.AsstarConfig.ui) || {
            enableCursorTrail: true,
            cursorTrailColor: 'rgba(255, 255, 255, 0.75)',
            cursorTrailCount: 30,
            cursorTrailSize: 3
        };
    };

    const uiConfig = getUiConfig();
    if (!uiConfig.enableCursorTrail) return;

    // 创建全屏 Canvas
    const canvas = document.createElement('canvas');
    canvas.className = 'cursor-trail-canvas';
    canvas.style.cssText = `
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 99999;
    `;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let particles = [];
    let isLooping = false;

    // 自动缩放 Canvas
    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 鼠标移动监听，向粒子池添加粒子，并按需唤醒渲染循环
    window.addEventListener('mousemove', (e) => {
        const cfg = getUiConfig();
        if (!cfg.enableCursorTrail) return;

        // 如果超出最大数量，则不再生成新粒子
        if (particles.length >= cfg.cursorTrailCount) return;

        particles.push({
            x: e.clientX,
            y: e.clientY,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8,
            alpha: 1.0,
            size: cfg.cursorTrailSize * (0.8 + Math.random() * 0.4),
            decay: 0.02 + Math.random() * 0.015
        });

        // 如果渲染循环没跑起来，唤醒它
        if (!isLooping) {
            isLooping = true;
            requestAnimationFrame(drawParticles);
        }
    }, { passive: true });

    // 核心渲染与状态机循环
    function drawParticles() {
        const cfg = getUiConfig();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (particles.length === 0) {
            isLooping = false;
            return; // 粒子池耗尽，暂停循环以节省 CPU/GPU 开销
        }

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            
            // 物理运动微移
            p.x += p.vx;
            p.y += p.vy;
            
            // 粒子渐隐衰减
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                particles.splice(i, 1);
                i--;
                continue;
            }

            // 绘制粒子
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.alpha, 0, Math.PI * 2);
            ctx.fillStyle = cfg.cursorTrailColor;
            ctx.fill();
            ctx.restore();
        }

        requestAnimationFrame(drawParticles);
    }
})();

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', () => {
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

    // 关于区域交互感：光晕随鼠标移动 (性能优化：缓存 bounding rect 避免 layout thrashing)
    const aboutSection = document.querySelector('.about');
    const aboutAura = document.querySelector('.about-aura');
    if (aboutSection && aboutAura) {
        let rect = null;
        
        const updateRect = () => {
            rect = aboutSection.getBoundingClientRect();
        };

        aboutSection.addEventListener('mouseenter', updateRect);
        
        window.addEventListener('resize', () => { if (rect) updateRect(); });
        window.addEventListener('scroll', () => { if (rect) updateRect(); }, { passive: true });

        aboutSection.addEventListener('mousemove', (e) => {
            if (!rect) updateRect();
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

        aboutSection.addEventListener('mouseleave', () => {
            rect = null;
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
    }
});