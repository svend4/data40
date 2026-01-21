/**
 * Wishlist System - Multiple Named Lists
 * Allows users to create multiple wishlists for different occasions
 */

// Get user's wishlists
function getUserWishlists(userId) {
    const wishlists = JSON.parse(localStorage.getItem('wishlists') || '{}');

    if (!wishlists[userId]) {
        wishlists[userId] = [{
            id: 'default',
            name: 'Мои избранные',
            items: [],
            createdAt: new Date().toISOString(),
            isDefault: true
        }];
        localStorage.setItem('wishlists', JSON.stringify(wishlists));
    }

    return wishlists[userId];
}

// Save wishlists
function saveWishlists(userId, wishlistsData) {
    const wishlists = JSON.parse(localStorage.getItem('wishlists') || '{}');
    wishlists[userId] = wishlistsData;
    localStorage.setItem('wishlists', JSON.stringify(wishlists));
}

// Create new wishlist
function createWishlist(userId, name) {
    const wishlists = getUserWishlists(userId);

    const newWishlist = {
        id: 'wishlist_' + Date.now(),
        name: name,
        items: [],
        createdAt: new Date().toISOString(),
        isDefault: false
    };

    wishlists.push(newWishlist);
    saveWishlists(userId, wishlists);

    return newWishlist;
}

// Add item to wishlist
function addToWishlist(userId, wishlistId, flowerId) {
    const wishlists = getUserWishlists(userId);
    const wishlist = wishlists.find(w => w.id === wishlistId);

    if (!wishlist) return false;

    if (wishlist.items.includes(flowerId)) {
        showNotification('Букет уже в этом списке');
        return false;
    }

    wishlist.items.push(flowerId);
    saveWishlists(userId, wishlists);
    showNotification(`Добавлено в "${wishlist.name}"`);

    return true;
}

// Remove from wishlist
function removeFromWishlist(userId, wishlistId, flowerId) {
    const wishlists = getUserWishlists(userId);
    const wishlist = wishlists.find(w => w.id === wishlistId);

    if (!wishlist) return false;

    wishlist.items = wishlist.items.filter(id => id !== flowerId);
    saveWishlists(userId, wishlists);

    return true;
}

// Delete wishlist
function deleteWishlist(userId, wishlistId) {
    const wishlists = getUserWishlists(userId);
    const wishlist = wishlists.find(w => w.id === wishlistId);

    if (!wishlist) return false;

    if (wishlist.isDefault) {
        alert('Нельзя удалить основной список');
        return false;
    }

    const filtered = wishlists.filter(w => w.id !== wishlistId);
    saveWishlists(userId, filtered);

    return true;
}

// Rename wishlist
function renameWishlist(userId, wishlistId, newName) {
    const wishlists = getUserWishlists(userId);
    const wishlist = wishlists.find(w => w.id === wishlistId);

    if (!wishlist) return false;

    wishlist.name = newName;
    saveWishlists(userId, wishlists);

    return true;
}

// Show add to wishlist modal
function showAddToWishlistModal(flowerId) {
    if (!AuthAPI || !AuthAPI.isLoggedIn()) {
        alert('Войдите в аккаунт для создания списков желаний');
        return;
    }

    const user = AuthAPI.getCurrentUser();
    const wishlists = getUserWishlists(user.id);
    const flower = flowers.find(f => f.id === flowerId);

    if (!flower) return;

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'wishlist-select-modal';

    modal.innerHTML = `
        <div class="modal-content wishlist-select-content">
            <div class="modal-header">
                <h2>Добавить в список желаний</h2>
                <span class="close" onclick="closeWishlistSelectModal()">&times;</span>
            </div>
            <div class="wishlist-flower-preview">
                <span class="preview-emoji">${flower.emoji}</span>
                <span class="preview-name">${flower.name}</span>
            </div>
            <div class="wishlist-select-list">
                ${wishlists.map(wishlist => {
                    const hasItem = wishlist.items.includes(flowerId);
                    return `
                        <div class="wishlist-select-item ${hasItem ? 'has-item' : ''}"
                             onclick="${hasItem ? '' : `addToWishlistAndClose(${user.id}, '${wishlist.id}', ${flowerId})`}">
                            <div class="wishlist-info">
                                <div class="wishlist-select-name">
                                    ${wishlist.isDefault ? '⭐ ' : ''}${wishlist.name}
                                </div>
                                <div class="wishlist-select-count">
                                    ${wishlist.items.length} ${wishlist.items.length === 1 ? 'букет' : 'букетов'}
                                </div>
                            </div>
                            ${hasItem ? '<span class="check-icon">✓</span>' : '<span class="add-icon">+</span>'}
                        </div>
                    `;
                }).join('')}
            </div>
            <button class="btn-secondary" onclick="showCreateWishlistForm(${flowerId})">
                + Создать новый список
            </button>
        </div>
    `;

    document.body.appendChild(modal);
}

