/**
 * Loyalty Program System
 * 3-tier system: Bronze, Silver, Gold
 */

// Loyalty tiers configuration
const LOYALTY_TIERS = {
    bronze: {
        name: 'Бронза',
        icon: '🥉',
        minSpent: 0,
        maxSpent: 10000,
        bonusPercent: 5,
        benefits: ['5% баллов с каждой покупки', 'Персональные предложения']
    },
    silver: {
        name: 'Серебро',
        icon: '🥈',
        minSpent: 10000,
        maxSpent: 30000,
        bonusPercent: 7,
        benefits: ['7% баллов с каждой покупки', 'Приоритетная поддержка', 'Скидка на доставку 10%']
    },
    gold: {
        name: 'Золото',
        icon: '🥇',
        minSpent: 30000,
        maxSpent: Infinity,
        bonusPercent: 10,
        benefits: ['10% баллов с каждой покупки', 'VIP поддержка', 'Бесплатная доставка', 'Эксклюзивные предложения']
    }
};

// Get user's loyalty data
function getLoyaltyData(userId) {
    const loyalty = JSON.parse(localStorage.getItem('loyalty') || '{}');

    if (!loyalty[userId]) {
        loyalty[userId] = {
            points: 0,
            totalSpent: 0,
            tier: 'bronze',
            history: []
        };
        localStorage.setItem('loyalty', JSON.stringify(loyalty));
    }

    return loyalty[userId];
}

// Save loyalty data
function saveLoyaltyData(userId, data) {
    const loyalty = JSON.parse(localStorage.getItem('loyalty') || '{}');
    loyalty[userId] = data;
    localStorage.setItem('loyalty', JSON.stringify(loyalty));
}

// Calculate tier based on total spent
function calculateTier(totalSpent) {
    if (totalSpent >= LOYALTY_TIERS.gold.minSpent) return 'gold';
    if (totalSpent >= LOYALTY_TIERS.silver.minSpent) return 'silver';
    return 'bronze';
}

// Add points for purchase
function addPointsForPurchase(userId, orderAmount) {
    const loyaltyData = getLoyaltyData(userId);

    // Update total spent
    loyaltyData.totalSpent += orderAmount;

    // Calculate new tier
    const newTier = calculateTier(loyaltyData.totalSpent);
    const tierChanged = newTier !== loyaltyData.tier;
    loyaltyData.tier = newTier;

    // Calculate points
    const bonusPercent = LOYALTY_TIERS[newTier].bonusPercent;
    const pointsEarned = Math.floor(orderAmount * bonusPercent / 100);
    loyaltyData.points += pointsEarned;

    // Add to history
    loyaltyData.history.unshift({
        date: new Date().toISOString(),
        type: 'earned',
        amount: pointsEarned,
        description: `Покупка на ${orderAmount} ₽`,
        orderAmount: orderAmount
    });

    saveLoyaltyData(userId, loyaltyData);

    // Show notification
    if (tierChanged) {
        showLoyaltyNotification(`Поздравляем! Вы достигли уровня ${LOYALTY_TIERS[newTier].icon} ${LOYALTY_TIERS[newTier].name}!`);
    } else {
        showLoyaltyNotification(`Начислено ${pointsEarned} баллов!`);
    }

    return { pointsEarned, tierChanged, newTier };
}

// Use points for discount
function usePoints(userId, pointsToUse) {
    const loyaltyData = getLoyaltyData(userId);

    if (pointsToUse > loyaltyData.points) {
        return { success: false, message: 'Недостаточно баллов' };
    }

    loyaltyData.points -= pointsToUse;

    // Add to history
    loyaltyData.history.unshift({
        date: new Date().toISOString(),
        type: 'used',
        amount: pointsToUse,
        description: `Оплата баллами`
    });

    saveLoyaltyData(userId, loyaltyData);

    return { success: true, discount: pointsToUse };
}

