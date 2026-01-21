/**
 * A/B Testing Framework
 * Create, run, and analyze A/B tests
 */

// A/B Testing storage
let abTests = JSON.parse(localStorage.getItem('abTests') || '{}');
let abAssignments = JSON.parse(localStorage.getItem('abAssignments') || '{}');
let abResults = JSON.parse(localStorage.getItem('abResults') || '{}');

/**
 * Create new A/B test
 */
function createABTest(testConfig) {
    const {
        id,
        name,
        description,
        variants,
        targetMetric,
        targetPages = [],
        trafficAllocation = 1.0, // 0-1, percentage of traffic
        startDate = Date.now(),
        endDate = null,
        status = 'draft' // draft, running, paused, completed
    } = testConfig;

    if (!id || !name || !variants || variants.length < 2) {
        console.error('[ABTest] Invalid test configuration');
        return null;
    }

    // Validate variant weights sum to 1
    const totalWeight = variants.reduce((sum, v) => sum + (v.weight || 0), 0);
    if (Math.abs(totalWeight - 1.0) > 0.01) {
        console.error('[ABTest] Variant weights must sum to 1.0');
        return null;
    }

    const test = {
        id,
        name,
        description,
        variants,
        targetMetric,
        targetPages,
        trafficAllocation,
        startDate,
        endDate,
        status,
        createdAt: Date.now(),
        participants: 0,
        conversions: {}
    };

    // Initialize conversion tracking for each variant
    variants.forEach(variant => {
        test.conversions[variant.id] = {
            impressions: 0,
            conversions: 0,
            conversionRate: 0,
            revenue: 0
        };
    });

    abTests[id] = test;
    localStorage.setItem('abTests', JSON.stringify(abTests));

    console.log('[ABTest] Test created:', id);
    return test;
}

/**
 * Start A/B test
 */
function startABTest(testId) {
    const test = abTests[testId];

    if (!test) {
        console.error('[ABTest] Test not found:', testId);
        return false;
    }

    test.status = 'running';
    test.startDate = Date.now();
    localStorage.setItem('abTests', JSON.stringify(abTests));

    console.log('[ABTest] Test started:', testId);
    return true;
}

/**
 * Pause A/B test
 */
function pauseABTest(testId) {
    const test = abTests[testId];

    if (!test) {
        console.error('[ABTest] Test not found:', testId);
        return false;
    }

    test.status = 'paused';
    localStorage.setItem('abTests', JSON.stringify(abTests));

    console.log('[ABTest] Test paused:', testId);
    return true;
}

/**
 * Complete A/B test
 */
function completeABTest(testId, winningVariant = null) {
    const test = abTests[testId];

    if (!test) {
        console.error('[ABTest] Test not found:', testId);
        return false;
    }

    test.status = 'completed';
    test.endDate = Date.now();
    test.winningVariant = winningVariant;
    localStorage.setItem('abTests', JSON.stringify(abTests));

    console.log('[ABTest] Test completed:', testId);
    return true;
}

/**
 * Assign user to variant
 */
function assignToVariant(testId, userId = null) {
    const test = abTests[testId];

    if (!test || test.status !== 'running') {
        return null;
    }

    // Check if already assigned
    const userKey = userId || getOrCreateABUserId();
    if (abAssignments[userKey] && abAssignments[userKey][testId]) {
        return abAssignments[userKey][testId];
    }

    // Check traffic allocation
    if (Math.random() > test.trafficAllocation) {
        return null; // User not in test
    }

    // Assign to variant based on weights
    const random = Math.random();
    let cumulative = 0;
    let assignedVariant = null;

    for (const variant of test.variants) {
        cumulative += variant.weight;
        if (random <= cumulative) {
            assignedVariant = variant.id;
            break;
        }
    }

    if (!assignedVariant) {
        assignedVariant = test.variants[0].id;
    }

    // Store assignment
    if (!abAssignments[userKey]) {
        abAssignments[userKey] = {};
    }
    abAssignments[userKey][testId] = assignedVariant;
    localStorage.setItem('abAssignments', JSON.stringify(abAssignments));

    // Increment participant count
    test.participants++;

    // Track impression
    test.conversions[assignedVariant].impressions++;
    localStorage.setItem('abTests', JSON.stringify(abTests));

    console.log('[ABTest] User assigned to variant:', { testId, variant: assignedVariant });
    return assignedVariant;
}

/**
 * Get variant for user
 */
function getVariant(testId, userId = null) {
    const userKey = userId || getOrCreateABUserId();
    return abAssignments[userKey] && abAssignments[userKey][testId] || null;
}

