/**
 * Blog System with Posts, Categories, Search and Pagination
 */

// Blog Posts Data
const blogPosts = [
    {
        id: 1,
        title: "Как правильно ухаживать за розами в домашних условиях",
        excerpt: "Розы - королевы цветов, требующие особого внимания. Узнайте секреты длительного сохранения свежести роз.",
        content: "Полный текст статьи о правильном уходе за розами...",
        category: "care",
        tags: ["розы", "уход", "свежесть"],
        author: "Анна Петрова",
        date: "2026-01-15",
        readTime: "5 мин",
        views: 1243,
        comments: 24,
        featured: true,
        emoji: "🌹"
    },
    {
        id: 2,
        title: "10 идей романтических букетов на День Святого Валентина",
        excerpt: "Создайте незабываемое настроение с нашими идеями романтических композиций для любимых.",
        content: "Полный текст статьи об идеях романтических букетов...",
        category: "ideas",
        tags: ["букеты", "романтика", "валентин"],
        author: "Мария Сидорова",
        date: "2026-01-10",
        readTime: "7 мин",
        views: 892,
        comments: 18,
        featured: true,
        emoji: "💝"
    },
    {
        id: 3,
        title: "Цветочный этикет: какие цветы дарить на разные случаи",
        excerpt: "Знание цветочного этикета поможет вам всегда выбирать правильные цветы для любого события.",
        content: "Полный текст статьи о цветочном этикете...",
        category: "etiquette",
        tags: ["этикет", "выбор", "события"],
        author: "Елена Козлова",
        date: "2026-01-08",
        readTime: "6 мин",
        views: 756,
        comments: 12,
        featured: true,
        emoji: "🎭"
    },
    {
        id: 4,
        title: "Топ-5 неприхотливых цветов для начинающих",
        excerpt: "Начинаете свой путь в цветоводстве? Эти цветы идеально подойдут для новичков.",
        content: "Полный текст статьи о неприхотливых цветах...",
        category: "care",
        tags: ["начинающим", "уход", "простота"],
        author: "Дмитрий Волков",
        date: "2026-01-05",
        readTime: "4 мин",
        views: 1567,
        comments: 31,
        featured: false,
        emoji: "🌱"
    },
    {
        id: 5,
        title: "Как создать букет своими руками: пошаговая инструкция",
        excerpt: "Научитесь составлять красивые букеты самостоятельно с нашим детальным руководством.",
        content: "Полный текст статьи о создании букетов своими руками...",
        category: "diy",
        tags: ["своими руками", "букеты", "мастер-класс"],
        author: "Ольга Смирнова",
        date: "2026-01-03",
        readTime: "10 мин",
        views: 2134,
        comments: 45,
        featured: false,
        emoji: "✂️"
    },
    {
        id: 6,
        title: "Тренды флористики 2026: что будет популярно в этом году",
        excerpt: "Узнайте о главных трендах в мире цветов и флористики в наступившем году.",
        content: "Полный текст статьи о трендах флористики...",
        category: "news",
        tags: ["тренды", "новинки", "2026"],
        author: "Анна Петрова",
        date: "2026-01-01",
        readTime: "8 мин",
        views: 3421,
        comments: 67,
        featured: false,
        emoji: "📰"
    },
    {
        id: 7,
        title: "Значение цветов: символика и язык цветов",
        excerpt: "Каждый цветок несет свое послание. Изучите язык цветов для правильного выражения чувств.",
        content: "Полный текст статьи о значении цветов...",
        category: "etiquette",
        tags: ["символика", "значение", "язык цветов"],
        author: "Елена Козлова",
        date: "2025-12-28",
        readTime: "9 мин",
        views: 1876,
        comments: 28,
        featured: false,
        emoji: "💬"
    },
    {
        id: 8,
        title: "Как продлить жизнь срезанным цветам: 7 проверенных способов",
        excerpt: "Эти простые, но эффективные методы помогут сохранить свежесть букета надолго.",
        content: "Полный текст статьи о продлении жизни цветов...",
        category: "care",
        tags: ["свежесть", "уход", "советы"],
        author: "Мария Сидорова",
        date: "2025-12-25",
        readTime: "6 мин",
        views: 2987,
        comments: 52,
        featured: false,
        emoji: "💐"
    },
    {
        id: 9,
        title: "Летние букеты: идеи композиций с полевыми цветами",
        excerpt: "Полевые цветы создают неповторимую атмосферу лета. Вдохновляйтесь нашими идеями.",
        content: "Полный текст статьи о летних букетах...",
        category: "ideas",
        tags: ["лето", "полевые цветы", "композиции"],
        author: "Ольга Смирнова",
        date: "2025-12-20",
        readTime: "5 мин",
        views: 1432,
        comments: 19,
        featured: false,
        emoji: "🌼"
    },
    {
        id: 10,
        title: "DIY: Создание флорариума - сад в стекле",
        excerpt: "Флорариумы - это модный тренд. Создайте свой собственный мини-сад в стеклянной емкости.",
        content: "Полный текст статьи о создании флорариума...",
        category: "diy",
        tags: ["флорариум", "своими руками", "декор"],
        author: "Дмитрий Волков",
        date: "2025-12-15",
        readTime: "12 мин",
        views: 1765,
        comments: 34,
        featured: false,
        emoji: "🌿"
    },
    {
        id: 11,
        title: "Орхидеи: секреты успешного выращивания дома",
        excerpt: "Орхидеи кажутся капризными, но при правильном уходе они будут радовать вас годами.",
        content: "Полный текст статьи о выращивании орхидей...",
        category: "care",
        tags: ["орхидеи", "уход", "выращивание"],
        author: "Анна Петрова",
        date: "2025-12-10",
        readTime: "11 мин",
        views: 2456,
        comments: 41,
        featured: false,
        emoji: "🌸"
    },
    {
        id: 12,
        title: "Корпоративные подарки: как выбрать цветы для офиса",
        excerpt: "Цветы для офиса требуют особого подхода. Узнайте, как сделать правильный выбор.",
        content: "Полный текст статьи о корпоративных цветах...",
        category: "etiquette",
        tags: ["корпоратив", "офис", "бизнес"],
        author: "Елена Козлова",
        date: "2025-12-05",
        readTime: "7 мин",
        views: 876,
        comments: 15,
        featured: false,
        emoji: "💼"
    }
];

