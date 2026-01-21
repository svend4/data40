/**
 * API Client для Frontend
 * Замена localStorage на backend API
 */

const API_CONFIG = {
    baseUrl: 'http://localhost:3000/api',
    timeout: 10000
};

/**
 * Вспомогательная функция для API запросов
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_CONFIG.baseUrl}${endpoint}`;

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    // Добавляем токен если есть
    const token = localStorage.getItem('authToken');
    if (token) {
        defaultOptions.headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Ошибка API');
        }

        return data;

    } catch (error) {
        console.error(`API Error [${endpoint}]:`, error);
        throw error;
    }
}

// ═══════════════════════════════════════
// АВТОРИЗАЦИЯ
// ═══════════════════════════════════════

/**
 * Регистрация пользователя
 *
 * БЫЛО (localStorage):
 * function register(email, password) {
 *     const users = JSON.parse(localStorage.getItem('users') || '[]');
 *     users.push({ email, password });
 *     localStorage.setItem('users', JSON.stringify(users));
 * }
 */
async function register(email, password, name, phone) {
    const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name, phone })
    });

    if (data.success) {
        // Сохраняем токен
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        window.currentUser = data.user;
    }

    return data;
}

/**
 * Вход пользователя
 *
 * БЫЛО (localStorage):
 * function login(email, password) {
 *     const users = JSON.parse(localStorage.getItem('users') || '[]');
 *     const user = users.find(u => u.email === email && u.password === password);
 *     return user;
 * }
 */
async function login(email, password) {
    const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });

    if (data.success) {
        // Сохраняем токен и пользователя
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        window.currentUser = data.user;

        // Событие для других модулей
        document.dispatchEvent(new CustomEvent('userLoggedIn', {
            detail: { user: data.user }
        }));
    }

    return data;
}

/**
 * Выход
 */
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    window.currentUser = null;

    document.dispatchEvent(new Event('userLoggedOut'));
}

/**
 * Проверка авторизации
 */
async function checkAuth() {
    const token = localStorage.getItem('authToken');

    if (!token) {
        return null;
    }

    try {
        const data = await apiRequest('/auth/me');
        if (data.success) {
            window.currentUser = data.user;
            return data.user;
        }
    } catch (error) {
        // Токен невалидный - выходим
        logout();
        return null;
    }
}

// ═══════════════════════════════════════
// ТОВАРЫ
// ═══════════════════════════════════════

/**
 * Получить список товаров
 *
 * БЫЛО (localStorage):
 * function getProducts() {
 *     return JSON.parse(localStorage.getItem('flowers') || '[]');
 * }
 */
async function getProducts(filters = {}) {
    const params = new URLSearchParams(filters);
    const data = await apiRequest(`/products?${params}`);

    if (data.success) {
        // Сохраняем в глобальной переменной для совместимости
        window.flowers = data.products;
        return data.products;
    }

    return [];
}

/**
 * Получить детали товара
 *
 * БЫЛО:
 * function getProduct(id) {
 *     const flowers = JSON.parse(localStorage.getItem('flowers') || '[]');
 *     return flowers.find(f => f.id === id);
 * }
 */
async function getProduct(id) {
    const data = await apiRequest(`/products/${id}`);

    if (data.success) {
        return data.product;
    }

    return null;
}

/**
 * Добавить отзыв
 */
async function addReview(productId, rating, comment) {
    if (!window.currentUser) {
        throw new Error('Требуется авторизация');
    }

    const data = await apiRequest(`/products/${productId}/reviews`, {
        method: 'POST',
        body: JSON.stringify({
            userId: window.currentUser.id,
            rating,
            comment
        })
    });

    return data;
}

// ═══════════════════════════════════════
// ЗАКАЗЫ
// ═══════════════════════════════════════

/**
 * Создать заказ
 *
 * БЫЛО (localStorage):
 * function createOrder(orderData) {
 *     const orders = JSON.parse(localStorage.getItem('orders') || '[]');
 *     orders.push(orderData);
 *     localStorage.setItem('orders', JSON.stringify(orders));
 * }
 */
async function createOrder(orderData) {
    if (!window.currentUser) {
        throw new Error('Требуется авторизация');
    }

    // Добавляем userId
    const orderWithUser = {
        ...orderData,
        userId: window.currentUser.id
    };

    const data = await apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify(orderWithUser)
    });

    if (data.success) {
        // Очистить корзину
        localStorage.removeItem('cart');

        // Событие для других модулей
        document.dispatchEvent(new CustomEvent('orderCreated', {
            detail: { order: data.order }
        }));
    }

    return data;
}

/**
 * Получить заказы пользователя
 *
 * БЫЛО:
 * function getOrders() {
 *     return JSON.parse(localStorage.getItem('orders') || '[]');
 * }
 */
async function getOrders(limit = 20, offset = 0) {
    if (!window.currentUser) {
        return [];
    }

    const data = await apiRequest(`/orders?userId=${window.currentUser.id}&limit=${limit}&offset=${offset}`);

    if (data.success) {
        return data.orders;
    }

    return [];
}

/**
 * Получить детали заказа
 */
async function getOrder(orderNumber) {
    const data = await apiRequest(`/orders/${orderNumber}`);

    if (data.success) {
        return data.order;
    }

    return null;
}

// ═══════════════════════════════════════
// КОРЗИНА (пока оставляем localStorage)
// ═══════════════════════════════════════

/**
 * Корзину можно пока оставить в localStorage,
 * т.к. она синхронизируется только при оформлении заказа
 */
function addToCart(product, quantity = 1) {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');

    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            emoji: product.emoji,
            quantity
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));

    document.dispatchEvent(new CustomEvent('cartUpdated', {
        detail: { cart }
    }));

    return cart;
}

function getCart() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
}

function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));

    document.dispatchEvent(new CustomEvent('cartUpdated', {
        detail: { cart }
    }));

    return cart;
}

function clearCart() {
    localStorage.removeItem('cart');
    document.dispatchEvent(new CustomEvent('cartUpdated', {
        detail: { cart: [] }
    }));
}

// ═══════════════════════════════════════
// ИНИЦИАЛИЗАЦИЯ
// ═══════════════════════════════════════

/**
 * Инициализация при загрузке страницы
 */
async function initializeAPI() {
    console.log('[API Client] Инициализация...');

    // Проверяем авторизацию
    await checkAuth();

    // Загружаем товары
    await getProducts();

    console.log('[API Client] Готов к работе');
}

// Автоматическая инициализация
document.addEventListener('DOMContentLoaded', () => {
    initializeAPI();
});

// ═══════════════════════════════════════
// ЭКСПОРТ API
// ═══════════════════════════════════════

window.API = {
    // Конфигурация
    config: API_CONFIG,

    // Авторизация
    register,
    login,
    logout,
    checkAuth,

    // Товары
    getProducts,
    getProduct,
    addReview,

    // Заказы
    createOrder,
    getOrders,
    getOrder,

    // Корзина (пока localStorage)
    addToCart,
    getCart,
    removeFromCart,
    clearCart
};

console.log('[API Client] API модуль загружен');
