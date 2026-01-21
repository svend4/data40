/**
 * Admin Panel Management System
 * Dashboard, Orders, Products, Users management
 */

// Admin authentication
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123' // В реальном проекте - хешированный пароль
};

let currentAdmin = JSON.parse(localStorage.getItem('currentAdmin') || 'null');

// Check admin authentication
function isAdminAuthenticated() {
    return currentAdmin !== null;
}

// Admin login
function adminLogin(username, password) {
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        currentAdmin = {
            username: username,
            role: 'admin',
            loginTime: Date.now()
        };
        localStorage.setItem('currentAdmin', JSON.stringify(currentAdmin));
        return true;
    }
    return false;
}

// Admin logout
function adminLogout() {
    currentAdmin = null;
    localStorage.removeItem('currentAdmin');
    window.location.href = 'admin.html';
}

// Get dashboard statistics
function getDashboardStats() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const flowers = window.flowers || [];
    const subscribers = JSON.parse(localStorage.getItem('emailSubscribers') || '[]');

    // Calculate revenue
    const totalRevenue = orders.reduce((sum, order) => {
        const orderTotal = parseFloat(order.total) || 0;
        return sum + orderTotal;
    }, 0);

    // Calculate today's revenue
    const today = new Date().setHours(0, 0, 0, 0);
    const todayRevenue = orders.filter(order => {
        const orderDate = new Date(order.date).setHours(0, 0, 0, 0);
        return orderDate === today;
    }).reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);

    // Get order statuses
    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length;
    const completedOrders = orders.filter(o => o.status === 'delivered').length;

    return {
        totalOrders: orders.length,
        pendingOrders: pendingOrders,
        completedOrders: completedOrders,
        totalRevenue: totalRevenue,
        todayRevenue: todayRevenue,
        totalUsers: users.length,
        totalProducts: flowers.length,
        activeSubscribers: subscribers.filter(s => s.subscribed).length
    };
}

// Get recent orders
function getRecentOrders(limit = 10) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    return orders
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit);
}

// Get all orders with filters
function getOrders(filters = {}) {
    let orders = JSON.parse(localStorage.getItem('orders') || '[]');

    // Apply status filter
    if (filters.status && filters.status !== 'all') {
        orders = orders.filter(o => o.status === filters.status);
    }

    // Apply date filter
    if (filters.dateFrom) {
        orders = orders.filter(o => new Date(o.date) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
        orders = orders.filter(o => new Date(o.date) <= new Date(filters.dateTo));
    }

    // Apply search filter
    if (filters.search) {
        const search = filters.search.toLowerCase();
        orders = orders.filter(o => 
            o.orderNumber.toLowerCase().includes(search) ||
            o.customerName.toLowerCase().includes(search) ||
            o.email.toLowerCase().includes(search)
        );
    }

    return orders.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Update order status
function updateOrderStatus(orderNumber, newStatus) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const order = orders.find(o => o.orderNumber === orderNumber);
    
    if (order) {
        order.status = newStatus;
        order.lastUpdated = new Date().toISOString();
        
        // Add to status history
        if (!order.statusHistory) {
            order.statusHistory = [];
        }
        order.statusHistory.push({
            status: newStatus,
            timestamp: new Date().toISOString(),
            updatedBy: currentAdmin.username
        });
        
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // Send notification email to customer
        if (typeof window.EmailAPI !== 'undefined') {
            // Email notification logic here
            console.log('[Admin] Order status updated, email should be sent');
        }
        
        return true;
    }
    return false;
}

// Delete order
function deleteOrder(orderNumber) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const filteredOrders = orders.filter(o => o.orderNumber !== orderNumber);
    localStorage.setItem('orders', JSON.stringify(filteredOrders));
    return true;
}

// Get all users with filters
function getUsers(filters = {}) {
    let users = JSON.parse(localStorage.getItem('users') || '[]');

    // Apply search filter
    if (filters.search) {
        const search = filters.search.toLowerCase();
        users = users.filter(u => 
            (u.name && u.name.toLowerCase().includes(search)) ||
            (u.email && u.email.toLowerCase().includes(search))
        );
    }

    // Apply status filter
    if (filters.status === 'active') {
        users = users.filter(u => !u.blocked);
    } else if (filters.status === 'blocked') {
        users = users.filter(u => u.blocked);
    }

    return users;
}

// Block/unblock user
function toggleUserBlock(userId) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === userId);
    
    if (user) {
        user.blocked = !user.blocked;
        user.blockedAt = user.blocked ? Date.now() : null;
        user.blockedBy = user.blocked ? currentAdmin.username : null;
        localStorage.setItem('users', JSON.stringify(users));
        return true;
    }
    return false;
}

// Delete user
function deleteUser(userId) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const filteredUsers = users.filter(u => u.id !== userId);
    localStorage.setItem('users', JSON.stringify(filteredUsers));
    return true;
}