// Blog State
let currentCategory = 'all';
let currentPage = 1;
const postsPerPage = 6;
let filteredPosts = [...blogPosts];
let searchQuery = '';

// Initialize Blog
function initializeBlog() {
    renderFeaturedPosts();
    renderBlogPosts();
    renderPagination();
}

// Render Featured Posts
function renderFeaturedPosts() {
    const featuredGrid = document.getElementById('featured-posts-grid');
    const featured = blogPosts.filter(post => post.featured);

    featuredGrid.innerHTML = featured.map(post => '<div class="featured-post-card" onclick="openBlogPost(' + post.id + ')">' +
        '<div class="featured-post-emoji">' + post.emoji + '</div>' +
        '<div class="featured-post-content">' +
        '<div class="blog-post-meta">' +
        '<span class="blog-post-category">' + getCategoryName(post.category) + '</span>' +
        '<span class="blog-post-date">' + formatDate(post.date) + '</span>' +
        '</div>' +
        '<h3 class="featured-post-title">' + post.title + '</h3>' +
        '<p class="featured-post-excerpt">' + post.excerpt + '</p>' +
        '<div class="blog-post-footer">' +
        '<span class="blog-post-author">✍️ ' + post.author + '</span>' +
        '<span class="blog-post-stats">' +
        '👁️ ' + post.views + ' · 💬 ' + post.comments +
        '</span>' +
        '</div>' +
        '</div>' +
        '</div>').join('');
}

