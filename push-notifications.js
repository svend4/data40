/**
 * Push Notifications System
 * FCM integration and notification management for mobile app
 */

// Push notification configuration
const PUSH_CONFIG = {
    fcmServerKey: 'YOUR_FCM_SERVER_KEY', // Replace with actual FCM key
    vapidPublicKey: 'YOUR_VAPID_PUBLIC_KEY',
    notificationTypes: {
        ORDER_CONFIRMED: 'order_confirmed',
        ORDER_SHIPPED: 'order_shipped',
        ORDER_DELIVERED: 'order_delivered',
        PROMOTION: 'promotion',
        CART_REMINDER: 'cart_reminder',
        NEW_PRODUCT: 'new_product',
        PRICE_DROP: 'price_drop',
        REVIEW_REQUEST: 'review_request'
    }
};

// Push subscriptions storage
let pushSubscriptions = JSON.parse(localStorage.getItem('pushSubscriptions') || '{}');
let pushNotifications = JSON.parse(localStorage.getItem('pushNotifications') || '[]');

// === SUBSCRIPTION MANAGEMENT ===

/**
 * Register device for push notifications
 */
function registerPushDevice(deviceToken, userId, platform) {
    const subscription = {
        deviceToken,
        userId,
        platform, // 'ios', 'android', 'web'
        registeredAt: Date.now(),
        enabled: true,
        preferences: {
            orders: true,
            promotions: true,
            newProducts: false,
            priceDrops: true,
            reviews: true
        }
    };

    pushSubscriptions[deviceToken] = subscription;
    localStorage.setItem('pushSubscriptions', JSON.stringify(pushSubscriptions));

    console.log('[Push] Device registered:', deviceToken);

    return {
        success: true,
        subscription
    };
}

/**
 * Unregister device
 */
function unregisterPushDevice(deviceToken) {
    if (pushSubscriptions[deviceToken]) {
        delete pushSubscriptions[deviceToken];
        localStorage.setItem('pushSubscriptions', JSON.stringify(pushSubscriptions));

        console.log('[Push] Device unregistered:', deviceToken);
        return { success: true };
    }

    return {
        success: false,
        error: 'Subscription not found'
    };
}

/**
 * Update notification preferences
 */
function updateNotificationPreferences(deviceToken, preferences) {
    const subscription = pushSubscriptions[deviceToken];

    if (!subscription) {
        return {
            success: false,
            error: 'Subscription not found'
        };
    }

    subscription.preferences = {
        ...subscription.preferences,
        ...preferences
    };

    localStorage.setItem('pushSubscriptions', JSON.stringify(pushSubscriptions));

    console.log('[Push] Preferences updated');

    return {
        success: true,
        preferences: subscription.preferences
    };
}

/**
 * Enable/disable push notifications
 */
function togglePushNotifications(deviceToken, enabled) {
    const subscription = pushSubscriptions[deviceToken];

    if (!subscription) {
        return {
            success: false,
            error: 'Subscription not found'
        };
    }

    subscription.enabled = enabled;
    localStorage.setItem('pushSubscriptions', JSON.stringify(pushSubscriptions));

    console.log('[Push] Notifications', enabled ? 'enabled' : 'disabled');

    return { success: true, enabled };
}

// === NOTIFICATION SENDING ===

/**
 * Send push notification to user
 */
