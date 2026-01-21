/**
 * Advanced Delivery System
 * Zone-based pricing, courier tracking, route optimization
 */

// Delivery zones with pricing
const DELIVERY_ZONES = [
    {
        id: 'zone-1',
        name: 'Центр города',
        description: 'В пределах Садового кольца',
        color: '#28a745',
        price: 0, // Бесплатно
        minOrderForFree: 3000,
        radius: 5,
        center: { lat: 55.751244, lng: 37.618423 }, // Moscow center
        deliveryTime: '1-2 часа',
        priority: 1
    },
    {
        id: 'zone-2',
        name: 'Ближнее Подмосковье',
        description: 'В пределах МКАД',
        color: '#ffc107',
        price: 300,
        minOrderForFree: 5000,
        radius: 15,
        center: { lat: 55.751244, lng: 37.618423 },
        deliveryTime: '2-4 часа',
        priority: 2
    },
    {
        id: 'zone-3',
        name: 'Дальнее Подмосковье',
        description: 'За пределами МКАД до 30 км',
        color: '#ff6b6b',
        price: 600,
        minOrderForFree: 8000,
        radius: 30,
        center: { lat: 55.751244, lng: 37.618423 },
        deliveryTime: '4-6 часов',
        priority: 3
    },
    {
        id: 'zone-4',
        name: 'Дальние районы',
        description: 'До 50 км от центра',
        color: '#dc3545',
        price: 1000,
        minOrderForFree: 10000,
        radius: 50,
        center: { lat: 55.751244, lng: 37.618423 },
        deliveryTime: '6-12 часов',
        priority: 4
    }
];

// Express delivery options
const EXPRESS_OPTIONS = {
    express_1h: {
        name: 'Экспресс 1 час',
        additionalPrice: 500,
        deliveryTime: '30-60 минут',
        available: ['zone-1']
    },
    express_2h: {
        name: 'Экспресс 2 часа',
        additionalPrice: 300,
        deliveryTime: '1-2 часа',
        available: ['zone-1', 'zone-2']
    },
    scheduled: {
        name: 'По расписанию',
        additionalPrice: 0,
        deliveryTime: 'В выбранное время',
        available: ['zone-1', 'zone-2', 'zone-3', 'zone-4']
    }
};

// Courier tracking state
let activeCouriers = JSON.parse(localStorage.getItem('activeCouriers') || '[]');
let deliveryRoutes = JSON.parse(localStorage.getItem('deliveryRoutes') || '[]');

// Calculate delivery zone for address
function calculateDeliveryZone(coordinates) {
    if (!coordinates || !coordinates.lat || !coordinates.lng) {
        return null;
    }

    // Calculate distance from center
    const distance = calculateDistance(
        coordinates.lat,
        coordinates.lng,
        DELIVERY_ZONES[0].center.lat,
        DELIVERY_ZONES[0].center.lng
    );

    // Find appropriate zone
    for (const zone of DELIVERY_ZONES.sort((a, b) => a.priority - b.priority)) {
        if (distance <= zone.radius) {
            return {
                ...zone,
                distance: Math.round(distance * 10) / 10
            };
        }
    }

    return null; // Outside delivery area
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of Earth in km
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
}

// Convert degrees to radians
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

// Calculate delivery cost
function calculateDeliveryCost(zone, orderTotal, expressOption = null) {
    if (!zone) {
        return { error: 'За пределами зоны доставки' };
    }

    let baseCost = zone.price;

    // Check if order qualifies for free delivery
    if (orderTotal >= zone.minOrderForFree) {
        baseCost = 0;
    }

    // Add express delivery cost
    let expressCost = 0;
    if (expressOption && EXPRESS_OPTIONS[expressOption]) {
        const express = EXPRESS_OPTIONS[expressOption];
        if (express.available.includes(zone.id)) {
            expressCost = express.additionalPrice;
        }
    }

    const total = baseCost + expressCost;

    return {
        baseCost,
        expressCost,
        total,
        zone: zone.name,
        isFree: baseCost === 0,
        minForFree: zone.minOrderForFree,
        deliveryTime: expressOption && EXPRESS_OPTIONS[expressOption] ?
            EXPRESS_OPTIONS[expressOption].deliveryTime : zone.deliveryTime
    };
}

