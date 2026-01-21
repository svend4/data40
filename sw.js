/**
 * Service Worker for Цветочный Рай PWA
 * Handles offline functionality and caching
 */

const CACHE_NAME = 'flowerparadise-v1.0';
const OFFLINE_URL = '/offline.html';

// Files to cache immediately on install
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/offline.html',
    '/styles.css',
    '/theme.css',
    '/pages.css',
    '/script.js',
    '/theme.js',
    '/auth.js',
    '/seo.js',
    '/analytics.js'
];

// Install event - precache essential files
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Precaching files');
                return cache.addAll(PRECACHE_URLS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker...');

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Return cached response if available
                if (cachedResponse) {
                    console.log('[SW] Serving from cache:', event.request.url);
                    return cachedResponse;
                }

                // Otherwise fetch from network
                return fetch(event.request)
                    .then((networkResponse) => {
                        // Cache the fetched response for future use
                        if (networkResponse && networkResponse.status === 200) {
                            const responseToCache = networkResponse.clone();

                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        }

                        return networkResponse;
                    })
                    .catch(() => {
                        // If offline and requesting HTML page, show offline page
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return caches.match(OFFLINE_URL);
                        }
                    });
            })
    );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Background sync for offline orders
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-orders') {
        event.waitUntil(syncOrders());
    }
});

// Sync orders when back online
async function syncOrders() {
    console.log('[SW] Syncing offline orders...');

    try {
        const offlineOrders = await getOfflineOrders();

        for (const order of offlineOrders) {
            // Send order to server (placeholder)
            console.log('[SW] Syncing order:', order.id);
            // await fetch('/api/orders', { method: 'POST', body: JSON.stringify(order) });

            // Remove from offline storage after successful sync
            await removeOfflineOrder(order.id);
        }

        console.log('[SW] All orders synced');
    } catch (error) {
        console.error('[SW] Failed to sync orders:', error);
    }
}

// Helper functions for offline orders
async function getOfflineOrders() {
    // Placeholder - would normally get from IndexedDB
    return [];
}

async function removeOfflineOrder(orderId) {
    // Placeholder - would normally remove from IndexedDB
    console.log('[SW] Removed offline order:', orderId);
}

// Push notification handler
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'Новое уведомление от Цветочного Рая',
        icon: '/images/icon-192x192.png',
        badge: '/images/badge-72x72.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Открыть сайт',
                icon: '/images/checkmark.png'
            },
            {
                action: 'close',
                title: 'Закрыть',
                icon: '/images/xmark.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Цветочный Рай', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});
