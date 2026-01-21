/**
 * Bouquet Comparison System
 * Allows users to compare multiple bouquets side by side
 */

// Comparison state
let comparisonList = [];

// Load comparison from localStorage
function loadComparison() {
    const saved = localStorage.getItem('comparison');
    if (saved) {
        comparisonList = JSON.parse(saved);
        updateComparisonBadge();
    }
}

// Save comparison to localStorage
function saveComparison() {
    localStorage.setItem('comparison', JSON.stringify(comparisonList));
    updateComparisonBadge();
}

// Add to comparison
function addToComparison(flowerId) {
    if (comparisonList.includes(flowerId)) {
        showNotification('Этот букет уже в сравнении');
        return;
    }

    if (comparisonList.length >= 4) {
        showNotification('Максимум 4 букета для сравнения');
        return;
    }

    comparisonList.push(flowerId);
    saveComparison();
    showNotification('Добавлено в сравнение');
}

// Remove from comparison
function removeFromComparison(flowerId) {
    comparisonList = comparisonList.filter(id => id !== flowerId);
    saveComparison();

    // If comparison modal is open, re-render
    if (document.getElementById('comparison-modal')) {
        if (comparisonList.length === 0) {
            closeComparisonModal();
        } else {
            showComparisonModal();
        }
    }
}

// Clear comparison
function clearComparison() {
    if (!confirm('Очистить список сравнения?')) return;

    comparisonList = [];
    saveComparison();
    closeComparisonModal();
}

// Update comparison badge
function updateComparisonBadge() {
    const badge = document.getElementById('comparison-badge');
    if (!badge) return;

    if (comparisonList.length > 0) {
        badge.textContent = comparisonList.length;
        badge.style.display = 'block';
    } else {
        badge.style.display = 'none';
    }
}

