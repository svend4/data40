/**
 * Real-time Courier Tracking System
 * Live tracking, notifications, ETA updates
 */

// Tracking state
let activeTracking = null;
let trackingInterval = null;
let notificationPermission = 'default';

// Request notification permission
async function requestNotificationPermission() {
    if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        notificationPermission = permission;
        return permission === 'granted';
    }
    return false;
}

// Send browser notification
function sendNotification(title, body, icon = '🌸') {
    if (notificationPermission === 'granted') {
        new Notification(title, {
            body: body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'delivery-update',
            requireInteraction: false
        });
    }
}

// Start tracking delivery
async function startTracking(orderId) {
    console.log('[Tracking] Starting tracking for order:', orderId);

    // Request notification permission
    await requestNotificationPermission();

    // Get delivery status
    const status = window.DeliveryAPI.getDeliveryStatus(orderId);

    if (!status.found) {
        return {
            success: false,
            error: 'Заказ не найден или доставка еще не назначена'
        };
    }

    activeTracking = {
        orderId,
        status: status.route.status,
        lastUpdate: Date.now(),
        lastNotifiedStatus: status.route.status
    };

    // Start periodic updates
    startTrackingUpdates();

    // Send initial notification
    sendNotification(
        '🚗 Отслеживание доставки активно',
        'Вы будете получать уведомления о статусе доставки'
    );

    return {
        success: true,
        tracking: activeTracking,
        status
    };
}

// Stop tracking
function stopTracking() {
    if (trackingInterval) {
        clearInterval(trackingInterval);
        trackingInterval = null;
    }

    activeTracking = null;
    console.log('[Tracking] Tracking stopped');
}

// Start periodic tracking updates
function startTrackingUpdates() {
    // Stop existing interval
    if (trackingInterval) {
        clearInterval(trackingInterval);
    }

    // Update every 30 seconds
    trackingInterval = setInterval(() => {
        if (!activeTracking) {
            clearInterval(trackingInterval);
            return;
        }

        updateTrackingStatus();
    }, 30000);

    // Initial update
    updateTrackingStatus();
}

// Update tracking status
function updateTrackingStatus() {
    if (!activeTracking) return;

    const status = window.DeliveryAPI.getDeliveryStatus(activeTracking.orderId);

    if (!status.found) {
        stopTracking();
        return;
    }

    // Check for status changes
    if (status.route.status !== activeTracking.lastNotifiedStatus) {
        handleStatusChange(status);
        activeTracking.lastNotifiedStatus = status.route.status;
    }

    // Update ETA if in progress
    if (status.route.status === 'in_progress' && status.eta) {
        handleETAUpdate(status.eta);
    }

    activeTracking.lastUpdate = Date.now();
    activeTracking.status = status.route.status;

    // Emit update event
    document.dispatchEvent(new CustomEvent('trackingUpdated', {
        detail: { orderId: activeTracking.orderId, status }
    }));
}

// Handle status change
function handleStatusChange(status) {
    const statusMessages = {
        'assigned': {
            title: '👤 Курьер назначен',
            body: `Курьер ${status.courier?.name || 'назначен'} заберет ваш заказ`
        },
        'in_progress': {
            title: '🚗 Курьер в пути',
            body: 'Ваш заказ уже в пути к вам!'
        },
        'completed': {
            title: '✅ Заказ доставлен',
            body: 'Спасибо за заказ! Ждем вас снова 🌸'
        },
        'cancelled': {
            title: '❌ Доставка отменена',
            body: 'Доставка была отменена. Свяжитесь с нами для уточнений.'
        }
    };

    const message = statusMessages[status.route.status];
    if (message) {
        sendNotification(message.title, message.body);
    }

    // If completed or cancelled, stop tracking
    if (status.route.status === 'completed' || status.route.status === 'cancelled') {
        setTimeout(() => stopTracking(), 5000);
    }
}

// Handle ETA update
function handleETAUpdate(eta) {
    // Notify if ETA is less than 15 minutes
    if (eta.estimatedMinutes <= 15 && eta.estimatedMinutes > 0) {
        sendNotification(
            '⏰ Курьер приближается',
            `Примерное время прибытия: ${eta.estimatedMinutes} минут`
        );
    }
}

