// Enhanced flower catalog data with types and detailed descriptions
const flowers = [
    {
        id: 1,
        name: 'Букет роз "Романтика"',
        shortDescription: 'Элегантный букет из красных роз',
        fullDescription: 'Классический букет из 25 красных роз премиум класса. Идеально подходит для выражения глубоких чувств и романтических моментов. Цветы выращены в оптимальных условиях и имеют длительный срок свежести.',
        price: 2500,
        emoji: '🌹',
        type: 'roses',
        imageColor: 'linear-gradient(135deg, #e83e8c 0%, #dc143c 100%)',
        composition: '25 красных роз, декоративная зелень, упаковка',
        size: 'Высота: 50 см'
    },
    {
        id: 2,
        name: 'Букет тюльпанов "Весна"',
        shortDescription: 'Яркие весенние тюльпаны',
        fullDescription: 'Нежный букет из 35 разноцветных тюльпанов. Символ весны и обновления. Яркие цвета создают праздничное настроение и радуют глаз.',
        price: 1800,
        emoji: '🌷',
        type: 'tulips',
        imageColor: 'linear-gradient(135deg, #ff6b9d 0%, #ffa07a 100%)',
        composition: '35 тюльпанов микс, лента',
        size: 'Высота: 40 см'
    },
    {
        id: 3,
        name: 'Букет лилий "Нежность"',
        shortDescription: 'Белоснежные лилии с зеленью',
        fullDescription: 'Элегантная композиция из белых лилий. Утонченность и изысканность в каждом цветке. Прекрасный выбор для торжественных событий и выражения глубокого уважения.',
        price: 3200,
        emoji: '🌺',
        type: 'lilies',
        imageColor: 'linear-gradient(135deg, #ffffff 0%, #ffc0cb 100%)',
        composition: '7 веток белых лилий, эвкалипт, гипсофила',
        size: 'Высота: 60 см'
    },
    {
        id: 4,
        name: 'Букет подсолнухов "Солнце"',
        shortDescription: 'Яркие подсолнухи для хорошего настроения',
        fullDescription: 'Солнечный букет из крупных подсолнухов. Эти цветы символизируют радость, энергию и оптимизм. Идеальный подарок для поднятия настроения.',
        price: 1500,
        emoji: '🌻',
        type: 'sunflowers',
        imageColor: 'linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)',
        composition: '9 подсолнухов, декоративная зелень',
        size: 'Высота: 45 см'
    },
    {
        id: 5,
        name: 'Букет гербер "Радость"',
        shortDescription: 'Разноцветные герберы',
        fullDescription: 'Яркий микс из гербер всех цветов радуги. Эти цветы дарят радость и позитивное настроение. Отличный выбор для дня рождения или просто чтобы порадовать близкого человека.',
        price: 2000,
        emoji: '🌼',
        type: 'gerberas',
        imageColor: 'linear-gradient(135deg, #ff69b4 0%, #ffb6c1 100%)',
        composition: '15 гербер микс, зелень',
        size: 'Высота: 35 см'
    },
    {
        id: 6,
        name: 'Букет пионов "Роскошь"',
        shortDescription: 'Пышные розовые пионы',
        fullDescription: 'Роскошный букет из пышных пионов. Эти цветы - символ процветания и счастливой жизни. Их нежный аромат и великолепный вид не оставят никого равнодушным.',
        price: 3500,
        emoji: '🌸',
        type: 'peonies',
        imageColor: 'linear-gradient(135deg, #ffb6d9 0%, #ff69b4 100%)',
        composition: '11 розовых пионов, эвкалипт',
        size: 'Высота: 55 см'
    },
    {
        id: 7,
        name: 'Букет хризантем "Осень"',
        shortDescription: 'Осенние хризантемы',
        fullDescription: 'Букет из осенних хризантем теплых оттенков. Эти цветы символизируют долголетие и радость. Прекрасно подходят для осенних праздников.',
        price: 1700,
        emoji: '💐',
        type: 'chrysanthemums',
        imageColor: 'linear-gradient(135deg, #daa520 0%, #b8860b 100%)',
        composition: '19 хризантем, декоративная зелень',
        size: 'Высота: 40 см'
    },
    {
        id: 8,
        name: 'Букет орхидей "Экзотика"',
        shortDescription: 'Изысканные орхидеи',
        fullDescription: 'Элитная композиция из экзотических орхидей. Символ роскоши и утонченного вкуса. Эти цветы поражают своей красотой и элегантностью.',
        price: 4200,
        emoji: '🌺',
        type: 'orchids',
        imageColor: 'linear-gradient(135deg, #dda0dd 0%, #9370db 100%)',
        composition: '5 веток орхидей фаленопсис, флористическая губка',
        size: 'Высота: 70 см'
    },
    {
        id: 9,
        name: 'Полевые цветы "Луговые"',
        shortDescription: 'Букет полевых цветов',
        fullDescription: 'Очаровательный букет из полевых цветов. Натуральность и простота в лучшем своем проявлении. Создает атмосферу летнего луга и беззаботности.',
        price: 1200,
        emoji: '🌾',
        type: 'wildflowers',
        imageColor: 'linear-gradient(135deg, #90ee90 0%, #98fb98 100%)',
        composition: 'Микс полевых цветов, травы, натуральная упаковка',
        size: 'Высота: 30 см'
    }
];