/**
 * Track conversion
 */
function trackConversion(testId, userId = null, value = 0) {
    const test = abTests[testId];

    if (!test || test.status !== 'running') {
        console.warn('[ABTest] Test not running:', testId);
        return false;
    }

    const userKey = userId || getOrCreateABUserId();
    const variant = abAssignments[userKey] && abAssignments[userKey][testId];

    if (!variant) {
        console.warn('[ABTest] User not assigned to test:', testId);
        return false;
    }

    // Track conversion
    test.conversions[variant].conversions++;
    test.conversions[variant].revenue += value;

    // Calculate conversion rate
    test.conversions[variant].conversionRate =
        (test.conversions[variant].conversions / test.conversions[variant].impressions) * 100;

    localStorage.setItem('abTests', JSON.stringify(abTests));

    console.log('[ABTest] Conversion tracked:', { testId, variant, value });
    return true;
}

/**
 * Get test results
 */
function getTestResults(testId) {
    const test = abTests[testId];

    if (!test) {
        console.error('[ABTest] Test not found:', testId);
        return null;
    }

    const results = {
        testId: test.id,
        name: test.name,
        status: test.status,
        participants: test.participants,
        variants: [],
        winner: null,
        statisticalSignificance: null
    };

    // Calculate metrics for each variant
    test.variants.forEach(variant => {
        const data = test.conversions[variant.id];

        results.variants.push({
            id: variant.id,
            name: variant.name,
            impressions: data.impressions,
            conversions: data.conversions,
            conversionRate: Math.round(data.conversionRate * 100) / 100,
            revenue: data.revenue,
            avgRevenuePerUser: data.impressions > 0 ? data.revenue / data.impressions : 0
        });
    });

    // Find winner (highest conversion rate)
    if (results.variants.length > 0) {
        results.winner = results.variants.reduce((max, v) =>
            v.conversionRate > max.conversionRate ? v : max
        );

        // Calculate statistical significance (simplified chi-square test)
        if (results.variants.length === 2 && results.variants[0].impressions > 30 && results.variants[1].impressions > 30) {
            results.statisticalSignificance = calculateStatisticalSignificance(
                results.variants[0],
                results.variants[1]
            );
        }
    }

    return results;
}

/**
 * Calculate statistical significance (simplified)
 */
function calculateStatisticalSignificance(variantA, variantB) {
    // Using Z-test for proportions
    const p1 = variantA.conversions / variantA.impressions;
    const p2 = variantB.conversions / variantB.impressions;
    const n1 = variantA.impressions;
    const n2 = variantB.impressions;

    const pPool = (variantA.conversions + variantB.conversions) / (n1 + n2);
    const se = Math.sqrt(pPool * (1 - pPool) * (1 / n1 + 1 / n2));

    if (se === 0) return { significant: false, confidence: 0 };

    const zScore = Math.abs((p1 - p2) / se);

    // Convert z-score to confidence level
    let confidence = 0;
    if (zScore >= 2.58) confidence = 99; // 99% confidence
    else if (zScore >= 1.96) confidence = 95; // 95% confidence
    else if (zScore >= 1.65) confidence = 90; // 90% confidence

    return {
        significant: confidence >= 95,
        confidence,
        zScore: Math.round(zScore * 100) / 100,
        improvement: ((p1 - p2) / p2) * 100
    };
}

/**
 * Get all active tests
 */
function getActiveTests() {
    return Object.values(abTests).filter(test => test.status === 'running');
}

/**
 * Get all tests
 */
function getAllTests() {
    return Object.values(abTests);
}

/**
 * Delete test
 */
function deleteTest(testId) {
    if (abTests[testId]) {
        delete abTests[testId];
        localStorage.setItem('abTests', JSON.stringify(abTests));

        // Clean up assignments
        Object.keys(abAssignments).forEach(userKey => {
            if (abAssignments[userKey][testId]) {
                delete abAssignments[userKey][testId];
            }
        });
        localStorage.setItem('abAssignments', JSON.stringify(abAssignments));

        console.log('[ABTest] Test deleted:', testId);
        return true;
    }
    return false;
}

/**
 * Get or create AB user ID
 */
function getOrCreateABUserId() {
    let userId = localStorage.getItem('abUserId');

    if (!userId) {
        userId = 'ab_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('abUserId', userId);
    }

    return userId;
}

/**
 * Apply variant changes to page
 */
