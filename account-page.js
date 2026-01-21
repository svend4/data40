/**
 * Account Page Management
 */

// Check if user is logged in
document.addEventListener('DOMContentLoaded', () => {
    if (!AuthAPI.isLoggedIn()) {
        alert('Пожалуйста, войдите в аккаунт');
        window.location.href = 'index.html';
        return;
    }

    initializeAccountPage();
});

// Initialize account page
function initializeAccountPage() {
    const user = AuthAPI.getCurrentUser();

    // Update user info in sidebar
    document.getElementById('user-name').textContent = user.name;
    document.getElementById('user-email').textContent = user.email;

    // Load profile data
    loadProfile();

    // Load orders
    loadOrders();

    // Load loyalty program
    loadLoyalty();

    // Load referral program
    loadReferral();

    // Load reminders
    loadReminders();

    // Load subscriptions
    loadSubscriptions();

    // Load wishlists
    loadWishlists();

    // Load favorites
    loadFavorites();

    // Load addresses
    loadAddresses();
}

// Show section
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.account-section').forEach(section => {
        section.classList.remove('active');
    });

    // Show selected section
    document.getElementById(`${sectionName}-section`).classList.add('active');

    // Update nav
    document.querySelectorAll('.account-nav a').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
}

// Load profile
function loadProfile() {
    const user = AuthAPI.getCurrentUser();

    document.getElementById('profile-name').value = user.name;
    document.getElementById('profile-email').value = user.email;
    document.getElementById('profile-phone').value = user.phone || '';
}

// Save profile
function saveProfile(event) {
    event.preventDefault();

    const updates = {
        name: document.getElementById('profile-name').value,
        email: document.getElementById('profile-email').value,
        phone: document.getElementById('profile-phone').value
    };

    const result = AuthAPI.updateProfile(updates);

    if (result.success) {
        alert('Профиль успешно обновлен!');
        document.getElementById('user-name').textContent = updates.name;
        document.getElementById('user-email').textContent = updates.email;
    } else {
        alert('Ошибка обновления профиля');
    }
}

// Load orders
function loadOrders() {
    const orders = AuthAPI.getUserOrders();
    const container = document.getElementById('orders-list');

    if (orders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📦</div>
                <p>У вас пока нет заказов</p>
                <a href="index.html#catalog" class="btn-primary" style="display: inline-block; margin-top: 1rem; text-decoration: none;">Перейти к покупкам</a>
            </div>
        `;
        return;
    }

    container.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <div>
                    <div class="order-number">${order.orderNumber}</div>
                    <div class="order-details">
                        ${formatDate(order.date)}<br>
                        ${order.items.length} товар(ов)
                    </div>
                </div>
                <div class="order-status ${order.status}">
                    ${getStatusText(order.status)}
                </div>
            </div>
            <div class="order-details">
                Адрес: ${order.deliveryAddress || 'Самовывоз'}<br>
                Дата доставки: ${order.deliveryDate}
            </div>
            <div class="order-total">
                ${order.total.toLocaleString('ru-RU')} ₽
            </div>
            <a href="tracking.html?order=${order.orderNumber}" style="color: var(--accent-primary); text-decoration: none; font-size: 14px; margin-top: 0.5rem; display: inline-block;">
                → Отследить заказ
            </a>
        </div>
    `).join('');
}

// Load favorites
function loadFavorites() {
    const user = AuthAPI.getCurrentUser();
    const container = document.getElementById('favorites-list');

    if (!user.favorites || user.favorites.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">❤️</div>
                <p>У вас пока нет избранных товаров</p>
                <a href="index.html#catalog" class="btn-primary" style="display: inline-block; margin-top: 1rem; text-decoration: none;">Перейти к каталогу</a>
            </div>
        `;
        return;
    }

    // Get flower details from favorites
    const favoriteFlowers = user.favorites
        .map(id => flowers.find(f => f.id === id))
        .filter(f => f);

    container.innerHTML = favoriteFlowers.map(flower => `
        <div class="favorite-item">
            <button class="remove-favorite" onclick="removeFavorite(${flower.id})">×</button>
            <div class="favorite-emoji">${flower.emoji}</div>
            <div class="favorite-name">${flower.name}</div>
            <div class="favorite-price">${flower.price} ₽</div>
            <button class="btn-secondary" style="margin-top: 1rem; font-size: 14px; padding: 8px 16px;" onclick="addToCartFromFavorites(${flower.id})">
                В корзину
            </button>
        </div>
    `).join('');
}

// Remove from favorites
function removeFavorite(flowerId) {
    if (confirm('Удалить из избранного?')) {
        AuthAPI.removeFromFavorites(flowerId);
        loadFavorites();
    }
}

// Add to cart from favorites
function addToCartFromFavorites(flowerId) {
    const flower = flowers.find(f => f.id === flowerId);
    if (flower) {
        addToCart(flower);
        alert('Товар добавлен в корзину!');
    }
}

// Load addresses
function loadAddresses() {
    const user = AuthAPI.getCurrentUser();
    const container = document.getElementById('addresses-list');

    if (!user.addresses || user.addresses.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📍</div>
                <p>У вас пока нет сохраненных адресов</p>
            </div>
        `;
        return;
    }

    container.innerHTML = user.addresses.map(address => `
        <div class="address-card">
            <div class="address-info">
                <h4>${address.title || 'Адрес'}</h4>
                <p>${address.street}, ${address.city}, ${address.zip || ''}</p>
            </div>
            <div class="address-actions">
                <button onclick="deleteAddress('${address.id}')" title="Удалить">🗑️</button>
            </div>
        </div>
    `).join('');
}

// Show add address form
function showAddAddressForm() {
    const title = prompt('Название адреса (например, Дом, Работа):');
    if (!title) return;

    const street = prompt('Улица и номер дома:');
    if (!street) return;

    const city = prompt('Город:');
    if (!city) return;

    const zip = prompt('Индекс (необязательно):');

    AuthAPI.addAddress({ title, street, city, zip });
    loadAddresses();
}

// Delete address
function deleteAddress(addressId) {
    if (confirm('Удалить адрес?')) {
        AuthAPI.removeAddress(addressId);
        loadAddresses();
    }
}

// Helper: Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// Helper: Get status text
function getStatusText(status) {
    const statusMap = {
        'received': 'Принят',
        'processing': 'В обработке',
        'ready': 'Готов',
        'shipping': 'В пути',
        'delivered': 'Доставлен'
    };
    return statusMap[status] || status;
}

// Load loyalty program
function loadLoyalty() {
    const user = AuthAPI.getCurrentUser();
    if (typeof LoyaltyAPI !== 'undefined') {
        LoyaltyAPI.renderLoyaltyWidget(user.id);
    }
}

// Load referral program
function loadReferral() {
    const user = AuthAPI.getCurrentUser();
    if (typeof ReferralAPI !== 'undefined') {
        ReferralAPI.renderReferralWidget(user.id);
    }
}

// Load reminders calendar
function loadReminders() {
    const user = AuthAPI.getCurrentUser();
    if (typeof RemindersAPI !== 'undefined') {
        RemindersAPI.renderRemindersCalendar(user.id);
    }
}

// Load subscriptions
function loadSubscriptions() {
    const user = AuthAPI.getCurrentUser();
    if (typeof SubscriptionsAPI !== 'undefined') {
        SubscriptionsAPI.renderSubscriptionsPage(user.id);
    }
}

// Load wishlists
function loadWishlists() {
    const user = AuthAPI.getCurrentUser();
    if (typeof WishlistAPI !== 'undefined') {
        WishlistAPI.renderWishlistsPage(user.id);
    }
}
