/**
 * Corporate Clients System
 * Handles corporate requests and bulk orders
 */

// Handle corporate form submission
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('corporate-form');

    if (form) {
        form.addEventListener('submit', submitCorporateRequest);
    }
});

// Submit corporate request
function submitCorporateRequest(event) {
    event.preventDefault();

    const requestData = {
        companyName: document.getElementById('company-name').value,
        contactPerson: document.getElementById('contact-person').value,
        phone: document.getElementById('company-phone').value,
        email: document.getElementById('company-email').value,
        serviceType: document.getElementById('service-type').value,
        budget: document.getElementById('budget').value,
        comment: document.getElementById('comment').value,
        submittedAt: new Date().toISOString()
    };

    // Save to localStorage
    saveCorporateRequest(requestData);

    // Show success message
    alert(`Спасибо за заявку, ${requestData.contactPerson}!\n\nМы свяжемся с вами в ближайшее время по телефону ${requestData.phone} для обсуждения деталей сотрудничества.\n\nНаш менеджер подготовит для вас индивидуальное коммерческое предложение.`);

    // Reset form
    document.getElementById('corporate-form').reset();
}

// Save corporate request
function saveCorporateRequest(requestData) {
    const requests = JSON.parse(localStorage.getItem('corporateRequests') || '[]');

    const request = {
        id: 'corp_' + Date.now(),
        ...requestData,
        status: 'new'
    };

    requests.push(request);
    localStorage.setItem('corporateRequests', JSON.stringify(requests));

    return request;
}

// Get all corporate requests
function getCorporateRequests() {
    return JSON.parse(localStorage.getItem('corporateRequests') || '[]');
}

// Get service type name
function getServiceTypeName(type) {
    const types = {
        'event': 'Корпоративное мероприятие',
        'regular': 'Регулярные поставки',
        'gifts-employees': 'Подарки сотрудникам',
        'gifts-partners': 'Подарки партнерам',
        'other': 'Другое'
    };
    return types[type] || type;
}

// API
window.CorporateAPI = {
    submitCorporateRequest,
    getCorporateRequests,
    getServiceTypeName
};
