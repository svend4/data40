/**
 * Email Marketing and Automation System
 * Manages email campaigns, triggers and delivery
 */

// Email configuration
const EMAIL_CONFIG = {
    provider: 'demo', // В реальном проекте: 'sendgrid', 'mailchimp', 'sendinblue'
    fromEmail: 'noreply@flowerparadise.ru',
    fromName: 'Цветочный Рай',
    replyTo: 'info@flowerparadise.ru',
    unsubscribeUrl: 'https://flowerparadise.ru/unsubscribe.html'
};

// Email campaigns storage
let emailCampaigns = JSON.parse(localStorage.getItem('emailCampaigns') || '[]');
let emailSubscribers = JSON.parse(localStorage.getItem('emailSubscribers') || '[]');
let emailQueue = JSON.parse(localStorage.getItem('emailQueue') || '[]');

// Initialize Email System
function initializeEmailSystem() {
    setupEmailTriggers();
    processEmailQueue();
    
    // Process queue every 5 minutes
    setInterval(processEmailQueue, 5 * 60 * 1000);
}

// Setup automatic email triggers
function setupEmailTriggers() {
    // Welcome email trigger
    document.addEventListener('userRegistered', (event) => {
        sendWelcomeEmail(event.detail.userData);
    });

    // Abandoned cart trigger
    document.addEventListener('cartAbandoned', (event) => {
        scheduleAbandonedCartEmail(event.detail.cartData);
    });

    // Order confirmation trigger
    document.addEventListener('orderConfirmed', (event) => {
        sendOrderConfirmationEmail(event.detail.orderData);
    });

    // Check for inactive users daily
    checkInactiveUsers();
    setInterval(checkInactiveUsers, 24 * 60 * 60 * 1000);

    // Check for birthdays daily
    checkBirthdays();
    setInterval(checkBirthdays, 24 * 60 * 60 * 1000);
}

// Send Welcome Email
function sendWelcomeEmail(userData) {
    if (!userData || !userData.email) return;

    const emailHTML = window.EmailTemplates.welcome.getHTML(userData);
    const subject = window.EmailTemplates.welcome.subject;

    queueEmail({
        to: userData.email,
        subject: subject,
        html: emailHTML.replace('{{email}}', userData.email),
        type: 'welcome',
        userId: userData.id
    });

    console.log('[Email] Welcome email queued for:', userData.email);

    // Track with analytics
    if (typeof SEOAPI !== 'undefined') {
        SEOAPI.trackEvent('Email', 'welcome_sent', userData.email);
    }
}

// Schedule Abandoned Cart Email
function scheduleAbandonedCartEmail(cartData) {
    if (!cartData || !cartData.userEmail || cartData.items.length === 0) return;

    // Schedule for 2 hours later
    const sendAt = Date.now() + (2 * 60 * 60 * 1000);

    const emailHTML = window.EmailTemplates.abandonedCart.getHTML(cartData);
    const subject = window.EmailTemplates.abandonedCart.subject;

    queueEmail({
        to: cartData.userEmail,
        subject: subject,
        html: emailHTML.replace('{{email}}', cartData.userEmail),
        type: 'abandoned_cart',
        scheduledFor: sendAt,
        cartId: cartData.id
    });

    console.log('[Email] Abandoned cart email scheduled for:', cartData.userEmail);
}

// Send Order Confirmation Email
function sendOrderConfirmationEmail(orderData) {
    if (!orderData || !orderData.email) return;

    const emailHTML = window.EmailTemplates.orderConfirmation.getHTML(orderData);
    const subject = window.EmailTemplates.orderConfirmation.subject.replace('{{orderNumber}}', orderData.orderNumber);

    queueEmail({
        to: orderData.email,
        subject: subject,
        html: emailHTML.replace('{{email}}', orderData.email),
        type: 'order_confirmation',
        orderId: orderData.orderNumber,
        priority: 'high'
    });

    console.log('[Email] Order confirmation queued for:', orderData.email);

    // Track with analytics
    if (typeof SEOAPI !== 'undefined') {
        SEOAPI.trackEvent('Email', 'order_confirmation_sent', orderData.orderNumber);
    }
}

// Send Newsletter
function sendNewsletter(newsletterData, recipientsList) {
    if (!newsletterData || !recipientsList || recipientsList.length === 0) return;

    const emailHTML = window.EmailTemplates.newsletter.getHTML(newsletterData);
    const subject = window.EmailTemplates.newsletter.subject.replace('{{month}}', newsletterData.month);

    recipientsList.forEach(recipient => {
        if (recipient.subscribed && recipient.email) {
            queueEmail({
                to: recipient.email,
                subject: subject,
                html: emailHTML.replace('{{email}}', recipient.email),
                type: 'newsletter',
                campaignId: newsletterData.campaignId
            });
        }
    });

    console.log('[Email] Newsletter queued for', recipientsList.length, 'recipients');

    // Save campaign
    emailCampaigns.push({
        id: newsletterData.campaignId,
        type: 'newsletter',
        subject: subject,
        sentAt: Date.now(),
        recipientsCount: recipientsList.length,
        status: 'sent'
    });
    localStorage.setItem('emailCampaigns', JSON.stringify(emailCampaigns));
}

