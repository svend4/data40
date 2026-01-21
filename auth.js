/**
 * User Authentication and Account Management
 * Simple localStorage-based auth system for demo purposes
 */

// Current user session
let currentUser = null;

// Initialize auth system
function initAuth() {
    // Check if user is logged in
    const userId = localStorage.getItem('currentUserId');
    if (userId) {
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        currentUser = users[userId];
        if (currentUser) {
            updateAuthUI();
        }
    }
}

// Register new user
function register(userData) {
    const users = JSON.parse(localStorage.getItem('users') || '{}');

    // Check if email already exists
    const emailExists = Object.values(users).some(
        user => user.email.toLowerCase() === userData.email.toLowerCase()
    );

    if (emailExists) {
        return { success: false, message: 'Пользователь с таким email уже существует' };
    }

    // Create new user
    const userId = 'user_' + Date.now();
    const newUser = {
        id: userId,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: userData.password, // In real app, this should be hashed
        registrationDate: new Date().toISOString(),
        addresses: [],
        favorites: [],
        preferences: {
            notifications: true,
            newsletter: true
        }
    };

    users[userId] = newUser;
    localStorage.setItem('users', JSON.stringify(users));

    // Auto login
    login(userData.email, userData.password);

    return { success: true, message: 'Регистрация успешна!', user: newUser };
}

// Login user
function login(email, password) {
    const users = JSON.parse(localStorage.getItem('users') || '{}');

    const user = Object.values(users).find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
        return { success: false, message: 'Неверный email или пароль' };
    }

    currentUser = user;
    localStorage.setItem('currentUserId', user.id);
    updateAuthUI();

    return { success: true, message: 'Вход выполнен успешно!', user: user };
}

// Logout user
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUserId');
    updateAuthUI();

    // Redirect to home if on account page
    if (window.location.pathname.includes('account.html')) {
        window.location.href = 'index.html';
    }
}

// Update UI based on auth state
function updateAuthUI() {
    const authButton = document.getElementById('auth-button');
    if (!authButton) return;

    if (currentUser) {
        authButton.innerHTML = `👤 ${currentUser.name.split(' ')[0]}`;
        authButton.onclick = () => window.location.href = 'account.html';
    } else {
        authButton.innerHTML = '🔐 Войти';
        authButton.onclick = showAuthModal;
    }
}

// Show auth modal
function showAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

// Close auth modal
function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Switch between login and register forms
function switchAuthMode(mode) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');

    if (mode === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        loginTab.classList.remove('active');
        registerTab.classList.add('active');
    }
}

// Handle login form submission
function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const result = login(email, password);

    if (result.success) {
        closeAuthModal();
        window.location.href = 'account.html';
    } else {
        alert(result.message);
    }
}

// Handle register form submission
function handleRegister(event) {
    event.preventDefault();

    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const phone = document.getElementById('register-phone').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;

    if (password !== confirmPassword) {
        alert('Пароли не совпадают');
        return;
    }

    if (password.length < 6) {
        alert('Пароль должен содержать минимум 6 символов');
        return;
    }

    const result = register({ name, email, phone, password });

    if (result.success) {
        closeAuthModal();
        window.location.href = 'account.html';
    } else {
        alert(result.message);
    }
}

// Get user's orders
function getUserOrders() {
    if (!currentUser) return [];

    const allOrders = JSON.parse(localStorage.getItem('orders') || '{}');

    return Object.values(allOrders).filter(
        order => order.customerEmail === currentUser.email
    ).sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Add to favorites
function addToFavorites(flowerId) {
    if (!currentUser) {
        alert('Войдите в аккаунт, чтобы добавить в избранное');
        return false;
    }

    if (!currentUser.favorites.includes(flowerId)) {
        currentUser.favorites.push(flowerId);
        saveCurrentUser();
        return true;
    }
    return false;
}

// Remove from favorites
function removeFromFavorites(flowerId) {
    if (!currentUser) return false;

    const index = currentUser.favorites.indexOf(flowerId);
    if (index > -1) {
        currentUser.favorites.splice(index, 1);
        saveCurrentUser();
        return true;
    }
    return false;
}

// Check if item is in favorites
function isInFavorites(flowerId) {
    return currentUser && currentUser.favorites.includes(flowerId);
}

// Save current user to storage
function saveCurrentUser() {
    if (!currentUser) return;

    const users = JSON.parse(localStorage.getItem('users') || '{}');
    users[currentUser.id] = currentUser;
    localStorage.setItem('users', JSON.stringify(users));
}

// Update user profile
function updateProfile(updates) {
    if (!currentUser) return { success: false, message: 'Не авторизован' };

    Object.assign(currentUser, updates);
    saveCurrentUser();

    return { success: true, message: 'Профиль обновлен' };
}

// Add address
function addAddress(address) {
    if (!currentUser) return false;

    currentUser.addresses.push({
        id: 'addr_' + Date.now(),
        ...address,
        createdAt: new Date().toISOString()
    });

    saveCurrentUser();
    return true;
}

// Remove address
function removeAddress(addressId) {
    if (!currentUser) return false;

    currentUser.addresses = currentUser.addresses.filter(addr => addr.id !== addressId);
    saveCurrentUser();
    return true;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
});

// Export API
window.AuthAPI = {
    getCurrentUser: () => currentUser,
    isLoggedIn: () => !!currentUser,
    login,
    register,
    logout,
    getUserOrders,
    addToFavorites,
    removeFromFavorites,
    isInFavorites,
    updateProfile,
    addAddress,
    removeAddress
};
