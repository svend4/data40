/**
 * Advanced Analytics System
 * Cohort analysis, funnel tracking, RFM segmentation, heatmaps
 */

// Analytics configuration
const ANALYTICS_CONFIG = {
    cohortPeriod: 'week', // week, month
    funnelSteps: ['visit', 'catalog_view', 'product_view', 'add_to_cart', 'checkout', 'purchase'],
    rfmPeriodDays: 365,
    heatmapSampleRate: 0.1 // 10% sampling
};

// Analytics storage
let analyticsEvents = JSON.parse(localStorage.getItem('analyticsEvents') || '[]');
let cohorts = JSON.parse(localStorage.getItem('cohorts') || '{}');
let heatmapData = JSON.parse(localStorage.getItem('heatmapData') || '[]');
let funnelData = JSON.parse(localStorage.getItem('funnelData') || '{}');

// === COHORT ANALYSIS ===

/**
 * Create cohort for user registration
 */
function createUserCohort(userId, registrationDate) {
    const cohortKey = getCohortKey(new Date(registrationDate));

    if (!cohorts[cohortKey]) {
        cohorts[cohortKey] = {
            key: cohortKey,
            startDate: cohortKey,
            users: [],
            retention: {}
        };
    }

    if (!cohorts[cohortKey].users.includes(userId)) {
        cohorts[cohortKey].users.push(userId);
        localStorage.setItem('cohorts', JSON.stringify(cohorts));
    }

    console.log('[Analytics] User added to cohort:', cohortKey);
}

/**
 * Get cohort key for date
 */
function getCohortKey(date) {
    const d = new Date(date);

    if (ANALYTICS_CONFIG.cohortPeriod === 'week') {
        // Get Monday of the week
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d.setDate(diff));
        return monday.toISOString().split('T')[0];
    } else {
        // First day of month
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    }
}

/**
 * Track user activity for retention
 */
function trackUserActivity(userId, activityDate) {
    // Find user's cohort
    let userCohort = null;
    let cohortKey = null;

    for (const [key, cohort] of Object.entries(cohorts)) {
        if (cohort.users.includes(userId)) {
            userCohort = cohort;
            cohortKey = key;
            break;
        }
    }

    if (!userCohort) {
        console.warn('[Analytics] User cohort not found:', userId);
        return;
    }

    // Calculate period number since cohort start
    const cohortStart = new Date(cohortKey);
    const activity = new Date(activityDate);
    const daysDiff = Math.floor((activity - cohortStart) / (1000 * 60 * 60 * 24));

    let periodNumber;
    if (ANALYTICS_CONFIG.cohortPeriod === 'week') {
        periodNumber = Math.floor(daysDiff / 7);
    } else {
        periodNumber = Math.floor(daysDiff / 30);
    }

    if (periodNumber < 0) return;

    // Track retention
    if (!userCohort.retention[periodNumber]) {
        userCohort.retention[periodNumber] = new Set();
    }

    if (userCohort.retention[periodNumber] instanceof Set) {
        userCohort.retention[periodNumber].add(userId);
    } else {
        userCohort.retention[periodNumber] = new Set([userId, ...userCohort.retention[periodNumber]]);
    }

    // Convert Set to Array for storage
    cohorts[cohortKey].retention[periodNumber] = Array.from(userCohort.retention[periodNumber]);
    localStorage.setItem('cohorts', JSON.stringify(cohorts));
}

/**
 * Get cohort analysis report
 */
function getCohortAnalysis() {
    const report = [];

    for (const [key, cohort] of Object.entries(cohorts)) {
        const cohortSize = cohort.users.length;
        const retentionRates = {};

        for (const [period, users] of Object.entries(cohort.retention)) {
            retentionRates[period] = {
                activeUsers: users.length,
                retentionRate: (users.length / cohortSize) * 100
            };
        }

        report.push({
            cohort: key,
            cohortDate: new Date(key),
            size: cohortSize,
            retention: retentionRates
        });
    }

    return report.sort((a, b) => b.cohortDate - a.cohortDate);
}

// === FUNNEL TRACKING ===

/**
 * Track funnel step
 */