// Shopping cart
let cart = [];

// Filtered flowers array
let filteredFlowers = [...flowers];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    renderFlowers();
    updateCartCount();
    setMinDate();

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Set minimum date for delivery
function setMinDate() {
    const dateInput = document.getElementById('delivery-date');
    if (dateInput) {
        const today = new Date();
        today.setDate(today.getDate() + 1); // Minimum next day
        const minDate = today.toISOString().split('T')[0];
        dateInput.setAttribute('min', minDate);
        dateInput.value = minDate;
    }
}

// Render flowers in the catalog
function renderFlowers(flowersToRender = filteredFlowers) {
    const flowerGrid = document.getElementById('flower-grid');
    const noResults = document.getElementById('no-results');

    flowerGrid.innerHTML = '';

    if (flowersToRender.length === 0) {
        flowerGrid.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }

    flowerGrid.style.display = 'grid';
    noResults.style.display = 'none';

    flowersToRender.forEach(flower => {
        const flowerCard = document.createElement('div');
        flowerCard.className = 'flower-card';
        flowerCard.innerHTML = `
            <div class="flower-image" style="background: ${flower.imageColor}">
                ${flower.emoji}
            </div>
            <div class="flower-info">
                <h3>${flower.name}</h3>
                <p>${flower.shortDescription}</p>
                <div class="flower-price">${flower.price.toLocaleString('ru-RU')} ₽</div>
                <div class="card-actions">
                    <button class="btn-details" onclick="showProductDetail(${flower.id})">
                        Подробнее
                    </button>
                    <button class="btn-add-cart" onclick="addToCart(${flower.id})">
                        В корзину
                    </button>
                </div>
            </div>
        `;
        flowerGrid.appendChild(flowerCard);
    });
}

// Filter flowers
function filterFlowers() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const priceFilter = document.getElementById('price-filter').value;
    const typeFilter = document.getElementById('type-filter').value;

    filteredFlowers = flowers.filter(flower => {
        // Search filter
        const matchesSearch = flower.name.toLowerCase().includes(searchTerm) ||
                            flower.shortDescription.toLowerCase().includes(searchTerm);

        // Price filter
        let matchesPrice = true;
        if (priceFilter !== 'all') {
            const [min, max] = priceFilter.split('-').map(Number);
            if (max) {
                matchesPrice = flower.price >= min && flower.price <= max;
            } else {
                matchesPrice = flower.price >= min;
            }
        }

        // Type filter
        const matchesType = typeFilter === 'all' || flower.type === typeFilter;

        return matchesSearch && matchesPrice && matchesType;
    });

    renderFlowers(filteredFlowers);
}

// Reset filters
function resetFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('price-filter').value = 'all';
    document.getElementById('type-filter').value = 'all';
    filteredFlowers = [...flowers];
    renderFlowers();
}

// Show product detail modal
function showProductDetail(flowerId) {
    const flower = flowers.find(f => f.id === flowerId);
    if (!flower) return;

    const modal = document.getElementById('product-modal');
    const modalTitle = document.getElementById('product-modal-title');
    const productDetail = document.getElementById('product-detail');

    modalTitle.textContent = flower.name;
    productDetail.innerHTML = `
        <div class="product-detail-content">
            <div class="product-detail-image" style="background: ${flower.imageColor}">
                ${flower.emoji}
            </div>
            <div class="product-detail-info">
                <div class="detail-section">
                    <h3>Описание</h3>
                    <p>${flower.fullDescription}</p>
                </div>
                <div class="detail-section">
                    <h3>Состав</h3>
                    <p>${flower.composition}</p>
                </div>
                <div class="detail-section">
                    <h3>Размер</h3>
                    <p>${flower.size}</p>
                </div>
                <div class="detail-price">
                    <span class="price-label">Цена:</span>
                    <span class="price-value">${flower.price.toLocaleString('ru-RU')} ₽</span>
                </div>
                <button class="btn-primary btn-full" onclick="addToCart(${flower.id}); closeProductModal();">
                    Добавить в корзину
                </button>
            </div>
        </div>
    `;

    modal.classList.add('show');
}

// Close product detail modal
function closeProductModal() {
    const modal = document.getElementById('product-modal');
    modal.classList.remove('show');
}

// Add item to cart
function addToCart(flowerId) {
    const flower = flowers.find(f => f.id === flowerId);

    if (!flower) return;

    const existingItem = cart.find(item => item.id === flowerId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            ...flower,
            quantity: 1
        });
    }

    updateCartCount();
    showNotification(`${flower.name} добавлен в корзину!`);
}