// Geocode address using coordinates (mock implementation)
async function geocodeAddress(address) {
    // In real app, use Yandex Maps Geocoding API or Google Maps Geocoding API

    // Mock data for common Moscow addresses
    const mockAddresses = {
        'москва, красная площадь': { lat: 55.753544, lng: 37.621211 },
        'москва, арбат': { lat: 55.751999, lng: 37.586681 },
        'москва, тверская': { lat: 55.764343, lng: 37.605363 },
        'москва, садовое кольцо': { lat: 55.751244, lng: 37.618423 },
        'москва, кутузовский проспект': { lat: 55.740093, lng: 37.527495 },
        'москва, ленинский проспект': { lat: 55.692519, lng: 37.547127 },
        'мытищи': { lat: 55.910667, lng: 37.730838 },
        'химки': { lat: 55.889576, lng: 37.429604 },
        'одинцово': { lat: 55.679583, lng: 37.282000 }
    };

    // Normalize address
    const normalized = address.toLowerCase().trim();

    // Check mock data
    for (const [key, coords] of Object.entries(mockAddresses)) {
        if (normalized.includes(key) || key.includes(normalized)) {
            return {
                success: true,
                coordinates: coords,
                formattedAddress: address
            };
        }
    }

    // Random coordinates within Moscow area for demo
    const lat = 55.751244 + (Math.random() - 0.5) * 0.5;
    const lng = 37.618423 + (Math.random() - 0.5) * 0.5;

    return {
        success: true,
        coordinates: { lat, lng },
        formattedAddress: address
    };
}

// Get delivery info for address
async function getDeliveryInfo(address, orderTotal = 0) {
    try {
        const geocoded = await geocodeAddress(address);

        if (!geocoded.success) {
            return {
                success: false,
                error: 'Не удалось определить адрес'
            };
        }

        const zone = calculateDeliveryZone(geocoded.coordinates);

        if (!zone) {
            return {
                success: false,
                error: 'Адрес находится за пределами зоны доставки'
            };
        }

        const cost = calculateDeliveryCost(zone, orderTotal);

        return {
            success: true,
            zone,
            cost,
            coordinates: geocoded.coordinates,
            formattedAddress: geocoded.formattedAddress
        };
    } catch (error) {
        console.error('[Delivery] Error getting delivery info:', error);
        return {
            success: false,
            error: 'Ошибка при расчете доставки'
        };
    }
}

// Create delivery route
function createDeliveryRoute(orderId, orderData) {
    const route = {
        id: 'route_' + Date.now(),
        orderId,
        courierId: null,
        status: 'pending', // pending, assigned, in_progress, completed, cancelled
        pickupLocation: {
            lat: 55.751244,
            lng: 37.618423,
            address: 'Москва, ул. Цветочная, д. 1 (Магазин)'
        },
        deliveryLocation: orderData.deliveryAddress,
        stops: [],
        distance: 0,
        estimatedTime: 0,
        actualTime: null,
        createdAt: Date.now(),
        assignedAt: null,
        startedAt: null,
        completedAt: null
    };

    // Calculate route distance
    if (orderData.deliveryAddress && orderData.deliveryAddress.coordinates) {
        route.distance = calculateDistance(
            route.pickupLocation.lat,
            route.pickupLocation.lng,
            orderData.deliveryAddress.coordinates.lat,
            orderData.deliveryAddress.coordinates.lng
        );

        // Estimate time (average speed 30 km/h in city)
        route.estimatedTime = Math.ceil((route.distance / 30) * 60); // minutes
    }

    deliveryRoutes.push(route);
    localStorage.setItem('deliveryRoutes', JSON.stringify(deliveryRoutes));

    console.log('[Delivery] Route created:', route);
    return route;
}