function trackFunnelStep(userId, step, metadata = {}) {
    const sessionId = getOrCreateSessionId();

    if (!ANALYTICS_CONFIG.funnelSteps.includes(step)) {
        console.warn('[Analytics] Invalid funnel step:', step);
        return;
    }

    const event = {
        id: 'funnel_' + Date.now() + '_' + Math.random(),
        type: 'funnel',
        userId,
        sessionId,
        step,
        timestamp: Date.now(),
        metadata
    };

    analyticsEvents.push(event);

    // Keep only last 10,000 events
    if (analyticsEvents.length > 10000) {
        analyticsEvents = analyticsEvents.slice(-10000);
    }

    localStorage.setItem('analyticsEvents', JSON.stringify(analyticsEvents));

    console.log('[Analytics] Funnel step tracked:', step);
}

/**
 * Get funnel analysis
 */
function getFunnelAnalysis(startDate = null, endDate = null) {
    const now = Date.now();
    const start = startDate ? new Date(startDate).getTime() : now - (30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate).getTime() : now;

    // Filter events by date range
    const events = analyticsEvents.filter(e =>
        e.type === 'funnel' &&
        e.timestamp >= start &&
        e.timestamp <= end
    );

    // Group by session
    const sessions = {};
    events.forEach(event => {
        if (!sessions[event.sessionId]) {
            sessions[event.sessionId] = {
                userId: event.userId,
                steps: [],
                completed: false
            };
        }
        if (!sessions[event.sessionId].steps.includes(event.step)) {
            sessions[event.sessionId].steps.push(event.step);
        }
    });

    // Calculate funnel metrics
    const funnel = {};
    ANALYTICS_CONFIG.funnelSteps.forEach((step, index) => {
        const sessionsAtStep = Object.values(sessions).filter(s => s.steps.includes(step)).length;
        const previousStep = index > 0 ? ANALYTICS_CONFIG.funnelSteps[index - 1] : null;
        const sessionsAtPreviousStep = previousStep ?
            Object.values(sessions).filter(s => s.steps.includes(previousStep)).length :
            Object.keys(sessions).length;

        funnel[step] = {
            count: sessionsAtStep,
            conversionFromPrevious: previousStep ?
                (sessionsAtStep / sessionsAtPreviousStep) * 100 : 100,
            conversionFromStart: (sessionsAtStep / Object.keys(sessions).length) * 100,
            dropoffFromPrevious: previousStep ?
                ((sessionsAtPreviousStep - sessionsAtStep) / sessionsAtPreviousStep) * 100 : 0
        };
    });

    return {
        totalSessions: Object.keys(sessions).length,
        funnel,
        completionRate: funnel.purchase ? funnel.purchase.conversionFromStart : 0
    };
}

// === RFM SEGMENTATION ===

/**
 * Calculate RFM scores for customers
 */
function calculateRFMSegmentation() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    const now = Date.now();
    const periodStart = now - (ANALYTICS_CONFIG.rfmPeriodDays * 24 * 60 * 60 * 1000);

    // Calculate RFM for each user
    const rfmScores = {};

    users.forEach(user => {
        const userOrders = orders.filter(o => o.email === user.email);

        if (userOrders.length === 0) {
            rfmScores[user.id] = {
                recency: 0,
                frequency: 0,
                monetary: 0,
                segment: 'New'
            };
            return;
        }

        // Recency: days since last purchase
        const lastOrderDate = Math.max(...userOrders.map(o => new Date(o.date).getTime()));
        const recencyDays = Math.floor((now - lastOrderDate) / (1000 * 60 * 60 * 24));

        // Frequency: number of orders in period
        const frequency = userOrders.filter(o =>
            new Date(o.date).getTime() >= periodStart
        ).length;

        // Monetary: total spent in period
        const monetary = userOrders
            .filter(o => new Date(o.date).getTime() >= periodStart)
            .reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);

        rfmScores[user.id] = {
            userId: user.id,
            email: user.email,
            name: user.name || user.email,
            recency: recencyDays,
            frequency,
            monetary,
            recencyScore: scoreRecency(recencyDays),
            frequencyScore: scoreFrequency(frequency),
            monetaryScore: scoreMonetary(monetary),
            segment: ''
        };
    });

    // Assign segments
    Object.values(rfmScores).forEach(rfm => {
        rfm.segment = getRFMSegment(rfm.recencyScore, rfm.frequencyScore, rfm.monetaryScore);
    });

    return Object.values(rfmScores);
}

