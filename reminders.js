/**
 * Reminders Calendar System
 * Helps users remember important dates (birthdays, anniversaries, etc.)
 */

// Reminder categories
const REMINDER_CATEGORIES = {
    birthday: { name: 'День рождения', icon: '🎂', color: '#ff6b9d' },
    anniversary: { name: 'Годовщина', icon: '💕', color: '#e83e8c' },
    holiday: { name: 'Праздник', icon: '🎉', color: '#667eea' },
    other: { name: 'Другое', icon: '📅', color: '#764ba2' }
};

// Reminder frequency options
const REMINDER_FREQUENCY = {
    once: 'Один раз',
    yearly: 'Каждый год',
    monthly: 'Каждый месяц'
};

// Notification timing options (days before event)
const NOTIFICATION_TIMING = [1, 3, 7, 14];

// Get user's reminders
function getReminders(userId) {
    const reminders = JSON.parse(localStorage.getItem('reminders') || '{}');

    if (!reminders[userId]) {
        reminders[userId] = [];
        localStorage.setItem('reminders', JSON.stringify(reminders));
    }

    return reminders[userId];
}

// Save reminders
function saveReminders(userId, remindersData) {
    const reminders = JSON.parse(localStorage.getItem('reminders') || '{}');
    reminders[userId] = remindersData;
    localStorage.setItem('reminders', JSON.stringify(reminders));
}

// Add new reminder
function addReminder(userId, reminderData) {
    const reminders = getReminders(userId);

    const reminder = {
        id: 'reminder_' + Date.now(),
        title: reminderData.title,
        date: reminderData.date,
        category: reminderData.category,
        frequency: reminderData.frequency || 'once',
        notifyBefore: reminderData.notifyBefore || 3,
        recipientName: reminderData.recipientName || '',
        notes: reminderData.notes || '',
        createdAt: new Date().toISOString(),
        active: true
    };

    reminders.push(reminder);
    saveReminders(userId, reminders);

    return reminder;
}

// Update reminder
function updateReminder(userId, reminderId, updates) {
    const reminders = getReminders(userId);
    const index = reminders.findIndex(r => r.id === reminderId);

    if (index !== -1) {
        reminders[index] = { ...reminders[index], ...updates };
        saveReminders(userId, reminders);
        return reminders[index];
    }

    return null;
}

// Delete reminder
function deleteReminder(userId, reminderId) {
    const reminders = getReminders(userId);
    const filtered = reminders.filter(r => r.id !== reminderId);
    saveReminders(userId, filtered);
}

// Get upcoming reminders (within next 30 days)
function getUpcomingReminders(userId) {
    const reminders = getReminders(userId);
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    return reminders
        .filter(r => r.active)
        .map(reminder => {
            const nextOccurrence = getNextOccurrence(reminder.date, reminder.frequency);
            const daysUntil = Math.ceil((nextOccurrence - now) / (1000 * 60 * 60 * 24));

            return {
                ...reminder,
                nextDate: nextOccurrence,
                daysUntil: daysUntil
            };
        })
        .filter(r => r.nextDate <= thirtyDaysFromNow)
        .sort((a, b) => a.nextDate - b.nextDate);
}

// Calculate next occurrence based on frequency
function getNextOccurrence(dateString, frequency) {
    const reminderDate = new Date(dateString);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (frequency === 'once') {
        return reminderDate;
    }

    if (frequency === 'yearly') {
        const nextDate = new Date(reminderDate);
        nextDate.setFullYear(now.getFullYear());

        if (nextDate < now) {
            nextDate.setFullYear(now.getFullYear() + 1);
        }

        return nextDate;
    }

    if (frequency === 'monthly') {
        const nextDate = new Date(reminderDate);
        nextDate.setMonth(now.getMonth());
        nextDate.setFullYear(now.getFullYear());

        if (nextDate < now) {
            nextDate.setMonth(now.getMonth() + 1);
        }

        return nextDate;
    }

    return reminderDate;
}

