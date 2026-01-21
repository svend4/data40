/**
 * Live Chat Support System
 * Simulated chat with auto-responses for demo
 */

// Chat state
let chatState = {
    isOpen: false,
    messages: [],
    isTyping: false,
    userName: 'Гость',
    operatorName: 'Мария',
    operatorStatus: 'online'
};

// Auto-response templates
const AUTO_RESPONSES = {
    greeting: [
        'Здравствуйте! Я Мария, ваш персональный консультант. Чем могу помочь?',
        'Добрый день! Рада приветствовать вас в Цветочном Раю. Как я могу вам помочь?'
    ],
    delivery: [
        'Доставка осуществляется по всему городу. Стоимость зависит от типа доставки: обычная (300₽), экспресс (600₽), самовывоз (бесплатно).',
        'Мы доставляем цветы 7 дней в неделю с 9:00 до 21:00. Экспресс-доставка - в течение 2 часов!'
    ],
    payment: [
        'Мы принимаем оплату картой, наличными курьеру и электронными кошельками. Оплата полностью безопасна.',
        'Вы можете оплатить заказ онлайн на сайте или наличными/картой при получении.'
    ],
    bouquet: [
        'У нас большой выбор букетов на любой вкус и бюджет. Рекомендую посмотреть раздел "Каталог" или воспользоваться конструктором букетов.',
        'Если нужна помощь с выбором букета, расскажите для какого повода и на какой бюджет рассчитываете?'
    ],
    subscription: [
        'Подписка на цветы - отличный выбор! Вы получаете скидку до 10% и регулярные доставки свежих букетов.',
        'С подпиской вы экономите время и деньги. Выберите частоту доставки и тип букета в личном кабинете.'
    ],
    loyalty: [
        'Наша программа лояльности имеет 3 уровня: Бронза, Серебро и Золото. Вы получаете от 5% до 10% баллами с каждой покупки!',
        'Баллы можно использовать для оплаты следующих заказов. Чем больше покупаете, тем выше ваш статус!'
    ],
    default: [
        'Спасибо за вопрос! Наш специалист свяжется с вами в ближайшее время.',
        'Интересный вопрос! Позвольте уточнить информацию и я вернусь с ответом.',
        'Я передам ваш вопрос специалисту. Также вы можете позвонить нам по телефону +7 (495) 123-45-67.'
    ]
};

// Keywords for auto-response matching
const KEYWORDS = {
    delivery: ['доставка', 'доставить', 'привезти', 'курьер', 'экспресс'],
    payment: ['оплат', 'платить', 'карт', 'наличн', 'деньги', 'стоимость'],
    bouquet: ['букет', 'цветы', 'розы', 'тюльпан', 'выбрать', 'подобрать', 'какой'],
    subscription: ['подписк', 'регулярн', 'каждый месяц', 'каждую неделю'],
    loyalty: ['баллы', 'бонус', 'скидк', 'лояльност', 'уровень', 'статус']
};

