/**
 * Shared Utility Functions
 */

// Escape HTML to prevent XSS
window.escapeHtml = function(s) {
    return String(s || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

// Common Skeleton Loading Generator
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

// Generalized Entrance Animation
window.initEntranceAnimation = function(selectors = ['.back-button', '.trending-header', '.trending-title', '.trending-subtitle', '.tools-title', '.tools-subtitle', '.tools-search', '.filters', '.source-tabs', '#controls', '.category-filter', '.source-toggle']) {
    if (typeof gsap === 'undefined') return;
    
    // Select all elements that match any of the selectors
    const allElements = selectors.reduce((acc, s) => {
        const found = document.querySelectorAll(s);
        return acc.concat(Array.from(found));
    }, []);
    
    if (allElements.length === 0) return;

    gsap.set(allElements, { opacity: 0, y: -100, scale: 0.9, rotationX: 10 });
    gsap.to(allElements, {
        opacity: 1, 
        y: 0, 
        scale: 1, 
        rotationX: 0,
        duration: 1.0, 
        stagger: 0.06, 
        ease: "power4.out", 
        delay: 0.05
    });
};

// Generalized Card Animation
window.animateCards = function(gridElement) {
    if (typeof gsap === 'undefined' || !gridElement) return;

    // Only animate visible cards
    const cards = Array.from(gridElement.querySelectorAll('.trending-card, .tool-card'))
        .filter(card => getComputedStyle(card).display !== 'none');
        
    if (cards.length === 0) return;

    const windowCenter = window.innerWidth / 2;
    
    cards.forEach((card) => {
        card.style.transition = 'none'; 
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        
        let startX = 0, startY = 80, startRotY = 0, startRotX = 15;
        if (cardCenter < windowCenter - 200) {
            startX = -100; startRotY = -20;
        } else if (cardCenter > windowCenter + 200) {
            startX = 100; startRotY = 20;
        } else {
            startY = 120;
        }
        
        gsap.set(card, {
            opacity: 0, x: startX, y: startY, z: -100,
            rotationX: startRotX, rotationY: startRotY, rotationZ: 0, scale: 0.98
        });
    });

    gsap.to(cards, {
        opacity: 1, x: 0, y: 0, z: 0, rotationX: 0, rotationY: 0, rotationZ: 0, scale: 1,
        duration: 0.8,
        stagger: { amount: 0.3, from: "center" },
        ease: "power3.out",
        onComplete: () => { cards.forEach(c => c.style.transition = ''); },
        clearProps: "transform,opacity"
    });
};

// Google Analytics Loader
window.initGA = function(id = 'G-RBTWR9QNMQ') {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', id);
};