// Get current tracking info
function getCurrentTracking() {
    if (!activeTracking) {
        return null;
    }

    const status = window.DeliveryAPI.getDeliveryStatus(activeTracking.orderId);
    return {
        tracking: activeTracking,
        status
    };
}

// Create tracking widget
function createTrackingWidget(orderId) {
    const widget = document.createElement('div');
    widget.id = 'tracking-widget';
    widget.className = 'tracking-widget';

    widget.innerHTML = `
        <div class="tracking-widget-header">
            <h3>🚗 Отслеживание доставки</h3>
            <button class="tracking-close" onclick="closeTrackingWidget()">✕</button>
        </div>
        <div class="tracking-widget-content" id="tracking-widget-content">
            <div class="tracking-loading">⏳ Загрузка...</div>
        </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .tracking-widget {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 350px;
            max-height: 500px;
            background: var(--card-bg, white);
            border: 2px solid var(--border-color, #e0e0e0);
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            z-index: 9999;
            overflow: hidden;
            animation: slideInUp 0.3s ease;
        }

        @keyframes slideInUp {
            from {
                transform: translateY(100px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        .tracking-widget-header {
            padding: 1.5rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .tracking-widget-header h3 {
            margin: 0;
            font-size: 1.1rem;
        }

        .tracking-close {
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background 0.3s;
        }

        .tracking-close:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        .tracking-widget-content {
            padding: 1.5rem;
            max-height: 400px;
            overflow-y: auto;
        }

        .tracking-loading {
            text-align: center;
            padding: 2rem;
            color: var(--text-secondary, #666);
        }

        .tracking-status {
            margin-bottom: 1.5rem;
        }

        .tracking-status-badge {
            display: inline-block;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
        }

        .status-pending {
            background: #e2e3e5;
            color: #383d41;
        }

        .status-assigned {
            background: #d1ecf1;
            color: #0c5460;
        }

        .status-in_progress {
            background: #fff3cd;
            color: #856404;
        }

        .status-completed {
            background: #d4edda;
            color: #155724;
        }

        .tracking-courier {
            background: var(--bg-alt, #f8f9fa);
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
        }

        .courier-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 0.5rem;
        }

        .courier-avatar {
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            font-weight: 700;
        }

        .courier-info {
            flex: 1;
        }

        .courier-name {
            font-weight: 600;
            color: var(--text-primary, #333);
        }

        .courier-phone {
            font-size: 0.9rem;
            color: var(--text-secondary, #666);
        }

        .courier-rating {
            font-size: 0.9rem;
            color: #ffc107;
        }

        .tracking-eta {
            background: #fff3cd;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
            text-align: center;
        }

        .eta-time {
            font-size: 1.5rem;
            font-weight: 700;
            color: #856404;
            margin-bottom: 0.25rem;
        }

        .eta-label {
            font-size: 0.85rem;
            color: #856404;
        }

        .tracking-timeline {
            position: relative;
            padding-left: 2rem;
        }

        .timeline-item {
            position: relative;
            padding-bottom: 1.5rem;
        }

        .timeline-item::before {
            content: '';
            position: absolute;
            left: -1.5rem;
            top: 0.5rem;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #e0e0e0;
            border: 3px solid var(--card-bg, white);
            z-index: 1;
        }

        .timeline-item.completed::before {
            background: #28a745;
        }

        .timeline-item::after {
            content: '';
            position: absolute;
            left: -1.05rem;
            top: 1.2rem;
            width: 2px;
            height: calc(100% - 0.5rem);
            background: #e0e0e0;
        }

        .timeline-item:last-child::after {
            display: none;
        }

        .timeline-text {
            font-size: 0.9rem;
            color: var(--text-primary, #333);
            font-weight: 500;
        }

        .timeline-time {
            font-size: 0.8rem;
            color: var(--text-secondary, #666);
            margin-top: 0.25rem;
        }

        @media (max-width: 768px) {
            .tracking-widget {
                width: calc(100% - 40px);
                right: 20px;
            }
        }
    `;

    if (!document.getElementById('tracking-widget-styles')) {
        style.id = 'tracking-widget-styles';
        document.head.appendChild(style);
    }

    document.body.appendChild(widget);

    // Load tracking data
    loadTrackingWidgetData(orderId);

    return widget;
}

