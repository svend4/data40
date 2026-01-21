/**
 * Mobile API
 * RESTful API endpoints for mobile app integration
 */

// Mobile API configuration
const MOBILE_API_CONFIG = {
    version: '1.0.0',
    baseUrl: '/api/v1',
    authTokenExpiry: 30 * 24 * 60 * 60 * 1000, // 30 days
    refreshTokenExpiry: 90 * 24 * 60 * 60 * 1000 // 90 days
};

// Mobile sessions storage
let mobileSessions = JSON.parse(localStorage.getItem('mobileSessions') || '{}');
let mobileDevices = JSON.parse(localStorage.getItem('mobileDevices') || '{}');

// === AUTHENTICATION ===

/**
 * Mobile login
 */
function mobileLogin(credentials) {
    const { email, password, deviceId, deviceInfo } = credentials;

    // Validate credentials (using existing auth system)
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        return {
            success: false,
            error: 'Invalid credentials',
            code: 'AUTH_FAILED'
        };
    }

    // Generate tokens
    const authToken = generateToken('auth');
    const refreshToken = generateToken('refresh');

    // Create session
    const session = {
        userId: user.id,
        deviceId,
        authToken,
        refreshToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + MOBILE_API_CONFIG.authTokenExpiry,
        lastActive: Date.now()
    };

    mobileSessions[authToken] = session;
    localStorage.setItem('mobileSessions', JSON.stringify(mobileSessions));

    // Register device
    if (!mobileDevices[deviceId]) {
        mobileDevices[deviceId] = {
            id: deviceId,
            userId: user.id,
            ...deviceInfo,
            registeredAt: Date.now(),
            lastSeen: Date.now()
        };
        localStorage.setItem('mobileDevices', JSON.stringify(mobileDevices));
    }

    console.log('[MobileAPI] User logged in:', user.email);

    return {
        success: true,
        user: {
            id: user.id,
            email: user.email,
            name: user.name || user.email,
            phone: user.phone || '',
            avatar: user.avatar || null
        },
        tokens: {
            authToken,
            refreshToken,
            expiresAt: session.expiresAt
        }
    };
}

/**
 * Refresh auth token
 */
function refreshAuthToken(refreshToken) {
    // Find session by refresh token
    const session = Object.values(mobileSessions).find(s => s.refreshToken === refreshToken);

    if (!session) {
        return {
            success: false,
            error: 'Invalid refresh token',
            code: 'INVALID_TOKEN'
        };
    }

    // Generate new auth token
    const newAuthToken = generateToken('auth');
    const oldAuthToken = session.authToken;

    // Update session
    session.authToken = newAuthToken;
    session.expiresAt = Date.now() + MOBILE_API_CONFIG.authTokenExpiry;
    session.lastActive = Date.now();

    // Replace in storage
    delete mobileSessions[oldAuthToken];
    mobileSessions[newAuthToken] = session;
    localStorage.setItem('mobileSessions', JSON.stringify(mobileSessions));

    console.log('[MobileAPI] Token refreshed');

    return {
        success: true,
        tokens: {
            authToken: newAuthToken,
            expiresAt: session.expiresAt
        }
    };
}

/**
 * Mobile logout
 */
function mobileLogout(authToken) {
    if (mobileSessions[authToken]) {
        delete mobileSessions[authToken];
        localStorage.setItem('mobileSessions', JSON.stringify(mobileSessions));

        console.log('[MobileAPI] User logged out');
        return { success: true };
    }

    return {
        success: false,
        error: 'Session not found',
        code: 'SESSION_NOT_FOUND'
    };
}

/**
 * Validate auth token
 */
function validateAuthToken(authToken) {
    const session = mobileSessions[authToken];

    if (!session) {
        return { valid: false, error: 'Session not found' };
    }

    if (session.expiresAt < Date.now()) {
        delete mobileSessions[authToken];
        localStorage.setItem('mobileSessions', JSON.stringify(mobileSessions));
        return { valid: false, error: 'Token expired' };
    }

    // Update last active
    session.lastActive = Date.now();
    localStorage.setItem('mobileSessions', JSON.stringify(mobileSessions));

    return {
        valid: true,
        userId: session.userId,
        deviceId: session.deviceId
    };
}

// === CATALOG ===

/**
 * Get products for mobile
 */
function getMobileProducts(filters = {}) {
    const { category, search, limit = 20, offset = 0, sortBy = 'popular' } = filters;

    let products = window.flowers || [];

    // Apply filters
    if (category && category !== 'all') {
        products = products.filter(p => p.type === category);
    }

    if (search) {
        const query = search.toLowerCase();
        products = products.filter(p =>
            p.name.toLowerCase().includes(query) ||
            p.shortDescription?.toLowerCase().includes(query)
        );
    }

    // Sort
    if (sortBy === 'popular') {
        products.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    } else if (sortBy === 'price_asc') {
        products.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
        products.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
        products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    // Pagination
    const total = products.length;
    products = products.slice(offset, offset + limit);

    // Format for mobile
    const mobileProducts = products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.shortDescription || '',
        price: p.price,
        image: p.emoji,
        category: p.type,
        rating: p.rating || 0,
        reviewCount: p.reviewCount || 0,
        inStock: true
    }));

    return {
        success: true,
        products: mobileProducts,
        pagination: {
            total,
            limit,
            offset,
            hasMore: offset + limit < total
        }
    };
}

