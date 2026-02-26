/* js/time-rift.js */
document.addEventListener('DOMContentLoaded', () => {
    // 只有带有 time-rift-main 元素的页面（index.html）才会启动时间裂缝引擎
    const mainContainer = document.getElementById('time-rift-main');
    if (!mainContainer) return;

    const sections = Array.from(document.querySelectorAll('.rift-section'));
    if (sections.length === 0) return;

    // 创建右侧导航点
    const indicatorContainer = document.createElement('div');
    indicatorContainer.className = 'time-rift-indicator';
    sections.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = `rift-dot ${index === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => {
            targetProgress = index;
            updateDots();
        });
        indicatorContainer.appendChild(dot);
    });
    document.body.appendChild(indicatorContainer);

    let targetProgress = 0;
    let currentProgress = 0;
    const maxProgress = sections.length - 1;
    let isAnimating = false;

    // 参数设置
    const zOffset = 2500; // 每一层之间的Z轴跨度
    const lerpSpeed = 0.12; // 提升平滑度，让动画感觉更迅速顺滑
    let scrollCooldown = false; // 用于限制单次滑动跳跃多页

    // 禁用默认键盘滚动并绑定按键
    window.addEventListener('keydown', (e) => {
        if (['ArrowDown', 'PageDown', 'Space'].includes(e.code)) {
            e.preventDefault();
            targetProgress = Math.min(maxProgress, Math.round(targetProgress + 1));
            updateDots();
        } else if (['ArrowUp', 'PageUp'].includes(e.code)) {
            e.preventDefault();
            targetProgress = Math.max(0, Math.round(targetProgress - 1));
            updateDots();
        }
    });

    // 监听滚轮事件
    window.addEventListener('wheel', (e) => {
        // 防止页面在移动时默认滚动
        e.preventDefault();

        // 处于冷却期，不再接受新滚动信号
        if (scrollCooldown) return;

        // 设置阈值，只要有滑动倾向就触发，但保证只跳一页
        if (Math.abs(e.deltaY) > 10) {
            const direction = e.deltaY > 0 ? 1 : -1;
            targetProgress = Math.max(0, Math.min(maxProgress, Math.round(targetProgress + direction)));
            updateDots();

            // 锁定滚动，稍短的冷却时间提升响应手感
            scrollCooldown = true;
            setTimeout(() => {
                scrollCooldown = false;
            }, 600);
        }
    }, { passive: false });

    // 触摸屏支持
    let touchStartY = 0;
    window.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
        e.preventDefault(); // 防止默认滚动
    }, { passive: false });

    window.addEventListener('touchend', (e) => {
        const touchEndY = e.changedTouches[0].clientY;
        const delta = touchStartY - touchEndY;
        
        if (Math.abs(delta) > 30) {
            if (scrollCooldown) return;
            const direction = delta > 0 ? 1 : -1;
            targetProgress = Math.max(0, Math.min(maxProgress, Math.round(targetProgress + direction)));
            updateDots();
            
            scrollCooldown = true;
            setTimeout(() => {
                scrollCooldown = false;
            }, 600);
        }
    });

    function updateDots() {
        const dots = document.querySelectorAll('.rift-dot');
        const activeIndex = Math.round(targetProgress);
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === activeIndex);
        });
    }

    // 视觉特效 (视网膜/时空曲率)
    function applyRiftVisuals(distance, section) {
        // distance: 当前进度与章节索引的差值 (index - currentProgress)
        // =0: 当前聚焦页
        // >0: 目标在未来（需要往下滚），应处于屏幕深处
        // <0: 目标在过去（已经滚过去），应处于屏幕前方，甚至飞越脑后

        let z = distance * zOffset;
        let opacity = 0;
        let filter = 'none';
        let scale = 1;

        if (distance === 0) {
            opacity = 1;
            z = 0;
            scale = 1;
        } else if (distance > 0) {
            // 在屏幕深处 (未来要到达的地方)
            opacity = 1 - distance * 1.2; // 调整系数，确保距离为 1 时 opacity 彻底为 0
            filter = 'none'; // 移除极容易掉帧的 blur，大幅提升流畅度
            scale = 1 - distance * 0.15; // 远处轻微缩小增强透视感
        } else {
            // 在屏幕前方 (已经浏览过，飞向镜头)
            opacity = 1 - Math.abs(distance) * 1.5; // 靠近镜头迅速淡出
            scale = 1 + Math.abs(distance) * 0.5;   // 扑面而来的放大感
            filter = 'none'; // 移除高耗能的滤镜
        }

        // 限制极端值
        opacity = Math.max(0, Math.min(1, opacity));

        // 动态计算 z-index：保证视觉上在前面的元素，DOM 渲染层级也最高
        // distance 越小（越负，即越靠近镜头），z-index 越大
        const zIndex = Math.round(100 - distance * 10);

        // 应用样式 (启用3D硬件加速)
        if (opacity > 0.01) {
            section.style.visibility = 'visible';
            section.style.pointerEvents = distance === 0 && Math.abs(currentProgress - targetProgress) < 0.1 ? 'auto' : 'none';
            section.style.opacity = opacity;
            section.style.transform = `translate3d(0, 0, ${-z}px) scale(${scale})`;
            section.style.filter = filter;
            section.style.zIndex = zIndex;
            section.classList.toggle('is-active', Math.abs(distance) < 0.1);
        } else {
            section.style.visibility = 'hidden';
            section.style.pointerEvents = 'none';
        }
    }

    // 主渲染循环
    function render() {
        // 软插值 (Lerp)
        currentProgress += (targetProgress - currentProgress) * lerpSpeed;

        // 如果仍在运动，更新所有 section 的状态
        if (Math.abs(targetProgress - currentProgress) > 0.001) {
            sections.forEach((section, index) => {
                const distance = index - currentProgress;
                applyRiftVisuals(distance, section);
            });
            isAnimating = true;
        } else if (isAnimating) {
            // 停靠瞬间进行最后一次精确绘制
            currentProgress = targetProgress;
            sections.forEach((section, index) => {
                const distance = index - currentProgress;
                applyRiftVisuals(distance, section);
            });
            isAnimating = false;
        }

        requestAnimationFrame(render);
    }

    // 初始化所有部分状态
    sections.forEach((section, index) => {
        const distance = index - currentProgress;
        applyRiftVisuals(distance, section);
    });

    // 启动渲染循环
    requestAnimationFrame(render);

    // 重写 scrollToSection 让其兼容时间裂缝
    window.scrollToSection = function(sectionId) {
        const index = sections.findIndex(s => s.id === sectionId);
        if (index !== -1) {
            targetProgress = index;
            updateDots();
        }
    };

    // 拦截所有的描点链接
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        // 先移除旧的事件以防冲突（如果可能）或是直接通过在此处添加确保较高优先级
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href').substring(1);
            const index = sections.findIndex(s => s.id === targetId);
            if (index !== -1) {
                e.preventDefault();
                e.stopPropagation(); // 阻止 script.js 中的响应
                targetProgress = index;
                updateDots();
            }
        });
    });
});