// Get progress to next tier
function getTierProgress(totalSpent) {
    const currentTier = calculateTier(totalSpent);

    if (currentTier === 'gold') {
        return { percentage: 100, nextTier: null, remaining: 0 };
    }

    const nextTierKey = currentTier === 'bronze' ? 'silver' : 'gold';
    const nextTier = LOYALTY_TIERS[nextTierKey];

    const progress = totalSpent - LOYALTY_TIERS[currentTier].minSpent;
    const required = nextTier.minSpent - LOYALTY_TIERS[currentTier].minSpent;
    const percentage = Math.min(100, Math.floor((progress / required) * 100));
    const remaining = nextTier.minSpent - totalSpent;

    return { percentage, nextTier: nextTierKey, remaining };
}

// Show loyalty notification
function showLoyaltyNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'loyalty-notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 100);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Render loyalty widget in account page
function renderLoyaltyWidget(userId) {
    const loyaltyData = getLoyaltyData(userId);
    const tierInfo = LOYALTY_TIERS[loyaltyData.tier];
    const progress = getTierProgress(loyaltyData.totalSpent);

    const container = document.getElementById('loyalty-widget');
    if (!container) return;

    container.innerHTML = `
        <div class="loyalty-card">
            <div class="loyalty-header">
                <div class="loyalty-tier-badge">
                    <span class="tier-icon">${tierInfo.icon}</span>
                    <span class="tier-name">${tierInfo.name}</span>
                </div>
                <div class="loyalty-points">
                    <div class="points-amount">${loyaltyData.points}</div>
                    <div class="points-label">баллов</div>
                </div>
            </div>

            ${progress.nextTier ? `
                <div class="tier-progress">
                    <div class="progress-label">
                        До уровня ${LOYALTY_TIERS[progress.nextTier].icon} ${LOYALTY_TIERS[progress.nextTier].name}
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress.percentage}%"></div>
                    </div>
                    <div class="progress-text">
                        Осталось потратить: ${progress.remaining.toLocaleString('ru-RU')} ₽
                    </div>
                </div>
            ` : `
                <div class="tier-max">
                    <p>✨ Вы достигли максимального уровня!</p>
                </div>
            `}

            <div class="loyalty-benefits">
                <h4>Ваши привилегии:</h4>
                <ul>
                    ${tierInfo.benefits.map(b => `<li>✓ ${b}</li>`).join('')}
                </ul>
            </div>

            <div class="loyalty-stats">
                <div class="stat">
                    <div class="stat-value">${loyaltyData.totalSpent.toLocaleString('ru-RU')} ₽</div>
                    <div class="stat-label">Всего потрачено</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${tierInfo.bonusPercent}%</div>
                    <div class="stat-label">Процент баллов</div>
                </div>
            </div>
        </div>

        <div class="loyalty-history">
            <h3>История баллов</h3>
            <div class="history-list">
                ${loyaltyData.history.length > 0 ? loyaltyData.history.slice(0, 10).map(h => `
                    <div class="history-item ${h.type}">
                        <div class="history-info">
                            <div class="history-description">${h.description}</div>
                            <div class="history-date">${new Date(h.date).toLocaleDateString('ru-RU')}</div>
                        </div>
                        <div class="history-amount ${h.type}">
                            ${h.type === 'earned' ? '+' : '-'}${h.amount}
                        </div>
                    </div>
                `).join('') : '<p class="empty-history">История пуста</p>'}
            </div>
        </div>
    `;
}

// Initialize loyalty on order completion
function initializeLoyaltyOnOrder(orderData) {
    if (!AuthAPI || !AuthAPI.isLoggedIn()) return;

    const user = AuthAPI.getCurrentUser();
    addPointsForPurchase(user.id, orderData.total);
}

// API
window.LoyaltyAPI = {
    getLoyaltyData,
    addPointsForPurchase,
    usePoints,
    getTierProgress,
    renderLoyaltyWidget,
    LOYALTY_TIERS
};
