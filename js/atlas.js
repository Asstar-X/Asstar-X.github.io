/**
 * Tools Page Logic
 * Handles filtering and search
 */

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
        
        let matchCat = false;
        if (currentCategory === 'all') {
            matchCat = true;
        } else if (currentCategory === 'local') {
            matchCat = (src === 'local');
        } else {
            matchCat = (cat === currentCategory);
        }
        
        if (matchSearch && matchCat) {
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
