/**
 * Promotions, Banners and Countdown Timers System
 */

// Promotions Data
const promotions = [
    {
        id: 1,
        title: "🌹 День Святого Валентина",
        description: "Скидка 25% на все букеты роз! Романтика по специальной цене",
        discount: "25%",
        endDate: "2026-02-14T23:59:59",
        banner: {
            background: "linear-gradient(135deg, #ff6b9d 0%, #c06c84 100%)",
            emoji: "💝",
            position: "hero"
        },
        code: "LOVE2026",
        active: true,
        type: "seasonal"
    },
    {
        id: 2,
        title: "🎉 Весенняя распродажа",
        description: "До 40% скидки на тюльпаны и нарциссы",
        discount: "До 40%",
        endDate: "2026-03-31T23:59:59",
        banner: {
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            emoji: "🌷",
            position: "promo"
        },
        code: "SPRING40",
        active: true,
        type: "seasonal"
    },
    {
        id: 3,
        title: "⚡ Flash Sale",
        description: "Быстрая распродажа! 3 часа до окончания",
        discount: "50%",
        endDate: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
        banner: {
            background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
            emoji: "⚡",
            position: "floating"
        },
        code: "FLASH50",
        active: true,
        type: "flash"
    },
    {
        id: 4,
        title: "🎁 Бонус за первый заказ",
        description: "Получите сертификат 500₽ при первом заказе от 3000₽",
        discount: "500₽",
        endDate: "2026-12-31T23:59:59",
        banner: {
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            emoji: "🎁",
            position: "promo"
        },
        code: "FIRST500",
        active: true,
        type: "welcome"
    },
    {
        id: 5,
        title: "💐 Букет дня",
        description: "Специальное предложение на букет дня со скидкой 30%",
        discount: "30%",
        endDate: new Date(new Date().setHours(23, 59, 59)).toISOString(),
        banner: {
            background: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
            emoji: "💐",
            position: "promo"
        },
        code: "DAILY30",
        active: true,
        type: "daily"
    }
];

// Initialize promotions
function initializePromotions() {
    renderHeroBanner();
    renderPromoBanners();
    renderFloatingBanner();
    startCountdownTimers();
    
    // Update timers every second
    setInterval(updateAllTimers, 1000);
}

// Render Hero Banner (main promotional banner)
function renderHeroBanner() {
    const heroPromo = promotions.find(p => p.active && p.banner.position === 'hero');
    if (!heroPromo) return;

    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;

    // Create promo banner above hero
    const promoBanner = document.createElement('div');
    promoBanner.className = 'hero-promo-banner';
    promoBanner.style.background = heroPromo.banner.background;
    promoBanner.innerHTML = '<div class="container">' +
        '<div class="hero-promo-content">' +
        '<div class="hero-promo-emoji">' + heroPromo.banner.emoji + '</div>' +
        '<div class="hero-promo-text">' +
        '<h3 class="hero-promo-title">' + heroPromo.title + '</h3>' +
        '<p class="hero-promo-description">' + heroPromo.description + '</p>' +
        '</div>' +
        '<div class="hero-promo-timer">' +
        '<div class="timer-label">До окончания:</div>' +
        '<div class="timer-display" id="timer-hero-' + heroPromo.id + '"></div>' +
        '</div>' +
        '<button class="hero-promo-btn" onclick="applyPromoCode(\'' + heroPromo.code + '\')">' +
        'Применить промокод ' + heroPromo.code +
        '</button>' +
        '</div>' +
        '</div>';

    heroSection.parentNode.insertBefore(promoBanner, heroSection);
}