// Remove item from cart
function removeFromCart(flowerId) {
    cart = cart.filter(item => item.id !== flowerId);
    updateCartCount();
    renderCartItems();
}

// Update cart count badge
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = totalItems;
}

// Toggle cart modal
function toggleCart() {
    const modal = document.getElementById('cart-modal');

    if (modal.classList.contains('show')) {
        modal.classList.remove('show');
    } else {
        modal.classList.add('show');
        renderCartItems();
    }
}

// Render cart items
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="cart-empty">Корзина пуста</div>';
        cartTotal.textContent = '0';
        return;
    }

    cartItemsContainer.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.emoji} ${item.name}</h4>
                <p>Количество: ${item.quantity} шт.</p>
                <div class="cart-item-price">${itemTotal.toLocaleString('ru-RU')} ₽</div>
            </div>
            <button class="remove-item" onclick="removeFromCart(${item.id})">
                Удалить
            </button>
        `;
        cartItemsContainer.appendChild(cartItem);
    });

    cartTotal.textContent = total.toLocaleString('ru-RU');
}

// Open checkout form
function openCheckoutForm() {
    if (cart.length === 0) {
        alert('Корзина пуста!');
        return;
    }

    const cartModal = document.getElementById('cart-modal');
    const checkoutModal = document.getElementById('checkout-modal');

    cartModal.classList.remove('show');
    checkoutModal.classList.add('show');

    updateOrderSummary();
}

// Close checkout form
function closeCheckoutForm() {
    const modal = document.getElementById('checkout-modal');
    modal.classList.remove('show');
}

// Toggle address field based on delivery type
function toggleAddressField() {
    const deliveryType = document.getElementById('delivery-type').value;
    const addressField = document.getElementById('address-field');
    const addressInput = document.getElementById('delivery-address');

    if (deliveryType === 'courier' || deliveryType === 'express') {
        addressField.style.display = 'block';
        addressInput.setAttribute('required', 'required');
    } else {
        addressField.style.display = 'none';
        addressInput.removeAttribute('required');
    }

    updateOrderSummary();
}

// Update order summary
function updateOrderSummary() {
    const itemsTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryType = document.getElementById('delivery-type').value;

    let deliveryCost = 0;
    if (deliveryType === 'courier') deliveryCost = 300;
    if (deliveryType === 'express') deliveryCost = 600;

    const total = itemsTotal + deliveryCost;

    document.getElementById('summary-items').textContent = itemsTotal.toLocaleString('ru-RU') + ' ₽';
    document.getElementById('summary-delivery').textContent = deliveryCost.toLocaleString('ru-RU') + ' ₽';
    document.getElementById('summary-total').textContent = total.toLocaleString('ru-RU') + ' ₽';
}

// Submit order
function submitOrder(event) {
    event.preventDefault();

    const orderData = {
        customer: {
            name: document.getElementById('customer-name').value,
            phone: document.getElementById('customer-phone').value,
            email: document.getElementById('customer-email').value
        },
        delivery: {
            type: document.getElementById('delivery-type').value,
            address: document.getElementById('delivery-address').value,
            date: document.getElementById('delivery-date').value,
            time: document.getElementById('delivery-time').value
        },
        additional: {
            giftCard: document.getElementById('gift-card').value,
            comment: document.getElementById('order-comment').value
        },
        items: cart,
        total: calculateTotal()
    };

    console.log('Order submitted:', orderData);

    // Show success message
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    showNotification('Заказ успешно оформлен!');

    setTimeout(() => {
        alert(`Спасибо за заказ, ${orderData.customer.name}!\n\nТоваров: ${itemCount} шт.\nСумма: ${orderData.total.toLocaleString('ru-RU')} ₽\n\nДоставка: ${orderData.delivery.date} в ${orderData.delivery.time}\n\nМы свяжемся с вами по телефону ${orderData.customer.phone} для подтверждения заказа.`);

        // Clear cart and close modal
        cart = [];
        updateCartCount();
        closeCheckoutForm();
        document.getElementById('checkout-form').reset();
    }, 500);
}

// Calculate total with delivery
function calculateTotal() {
    const itemsTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryType = document.getElementById('delivery-type').value;

    let deliveryCost = 0;
    if (deliveryType === 'courier') deliveryCost = 300;
    if (deliveryType === 'express') deliveryCost = 600;

    return itemsTotal + deliveryCost;
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

// Add animations to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Close modal when clicking outside
window.onclick = function(event) {
    const cartModal = document.getElementById('cart-modal');
    const checkoutModal = document.getElementById('checkout-modal');
    const productModal = document.getElementById('product-modal');

    if (event.target === cartModal) {
        toggleCart();
    }
    if (event.target === checkoutModal) {
        closeCheckoutForm();
    }
    if (event.target === productModal) {
        closeProductModal();
    }
}