// Assign courier to route
function assignCourier(routeId, courierId) {
    const route = deliveryRoutes.find(r => r.id === routeId);
    const courier = activeCouriers.find(c => c.id === courierId);

    if (!route || !courier) {
        return { success: false, error: 'Route or courier not found' };
    }

    if (courier.status !== 'available') {
        return { success: false, error: 'Courier is not available' };
    }

    route.courierId = courierId;
    route.status = 'assigned';
    route.assignedAt = Date.now();

    courier.status = 'busy';
    courier.currentRoute = routeId;

    localStorage.setItem('deliveryRoutes', JSON.stringify(deliveryRoutes));
    localStorage.setItem('activeCouriers', JSON.stringify(activeCouriers));

    console.log('[Delivery] Courier assigned:', { routeId, courierId });
    return { success: true, route, courier };
}

// Update courier location
function updateCourierLocation(courierId, location) {
    const courier = activeCouriers.find(c => c.id === courierId);

    if (!courier) {
        return { success: false, error: 'Courier not found' };
    }

    courier.location = {
        lat: location.lat,
        lng: location.lng,
        timestamp: Date.now()
    };

    localStorage.setItem('activeCouriers', JSON.stringify(activeCouriers));

    // Emit event for real-time tracking
    document.dispatchEvent(new CustomEvent('courierLocationUpdated', {
        detail: { courierId, location: courier.location }
    }));

    return { success: true, courier };
}

// Optimize route for multiple deliveries
function optimizeRoute(stops) {
    // Simple nearest neighbor algorithm for TSP
    if (stops.length <= 1) return stops;

    const optimized = [];
    const remaining = [...stops];
    let current = { lat: 55.751244, lng: 37.618423 }; // Start from store

    while (remaining.length > 0) {
        let nearest = 0;
        let minDistance = Infinity;

        remaining.forEach((stop, index) => {
            const distance = calculateDistance(
                current.lat,
                current.lng,
                stop.coordinates.lat,
                stop.coordinates.lng
            );

            if (distance < minDistance) {
                minDistance = distance;
                nearest = index;
            }
        });

        const nextStop = remaining.splice(nearest, 1)[0];
        optimized.push(nextStop);
        current = nextStop.coordinates;
    }

    return optimized;
}

// Get courier estimated arrival time
function getEstimatedArrival(routeId) {
    const route = deliveryRoutes.find(r => r.id === routeId);

    if (!route || !route.courierId) {
        return null;
    }

    const courier = activeCouriers.find(c => c.id === route.courierId);

    if (!courier || !courier.location) {
        return null;
    }

    // Calculate remaining distance
    const remainingDistance = calculateDistance(
        courier.location.lat,
        courier.location.lng,
        route.deliveryLocation.coordinates.lat,
        route.deliveryLocation.coordinates.lng
    );

    // Estimate time (30 km/h average speed)
    const estimatedMinutes = Math.ceil((remainingDistance / 30) * 60);

    return {
        routeId,
        courierId: courier.id,
        courierName: courier.name,
        remainingDistance: Math.round(remainingDistance * 10) / 10,
        estimatedMinutes,
        estimatedArrival: new Date(Date.now() + estimatedMinutes * 60000).toISOString()
    };
}

// Track delivery status
function getDeliveryStatus(orderId) {
    const route = deliveryRoutes.find(r => r.orderId === orderId);

    if (!route) {
        return {
            found: false,
            message: 'Маршрут доставки не найден'
        };
    }

    const courier = route.courierId ? activeCouriers.find(c => c.id === route.courierId) : null;
    const eta = route.status === 'in_progress' ? getEstimatedArrival(route.id) : null;

    return {
        found: true,
        route,
        courier,
        eta,
        statusText: getStatusText(route.status),
        timeline: buildTimeline(route)
    };
}

// Get status text
function getStatusText(status) {
    const statusTexts = {
        'pending': 'Ожидает назначения курьера',
        'assigned': 'Назначен курьер',
        'in_progress': 'В пути',
        'completed': 'Доставлен',
        'cancelled': 'Отменён'
    };
    return statusTexts[status] || status;
}