// Render Promo Banners Section
function renderPromoBanners() {
    const promoPromotions = promotions.filter(p => p.active && p.banner.position === 'promo');
    if (promoPromotions.length === 0) return;

    // Create promo section after hero
    const promoSection = document.createElement('section');
    promoSection.className = 'promo-section';
    promoSection.innerHTML = '<div class="container">' +
        '<h2 class="section-title">🎉 Акции и специальные предложения</h2>' +
        '<div class="promo-grid" id="promo-grid"></div>' +
        '</div>';

    const hero = document.querySelector('.hero');
    if (hero && hero.nextElementSibling) {
        hero.parentNode.insertBefore(promoSection, hero.nextElementSibling);
    }

    // Render promo cards
    const promoGrid = document.getElementById('promo-grid');
    promoGrid.innerHTML = promoPromotions.map(promo => '<div class="promo-card" style="background: ' + promo.banner.background + '">' +
        '<div class="promo-card-badge">' + promo.discount + '</div>' +
        '<div class="promo-card-emoji">' + promo.banner.emoji + '</div>' +
        '<h3 class="promo-card-title">' + promo.title + '</h3>' +
        '<p class="promo-card-description">' + promo.description + '</p>' +
        '<div class="promo-card-timer">' +
        '<div class="timer-small" id="timer-promo-' + promo.id + '"></div>' +
        '</div>' +
        '<div class="promo-card-code">' +
        '<span class="code-label">Промокод:</span>' +
        '<span class="code-value" onclick="copyPromoCode(\'' + promo.code + '\')">' + promo.code + ' 📋</span>' +
        '</div>' +
        '<button class="promo-card-btn" onclick="applyPromoCode(\'' + promo.code + '\')">Применить</button>' +
        '</div>').join('');
}

// Render Floating Banner
function renderFloatingBanner() {
    const floatingPromo = promotions.find(p => p.active && p.banner.position === 'floating');
    if (!floatingPromo) return;

    const banner = document.createElement('div');
    banner.className = 'floating-promo-banner';
    banner.style.background = floatingPromo.banner.background;
    banner.innerHTML = '<div class="floating-promo-content">' +
        '<button class="floating-promo-close" onclick="this.parentElement.parentElement.remove()">✕</button>' +
        '<div class="floating-promo-emoji">' + floatingPromo.banner.emoji + '</div>' +
        '<div class="floating-promo-text">' +
        '<div class="floating-promo-title">' + floatingPromo.title + '</div>' +
        '<div class="floating-promo-discount">' + floatingPromo.discount + ' СКИДКА</div>' +
        '</div>' +
        '<div class="floating-promo-timer" id="timer-floating-' + floatingPromo.id + '"></div>' +
        '<button class="floating-promo-btn" onclick="applyPromoCode(\'' + floatingPromo.code + '\')">Применить</button>' +
        '</div>';

    document.body.appendChild(banner);

    // Auto show after 3 seconds
    setTimeout(() => {
        banner.classList.add('active');
    }, 3000);
}

// Start countdown timers
function startCountdownTimers() {
    updateAllTimers();
}

// Update all timers
function updateAllTimers() {
    promotions.forEach(promo => {
        if (!promo.active) return;

        const timeRemaining = getTimeRemaining(promo.endDate);
        
        // Update hero timer
        const heroTimer = document.getElementById('timer-hero-' + promo.id);
        if (heroTimer) {
            heroTimer.innerHTML = formatTimerLarge(timeRemaining);
        }

        // Update promo timer
        const promoTimer = document.getElementById('timer-promo-' + promo.id);
        if (promoTimer) {
            promoTimer.innerHTML = formatTimerSmall(timeRemaining);
        }

        // Update floating timer
        const floatingTimer = document.getElementById('timer-floating-' + promo.id);
        if (floatingTimer) {
            floatingTimer.innerHTML = formatTimerCompact(timeRemaining);
        }

        // Deactivate if expired
        if (timeRemaining.total <= 0) {
            promo.active = false;
            // Remove expired banners
            const elements = document.querySelectorAll('[id*="timer-' + promo.id + '"]');
            elements.forEach(el => {
                const card = el.closest('.promo-card, .floating-promo-banner, .hero-promo-banner');
                if (card) card.remove();
            });
        }
    });
}

// Get time remaining
function getTimeRemaining(endDate) {
    const total = Date.parse(endDate) - Date.now();
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));

    return { total, days, hours, minutes, seconds };
}

