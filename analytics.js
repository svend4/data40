/**
 * Analytics Integration
 * Google Analytics and Yandex Metrika setup
 */

// Google Analytics Configuration
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Replace with your GA4 measurement ID

// Yandex Metrika Configuration
const YANDEX_COUNTER_ID = 'XXXXXXXX'; // Replace with your Yandex counter ID

// Initialize Google Analytics
function initGoogleAnalytics() {
    // Load GA4 script
    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(gaScript);

    // Initialize GA4
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
        send_page_view: true,
        cookie_flags: 'SameSite=None;Secure'
    });

    window.gtag = gtag;

    console.log('Google Analytics initialized');
}

// Initialize Yandex Metrika
function initYandexMetrika() {
    (function(m,e,t,r,i,k,a){
        m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],
        k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
    })
    (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

    ym(YANDEX_COUNTER_ID, "init", {
        clickmap:true,
        trackLinks:true,
        accurateTrackBounce:true,
        webvisor:true,
        ecommerce:"dataLayer"
    });

    console.log('Yandex Metrika initialized');
}

// Track e-commerce purchase
function trackPurchase(orderId, total, items) {
    // Google Analytics E-commerce
    if (typeof gtag !== 'undefined') {
        gtag('event', 'purchase', {
            transaction_id: orderId,
            value: total,
            currency: 'RUB',
            items: items.map(item => ({
                item_id: item.id,
                item_name: item.name,
                price: item.price,
                quantity: item.quantity
            }))
        });
    }

    // Yandex Metrika E-commerce
    if (typeof ym !== 'undefined') {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            "ecommerce": {
                "purchase": {
                    "actionField": {
                        "id": orderId,
                        "revenue": total
                    },
                    "products": items.map(item => ({
                        "id": item.id,
                        "name": item.name,
                        "price": item.price,
                        "quantity": item.quantity
                    }))
                }
            }
        });
        ym(YANDEX_COUNTER_ID, 'reachGoal', 'purchase');
    }

    console.log(`Purchase tracked: Order ${orderId}, Total ${total} RUB`);
}

// Track add to cart
function trackAddToCart(product, quantity = 1) {
    // Google Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'add_to_cart', {
            currency: 'RUB',
            value: product.price * quantity,
            items: [{
                item_id: product.id,
                item_name: product.name,
                price: product.price,
                quantity: quantity
            }]
        });
    }

    // Yandex Metrika
    if (typeof ym !== 'undefined') {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            "ecommerce": {
                "add": {
                    "products": [{
                        "id": product.id,
                        "name": product.name,
                        "price": product.price,
                        "quantity": quantity
                    }]
                }
            }
        });
        ym(YANDEX_COUNTER_ID, 'reachGoal', 'add_to_cart');
    }

    console.log(`Add to cart tracked: ${product.name}`);
}

// Track product view
function trackProductView(product) {
    // Google Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'view_item', {
            currency: 'RUB',
            value: product.price,
            items: [{
                item_id: product.id,
                item_name: product.name,
                price: product.price
            }]
        });
    }

    // Yandex Metrika
    if (typeof ym !== 'undefined') {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            "ecommerce": {
                "detail": {
                    "products": [{
                        "id": product.id,
                        "name": product.name,
                        "price": product.price
                    }]
                }
            }
        });
    }

    console.log(`Product view tracked: ${product.name}`);
}

// Initialize analytics on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check for user consent (GDPR compliance)
    const consentGiven = localStorage.getItem('analyticsConsent');

    if (consentGiven === 'true') {
        initGoogleAnalytics();
        initYandexMetrika();
    } else if (consentGiven === null) {
        // Show consent banner (simplified version)
        showConsentBanner();
    }
});

// Show consent banner
function showConsentBanner() {
    const banner = document.createElement('div');
    banner.id = 'cookie-consent';
    banner.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 20px;
        z-index: 10000;
        text-align: center;
    `;

    banner.innerHTML = `
        <p style="margin: 0 0 15px 0;">
            Мы используем файлы cookie и аналитические инструменты для улучшения работы сайта.
        </p>
        <button onclick="acceptAnalytics()" style="padding: 10px 20px; margin: 0 10px; cursor: pointer; background: #667eea; color: white; border: none; border-radius: 5px;">
            Принять
        </button>
        <button onclick="rejectAnalytics()" style="padding: 10px 20px; margin: 0 10px; cursor: pointer; background: #dc3545; color: white; border: none; border-radius: 5px;">
            Отклонить
        </button>
    `;

    document.body.appendChild(banner);
}

// Accept analytics
function acceptAnalytics() {
    localStorage.setItem('analyticsConsent', 'true');
    document.getElementById('cookie-consent')?.remove();
    initGoogleAnalytics();
    initYandexMetrika();
}

// Reject analytics
function rejectAnalytics() {
    localStorage.setItem('analyticsConsent', 'false');
    document.getElementById('cookie-consent')?.remove();
}

// Export API
window.AnalyticsAPI = {
    trackPurchase,
    trackAddToCart,
    trackProductView,
    acceptAnalytics,
    rejectAnalytics
};