function sendPushNotification(userId, notification) {
    const { type, title, body, data = {}, imageUrl = null } = notification;

    // Find all subscriptions for user
    const userSubscriptions = Object.values(pushSubscriptions).filter(
        s => s.userId === userId && s.enabled
    );

    if (userSubscriptions.length === 0) {
        console.log('[Push] No active subscriptions for user:', userId);
        return {
            success: false,
            error: 'No active subscriptions'
        };
    }

    // Check preferences
    const filteredSubscriptions = userSubscriptions.filter(subscription => {
        if (type === PUSH_CONFIG.notificationTypes.ORDER_CONFIRMED ||
            type === PUSH_CONFIG.notificationTypes.ORDER_SHIPPED ||
            type === PUSH_CONFIG.notificationTypes.ORDER_DELIVERED) {
            return subscription.preferences.orders;
        }
        if (type === PUSH_CONFIG.notificationTypes.PROMOTION) {
            return subscription.preferences.promotions;
        }
        if (type === PUSH_CONFIG.notificationTypes.NEW_PRODUCT) {
            return subscription.preferences.newProducts;
        }
        if (type === PUSH_CONFIG.notificationTypes.PRICE_DROP) {
            return subscription.preferences.priceDrops;
        }
        if (type === PUSH_CONFIG.notificationTypes.REVIEW_REQUEST) {
            return subscription.preferences.reviews;
        }
        return true;
    });

    if (filteredSubscriptions.length === 0) {
        console.log('[Push] User disabled this notification type');
        return {
            success: false,
            error: 'Notification type disabled'
        };
    }

    // Create notification record
    const notificationRecord = {
        id: 'notif_' + Date.now(),
        userId,
        type,
        title,
        body,
        data,
        imageUrl,
        sentAt: Date.now(),
        deliveredTo: filteredSubscriptions.map(s => s.deviceToken),
        read: false
    };

    pushNotifications.push(notificationRecord);

    // Keep only last 1000 notifications
    if (pushNotifications.length > 1000) {
        pushNotifications = pushNotifications.slice(-1000);
    }

    localStorage.setItem('pushNotifications', JSON.stringify(pushNotifications));

    // In real app, send to FCM/APNS
    filteredSubscriptions.forEach(subscription => {
        if (subscription.platform === 'android' || subscription.platform === 'web') {
            sendToFCM(subscription.deviceToken, notification);
        } else if (subscription.platform === 'ios') {
            sendToAPNS(subscription.deviceToken, notification);
        }
    });

    console.log('[Push] Notification sent to', filteredSubscriptions.length, 'devices');

    return {
        success: true,
        notificationId: notificationRecord.id,
        deliveredTo: filteredSubscriptions.length
    };
}

/**
 * Send to Firebase Cloud Messaging (mock)
 */
function sendToFCM(deviceToken, notification) {
    // In real app, make HTTP request to FCM API
    console.log('[Push] FCM send (mock):', {
        to: deviceToken,
        notification: {
            title: notification.title,
            body: notification.body,
            image: notification.imageUrl
        },
        data: notification.data
    });

    // Mock FCM request
    /*
    fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'key=' + PUSH_CONFIG.fcmServerKey
        },
        body: JSON.stringify({
            to: deviceToken,
            notification: {
                title: notification.title,
                body: notification.body,
                image: notification.imageUrl,
                click_action: 'FLUTTER_NOTIFICATION_CLICK'
            },
            data: notification.data,
            priority: 'high'
        })
    });
    */
}

/**
 * Send to Apple Push Notification Service (mock)
 */
function sendToAPNS(deviceToken, notification) {
    // In real app, make HTTP/2 request to APNS
    console.log('[Push] APNS send (mock):', {
        deviceToken,
        aps: {
            alert: {
                title: notification.title,
                body: notification.body
            },
            sound: 'default',
            badge: 1
        },
        data: notification.data
    });

    // Mock APNS request
    /*
    // Use apn npm package or http2 directly
    const apn = require('apn');
    const provider = new apn.Provider({ ... });

    const notification = new apn.Notification();
    notification.alert = {
        title: notification.title,
        body: notification.body
    };
    notification.topic = 'com.flowerparadise.app';
    notification.payload = notification.data;

    provider.send(notification, deviceToken);
    */
}

// === PREDEFINED NOTIFICATIONS ===

/**
 * Send order confirmation notification
 */
