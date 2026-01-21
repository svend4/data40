/**
 * Gallery Portfolio System
 */

// Gallery items database
const galleryItems = [
    // Weddings
    {
        id: 1,
        title: 'Свадьба Анны и Дмитрия',
        category: 'weddings',
        description: 'Нежная композиция из пионов и роз',
        emoji: '💐',
        color: 'linear-gradient(135deg, #ff6b9d 0%, #ffa07a 100%)',
        date: '2025-12-15'
    },
    {
        id: 2,
        title: 'Свадебный декор',
        category: 'weddings',
        description: 'Оформление банкетного зала',
        emoji: '🌸',
        color: 'linear-gradient(135deg, #ffa07a 0%, #ffd4a3 100%)',
        date: '2025-11-20'
    },
    {
        id: 3,
        title: 'Букет невесты',
        category: 'weddings',
        description: 'Классический букет из белых роз',
        emoji: '🌹',
        color: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
        date: '2025-10-05'
    },
    {
        id: 4,
        title: 'Свадьба в саду',
        category: 'weddings',
        description: 'Летняя свадьба с полевыми цветами',
        emoji: '🌼',
        color: 'linear-gradient(135deg, #ffeb99 0%, #ffd54f 100%)',
        date: '2025-09-12'
    },
    // Events
    {
        id: 5,
        title: 'Юбилей компании',
        category: 'events',
        description: 'Торжественное оформление',
        emoji: '🎉',
        color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        date: '2025-12-01'
    },
    {
        id: 6,
        title: 'День рождения',
        category: 'events',
        description: 'Яркая композиция для праздника',
        emoji: '🎂',
        color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        date: '2025-11-15'
    },
    {
        id: 7,
        title: 'Корпоратив',
        category: 'events',
        description: 'Украшение офисного пространства',
        emoji: '🎊',
        color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        date: '2025-10-28'
    },
    {
        id: 8,
        title: 'Выпускной вечер',
        category: 'events',
        description: 'Композиции для выпускников',
        emoji: '🎓',
        color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        date: '2025-06-30'
    },
    // Bouquets
    {
        id: 9,
        title: 'Букет "Весеннее настроение"',
        category: 'bouquets',
        description: 'Тюльпаны и нарциссы',
        emoji: '🌷',
        color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        date: '2026-01-10'
    },
    {
        id: 10,
        title: 'Букет "Тропики"',
        category: 'bouquets',
        description: 'Экзотические цветы',
        emoji: '🌺',
        color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
        date: '2025-12-20'
    },
    {
        id: 11,
        title: 'Букет "Классика"',
        category: 'bouquets',
        description: 'Красные розы премиум',
        emoji: '🌹',
        color: 'linear-gradient(135deg, #e83e8c 0%, #dc143c 100%)',
        date: '2025-11-25'
    },
    {
        id: 12,
        title: 'Букет "Нежность"',
        category: 'bouquets',
        description: 'Пастельные тона',
        emoji: '💐',
        color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        date: '2025-10-15'
    },
    // Corporate
    {
        id: 13,
        title: 'Оформление офиса',
        category: 'corporate',
        description: 'Регулярная доставка для офиса',
        emoji: '🏢',
        color: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
        date: '2025-12-05'
    },
    {
        id: 14,
        title: 'Бизнес-подарок',
        category: 'corporate',
        description: 'Композиция для партнеров',
        emoji: '🎁',
        color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        date: '2025-11-10'
    },
    {
        id: 15,
        title: 'Презентация продукта',
        category: 'corporate',
        description: 'Декор для мероприятия',
        emoji: '📊',
        color: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
        date: '2025-10-20'
    },
    {
        id: 16,
        title: 'Конференция',
        category: 'corporate',
        description: 'Оформление стенда',
        emoji: '🎤',
        color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        date: '2025-09-18'
    }
];

// Current filter
let currentFilter = 'all';

// Initialize gallery
document.addEventListener('DOMContentLoaded', () => {
    renderGallery();
});

// Render gallery
function renderGallery() {
    const container = document.getElementById('gallery-grid');

    const filteredItems = currentFilter === 'all'
        ? galleryItems
        : galleryItems.filter(item => item.category === currentFilter);

    // Sort by date (newest first)
    const sortedItems = filteredItems.sort((a, b) => new Date(b.date) - new Date(a.date));

    container.innerHTML = sortedItems.map(item => `
        <div class="gallery-item" data-category="${item.category}" onclick="openGalleryModal(${item.id})">
            <div class="gallery-item-image" style="background: ${item.color}">
                <div class="gallery-emoji">${item.emoji}</div>
                <div class="gallery-overlay">
                    <div class="gallery-icon">🔍</div>
                </div>
            </div>
            <div class="gallery-item-info">
                <h3>${item.title}</h3>
                <p>${item.description}</p>
                <span class="gallery-date">${formatGalleryDate(item.date)}</span>
            </div>
        </div>
    `).join('');

    // Add animation
    const items = document.querySelectorAll('.gallery-item');
    items.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.05}s`;
    });
}

// Filter gallery
function filterGallery(category) {
    currentFilter = category;

    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    renderGallery();
}

// Format gallery date
function formatGalleryDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        month: 'long',
        year: 'numeric'
    });
}

// Open gallery modal
function openGalleryModal(itemId) {
    const item = galleryItems.find(i => i.id === itemId);
    if (!item) return;

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'gallery-modal';

    const categoryNames = {
        weddings: 'Свадьбы',
        events: 'Мероприятия',
        bouquets: 'Букеты',
        corporate: 'Корпоративные'
    };

    modal.innerHTML = `
        <div class="modal-content gallery-modal-content">
            <div class="modal-header">
                <h2>${item.title}</h2>
                <span class="close" onclick="closeGalleryModal()">&times;</span>
            </div>
            <div class="gallery-modal-body">
                <div class="modal-image" style="background: ${item.color}">
                    <div class="modal-emoji">${item.emoji}</div>
                </div>
                <div class="modal-details">
                    <div class="detail-row">
                        <span class="detail-label">Категория:</span>
                        <span class="detail-value">${categoryNames[item.category]}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Дата:</span>
                        <span class="detail-value">${formatGalleryDate(item.date)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Описание:</span>
                        <span class="detail-value">${item.description}</span>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn-primary" onclick="closeGalleryModal(); window.location.href='index.html#catalog'">
                        Заказать похожий букет
                    </button>
                    <button class="btn-secondary" onclick="shareGalleryItem(${item.id})">
                        Поделиться
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

// Close gallery modal
function closeGalleryModal() {
    const modal = document.getElementById('gallery-modal');
    if (modal) {
        modal.remove();
    }
}

// Share gallery item
function shareGalleryItem(itemId) {
    const item = galleryItems.find(i => i.id === itemId);
    if (!item) return;

    const text = `Посмотрите "${item.title}" в Цветочном Раю!`;
    const url = window.location.href;

    if (navigator.share) {
        navigator.share({
            title: item.title,
            text: text,
            url: url
        }).catch(() => {
            copyToClipboard(url);
        });
    } else {
        copyToClipboard(url);
    }
}

// Copy to clipboard
function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert('Ссылка скопирована в буфер обмена!');
}

// API
window.GalleryAPI = {
    galleryItems,
    filterGallery,
    openGalleryModal
};
