/**
 * Express Server для Цветочный Рай
 * SQLite Backend
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./database');

// Импорт маршрутов
const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const ordersRoutes = require('./routes/orders');

// Создание приложения
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Разрешить запросы с фронтенда
app.use(express.json()); // Парсинг JSON
app.use(express.urlencoded({ extended: true }));

// Логирование запросов
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Инициализация базы данных
initializeDatabase();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);

// Корневой маршрут
app.get('/', (req, res) => {
    res.json({
        message: '🌸 Flower Paradise API',
        version: '1.0.0',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                me: 'GET /api/auth/me'
            },
            products: {
                list: 'GET /api/products',
                details: 'GET /api/products/:id',
                create: 'POST /api/products',
                update: 'PUT /api/products/:id',
                delete: 'DELETE /api/products/:id',
                review: 'POST /api/products/:id/reviews'
            },
            orders: {
                create: 'POST /api/orders',
                list: 'GET /api/orders?userId=:id',
                details: 'GET /api/orders/:orderNumber',
                updateStatus: 'PATCH /api/orders/:orderNumber/status',
                adminList: 'GET /api/orders/admin/all'
            }
        }
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Маршрут не найден'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: 'Внутренняя ошибка сервера'
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log('═══════════════════════════════════════════');
    console.log('🌸 Flower Paradise Backend');
    console.log('═══════════════════════════════════════════');
    console.log(`✅ Сервер запущен на http://localhost:${PORT}`);
    console.log(`📊 API документация: http://localhost:${PORT}/`);
    console.log(`💚 Health check: http://localhost:${PORT}/health`);
    console.log('═══════════════════════════════════════════');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Остановка сервера...');
    process.exit(0);
});