// Check for reminders that need notification
function checkReminders(userId) {
    const reminders = getReminders(userId);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const needsNotification = [];

    reminders.forEach(reminder => {
        if (!reminder.active) return;

        const nextOccurrence = getNextOccurrence(reminder.date, reminder.frequency);
        const daysUntil = Math.ceil((nextOccurrence - now) / (1000 * 60 * 60 * 24));

        if (daysUntil === reminder.notifyBefore) {
            needsNotification.push({
                ...reminder,
                nextDate: nextOccurrence,
                daysUntil: daysUntil
            });
        }
    });

    return needsNotification;
}

// Render reminders calendar
function renderRemindersCalendar(userId) {
    const container = document.getElementById('reminders-calendar');
    if (!container) return;

    const reminders = getReminders(userId);
    const upcoming = getUpcomingReminders(userId);

    container.innerHTML = `
        <div class="reminders-header">
            <h2>Календарь напоминаний</h2>
            <button class="btn-primary" onclick="showAddReminderForm()">+ Добавить напоминание</button>
        </div>

        <div class="reminders-content">
            <!-- Upcoming Reminders -->
            <div class="upcoming-reminders">
                <h3>Ближайшие события</h3>
                ${upcoming.length > 0 ? `
                    <div class="upcoming-list">
                        ${upcoming.map(reminder => renderUpcomingReminder(reminder)).join('')}
                    </div>
                ` : `
                    <div class="empty-state">
                        <div class="empty-state-icon">📅</div>
                        <p>Нет предстоящих событий в ближайшие 30 дней</p>
                    </div>
                `}
            </div>

            <!-- All Reminders -->
            <div class="all-reminders">
                <h3>Все напоминания</h3>
                ${reminders.length > 0 ? `
                    <div class="reminders-list">
                        ${reminders.map(reminder => renderReminderCard(reminder)).join('')}
                    </div>
                ` : `
                    <div class="empty-state">
                        <div class="empty-state-icon">📝</div>
                        <p>У вас пока нет напоминаний</p>
                    </div>
                `}
            </div>
        </div>
    `;
}

// Render upcoming reminder
function renderUpcomingReminder(reminder) {
    const category = REMINDER_CATEGORIES[reminder.category];
    const dateStr = reminder.nextDate.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long'
    });

    let urgencyClass = '';
    if (reminder.daysUntil <= 1) urgencyClass = 'urgent';
    else if (reminder.daysUntil <= 7) urgencyClass = 'soon';

    return `
        <div class="upcoming-reminder ${urgencyClass}">
            <div class="reminder-icon" style="background: ${category.color}">
                ${category.icon}
            </div>
            <div class="reminder-info">
                <div class="reminder-title">${reminder.title}</div>
                <div class="reminder-date">${dateStr}</div>
                ${reminder.recipientName ? `<div class="reminder-recipient">Для: ${reminder.recipientName}</div>` : ''}
            </div>
            <div class="reminder-countdown ${urgencyClass}">
                ${reminder.daysUntil === 0 ? 'Сегодня!' :
                  reminder.daysUntil === 1 ? 'Завтра' :
                  `Через ${reminder.daysUntil} дн.`}
            </div>
        </div>
    `;
}

// Render reminder card
function renderReminderCard(reminder) {
    const category = REMINDER_CATEGORIES[reminder.category];
    const dateStr = new Date(reminder.date).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    return `
        <div class="reminder-card">
            <div class="reminder-card-header">
                <div class="reminder-category" style="background: ${category.color}">
                    ${category.icon} ${category.name}
                </div>
                <div class="reminder-actions">
                    <button onclick="editReminder('${reminder.id}')" title="Редактировать">✏️</button>
                    <button onclick="deleteReminderById('${reminder.id}')" title="Удалить">🗑️</button>
                </div>
            </div>
            <div class="reminder-card-body">
                <h4>${reminder.title}</h4>
                ${reminder.recipientName ? `<p class="recipient">Для: ${reminder.recipientName}</p>` : ''}
                <p class="date">📅 ${dateStr}</p>
                <p class="frequency">🔄 ${REMINDER_FREQUENCY[reminder.frequency]}</p>
                <p class="notify">🔔 Напомнить за ${reminder.notifyBefore} дн.</p>
                ${reminder.notes ? `<p class="notes">${reminder.notes}</p>` : ''}
            </div>
        </div>
    `;
}