// Send Birthday Email
function sendBirthdayEmail(userData) {
    if (!userData || !userData.email) return;

    const emailHTML = window.EmailTemplates.birthday.getHTML(userData);
    const subject = window.EmailTemplates.birthday.subject;

    queueEmail({
        to: userData.email,
        subject: subject,
        html: emailHTML.replace('{{email}}', userData.email),
        type: 'birthday',
        userId: userData.id,
        priority: 'high'
    });

    console.log('[Email] Birthday email queued for:', userData.email);
}

// Send Re-engagement Email
function sendReEngagementEmail(userData) {
    if (!userData || !userData.email) return;

    const emailHTML = window.EmailTemplates.reEngagement.getHTML(userData);
    const subject = window.EmailTemplates.reEngagement.subject;

    queueEmail({
        to: userData.email,
        subject: subject,
        html: emailHTML.replace('{{email}}', userData.email),
        type: 're_engagement',
        userId: userData.id
    });

    console.log('[Email] Re-engagement email queued for:', userData.email);
}

// Queue Email for sending
function queueEmail(emailData) {
    emailQueue.push({
        id: generateEmailId(),
        ...emailData,
        queuedAt: Date.now(),
        status: 'queued',
        attempts: 0
    });

    localStorage.setItem('emailQueue', JSON.stringify(emailQueue));
}

// Process Email Queue
function processEmailQueue() {
    const now = Date.now();
    
    emailQueue = emailQueue.filter(email => {
        // Skip if scheduled for later
        if (email.scheduledFor && email.scheduledFor > now) {
            return true;
        }

        // Skip if already sent
        if (email.status === 'sent') {
            return false;
        }

        // Skip if failed too many times
        if (email.attempts >= 3) {
            email.status = 'failed';
            console.error('[Email] Failed after 3 attempts:', email.to);
            return false;
        }

        // Try to send
        const sent = sendEmailNow(email);
        if (sent) {
            email.status = 'sent';
            email.sentAt = now;
            console.log('[Email] Sent successfully:', email.to);
            return false; // Remove from queue
        } else {
            email.attempts++;
            console.warn('[Email] Send attempt failed:', email.to, 'Attempt:', email.attempts);
            return true; // Keep in queue for retry
        }
    });

    localStorage.setItem('emailQueue', JSON.stringify(emailQueue));
}

// Send Email Now (simulated for demo)
function sendEmailNow(email) {
    // В реальном проекте здесь был бы API call к email провайдеру
    // Например: SendGrid, Mailchimp, SendinBlue, Amazon SES
    
    console.log('[Email] Sending email:', {
        to: email.to,
        subject: email.subject,
        type: email.type,
        priority: email.priority || 'normal'
    });

    // Simulate API call
    try {
        // В реальности:
        // await fetch('https://api.sendgrid.com/v3/mail/send', {
        //     method: 'POST',
        //     headers: {
        //         'Authorization': 'Bearer YOUR_API_KEY',
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({
        //         personalizations: [{ to: [{ email: email.to }] }],
        //         from: { email: EMAIL_CONFIG.fromEmail, name: EMAIL_CONFIG.fromName },
        //         subject: email.subject,
        //         content: [{ type: 'text/html', value: email.html }]
        //     })
        // });

        // Demo: Show in console and create preview
        createEmailPreview(email);
        
        return true;
    } catch (error) {
        console.error('[Email] Send error:', error);
        return false;
    }
}

// Create Email Preview (for demo)
function createEmailPreview(email) {
    // Store preview in localStorage for viewing
    let previews = JSON.parse(localStorage.getItem('emailPreviews') || '[]');
    previews.unshift({
        id: email.id,
        to: email.to,
        subject: email.subject,
        html: email.html,
        type: email.type,
        sentAt: Date.now()
    });
    
    // Keep only last 20 previews
    if (previews.length > 20) {
        previews = previews.slice(0, 20);
    }
    
    localStorage.setItem('emailPreviews', JSON.stringify(previews));
}

// Check for inactive users
function checkInactiveUsers() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

    users.forEach(user => {
        if (!user.email) return;

        // Find last order
        const userOrders = orders.filter(o => o.email === user.email);
        if (userOrders.length === 0) return;

        const lastOrder = userOrders.sort((a, b) => b.date - a.date)[0];
        const lastOrderDate = new Date(lastOrder.date).getTime();

        // Send re-engagement if last order was 30+ days ago
        if (lastOrderDate < thirtyDaysAgo) {
            const daysSince = Math.floor((now - lastOrderDate) / (24 * 60 * 60 * 1000));
            sendReEngagementEmail({
                ...user,
                daysSinceLastOrder: daysSince
            });
        }
    });
}

// Check for birthdays
function checkBirthdays() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const today = new Date();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();

    users.forEach(user => {
        if (!user.email || !user.birthday) return;

        const birthday = new Date(user.birthday);
        const birthdayMonth = birthday.getMonth();
        const birthdayDate = birthday.getDate();

        // Check if today is user's birthday
        if (birthdayMonth === todayMonth && birthdayDate === todayDate) {
            sendBirthdayEmail(user);
        }
    });
}

