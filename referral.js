/**
 * Referral Program System
 * Allows users to invite friends and get rewards
 */

// Referral settings
const REFERRAL_SETTINGS = {
    inviterBonus: 500, // Баллы для пригласившего
    inviteeDiscount: 10, // Скидка в % для приглашенного
    minOrderForReward: 1000 // Минимальная сумма заказа для начисления бонуса
};

// Get user's referral data
function getUserReferralData(userId) {
    const referrals = JSON.parse(localStorage.getItem('referrals') || '{}');

    if (!referrals[userId]) {
        referrals[userId] = {
            referralCode: generateReferralCode(userId),
            invitedUsers: [],
            totalEarned: 0,
            pendingRewards: []
        };
        localStorage.setItem('referrals', JSON.stringify(referrals));
    }

    return referrals[userId];
}

// Save referral data
function saveReferralData(userId, data) {
    const referrals = JSON.parse(localStorage.getItem('referrals') || '{}');
    referrals[userId] = data;
    localStorage.setItem('referrals', JSON.stringify(referrals));
}

// Generate unique referral code
function generateReferralCode(userId) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'REF';

    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return code + userId.toString().slice(-2);
}

// Process referral (when new user registers with code)
function processReferral(newUserId, referralCode) {
    const referrals = JSON.parse(localStorage.getItem('referrals') || '{}');

    // Find referrer by code
    const referrerId = Object.keys(referrals).find(
        userId => referrals[userId].referralCode === referralCode
    );

    if (!referrerId) {
        return { success: false, message: 'Неверный реферальный код' };
    }

    // Save referrer for new user
    const newUserReferrals = getUserReferralData(newUserId);
    newUserReferrals.referredBy = referrerId;
    newUserReferrals.hasUsedReferral = false;
    saveReferralData(newUserId, newUserReferrals);

    // Add to referrer's list as pending
    const referrerData = referrals[referrerId];
    referrerData.pendingRewards.push({
        userId: newUserId,
        registeredAt: new Date().toISOString(),
        status: 'pending'
    });
    saveReferralData(referrerId, referrerData);

    return {
        success: true,
        message: `Вы получите скидку ${REFERRAL_SETTINGS.inviteeDiscount}% на первый заказ!`
    };
}

// Award referral bonus (when invited user makes first order)
function awardReferralBonus(userId, orderAmount) {
    if (orderAmount < REFERRAL_SETTINGS.minOrderForReward) {
        return { awarded: false };
    }

    const userReferrals = getUserReferralData(userId);

    // Check if user was referred and hasn't used bonus yet
    if (!userReferrals.referredBy || userReferrals.hasUsedReferral) {
        return { awarded: false };
    }

    // Mark as used
    userReferrals.hasUsedReferral = true;
    saveReferralData(userId, userReferrals);

    // Award bonus to referrer
    const referrerData = getUserReferralData(userReferrals.referredBy);

    // Move from pending to completed
    const pendingIndex = referrerData.pendingRewards.findIndex(
        r => r.userId === userId && r.status === 'pending'
    );

    if (pendingIndex !== -1) {
        referrerData.pendingRewards[pendingIndex].status = 'completed';
        referrerData.pendingRewards[pendingIndex].completedAt = new Date().toISOString();
        referrerData.pendingRewards[pendingIndex].reward = REFERRAL_SETTINGS.inviterBonus;
    }

    referrerData.invitedUsers.push({
        userId: userId,
        completedAt: new Date().toISOString(),
        reward: REFERRAL_SETTINGS.inviterBonus
    });

    referrerData.totalEarned += REFERRAL_SETTINGS.inviterBonus;
    saveReferralData(userReferrals.referredBy, referrerData);

    // Award loyalty points to referrer
    if (typeof LoyaltyAPI !== 'undefined') {
        const referrerLoyalty = LoyaltyAPI.getLoyaltyData(userReferrals.referredBy);
        referrerLoyalty.points += REFERRAL_SETTINGS.inviterBonus;
        referrerLoyalty.history.push({
            date: new Date().toISOString(),
            type: 'earned',
            amount: REFERRAL_SETTINGS.inviterBonus,
            description: 'Бонус за приглашение друга'
        });
        localStorage.setItem('loyalty', JSON.stringify({
            [userReferrals.referredBy]: referrerLoyalty
        }));
    }

    return {
        awarded: true,
        referrerId: userReferrals.referredBy,
        bonus: REFERRAL_SETTINGS.inviterBonus
    };
}