/**
 * Get product details
 */
function getMobileProductDetails(productId) {
    const product = (window.flowers || []).find(p => p.id === parseInt(productId));

    if (!product) {
        return {
            success: false,
            error: 'Product not found',
            code: 'PRODUCT_NOT_FOUND'
        };
    }

    return {
        success: true,
        product: {
            id: product.id,
            name: product.name,
            description: product.fullDescription || product.shortDescription || '',
            shortDescription: product.shortDescription || '',
            price: product.price,
            image: product.emoji,
            category: product.type,
            rating: product.rating || 0,
            reviewCount: product.reviewCount || 0,
            inStock: true,
            ingredients: product.ingredients || [],
            occasions: product.occasions || []
        }
    };
}

// === CART ===

/**
 * Sync mobile cart
 */
function syncMobileCart(authToken, cartItems) {
    const validation = validateAuthToken(authToken);

    if (!validation.valid) {
        return {
            success: false,
            error: validation.error,
            code: 'INVALID_TOKEN'
        };
    }

    // Store cart in user's data
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === validation.userId);

    if (user) {
        user.mobileCart = {
            items: cartItems,
            syncedAt: Date.now()
        };
        localStorage.setItem('users', JSON.stringify(users));
    }

    return {
        success: true,
        cart: {
            items: cartItems,
            syncedAt: Date.now()
        }
    };
}

/**
 * Get mobile cart
 */
function getMobileCart(authToken) {
    const validation = validateAuthToken(authToken);

    if (!validation.valid) {
        return {
            success: false,
            error: validation.error,
            code: 'INVALID_TOKEN'
        };
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === validation.userId);

    if (user && user.mobileCart) {
        return {
            success: true,
            cart: user.mobileCart
        };
    }

    return {
        success: true,
        cart: {
            items: [],
            syncedAt: Date.now()
        }
    };
}

// === ORDERS ===

/**
 * Create order from mobile
 */
function createMobileOrder(authToken, orderData) {
    const validation = validateAuthToken(authToken);

    if (!validation.valid) {
        return {
            success: false,
            error: validation.error,
            code: 'INVALID_TOKEN'
        };
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === validation.userId);

    if (!user) {
        return {
            success: false,
            error: 'User not found',
            code: 'USER_NOT_FOUND'
        };
    }

    // Create order
    const order = {
        orderNumber: 'ORD-' + Date.now(),
        userId: user.id,
        customerName: orderData.customerName || user.name,
        email: user.email,
        phone: orderData.phone || user.phone,
        items: orderData.items,
        total: orderData.total,
        deliveryAddress: orderData.deliveryAddress,
        paymentMethod: orderData.paymentMethod,
        status: 'confirmed',
        date: new Date().toISOString(),
        source: 'mobile',
        deviceId: validation.deviceId
    };

    // Save order
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Clear mobile cart
    if (user.mobileCart) {
        user.mobileCart.items = [];
        localStorage.setItem('users', JSON.stringify(users));
    }

    // Create delivery route
    if (typeof window.DeliveryAPI !== 'undefined') {
        window.DeliveryAPI.createDeliveryRoute(order.orderNumber, order);
    }

    // Send order confirmation email
    if (typeof window.EmailAPI !== 'undefined') {
        window.EmailAPI.sendOrderConfirmationEmail(order);
    }

    console.log('[MobileAPI] Order created:', order.orderNumber);

    return {
        success: true,
        order: {
            orderNumber: order.orderNumber,
            status: order.status,
            total: order.total,
            createdAt: order.date
        }
    };
}

/**
 * Get user orders
 */
function getMobileOrders(authToken, filters = {}) {
    const validation = validateAuthToken(authToken);

    if (!validation.valid) {
        return {
            success: false,
            error: validation.error,
            code: 'INVALID_TOKEN'
        };
    }

    const { limit = 10, offset = 0 } = filters;

    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    let userOrders = orders.filter(o => o.userId === validation.userId);

    // Sort by date (newest first)
    userOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

    const total = userOrders.length;
    userOrders = userOrders.slice(offset, offset + limit);

    // Format for mobile
    const mobileOrders = userOrders.map(o => ({
        orderNumber: o.orderNumber,
        status: o.status,
        total: o.total,
        itemCount: o.items?.length || 0,
        date: o.date,
        deliveryAddress: o.deliveryAddress?.address || ''
    }));

    return {
        success: true,
        orders: mobileOrders,
        pagination: {
            total,
            limit,
            offset,
            hasMore: offset + limit < total
        }
    };
}

