/**
 * QR Code Scanner Integration
 * Quick product scanning and ordering
 */

// QR Scanner configuration
const QR_CONFIG = {
    urlPattern: /^https?:\/\/(www\.)?flowerparadise\.ru\/qr\/(.+)$/,
    actionTypes: {
        PRODUCT: 'product',
        PROMO: 'promo',
        ORDER: 'order',
        LOYALTY: 'loyalty',
        DISCOUNT: 'discount'
    }
};

// QR scan history
let qrScanHistory = JSON.parse(localStorage.getItem('qrScanHistory') || '[]');

// === QR CODE GENERATION ===

/**
 * Generate QR code data for product
 */
function generateProductQR(productId) {
    const qrData = {
        type: QR_CONFIG.actionTypes.PRODUCT,
        productId,
        timestamp: Date.now(),
        url: `https://flowerparadise.ru/qr/product-${productId}`
    };

    return qrData;
}

/**
 * Generate QR code data for promo
 */
function generatePromoQR(promoCode, discount) {
    const qrData = {
        type: QR_CONFIG.actionTypes.PROMO,
        promoCode,
        discount,
        timestamp: Date.now(),
        url: `https://flowerparadise.ru/qr/promo-${promoCode}`
    };

    return qrData;
}

/**
 * Generate QR code for quick order
 */
function generateQuickOrderQR(orderData) {
    const qrId = 'qo_' + Date.now();

    const qrData = {
        type: QR_CONFIG.actionTypes.ORDER,
        orderId: qrId,
        items: orderData.items,
        timestamp: Date.now(),
        url: `https://flowerparadise.ru/qr/order-${qrId}`
    };

    // Store order data for retrieval
    localStorage.setItem(`qr_order_${qrId}`, JSON.stringify(orderData));

    return qrData;
}

/**
 * Generate loyalty QR code
 */
function generateLoyaltyQR(userId, points) {
    const qrData = {
        type: QR_CONFIG.actionTypes.LOYALTY,
        userId,
        points,
        timestamp: Date.now(),
        url: `https://flowerparadise.ru/qr/loyalty-${userId}`
    };

    return qrData;
}

// === QR CODE SCANNING ===

/**
 * Process scanned QR code
 */
function processScanResult(qrContent) {
    console.log('[QR] Processing scan:', qrContent);

    // Parse QR content
    let qrData;

    if (typeof qrContent === 'string') {
        // Check if it's a URL
        const urlMatch = qrContent.match(QR_CONFIG.urlPattern);

        if (urlMatch) {
            const qrPart = urlMatch[2];
            qrData = parseQRIdentifier(qrPart);
        } else {
            // Try to parse as JSON
            try {
                qrData = JSON.parse(qrContent);
            } catch (e) {
                return {
                    success: false,
                    error: 'Invalid QR code format',
                    code: 'INVALID_FORMAT'
                };
            }
        }
    } else {
        qrData = qrContent;
    }

    // Validate QR data
    if (!qrData || !qrData.type) {
        return {
            success: false,
            error: 'Invalid QR code data',
            code: 'INVALID_DATA'
        };
    }

    // Save to history
    saveScanToHistory(qrData);

    // Process based on type
    switch (qrData.type) {
        case QR_CONFIG.actionTypes.PRODUCT:
            return processProductQR(qrData);
        case QR_CONFIG.actionTypes.PROMO:
            return processPromoQR(qrData);
        case QR_CONFIG.actionTypes.ORDER:
            return processOrderQR(qrData);
        case QR_CONFIG.actionTypes.LOYALTY:
            return processLoyaltyQR(qrData);
        case QR_CONFIG.actionTypes.DISCOUNT:
            return processDiscountQR(qrData);
        default:
            return {
                success: false,
                error: 'Unknown QR code type',
                code: 'UNKNOWN_TYPE'
            };
    }
}

/**
 * Parse QR identifier from URL
 */
