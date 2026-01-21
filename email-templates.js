/**
 * Email Templates System
 * HTML templates for various email campaigns
 */

// Email template wrapper
function getEmailWrapper(content, preheader = '') {
    return `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <title>Цветочный Рай</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .email-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; color: white; }
        .email-logo { font-size: 32px; font-weight: bold; margin-bottom: 10px; }
        .email-body { padding: 40px 20px; color: #333333; line-height: 1.6; }
        .email-footer { background: #f8f9fa; padding: 30px 20px; text-align: center; color: #666666; font-size: 14px; }
        .btn-primary { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .product-grid { display: table; width: 100%; margin: 20px 0; }
        .product-item { display: table-cell; padding: 10px; text-align: center; }
        .social-links { margin: 20px 0; }
        .social-links a { display: inline-block; margin: 0 10px; text-decoration: none; font-size: 24px; }
        @media only screen and (max-width: 600px) {
            .email-body { padding: 20px 15px; }
            .product-item { display: block; padding: 15px 0; }
        }
    </style>
    <!--[if mso]>
    <style type="text/css">
        .btn-primary { padding: 15px 30px !important; }
    </style>
    <![endif]-->
</head>
<body>
    <div style="display: none; max-height: 0; overflow: hidden;">${preheader}</div>
    <div class="email-container">
        <div class="email-header">
            <div class="email-logo">🌸 Цветочный Рай</div>
            <div>Доставка свежих цветов с любовью</div>
        </div>
        ${content}
        <div class="email-footer">
            <div class="social-links">
                <a href="#" style="color: #667eea;">📷</a>
                <a href="#" style="color: #667eea;">🔵</a>
                <a href="#" style="color: #667eea;">✈️</a>
            </div>
            <p>© 2026 Цветочный Рай. Все права защищены.</p>
            <p>
                <a href="#" style="color: #667eea; text-decoration: none;">Отписаться</a> | 
                <a href="#" style="color: #667eea; text-decoration: none;">Настройки подписки</a>
            </p>
            <p style="margin-top: 20px; color: #999; font-size: 12px;">
                Это письмо было отправлено на адрес {{email}}<br>
                ООО "Цветочный Рай", г. Москва, ул. Цветочная, д. 1
            </p>
        </div>
    </div>
</body>
</html>
    `.trim();
}

// Welcome Email Template
const welcomeEmailTemplate = {
    subject: '🌸 Добро пожаловать в Цветочный Рай!',
    preheader: 'Спасибо за регистрацию! Получите скидку 10% на первый заказ',
    getHTML: (userData) => {
        const content = `
        <div class="email-body">
            <h1 style="color: #667eea; margin-bottom: 10px;">Добро пожаловать, ${userData.name}! 🎉</h1>
            <p>Спасибо, что присоединились к нашему сообществу любителей цветов!</p>
            
            <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; margin: 30px 0; text-align: center;">
                <h2 style="color: #667eea; margin: 0 0 15px;">Специальное предложение для вас!</h2>
                <div style="font-size: 48px; font-weight: bold; color: #667eea; margin: 20px 0;">10%</div>
                <p style="margin: 10px 0;">Скидка на первый заказ</p>
                <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0; border: 2px dashed #667eea;">
                    <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Промокод:</div>
                    <div style="font-size: 24px; font-weight: bold; color: #667eea; letter-spacing: 2px;">WELCOME10</div>
                </div>
                <a href="https://flowerparadise.ru/index.html#catalog" class="btn-primary">Выбрать букет</a>
            </div>

            <h3 style="color: #333; margin-top: 40px;">Что вас ждет:</h3>
            <table width="100%" style="margin: 20px 0;">
                <tr>
                    <td style="padding: 15px; text-align: center;">
                        <div style="font-size: 40px;">🌹</div>
                        <div style="font-weight: 600; margin: 10px 0;">Свежие цветы</div>
                        <div style="font-size: 14px; color: #666;">Ежедневные поставки от лучших поставщиков</div>
                    </td>
                    <td style="padding: 15px; text-align: center;">
                        <div style="font-size: 40px;">🚚</div>
                        <div style="font-weight: 600; margin: 10px 0;">Быстрая доставка</div>
                        <div style="font-size: 14px; color: #666;">В течение 2 часов по городу</div>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 15px; text-align: center;">
                        <div style="font-size: 40px;">💝</div>
                        <div style="font-weight: 600; margin: 10px 0;">Индивидуальный подход</div>
                        <div style="font-size: 14px; color: #666;">Конструктор букетов и персональные рекомендации</div>
                    </td>
                    <td style="padding: 15px; text-align: center;">
                        <div style="font-size: 40px;">⭐</div>
                        <div style="font-weight: 600; margin: 10px 0;">Бонусы и акции</div>
                        <div style="font-size: 14px; color: #666;">Программа лояльности и эксклюзивные предложения</div>
                    </td>
                </tr>
            </table>

            <p style="margin-top: 30px;">С уважением,<br><strong>Команда Цветочного Рая</strong></p>
        </div>
        `;
        return getEmailWrapper(content, welcomeEmailTemplate.preheader);
    }
};

