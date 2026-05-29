import { Router } from './router.js';
import { AppContext } from './context/AppContext.js';
import { initIcons } from './utils/icons.js';
import { setupModalListeners } from './components/Modal.js';

document.addEventListener('DOMContentLoaded', () => {
    const storedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', storedTheme);

    AppContext.init().then(() => {
        Router.init();
        initIcons();
        setupModalListeners();
        console.log('✅ Construction Manager initialized');
    }).catch(error => {
        console.error('❌ Failed to initialize app:', error);
        document.body.innerHTML = `
            <div class="container flex-center" style="min-height: 100vh;">
                <div class="glass-card" style="text-align: center; max-width: 500px;">
                    <h1 style="color: var(--danger);">⚠️ Error</h1>
                    <p>Failed to load application. Please try refreshing the page.</p>
                    <p style="color: var(--text-muted); font-size: 0.875rem;">${error.message}</p>
                </div>
            </div>
        `;
    });
});