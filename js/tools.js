/**
 * Tools Page Logic
 * Handles filtering and search
 */

let currentSource = 'all';
let currentCategory = 'all';

// --- Filtering Functions ---

function filterTools(value) {
    const query = (value || '').trim().toLowerCase();
    const cards = document.querySelectorAll('.trending-card');
    
    cards.forEach(card => {
        const text = card.innerText.toLowerCase();
        const src = card.getAttribute('data-source') || 'external';
        const cat = card.getAttribute('data-category') || 'other';
        
        const matchSearch = query ? text.includes(query) : true;
        const matchSrc = currentSource === 'all' ? true : (src === currentSource);
        const matchCat = currentCategory === 'all' ? true : (cat === currentCategory);
        
        if (matchSearch && matchSrc && matchCat) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });

    // Animate the resulting visible set
    if (window.animateCards) {
        const grid = document.getElementById('tools-grid');
        if (grid) window.animateCards(grid);
    }
}

function setCategory(cat, el) {
    currentCategory = cat;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    if (el) el.classList.add('active');
    const input = document.querySelector('.tools-input');
    filterTools(input ? input.value : '');
}

function setSource(src, el) {
    currentSource = src;
    document.querySelectorAll('.source-toggle button').forEach(b => b.classList.remove('active'));
    if (el) el.classList.add('active');
    const input = document.querySelector('.tools-input');
    filterTools(input ? input.value : '');
}

// --- Initializations ---

document.addEventListener('DOMContentLoaded', () => {
    // Initialize animations
    if (window.initEntranceAnimation) window.initEntranceAnimation();
    if (window.animateCards) {
        const grid = document.querySelector('.trending-grid');
        if (grid) window.animateCards(grid);
    }

    // Initialize sprite chat if manager exists
    if (window.SpriteChatManager) {
        window.spriteChatManager = new window.SpriteChatManager();
    }
});
