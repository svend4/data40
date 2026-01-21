/**
 * Bouquet Constructor
 */

// Available flowers for constructor
const constructorFlowers = [
    { id: 'rose', name: 'Роза', emoji: '🌹', price: 150 },
    { id: 'tulip', name: 'Тюльпан', emoji: '🌷', price: 80 },
    { id: 'lily', name: 'Лилия', emoji: '🌺', price: 200 },
    { id: 'sunflower', name: 'Подсолнух', emoji: '🌻', price: 100 },
    { id: 'orchid', name: 'Орхидея', emoji: '🌸', price: 250 },
    { id: 'daisy', name: 'Ромашка', emoji: '🌼', price: 60 }
];

// Packaging options
const packagingOptions = [
    { id: 'simple', name: 'Простая упаковка', price: 100 },
    { id: 'craft', name: 'Крафт-бумага', price: 150 },
    { id: 'film', name: 'Прозрачная пленка', price: 120 },
    { id: 'box', name: 'Подарочная коробка', price: 300 },
    { id: 'premium', name: 'Премиум упаковка', price: 400 }
];

// Constructor extras
const constructorExtras = [
    { id: 'ribbon', name: 'Атласная лента', price: 50 },
    { id: 'card', name: 'Открытка', price: 100 },
    { id: 'greenery', name: 'Декоративная зелень', price: 150 }
];

// Constructor state
let bouquetComposition = {
    flowers: {},
    packaging: null,
    extras: []
};

// Initialize constructor
document.addEventListener('DOMContentLoaded', () => {
    renderFlowersList();
    renderPackagingOptions();
    renderExtrasOptions();
    updatePreview();
    updateSummary();
});

// Render flowers list
function renderFlowersList() {
    const container = document.getElementById('flowers-list');

    container.innerHTML = constructorFlowers.map(flower => `
        <div class="flower-option">
            <div class="flower-emoji">${flower.emoji}</div>
            <div class="flower-info">
                <div class="flower-name">${flower.name}</div>
                <div class="flower-unit-price">${flower.price} ₽/шт</div>
            </div>
            <div class="flower-controls">
                <button class="qty-btn" onclick="changeFlowerQty('${flower.id}', -1)" id="dec-${flower.id}">−</button>
                <div class="qty-display" id="qty-${flower.id}">0</div>
                <button class="qty-btn" onclick="changeFlowerQty('${flower.id}', 1)">+</button>
            </div>
        </div>
    `).join('');
}

// Render packaging options
function renderPackagingOptions() {
    const container = document.getElementById('packaging-list');

    container.innerHTML = packagingOptions.map(pkg => `
        <div class="packaging-option" onclick="selectPackaging('${pkg.id}')" id="pkg-${pkg.id}">
            <div class="packaging-name">${pkg.name}</div>
            <div class="packaging-price">${pkg.price} ₽</div>
        </div>
    `).join('');
}

// Render extras options
function renderExtrasOptions() {
    const container = document.getElementById('constructor-extras');

    container.innerHTML = constructorExtras.map(extra => `
        <div class="extra-option">
            <input type="checkbox" id="extra-${extra.id}" onchange="toggleExtra('${extra.id}')">
            <label class="extra-label" for="extra-${extra.id}">${extra.name}</label>
            <span class="extra-option-price">${extra.price} ₽</span>
        </div>
    `).join('');
}

// Change flower quantity
function changeFlowerQty(flowerId, delta) {
    const currentQty = bouquetComposition.flowers[flowerId] || 0;
    const newQty = Math.max(0, currentQty + delta);

    if (newQty === 0) {
        delete bouquetComposition.flowers[flowerId];
    } else {
        bouquetComposition.flowers[flowerId] = newQty;
    }

    // Update display
    document.getElementById(`qty-${flowerId}`).textContent = newQty;
    document.getElementById(`dec-${flowerId}`).disabled = newQty === 0;

    updatePreview();
    updateSummary();
}

// Select packaging
function selectPackaging(pkgId) {
    // Remove previous selection
    document.querySelectorAll('.packaging-option').forEach(opt => {
        opt.classList.remove('selected');
    });

    // Add new selection
    document.getElementById(`pkg-${pkgId}`).classList.add('selected');
    bouquetComposition.packaging = pkgId;

    updateSummary();
}

// Toggle extra
function toggleExtra(extraId) {
    const checkbox = document.getElementById(`extra-${extraId}`);

    if (checkbox.checked) {
        if (!bouquetComposition.extras.includes(extraId)) {
            bouquetComposition.extras.push(extraId);
        }
    } else {
        bouquetComposition.extras = bouquetComposition.extras.filter(id => id !== extraId);
    }

    updateSummary();
}

