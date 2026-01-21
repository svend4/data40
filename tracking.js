// Order tracking system

// Timeline statuses
const orderStatuses = [
    {
        id: 'received',
        icon: '📝',
        title: 'Заказ принят',
        description: 'Ваш заказ успешно оформлен и принят в обработку'
    },
    {
        id: 'processing',
        icon: '🌸',
        title: 'Сборка букета',
        description: 'Флорист начал создание вашего букета'
    },
    {
        id: 'ready',
        icon: '✓',
        title: 'Готов к отправке',
        description: 'Букет собран и готов к доставке'
    },
    {
        id: 'shipping',
        icon: '🚚',
        title: 'В пути',
        description: 'Курьер направляется по указанному адресу'
    },
    {
        id: 'delivered',
        icon: '🎉',
        title: 'Доставлен',
        description: 'Заказ успешно доставлен получателю'
    }
];

// Track order function
function trackOrder() {
    const input = document.getElementById('order-number-input');
    const orderNumber = input.value.trim().toUpperCase();
    const errorMessage = document.getElementById('error-message');

    if (!orderNumber) {
        showError('Пожалуйста, введите номер заказа');
        return;
    }

    // Get order from localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '{}');
    const order = orders[orderNumber];

    if (!order) {
        showError('Заказ не найден. Проверьте правильность номера заказа.');
        return;
    }

    // Hide error and search form, show order details
    errorMessage.style.display = 'none';
    document.querySelector('.tracking-search').style.display = 'none';
    displayOrderDetails(orderNumber, order);
}

// Display order details
function displayOrderDetails(orderNumber, order) {
    // Update order header
    document.getElementById('order-number-display').textContent = orderNumber;
    document.getElementById('order-date').textContent = formatDate(order.date);
    document.getElementById('order-recipient').textContent = order.customerName;
    document.getElementById('order-phone').textContent = order.customerPhone;
    document.getElementById('order-address').textContent = order.deliveryAddress || 'Самовывоз';
    document.getElementById('order-delivery-type').textContent = getDeliveryTypeText(order.deliveryType);
    document.getElementById('order-total').textContent = order.total + ' ₽';

    // Display timeline
    displayTimeline(order.status, order.statusHistory);

    // Display order items
    displayOrderItems(order.items);

    // Show order details section
    document.getElementById('order-details').style.display = 'block';

    // Scroll to order details
    document.getElementById('order-details').scrollIntoView({ behavior: 'smooth' });
}

// Display timeline
function displayTimeline(currentStatus, statusHistory) {
    const timeline = document.getElementById('order-timeline');
    timeline.innerHTML = '';

    const currentStatusIndex = orderStatuses.findIndex(s => s.id === currentStatus);

    orderStatuses.forEach((status, index) => {
        const item = document.createElement('div');
        item.className = 'timeline-item';

        // Determine status class
        if (index < currentStatusIndex) {
            item.classList.add('completed');
        } else if (index === currentStatusIndex) {
            item.classList.add('active');
        }

        // Get timestamp for this status
        const statusTime = statusHistory && statusHistory[status.id]
            ? formatDateTime(statusHistory[status.id])
            : '';

        item.innerHTML = `
            <div class="timeline-icon">${status.icon}</div>
            <div class="timeline-content">
                <h3>${status.title}</h3>
                <p>${status.description}</p>
                ${statusTime ? `<p class="time">${statusTime}</p>` : ''}
            </div>
        `;

        timeline.appendChild(item);
    });
}

// Display order items
function displayOrderItems(items) {
    const container = document.getElementById('order-items-list');
    container.innerHTML = '';

    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'order-item';
        itemElement.innerHTML = `
            <div class="order-item-image">
                <img src="${item.image || 'https://via.placeholder.com/80'}" alt="${item.name}">
            </div>
            <div class="order-item-details">
                <h4>${item.name}</h4>
                <p>Количество: ${item.quantity} шт.</p>
                <p>Цена за единицу: ${item.price} ₽</p>
            </div>
            <div class="order-item-price">
                ${item.price * item.quantity} ₽
            </div>
        `;
        container.appendChild(itemElement);
    });
}

// Show error message
function showError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.style.display = 'block';

    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
}

// Reset tracking form
function resetTracking() {
    document.querySelector('.tracking-search').style.display = 'block';
    document.getElementById('order-details').style.display = 'none';
    document.getElementById('order-number-input').value = '';
    document.querySelector('.tracking-search').scrollIntoView({ behavior: 'smooth' });
}

// Get delivery type text
function getDeliveryTypeText(type) {
    const types = {
        'courier': 'Курьерская доставка',
        'pickup': 'Самовывоз',
        'express': 'Экспресс-доставка'
    };
    return types[type] || type;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('ru-RU', options);
}

// Format date and time
function formatDateTime(dateString) {
    const date = new Date(dateString);
    const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('ru-RU', dateOptions) + ' в ' +
           date.toLocaleTimeString('ru-RU', timeOptions);
}

// Generate order number
function generateOrderNumber() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 900000) + 100000;
    return `FP-${year}-${random}`;
}

// Create order (called from checkout)
function createOrder(orderData) {
    const orderNumber = generateOrderNumber();
    const now = new Date().toISOString();

    const order = {
        orderNumber: orderNumber,
        date: now,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        customerEmail: orderData.customerEmail,
        deliveryType: orderData.deliveryType,
        deliveryAddress: orderData.deliveryAddress,
        deliveryDate: orderData.deliveryDate,
        deliveryTime: orderData.deliveryTime,
        items: orderData.items,
        total: orderData.total,
        status: 'received',
        statusHistory: {
            'received': now
        }
    };

    // Save to localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '{}');
    orders[orderNumber] = order;
    localStorage.setItem('orders', JSON.stringify(orders));

    // Simulate order status progression
    simulateOrderProgress(orderNumber);

    return orderNumber;
}

// Simulate order status progression
function simulateOrderProgress(orderNumber) {
    const orders = JSON.parse(localStorage.getItem('orders') || '{}');
    const order = orders[orderNumber];

    if (!order) return;

    // Simulate status changes over time (for demo purposes)
    // In real application, this would be updated by backend

    // After 2 minutes: processing
    setTimeout(() => {
        updateOrderStatus(orderNumber, 'processing');
    }, 2 * 60 * 1000);

    // After 30 minutes: ready
    setTimeout(() => {
        updateOrderStatus(orderNumber, 'ready');
    }, 30 * 60 * 1000);

    // After 1 hour: shipping
    setTimeout(() => {
        updateOrderStatus(orderNumber, 'shipping');
    }, 60 * 60 * 1000);

    // After 2 hours: delivered
    setTimeout(() => {
        updateOrderStatus(orderNumber, 'delivered');
    }, 120 * 60 * 1000);
}

// Update order status
function updateOrderStatus(orderNumber, newStatus) {
    const orders = JSON.parse(localStorage.getItem('orders') || '{}');
    const order = orders[orderNumber];

    if (!order) return;

    order.status = newStatus;
    order.statusHistory = order.statusHistory || {};
    order.statusHistory[newStatus] = new Date().toISOString();

    orders[orderNumber] = order;
    localStorage.setItem('orders', JSON.stringify(orders));
}

// Check for order number in URL
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderNumber = urlParams.get('order');

    if (orderNumber) {
        document.getElementById('order-number-input').value = orderNumber;
        trackOrder();
    }
});

// Allow Enter key to submit
document.getElementById('order-number-input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        trackOrder();
    }
});