// Initialize chat widget
function initializeChatWidget() {
    // Check if user is logged in
    if (typeof AuthAPI !== 'undefined' && AuthAPI.isLoggedIn()) {
        const user = AuthAPI.getCurrentUser();
        chatState.userName = user.name;
    }

    // Create chat widget HTML
    const chatWidget = document.createElement('div');
    chatWidget.id = 'chat-widget';
    chatWidget.className = 'chat-widget';

    chatWidget.innerHTML = `
        <!-- Chat Button -->
        <button class="chat-toggle" id="chat-toggle" onclick="toggleChat()">
            <span class="chat-icon">💬</span>
            <span class="chat-notification" id="chat-notification" style="display: none;">1</span>
        </button>

        <!-- Chat Window -->
        <div class="chat-window" id="chat-window">
            <div class="chat-header">
                <div class="operator-info">
                    <div class="operator-avatar">👩‍💼</div>
                    <div class="operator-details">
                        <div class="operator-name">${chatState.operatorName}</div>
                        <div class="operator-status ${chatState.operatorStatus}">
                            <span class="status-dot"></span>
                            ${chatState.operatorStatus === 'online' ? 'В сети' : 'Не в сети'}
                        </div>
                    </div>
                </div>
                <button class="chat-close" onclick="toggleChat()">✕</button>
            </div>

            <div class="chat-messages" id="chat-messages">
                <div class="chat-date">Сегодня</div>
            </div>

            <div class="chat-typing" id="chat-typing" style="display: none;">
                <span class="typing-indicator">
                    <span></span><span></span><span></span>
                </span>
                ${chatState.operatorName} печатает...
            </div>

            <div class="chat-input-container">
                <input
                    type="text"
                    class="chat-input"
                    id="chat-input"
                    placeholder="Напишите сообщение..."
                    onkeypress="handleChatKeyPress(event)"
                >
                <button class="chat-send" onclick="sendMessage()">
                    <span>➤</span>
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(chatWidget);

    // Show greeting after a short delay
    setTimeout(() => {
        if (!chatState.isOpen && chatState.messages.length === 0) {
            showChatNotification();
        }
    }, 3000);
}

// Toggle chat window
function toggleChat() {
    chatState.isOpen = !chatState.isOpen;

    const chatWindow = document.getElementById('chat-window');
    const chatToggle = document.getElementById('chat-toggle');
    const notification = document.getElementById('chat-notification');

    if (chatState.isOpen) {
        chatWindow.classList.add('active');
        chatToggle.classList.add('active');
        notification.style.display = 'none';

        // Send greeting if first time
        if (chatState.messages.length === 0) {
            setTimeout(() => {
                receiveMessage(getRandomResponse('greeting'));
            }, 500);
        }

        // Focus input
        document.getElementById('chat-input').focus();
    } else {
        chatWindow.classList.remove('active');
        chatToggle.classList.remove('active');
    }
}

// Show chat notification
function showChatNotification() {
    const notification = document.getElementById('chat-notification');
    notification.style.display = 'flex';
    notification.classList.add('pulse');
}

// Handle key press in chat input
function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Send message
function sendMessage() {
    const input = document.getElementById('chat-input');
    const messageText = input.value.trim();

    if (!messageText) return;

    // Add user message
    addMessage(messageText, 'user');
    input.value = '';

    // Show typing indicator
    showTypingIndicator();

    // Generate response after delay
    setTimeout(() => {
        hideTypingIndicator();
        const response = generateResponse(messageText);
        receiveMessage(response);
    }, 1000 + Math.random() * 1500);
}

// Receive message from operator
function receiveMessage(messageText) {
    addMessage(messageText, 'operator');
}

// Add message to chat
function addMessage(text, sender) {
    const message = {
        id: 'msg_' + Date.now(),
        text: text,
        sender: sender,
        timestamp: new Date().toISOString()
    };

    chatState.messages.push(message);

    const messagesContainer = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${sender}`;

    const time = new Date().toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
    });

    messageElement.innerHTML = `
        <div class="message-bubble">
            <div class="message-text">${text}</div>
            <div class="message-time">${time}</div>
        </div>
    `;

    messagesContainer.appendChild(messageElement);

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
    chatState.isTyping = true;
    const typingElement = document.getElementById('chat-typing');
    typingElement.style.display = 'flex';

    // Scroll to show typing
    const messagesContainer = document.getElementById('chat-messages');
    setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100);
}

// Hide typing indicator
function hideTypingIndicator() {
    chatState.isTyping = false;
    const typingElement = document.getElementById('chat-typing');
    typingElement.style.display = 'none';
}

// Generate response based on keywords
function generateResponse(messageText) {
    const lowerText = messageText.toLowerCase();

    // Check for keywords
    for (const [category, keywords] of Object.entries(KEYWORDS)) {
        for (const keyword of keywords) {
            if (lowerText.includes(keyword)) {
                return getRandomResponse(category);
            }
        }
    }

    // Default response
    return getRandomResponse('default');
}

// Get random response from category
function getRandomResponse(category) {
    const responses = AUTO_RESPONSES[category] || AUTO_RESPONSES.default;
    return responses[Math.floor(Math.random() * responses.length)];
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeChatWidget();
});

// API
window.ChatAPI = {
    toggleChat,
    sendMessage,
    chatState
};