// Get products (flowers)
function getProducts(filters = {}) {
    let products = window.flowers || [];

    // Apply search filter
    if (filters.search) {
        const search = filters.search.toLowerCase();
        products = products.filter(p => 
            p.name.toLowerCase().includes(search) ||
            (p.shortDescription && p.shortDescription.toLowerCase().includes(search))
        );
    }

    // Apply type filter
    if (filters.type && filters.type !== 'all') {
        products = products.filter(p => p.type === filters.type);
    }

    return products;
}

// Add product
function addProduct(productData) {
    const products = window.flowers || [];
    
    const newProduct = {
        id: Math.max(...products.map(p => p.id), 0) + 1,
        ...productData,
        rating: productData.rating || 0,
        reviewCount: 0,
        createdAt: Date.now(),
        createdBy: currentAdmin.username
    };

    products.push(newProduct);
    window.flowers = products;
    
    // In real app, save to backend
    console.log('[Admin] Product added:', newProduct);
    return newProduct;
}

// Update product
function updateProduct(productId, productData) {
    const products = window.flowers || [];
    const product = products.find(p => p.id === productId);
    
    if (product) {
        Object.assign(product, productData);
        product.updatedAt = Date.now();
        product.updatedBy = currentAdmin.username;
        window.flowers = products;
        
        console.log('[Admin] Product updated:', product);
        return true;
    }
    return false;
}

// Delete product
function deleteProduct(productId) {
    const products = window.flowers || [];
    window.flowers = products.filter(p => p.id !== productId);
    console.log('[Admin] Product deleted:', productId);
    return true;
}

// Get sales analytics
function getSalesAnalytics(period = 'week') {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const now = Date.now();
    const periodMs = {
        'day': 24 * 60 * 60 * 1000,
        'week': 7 * 24 * 60 * 60 * 1000,
        'month': 30 * 24 * 60 * 60 * 1000,
        'year': 365 * 24 * 60 * 60 * 1000
    };

    const periodStart = now - periodMs[period];
    const periodOrders = orders.filter(o => new Date(o.date).getTime() >= periodStart);

    // Group by date
    const salesByDate = {};
    periodOrders.forEach(order => {
        const date = new Date(order.date).toLocaleDateString('ru-RU');
        if (!salesByDate[date]) {
            salesByDate[date] = { count: 0, revenue: 0 };
        }
        salesByDate[date].count++;
        salesByDate[date].revenue += parseFloat(order.total) || 0;
    });

    return {
        totalOrders: periodOrders.length,
        totalRevenue: periodOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0),
        averageOrderValue: periodOrders.length > 0 ? 
            (periodOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0) / periodOrders.length) : 0,
        salesByDate: salesByDate
    };
}

// Get top products
function getTopProducts(limit = 10) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const productSales = {};

    orders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
                if (!productSales[item.id]) {
                    productSales[item.id] = {
                        id: item.id,
                        name: item.name,
                        quantity: 0,
                        revenue: 0
                    };
                }
                productSales[item.id].quantity += item.quantity || 1;
                productSales[item.id].revenue += (item.price || 0) * (item.quantity || 1);
            });
        }
    });

    return Object.values(productSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, limit);
}

// Export data to CSV
function exportToCSV(data, filename) {
    let csv = '';
    
    // Headers
    if (data.length > 0) {
        const headers = Object.keys(data[0]);
        csv += headers.join(',') + '\n';
        
        // Rows
        data.forEach(row => {
            const values = headers.map(header => {
                const value = row[header];
                // Escape quotes and wrap in quotes if contains comma
                return typeof value === 'string' && value.includes(',') ? 
                    `"${value.replace(/"/g, '""')}"` : value;
            });
            csv += values.join(',') + '\n';
        });
    }

    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

// Activity log
function logActivity(action, details) {
    const logs = JSON.parse(localStorage.getItem('adminActivityLogs') || '[]');
    
    logs.push({
        id: 'log_' + Date.now(),
        admin: currentAdmin.username,
        action: action,
        details: details,
        timestamp: Date.now()
    });

    // Keep only last 1000 logs
    if (logs.length > 1000) {
        logs.splice(0, logs.length - 1000);
    }

    localStorage.setItem('adminActivityLogs', JSON.stringify(logs));
}

// Get activity logs
function getActivityLogs(limit = 50) {
    const logs = JSON.parse(localStorage.getItem('adminActivityLogs') || '[]');
    return logs.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
}

// Export API
window.AdminAPI = {
    // Auth
    isAdminAuthenticated,
    adminLogin,
    adminLogout,
    
    // Dashboard
    getDashboardStats,
    getSalesAnalytics,
    getTopProducts,
    
    // Orders
    getRecentOrders,
    getOrders,
    updateOrderStatus,
    deleteOrder,
    
    // Users
    getUsers,
    toggleUserBlock,
    deleteUser,
    
    // Products
    getProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    
    // Utilities
    exportToCSV,
    logActivity,
    getActivityLogs,
    
    // Current admin
    getCurrentAdmin: () => currentAdmin
};

// Protect admin pages
if (window.location.pathname.includes('admin.html') && !isAdminAuthenticated()) {
    // Redirect to login if not authenticated
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has('login')) {
        window.location.href = 'admin.html?login=true';
    }
}