// Show comparison modal
function showComparisonModal() {
    if (comparisonList.length === 0) {
        alert('Добавьте букеты для сравнения');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'comparison-modal';

    const bouquets = comparisonList.map(id => flowers.find(f => f.id === id)).filter(f => f);

    modal.innerHTML = `
        <div class="modal-content comparison-modal-content">
            <div class="modal-header">
                <h2>Сравнение букетов (${bouquets.length})</h2>
                <div class="comparison-header-actions">
                    <button class="btn-secondary" onclick="clearComparison()">Очистить все</button>
                    <span class="close" onclick="closeComparisonModal()">&times;</span>
                </div>
            </div>
            <div class="comparison-table-container">
                <table class="comparison-table">
                    <thead>
                        <tr>
                            <th class="comparison-label">Характеристика</th>
                            ${bouquets.map(b => `
                                <th class="comparison-item-header">
                                    <div class="comparison-flower-header">
                                        <div class="comparison-emoji">${b.emoji}</div>
                                        <div class="comparison-name">${b.name}</div>
                                        <button class="btn-remove-comparison" onclick="removeFromComparison(${b.id})" title="Удалить">
                                            ✕
                                        </button>
                                    </div>
                                </th>
                            `).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="comparison-label">Цена</td>
                            ${bouquets.map(b => `
                                <td class="comparison-value">
                                    <span class="price-value">${b.price} ₽</span>
                                </td>
                            `).join('')}
                        </tr>
                        <tr>
                            <td class="comparison-label">Рейтинг</td>
                            ${bouquets.map(b => `
                                <td class="comparison-value">
                                    <span class="rating-value">⭐ ${b.rating || 'Нет оценок'}</span>
                                    ${b.reviewCount ? `<span class="review-count">(${b.reviewCount})</span>` : ''}
                                </td>
                            `).join('')}
                        </tr>
                        <tr>
                            <td class="comparison-label">Описание</td>
                            ${bouquets.map(b => `
                                <td class="comparison-value">
                                    <span class="description-text">${b.shortDescription || b.fullDescription || 'Нет описания'}</span>
                                </td>
                            `).join('')}
                        </tr>
                        <tr>
                            <td class="comparison-label">Состав</td>
                            ${bouquets.map(b => `
                                <td class="comparison-value">
                                    <span class="composition-text">${b.composition || 'Не указан'}</span>
                                </td>
                            `).join('')}
                        </tr>
                        <tr>
                            <td class="comparison-label">Размер</td>
                            ${bouquets.map(b => `
                                <td class="comparison-value">
                                    <span class="size-text">${b.size || 'Стандартный'}</span>
                                </td>
                            `).join('')}
                        </tr>
                        <tr>
                            <td class="comparison-label">Тип</td>
                            ${bouquets.map(b => `
                                <td class="comparison-value">
                                    <span class="type-badge">${getFlowerTypeName(b.type)}</span>
                                </td>
                            `).join('')}
                        </tr>
                        <tr>
                            <td class="comparison-label">Действия</td>
                            ${bouquets.map(b => `
                                <td class="comparison-value">
                                    <div class="comparison-actions">
                                        <button class="btn-primary btn-small" onclick="addToCart(flowers.find(f => f.id === ${b.id})); closeComparisonModal();">
                                            В корзину
                                        </button>
                                        <button class="btn-secondary btn-small" onclick="showFlowerDetails(${b.id}); closeComparisonModal();">
                                            Подробнее
                                        </button>
                                    </div>
                                </td>
                            `).join('')}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

// Close comparison modal
function closeComparisonModal() {
    const modal = document.getElementById('comparison-modal');
    if (modal) {
        modal.remove();
    }
}

// Get flower type name
function getFlowerTypeName(type) {
    const typeNames = {
        roses: 'Розы',
        tulips: 'Тюльпаны',
        lilies: 'Лилии',
        orchids: 'Орхидеи',
        mixed: 'Смешанный',
        seasonal: 'Сезонный',
        exotic: 'Экзотический'
    };
    return typeNames[type] || 'Не указан';
}

// Add comparison button to flower cards
function addComparisonButtons() {
    const flowerCards = document.querySelectorAll('.flower-card');

    flowerCards.forEach(card => {
        const flowerId = parseInt(card.dataset.flowerId || card.getAttribute('onclick')?.match(/\d+/)?.[0]);

        if (!flowerId) return;

        // Check if button already exists
        if (card.querySelector('.comparison-btn')) return;

        const button = document.createElement('button');
        button.className = 'comparison-btn';
        button.innerHTML = '⚖️ Сравнить';
        button.onclick = (e) => {
            e.stopPropagation();
            addToComparison(flowerId);
        };

        const actions = card.querySelector('.flower-actions') || card.querySelector('.flower-card-body');
        if (actions) {
            actions.appendChild(button);
        }
    });
}

// Initialize comparison system
document.addEventListener('DOMContentLoaded', () => {
    loadComparison();

    // Add comparison icon to header if not exists
    setTimeout(() => {
        const headerIcons = document.querySelector('.header-icons');
        if (headerIcons && !document.getElementById('comparison-icon')) {
            const comparisonIcon = document.createElement('div');
            comparisonIcon.className = 'icon-btn';
            comparisonIcon.id = 'comparison-icon';
            comparisonIcon.title = 'Сравнение букетов';
            comparisonIcon.onclick = showComparisonModal;
            comparisonIcon.innerHTML = `
                ⚖️ Сравнение
                <span class="badge" id="comparison-badge" style="display: none;">0</span>
            `;
            headerIcons.insertBefore(comparisonIcon, headerIcons.firstChild);
            updateComparisonBadge();
        }

        // Add comparison buttons to flower cards
        addComparisonButtons();
    }, 500);
});

// API
window.ComparisonAPI = {
    addToComparison,
    removeFromComparison,
    showComparisonModal,
    clearComparison,
    comparisonList: () => comparisonList
};
