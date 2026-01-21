// Flower catalog data
const flowers = [
    {
        id: 1,
        name: 'Букет роз "Романтика"',
        description: 'Элегантный букет из красных роз',
        price: 2500,
        emoji: '🌹'
    },
    {
        id: 2,
        name: 'Букет тюльпанов "Весна"',
        description: 'Яркие весенние тюльпаны',
        price: 1800,
        emoji: '🌷'
    },
    {
        id: 3,
        name: 'Букет лилий "Нежность"',
        description: 'Белоснежные лилии с зеленью',
        price: 3200,
        emoji: '🌺'
    },
    {
        id: 4,
        name: 'Букет подсолнухов "Солнце"',
        description: 'Яркие подсолнухи для хорошего настроения',
        price: 1500,
        emoji: '🌻'
    },
    {
        id: 5,
        name: 'Букет гербер "Радость"',
        description: 'Разноцветные герберы',
        price: 2000,
        emoji: '🌼'
    },
    {
        id: 6,
        name: 'Букет пионов "Роскошь"',
        description: 'Пышные розовые пионы',
        price: 3500,
        emoji: '🌸'
    },
    {
        id: 7,
        name: 'Букет хризантем "Осень"',
        description: 'Осенние хризантемы',
        price: 1700,
        emoji: '💐'
    },
    {
        id: 8,
        name: 'Букет орхидей "Экзотика"',
        description: 'Изысканные орхидеи',
        price: 4200,
        emoji: '🌺'
    },
    {
        id: 9,
        name: 'Полевые цветы "Луговые"',
        description: 'Букет полевых цветов',
        price: 1200,
        emoji: '🌾'
    }
];

// Shopping cart
let cart = [];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    renderFlowers();
    updateCartCount();

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

// Render flowers in the catalog
function renderFlowers() {
    const flowerGrid = document.getElementById('flower-grid');

    flowers.forEach(flower => {
        const flowerCard = document.createElement('div');
        flowerCard.className = 'flower-card';
        flowerCard.innerHTML = `
            <div class="flower-image">${flower.emoji}</div>
            <div class="flower-info">
                <h3>${flower.name}</h3>
                <p>${flower.description}</p>
                <div class="flower-price">${flower.price} ₽</div>
                <button class="btn-add-cart" onclick="addToCart(${flower.id})">
                    Добавить в корзину
                </button>
            </div>
        `;
        flowerGrid.appendChild(flowerCard);
    });
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
                <div class="cart-item-price">${itemTotal} ₽</div>
            </div>
            <button class="remove-item" onclick="removeFromCart(${item.id})">
                Удалить
            </button>
        `;
        cartItemsContainer.appendChild(cartItem);
    });

    cartTotal.textContent = total.toLocaleString('ru-RU');
}

// Checkout
function checkout() {
    if (cart.length === 0) {
        alert('Корзина пуста!');
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    alert(`Спасибо за заказ!\n\nТоваров: ${itemCount} шт.\nСумма: ${total.toLocaleString('ru-RU')} ₽\n\nМы свяжемся с вами в ближайшее время для подтверждения заказа.`);

    cart = [];
    updateCartCount();
    toggleCart();
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
    const modal = document.getElementById('cart-modal');
    if (event.target === modal) {
        toggleCart();
    }
}
