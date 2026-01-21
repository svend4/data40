/**
 * Subscription Service for Regular Flower Delivery
 */

// Subscription plans
const SUBSCRIPTION_PLANS = {
    weekly: {
        name: 'Еженедельная',
        description: 'Свежие цветы каждую неделю',
        icon: '🌸',
        frequency: 'weekly',
        discount: 10,
        minPrice: 1500
    },
    biweekly: {
        name: 'Раз в две недели',
        description: 'Цветы каждые 2 недели',
        icon: '🌺',
        frequency: 'biweekly',
        discount: 7,
        minPrice: 1800
    },
    monthly: {
        name: 'Ежемесячная',
        description: 'Букет раз в месяц',
        icon: '🌹',
        frequency: 'monthly',
        discount: 5,
        minPrice: 2000
    }
};

// Bouquet types for subscription
const SUBSCRIPTION_BOUQUETS = {
    seasonal: {
        name: 'Сезонный микс',
        description: 'Лучшие сезонные цветы',
        basePrice: 2000,
        emoji: '🌷'
    },
    roses: {
        name: 'Классические розы',
        description: 'Букет из роз разных оттенков',
        basePrice: 2500,
        emoji: '🌹'
    },
    mixed: {
        name: 'Смешанный букет',
        description: 'Разнообразие цветов',
        basePrice: 2200,
        emoji: '💐'
    },
    exotic: {
        name: 'Экзотические цветы',
        description: 'Необычные и редкие цветы',
        basePrice: 3000,
        emoji: '🌺'
    }
};

// Delivery days
const DELIVERY_DAYS = {
    monday: 'Понедельник',
    tuesday: 'Вторник',
    wednesday: 'Среда',
    thursday: 'Четверг',
    friday: 'Пятница',
    saturday: 'Суббота',
    sunday: 'Воскресенье'
};

// Get user subscriptions
function getUserSubscriptions(userId) {
    const subscriptions = JSON.parse(localStorage.getItem('subscriptions') || '{}');

    if (!subscriptions[userId]) {
        subscriptions[userId] = [];
        localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
    }

    return subscriptions[userId];
}

// Save subscriptions
function saveSubscriptions(userId, subscriptionsData) {
    const subscriptions = JSON.parse(localStorage.getItem('subscriptions') || '{}');
    subscriptions[userId] = subscriptionsData;
    localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
}

// Create new subscription
function createSubscription(userId, subscriptionData) {
    const subscriptions = getUserSubscriptions(userId);

    const plan = SUBSCRIPTION_PLANS[subscriptionData.plan];
    const bouquet = SUBSCRIPTION_BOUQUETS[subscriptionData.bouquetType];

    // Calculate price with discount
    const basePrice = bouquet.basePrice;
    const discount = (basePrice * plan.discount) / 100;
    const finalPrice = basePrice - discount;

    const subscription = {
        id: 'sub_' + Date.now(),
        plan: subscriptionData.plan,
        bouquetType: subscriptionData.bouquetType,
        deliveryDay: subscriptionData.deliveryDay,
        deliveryAddress: subscriptionData.deliveryAddress,
        deliveryTime: subscriptionData.deliveryTime || 'morning',
        specialInstructions: subscriptionData.specialInstructions || '',
        basePrice: basePrice,
        discount: discount,
        finalPrice: finalPrice,
        startDate: subscriptionData.startDate || new Date().toISOString(),
        status: 'active',
        nextDelivery: calculateNextDelivery(subscriptionData.plan, subscriptionData.deliveryDay),
        deliveries: [],
        createdAt: new Date().toISOString()
    };

    subscriptions.push(subscription);
    saveSubscriptions(userId, subscriptions);

    return subscription;
}

// Calculate next delivery date
function calculateNextDelivery(plan, deliveryDay) {
    const today = new Date();
    const dayMapping = {
        monday: 1, tuesday: 2, wednesday: 3, thursday: 4,
        friday: 5, saturday: 6, sunday: 0
    };

    const targetDay = dayMapping[deliveryDay];
    const currentDay = today.getDay();

    let daysUntil = targetDay - currentDay;
    if (daysUntil <= 0) daysUntil += 7;

    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntil);

    return nextDate.toISOString();
}

