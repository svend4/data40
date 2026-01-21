/**
 * Gift Certificates Management
 * Handles certificate purchase, generation, and storage
 */

let selectedValue = null;

// Select certificate value
function selectCertificate(value) {
    selectedValue = value;

    // Update UI
    document.querySelectorAll('.certificate-card').forEach(card => {
        card.classList.remove('selected');
    });

    event.currentTarget.classList.add('selected');

    // Show form
    const form = document.getElementById('certificate-form');
    form.style.display = 'block';

    // Update selected info
    document.getElementById('selected-info').innerHTML = `
        <h3>Выбранный сертификат</h3>
        <p style="font-size: 24px; font-weight: 700; color: #667eea;">${value.toLocaleString('ru-RU')} ₽</p>
        <p style="color: #666;">Срок действия: 1 год с даты покупки</p>
    `;

    // Update total
    document.getElementById('certificate-total').textContent = value.toLocaleString('ru-RU');

    // Scroll to form
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Generate certificate code
function generateCertificateCode(value) {
    const prefix = 'CERT';
    const valueCode = value.toString().padStart(4, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const checksum = (parseInt(valueCode) + parseInt(random)) % 100;

    return `${prefix}${valueCode}${random}${checksum.toString().padStart(2, '0')}`;
}

// Purchase certificate
function purchaseCertificate(event) {
    event.preventDefault();

    if (!selectedValue) {
        alert('Пожалуйста, выберите номинал сертификата');
        return;
    }

    const buyerName = document.getElementById('buyer-name').value;
    const buyerEmail = document.getElementById('buyer-email').value;
    const buyerPhone = document.getElementById('buyer-phone').value;
    const recipientName = document.getElementById('recipient-name').value;
    const giftMessage = document.getElementById('gift-message').value;

    // Generate certificate code
    const certificateCode = generateCertificateCode(selectedValue);

    // Create certificate object
    const certificate = {
        code: certificateCode,
        value: selectedValue,
        originalValue: selectedValue,
        remainingValue: selectedValue,
        buyerName: buyerName,
        buyerEmail: buyerEmail,
        buyerPhone: buyerPhone,
        recipientName: recipientName,
        giftMessage: giftMessage,
        purchaseDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
        status: 'active',
        usageHistory: []
    };

    // Save certificate to localStorage
    const certificates = JSON.parse(localStorage.getItem('certificates') || '{}');
    certificates[certificateCode] = certificate;
    localStorage.setItem('certificates', JSON.stringify(certificates));

    // Also add to promo codes (for compatibility with existing system)
    const promoCodes = JSON.parse(localStorage.getItem('customPromoCodes') || '{}');
    promoCodes[certificateCode] = {
        type: 'fixed',
        value: selectedValue,
        description: `Подарочный сертификат на ${selectedValue} ₽`,
        certificate: true
    };
    localStorage.setItem('customPromoCodes', JSON.stringify(promoCodes));

    console.log('Certificate created:', certificate);

    // Show success modal
    showSuccessModal(certificateCode);

    // Simulate email sending (in real app, this would be done on backend)
    console.log('Email sent to:', buyerEmail, 'with certificate code:', certificateCode);

    // Reset form
    document.getElementById('purchase-form').reset();
    document.getElementById('certificate-form').style.display = 'none';
    selectedValue = null;

    document.querySelectorAll('.certificate-card').forEach(card => {
        card.classList.remove('selected');
    });
}

// Show success modal
function showSuccessModal(code) {
    document.getElementById('generated-code').textContent = code;
    document.getElementById('success-modal').classList.add('active');
}

// Close success modal
function closeSuccessModal() {
    document.getElementById('success-modal').classList.remove('active');
}

// Copy certificate code
function copyCertificateCode() {
    const code = document.getElementById('generated-code').textContent;
    navigator.clipboard.writeText(code).then(() => {
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = '✓ Скопировано!';
        button.style.background = '#28a745';

        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '#667eea';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Не удалось скопировать код. Пожалуйста, скопируйте вручную.');
    });
}

// Validate certificate
function validateCertificate(code) {
    const certificates = JSON.parse(localStorage.getItem('certificates') || '{}');
    const certificate = certificates[code];

    if (!certificate) {
        return { valid: false, message: 'Сертификат не найден' };
    }

    if (certificate.status !== 'active') {
        return { valid: false, message: 'Сертификат уже использован' };
    }

    const expiryDate = new Date(certificate.expiryDate);
    if (expiryDate < new Date()) {
        return { valid: false, message: 'Срок действия сертификата истек' };
    }

    if (certificate.remainingValue <= 0) {
        return { valid: false, message: 'Средства на сертификате израсходованы' };
    }

    return {
        valid: true,
        certificate: certificate
    };
}

// Use certificate (apply discount)
function useCertificate(code, amount) {
    const validation = validateCertificate(code);
    if (!validation.valid) {
        return { success: false, message: validation.message };
    }

    const certificate = validation.certificate;
    const discountAmount = Math.min(amount, certificate.remainingValue);

    // Update remaining value
    certificate.remainingValue -= discountAmount;

    // Add to usage history
    certificate.usageHistory.push({
        date: new Date().toISOString(),
        amount: discountAmount,
        orderNumber: null // Will be set by order system
    });

    // If fully used, mark as inactive
    if (certificate.remainingValue <= 0) {
        certificate.status = 'used';
    }

    // Save updated certificate
    const certificates = JSON.parse(localStorage.getItem('certificates') || '{}');
    certificates[code] = certificate;
    localStorage.setItem('certificates', JSON.stringify(certificates));

    return {
        success: true,
        discountAmount: discountAmount,
        remainingValue: certificate.remainingValue
    };
}

// Get certificate balance
function getCertificateBalance(code) {
    const validation = validateCertificate(code);
    if (!validation.valid) {
        return null;
    }

    return {
        original: validation.certificate.originalValue,
        remaining: validation.certificate.remainingValue,
        used: validation.certificate.originalValue - validation.certificate.remainingValue
    };
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    console.log('Certificates page loaded');

    // Check if there's a certificate code in URL (for email links)
    const urlParams = new URLSearchParams(window.location.search);
    const certCode = urlParams.get('code');

    if (certCode) {
        const validation = validateCertificate(certCode);
        if (validation.valid) {
            alert(`Сертификат активирован!\nКод: ${certCode}\nБаланс: ${validation.certificate.remainingValue} ₽\n\nИспользуйте этот код при оформлении заказа.`);
        }
    }
});

// Export functions for use in other scripts
window.CertificatesAPI = {
    validate: validateCertificate,
    use: useCertificate,
    getBalance: getCertificateBalance
};
