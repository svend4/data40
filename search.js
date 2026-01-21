/**
 * Advanced Search System with Autocomplete
 */

// Search configuration
const SEARCH_CONFIG = {
    minQueryLength: 2,
    maxResults: 10,
    maxHistoryItems: 10,
    debounceDelay: 300
};

// Search state
let searchTimeout = null;
let searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');

// Initialize search
function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    if (searchInput) {
        searchInput.addEventListener('input', handleSearchInput);
        searchInput.addEventListener('focus', showSearchDropdown);
        searchInput.addEventListener('keydown', handleSearchKeydown);
    }

    if (searchButton) {
        searchButton.addEventListener('click', performSearch);
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            hideSearchDropdown();
        }
    });
}

// Handle search input with debounce
function handleSearchInput(event) {
    const query = event.target.value.trim();

    clearTimeout(searchTimeout);

    if (query.length < SEARCH_CONFIG.minQueryLength) {
        hideSearchDropdown();
        return;
    }

    // Debounce search
    searchTimeout = setTimeout(() => {
        performAutoComplete(query);
    }, SEARCH_CONFIG.debounceDelay);
}

// Perform autocomplete search
function performAutoComplete(query) {
    const results = searchFlowers(query);
    const categories = getMatchingCategories(query);
    const history = getRelevantHistory(query);

    showSearchResults(results, categories, history, query);
}

// Search flowers
function searchFlowers(query) {
    if (!window.flowers) return [];

    const lowerQuery = query.toLowerCase();

    return window.flowers
        .filter(flower => {
            return (
                flower.name.toLowerCase().includes(lowerQuery) ||
                flower.shortDescription?.toLowerCase().includes(lowerQuery) ||
                flower.fullDescription?.toLowerCase().includes(lowerQuery) ||
                flower.type?.toLowerCase().includes(lowerQuery)
            );
        })
        .slice(0, SEARCH_CONFIG.maxResults)
        .map(flower => ({
            ...flower,
            relevance: calculateRelevance(flower, lowerQuery)
        }))
        .sort((a, b) => b.relevance - a.relevance);
}

// Calculate search relevance
function calculateRelevance(flower, query) {
    let score = 0;

    // Exact name match
    if (flower.name.toLowerCase() === query) score += 100;

    // Name starts with query
    if (flower.name.toLowerCase().startsWith(query)) score += 50;

    // Name contains query
    if (flower.name.toLowerCase().includes(query)) score += 25;

    // Description contains query
    if (flower.shortDescription?.toLowerCase().includes(query)) score += 10;

    // Type matches
    if (flower.type?.toLowerCase().includes(query)) score += 15;

    // Popular items boost
    if (flower.reviewCount && flower.reviewCount > 50) score += 5;

    // High rated items boost
    if (flower.rating && flower.rating >= 4.5) score += 3;

    return score;
}

// Get matching categories
function getMatchingCategories(query) {
    const categories = {
        'roses': { name: 'Розы', emoji: '🌹', count: 0 },
        'tulips': { name: 'Тюльпаны', emoji: '🌷', count: 0 },
        'lilies': { name: 'Лилии', emoji: '🌺', count: 0 },
        'orchids': { name: 'Орхидеи', emoji: '🌸', count: 0 },
        'mixed': { name: 'Смешанные', emoji: '💐', count: 0 }
    };

    const lowerQuery = query.toLowerCase();
    const matches = [];

    Object.entries(categories).forEach(([type, data]) => {
        if (data.name.toLowerCase().includes(lowerQuery) || type.includes(lowerQuery)) {
            // Count flowers in this category
            const count = window.flowers?.filter(f => f.type === type).length || 0;
            matches.push({ type, ...data, count });
        }
    });

    return matches;
}

// Get relevant history
function getRelevantHistory(query) {
    if (!query) return searchHistory.slice(0, 5);

    const lowerQuery = query.toLowerCase();

    return searchHistory
        .filter(item => item.toLowerCase().includes(lowerQuery))
        .slice(0, 5);
}