// Build delivery timeline
function buildTimeline(route) {
    const timeline = [];

    if (route.createdAt) {
        timeline.push({
            status: 'created',
            text: 'Заказ принят',
            timestamp: route.createdAt,
            completed: true
        });
    }

    if (route.assignedAt) {
        timeline.push({
            status: 'assigned',
            text: 'Курьер назначен',
            timestamp: route.assignedAt,
            completed: true
        });
    }

    if (route.startedAt) {
        timeline.push({
            status: 'started',
            text: 'Курьер выехал',
            timestamp: route.startedAt,
            completed: true
        });
    }

    timeline.push({
        status: 'in_transit',
        text: 'В пути',
        timestamp: null,
        completed: route.status === 'in_progress' || route.status === 'completed'
    });

    timeline.push({
        status: 'delivered',
        text: 'Доставлен',
        timestamp: route.completedAt,
        completed: route.status === 'completed'
    });

    return timeline;
}

// Add mock couriers for demo
function initializeMockCouriers() {
    if (activeCouriers.length === 0) {
        activeCouriers = [
            {
                id: 'courier_1',
                name: 'Иван Петров',
                phone: '+7 (999) 123-45-67',
                status: 'available', // available, busy, offline
                location: { lat: 55.751244, lng: 37.618423, timestamp: Date.now() },
                currentRoute: null,
                rating: 4.9,
                completedDeliveries: 342
            },
            {
                id: 'courier_2',
                name: 'Мария Сидорова',
                phone: '+7 (999) 234-56-78',
                status: 'available',
                location: { lat: 55.760000, lng: 37.630000, timestamp: Date.now() },
                currentRoute: null,
                rating: 4.8,
                completedDeliveries: 256
            },
            {
                id: 'courier_3',
                name: 'Александр Иванов',
                phone: '+7 (999) 345-67-89',
                status: 'busy',
                location: { lat: 55.740000, lng: 37.600000, timestamp: Date.now() },
                currentRoute: 'route_123',
                rating: 4.7,
                completedDeliveries: 189
            }
        ];
        localStorage.setItem('activeCouriers', JSON.stringify(activeCouriers));
    }
}

// Get available couriers
function getAvailableCouriers() {
    return activeCouriers.filter(c => c.status === 'available');
}

// Get all zones
function getAllZones() {
    return DELIVERY_ZONES;
}

// Get express options for zone
function getExpressOptions(zoneId) {
    const options = [];

    for (const [key, value] of Object.entries(EXPRESS_OPTIONS)) {
        if (value.available.includes(zoneId)) {
            options.push({
                id: key,
                ...value
            });
        }
    }

    return options;
}

// Initialize delivery system
function initializeDeliverySystem() {
    initializeMockCouriers();

    // Simulate courier movement for demo
    setInterval(() => {
        activeCouriers.forEach(courier => {
            if (courier.status === 'busy' && courier.location) {
                // Simulate movement (small random changes)
                courier.location.lat += (Math.random() - 0.5) * 0.001;
                courier.location.lng += (Math.random() - 0.5) * 0.001;
                courier.location.timestamp = Date.now();
            }
        });
        localStorage.setItem('activeCouriers', JSON.stringify(activeCouriers));
    }, 10000); // Update every 10 seconds

    console.log('[Delivery] Advanced delivery system initialized');
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initializeDeliverySystem();
});

// Export API
window.DeliveryAPI = {
    // Zones and pricing
    getAllZones,
    calculateDeliveryZone,
    calculateDeliveryCost,
    getExpressOptions,

    // Address and geocoding
    geocodeAddress,
    getDeliveryInfo,

    // Routes
    createDeliveryRoute,
    optimizeRoute,

    // Couriers
    getAvailableCouriers,
    assignCourier,
    updateCourierLocation,

    // Tracking
    getDeliveryStatus,
    getEstimatedArrival,

    // Data access
    DELIVERY_ZONES,
    EXPRESS_OPTIONS,
    getRoutes: () => deliveryRoutes,
    getCouriers: () => activeCouriers
};
