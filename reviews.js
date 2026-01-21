/**
 * Reviews and Ratings System
 */

// Add review to flower
function addReview(flowerId, reviewData) {
    const reviews = JSON.parse(localStorage.getItem('reviews') || '{}');

    if (!reviews[flowerId]) {
        reviews[flowerId] = [];
    }

    const review = {
        id: 'review_' + Date.now(),
        flowerId: flowerId,
        author: reviewData.author,
        email: reviewData.email,
        rating: reviewData.rating,
        text: reviewData.text,
        photos: reviewData.photos || [],
        date: new Date().toISOString(),
        likes: 0,
        status: 'approved'
    };

    reviews[flowerId].push(review);
    localStorage.setItem('reviews', JSON.stringify(reviews));

    updateFlowerRating(flowerId);

    return review;
}

// Get reviews for flower
function getFlowerReviews(flowerId) {
    const reviews = JSON.parse(localStorage.getItem('reviews') || '{}');
    return (reviews[flowerId] || [])
        .filter(r => r.status === 'approved')
        .sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Calculate average rating
function getAverageRating(flowerId) {
    const reviews = getFlowerReviews(flowerId);
    if (reviews.length === 0) return 0;

    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
}

// Update flower rating
function updateFlowerRating(flowerId) {
    const flower = flowers.find(f => f.id === flowerId);
    if (flower) {
        flower.rating = parseFloat(getAverageRating(flowerId));
        flower.reviewCount = getFlowerReviews(flowerId).length;
    }
}

// Render stars
function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return '⭐'.repeat(fullStars) +
           (hasHalfStar ? '✨' : '') +
           '☆'.repeat(emptyStars);
}

// Show reviews modal
function showReviewsModal(flowerId) {
    const flower = flowers.find(f => f.id === flowerId);
    if (!flower) return;

    const reviews = getFlowerReviews(flowerId);
    const avgRating = getAverageRating(flowerId);

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'reviews-modal';

    const reviewsHTML = reviews.length > 0
        ? reviews.map(r => renderReview(r)).join('')
        : '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">Отзывов пока нет. Будьте первым!</p>';

    modal.innerHTML = `
        <div class="modal-content reviews-modal-content">
            <div class="modal-header">
                <h2>Отзывы: ${flower.name}</h2>
                <span class="close" onclick="closeReviewsModal()">&times;</span>
            </div>
            <div class="reviews-container">
                <div class="reviews-summary">
                    <div class="rating-overview">
                        <div class="rating-number">${avgRating}</div>
                        <div class="rating-stars">${renderStars(parseFloat(avgRating))}</div>
                        <div class="rating-count">${reviews.length} отзывов</div>
                    </div>
                    <button class="btn-primary" onclick="showAddReviewForm(${flowerId})">
                        Написать отзыв
                    </button>
                </div>
                <div class="reviews-list" id="reviews-list">
                    ${reviewsHTML}
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

// Render single review
function renderReview(review) {
    const date = new Date(review.date).toLocaleDateString('ru-RU');

    return `
        <div class="review-item" data-review-id="${review.id}">
            <div class="review-header">
                <div class="review-author">
                    <div class="author-avatar">${review.author.charAt(0).toUpperCase()}</div>
                    <div>
                        <div class="author-name">${review.author}</div>
                        <div class="review-date">${date}</div>
                    </div>
                </div>
                <div class="review-rating">${renderStars(review.rating)}</div>
            </div>
            <div class="review-text">${review.text}</div>
            <div class="review-actions">
                <button class="btn-link" onclick="likeReview('${review.id}', ${review.flowerId})">
                    👍 Полезно (${review.likes})
                </button>
            </div>
        </div>
    `;
}

// Show add review form
function showAddReviewForm(flowerId) {
    const modal = document.getElementById('reviews-modal');
    const container = modal.querySelector('.reviews-container');

    container.innerHTML = `
        <button class="btn-secondary" onclick="showReviewsModal(${flowerId})" style="margin-bottom: 1rem;">
            ← Назад к отзывам
        </button>
        <form class="review-form" onsubmit="submitReview(event, ${flowerId})">
            <h3>Оставить отзыв</h3>

            <div class="form-group">
                <label>Ваше имя *</label>
                <input type="text" id="review-author" required>
            </div>

            <div class="form-group">
                <label>Email *</label>
                <input type="email" id="review-email" required>
            </div>

            <div class="form-group">
                <label>Оценка *</label>
                <div class="rating-input" id="rating-input">
                    <input type="radio" name="rating" value="5" id="star5" required>
                    <label for="star5">⭐</label>
                    <input type="radio" name="rating" value="4" id="star4">
                    <label for="star4">⭐</label>
                    <input type="radio" name="rating" value="3" id="star3">
                    <label for="star3">⭐</label>
                    <input type="radio" name="rating" value="2" id="star2">
                    <label for="star2">⭐</label>
                    <input type="radio" name="rating" value="1" id="star1">
                    <label for="star1">⭐</label>
                </div>
            </div>

            <div class="form-group">
                <label>Ваш отзыв *</label>
                <textarea id="review-text" rows="5" required placeholder="Расскажите о вашем опыте покупки этого букета..."></textarea>
            </div>

            <button type="submit" class="btn-primary">Отправить отзыв</button>
        </form>
    `;
}

// Submit review
function submitReview(event, flowerId) {
    event.preventDefault();

    const reviewData = {
        author: document.getElementById('review-author').value,
        email: document.getElementById('review-email').value,
        rating: parseInt(document.querySelector('input[name="rating"]:checked').value),
        text: document.getElementById('review-text').value
    };

    addReview(flowerId, reviewData);

    alert('Спасибо за отзыв! Он опубликован.');
    showReviewsModal(flowerId);
}

// Close reviews modal
function closeReviewsModal() {
    const modal = document.getElementById('reviews-modal');
    if (modal) {
        modal.remove();
    }
}

// Like review
function likeReview(reviewId, flowerId) {
    const reviews = JSON.parse(localStorage.getItem('reviews') || '{}');

    if (reviews[flowerId]) {
        const review = reviews[flowerId].find(r => r.id === reviewId);
        if (review) {
            review.likes = (review.likes || 0) + 1;
            localStorage.setItem('reviews', JSON.stringify(reviews));

            // Update button
            const reviewItem = document.querySelector(`[data-review-id="${reviewId}"]`);
            if (reviewItem) {
                const button = reviewItem.querySelector('.btn-link');
                button.textContent = `👍 Полезно (${review.likes})`;
            }
        }
    }
}

// Initialize reviews
document.addEventListener('DOMContentLoaded', () => {
    if (typeof flowers !== 'undefined') {
        flowers.forEach(flower => {
            updateFlowerRating(flower.id);
        });
    }
});