function applyVariant(testId, variantConfig) {
    const variant = variantConfig;

    console.log('[ABTest] Applying variant:', { testId, variant: variant.id });

    // Apply CSS changes
    if (variant.css) {
        Object.entries(variant.css).forEach(([selector, styles]) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                Object.entries(styles).forEach(([property, value]) => {
                    element.style[property] = value;
                });
            });
        });
    }

    // Apply text changes
    if (variant.text) {
        Object.entries(variant.text).forEach(([selector, text]) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.textContent = text;
            });
        });
    }

    // Apply HTML changes
    if (variant.html) {
        Object.entries(variant.html).forEach(([selector, html]) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.innerHTML = html;
            });
        });
    }

    // Execute custom JavaScript
    if (variant.javascript && typeof variant.javascript === 'function') {
        variant.javascript();
    }
}

/**
 * Run A/B test on current page
 */
function runTestsForPage(pageUrl = window.location.pathname) {
    const activeTests = getActiveTests();

    activeTests.forEach(test => {
        // Check if test applies to current page
        if (test.targetPages.length === 0 || test.targetPages.includes(pageUrl)) {
            const variantId = assignToVariant(test.id);

            if (variantId) {
                const variant = test.variants.find(v => v.id === variantId);
                if (variant && variant.changes) {
                    applyVariant(test.id, variant.changes);
                }
            }
        }
    });
}

// === PREDEFINED TEST EXAMPLES ===

/**
 * Create sample A/B tests for demo
 */
function createSampleTests() {
    // Test 1: CTA Button Color
    createABTest({
        id: 'test-cta-color',
        name: 'CTA Button Color Test',
        description: 'Testing green vs blue button color for add to cart',
        variants: [
            {
                id: 'control',
                name: 'Control (Current)',
                weight: 0.5,
                changes: {
                    css: {}
                }
            },
            {
                id: 'variant-blue',
                name: 'Blue Button',
                weight: 0.5,
                changes: {
                    css: {
                        '.add-to-cart-btn': {
                            background: '#007bff'
                        }
                    }
                }
            }
        ],
        targetMetric: 'add_to_cart',
        targetPages: ['/'],
        trafficAllocation: 1.0,
        status: 'draft'
    });

    // Test 2: Headline Text
    createABTest({
        id: 'test-headline',
        name: 'Homepage Headline Test',
        description: 'Testing different headline copy',
        variants: [
            {
                id: 'control',
                name: 'Control',
                weight: 0.33,
                changes: {
                    text: {
                        'h1': 'Доставка цветов по городу'
                    }
                }
            },
            {
                id: 'variant-urgent',
                name: 'Urgency',
                weight: 0.33,
                changes: {
                    text: {
                        'h1': 'Доставка цветов за 1 час!'
                    }
                }
            },
            {
                id: 'variant-emotional',
                name: 'Emotional',
                weight: 0.34,
                changes: {
                    text: {
                        'h1': 'Подарите радость с нашими букетами 🌸'
                    }
                }
            }
        ],
        targetMetric: 'purchase',
        targetPages: ['/'],
        trafficAllocation: 1.0,
        status: 'draft'
    });

    // Test 3: Pricing Display
    createABTest({
        id: 'test-pricing',
        name: 'Pricing Display Test',
        description: 'Testing original price vs discount display',
        variants: [
            {
                id: 'control',
                name: 'Regular Price',
                weight: 0.5,
                changes: {}
            },
            {
                id: 'variant-discount',
                name: 'Show Discount',
                weight: 0.5,
                changes: {
                    javascript: () => {
                        // Add discount badges
                        const priceElements = document.querySelectorAll('.flower-card .price');
                        priceElements.forEach(el => {
                            const badge = document.createElement('span');
                            badge.className = 'discount-badge';
                            badge.textContent = '-20%';
                            badge.style.cssText = 'background: #dc3545; color: white; padding: 4px 8px; border-radius: 4px; margin-left: 8px; font-size: 0.85rem;';
                            el.appendChild(badge);
                        });
                    }
                }
            }
        ],
        targetMetric: 'purchase',
        targetPages: ['/'],
        trafficAllocation: 1.0,
        status: 'draft'
    });

    console.log('[ABTest] Sample tests created');
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    // Run tests for current page
    runTestsForPage();

    console.log('[ABTest] A/B testing framework initialized');
});

// Export API
window.ABTesting = {
    // Test management
    createABTest,
    startABTest,
    pauseABTest,
    completeABTest,
    deleteTest,

    // Variant assignment
    assignToVariant,
    getVariant,

    // Tracking
    trackConversion,

    // Results
    getTestResults,
    getActiveTests,
    getAllTests,

    // Utilities
    runTestsForPage,
    createSampleTests,

    // Data access
    getTests: () => abTests,
    getAssignments: () => abAssignments
};
