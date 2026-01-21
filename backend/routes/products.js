/**
 * Products Routes
 * Маршруты для работы с товарами
 */

const express = require('express');
const { dbAsync } = require('../database');

const router = express.Router();

/**
 * GET /api/products
 * Получить список товаров с фильтрацией
 */
router.get('/', async (req, res) => {
    try {
        const {
            category,
            search,
            minPrice,
            maxPrice,
            sortBy = 'id',
            order = 'ASC',
            limit = 50,
            offset = 0
        } = req.query;

        let sql = 'SELECT * FROM products WHERE in_stock = 1';
        const params = [];

        // Фильтр по категории
        if (category && category !== 'all') {
            sql += ' AND category = ?';
            params.push(category);
        }

        // Поиск по названию
        if (search) {
            sql += ' AND (name LIKE ? OR short_description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        // Фильтр по цене
        if (minPrice) {
            sql += ' AND price >= ?';
            params.push(parseFloat(minPrice));
        }
        if (maxPrice) {
            sql += ' AND price <= ?';
            params.push(parseFloat(maxPrice));
        }

        // Сортировка
        const allowedSort = ['id', 'name', 'price', 'rating', 'created_at'];
        const sortField = allowedSort.includes(sortBy) ? sortBy : 'id';
        const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        sql += ` ORDER BY ${sortField} ${sortOrder}`;

        // Пагинация
        sql += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        // Выполнение запроса
        const products = await dbAsync.all(sql, params);

        // Подсчет общего количества
        let countSql = 'SELECT COUNT(*) as total FROM products WHERE in_stock = 1';
        const countParams = [];

        if (category && category !== 'all') {
            countSql += ' AND category = ?';
            countParams.push(category);
        }
        if (search) {
            countSql += ' AND (name LIKE ? OR short_description LIKE ?)';
            countParams.push(`%${search}%`, `%${search}%`);
        }

        const countResult = await dbAsync.get(countSql, countParams);

        res.json({
            success: true,
            products,
            pagination: {
                total: countResult.total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: countResult.total > (parseInt(offset) + parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка при получении товаров'
        });
    }
});

/**
 * GET /api/products/:id
 * Получить детали товара
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const product = await dbAsync.get(
            'SELECT * FROM products WHERE id = ?',
            [id]
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Товар не найден'
            });
        }

        // Получить отзывы
        const reviews = await dbAsync.all(
            `SELECT r.*, u.name as user_name, u.avatar
             FROM reviews r
             JOIN users u ON r.user_id = u.id
             WHERE r.product_id = ?
             ORDER BY r.created_at DESC`,
            [id]
        );

        res.json({
            success: true,
            product: {
                ...product,
                reviews
            }
        });

    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка при получении товара'
        });
    }
});

/**
 * POST /api/products
 * Создать новый товар (только для админа)
 */
router.post('/', async (req, res) => {
    try {
        const {
            name,
            price,
            short_description,
            full_description,
            category,
            emoji
        } = req.body;

        // Валидация
        if (!name || !price) {
            return res.status(400).json({
                success: false,
                error: 'Название и цена обязательны'
            });
        }

        const result = await dbAsync.run(
            `INSERT INTO products
             (name, price, short_description, full_description, category, emoji)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [name, price, short_description, full_description, category, emoji]
        );

        res.status(201).json({
            success: true,
            productId: result.lastID
        });

    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка при создании товара'
        });
    }
});

/**
 * PUT /api/products/:id
 * Обновить товар
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            price,
            short_description,
            full_description,
            category,
            emoji,
            in_stock
        } = req.body;

        await dbAsync.run(
            `UPDATE products
             SET name = ?, price = ?, short_description = ?,
                 full_description = ?, category = ?, emoji = ?, in_stock = ?
             WHERE id = ?`,
            [name, price, short_description, full_description, category, emoji, in_stock, id]
        );

        res.json({
            success: true,
            message: 'Товар обновлен'
        });

    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка при обновлении товара'
        });
    }
});

/**
 * DELETE /api/products/:id
 * Удалить товар
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await dbAsync.run('DELETE FROM products WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Товар удален'
        });

    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка при удалении товара'
        });
    }
});

/**
 * POST /api/products/:id/reviews
 * Добавить отзыв
 */
router.post('/:id/reviews', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, rating, comment } = req.body;

        // Валидация
        if (!userId || !rating) {
            return res.status(400).json({
                success: false,
                error: 'userId и rating обязательны'
            });
        }

        // Создание отзыва
        await dbAsync.run(
            'INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
            [id, userId, rating, comment]
        );

        // Обновление рейтинга товара
        const stats = await dbAsync.get(
            'SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE product_id = ?',
            [id]
        );

        await dbAsync.run(
            'UPDATE products SET rating = ?, review_count = ? WHERE id = ?',
            [stats.avg_rating, stats.count, id]
        );

        res.status(201).json({
            success: true,
            message: 'Отзыв добавлен'
        });

    } catch (error) {
        console.error('Add review error:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка при добавлении отзыва'
        });
    }
});

module.exports = router;