// Show add reminder form
function showAddReminderForm() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'reminder-modal';

    modal.innerHTML = `
        <div class="modal-content reminder-modal-content">
            <div class="modal-header">
                <h2>Добавить напоминание</h2>
                <span class="close" onclick="closeReminderModal()">&times;</span>
            </div>
            <form class="reminder-form" onsubmit="submitReminder(event)">
                <div class="form-group">
                    <label>Название события *</label>
                    <input type="text" id="reminder-title" required placeholder="Например: День рождения мамы">
                </div>

                <div class="form-group">
                    <label>Категория *</label>
                    <select id="reminder-category" required>
                        ${Object.entries(REMINDER_CATEGORIES).map(([key, cat]) => `
                            <option value="${key}">${cat.icon} ${cat.name}</option>
                        `).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label>Дата *</label>
                    <input type="date" id="reminder-date" required>
                </div>

                <div class="form-group">
                    <label>Имя получателя</label>
                    <input type="text" id="reminder-recipient" placeholder="Необязательно">
                </div>

                <div class="form-group">
                    <label>Повторение</label>
                    <select id="reminder-frequency">
                        ${Object.entries(REMINDER_FREQUENCY).map(([key, label]) => `
                            <option value="${key}">${label}</option>
                        `).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label>Напомнить заранее</label>
                    <select id="reminder-notify">
                        ${NOTIFICATION_TIMING.map(days => `
                            <option value="${days}" ${days === 3 ? 'selected' : ''}>За ${days} дн.</option>
                        `).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label>Заметки</label>
                    <textarea id="reminder-notes" rows="3" placeholder="Дополнительная информация..."></textarea>
                </div>

                <button type="submit" class="btn-primary">Сохранить напоминание</button>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
}

// Submit reminder
function submitReminder(event) {
    event.preventDefault();

    if (!AuthAPI || !AuthAPI.isLoggedIn()) {
        alert('Необходимо войти в аккаунт');
        return;
    }

    const user = AuthAPI.getCurrentUser();

    const reminderData = {
        title: document.getElementById('reminder-title').value,
        category: document.getElementById('reminder-category').value,
        date: document.getElementById('reminder-date').value,
        recipientName: document.getElementById('reminder-recipient').value,
        frequency: document.getElementById('reminder-frequency').value,
        notifyBefore: parseInt(document.getElementById('reminder-notify').value),
        notes: document.getElementById('reminder-notes').value
    };

    addReminder(user.id, reminderData);
    renderRemindersCalendar(user.id);
    closeReminderModal();

    alert('Напоминание успешно добавлено!');
}

// Delete reminder by ID
function deleteReminderById(reminderId) {
    if (!confirm('Удалить это напоминание?')) return;

    const user = AuthAPI.getCurrentUser();
    deleteReminder(user.id, reminderId);
    renderRemindersCalendar(user.id);
}

// Close reminder modal
function closeReminderModal() {
    const modal = document.getElementById('reminder-modal');
    if (modal) {
        modal.remove();
    }
}

// Check and show notification for upcoming reminders
function checkAndNotifyReminders() {
    if (!AuthAPI || !AuthAPI.isLoggedIn()) return;

    const user = AuthAPI.getCurrentUser();
    const needsNotification = checkReminders(user.id);

    if (needsNotification.length > 0) {
        needsNotification.forEach(reminder => {
            const category = REMINDER_CATEGORIES[reminder.category];
            const message = `${category.icon} Напоминание: "${reminder.title}" через ${reminder.daysUntil} дн.`;
            showReminderNotification(message);
        });
    }
}

// Show reminder notification
function showReminderNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'reminder-notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 100);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// API
window.RemindersAPI = {
    addReminder,
    updateReminder,
    deleteReminder,
    getReminders,
    getUpcomingReminders,
    renderRemindersCalendar,
    checkReminders,
    checkAndNotifyReminders
};

// Check reminders on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAndNotifyReminders();
});
