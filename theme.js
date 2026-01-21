/**
 * Theme Management System
 * Handles light/dark theme switching with localStorage persistence
 */

(function() {
    'use strict';

    // Theme constants
    const THEME_KEY = 'flower-shop-theme';
    const THEME_LIGHT = 'light';
    const THEME_DARK = 'dark';

    // Get saved theme or default to light
    function getSavedTheme() {
        return localStorage.getItem(THEME_KEY) || THEME_LIGHT;
    }

    // Save theme to localStorage
    function saveTheme(theme) {
        localStorage.setItem(THEME_KEY, theme);
    }

    // Apply theme to document
    function applyTheme(theme, skipTransition = false) {
        if (skipTransition) {
            document.body.classList.add('no-transition');
        }

        document.documentElement.setAttribute('data-theme', theme);

        if (skipTransition) {
            // Force reflow
            document.body.offsetHeight;
            setTimeout(() => {
                document.body.classList.remove('no-transition');
            }, 100);
        } else {
            document.body.classList.add('theme-transitioning');
            setTimeout(() => {
                document.body.classList.remove('theme-transitioning');
            }, 300);
        }

        updateThemeButton(theme);
    }

    // Update theme toggle button
    function updateThemeButton(theme) {
        const button = document.getElementById('theme-toggle');
        if (!button) return;

        if (theme === THEME_DARK) {
            button.innerHTML = '☀️';
            button.setAttribute('data-tooltip', 'Светлая тема');
            button.setAttribute('aria-label', 'Переключить на светлую тему');
        } else {
            button.innerHTML = '🌙';
            button.setAttribute('data-tooltip', 'Темная тема');
            button.setAttribute('aria-label', 'Переключить на темную тему');
        }
    }

    // Toggle theme
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || THEME_LIGHT;
        const newTheme = currentTheme === THEME_LIGHT ? THEME_DARK : THEME_LIGHT;

        applyTheme(newTheme);
        saveTheme(newTheme);

        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('themechange', {
            detail: { theme: newTheme }
        }));

        // Analytics (if needed)
        console.log(`Theme changed to: ${newTheme}`);
    }

    // Initialize theme on page load
    function initTheme() {
        const savedTheme = getSavedTheme();
        applyTheme(savedTheme, true); // Skip transition on initial load
    }

    // Create theme toggle button
    function createThemeToggle() {
        // Check if button already exists
        if (document.getElementById('theme-toggle')) return;

        const button = document.createElement('button');
        button.id = 'theme-toggle';
        button.className = 'theme-toggle';
        button.setAttribute('aria-label', 'Переключить тему');
        button.onclick = toggleTheme;

        // Add keyboard support
        button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleTheme();
            }
        });

        document.body.appendChild(button);

        // Update button icon based on current theme
        const currentTheme = document.documentElement.getAttribute('data-theme') || THEME_LIGHT;
        updateThemeButton(currentTheme);
    }

    // Detect system theme preference
    function getSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return THEME_DARK;
        }
        return THEME_LIGHT;
    }

    // Listen for system theme changes
    function watchSystemTheme() {
        if (!window.matchMedia) return;

        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

        // Only apply system theme if user hasn't set a preference
        darkModeQuery.addEventListener('change', (e) => {
            if (!localStorage.getItem(THEME_KEY)) {
                const systemTheme = e.matches ? THEME_DARK : THEME_LIGHT;
                applyTheme(systemTheme);
            }
        });
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initTheme();
            createThemeToggle();
            watchSystemTheme();
        });
    } else {
        initTheme();
        createThemeToggle();
        watchSystemTheme();
    }

    // Expose theme API globally
    window.ThemeManager = {
        getTheme: () => document.documentElement.getAttribute('data-theme') || THEME_LIGHT,
        setTheme: (theme) => {
            if (theme === THEME_LIGHT || theme === THEME_DARK) {
                applyTheme(theme);
                saveTheme(theme);
            }
        },
        toggleTheme: toggleTheme,
        resetTheme: () => {
            localStorage.removeItem(THEME_KEY);
            const systemTheme = getSystemTheme();
            applyTheme(systemTheme);
        }
    };

})();
