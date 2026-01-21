/**
 * Mobile Bridge
 * Communication bridge between web and native mobile app
 */

// Bridge configuration
const BRIDGE_CONFIG = {
    platform: detectPlatform(),
    version: '1.0.0',
    isWebView: isRunningInWebView(),
    isMobileApp: isRunningInMobileApp()
};

// Message queue for native communication
let messageQueue = [];
let messageId = 0;
let messageCallbacks = {};

// === PLATFORM DETECTION ===

/**
 * Detect platform
 */
function detectPlatform() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;

    if (/android/i.test(ua)) {
        return 'android';
    }

    if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) {
        return 'ios';
    }

    return 'web';
}

/**
 * Check if running in WebView
 */
function isRunningInWebView() {
    // Check for common WebView indicators
    return (
        window.ReactNativeWebView !== undefined ||
        window.webkit?.messageHandlers !== undefined ||
        window.AndroidBridge !== undefined
    );
}

/**
 * Check if running in mobile app
 */
function isRunningInMobileApp() {
    return BRIDGE_CONFIG.isWebView || window.FlowerParadiseApp !== undefined;
}

// === NATIVE COMMUNICATION ===

/**
 * Send message to native app
 */
function sendToNative(action, data = {}, callback = null) {
    if (!BRIDGE_CONFIG.isWebView) {
        console.warn('[Bridge] Not running in native app');
        if (callback) callback({ success: false, error: 'Not in native app' });
        return;
    }

    const message = {
        id: ++messageId,
        action,
        data,
        timestamp: Date.now()
    };

    // Store callback
    if (callback) {
        messageCallbacks[message.id] = callback;
    }

    // Send based on platform
    if (BRIDGE_CONFIG.platform === 'ios') {
        sendToIOS(message);
    } else if (BRIDGE_CONFIG.platform === 'android') {
        sendToAndroid(message);
    } else if (window.ReactNativeWebView) {
        sendToReactNative(message);
    }

    console.log('[Bridge] Sent to native:', action);
}

/**
 * Send to iOS (WKWebView)
 */
function sendToIOS(message) {
    if (window.webkit?.messageHandlers?.FlowerParadise) {
        window.webkit.messageHandlers.FlowerParadise.postMessage(message);
    }
}

/**
 * Send to Android
 */
function sendToAndroid(message) {
    if (window.AndroidBridge) {
        window.AndroidBridge.postMessage(JSON.stringify(message));
    }
}

/**
 * Send to React Native
 */
function sendToReactNative(message) {
    if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(message));
    }
}

/**
 * Handle response from native
 */
function handleNativeResponse(response) {
    const { id, success, data, error } = response;

    if (messageCallbacks[id]) {
        messageCallbacks[id]({ success, data, error });
        delete messageCallbacks[id];
    }

    console.log('[Bridge] Received from native:', response);
}

// === BIOMETRIC AUTHENTICATION ===

/**
 * Check biometric availability
 */
function checkBiometricAvailability(callback) {
    sendToNative('biometric.check', {}, (response) => {
        callback(response);
    });
}

/**
 * Authenticate with biometrics
 */
function authenticateWithBiometrics(reason, callback) {
    sendToNative('biometric.authenticate', {
        reason: reason || 'Подтвердите вход'
    }, (response) => {
        callback(response);
    });
}

/**
 * Enable biometric authentication
 */
function enableBiometricAuth(userId, callback) {
    sendToNative('biometric.enable', {
        userId
    }, (response) => {
        callback(response);
    });
}

/**
 * Disable biometric authentication
 */
function disableBiometricAuth(callback) {
    sendToNative('biometric.disable', {}, (response) => {
        callback(response);
    });
}

// === PUSH NOTIFICATIONS ===

/**
 * Request push notification permission
 */
function requestPushPermission(callback) {
    sendToNative('push.requestPermission', {}, (response) => {
        callback(response);
    });
}

/**
 * Get push token
 */
function getPushToken(callback) {
    sendToNative('push.getToken', {}, (response) => {
        callback(response);
    });
}

/**
 * Subscribe to push topic
 */
function subscribeToPushTopic(topic, callback) {
    sendToNative('push.subscribe', {
        topic
    }, (response) => {
        callback(response);
    });
}

/**
 * Unsubscribe from push topic
 */
function unsubscribeFromPushTopic(topic, callback) {
    sendToNative('push.unsubscribe', {
        topic
    }, (response) => {
        callback(response);
    });
}

