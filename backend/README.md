# 🌸 Flower Paradise Backend

Backend сервер для интернет-магазина "Цветочный Рай" на Node.js + Express + SQLite.

---

## 📋 Требования

- **Node.js** 14+ ([скачать](https://nodejs.org/))
- **npm** (устанавливается с Node.js)

---

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
cd backend
npm install
```

### 2. Настройка окружения

Создайте файл `.env` из примера:

```bash
cp .env.example .env
```

Отредактируйте `.env` (ВАЖНО: измените JWT_SECRET!):

```env
PORT=3000
JWT_SECRET=ваш-секретный-ключ-минимум-32-символа
NODE_ENV=development
```

### 3. Инициализация базы данных

```bash
npm run init-db
```

Эта команда:
- Создаст файл `flower_shop.db`
- Создаст все таблицы
- Добавит тестовые данные:
  - 👤 Пользователь: `test@example.com` / `password123`
  - 👑 Админ: `admin@flowerparadise.ru` / `admin123`
  - 🌸 10 товаров
  - 🎟️ 3 промокода

### 4. Запуск сервера

```bash
npm start
```

Сервер запустится на `http://localhost:3000`

**Для разработки** (с авто-перезагрузкой):

```bash
npm run dev
```

---

## 📡 API Endpoints

### 🔐 Авторизация (`/api/auth`)

#### Регистрация
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "Иван Иванов",
  "phone": "+7 999 123-45-67"
}
```

**Ответ:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Иван Иванов"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Вход
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

#### Проверка токена
```http
GET /api/auth/me
Authorization: Bearer YOUR_TOKEN
```

---

### 🌸 Товары (`/api/products`)

#### Получить список товаров
```http
GET /api/products?category=roses&minPrice=1000&maxPrice=2000&sortBy=price&order=ASC&limit=10&offset=0
```

**Параметры:**
- `category` - категория (roses, tulips, orchids, etc.)
- `search` - поиск по названию
- `minPrice` - минимальная цена
- `maxPrice` - максимальная цена
- `sortBy` - сортировка (id, name, price, rating)
- `order` - порядок (ASC, DESC)
- `limit` - количество (по умолчанию 50)
- `offset` - смещение (для пагинации)

**Ответ:**
```json
{
  "success": true,
  "products": [
    {
      "id": 1,
      "name": "🌹 Розы красные",
      "price": 1500,
      "short_description": "Классический букет...",
      "category": "roses",
      "emoji": "🌹",
      "rating": 4.8,
      "review_count": 45
    }
  ],
  "pagination": {
    "total": 10,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

#### Получить детали товара
```http
GET /api/products/1
```

#### Создать товар (только админ)
```http
POST /api/products
Content-Type: application/json
Authorization: Bearer ADMIN_TOKEN

{
  "name": "Новый букет",
  "price": 1500,
  "short_description": "Описание",
  "category": "roses",
  "emoji": "🌹"
}
```

#### Обновить товар
```http
PUT /api/products/1
Content-Type: application/json
Authorization: Bearer ADMIN_TOKEN

{
  "name": "Обновленное название",
  "price": 1800
}
```

#### Удалить товар
```http
DELETE /api/products/1
Authorization: Bearer ADMIN_TOKEN
```

#### Добавить отзыв
```http
POST /api/products/1/reviews
Content-Type: application/json
Authorization: Bearer USER_TOKEN

{
  "userId": 1,
  "rating": 5,
  "comment": "Отличный букет!"
}
```

---

### 📦 Заказы (`/api/orders`)

#### Создать заказ
```http
POST /api/orders
Content-Type: application/json
Authorization: Bearer USER_TOKEN

{
  "userId": 1,
  "customerName": "Иван Иванов",
  "email": "test@example.com",
  "phone": "+7 999 123-45-67",
  "items": [
    {
      "id": 1,
      "name": "Розы красные",
      "price": 1500,
      "quantity": 2
    }
  ],
  "total": 3000,
  "deliveryAddress": {
    "address": "Москва, ул. Пушкина, д. 10",
    "lat": 55.751244,
    "lng": 37.618423
  },
  "paymentMethod": "card"
}
```

**Ответ:**
```json
{
  "success": true,
  "order": {
    "id": 1,
    "orderNumber": "ORD-1737485123456",
    "status": "confirmed",
    "total": 3000
  }
}
```

#### Получить заказы пользователя
```http
GET /api/orders?userId=1&limit=10&offset=0
Authorization: Bearer USER_TOKEN
```

#### Получить детали заказа
```http
GET /api/orders/ORD-1737485123456
Authorization: Bearer USER_TOKEN
```

#### Обновить статус заказа
```http
PATCH /api/orders/ORD-1737485123456/status
Content-Type: application/json
Authorization: Bearer ADMIN_TOKEN

{
  "status": "shipped"
}
```

**Доступные статусы:**
- `pending` - В ожидании
- `confirmed` - Подтвержден
- `processing` - В обработке
- `shipped` - Отправлен
- `delivered` - Доставлен
- `cancelled` - Отменен

#### Все заказы (админ)
```http
GET /api/orders/admin/all?status=confirmed&limit=50&offset=0
Authorization: Bearer ADMIN_TOKEN
```

---

## 🗄️ Структура базы данных

### Таблицы

#### users
```sql
id, email, password, name, phone, avatar, role, created_at, updated_at
```

#### products
```sql
id, name, price, short_description, full_description, category, emoji,
rating, review_count, in_stock, created_at
```

#### orders
```sql
id, order_number, user_id, customer_name, email, phone, items (JSON),
total, delivery_address (JSON), payment_method, status, created_at, updated_at
```

#### carts
```sql
id, user_id, items (JSON), synced_at
```

#### reviews
```sql
id, product_id, user_id, rating, comment, created_at
```

#### promo_codes
```sql
id, code, discount, type, min_order, max_uses, current_uses,
expires_at, active, created_at
```

#### sessions
```sql
id, user_id, token, device_info, expires_at, created_at
```

---

## 📁 Структура проекта

```
backend/
├── server.js              # Главный файл сервера
├── database.js            # Подключение к SQLite
├── init-database.js       # Скрипт инициализации БД
├── routes/
│   ├── auth.js           # Авторизация
│   ├── products.js       # Товары
│   └── orders.js         # Заказы
├── package.json
├── .env                  # Переменные окружения (не в git!)
├── .env.example          # Пример переменных
└── flower_shop.db        # SQLite база данных (создается автоматически)
```

---

## 🔧 Тестирование API

### С помощью curl

```bash
# Регистрация
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"12345678","name":"Test User"}'

# Вход
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Получить товары
curl http://localhost:3000/api/products

# Получить товар
curl http://localhost:3000/api/products/1
```

### С помощью Postman / Thunder Client

1. Импортируйте коллекцию или создайте запросы вручную
2. Установите `Content-Type: application/json`
3. Для защищенных endpoints добавьте `Authorization: Bearer YOUR_TOKEN`

---

## 🔗 Интеграция с Frontend

### Пример использования в JavaScript

```javascript
const API_URL = 'http://localhost:3000/api';

// Регистрация
async function register(email, password, name) {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
    });
    return await response.json();
}

// Вход
async function login(email, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await response.json();

    if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
}

// Получить товары
async function getProducts(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_URL}/products?${params}`);
    return await response.json();
}

// Создать заказ
async function createOrder(orderData) {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
    });

    return await response.json();
}
```

---

## 🚨 Важно для Production

### 1. Безопасность

- ✅ **Измените JWT_SECRET** на длинную случайную строку
- ✅ **Используйте HTTPS** (не HTTP)
- ✅ **Добавьте rate limiting** (npm install express-rate-limit)
- ✅ **Валидация входных данных** (npm install joi или express-validator)
- ✅ **Helmet.js** для безопасности (npm install helmet)

### 2. База данных

- ✅ **Регулярные бэкапы** `flower_shop.db`
- ✅ **При росте** мигрируйте на PostgreSQL/MySQL
- ✅ **Индексы** для частых запросов

### 3. Переменные окружения

```env
# Production .env
NODE_ENV=production
PORT=3000
JWT_SECRET=очень-длинный-случайный-ключ-минимум-64-символа
```

---

## 📊 Мониторинг

### Health Check

```bash
curl http://localhost:3000/health
```

**Ответ:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-21T10:30:00.000Z"
}
```