// Update subscription
function updateSubscription(userId, subscriptionId, updates) {
    const subscriptions = getUserSubscriptions(userId);
    const index = subscriptions.findIndex(s => s.id === subscriptionId);

    if (index !== -1) {
        subscriptions[index] = { ...subscriptions[index], ...updates };

        // Recalculate next delivery if plan or day changed
        if (updates.plan || updates.deliveryDay) {
            const plan = updates.plan || subscriptions[index].plan;
            const day = updates.deliveryDay || subscriptions[index].deliveryDay;
            subscriptions[index].nextDelivery = calculateNextDelivery(plan, day);
        }

        saveSubscriptions(userId, subscriptions);
        return subscriptions[index];
    }

    return null;
}

// Cancel subscription
function cancelSubscription(userId, subscriptionId) {
    return updateSubscription(userId, subscriptionId, { status: 'cancelled' });
}

// Pause subscription
function pauseSubscription(userId, subscriptionId) {
    return updateSubscription(userId, subscriptionId, { status: 'paused' });
}

// Resume subscription
function resumeSubscription(userId, subscriptionId) {
    const subscription = updateSubscription(userId, subscriptionId, { status: 'active' });

    if (subscription) {
        // Recalculate next delivery
        subscription.nextDelivery = calculateNextDelivery(subscription.plan, subscription.deliveryDay);
        updateSubscription(userId, subscriptionId, { nextDelivery: subscription.nextDelivery });
    }

    return subscription;
}

// Render subscriptions page
function renderSubscriptionsPage(userId) {
    const container = document.getElementById('subscriptions-container');
    if (!container) return;

    const subscriptions = getUserSubscriptions(userId);
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active');

    container.innerHTML = `
        <div class="subscriptions-header">
            <h2>Подписка на цветы</h2>
            <button class="btn-primary" onclick="showCreateSubscriptionForm()">+ Новая подписка</button>
        </div>

        <div class="subscriptions-content">
            <!-- Benefits Section -->
            <div class="subscription-benefits">
                <h3>Преимущества подписки</h3>
                <div class="benefits-grid">
                    <div class="benefit-card">
                        <div class="benefit-icon">💰</div>
                        <h4>Скидка до 10%</h4>
                        <p>На регулярные доставки</p>
                    </div>
                    <div class="benefit-card">
                        <div class="benefit-icon">🚚</div>
                        <h4>Всегда вовремя</h4>
                        <p>Доставка в выбранный день</p>
                    </div>
                    <div class="benefit-card">
                        <div class="benefit-icon">🌸</div>
                        <h4>Свежие цветы</h4>
                        <p>Только лучшие букеты</p>
                    </div>
                    <div class="benefit-card">
                        <div class="benefit-icon">⚙️</div>
                        <h4>Гибкость</h4>
                        <p>Приостановка в любой момент</p>
                    </div>
                </div>
            </div>

            <!-- Active Subscriptions -->
            ${activeSubscriptions.length > 0 ? `
                <div class="active-subscriptions">
                    <h3>Активные подписки</h3>
                    <div class="subscriptions-list">
                        ${activeSubscriptions.map(sub => renderSubscriptionCard(sub)).join('')}
                    </div>
                </div>
            ` : ''}

            <!-- All Subscriptions -->
            ${subscriptions.length > 0 ? `
                <div class="all-subscriptions">
                    <h3>История подписок</h3>
                    <div class="history-list">
                        ${subscriptions.map(sub => renderSubscriptionHistoryItem(sub)).join('')}
                    </div>
                </div>
            ` : `
                <div class="empty-state">
                    <div class="empty-state-icon">📦</div>
                    <p>У вас еще нет активных подписок</p>
                    <p style="font-size: 14px; color: var(--text-secondary);">
                        Создайте подписку и получайте свежие цветы регулярно!
                    </p>
                </div>
            `}
        </div>
    `;
}