// === QR CODE SCANNER ===

/**
 * Open QR scanner
 */
function openQRScanner(callback) {
    sendToNative('qr.scan', {}, (response) => {
        if (response.success && response.data) {
            // Process QR result
            const qrResult = window.QRScanner?.processScanResult(response.data);
            callback(qrResult || response);
        } else {
            callback(response);
        }
    });
}

/**
 * Check camera permission
 */
function checkCameraPermission(callback) {
    sendToNative('camera.checkPermission', {}, (response) => {
        callback(response);
    });
}

/**
 * Request camera permission
 */
function requestCameraPermission(callback) {
    sendToNative('camera.requestPermission', {}, (response) => {
        callback(response);
    });
}

// === GEOLOCATION ===

/**
 * Get current location
 */
function getCurrentLocation(callback) {
    sendToNative('location.getCurrent', {}, (response) => {
        callback(response);
    });
}

/**
 * Watch location changes
 */
function watchLocation(callback) {
    sendToNative('location.watch', {}, (response) => {
        callback(response);
    });
}

/**
 * Stop watching location
 */
function stopWatchingLocation(callback) {
    sendToNative('location.stopWatch', {}, (response) => {
        callback(response);
    });
}

/**
 * Open maps navigation
 */
function openMapsNavigation(latitude, longitude, label, callback) {
    sendToNative('maps.navigate', {
        latitude,
        longitude,
        label
    }, (response) => {
        callback(response);
    });
}

// === PAYMENTS ===

/**
 * Check Apple Pay availability (iOS)
 */
function checkApplePayAvailability(callback) {
    if (BRIDGE_CONFIG.platform !== 'ios') {
        callback({ success: false, available: false });
        return;
    }

    sendToNative('payment.applePayAvailable', {}, (response) => {
        callback(response);
    });
}

/**
 * Process Apple Pay payment
 */
function processApplePayPayment(paymentData, callback) {
    sendToNative('payment.applePay', paymentData, (response) => {
        callback(response);
    });
}

/**
 * Check Google Pay availability (Android)
 */
function checkGooglePayAvailability(callback) {
    if (BRIDGE_CONFIG.platform !== 'android') {
        callback({ success: false, available: false });
        return;
    }

    sendToNative('payment.googlePayAvailable', {}, (response) => {
        callback(response);
    });
}

/**
 * Process Google Pay payment
 */
function processGooglePayPayment(paymentData, callback) {
    sendToNative('payment.googlePay', paymentData, (response) => {
        callback(response);
    });
}

// === STORAGE ===

/**
 * Store data securely
 */
function secureStore(key, value, callback) {
    sendToNative('storage.secureSet', {
        key,
        value: JSON.stringify(value)
    }, (response) => {
        callback(response);
    });
}

/**
 * Retrieve secure data
 */
function secureRetrieve(key, callback) {
    sendToNative('storage.secureGet', {
        key
    }, (response) => {
        if (response.success && response.data) {
            try {
                response.data = JSON.parse(response.data);
            } catch (e) {
                // Data is not JSON
            }
        }
        callback(response);
    });
}

/**
 * Delete secure data
 */
function secureDelete(key, callback) {
    sendToNative('storage.secureDelete', {
        key
    }, (response) => {
        callback(response);
    });
}

// === SHARING ===

/**
 * Share content
 */
function shareContent(data, callback) {
    const { title, text, url, image } = data;

    sendToNative('share.content', {
        title,
        text,
        url,
        image
    }, (response) => {
        callback(response);
    });
}

/**
 * Share to specific platform
 */
function shareToPlatform(platform, data, callback) {
    sendToNative('share.platform', {
        platform, // 'instagram', 'whatsapp', 'telegram', etc.
        ...data
    }, (response) => {
        callback(response);
    });
}

// === HAPTIC FEEDBACK ===

/**
 * Trigger haptic feedback
 */
function triggerHaptic(type = 'light') {
    sendToNative('haptic.trigger', {
        type // 'light', 'medium', 'heavy', 'success', 'warning', 'error'
    });
}

// === APP INFO ===

/**
 * Get app version
 */
function getAppVersion(callback) {
    sendToNative('app.getVersion', {}, (response) => {
        callback(response);
    });
}

/**
 * Get device info
 */
function getDeviceInfo(callback) {
    sendToNative('app.getDeviceInfo', {}, (response) => {
        callback(response);
    });
}

/**
 * Check for app updates
 */