function sendOrderConfirmedNotification(userId, orderData) {
    return sendPushNotification(userId, {
        type: PUSH_CONFIG.notificationTypes.ORDER_CONFIRMED,
        title: '✅ Заказ подтвержден',
        body: `Ваш заказ ${orderData.orderNumber} принят в работу`,
        data: {
            orderNumber: orderData.orderNumber,
            screen: 'OrderDetails'
        }
    });
}

/**
 * Send order shipped notification
 */
function sendOrderShippedNotification(userId, orderData) {
    return sendPushNotification(userId, {
        type: PUSH_CONFIG.notificationTypes.ORDER_SHIPPED,
        title: '🚚 Заказ отправлен',
        body: `Курьер ${orderData.courierName} везет ваш заказ. ETA: ${orderData.eta} мин`,
        data: {
            orderNumber: orderData.orderNumber,
            screen: 'OrderTracking'
        }
    });
}

/**
 * Send order delivered notification
 */
function sendOrderDeliveredNotification(userId, orderData) {
    return sendPushNotification(userId, {
        type: PUSH_CONFIG.notificationTypes.ORDER_DELIVERED,
        title: '🎉 Заказ доставлен',
        body: 'Спасибо за заказ! Оставьте отзыв',
        data: {
            orderNumber: orderData.orderNumber,
            screen: 'OrderReview'
        }
    });
}

/**
 * Send promotion notification
 */
function sendPromotionNotification(userId, promotionData) {
    return sendPushNotification(userId, {
        type: PUSH_CONFIG.notificationTypes.PROMOTION,
        title: promotionData.title,
        body: promotionData.description,
        imageUrl: promotionData.image,
        data: {
            promotionId: promotionData.id,
            screen: 'Promotion'
        }
    });
}

/**
 * Send cart reminder notification
 */
function sendCartReminderNotification(userId, cartData) {
    return sendPushNotification(userId, {
        type: PUSH_CONFIG.notificationTypes.CART_REMINDER,
        title: '🛒 У вас есть товары в корзине',
        body: `${cartData.itemsCount} ${cartData.itemsCount === 1 ? 'товар' : 'товара'} на сумму ${cartData.total} ₽`,
        data: {
            screen: 'Cart'
        }
    });
}

/**
 * Send new product notification
 */
function sendNewProductNotification(userId, productData) {
    return sendPushNotification(userId, {
        type: PUSH_CONFIG.notificationTypes.NEW_PRODUCT,
        title: '🌸 Новый букет',
        body: `${productData.name} - ${productData.price} ₽`,
        imageUrl: productData.image,
        data: {
            productId: productData.id,
            screen: 'ProductDetails'
        }
    });
}

/**
 * Send price drop notification
 */
function sendPriceDropNotification(userId, productData) {
    return sendPushNotification(userId, {
        type: PUSH_CONFIG.notificationTypes.PRICE_DROP,
        title: '💰 Скидка на товар',
        body: `${productData.name} теперь ${productData.newPrice} ₽ (было ${productData.oldPrice} ₽)`,
        data: {
            productId: productData.id,
            screen: 'ProductDetails'
        }
    });
}

/**
 * Send review request notification
 */
function sendReviewRequestNotification(userId, orderData) {
    return sendPushNotification(userId, {
        type: PUSH_CONFIG.notificationTypes.REVIEW_REQUEST,
        title: '⭐ Оцените ваш заказ',
        body: 'Расскажите, как вам букет?',
        data: {
            orderNumber: orderData.orderNumber,
            screen: 'OrderReview'
        }
    });
}

// === NOTIFICATION HISTORY ===

/**
 * Get user notifications
 */
function getUserNotifications(userId, limit = 50) {
    const notifications = pushNotifications
        .filter(n => n.userId === userId)
        .sort((a, b) => b.sentAt - a.sentAt)
        .slice(0, limit);

    return {
        success: true,
        notifications: notifications.map(n => ({
            id: n.id,
            type: n.type,
            title: n.title,
            body: n.body,
            imageUrl: n.imageUrl,
            data: n.data,
            sentAt: n.sentAt,
            read: n.read
        }))
    };
}