---

## 🐛 Troubleshooting

### Ошибка: "Cannot find module 'sqlite3'"

```bash
npm install
```

### Ошибка: "SQLITE_CANTOPEN"

Убедитесь, что у вас есть права на запись в папке `backend/`

### Порт уже занят

Измените порт в `.env`:
```env
PORT=3001
```

### Ошибка JWT

Убедитесь, что `JWT_SECRET` установлен в `.env`

---

## 📚 Дополнительная информация

### Полезные команды

```bash
# Установка
npm install

# Запуск (production)
npm start

# Разработка (с auto-reload)
npm run dev

# Инициализация БД
npm run init-db

# Просмотр БД (нужен sqlite3)
sqlite3 flower_shop.db "SELECT * FROM products;"
```

### Логи

Все запросы логируются в консоль:
```
2026-01-21T10:30:00.000Z - GET /api/products
2026-01-21T10:30:05.000Z - POST /api/orders
```

---

## 🔄 Миграция на PostgreSQL

Когда приложение вырастет, код легко мигрировать на PostgreSQL:

1. Установите `pg`: `npm install pg`
2. Замените `database.js` на PostgreSQL client
3. SQL запросы практически не изменятся!

---

## 📞 Поддержка

- 📧 Email: dev@flowerparadise.ru
- 💬 Telegram: @flowerparadise_dev

---

## 📝 Лицензия

MIT License

**Дата создания:** 21.01.2026
**Версия:** 1.0.0