/**
 * Score recency (1-5, 5 is best)
 */
function scoreRecency(days) {
    if (days <= 30) return 5;
    if (days <= 60) return 4;
    if (days <= 90) return 3;
    if (days <= 180) return 2;
    return 1;
}

/**
 * Score frequency (1-5, 5 is best)
 */
function scoreFrequency(orders) {
    if (orders >= 10) return 5;
    if (orders >= 5) return 4;
    if (orders >= 3) return 3;
    if (orders >= 2) return 2;
    if (orders >= 1) return 1;
    return 0;
}

/**
 * Score monetary value (1-5, 5 is best)
 */
function scoreMonetary(value) {
    if (value >= 50000) return 5;
    if (value >= 20000) return 4;
    if (value >= 10000) return 3;
    if (value >= 5000) return 2;
    if (value >= 1000) return 1;
    return 0;
}

/**
 * Get RFM segment name
 */
function getRFMSegment(r, f, m) {
    if (r >= 4 && f >= 4 && m >= 4) return 'Champions';
    if (r >= 3 && f >= 3 && m >= 3) return 'Loyal Customers';
    if (r >= 4 && f <= 2) return 'New Customers';
    if (r >= 3 && f >= 2 && m >= 2) return 'Potential Loyalists';
    if (r <= 2 && f >= 3 && m >= 3) return 'At Risk';
    if (r <= 2 && f >= 4) return 'Can\'t Lose Them';
    if (r >= 3 && f <= 2 && m <= 2) return 'Promising';
    if (r <= 2 && f <= 2 && m >= 3) return 'Hibernating';
    if (r <= 2 && f <= 2 && m <= 2) return 'Lost';
    return 'Other';
}

/**
 * Get RFM segments summary
 */
function getRFMSegmentsSummary() {
    const rfmData = calculateRFMSegmentation();
    const segments = {};

    rfmData.forEach(customer => {
        if (!segments[customer.segment]) {
            segments[customer.segment] = {
                count: 0,
                totalRevenue: 0,
                avgRecency: 0,
                avgFrequency: 0,
                avgMonetary: 0,
                customers: []
            };
        }

        segments[customer.segment].count++;
        segments[customer.segment].totalRevenue += customer.monetary;
        segments[customer.segment].avgRecency += customer.recency;
        segments[customer.segment].avgFrequency += customer.frequency;
        segments[customer.segment].avgMonetary += customer.monetary;
        segments[customer.segment].customers.push(customer);
    });

    // Calculate averages
    Object.values(segments).forEach(segment => {
        segment.avgRecency = Math.round(segment.avgRecency / segment.count);
        segment.avgFrequency = Math.round((segment.avgFrequency / segment.count) * 10) / 10;
        segment.avgMonetary = Math.round(segment.avgMonetary / segment.count);
    });

    return segments;
}

// === HEATMAP TRACKING ===

/**
 * Track click for heatmap
 */
function trackClick(x, y, pageUrl, element) {
    // Sampling
    if (Math.random() > ANALYTICS_CONFIG.heatmapSampleRate) {
        return;
    }

    const event = {
        id: 'heatmap_' + Date.now(),
        type: 'click',
        x: Math.round(x),
        y: Math.round(y),
        pageUrl,
        element: element.tagName,
        elementId: element.id,
        elementClass: element.className,
        timestamp: Date.now(),
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight
    };

    heatmapData.push(event);

    // Keep only last 5000 clicks
    if (heatmapData.length > 5000) {
        heatmapData = heatmapData.slice(-5000);
    }

    localStorage.setItem('heatmapData', JSON.stringify(heatmapData));
}

/**
 * Track scroll depth
 */
function trackScrollDepth(depth, pageUrl) {
    const event = {
        id: 'scroll_' + Date.now(),
        type: 'scroll',
        depth: Math.round(depth),
        pageUrl,
        timestamp: Date.now()
    };

    heatmapData.push(event);
    localStorage.setItem('heatmapData', JSON.stringify(heatmapData));
}

/**
 * Get heatmap data for page
 */