/**
 * Mark notification as read
 */
function markNotificationRead(notificationId) {
    const notification = pushNotifications.find(n => n.id === notificationId);

    if (notification) {
        notification.read = true;
        localStorage.setItem('pushNotifications', JSON.stringify(pushNotifications));

        return { success: true };
    }

    return {
        success: false,
        error: 'Notification not found'
    };
}

/**
 * Mark all notifications as read
 */
function markAllNotificationsRead(userId) {
    let count = 0;

    pushNotifications.forEach(notification => {
        if (notification.userId === userId && !notification.read) {
            notification.read = true;
            count++;
        }
    });

    if (count > 0) {
        localStorage.setItem('pushNotifications', JSON.stringify(pushNotifications));
    }

    return {
        success: true,
        markedCount: count
    };
}

/**
 * Get unread count
 */
function getUnreadNotificationsCount(userId) {
    const count = pushNotifications.filter(
        n => n.userId === userId && !n.read
    ).length;

    return {
        success: true,
        count
    };
}

// === SCHEDULED NOTIFICATIONS ===

/**
 * Schedule cart abandonment reminder
 */
function scheduleCartReminderNotification(userId, cartData) {
    // Send reminder after 24 hours
    setTimeout(() => {
        sendCartReminderNotification(userId, cartData);
    }, 24 * 60 * 60 * 1000);

    console.log('[Push] Cart reminder scheduled');
}

/**
 * Schedule review request
 */
function scheduleReviewRequestNotification(userId, orderData) {
    // Send request after 3 days
    setTimeout(() => {
        sendReviewRequestNotification(userId, orderData);
    }, 3 * 24 * 60 * 60 * 1000);

    console.log('[Push] Review request scheduled');
}

// === BROADCAST NOTIFICATIONS ===

/**
 * Send notification to all users
 */
function broadcastNotification(notification, filters = {}) {
    const { segment = 'all', platform = 'all' } = filters;

    let subscriptions = Object.values(pushSubscriptions).filter(s => s.enabled);

    // Apply platform filter
    if (platform !== 'all') {
        subscriptions = subscriptions.filter(s => s.platform === platform);
    }

    // Get unique user IDs
    const userIds = [...new Set(subscriptions.map(s => s.userId))];

    console.log('[Push] Broadcasting to', userIds.length, 'users');

    let sentCount = 0;
    userIds.forEach(userId => {
        const result = sendPushNotification(userId, notification);
        if (result.success) sentCount++;
    });

    return {
        success: true,
        sentTo: sentCount
    };
}

// Listen to order events
document.addEventListener('orderConfirmed', (event) => {
    const { userId, orderData } = event.detail;
    sendOrderConfirmedNotification(userId, orderData);
});

document.addEventListener('orderShipped', (event) => {
    const { userId, orderData } = event.detail;
    sendOrderShippedNotification(userId, orderData);
});

document.addEventListener('orderDelivered', (event) => {
    const { userId, orderData } = event.detail;
    sendOrderDeliveredNotification(userId, orderData);
    scheduleReviewRequestNotification(userId, orderData);
});

// Export API
window.PushNotifications = {
    // Subscription management
    registerPushDevice,
    unregisterPushDevice,
    updateNotificationPreferences,
    togglePushNotifications,

    // Sending notifications
    sendPushNotification,
    sendOrderConfirmedNotification,
    sendOrderShippedNotification,
    sendOrderDeliveredNotification,
    sendPromotionNotification,
    sendCartReminderNotification,
    sendNewProductNotification,
    sendPriceDropNotification,
    sendReviewRequestNotification,

    // Scheduling
    scheduleCartReminderNotification,
    scheduleReviewRequestNotification,

    // Broadcasting
    broadcastNotification,

    // History
    getUserNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    getUnreadNotificationsCount,

    // Config
    config: PUSH_CONFIG,
    types: PUSH_CONFIG.notificationTypes
};

console.log('[Push] Push notifications system initialized');