// Abandoned Cart Email Template
const abandonedCartEmailTemplate = {
    subject: '🛒 Вы забыли свой букет!',
    preheader: 'Ваша корзина ждет вас. Завершите заказ и получите бесплатную доставку!',
    getHTML: (cartData) => {
        const productsHTML = cartData.items.map(item => `
            <tr>
                <td style="padding: 15px; border-bottom: 1px solid #eee;">
                    <div style="font-size: 30px;">${item.emoji}</div>
                </td>
                <td style="padding: 15px; border-bottom: 1px solid #eee;">
                    <div style="font-weight: 600;">${item.name}</div>
                    <div style="font-size: 14px; color: #666;">Количество: ${item.quantity}</div>
                </td>
                <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: right;">
                    <div style="font-weight: 600;">${item.price * item.quantity} ₽</div>
                </td>
            </tr>
        `).join('');

        const content = `
        <div class="email-body">
            <h1 style="color: #667eea; margin-bottom: 10px;">Не забудьте про свои цветы! 🌸</h1>
            <p>Мы заметили, что вы оставили товары в корзине. Они все еще ждут вас!</p>

            <table width="100%" style="margin: 30px 0; border-collapse: collapse;">
                ${productsHTML}
                <tr>
                    <td colspan="2" style="padding: 20px; text-align: right; font-size: 18px; font-weight: bold;">
                        Итого:
                    </td>
                    <td style="padding: 20px; text-align: right; font-size: 18px; font-weight: bold; color: #667eea;">
                        ${cartData.total} ₽
                    </td>
                </tr>
            </table>

            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; text-align: center; color: white; margin: 30px 0;">
                <h2 style="margin: 0 0 15px;">Специальное предложение! 🎁</h2>
                <p style="font-size: 18px; margin: 10px 0;">Завершите заказ в течение 24 часов и получите:</p>
                <div style="font-size: 24px; font-weight: bold; margin: 20px 0;">БЕСПЛАТНУЮ ДОСТАВКУ</div>
                <a href="https://flowerparadise.ru/index.html#cart" style="display: inline-block; padding: 15px 40px; background: white; color: #667eea; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px 0;">
                    Завершить заказ
                </a>
            </div>

            <p style="color: #666; font-size: 14px; margin-top: 30px;">
                Если у вас есть вопросы, наша служба поддержки всегда готова помочь!<br>
                Телефон: +7 (999) 123-45-67
            </p>
        </div>
        `;
        return getEmailWrapper(content, abandonedCartEmailTemplate.preheader);
    }
};

// Order Confirmation Email Template
const orderConfirmationEmailTemplate = {
    subject: '✅ Заказ №{{orderNumber}} подтвержден',
    preheader: 'Спасибо за заказ! Мы уже начали готовить ваши цветы',
    getHTML: (orderData) => {
        const itemsHTML = orderData.items.map(item => `
            <tr>
                <td style="padding: 10px;">${item.emoji} ${item.name}</td>
                <td style="padding: 10px; text-align: center;">${item.quantity}</td>
                <td style="padding: 10px; text-align: right;">${item.price * item.quantity} ₽</td>
            </tr>
        `).join('');

        const content = `
        <div class="email-body">
            <h1 style="color: #28a745; margin-bottom: 10px;">Заказ подтвержден! ✅</h1>
            <p>Спасибо за ваш заказ! Мы уже начали его обработку.</p>

            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <table width="100%">
                    <tr>
                        <td><strong>Номер заказа:</strong></td>
                        <td style="text-align: right; color: #667eea; font-weight: bold;">#${orderData.orderNumber}</td>
                    </tr>
                    <tr>
                        <td style="padding-top: 10px;"><strong>Дата:</strong></td>
                        <td style="text-align: right; padding-top: 10px;">${orderData.date}</td>
                    </tr>
                    <tr>
                        <td style="padding-top: 10px;"><strong>Статус:</strong></td>
                        <td style="text-align: right; padding-top: 10px; color: #28a745; font-weight: 600;">Подтвержден</td>
                    </tr>
                </table>
            </div>

            <h3 style="margin: 30px 0 15px;">Состав заказа:</h3>
            <table width="100%" style="border-collapse: collapse;">
                <thead>
                    <tr style="background: #f8f9fa;">
                        <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Товар</th>
                        <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Кол-во</th>
                        <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Цена</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
                <tfoot>
                    <tr style="background: #f8f9fa; font-weight: bold;">
                        <td colspan="2" style="padding: 15px; border-top: 2px solid #ddd;">Итого:</td>
                        <td style="padding: 15px; text-align: right; border-top: 2px solid #ddd; color: #667eea; font-size: 18px;">${orderData.total} ₽</td>
                    </tr>
                </tfoot>
            </table>

            <h3 style="margin: 30px 0 15px;">Информация о доставке:</h3>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                <p style="margin: 5px 0;"><strong>Адрес:</strong> ${orderData.address}</p>
                <p style="margin: 5px 0;"><strong>Дата доставки:</strong> ${orderData.deliveryDate}</p>
                <p style="margin: 5px 0;"><strong>Время:</strong> ${orderData.deliveryTime}</p>
                <p style="margin: 5px 0;"><strong>Получатель:</strong> ${orderData.recipient}</p>
            </div>

            <div style="text-align: center; margin: 40px 0;">
                <a href="https://flowerparadise.ru/tracking.html?order=${orderData.orderNumber}" class="btn-primary">
                    Отследить заказ
                </a>
            </div>

            <p style="color: #666; margin-top: 30px;">
                Вы можете отследить статус вашего заказа в любое время в личном кабинете или по ссылке выше.
            </p>
        </div>
        `;
        return getEmailWrapper(content, orderConfirmationEmailTemplate.preheader);
    }
};

