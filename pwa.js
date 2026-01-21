/**
 * PWA Installer and Service Worker Registration
 */

let deferredPrompt;
let swRegistration = null;

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('[PWA] Service Worker registered:', registration);
                swRegistration = registration;

                // Check for updates every hour
                setInterval(() => {
                    registration.update();
                }, 60 * 60 * 1000);
            })
            .catch((error) => {
                console.error('[PWA] Service Worker registration failed:', error);
            });
    });

    // Handle service worker updates
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[PWA] New Service Worker activated');
        showUpdateNotification();
    });
}

// Capture beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('[PWA] beforeinstallprompt event fired');

    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();

    // Stash the event so it can be triggered later
    deferredPrompt = e;

    // Show install button
    showInstallPromotion();
});

// Show install button
function showInstallPromotion() {
    const installButton = document.getElementById('pwa-install-btn');

    if (installButton) {
        installButton.style.display = 'block';
        return;
    }

    // Create install button if doesn't exist
    const btn = document.createElement('button');
    btn.id = 'pwa-install-btn';
    btn.className = 'pwa-install-button';
    btn.innerHTML = `
        <span class="install-icon">⬇️</span>
        <span class="install-text">Установить приложение</span>
    `;
    btn.onclick = installPWA;

    // Add button styles
    const style = document.createElement('style');
    style.textContent = `
        .pwa-install-button {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 50px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
            z-index: 9998;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: transform 0.3s, box-shadow 0.3s;
            animation: slideInUp 0.5s ease;
        }

        .pwa-install-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 25px rgba(102, 126, 234, 0.5);
        }

        .install-icon {
            font-size: 18px;
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

        @media (max-width: 768px) {
            .pwa-install-button {
                bottom: 10px;
                right: 10px;
                font-size: 12px;
                padding: 10px 20px;
            }
        }
    `;

    document.head.appendChild(style);
    document.body.appendChild(btn);
}

// Install PWA
async function installPWA() {
    if (!deferredPrompt) {
        console.log('[PWA] Install prompt not available');
        return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`[PWA] User response: ${outcome}`);

    if (outcome === 'accepted') {
        console.log('[PWA] PWA installed');

        // Hide install button
        const installBtn = document.getElementById('pwa-install-btn');
        if (installBtn) {
            installBtn.style.display = 'none';
        }

        // Track installation
        if (typeof SEOAPI !== 'undefined') {
            SEOAPI.trackEvent('PWA', 'install', 'accepted');
        }
    } else {
        console.log('[PWA] PWA installation declined');

        // Track declination
        if (typeof SEOAPI !== 'undefined') {
            SEOAPI.trackEvent('PWA', 'install', 'declined');
        }
    }

    // Clear the deferred prompt
    deferredPrompt = null;
}

// Detect if app is installed
window.addEventListener('appinstalled', () => {
    console.log('[PWA] App was installed');

    // Hide install button
    const installBtn = document.getElementById('pwa-install-btn');
    if (installBtn) {
        installBtn.style.display = 'none';
    }

    // Show thank you message
    showNotification('Приложение установлено! Теперь вы можете запускать его с домашнего экрана.');

    // Track installation
    if (typeof SEOAPI !== 'undefined') {
        SEOAPI.trackEvent('PWA', 'appinstalled', 'success');
    }
});

// Check if running as PWA
function isRunningAsPWA() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
}

// Show update notification
function showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'pwa-update-notification';
    notification.innerHTML = `
        <div class="update-content">
            <span class="update-icon">🔄</span>
            <span class="update-text">Доступна новая версия приложения</span>
            <button class="update-btn" onclick="updatePWA()">Обновить</button>
            <button class="update-close" onclick="this.parentElement.parentElement.remove()">✕</button>
        </div>
    `;

    // Add notification styles
    const style = document.createElement('style');
    style.textContent = `
        .pwa-update-notification {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10000;
            animation: slideInDown 0.5s ease;
        }

        .update-content {
            background: #28a745;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .update-icon {
            font-size: 20px;
        }

        .update-text {
            font-weight: 600;
        }

        .update-btn {
            padding: 8px 16px;
            background: white;
            color: #28a745;
            border: none;
            border-radius: 5px;
            font-weight: 600;
            cursor: pointer;
        }

        .update-close {
            background: none;
            border: none;
            color: white;
            font-size: 18px;
            cursor: pointer;
            padding: 0 8px;
        }

        @keyframes slideInDown {
            from {
                transform: translate(-50%, -100px);
                opacity: 0;
            }
            to {
                transform: translate(-50%, 0);
                opacity: 1;
            }
        }
    `;

    document.head.appendChild(style);
    document.body.appendChild(notification);
}

// Update PWA
function updatePWA() {
    if (swRegistration && swRegistration.waiting) {
        swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }

    // Reload page
    window.location.reload();
}

// Log PWA status on load
window.addEventListener('load', () => {
    console.log('[PWA] Running as PWA:', isRunningAsPWA());

    if (isRunningAsPWA()) {
        console.log('[PWA] App is running in standalone mode');

        // Track PWA usage
        if (typeof SEOAPI !== 'undefined') {
            SEOAPI.trackEvent('PWA', 'usage', 'standalone');
        }
    }
});

// Export API
window.PWAAPI = {
    installPWA,
    isRunningAsPWA,
    updatePWA
};
