/**
 * Database Initialization Script
 * Заполнение БД начальными данными
 */

const bcrypt = require('bcrypt');
const { dbAsync, initializeDatabase, closeDatabase } = require('./database');

// Тестовые товары
const sampleProducts = [
    { name: '🌹 Розы красные', price: 1500, short_description: 'Классический букет из 25 красных роз', category: 'roses', emoji: '🌹', rating: 4.8, review_count: 45 },
    { name: '🌷 Тюльпаны микс', price: 1200, short_description: 'Яркий букет из 15 разноцветных тюльпанов', category: 'tulips', emoji: '🌷', rating: 4.6, review_count: 32 },
    { name: '🌺 Орхидеи белые', price: 2500, short_description: 'Элегантная композиция из 3 веток орхидей', category: 'orchids', emoji: '🌺', rating: 4.9, review_count: 28 },
    { name: '🌻 Подсолнухи', price: 800, short_description: 'Солнечный букет из 7 подсолнухов', category: 'sunflowers', emoji: '🌻', rating: 4.5, review_count: 19 },
    { name: '💐 Букет невесты', price: 3500, short_description: 'Роскошный свадебный букет из роз и пионов', category: 'wedding', emoji: '💐', rating: 5.0, review_count: 15 },
    { name: '🌸 Пионы розовые', price: 2200, short_description: 'Нежная композиция из 9 розовых пионов', category: 'peonies', emoji: '🌸', rating: 4.7, review_count: 38 },
    { name: '🌼 Ромашки полевые', price: 600, short_description: 'Простой и милый букет из 15 ромашек', category: 'daisies', emoji: '🌼', rating: 4.4, review_count: 22 },
    { name: '🥀 Розы белые', price: 1800, short_description: 'Изысканный букет из 21 белой розы', category: 'roses', emoji: '🥀', rating: 4.8, review_count: 41 },
    { name: '🏵️ Гербера микс', price: 900, short_description: 'Радужный букет из 11 гербер', category: 'gerberas', emoji: '🏵️', rating: 4.3, review_count: 17 },
    { name: '🌹 Розы в коробке', price: 4500, short_description: 'Премиум букет из 101 розы в шляпной коробке', category: 'premium', emoji: '🌹', rating: 5.0, review_count: 52 }
];

// Тестовые промокоды
const samplePromoCodes = [
    { code: 'WELCOME10', discount: 10, type: 'percent', min_order: 1000, max_uses: 100, expires_at: '2026-12-31' },
    { code: 'LOVE20', discount: 20, type: 'percent', min_order: 2000, max_uses: 50, expires_at: '2026-02-14' },
    { code: 'SAVE500', discount: 500, type: 'fixed', min_order: 3000, max_uses: 30, expires_at: '2026-06-30' }
];

async function initializeDatabaseWithData() {
    try {
        console.log('🔧 Инициализация базы данных...\n');

        // Создание схемы
        initializeDatabase();

        // Ждем немного, чтобы схема создалась
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Создание тестового пользователя
        console.log('👤 Создание тестового пользователя...');
        const hashedPassword = await bcrypt.hash('password123', 10);

        try {
            await dbAsync.run(
                'INSERT INTO users (email, password, name, phone, role) VALUES (?, ?, ?, ?, ?)',
                ['test@example.com', hashedPassword, 'Тестовый Пользователь', '+7 999 123-45-67', 'user']
            );
            console.log('  ✅ Пользователь: test@example.com / password123');
        } catch (e) {
            if (e.message.includes('UNIQUE')) {
                console.log('  ℹ️  Пользователь уже существует');
            } else {
                throw e;
            }
        }

        // Создание админа
        console.log('👑 Создание админа...');
        const adminPassword = await bcrypt.hash('admin123', 10);

        try {
            await dbAsync.run(
                'INSERT INTO users (email, password, name, phone, role) VALUES (?, ?, ?, ?, ?)',
                ['admin@flowerparadise.ru', adminPassword, 'Администратор', '+7 999 000-00-00', 'admin']
            );
            console.log('  ✅ Админ: admin@flowerparadise.ru / admin123');
        } catch (e) {
            if (e.message.includes('UNIQUE')) {
                console.log('  ℹ️  Админ уже существует');
            } else {
                throw e;
            }
        }

        // Добавление товаров
        console.log('\n🌸 Добавление товаров...');
        for (const product of sampleProducts) {
            try {
                await dbAsync.run(
                    'INSERT INTO products (name, price, short_description, category, emoji, rating, review_count) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [product.name, product.price, product.short_description, product.category, product.emoji, product.rating, product.review_count]
                );
                console.log(`  ✅ ${product.name}`);
            } catch (e) {
                if (e.message.includes('UNIQUE')) {
                    console.log(`  ℹ️  ${product.name} уже существует`);
                } else {
                    console.log(`  ❌ Ошибка добавления ${product.name}`);
                }
            }
        }

        // Добавление промокодов
        console.log('\n🎟️  Добавление промокодов...');
        for (const promo of samplePromoCodes) {
            try {
                await dbAsync.run(
                    'INSERT INTO promo_codes (code, discount, type, min_order, max_uses, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
                    [promo.code, promo.discount, promo.type, promo.min_order, promo.max_uses, promo.expires_at]
                );
                console.log(`  ✅ ${promo.code}: ${promo.discount}${promo.type === 'percent' ? '%' : '₽'}`);
            } catch (e) {
                if (e.message.includes('UNIQUE')) {
                    console.log(`  ℹ️  ${promo.code} уже существует`);
                } else {
                    console.log(`  ❌ Ошибка добавления промокода`);
                }
            }
        }

        console.log('\n═══════════════════════════════════════════');
        console.log('✅ База данных успешно инициализирована!');
        console.log('═══════════════════════════════════════════');
        console.log('\n📊 Статистика:');

        const productCount = await dbAsync.get('SELECT COUNT(*) as count FROM products');
        const userCount = await dbAsync.get('SELECT COUNT(*) as count FROM users');
        const promoCount = await dbAsync.get('SELECT COUNT(*) as count FROM promo_codes');

        console.log(`  👥 Пользователей: ${userCount.count}`);
        console.log(`  🌸 Товаров: ${productCount.count}`);
        console.log(`  🎟️  Промокодов: ${promoCount.count}`);

        console.log('\n🚀 Готово к работе!');
        console.log('   Запустите сервер: npm start\n');

    } catch (error) {
        console.error('❌ Ошибка инициализации:', error);
    } finally {
        await closeDatabase();
    }
}

// Запуск инициализации
initializeDatabaseWithData();