// Render referral widget
function renderReferralWidget(userId) {
    const container = document.getElementById('referral-widget');
    if (!container) return;

    const data = getUserReferralData(userId);
    const referralUrl = `${window.location.origin}/index.html?ref=${data.referralCode}`;

    container.innerHTML = `
        <div class="referral-card">
            <h2>Реферальная программа</h2>
            <p class="referral-subtitle">Приглашайте друзей и получайте бонусы!</p>

            <div class="referral-code-section">
                <div class="code-label">Ваш реферальный код:</div>
                <div class="referral-code">${data.referralCode}</div>
                <button class="btn-secondary btn-copy" onclick="copyReferralCode('${data.referralCode}')">
                    📋 Копировать код
                </button>
            </div>

            <div class="referral-link-section">
                <div class="link-label">Или поделитесь ссылкой:</div>
                <div class="referral-link">${referralUrl}</div>
                <div class="share-buttons">
                    <button class="btn-secondary" onclick="shareReferralLink('${referralUrl}')">
                        🔗 Поделиться
                    </button>
                    <button class="btn-secondary" onclick="copyReferralLink('${referralUrl}')">
                        📋 Копировать ссылку
                    </button>
                </div>
            </div>

            <div class="referral-benefits">
                <h3>Как это работает?</h3>
                <div class="benefits-list">
                    <div class="benefit-item">
                        <div class="benefit-number">1</div>
                        <div class="benefit-text">
                            <strong>Поделитесь кодом</strong>
                            <p>Отправьте реферальный код или ссылку друзьям</p>
                        </div>
                    </div>
                    <div class="benefit-item">
                        <div class="benefit-number">2</div>
                        <div class="benefit-text">
                            <strong>Друг регистрируется</strong>
                            <p>Ваш друг получает ${REFERRAL_SETTINGS.inviteeDiscount}% скидку на первый заказ</p>
                        </div>
                    </div>
                    <div class="benefit-item">
                        <div class="benefit-number">3</div>
                        <div class="benefit-text">
                            <strong>Вы получаете бонусы</strong>
                            <p>После первого заказа друга вы получаете ${REFERRAL_SETTINGS.inviterBonus} баллов</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="referral-stats">
                <div class="stat-box">
                    <div class="stat-value">${data.invitedUsers.length}</div>
                    <div class="stat-label">Приглашенных друзей</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value">${data.totalEarned}</div>
                    <div class="stat-label">Баллов заработано</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value">${data.pendingRewards.filter(r => r.status === 'pending').length}</div>
                    <div class="stat-label">Ожидают заказа</div>
                </div>
            </div>

            ${data.invitedUsers.length > 0 ? `
                <div class="referral-history">
                    <h3>История приглашений</h3>
                    <div class="history-list">
                        ${data.invitedUsers.slice().reverse().map(invite => `
                            <div class="history-item">
                                <div class="history-icon">✅</div>
                                <div class="history-info">
                                    <div class="history-date">
                                        ${new Date(invite.completedAt).toLocaleDateString('ru-RU')}
                                    </div>
                                    <div class="history-reward">
                                        +${invite.reward} баллов
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

// Copy referral code
function copyReferralCode(code) {
    const textarea = document.createElement('textarea');
    textarea.value = code;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showNotification('Реферальный код скопирован!');
}

// Copy referral link
function copyReferralLink(url) {
    const textarea = document.createElement('textarea');
    textarea.value = url;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showNotification('Ссылка скопирована!');
}

// Share referral link
function shareReferralLink(url) {
    if (navigator.share) {
        navigator.share({
            title: 'Приглашение в Цветочный Рай',
            text: `Регистрируйся по моей ссылке и получи ${REFERRAL_SETTINGS.inviteeDiscount}% скидку на первый заказ!`,
            url: url
        }).catch(() => {
            copyReferralLink(url);
        });
    } else {
        copyReferralLink(url);
    }
}

// Check for referral code in URL
function checkReferralCodeInUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');

    if (refCode) {
        // Save to session storage for registration
        sessionStorage.setItem('pendingReferralCode', refCode);

        // Show notification
        showNotification(`Используйте код ${refCode} при регистрации для получения скидки ${REFERRAL_SETTINGS.inviteeDiscount}%!`);
    }
}

// Initialize referral system
document.addEventListener('DOMContentLoaded', () => {
    checkReferralCodeInUrl();
});

// API
window.ReferralAPI = {
    getUserReferralData,
    processReferral,
    awardReferralBonus,
    renderReferralWidget,
    REFERRAL_SETTINGS
};