// Update preview
function updatePreview() {
    const container = document.getElementById('preview-container');

    const hasFlowers = Object.keys(bouquetComposition.flowers).length > 0;

    if (!hasFlowers) {
        container.innerHTML = `
            <div class="empty-preview">
                <div class="empty-icon">💐</div>
                <p>Начните создание вашего букета</p>
            </div>
        `;
        return;
    }

    container.innerHTML = Object.entries(bouquetComposition.flowers)
        .map(([flowerId, qty]) => {
            const flower = constructorFlowers.find(f => f.id === flowerId);
            return `
                <div class="preview-flower">
                    ${flower.emoji}
                    <div class="preview-count">${qty}</div>
                </div>
            `;
        }).join('');
}

// Update summary
function updateSummary() {
    const summaryItems = document.getElementById('summary-items');

    // Flowers summary
    const flowerItems = Object.entries(bouquetComposition.flowers).map(([flowerId, qty]) => {
        const flower = constructorFlowers.find(f => f.id === flowerId);
        return {
            name: `${flower.name} × ${qty}`,
            price: flower.price * qty
        };
    });

    // Packaging summary
    let packagingPrice = 0;
    let packagingName = '';
    if (bouquetComposition.packaging) {
        const pkg = packagingOptions.find(p => p.id === bouquetComposition.packaging);
        packagingPrice = pkg.price;
        packagingName = pkg.name;
    }

    // Extras summary
    const extrasItems = bouquetComposition.extras.map(extraId => {
        const extra = constructorExtras.find(e => e.id === extraId);
        return {
            name: extra.name,
            price: extra.price
        };
    });

    // Render summary items
    summaryItems.innerHTML = [
        ...flowerItems.map(item => `
            <div class="summary-item">
                <span>${item.name}</span>
                <span>${item.price} ₽</span>
            </div>
        `),
        packagingName ? `
            <div class="summary-item">
                <span>${packagingName}</span>
                <span>${packagingPrice} ₽</span>
            </div>
        ` : '',
        ...extrasItems.map(item => `
            <div class="summary-item">
                <span>${item.name}</span>
                <span>${item.price} ₽</span>
            </div>
        `)
    ].join('') || '<p style="color: var(--text-secondary); text-align: center;">Состав пуст</p>';

    // Calculate totals
    const flowersTotal = flowerItems.reduce((sum, item) => sum + item.price, 0);
    const extrasTotal = extrasItems.reduce((sum, item) => sum + item.price, 0);
    const total = flowersTotal + packagingPrice + extrasTotal;

    document.getElementById('flowers-price').textContent = flowersTotal.toLocaleString('ru-RU') + ' ₽';
    document.getElementById('packaging-price').textContent = packagingPrice.toLocaleString('ru-RU') + ' ₽';
    document.getElementById('extras-price').textContent = extrasTotal.toLocaleString('ru-RU') + ' ₽';
    document.getElementById('total-price').textContent = total.toLocaleString('ru-RU') + ' ₽';

    // Enable/disable button
    const button = document.querySelector('.btn-add-to-cart');
    button.disabled = total === 0;
}

// Add custom bouquet to cart
function addCustomBouquetToCart() {
    const total = calculateTotal();

    if (total === 0) {
        alert('Добавьте цветы в букет');
        return;
    }

    // Create bouquet description
    const flowersList = Object.entries(bouquetComposition.flowers)
        .map(([flowerId, qty]) => {
            const flower = constructorFlowers.find(f => f.id === flowerId);
            return `${flower.name} × ${qty}`;
        })
        .join(', ');

    const customBouquet = {
        id: 'custom_' + Date.now(),
        name: 'Собственный букет',
        shortDescription: flowersList,
        price: total,
        emoji: '💐',
        type: 'custom',
        composition: bouquetComposition
    };

    // Add to cart
    addToCart(customBouquet);

    alert('Букет добавлен в корзину!');

    // Reset constructor
    resetConstructor();
}

// Calculate total
function calculateTotal() {
    const flowersTotal = Object.entries(bouquetComposition.flowers).reduce((sum, [flowerId, qty]) => {
        const flower = constructorFlowers.find(f => f.id === flowerId);
        return sum + (flower.price * qty);
    }, 0);

    const packagingPrice = bouquetComposition.packaging
        ? packagingOptions.find(p => p.id === bouquetComposition.packaging).price
        : 0;

    const extrasTotal = bouquetComposition.extras.reduce((sum, extraId) => {
        const extra = constructorExtras.find(e => e.id === extraId);
        return sum + extra.price;
    }, 0);

    return flowersTotal + packagingPrice + extrasTotal;
}

// Reset constructor
function resetConstructor() {
    bouquetComposition = {
        flowers: {},
        packaging: null,
        extras: []
    };

    // Reset UI
    constructorFlowers.forEach(flower => {
        document.getElementById(`qty-${flower.id}`).textContent = '0';
        document.getElementById(`dec-${flower.id}`).disabled = true;
    });

    document.querySelectorAll('.packaging-option').forEach(opt => {
        opt.classList.remove('selected');
    });

    document.querySelectorAll('.extra-option input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });

    updatePreview();
    updateSummary();
}