// Load tracking widget data
async function loadTrackingWidgetData(orderId) {
    const content = document.getElementById('tracking-widget-content');

    // Start tracking
    const result = await startTracking(orderId);

    if (!result.success) {
        content.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">😔</div>
                <div style="color: var(--text-primary); font-weight: 600; margin-bottom: 0.5rem;">
                    ${result.error}
                </div>
            </div>
        `;
        return;
    }

    // Render tracking info
    renderTrackingWidget(result.status);

    // Listen for updates
    document.addEventListener('trackingUpdated', (event) => {
        if (event.detail.orderId === orderId) {
            renderTrackingWidget(event.detail.status);
        }
    });
}

// Render tracking widget
function renderTrackingWidget(status) {
    const content = document.getElementById('tracking-widget-content');

    if (!content) return;

    const { route, courier, eta, statusText, timeline } = status;

    let html = `
        <div class="tracking-status">
            <span class="tracking-status-badge status-${route.status}">
                ${statusText}
            </span>
        </div>
    `;

    // Show courier info if assigned
    if (courier) {
        html += `
            <div class="tracking-courier">
                <div class="courier-header">
                    <div class="courier-avatar">${courier.name.charAt(0)}</div>
                    <div class="courier-info">
                        <div class="courier-name">${courier.name}</div>
                        <div class="courier-phone">${courier.phone}</div>
                        <div class="courier-rating">⭐ ${courier.rating} • ${courier.completedDeliveries} доставок</div>
                    </div>
                </div>
            </div>
        `;
    }

    // Show ETA if in progress
    if (eta && route.status === 'in_progress') {
        html += `
            <div class="tracking-eta">
                <div class="eta-time">${eta.estimatedMinutes} мин</div>
                <div class="eta-label">Примерное время прибытия</div>
                <div class="eta-label" style="margin-top: 0.5rem;">
                    📍 Расстояние: ${eta.remainingDistance} км
                </div>
            </div>
        `;
    }

    // Show timeline
    if (timeline && timeline.length > 0) {
        html += `
            <div class="tracking-timeline">
                ${timeline.map(item => `
                    <div class="timeline-item ${item.completed ? 'completed' : ''}">
                        <div class="timeline-text">${item.text}</div>
                        ${item.timestamp ? `
                            <div class="timeline-time">
                                ${new Date(item.timestamp).toLocaleString('ru-RU', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    content.innerHTML = html;
}

// Close tracking widget
function closeTrackingWidget() {
    const widget = document.getElementById('tracking-widget');
    if (widget) {
        widget.remove();
    }
    stopTracking();
}

// Show tracking widget for order
function showTrackingForOrder(orderId) {
    // Remove existing widget
    closeTrackingWidget();

    // Create new widget
    createTrackingWidget(orderId);
}

// Simulate courier movement (for demo)
function simulateCourierMovement(courierId, destinationLat, destinationLng, steps = 20) {
    const courier = window.DeliveryAPI.getCouriers().find(c => c.id === courierId);

    if (!courier || !courier.location) return;

    const startLat = courier.location.lat;
    const startLng = courier.location.lng;
    const latStep = (destinationLat - startLat) / steps;
    const lngStep = (destinationLng - startLng) / steps;

    let currentStep = 0;

    const interval = setInterval(() => {
        if (currentStep >= steps) {
            clearInterval(interval);
            return;
        }

        const newLat = startLat + (latStep * currentStep);
        const newLng = startLng + (lngStep * currentStep);

        window.DeliveryAPI.updateCourierLocation(courierId, {
            lat: newLat,
            lng: newLng
        });

        currentStep++;
    }, 2000); // Update every 2 seconds

    return interval;
}

// Export API
window.CourierTracking = {
    startTracking,
    stopTracking,
    getCurrentTracking,
    showTrackingForOrder,
    requestNotificationPermission,
    simulateCourierMovement
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    console.log('[CourierTracking] Courier tracking system initialized');

    // Auto-start tracking if order ID in URL
    const urlParams = new URLSearchParams(window.location.search);
    const trackOrderId = urlParams.get('track');

    if (trackOrderId) {
        setTimeout(() => {
            showTrackingForOrder(trackOrderId);
        }, 1000);
    }
});
