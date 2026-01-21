/**
 * SEO Utilities
 * Dynamic meta tags and structured data management
 */

// SEO Configuration
const SEO_CONFIG = {
    siteName: 'Цветочный Рай',
    siteUrl: 'https://flowerparadise.ru',
    defaultImage: 'https://flowerparadise.ru/images/og-image.jpg',
    defaultDescription: 'Интернет-магазин цветов с доставкой. Широкий выбор букетов, композиций, подарочных сертификатов.',
    twitterHandle: '@flowerparadise',
    phone: '+7-495-123-45-67',
    email: 'info@flowerparadise.ru'
};

// Update meta tags dynamically
function updateMetaTags(options) {
    const {
        title,
        description,
        keywords,
        image,
        url,
        type = 'website'
    } = options;

    // Update page title
    if (title) {
        document.title = `${title} | ${SEO_CONFIG.siteName}`;

        // Update meta title
        updateMeta('name', 'title', `${title} | ${SEO_CONFIG.siteName}`);
        updateMeta('property', 'og:title', title);
        updateMeta('property', 'twitter:title', title);
    }

    // Update description
    if (description) {
        updateMeta('name', 'description', description);
        updateMeta('property', 'og:description', description);
        updateMeta('property', 'twitter:description', description);
    }

    // Update keywords
    if (keywords) {
        updateMeta('name', 'keywords', keywords);
    }

    // Update image
    if (image) {
        updateMeta('property', 'og:image', image);
        updateMeta('property', 'twitter:image', image);
    }

    // Update URL
    if (url) {
        updateMeta('property', 'og:url', url);
        updateMeta('property', 'twitter:url', url);

        // Update canonical
        updateCanonical(url);
    }

    // Update type
    updateMeta('property', 'og:type', type);
}

// Helper: Update or create meta tag
function updateMeta(attribute, name, content) {
    let meta = document.querySelector(`meta[${attribute}="${name}"]`);

    if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
    }

    meta.setAttribute('content', content);
}

// Helper: Update canonical URL
function updateCanonical(url) {
    let canonical = document.querySelector('link[rel="canonical"]');

    if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
    }

    canonical.setAttribute('href', url);
}

// Generate Product Schema
function generateProductSchema(product) {
    const schema = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.name,
        "description": product.description || product.shortDescription,
        "image": product.image || SEO_CONFIG.defaultImage,
        "sku": `FLOWER-${product.id}`,
        "offers": {
            "@type": "Offer",
            "url": `${SEO_CONFIG.siteUrl}/index.html#product-${product.id}`,
            "priceCurrency": "RUB",
            "price": product.price,
            "availability": "https://schema.org/InStock",
            "seller": {
                "@type": "Organization",
                "name": SEO_CONFIG.siteName
            }
        }
    };

    if (product.rating) {
        schema.aggregateRating = {
            "@type": "AggregateRating",
            "ratingValue": product.rating,
            "reviewCount": product.reviewCount || 0,
            "bestRating": "5",
            "worstRating": "1"
        };
    }

    return schema;
}

// Generate BreadcrumbList Schema
function generateBreadcrumbSchema(breadcrumbs) {
    const itemListElement = breadcrumbs.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": `${SEO_CONFIG.siteUrl}${item.url}`
    }));

    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": itemListElement
    };
}

// Generate Review Schema
function generateReviewSchema(reviews, productName) {
    if (!reviews || reviews.length === 0) return null;

    return reviews.map(review => ({
        "@context": "https://schema.org",
        "@type": "Review",
        "itemReviewed": {
            "@type": "Product",
            "name": productName
        },
        "author": {
            "@type": "Person",
            "name": review.author
        },
        "reviewRating": {
            "@type": "Rating",
            "ratingValue": review.rating,
            "bestRating": "5",
            "worstRating": "1"
        },
        "reviewBody": review.text,
        "datePublished": review.date
    }));
}

// Add structured data to page
function addStructuredData(schema) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema, null, 2);
    document.head.appendChild(script);
}

// Generate FAQ Schema
function generateFAQSchema(faqs) {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };
}

// Track page view for analytics (placeholder for Google Analytics)
function trackPageView(pageName) {
    // Google Analytics
    if (typeof gtag !== 'undefined') {
        gtag('config', 'GA_MEASUREMENT_ID', {
            page_path: window.location.pathname,
            page_title: document.title
        });
    }

    // Yandex Metrika
    if (typeof ym !== 'undefined') {
        ym(YANDEX_COUNTER_ID, 'hit', window.location.href, {
            title: document.title
        });
    }

    console.log(`Page view tracked: ${pageName}`);
}

// Track event for analytics
function trackEvent(category, action, label, value) {
    // Google Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value
        });
    }

    // Yandex Metrika
    if (typeof ym !== 'undefined') {
        ym(YANDEX_COUNTER_ID, 'reachGoal', action, {
            [category]: label
        });
    }

    console.log(`Event tracked: ${category} - ${action} - ${label}`);
}

// Initialize SEO on page load
document.addEventListener('DOMContentLoaded', () => {
    // Track initial page view
    trackPageView(document.title);

    // Add structured data for products if on catalog page
    if (window.flowers && Array.isArray(window.flowers)) {
        // Add product list schema
        const productListSchema = {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "itemListElement": window.flowers.slice(0, 10).map((flower, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "url": `${SEO_CONFIG.siteUrl}/index.html#product-${flower.id}`
            }))
        };
        addStructuredData(productListSchema);
    }
});

// Export API
window.SEOAPI = {
    updateMetaTags,
    generateProductSchema,
    generateBreadcrumbSchema,
    generateReviewSchema,
    generateFAQSchema,
    addStructuredData,
    trackPageView,
    trackEvent
};