// Show search results
function showSearchResults(results, categories, history, query) {
    let dropdown = document.getElementById('search-dropdown');

    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.id = 'search-dropdown';
        dropdown.className = 'search-dropdown';
        document.querySelector('.search-container').appendChild(dropdown);
    }

    let html = '';

    // Search history
    if (history.length > 0 && query.length < 3) {
        html += '<div class="search-section">';
        html += '<div class="search-section-title">Недавние запросы</div>';
        history.forEach(item => {
            html += `
                <div class="search-item history-item" onclick="selectSearchQuery('${escapeHtml(item)}')">
                    <span class="search-icon">🕐</span>
                    <span class="search-text">${highlightQuery(item, query)}</span>
                    <button class="remove-history" onclick="event.stopPropagation(); removeFromHistory('${escapeHtml(item)}')">✕</button>
                </div>
            `;
        });
        html += '</div>';
    }

    // Categories
    if (categories.length > 0) {
        html += '<div class="search-section">';
        html += '<div class="search-section-title">Категории</div>';
        categories.forEach(category => {
            html += `
                <div class="search-item category-item" onclick="searchByCategory('${category.type}')">
                    <span class="search-icon">${category.emoji}</span>
                    <span class="search-text">${category.name}</span>
                    <span class="search-count">${category.count}</span>
                </div>
            `;
        });
        html += '</div>';
    }

    // Product results
    if (results.length > 0) {
        html += '<div class="search-section">';
        html += '<div class="search-section-title">Букеты</div>';
        results.forEach(flower => {
            html += `
                <div class="search-item product-item" onclick="selectSearchResult(${flower.id})">
                    <span class="search-icon">${flower.emoji}</span>
                    <div class="search-product-info">
                        <div class="search-product-name">${highlightQuery(flower.name, query)}</div>
                        <div class="search-product-meta">
                            <span class="search-price">${flower.price} ₽</span>
                            ${flower.rating ? `<span class="search-rating">⭐ ${flower.rating}</span>` : ''}
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
    }

    // No results
    if (results.length === 0 && categories.length === 0 && history.length === 0) {
        html = `
            <div class="search-section">
                <div class="search-no-results">
                    <div class="no-results-icon">🔍</div>
                    <div class="no-results-text">Ничего не найдено</div>
                    <div class="no-results-hint">Попробуйте изменить запрос</div>
                </div>
            </div>
        `;
    }

    dropdown.innerHTML = html;
    dropdown.classList.add('active');
}

// Show search dropdown
function showSearchDropdown() {
    const dropdown = document.getElementById('search-dropdown');
    if (dropdown && dropdown.innerHTML) {
        dropdown.classList.add('active');
    } else {
        // Show history if no query
        performAutoComplete('');
    }
}

// Hide search dropdown
function hideSearchDropdown() {
    const dropdown = document.getElementById('search-dropdown');
    if (dropdown) {
        dropdown.classList.remove('active');
    }
}

// Handle keyboard navigation
function handleSearchKeydown(event) {
    const dropdown = document.getElementById('search-dropdown');
    if (!dropdown || !dropdown.classList.contains('active')) return;

    const items = dropdown.querySelectorAll('.search-item');
    const activeItem = dropdown.querySelector('.search-item.active');
    let currentIndex = activeItem ? Array.from(items).indexOf(activeItem) : -1;

    switch (event.key) {
        case 'ArrowDown':
            event.preventDefault();
            currentIndex = Math.min(currentIndex + 1, items.length - 1);
            break;
        case 'ArrowUp':
            event.preventDefault();
            currentIndex = Math.max(currentIndex - 1, 0);
            break;
        case 'Enter':
            event.preventDefault();
            if (activeItem) {
                activeItem.click();
            } else {
                performSearch();
            }
            return;
        case 'Escape':
            hideSearchDropdown();
            return;
        default:
            return;
    }

    // Update active item
    items.forEach((item, index) => {
        item.classList.toggle('active', index === currentIndex);
    });

    // Scroll into view
    if (items[currentIndex]) {
        items[currentIndex].scrollIntoView({ block: 'nearest' });
    }
}

// Select search result
function selectSearchResult(flowerId) {
    const flower = window.flowers?.find(f => f.id === flowerId);
    if (!flower) return;

    // Add to history
    addToSearchHistory(flower.name);

    // Hide dropdown
    hideSearchDropdown();

    // Show flower details
    if (typeof showFlowerDetails === 'function') {
        showFlowerDetails(flowerId);
    }

    // Clear search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = '';
    }

    // Track search
    if (typeof SEOAPI !== 'undefined') {
        SEOAPI.trackEvent('Search', 'select_result', flower.name);
    }
}

// Select search query
function selectSearchQuery(query) {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = query;
        performSearch();
    }
}

// Search by category
function searchByCategory(type) {
    addToSearchHistory(`Категория: ${type}`);
    hideSearchDropdown();

    // Filter catalog by type
    if (typeof filterCatalog === 'function') {
        filterCatalog(type);
    }

    // Scroll to catalog
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });

    // Track category search
    if (typeof SEOAPI !== 'undefined') {
        SEOAPI.trackEvent('Search', 'category', type);
    }
}

// Perform search
function performSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    const query = searchInput.value.trim();
    if (!query) return;

    // Add to history
    addToSearchHistory(query);

    // Hide dropdown
    hideSearchDropdown();

    // Perform search
    const results = searchFlowers(query);

    if (results.length > 0) {
        // Show results
        displaySearchResults(results, query);
    } else {
        alert(`По запросу "${query}" ничего не найдено. Попробуйте изменить запрос.`);
    }

    // Track search
    if (typeof SEOAPI !== 'undefined') {
        SEOAPI.trackEvent('Search', 'perform', query, results.length);
    }
}

// Display search results
function displaySearchResults(results, query) {
    // Scroll to catalog
    const catalog = document.getElementById('catalog');
    if (catalog) {
        catalog.scrollIntoView({ behavior: 'smooth' });
    }

    // Filter flowers display
    if (typeof renderFilteredFlowers === 'function') {
        renderFilteredFlowers(results);
    }

    // Show results message
    showNotification(`Найдено ${results.length} ${getPluralForm(results.length, 'букет', 'букета', 'букетов')} по запросу "${query}"`);
}

// Add to search history
function addToSearchHistory(query) {
    // Remove if already exists
    searchHistory = searchHistory.filter(item => item !== query);

    // Add to beginning
    searchHistory.unshift(query);

    // Limit history size
    if (searchHistory.length > SEARCH_CONFIG.maxHistoryItems) {
        searchHistory = searchHistory.slice(0, SEARCH_CONFIG.maxHistoryItems);
    }

    // Save to localStorage
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
}

// Remove from history
function removeFromHistory(query) {
    searchHistory = searchHistory.filter(item => item !== query);
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));

    // Refresh dropdown
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        performAutoComplete(searchInput.value);
    }
}

// Clear search history
function clearSearchHistory() {
    searchHistory = [];
    localStorage.removeItem('searchHistory');
    hideSearchDropdown();
}

// Highlight query in text
function highlightQuery(text, query) {
    if (!query) return text;

    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Escape regex
function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Get plural form
function getPluralForm(n, form1, form2, form5) {
    n = Math.abs(n) % 100;
    const n1 = n % 10;
    if (n > 10 && n < 20) return form5;
    if (n1 > 1 && n1 < 5) return form2;
    if (n1 === 1) return form1;
    return form5;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeSearch();
});

// Export API
window.SearchAPI = {
    searchFlowers,
    performSearch,
    clearSearchHistory,
    searchHistory: () => searchHistory
};