// Newsletter Template
const newsletterTemplate = {
    subject: '🌺 {{month}}: Новые статьи и советы',
    preheader: 'Свежие идеи для букетов, советы по уходу и эксклюзивные предложения',
    getHTML: (newsletterData) => {
        const articlesHTML = newsletterData.articles.map(article => `
            <div style="margin: 30px 0; padding-bottom: 30px; border-bottom: 1px solid #eee;">
                <div style="font-size: 50px; margin-bottom: 15px;">${article.emoji}</div>
                <h3 style="color: #667eea; margin: 10px 0;">${article.title}</h3>
                <p style="color: #666; line-height: 1.6;">${article.excerpt}</p>
                <a href="https://flowerparadise.ru/blog.html?post=${article.id}" style="color: #667eea; text-decoration: none; font-weight: 600;">
                    Читать далее →
                </a>
            </div>
        `).join('');

        const productsHTML = newsletterData.products ? newsletterData.products.map(product => `
            <td style="padding: 15px; text-align: center; vertical-align: top;">
                <div style="font-size: 60px;">${product.emoji}</div>
                <div style="font-weight: 600; margin: 10px 0;">${product.name}</div>
                <div style="color: #667eea; font-size: 20px; font-weight: bold; margin: 10px 0;">${product.price} ₽</div>
                <a href="https://flowerparadise.ru/index.html#catalog" style="display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; font-size: 14px;">
                    Подробнее
                </a>
            </td>
        `).join('') : '';

        const content = `
        <div class="email-body">
            <h1 style="color: #667eea; margin-bottom: 10px;">Новости и советы 📰</h1>
            <p>Привет! Мы подготовили для вас новые интересные статьи и эксклюзивные предложения.</p>

            <h2 style="color: #333; margin: 40px 0 20px;">Новые статьи в блоге</h2>
            ${articlesHTML}

            ${productsHTML ? `
                <h2 style="color: #333; margin: 40px 0 20px;">Специальные предложения этой недели</h2>
                <table width="100%" style="margin: 20px 0;">
                    <tr>${productsHTML}</tr>
                </table>
            ` : ''}

            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; text-align: center; color: white; margin: 40px 0;">
                <h2 style="margin: 0 0 10px;">Эксклюзивное предложение для подписчиков! 🎁</h2>
                <p style="margin: 10px 0;">Используйте промокод для получения скидки 15%</p>
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; margin: 20px 0; border: 2px dashed white;">
                    <div style="font-size: 28px; font-weight: bold; letter-spacing: 3px;">NEWSLETTER15</div>
                </div>
                <a href="https://flowerparadise.ru/index.html#catalog" style="display: inline-block; padding: 15px 40px; background: white; color: #667eea; text-decoration: none; border-radius: 8px; font-weight: 600;">
                    Перейти в каталог
                </a>
            </div>

            <p style="color: #666; margin-top: 30px;">
                Спасибо, что вы с нами! Если у вас есть идеи для статей или вопросы - пишите нам.
            </p>
        </div>
        `;
        return getEmailWrapper(content, newsletterTemplate.preheader);
    }
};

