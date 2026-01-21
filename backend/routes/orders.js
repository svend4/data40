/**
 * Orders Routes
 * Маршруты для работы с заказами
 */

const express = require('express');
const { dbAsync } = require('../database');

const router = express.Router();

/**
 * POST /api/orders
 * Создать новый заказ
 */
router.post('/', async (req, res) => {
    try {
        const {
            userId,
            customerName,
            email,
            phone,
            items,
            total,
            deliveryAddress,
            paymentMethod
        } = req.body;

        // Валидация
        if (!userId || !items || !total) {
            return res.status(400).json({
                success: false,
                error: 'userId, items и total обязательны'
            });
        }

        // Генерация номера заказа
        const orderNumber = 'ORD-' + Date.now();

        // Создание заказа
        const result = await dbAsync.run(
            `INSERT INTO orders
             (order_number, user_id, customer_name, email, phone, items, total, delivery_address, payment_method, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                orderNumber,
                userId,
                customerName,
                email,
                phone,
                JSON.stringify(items),
                total,
                JSON.stringify(deliveryAddress),
                paymentMethod,
                'confirmed'
            ]
        );

        res.status(201).json({
            success: true,
            order: {
                id: result.lastID,
                orderNumber,
                status: 'confirmed',
                total
            }
        });

    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка при создании заказа'
        });
    }
});

/**
 * GET /api/orders
 * Получить список заказов пользователя
 */
router.get('/', async (req, res) => {
    try {
        const { userId, limit = 20, offset = 0 } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId обязателен'
            });
        }

        // Получение заказов
        const orders = await dbAsync.all(
            `SELECT id, order_number, customer_name, total, status, created_at
             FROM orders
             WHERE user_id = ?
             ORDER BY created_at DESC
             LIMIT ? OFFSET ?`,
            [userId, parseInt(limit), parseInt(offset)]
        );

        // Подсчет общего количества
        const countResult = await dbAsync.get(
            'SELECT COUNT(*) as total FROM orders WHERE user_id = ?',
            [userId]
        );

        // Парсинг items для каждого заказа
        const ordersWithItems = orders.map(order => ({
            ...order,
            itemCount: JSON.parse(order.items || '[]').length
        }));

        res.json({
            success: true,
            orders: ordersWithItems,
            pagination: {
                total: countResult.total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: countResult.total > (parseInt(offset) + parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка при получении заказов'
        });
    }
});

/**
 * GET /api/orders/:orderNumber
 * Получить детали заказа
 */
router.get('/:orderNumber', async (req, res) => {
    try {
        const { orderNumber } = req.params;

        const order = await dbAsync.get(
            'SELECT * FROM orders WHERE order_number = ?',
            [orderNumber]
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Заказ не найден'
            });
        }

        // Парсинг JSON полей
        const orderDetails = {
            ...order,
            items: JSON.parse(order.items),
            delivery_address: order.delivery_address ? JSON.parse(order.delivery_address) : null
        };

        res.json({
            success: true,
            order: orderDetails
        });

    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка при получении заказа'
        });
    }
});

/**
 * PATCH /api/orders/:orderNumber/status
 * Обновить статус заказа
 */
router.patch('/:orderNumber/status', async (req, res) => {
    try {
        const { orderNumber } = req.params;
        const { status } = req.body;

        const allowedStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Неверный статус'
            });
        }

        await dbAsync.run(
            'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE order_number = ?',
            [status, orderNumber]
        );

        res.json({
            success: true,
            message: 'Статус заказа обновлен'
        });

    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка при обновлении статуса'
        });
    }
});

/**
 * GET /api/orders/admin/all
 * Получить все заказы (для админа)
 */
router.get('/admin/all', async (req, res) => {
    try {
        const { status, limit = 50, offset = 0 } = req.query;

        let sql = 'SELECT * FROM orders';
        const params = [];

        if (status && status !== 'all') {
            sql += ' WHERE status = ?';
            params.push(status);
        }

        sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const orders = await dbAsync.all(sql, params);

        res.json({
            success: true,
            orders: orders.map(order => ({
                ...order,
                items: JSON.parse(order.items),
                delivery_address: order.delivery_address ? JSON.parse(order.delivery_address) : null
            }))
        });

    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка при получении заказов'
        });
    }
});

module.exports = router;