function getHeatmapData(pageUrl = null) {
    let data = heatmapData.filter(e => e.type === 'click');

    if (pageUrl) {
        data = data.filter(e => e.pageUrl === pageUrl);
    }

    // Group by proximity (20px radius)
    const clusters = [];
    const clusterRadius = 20;

    data.forEach(point => {
        let foundCluster = false;

        for (const cluster of clusters) {
            const distance = Math.sqrt(
                Math.pow(cluster.x - point.x, 2) +
                Math.pow(cluster.y - point.y, 2)
            );

            if (distance <= clusterRadius) {
                cluster.count++;
                cluster.points.push(point);
                foundCluster = true;
                break;
            }
        }

        if (!foundCluster) {
            clusters.push({
                x: point.x,
                y: point.y,
                count: 1,
                points: [point]
            });
        }
    });

    return {
        clusters: clusters.sort((a, b) => b.count - a.count),
        totalClicks: data.length
    };
}

/**
 * Get scroll depth distribution
 */
function getScrollDepthDistribution(pageUrl = null) {
    let data = heatmapData.filter(e => e.type === 'scroll');

    if (pageUrl) {
        data = data.filter(e => e.pageUrl === pageUrl);
    }

    const distribution = {
        '0-25%': 0,
        '25-50%': 0,
        '50-75%': 0,
        '75-100%': 0
    };

    data.forEach(event => {
        if (event.depth <= 25) distribution['0-25%']++;
        else if (event.depth <= 50) distribution['25-50%']++;
        else if (event.depth <= 75) distribution['50-75%']++;
        else distribution['75-100%']++;
    });

    return distribution;
}

// === SESSION TRACKING ===

/**
 * Get or create session ID
 */
function getOrCreateSessionId() {
    let sessionId = sessionStorage.getItem('analyticsSessionId');

    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('analyticsSessionId', sessionId);
    }

    return sessionId;
}

/**
 * Track page view
 */
function trackPageView(pageUrl, pageTitle) {
    const userId = window.currentUser ? window.currentUser.id : 'anonymous';
    const sessionId = getOrCreateSessionId();

    trackFunnelStep(userId, 'visit', { pageUrl, pageTitle });

    console.log('[Analytics] Page view tracked:', pageUrl);
}

// === INITIALIZATION ===

/**
 * Initialize analytics tracking
 */
function initializeAnalytics() {
    // Track clicks for heatmap
    document.addEventListener('click', (event) => {
        trackClick(
            event.clientX + window.scrollX,
            event.clientY + window.scrollY,
            window.location.pathname,
            event.target
        );
    });

    // Track scroll depth
    let maxScrollDepth = 0;
    let scrollTimeout = null;

    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);

        scrollTimeout = setTimeout(() => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollTop = window.scrollY;
            const scrollDepth = (scrollTop / scrollHeight) * 100;

            if (scrollDepth > maxScrollDepth) {
                maxScrollDepth = scrollDepth;
                trackScrollDepth(scrollDepth, window.location.pathname);
            }
        }, 500);
    });

    // Track page view
    trackPageView(window.location.pathname, document.title);

    // Track user cohort if logged in
    if (window.currentUser) {
        const registrationDate = window.currentUser.registeredAt || Date.now();
        createUserCohort(window.currentUser.id, registrationDate);
        trackUserActivity(window.currentUser.id, Date.now());
    }

    console.log('[Analytics] Advanced analytics initialized');
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initializeAnalytics();
});

// Track user login for cohort
document.addEventListener('userLoggedIn', (event) => {
    const user = event.detail.user;
    if (user) {
        const registrationDate = user.registeredAt || Date.now();
        createUserCohort(user.id, registrationDate);
        trackUserActivity(user.id, Date.now());
    }
});

// Export API
window.AdvancedAnalytics = {
    // Cohort analysis
    getCohortAnalysis,
    trackUserActivity,

    // Funnel tracking
    trackFunnelStep,
    getFunnelAnalysis,

    // RFM segmentation
    calculateRFMSegmentation,
    getRFMSegmentsSummary,

    // Heatmaps
    getHeatmapData,
    getScrollDepthDistribution,

    // General tracking
    trackPageView,

    // Data access
    getEvents: () => analyticsEvents,
    getCohorts: () => cohorts,
    getHeatmapRawData: () => heatmapData
};