// Birthday Email Template
const birthdayEmailTemplate = {
    subject: '🎉 С Днем Рождения! Специальный подарок от нас',
    preheader: 'Получите скидку 20% в честь вашего особенного дня!',
    getHTML: (userData) => {
        const content = `
        <div class="email-body">
            <div style="text-align: center; margin: 30px 0;">
                <div style="font-size: 80px; margin-bottom: 20px;">🎂</div>
                <h1 style="color: #667eea; margin: 10px 0; font-size: 36px;">С Днем Рождения, ${userData.name}!</h1>
                <p style="font-size: 18px; color: #666;">Желаем вам счастья, здоровья и прекрасного настроения!</p>
            </div>

            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 12px; text-align: center; color: white; margin: 40px 0;">
                <h2 style="margin: 0 0 15px;">Ваш подарок от Цветочного Рая! 🎁</h2>
                <div style="font-size: 72px; font-weight: bold; margin: 20px 0;">20%</div>
                <p style="font-size: 20px; margin: 10px 0;">Скидка на все букеты</p>
                <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 8px; margin: 30px 0; border: 2px dashed white;">
                    <div style="font-size: 14px; margin-bottom: 10px;">Ваш персональный промокод:</div>
                    <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px;">HAPPY${userData.id}</div>
                    <div style="font-size: 14px; margin-top: 10px;">Действует 7 дней</div>
                </div>
                <a href="https://flowerparadise.ru/index.html#catalog" style="display: inline-block; padding: 18px 50px; background: white; color: #667eea; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 18px;">
                    Выбрать букет
                </a>
            </div>

            <p style="text-align: center; font-size: 16px; color: #666; margin: 30px 0;">
                Пусть этот день будет наполнен радостью, любовью и ароматом свежих цветов! 🌹
            </p>

            <p style="margin-top: 40px;">
                С наилучшими пожеланиями,<br>
                <strong>Команда Цветочного Рая</strong>
            </p>
        </div>
        `;
        return getEmailWrapper(content, birthdayEmailTemplate.preheader);
    }
};

// Re-engagement Email Template
const reEngagementEmailTemplate = {
    subject: '💐 Мы скучали по вам!',
    preheader: 'Вернитесь и получите специальное предложение',
    getHTML: (userData) => {
        const content = `
        <div class="email-body">
            <h1 style="color: #667eea; margin-bottom: 10px;">Мы скучали по вам! 💐</h1>
            <p>Прошло уже ${userData.daysSinceLastOrder} дней с вашего последнего заказа, и мы хотим пригласить вас вернуться!</p>

            <div style="text-align: center; margin: 40px 0;">
                <div style="font-size: 100px; margin-bottom: 20px;">🌸</div>
                <h2 style="color: #333; margin: 20px 0;">Что нового у нас:</h2>
            </div>

            <table width="100%" style="margin: 30px 0;">
                <tr>
                    <td style="padding: 20px; text-align: center;">
                        <div style="font-size: 50px; margin-bottom: 15px;">✨</div>
                        <h3 style="color: #667eea; margin: 10px 0;">Новые букеты</h3>
                        <p style="color: #666;">20+ новых композиций в каталоге</p>
                    </td>
                    <td style="padding: 20px; text-align: center;">
                        <div style="font-size: 50px; margin-bottom: 15px;">🎨</div>
                        <h3 style="color: #667eea; margin: 10px 0;">Конструктор</h3>
                        <p style="color: #666;">Создавайте уникальные букеты</p>
                    </td>
                </tr>
            </table>

            <div style="background: #f8f9fa; padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0;">
                <h2 style="color: #667eea; margin: 0 0 15px;">Специальное предложение для вас!</h2>
                <p style="font-size: 18px; margin: 15px 0;">Вернитесь и получите скидку:</p>
                <div style="font-size: 56px; font-weight: bold; color: #667eea; margin: 20px 0;">25%</div>
                <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0; border: 2px solid #667eea;">
                    <div style="font-size: 24px; font-weight: bold; color: #667eea; letter-spacing: 2px;">COMEBACK25</div>
                </div>
                <a href="https://flowerparadise.ru/index.html#catalog" class="btn-primary">Вернуться в магазин</a>
            </div>

            <p style="color: #666; margin-top: 30px;">
                Мы всегда рады видеть вас снова и готовы помочь с выбором идеального букета!
            </p>
        </div>
        `;
        return getEmailWrapper(content, reEngagementEmailTemplate.preheader);
    }
};

// Export all templates
window.EmailTemplates = {
    welcome: welcomeEmailTemplate,
    abandonedCart: abandonedCartEmailTemplate,
    orderConfirmation: orderConfirmationEmailTemplate,
    newsletter: newsletterTemplate,
    birthday: birthdayEmailTemplate,
    reEngagement: reEngagementEmailTemplate
};