function parseQRIdentifier(identifier) {
    if (identifier.startsWith('product-')) {
        const productId = parseInt(identifier.replace('product-', ''));
        return {
            type: QR_CONFIG.actionTypes.PRODUCT,
            productId
        };
    }

    if (identifier.startsWith('promo-')) {
        const promoCode = identifier.replace('promo-', '');
        return {
            type: QR_CONFIG.actionTypes.PROMO,
            promoCode
        };
    }

    if (identifier.startsWith('order-')) {
        const orderId = identifier.replace('order-', '');
        return {
            type: QR_CONFIG.actionTypes.ORDER,
            orderId
        };
    }

    if (identifier.startsWith('loyalty-')) {
        const userId = identifier.replace('loyalty-', '');
        return {
            type: QR_CONFIG.actionTypes.LOYALTY,
            userId
        };
    }

    return null;
}

/**
 * Process product QR code
 */
function processProductQR(qrData) {
    const { productId } = qrData;

    // Find product
    const product = (window.flowers || []).find(p => p.id === productId);

    if (!product) {
        return {
            success: false,
            error: 'Product not found',
            code: 'PRODUCT_NOT_FOUND'
        };
    }

    console.log('[QR] Product scanned:', product.name);

    return {
        success: true,
        action: 'product',
        product: {
            id: product.id,
            name: product.name,
            price: product.price,
            description: product.shortDescription,
            image: product.emoji
        },
        message: `Отсканирован товар: ${product.name}`
    };
}

/**
 * Process promo QR code
 */
function processPromoQR(qrData) {
    const { promoCode, discount } = qrData;

    // Apply promo code
    if (typeof window.applyPromoCode === 'function') {
        const result = window.applyPromoCode(promoCode);

        if (result.success) {
            console.log('[QR] Promo code applied:', promoCode);

            return {
                success: true,
                action: 'promo',
                promo: {
                    code: promoCode,
                    discount: result.discount,
                    type: result.type
                },
                message: `Промокод ${promoCode} активирован! Скидка ${result.discount}${result.type === 'percent' ? '%' : '₽'}`
            };
        }
    }

    console.log('[QR] Promo code scanned:', promoCode);

    return {
        success: true,
        action: 'promo',
        promo: {
            code: promoCode,
            discount: discount || 0
        },
        message: `Промокод отсканирован: ${promoCode}`
    };
}

/**
 * Process order QR code
 */
function processOrderQR(qrData) {
    const { orderId } = qrData;

    // Retrieve order data
    const orderDataStr = localStorage.getItem(`qr_order_${orderId}`);

    if (!orderDataStr) {
        return {
            success: false,
            error: 'Order not found',
            code: 'ORDER_NOT_FOUND'
        };
    }

    const orderData = JSON.parse(orderDataStr);

    console.log('[QR] Quick order scanned:', orderId);

    return {
        success: true,
        action: 'order',
        order: orderData,
        message: 'Быстрый заказ готов к оформлению'
    };
}

/**
 * Process loyalty QR code
 */
function processLoyaltyQR(qrData) {
    const { userId, points } = qrData;

    console.log('[QR] Loyalty code scanned for user:', userId);

    // In real app, would validate and apply points
    return {
        success: true,
        action: 'loyalty',
        loyalty: {
            userId,
            points: points || 0
        },
        message: `Начислено ${points || 0} бонусных баллов`
    };
}

/**
 * Process discount QR code
 */
function processDiscountQR(qrData) {
    const { discount, productId } = qrData;

    console.log('[QR] Discount code scanned');

    return {
        success: true,
        action: 'discount',
        discount: {
            amount: discount,
            productId: productId || null
        },
        message: `Скидка ${discount}% применена`
    };
}

// === SCAN HISTORY ===

/**
 * Save scan to history
 */
function saveScanToHistory(qrData) {
    const historyEntry = {
        id: 'scan_' + Date.now(),
        type: qrData.type,
        data: qrData,
        scannedAt: Date.now()
    };

    qrScanHistory.unshift(historyEntry);

    // Keep only last 100 scans
    if (qrScanHistory.length > 100) {
        qrScanHistory = qrScanHistory.slice(0, 100);
    }

    localStorage.setItem('qrScanHistory', JSON.stringify(qrScanHistory));
}

/**
 * Get scan history
 */
function getScanHistory(limit = 20) {
    return {
        success: true,
        scans: qrScanHistory.slice(0, limit)
    };
}

/**
 * Clear scan history
 */
function clearScanHistory() {
    qrScanHistory = [];
    localStorage.removeItem('qrScanHistory');

    return { success: true };
}