/**
 * Get order details
 */
function getMobileOrderDetails(authToken, orderNumber) {
    const validation = validateAuthToken(authToken);

    if (!validation.valid) {
        return {
            success: false,
            error: validation.error,
            code: 'INVALID_TOKEN'
        };
    }

    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const order = orders.find(o => o.orderNumber === orderNumber && o.userId === validation.userId);

    if (!order) {
        return {
            success: false,
            error: 'Order not found',
            code: 'ORDER_NOT_FOUND'
        };
    }

    // Get delivery tracking
    let tracking = null;
    if (typeof window.DeliveryAPI !== 'undefined') {
        const deliveryStatus = window.DeliveryAPI.getDeliveryStatus(orderNumber);
        if (deliveryStatus.found) {
            tracking = {
                status: deliveryStatus.statusText,
                courier: deliveryStatus.courier ? {
                    name: deliveryStatus.courier.name,
                    phone: deliveryStatus.courier.phone,
                    rating: deliveryStatus.courier.rating
                } : null,
                eta: deliveryStatus.eta
            };
        }
    }

    return {
        success: true,
        order: {
            orderNumber: order.orderNumber,
            status: order.status,
            items: order.items,
            total: order.total,
            deliveryAddress: order.deliveryAddress,
            paymentMethod: order.paymentMethod,
            date: order.date,
            tracking
        }
    };
}

// === USER PROFILE ===

/**
 * Get user profile
 */
function getMobileUserProfile(authToken) {
    const validation = validateAuthToken(authToken);

    if (!validation.valid) {
        return {
            success: false,
            error: validation.error,
            code: 'INVALID_TOKEN'
        };
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === validation.userId);

    if (!user) {
        return {
            success: false,
            error: 'User not found',
            code: 'USER_NOT_FOUND'
        };
    }

    // Get orders count
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const userOrders = orders.filter(o => o.userId === user.id);

    return {
        success: true,
        profile: {
            id: user.id,
            email: user.email,
            name: user.name || user.email,
            phone: user.phone || '',
            avatar: user.avatar || null,
            registeredAt: user.registeredAt || Date.now(),
            ordersCount: userOrders.length,
            totalSpent: userOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0)
        }
    };
}

/**
 * Update user profile
 */
function updateMobileUserProfile(authToken, updates) {
    const validation = validateAuthToken(authToken);

    if (!validation.valid) {
        return {
            success: false,
            error: validation.error,
            code: 'INVALID_TOKEN'
        };
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === validation.userId);

    if (!user) {
        return {
            success: false,
            error: 'User not found',
            code: 'USER_NOT_FOUND'
        };
    }

    // Update allowed fields
    const allowedFields = ['name', 'phone', 'avatar'];
    allowedFields.forEach(field => {
        if (updates[field] !== undefined) {
            user[field] = updates[field];
        }
    });

    localStorage.setItem('users', JSON.stringify(users));

    console.log('[MobileAPI] Profile updated');

    return {
        success: true,
        profile: {
            id: user.id,
            email: user.email,
            name: user.name || user.email,
            phone: user.phone || '',
            avatar: user.avatar || null
        }
    };
}

// === UTILITIES ===

/**
 * Generate token
 */
function generateToken(type) {
    const prefix = type === 'auth' ? 'AUTH' : 'REFRESH';
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
}

/**
 * Get API info
 */
function getMobileAPIInfo() {
    return {
        version: MOBILE_API_CONFIG.version,
        endpoints: {
            auth: {
                login: 'POST /api/v1/auth/login',
                logout: 'POST /api/v1/auth/logout',
                refresh: 'POST /api/v1/auth/refresh'
            },
            catalog: {
                products: 'GET /api/v1/products',
                productDetails: 'GET /api/v1/products/:id'
            },
            cart: {
                sync: 'POST /api/v1/cart/sync',
                get: 'GET /api/v1/cart'
            },
            orders: {
                create: 'POST /api/v1/orders',
                list: 'GET /api/v1/orders',
                details: 'GET /api/v1/orders/:orderNumber'
            },
            profile: {
                get: 'GET /api/v1/profile',
                update: 'PUT /api/v1/profile'
            }
        }
    };
}

// Export API
window.MobileAPI = {
    // Auth
    mobileLogin,
    refreshAuthToken,
    mobileLogout,
    validateAuthToken,

    // Catalog
    getMobileProducts,
    getMobileProductDetails,

    // Cart
    syncMobileCart,
    getMobileCart,

    // Orders
    createMobileOrder,
    getMobileOrders,
    getMobileOrderDetails,

    // Profile
    getMobileUserProfile,
    updateMobileUserProfile,

    // Utilities
    getMobileAPIInfo,

    // Config
    config: MOBILE_API_CONFIG
};

console.log('[MobileAPI] Mobile API initialized');