function checkForUpdates(callback) {
    sendToNative('app.checkUpdates', {}, (response) => {
        callback(response);
    });
}

/**
 * Open app settings
 */
function openAppSettings(callback) {
    sendToNative('app.openSettings', {}, (response) => {
        callback(response);
    });
}

// === CONTACTS ===

/**
 * Pick contact
 */
function pickContact(callback) {
    sendToNative('contacts.pick', {}, (response) => {
        callback(response);
    });
}

// === CALENDAR ===

/**
 * Add event to calendar
 */
function addCalendarEvent(event, callback) {
    sendToNative('calendar.addEvent', event, (response) => {
        callback(response);
    });
}

// === CLIPBOARD ===

/**
 * Copy to clipboard
 */
function copyToClipboard(text, callback) {
    sendToNative('clipboard.copy', {
        text
    }, (response) => {
        callback(response);
    });
}

/**
 * Read from clipboard
 */
function readFromClipboard(callback) {
    sendToNative('clipboard.read', {}, (response) => {
        callback(response);
    });
}

// === FALLBACKS FOR WEB ===

/**
 * Fallback implementations for web
 */
const webFallbacks = {
    biometric: {
        check: () => ({ success: true, available: false, type: 'none' }),
        authenticate: () => ({ success: false, error: 'Not available on web' })
    },
    qr: {
        scan: () => {
            alert('QR scanning not available on web. Use camera button in search.');
            return { success: false, error: 'Not available on web' };
        }
    },
    location: {
        getCurrent: (callback) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        callback({
                            success: true,
                            data: {
                                latitude: position.coords.latitude,
                                longitude: position.coords.longitude,
                                accuracy: position.coords.accuracy
                            }
                        });
                    },
                    (error) => {
                        callback({ success: false, error: error.message });
                    }
                );
            } else {
                callback({ success: false, error: 'Geolocation not supported' });
            }
        }
    }
};

/**
 * Execute with fallback
 */
function executeWithFallback(category, action, ...args) {
    if (BRIDGE_CONFIG.isWebView) {
        // Use native
        return sendToNative(`${category}.${action}`, ...args);
    } else {
        // Use web fallback
        const fallback = webFallbacks[category]?.[action];
        if (fallback) {
            return fallback(...args);
        } else {
            console.warn('[Bridge] No fallback for:', category, action);
            const callback = args[args.length - 1];
            if (typeof callback === 'function') {
                callback({ success: false, error: 'Not available' });
            }
        }
    }
}

// === INITIALIZATION ===

/**
 * Initialize bridge
 */
function initializeBridge() {
    // Register global handler for native responses
    window.handleNativeResponse = handleNativeResponse;

    // Notify native that web is ready
    if (BRIDGE_CONFIG.isWebView) {
        sendToNative('web.ready', {
            url: window.location.href,
            userAgent: navigator.userAgent
        });
    }

    console.log('[Bridge] Mobile bridge initialized', BRIDGE_CONFIG);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initializeBridge();
});

// Export API
window.MobileBridge = {
    // Platform info
    platform: BRIDGE_CONFIG.platform,
    isWebView: BRIDGE_CONFIG.isWebView,
    isMobileApp: BRIDGE_CONFIG.isMobileApp,

    // Communication
    sendToNative,
    handleNativeResponse,

    // Biometrics
    checkBiometricAvailability,
    authenticateWithBiometrics,
    enableBiometricAuth,
    disableBiometricAuth,

    // Push notifications
    requestPushPermission,
    getPushToken,
    subscribeToPushTopic,
    unsubscribeFromPushTopic,

    // QR Scanner
    openQRScanner,
    checkCameraPermission,
    requestCameraPermission,

    // Geolocation
    getCurrentLocation,
    watchLocation,
    stopWatchingLocation,
    openMapsNavigation,

    // Payments
    checkApplePayAvailability,
    processApplePayPayment,
    checkGooglePayAvailability,
    processGooglePayPayment,

    // Storage
    secureStore,
    secureRetrieve,
    secureDelete,

    // Sharing
    shareContent,
    shareToPlatform,

    // Haptics
    triggerHaptic,

    // App info
    getAppVersion,
    getDeviceInfo,
    checkForUpdates,
    openAppSettings,

    // Contacts
    pickContact,

    // Calendar
    addCalendarEvent,

    // Clipboard
    copyToClipboard,
    readFromClipboard,

    // Utilities
    executeWithFallback
};

console.log('[Bridge] Mobile bridge API exported');
