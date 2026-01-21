/**
 * SQLite Database Configuration
 * Подключение и схема базы данных
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Путь к файлу базы данных
const DB_PATH = path.join(__dirname, 'flower_shop.db');

// Создание подключения
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('❌ Ошибка подключения к БД:', err.message);
    } else {
        console.log('✅ Подключено к SQLite базе данных');
    }
});

// Включить foreign keys
db.run('PRAGMA foreign_keys = ON');

/**
 * Инициализация схемы БД
 */
function initializeDatabase() {
    db.serialize(() => {
        // Таблица пользователей
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                name TEXT,
                phone TEXT,
                avatar TEXT,
                role TEXT DEFAULT 'user',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Таблица товаров
        db.run(`
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                price REAL NOT NULL,
                short_description TEXT,
                full_description TEXT,
                category TEXT,
                emoji TEXT,
                rating REAL DEFAULT 0,
                review_count INTEGER DEFAULT 0,
                in_stock BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Таблица заказов
        db.run(`
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_number TEXT UNIQUE NOT NULL,
                user_id INTEGER NOT NULL,
                customer_name TEXT,
                email TEXT,
                phone TEXT,
                items TEXT NOT NULL,
                total REAL NOT NULL,
                delivery_address TEXT,
                payment_method TEXT,
                status TEXT DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        // Таблица корзин
        db.run(`
            CREATE TABLE IF NOT EXISTS carts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                items TEXT NOT NULL,
                synced_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        // Таблица отзывов
        db.run(`
            CREATE TABLE IF NOT EXISTS reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                rating INTEGER NOT NULL,
                comment TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        // Таблица промокодов
        db.run(`
            CREATE TABLE IF NOT EXISTS promo_codes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                code TEXT UNIQUE NOT NULL,
                discount REAL NOT NULL,
                type TEXT DEFAULT 'percent',
                min_order REAL DEFAULT 0,
                max_uses INTEGER,
                current_uses INTEGER DEFAULT 0,
                expires_at DATETIME,
                active BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Таблица сессий (для auth tokens)
        db.run(`
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                token TEXT UNIQUE NOT NULL,
                device_info TEXT,
                expires_at DATETIME NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        console.log('✅ Схема базы данных инициализирована');
    });
}

/**
 * Promise-обертки для SQLite методов
 */
const dbAsync = {
    /**
     * Выполнить SELECT запрос (все строки)
     */
    all: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    /**
     * Выполнить SELECT запрос (одна строка)
     */
    get: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    /**
     * Выполнить INSERT/UPDATE/DELETE
     */
    run: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve({
                    lastID: this.lastID,
                    changes: this.changes
                });
            });
        });
    }
};

/**
 * Закрыть подключение к БД
 */
function closeDatabase() {
    return new Promise((resolve, reject) => {
        db.close((err) => {
            if (err) reject(err);
            else {
                console.log('✅ Подключение к БД закрыто');
                resolve();
            }
        });
    });
}

module.exports = {
    db,
    dbAsync,
    initializeDatabase,
    closeDatabase
};