// Render subscription card
function renderSubscriptionCard(subscription) {
    const plan = SUBSCRIPTION_PLANS[subscription.plan];
    const bouquet = SUBSCRIPTION_BOUQUETS[subscription.bouquetType];
    const nextDate = new Date(subscription.nextDelivery);
    const daysUntil = Math.ceil((nextDate - new Date()) / (1000 * 60 * 60 * 24));

    return `
        <div class="subscription-card active">
            <div class="subscription-card-header">
                <div class="subscription-type">
                    <span class="type-icon">${bouquet.emoji}</span>
                    <div>
                        <h4>${bouquet.name}</h4>
                        <p>${plan.name}</p>
                    </div>
                </div>
                <div class="subscription-price">
                    <div class="price-with-discount">
                        <span class="original-price">${subscription.basePrice} ₽</span>
                        <span class="final-price">${subscription.finalPrice} ₽</span>
                    </div>
                    <span class="discount-badge">-${plan.discount}%</span>
                </div>
            </div>
            <div class="subscription-card-body">
                <div class="subscription-info">
                    <div class="info-item">
                        <span class="info-icon">📅</span>
                        <span>Каждый ${DELIVERY_DAYS[subscription.deliveryDay]}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-icon">📍</span>
                        <span>${subscription.deliveryAddress}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-icon">🚚</span>
                        <span>Следующая доставка: ${nextDate.toLocaleDateString('ru-RU')} (через ${daysUntil} дн.)</span>
                    </div>
                </div>
                <div class="subscription-actions">
                    <button class="btn-secondary" onclick="editSubscription('${subscription.id}')">
                        Изменить
                    </button>
                    <button class="btn-secondary" onclick="pauseSubscriptionById('${subscription.id}')">
                        Приостановить
                    </button>
                    <button class="btn-danger" onclick="cancelSubscriptionById('${subscription.id}')">
                        Отменить
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Render subscription history item
function renderSubscriptionHistoryItem(subscription) {
    const plan = SUBSCRIPTION_PLANS[subscription.plan];
    const bouquet = SUBSCRIPTION_BOUQUETS[subscription.bouquetType];
    const statusText = {
        active: 'Активна',
        paused: 'Приостановлена',
        cancelled: 'Отменена'
    };
    const statusClass = subscription.status;

    return `
        <div class="history-item subscription-${statusClass}">
            <div class="history-info">
                <div class="subscription-title">
                    ${bouquet.emoji} ${bouquet.name} - ${plan.name}
                </div>
                <div class="subscription-details">
                    Создана: ${new Date(subscription.createdAt).toLocaleDateString('ru-RU')} |
                    Доставок: ${subscription.deliveries.length}
                </div>
            </div>
            <div class="subscription-status ${statusClass}">
                ${statusText[subscription.status]}
            </div>
        </div>
    `;
}

// Show create subscription form
function showCreateSubscriptionForm() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'subscription-modal';

    modal.innerHTML = `
        <div class="modal-content subscription-modal-content">
            <div class="modal-header">
                <h2>Оформить подписку</h2>
                <span class="close" onclick="closeSubscriptionModal()">&times;</span>
            </div>
            <form class="subscription-form" onsubmit="submitSubscription(event)">
                <div class="form-group">
                    <label>Тип букета *</label>
                    <select id="sub-bouquet-type" required onchange="updateSubscriptionPreview()">
                        ${Object.entries(SUBSCRIPTION_BOUQUETS).map(([key, bouquet]) => `
                            <option value="${key}">${bouquet.emoji} ${bouquet.name} - ${bouquet.basePrice} ₽</option>
                        `).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label>План подписки *</label>
                    <select id="sub-plan" required onchange="updateSubscriptionPreview()">
                        ${Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => `
                            <option value="${key}">${plan.icon} ${plan.name} (скидка ${plan.discount}%)</option>
                        `).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label>День доставки *</label>
                    <select id="sub-delivery-day" required>
                        ${Object.entries(DELIVERY_DAYS).map(([key, day]) => `
                            <option value="${key}">${day}</option>
                        `).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label>Адрес доставки *</label>
                    <input type="text" id="sub-delivery-address" required placeholder="Улица, дом, квартира">
                </div>

                <div class="form-group">
                    <label>Время доставки</label>
                    <select id="sub-delivery-time">
                        <option value="morning">Утро (9:00 - 12:00)</option>
                        <option value="afternoon">День (12:00 - 16:00)</option>
                        <option value="evening">Вечер (16:00 - 20:00)</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Особые пожелания</label>
                    <textarea id="sub-instructions" rows="3" placeholder="Например: оставить у двери, позвонить в домофон..."></textarea>
                </div>

                <div class="subscription-preview" id="subscription-preview">
                    <h4>Итого:</h4>
                    <div class="preview-price">
                        <span class="preview-original"></span>
                        <span class="preview-final"></span>
                    </div>
                    <p class="preview-savings"></p>
                </div>

                <button type="submit" class="btn-primary">Оформить подписку</button>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
    updateSubscriptionPreview();
}

// Update subscription preview
function updateSubscriptionPreview() {
    const bouquetType = document.getElementById('sub-bouquet-type')?.value;
    const planType = document.getElementById('sub-plan')?.value;

    if (!bouquetType || !planType) return;

    const bouquet = SUBSCRIPTION_BOUQUETS[bouquetType];
    const plan = SUBSCRIPTION_PLANS[planType];

    const basePrice = bouquet.basePrice;
    const discount = (basePrice * plan.discount) / 100;
    const finalPrice = basePrice - discount;

    const preview = document.getElementById('subscription-preview');
    if (preview) {
        preview.querySelector('.preview-original').textContent = `${basePrice} ₽`;
        preview.querySelector('.preview-final').textContent = `${finalPrice} ₽ за доставку`;
        preview.querySelector('.preview-savings').textContent =
            `Вы экономите ${discount} ₽ на каждой доставке!`;
    }
}

// Submit subscription
function submitSubscription(event) {
    event.preventDefault();

    if (!AuthAPI || !AuthAPI.isLoggedIn()) {
        alert('Необходимо войти в аккаунт');
        return;
    }

    const user = AuthAPI.getCurrentUser();

    const subscriptionData = {
        bouquetType: document.getElementById('sub-bouquet-type').value,
        plan: document.getElementById('sub-plan').value,
        deliveryDay: document.getElementById('sub-delivery-day').value,
        deliveryAddress: document.getElementById('sub-delivery-address').value,
        deliveryTime: document.getElementById('sub-delivery-time').value,
        specialInstructions: document.getElementById('sub-instructions').value
    };

    createSubscription(user.id, subscriptionData);
    renderSubscriptionsPage(user.id);
    closeSubscriptionModal();

    alert('Подписка успешно оформлена! Первая доставка будет в ближайший выбранный день недели.');
}

// Pause subscription by ID
function pauseSubscriptionById(subscriptionId) {
    if (!confirm('Приостановить подписку?')) return;

    const user = AuthAPI.getCurrentUser();
    pauseSubscription(user.id, subscriptionId);
    renderSubscriptionsPage(user.id);
}

// Cancel subscription by ID
function cancelSubscriptionById(subscriptionId) {
    if (!confirm('Вы уверены, что хотите отменить подписку? Это действие нельзя отменить.')) return;

    const user = AuthAPI.getCurrentUser();
    cancelSubscription(user.id, subscriptionId);
    renderSubscriptionsPage(user.id);

    alert('Подписка отменена.');
}

// Close subscription modal
function closeSubscriptionModal() {
    const modal = document.getElementById('subscription-modal');
    if (modal) {
        modal.remove();
    }
}

// API
window.SubscriptionsAPI = {
    createSubscription,
    updateSubscription,
    cancelSubscription,
    pauseSubscription,
    resumeSubscription,
    getUserSubscriptions,
    renderSubscriptionsPage,
    SUBSCRIPTION_PLANS,
    SUBSCRIPTION_BOUQUETS
};