// Add to wishlist and close modal
function addToWishlistAndClose(userId, wishlistId, flowerId) {
    addToWishlist(userId, wishlistId, flowerId);
    closeWishlistSelectModal();
}

// Close wishlist select modal
function closeWishlistSelectModal() {
    const modal = document.getElementById('wishlist-select-modal');
    if (modal) modal.remove();
}

// Show create wishlist form
function showCreateWishlistForm(flowerId = null) {
    closeWishlistSelectModal();

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'wishlist-create-modal';

    modal.innerHTML = `
        <div class="modal-content wishlist-create-content">
            <div class="modal-header">
                <h2>Создать список желаний</h2>
                <span class="close" onclick="closeWishlistCreateModal()">&times;</span>
            </div>
            <form onsubmit="submitCreateWishlist(event, ${flowerId})">
                <div class="form-group">
                    <label>Название списка *</label>
                    <input type="text" id="wishlist-name" required
                           placeholder="Например: На свадьбу, Подарки маме, День рождения">
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">Создать</button>
                    <button type="button" class="btn-secondary" onclick="closeWishlistCreateModal()">Отмена</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
}

// Close create wishlist modal
function closeWishlistCreateModal() {
    const modal = document.getElementById('wishlist-create-modal');
    if (modal) modal.remove();
}

// Submit create wishlist
function submitCreateWishlist(event, flowerId = null) {
    event.preventDefault();

    const user = AuthAPI.getCurrentUser();
    const name = document.getElementById('wishlist-name').value;

    const newWishlist = createWishlist(user.id, name);

    if (flowerId) {
        addToWishlist(user.id, newWishlist.id, flowerId);
    }

    closeWishlistCreateModal();

    // If on account page, refresh
    if (window.location.pathname.includes('account.html')) {
        loadWishlistsPage();
    }
}

// Render wishlists page
function renderWishlistsPage(userId) {
    const container = document.getElementById('wishlists-container');
    if (!container) return;

    const wishlists = getUserWishlists(userId);

    container.innerHTML = `
        <div class="wishlists-header">
            <h2>Списки желаний</h2>
            <button class="btn-primary" onclick="showCreateWishlistForm()">
                + Создать список
            </button>
        </div>

        <div class="wishlists-grid">
            ${wishlists.map(wishlist => renderWishlistCard(wishlist, userId)).join('')}
        </div>
    `;
}

// Render wishlist card
function renderWishlistCard(wishlist, userId) {
    const bouquets = wishlist.items.map(id => flowers.find(f => f.id === id)).filter(f => f);
    const totalValue = bouquets.reduce((sum, b) => sum + b.price, 0);

    return `
        <div class="wishlist-card">
            <div class="wishlist-card-header">
                <div class="wishlist-title">
                    ${wishlist.isDefault ? '<span class="default-badge">⭐</span>' : ''}
                    <h3>${wishlist.name}</h3>
                </div>
                ${!wishlist.isDefault ? `
                    <div class="wishlist-actions">
                        <button onclick="showRenameWishlistModal('${userId}', '${wishlist.id}')" title="Переименовать">
                            ✏️
                        </button>
                        <button onclick="confirmDeleteWishlist('${userId}', '${wishlist.id}')" title="Удалить">
                            🗑️
                        </button>
                    </div>
                ` : ''}
            </div>

            <div class="wishlist-stats">
                <div class="stat">
                    <span class="stat-value">${bouquets.length}</span>
                    <span class="stat-label">букетов</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${totalValue.toLocaleString('ru-RU')} ₽</span>
                    <span class="stat-label">общая стоимость</span>
                </div>
            </div>

            ${bouquets.length > 0 ? `
                <div class="wishlist-items">
                    ${bouquets.slice(0, 3).map(b => `
                        <div class="wishlist-item-preview">
                            <span class="item-emoji">${b.emoji}</span>
                            <span class="item-name">${b.name}</span>
                            <span class="item-price">${b.price} ₽</span>
                            <button class="btn-remove-item"
                                    onclick="removeFromWishlist('${userId}', '${wishlist.id}', ${b.id}); renderWishlistsPage('${userId}')">
                                ✕
                            </button>
                        </div>
                    `).join('')}
                    ${bouquets.length > 3 ? `
                        <div class="more-items">
                            + еще ${bouquets.length - 3}
                        </div>
                    ` : ''}
                </div>
                <div class="wishlist-card-actions">
                    <button class="btn-primary" onclick="addAllToCart('${wishlist.id}', '${userId}')">
                        Добавить все в корзину
                    </button>
                    <button class="btn-secondary" onclick="shareWishlist('${wishlist.id}')">
                        Поделиться
                    </button>
                </div>
            ` : `
                <div class="empty-wishlist">
                    <div class="empty-icon">📋</div>
                    <p>Список пуст</p>
                    <button class="btn-secondary" onclick="window.location.href='index.html#catalog'">
                        Добавить букеты
                    </button>
                </div>
            `}
        </div>
    `;
}

// Add all to cart
function addAllToCart(wishlistId, userId) {
    const wishlists = getUserWishlists(userId);
    const wishlist = wishlists.find(w => w.id === wishlistId);

    if (!wishlist) return;

    const bouquets = wishlist.items.map(id => flowers.find(f => f.id === id)).filter(f => f);

    bouquets.forEach(flower => {
        addToCart(flower);
    });

    showNotification(`${bouquets.length} букетов добавлено в корзину`);
}

// Share wishlist
function shareWishlist(wishlistId) {
    const url = `${window.location.origin}/index.html?wishlist=${wishlistId}`;

    if (navigator.share) {
        navigator.share({
            title: 'Мой список желаний',
            text: 'Посмотрите мой список желаний в Цветочном Раю!',
            url: url
        }).catch(() => {
            copyToClipboard(url);
        });
    } else {
        copyToClipboard(url);
    }
}

// Confirm delete wishlist
function confirmDeleteWishlist(userId, wishlistId) {
    if (confirm('Удалить этот список желаний?')) {
        deleteWishlist(userId, wishlistId);
        renderWishlistsPage(userId);
    }
}

// Show rename modal
function showRenameWishlistModal(userId, wishlistId) {
    const wishlists = getUserWishlists(userId);
    const wishlist = wishlists.find(w => w.id === wishlistId);

    if (!wishlist) return;

    const newName = prompt('Новое название списка:', wishlist.name);

    if (newName && newName.trim()) {
        renameWishlist(userId, wishlistId, newName.trim());
        renderWishlistsPage(userId);
    }
}

// Load wishlists page
function loadWishlistsPage() {
    if (!AuthAPI || !AuthAPI.isLoggedIn()) return;

    const user = AuthAPI.getCurrentUser();
    renderWishlistsPage(user.id);
}

// Add wishlist buttons to flower cards
function addWishlistButtons() {
    if (!AuthAPI || !AuthAPI.isLoggedIn()) return;

    const flowerCards = document.querySelectorAll('.flower-card');

    flowerCards.forEach(card => {
        const flowerId = parseInt(card.dataset.flowerId || card.getAttribute('onclick')?.match(/\d+/)?.[0]);

        if (!flowerId) return;

        // Check if button already exists
        if (card.querySelector('.wishlist-btn')) return;

        const button = document.createElement('button');
        button.className = 'wishlist-btn';
        button.innerHTML = '📋 В список';
        button.onclick = (e) => {
            e.stopPropagation();
            showAddToWishlistModal(flowerId);
        };

        const actions = card.querySelector('.flower-actions') || card.querySelector('.flower-card-body');
        if (actions) {
            actions.appendChild(button);
        }
    });
}

// Initialize wishlists
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        addWishlistButtons();
    }, 1000);
});

// API
window.WishlistAPI = {
    createWishlist,
    addToWishlist,
    removeFromWishlist,
    deleteWishlist,
    renameWishlist,
    getUserWishlists,
    renderWishlistsPage,
    showAddToWishlistModal
};