// Format timer (large)
function formatTimerLarge(time) {
    if (time.total <= 0) return '<div class="timer-expired">Акция завершена</div>';

    return '<div class="timer-units">' +
        '<div class="timer-unit">' +
        '<div class="timer-value">' + (time.days || 0) + '</div>' +
        '<div class="timer-label">дней</div>' +
        '</div>' +
        '<div class="timer-separator">:</div>' +
        '<div class="timer-unit">' +
        '<div class="timer-value">' + padZero(time.hours) + '</div>' +
        '<div class="timer-label">часов</div>' +
        '</div>' +
        '<div class="timer-separator">:</div>' +
        '<div class="timer-unit">' +
        '<div class="timer-value">' + padZero(time.minutes) + '</div>' +
        '<div class="timer-label">минут</div>' +
        '</div>' +
        '<div class="timer-separator">:</div>' +
        '<div class="timer-unit">' +
        '<div class="timer-value">' + padZero(time.seconds) + '</div>' +
        '<div class="timer-label">секунд</div>' +
        '</div>' +
        '</div>';
}

// Format timer (small)
function formatTimerSmall(time) {
    if (time.total <= 0) return '<span class="timer-expired">Завершено</span>';

    if (time.days > 0) {
        return '⏰ ' + time.days + 'д ' + padZero(time.hours) + 'ч ' + padZero(time.minutes) + 'м';
    }
    return '⏰ ' + padZero(time.hours) + ':' + padZero(time.minutes) + ':' + padZero(time.seconds);
}

// Format timer (compact)
function formatTimerCompact(time) {
    if (time.total <= 0) return 'Завершено';
    
    if (time.days > 0) {
        return time.days + 'д ' + padZero(time.hours) + ':' + padZero(time.minutes) + ':' + padZero(time.seconds);
    }
    return padZero(time.hours) + ':' + padZero(time.minutes) + ':' + padZero(time.seconds);
}

// Pad with zero
function padZero(num) {
    return num < 10 ? '0' + num : num;
}

// Apply promo code
function applyPromoCode(code) {
    const promo = promotions.find(p => p.code === code);
    if (!promo) return;

    // Save to localStorage
    localStorage.setItem('activePromoCode', code);
    localStorage.setItem('promoCodeData', JSON.stringify(promo));

    showNotification('Промокод ' + code + ' применен! Скидка ' + promo.discount);

    // Scroll to catalog
    document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });

    // Track event
    if (typeof SEOAPI !== 'undefined') {
        SEOAPI.trackEvent('Promo', 'apply_code', code);
    }
}

// Copy promo code to clipboard
function copyPromoCode(code) {
    navigator.clipboard.writeText(code).then(() => {
        showNotification('Промокод ' + code + ' скопирован!');
    });

    // Track event
    if (typeof SEOAPI !== 'undefined') {
        SEOAPI.trackEvent('Promo', 'copy_code', code);
    }
}

// Get active promo code
function getActivePromoCode() {
    const code = localStorage.getItem('activePromoCode');
    const promoData = localStorage.getItem('promoCodeData');
    
    if (!code || !promoData) return null;

    const promo = JSON.parse(promoData);
    
    // Check if expired
    const timeRemaining = getTimeRemaining(promo.endDate);
    if (timeRemaining.total <= 0) {
        localStorage.removeItem('activePromoCode');
        localStorage.removeItem('promoCodeData');
        return null;
    }

    return promo;
}

// Apply promo discount to price
function applyPromoDiscount(price) {
    const promo = getActivePromoCode();
    if (!promo) return price;

    // Parse discount
    const discountMatch = promo.discount.match(/(\d+)%/);
    if (discountMatch) {
        const discountPercent = parseInt(discountMatch[1]);
        return Math.round(price * (1 - discountPercent / 100));
    }

    // Fixed amount discount
    const amountMatch = promo.discount.match(/(\d+)₽/);
    if (amountMatch) {
        const discountAmount = parseInt(amountMatch[1]);
        return Math.max(0, price - discountAmount);
    }

    return price;
}

// Show promo notification on page load
function showPromoNotification() {
    const activePromos = promotions.filter(p => p.active && p.type === 'flash');
    
    if (activePromos.length > 0 && !localStorage.getItem('promoNotificationShown')) {
        setTimeout(() => {
            const promo = activePromos[0];
            showNotification('⚡ ' + promo.title + ' - ' + promo.description, 5000);
            localStorage.setItem('promoNotificationShown', 'true');
        }, 2000);
    }
}

// Export API
window.PromotionsAPI = {
    getPromotions: () => promotions,
    getActivePromoCode,
    applyPromoCode,
    applyPromoDiscount,
    copyPromoCode
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializePromotions();
    showPromoNotification();
});