// Render Blog Posts
function renderBlogPosts() {
    const postsGrid = document.getElementById('blog-posts-grid');
    const noResults = document.getElementById('blog-no-results');

    // Calculate pagination
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const postsToShow = filteredPosts.slice(startIndex, endIndex);

    if (postsToShow.length === 0) {
        postsGrid.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }

    postsGrid.style.display = 'grid';
    noResults.style.display = 'none';

    postsGrid.innerHTML = postsToShow.map(post => '<div class="blog-post-card" onclick="openBlogPost(' + post.id + ')">' +
        '<div class="blog-post-emoji">' + post.emoji + '</div>' +
        '<div class="blog-post-meta">' +
        '<span class="blog-post-category">' + getCategoryName(post.category) + '</span>' +
        '<span class="blog-post-read-time">⏱️ ' + post.readTime + '</span>' +
        '</div>' +
        '<h3 class="blog-post-title">' + post.title + '</h3>' +
        '<p class="blog-post-excerpt">' + post.excerpt + '</p>' +
        '<div class="blog-post-footer">' +
        '<div class="blog-post-author-info">' +
        '<span class="blog-post-author">✍️ ' + post.author + '</span>' +
        '<span class="blog-post-date">' + formatDate(post.date) + '</span>' +
        '</div>' +
        '<div class="blog-post-stats">' +
        '<span title="Просмотры">👁️ ' + post.views + '</span>' +
        '<span title="Комментарии">💬 ' + post.comments + '</span>' +
        '</div>' +
        '</div>' +
        '</div>').join('');
}

// Render Pagination
function renderPagination() {
    const pagination = document.getElementById('blog-pagination');
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let html = '';

    // Previous button
    if (currentPage > 1) {
        html += '<button class="pagination-btn" onclick="changePage(' + (currentPage - 1) + ')">← Назад</button>';
    }

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            html += '<button class="pagination-btn ' + (i === currentPage ? 'active' : '') + '" onclick="changePage(' + i + ')">' + i + '</button>';
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += '<span class="pagination-ellipsis">...</span>';
        }
    }

    // Next button
    if (currentPage < totalPages) {
        html += '<button class="pagination-btn" onclick="changePage(' + (currentPage + 1) + ')">Вперед →</button>';
    }

    pagination.innerHTML = html;
}

// Change Page
function changePage(page) {
    currentPage = page;
    renderBlogPosts();
    renderPagination();
    
    // Scroll to top of posts
    document.getElementById('blog-posts-grid').scrollIntoView({ behavior: 'smooth' });
}

// Filter by Category
function filterBlogByCategory(category) {
    currentCategory = category;
    currentPage = 1;

    // Update active button
    document.querySelectorAll('.blog-category-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        }
    });

    // Filter posts
    if (category === 'all') {
        filteredPosts = [...blogPosts];
    } else {
        filteredPosts = blogPosts.filter(post => post.category === category);
    }

    // Apply search if exists
    if (searchQuery) {
        applySearchFilter();
    }

    renderBlogPosts();
    renderPagination();
}

// Search Blog Posts
function searchBlogPosts() {
    const input = document.getElementById('blog-search-input');
    searchQuery = input.value.trim().toLowerCase();
    currentPage = 1;

    if (searchQuery === '') {
        filterBlogByCategory(currentCategory);
        return;
    }

    applySearchFilter();
    renderBlogPosts();
    renderPagination();
}

// Apply Search Filter
function applySearchFilter() {
    let posts = currentCategory === 'all' ? [...blogPosts] : blogPosts.filter(p => p.category === currentCategory);

    filteredPosts = posts.filter(post => {
        return post.title.toLowerCase().includes(searchQuery) ||
               post.excerpt.toLowerCase().includes(searchQuery) ||
               post.tags.some(tag => tag.toLowerCase().includes(searchQuery)) ||
               post.author.toLowerCase().includes(searchQuery);
    });
}

// Sort Blog Posts
function sortBlogPosts() {
    const sortValue = document.getElementById('blog-sort-select').value;
    currentPage = 1;

    switch(sortValue) {
        case 'date-desc':
            filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'date-asc':
            filteredPosts.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'views-desc':
            filteredPosts.sort((a, b) => b.views - a.views);
            break;
        case 'comments-desc':
            filteredPosts.sort((a, b) => b.comments - a.comments);
            break;
    }

    renderBlogPosts();
    renderPagination();
}

// Open Blog Post
function openBlogPost(postId) {
    const post = blogPosts.find(p => p.id === postId);
    if (!post) return;

    // Track view
    post.views++;

    // Show post detail modal
    showBlogPostModal(post);

    // Track with analytics
    if (typeof SEOAPI !== 'undefined') {
        SEOAPI.trackEvent('Blog', 'post_view', post.title);
    }
}