// === CAMERA ACCESS ===

/**
 * Request camera permission
 */
async function requestCameraPermission() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
        });

        // Stop stream immediately (just checking permission)
        stream.getTracks().forEach(track => track.stop());

        console.log('[QR] Camera permission granted');

        return {
            success: true,
            granted: true
        };
    } catch (error) {
        console.error('[QR] Camera permission denied:', error);

        return {
            success: false,
            granted: false,
            error: error.message
        };
    }
}

/**
 * Initialize QR scanner (web)
 */
async function initializeWebScanner(videoElement) {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });

        videoElement.srcObject = stream;
        await videoElement.play();

        console.log('[QR] Web scanner initialized');

        return {
            success: true,
            stream
        };
    } catch (error) {
        console.error('[QR] Scanner initialization failed:', error);

        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Stop scanner
 */
function stopScanner(stream) {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        console.log('[QR] Scanner stopped');
    }
}

// === QUICK ACTIONS ===

/**
 * Quick add to cart from QR
 */
function quickAddToCart(productId, quantity = 1) {
    const product = (window.flowers || []).find(p => p.id === productId);

    if (!product) {
        return {
            success: false,
            error: 'Product not found'
        };
    }

    // Add to cart using existing cart system
    if (typeof window.addToCart === 'function') {
        window.addToCart(product);

        console.log('[QR] Product added to cart:', product.name);

        return {
            success: true,
            product: {
                id: product.id,
                name: product.name,
                price: product.price
            },
            message: `${product.name} добавлен в корзину`
        };
    }

    return {
        success: false,
        error: 'Cart function not available'
    };
}

/**
 * Quick buy now from QR
 */
function quickBuyNow(productId) {
    const product = (window.flowers || []).find(p => p.id === productId);

    if (!product) {
        return {
            success: false,
            error: 'Product not found'
        };
    }

    // Navigate to quick checkout
    console.log('[QR] Quick buy initiated:', product.name);

    return {
        success: true,
        action: 'checkout',
        product: {
            id: product.id,
            name: product.name,
            price: product.price
        },
        message: 'Переход к оформлению заказа'
    };
}

// === QR CODE GENERATION FOR DISPLAY ===

/**
 * Generate QR code image URL (using external service)
 */
function generateQRCodeImage(data, size = 300) {
    const qrContent = typeof data === 'string' ? data : JSON.stringify(data);
    const encodedContent = encodeURIComponent(qrContent);

    // Using Google Charts API (or can use qrcode.js library)
    const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=${size}x${size}&chl=${encodedContent}`;

    return qrUrl;
}

/**
 * Create printable QR codes
 */
function createPrintableQRSheet(products) {
    const qrCodes = products.map(product => {
        const qrData = generateProductQR(product.id);
        const qrImageUrl = generateQRCodeImage(qrData.url, 200);

        return {
            productId: product.id,
            productName: product.name,
            price: product.price,
            qrImageUrl
        };
    });

    return {
        success: true,
        qrCodes
    };
}

// === DEMO FUNCTIONS ===

/**
 * Simulate QR scan (for testing)
 */
function simulateScan(type, data) {
    let qrData;

    switch (type) {
        case 'product':
            qrData = generateProductQR(data.productId);
            break;
        case 'promo':
            qrData = generatePromoQR(data.promoCode, data.discount);
            break;
        case 'order':
            qrData = generateQuickOrderQR(data);
            break;
        case 'loyalty':
            qrData = generateLoyaltyQR(data.userId, data.points);
            break;
        default:
            return {
                success: false,
                error: 'Invalid simulation type'
            };
    }

    return processScanResult(qrData);
}

// Export API
window.QRScanner = {
    // Generation
    generateProductQR,
    generatePromoQR,
    generateQuickOrderQR,
    generateLoyaltyQR,
    generateQRCodeImage,
    createPrintableQRSheet,

    // Scanning
    processScanResult,
    requestCameraPermission,
    initializeWebScanner,
    stopScanner,

    // History
    getScanHistory,
    clearScanHistory,

    // Quick actions
    quickAddToCart,
    quickBuyNow,

    // Demo
    simulateScan,

    // Config
    config: QR_CONFIG
};

console.log('[QR] QR Scanner system initialized');
