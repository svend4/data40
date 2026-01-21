# 🔄 Миграция на Backend с SQLite

Руководство по переходу от localStorage к серверной базе данных.

---

## 📋 Что изменится

### Было (localStorage):
```javascript
// Данные хранятся в браузере
const users = JSON.parse(localStorage.getItem('users') || '[]');
localStorage.setItem('users', JSON.stringify(users));
```

### Стало (Backend API):
```javascript
// Данные на сервере, запросы через API
const response = await fetch('http://localhost:3000/api/users');
const data = await response.json();
```

---

## 🚀 Шаги миграции

### 1. Установка Backend

```bash
cd backend
npm install
```

### 2. Настройка

Создайте `.env`:
```bash
cp .env.example .env
```

Отредактируйте `.env`:
```env
PORT=3000
JWT_SECRET=минимум-32-символа-случайный-ключ
NODE_ENV=development
```

### 3. Инициализация БД

```bash
npm run init-db
```

Будут созданы:
- ✅ Пользователи (test@example.com / password123)
- ✅ Админ (admin@flowerparadise.ru / admin123)
- ✅ 10 товаров
- ✅ 3 промокода

### 4. Запуск сервера

```bash
npm start
```

Сервер запустится на `http://localhost:3000`

### 5. Подключение frontend

Добавьте в `index.html` **перед закрывающим `</body>`**:

```html
<script src="api-client.js"></script>
```

### 6. Изменения в коде

#### Было (localStorage):
```javascript
function login(email, password) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    return user;
}
```

#### Стало (API):
```javascript
async function login(email, password) {
    const data = await window.API.login(email, password);
    return data;
}
```

---

## 🔌 Использование API Client

### Авторизация

```javascript
// Регистрация
const result = await window.API.register(
    'user@example.com',
    'password123',
    'Иван Иванов',
    '+7 999 123-45-67'
);

// Вход
const result = await window.API.login('user@example.com', 'password123');

// Проверка авторизации
const user = await window.API.checkAuth();

// Выход
window.API.logout();
```

### Товары

```javascript
// Получить все товары
const products = await window.API.getProducts();

// С фильтрами
const roses = await window.API.getProducts({
    category: 'roses',
    minPrice: 1000,
    maxPrice: 2000,
    sortBy: 'price',
    order: 'ASC'
});

// Детали товара
const product = await window.API.getProduct(1);

// Добавить отзыв
await window.API.addReview(1, 5, 'Отличный букет!');
```

### Заказы

```javascript
// Создать заказ
const order = await window.API.createOrder({
    customerName: 'Иван Иванов',
    email: 'user@example.com',
    phone: '+7 999 123-45-67',
    items: [
        { id: 1, name: 'Розы', price: 1500, quantity: 2 }
    ],
    total: 3000,
    deliveryAddress: {
        address: 'Москва, ул. Пушкина, 10',
        lat: 55.751244,
        lng: 37.618423
    },
    paymentMethod: 'card'
});

// Получить заказы
const orders = await window.API.getOrders();

// Детали заказа
const order = await window.API.getOrder('ORD-1737485123456');
```

### Корзина (пока localStorage)

```javascript
// Добавить в корзину
window.API.addToCart(product, 2);

// Получить корзину
const cart = window.API.getCart();

// Удалить из корзины
window.API.removeFromCart(productId);

// Очистить корзину
window.API.clearCart();
```

---

## 📝 Изменения в существующих файлах

### auth.js

```javascript
// Было
function loginUser(email, password) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        window.currentUser = user;
        return true;
    }
    return false;
}

// Стало
async function loginUser(email, password) {
    try {
        const result = await window.API.login(email, password);

        if (result.success) {
            // window.currentUser уже установлен в API.login
            return true;
        }
        return false;
    } catch (error) {
        console.error('Login error:', error);
        return false;
    }
}
```

### script.js

```javascript
// Было
function loadProducts() {
    const flowers = JSON.parse(localStorage.getItem('flowers') || '[]');
    displayProducts(flowers);
}

// Стало
async function loadProducts() {
    try {
        const products = await window.API.getProducts();
        displayProducts(products);
    } catch (error) {
        console.error('Load products error:', error);
    }
}
```

---

## ⚙️ CORS настройки

Backend уже настроен для работы с frontend:

```javascript
// server.js
app.use(cors()); // Разрешает запросы с любых доменов
```

Для production укажите конкретный домен:

```javascript
app.use(cors({
    origin: 'https://flowerparadise.ru'
}));
```

---

## 🔒 Безопасность

### Токены

API использует JWT токены:
- **Срок действия:** 30 дней
- **Хранение:** localStorage (`authToken`)
- **Передача:** Header `Authorization: Bearer TOKEN`

### Пароли

- Хешируются с помощью bcrypt (10 раундов)
- Никогда не передаются в открытом виде (кроме регистрации/входа)

---

## 🔄 Постепенная миграция

Можно мигрировать постепенно:

### Этап 1: Только товары
```javascript
// Товары с API
const products = await window.API.getProducts();

// Остальное пока с localStorage
const orders = JSON.parse(localStorage.getItem('orders') || '[]');
```

### Этап 2: + Заказы
```javascript
const products = await window.API.getProducts();
const orders = await window.API.getOrders();
```

### Этап 3: Полная миграция
Все данные через API.

---

## 🐛 Отладка

### Проверка подключения

```javascript
// В консоли браузера
fetch('http://localhost:3000/health')
    .then(r => r.json())
    .then(console.log);

// Должен вернуть: { status: 'ok', timestamp: '...' }
```

### Проверка товаров

```javascript
fetch('http://localhost:3000/api/products')
    .then(r => r.json())
    .then(data => console.log('Products:', data));
```

### Проверка авторизации

```javascript
fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
    })
})
    .then(r => r.json())
    .then(data => console.log('Login:', data));
```

---

## 📊 Преимущества миграции

### ✅ Было (localStorage)
- ✅ Просто
- ❌ Данные только в одном браузере
- ❌ Теряются при очистке кэша
- ❌ Ограничение 5-10 МБ
- ❌ Нет синхронизации

### ✅ Стало (Backend)
- ✅ Данные на сервере
- ✅ Доступны с любого устройства
- ✅ Не теряются
- ✅ Неограниченный объем
- ✅ Синхронизация между устройствами
- ✅ Реальная база данных
- ✅ Безопасное хранение паролей

---

## 🎯 Следующие шаги

После миграции можно:

1. **Добавить функции:**
   - Восстановление пароля
   - Email подтверждение
   - OAuth (Google, Facebook)
   - Webhook для оплаты

2. **Оптимизация:**
   - Кэширование запросов
   - Lazy loading
   - Image optimization

3. **Масштабирование:**
   - Миграция на PostgreSQL
   - Redis для кэша
   - Load balancer
   - CDN для статики

---

## 📞 Помощь

Если что-то не работает:

1. Проверьте, запущен ли backend (`npm start`)
2. Проверьте консоль браузера на ошибки
3. Проверьте консоль backend сервера
4. Убедитесь в правильности `API_CONFIG.baseUrl` в `api-client.js`

**Email:** dev@flowerparadise.ru

---

**Дата:** 21.01.2026
**Версия:** 1.0