// Subscribe to newsletter
function subscribeToNewsletter(email, name = '') {
    if (!isValidEmail(email)) {
        showNotification('Пожалуйста, введите корректный email');
        return false;
    }

    // Check if already subscribed
    const existing = emailSubscribers.find(s => s.email === email);
    if (existing) {
        if (existing.subscribed) {
            showNotification('Вы уже подписаны на рассылку!');
            return false;
        } else {
            // Resubscribe
            existing.subscribed = true;
            existing.resubscribedAt = Date.now();
        }
    } else {
        // New subscriber
        emailSubscribers.push({
            id: generateSubscriberId(),
            email: email,
            name: name,
            subscribed: true,
            subscribedAt: Date.now(),
            source: 'newsletter_form'
        });
    }

    localStorage.setItem('emailSubscribers', JSON.stringify(emailSubscribers));

    // Send welcome email
    sendWelcomeEmail({ email, name, id: generateUserId() });

    showNotification('Спасибо за подписку! Проверьте почту.');

    // Track with analytics
    if (typeof SEOAPI !== 'undefined') {
        SEOAPI.trackEvent('Email', 'newsletter_subscribe', email);
    }

    return true;
}

// Unsubscribe from newsletter
function unsubscribeFromNewsletter(email) {
    const subscriber = emailSubscribers.find(s => s.email === email);
    if (subscriber) {
        subscriber.subscribed = false;
        subscriber.unsubscribedAt = Date.now();
        localStorage.setItem('emailSubscribers', JSON.stringify(emailSubscribers));
        return true;
    }
    return false;
}

// Get email statistics
function getEmailStatistics() {
    const sent = emailCampaigns.filter(c => c.status === 'sent').length;
    const queued = emailQueue.filter(e => e.status === 'queued').length;
    const failed = emailQueue.filter(e => e.status === 'failed').length;
    const subscribers = emailSubscribers.filter(s => s.subscribed).length;

    return {
        totalCampaigns: emailCampaigns.length,
        sentEmails: sent,
        queuedEmails: queued,
        failedEmails: failed,
        activeSubscribers: subscribers,
        totalSubscribers: emailSubscribers.length
    };
}

// View email preview
function viewEmailPreview(emailId) {
    const previews = JSON.parse(localStorage.getItem('emailPreviews') || '[]');
    const preview = previews.find(p => p.id === emailId);
    
    if (!preview) {
        console.error('[Email] Preview not found:', emailId);
        return;
    }

    // Open preview in new window
    const previewWindow = window.open('', '_blank', 'width=800,height=600');
    previewWindow.document.write(preview.html);
    previewWindow.document.close();
}

// Helper: Validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Helper: Generate email ID
function generateEmailId() {
    return 'email_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Helper: Generate subscriber ID
function generateSubscriberId() {
    return 'sub_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Helper: Generate user ID
function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Trigger cart abandonment check
function checkCartAbandonment() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');

    if (cart.length > 0 && user && user.email) {
        // Check if user hasn't completed order in 30 minutes
        const lastActivity = parseInt(localStorage.getItem('lastCartActivity') || '0');
        const now = Date.now();
        const thirtyMinutes = 30 * 60 * 1000;

        if (now - lastActivity > thirtyMinutes) {
            // Trigger abandoned cart email
            document.dispatchEvent(new CustomEvent('cartAbandoned', {
                detail: {
                    cartData: {
                        id: 'cart_' + now,
                        userEmail: user.email,
                        items: cart,
                        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
                    }
                }
            }));
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeEmailSystem();
    
    // Check cart abandonment periodically
    setInterval(checkCartAbandonment, 10 * 60 * 1000); // Every 10 minutes
});

// Export API
window.EmailAPI = {
    subscribeToNewsletter,
    unsubscribeFromNewsletter,
    sendNewsletter,
    getEmailStatistics,
    viewEmailPreview,
    sendWelcomeEmail,
    sendOrderConfirmationEmail,
    getQueue: () => emailQueue,
    getSubscribers: () => emailSubscribers,
    getCampaigns: () => emailCampaigns
};