// Show Blog Post Modal
function showBlogPostModal(post) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = '<div class="modal-content blog-post-modal">' +
        '<button class="modal-close" onclick="this.closest(\'.modal\').remove()">✕</button>' +
        '<div class="blog-post-header">' +
        '<div class="blog-post-emoji-large">' + post.emoji + '</div>' +
        '<div class="blog-post-meta">' +
        '<span class="blog-post-category">' + getCategoryName(post.category) + '</span>' +
        '<span class="blog-post-date">' + formatDate(post.date) + '</span>' +
        '<span class="blog-post-read-time">⏱️ ' + post.readTime + '</span>' +
        '</div>' +
        '<h1 class="blog-post-modal-title">' + post.title + '</h1>' +
        '<div class="blog-post-author-section">' +
        '<span class="blog-post-author">✍️ Автор: ' + post.author + '</span>' +
        '<div class="blog-post-stats">' +
        '<span>👁️ ' + post.views + '</span>' +
        '<span>💬 ' + post.comments + '</span>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="blog-post-content-section">' +
        '<p class="blog-post-lead">' + post.excerpt + '</p>' +
        '<div class="blog-post-full-content">' +
        post.content +
        '<p>Это демонстрационная статья. В реальном приложении здесь был бы полный текст со всеми деталями, изображениями и полезными советами.</p>' +
        '</div>' +
        '<div class="blog-post-tags">' +
        post.tags.map(tag => '<span class="blog-tag">#' + tag + '</span>').join('') +
        '</div>' +
        '</div>' +
        '<div class="blog-post-actions">' +
        '<button class="btn-secondary" onclick="shareBlogPost(' + post.id + ')">' +
        '📤 Поделиться' +
        '</button>' +
        '<button class="btn-secondary" onclick="saveBlogPost(' + post.id + ')">' +
        '🔖 Сохранить' +
        '</button>' +
        '</div>' +
        '<div class="blog-post-comments">' +
        '<h3>💬 Комментарии (' + post.comments + ')</h3>' +
        '<p>Раздел комментариев будет реализован в следующей версии.</p>' +
        '</div>' +
        '</div>';

    document.body.appendChild(modal);

    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Share Blog Post
function shareBlogPost(postId) {
    const post = blogPosts.find(p => p.id === postId);
    if (!post) return;

    const shareUrl = window.location.origin + '/blog.html?post=' + postId;
    const shareText = post.title + ' - Цветочный Рай';

    if (navigator.share) {
        navigator.share({
            title: shareText,
            url: shareUrl
        }).catch(() => {});
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareUrl);
        showNotification('Ссылка скопирована в буфер обмена');
    }

    // Track share
    if (typeof SEOAPI !== 'undefined') {
        SEOAPI.trackEvent('Blog', 'share', post.title);
    }
}

// Save Blog Post
function saveBlogPost(postId) {
    let savedPosts = JSON.parse(localStorage.getItem('savedBlogPosts') || '[]');
    
    if (!savedPosts.includes(postId)) {
        savedPosts.push(postId);
        localStorage.setItem('savedBlogPosts', JSON.stringify(savedPosts));
        showNotification('Статья сохранена!');
    } else {
        showNotification('Статья уже сохранена');
    }
}

// Subscribe to Blog Newsletter
function subscribeToBlogNewsletter(event) {
    event.preventDefault();
    
    const email = event.target.querySelector('input[type="email"]').value;
    
    // Here you would send email to backend
    console.log('Newsletter subscription:', email);
    
    showNotification('Спасибо за подписку! Проверьте почту для подтверждения.');
    event.target.reset();

    // Track subscription
    if (typeof SEOAPI !== 'undefined') {
        SEOAPI.trackEvent('Blog', 'newsletter_subscribe', email);
    }

    return false;
}

// Get Category Name
function getCategoryName(category) {
    const categories = {
        'care': '🌿 Уход',
        'ideas': '💡 Идеи',
        'etiquette': '🎭 Этикет',
        'news': '📰 Новости',
        'diy': '✂️ Своими руками'
    };
    return categories[category] || category;
}

// Format Date
function formatDate(dateString) {
    const date = new Date(dateString);
    const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    return date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
}

// Export API
window.BlogAPI = {
    getPosts: () => blogPosts,
    getPost: (id) => blogPosts.find(p => p.id === id),
    searchPosts: searchBlogPosts,
    filterByCategory: filterBlogByCategory
};
