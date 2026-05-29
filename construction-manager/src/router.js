import { Home } from './pages/Home.js';
import { AdminLogin } from './pages/AdminLogin.js';
import { AdminDashboard } from './pages/AdminDashboard.js';
import { WorkerResults } from './pages/WorkerResults.js';
import { initIcons } from './utils/icons.js';
import { AppContext } from './context/AppContext.js';

const routes = {
    '/': Home,
    '/admin_login': AdminLogin,
    '/admin_page': AdminDashboard,
    '/worker_results': WorkerResults
};

const PROTECTED_ROUTES = ['/admin_page'];
const ADMIN_ONLY_ROUTES = ['/admin_page'];

export const Router = {
    init() {
        window.addEventListener('hashchange', this.handleRoute.bind(this));
        this.handleRoute();
    },

    async handleRoute() {
        let hash = window.location.hash.slice(1) || '/';
        const queryIndex = hash.indexOf('?');
        if (queryIndex !== -1) {
            hash = hash.substring(0, queryIndex);
        }

        const page = routes[hash] || Home;
        const app = document.getElementById('app');

        if (!app) {
            console.error('❌ App container not found');
            return;
        }

        if (PROTECTED_ROUTES.includes(hash) && !AppContext.currentUser) {
            this.navigate('/admin_login');
            return;
        }

        if (ADMIN_ONLY_ROUTES.includes(hash) && AppContext.currentUser?.role !== 'admin') {
            this.navigate('/');
            return;
        }

        try {
            app.innerHTML = await page.render();
            if (page.afterRender) page.afterRender();
            initIcons();
        } catch (error) {
            console.error('❌ Route rendering error:', error);
            app.innerHTML = `
                <div class="container flex-center" style="min-height: 80vh;">
                    <div class="glass-card" style="text-align: center;">
                        <h2 style="color: var(--danger);">⚠️ Error</h2>
                        <p>Failed to load page. Please try again.</p>
                    </div>
                </div>
            `;
        }
    },

    navigate(path) {
        window.location.hash = path;
    },

    getCurrentRoute() {
        return window.location.hash.slice(1) || '/';
    },

    getQueryParam(name) {
        const hash = window.location.hash.slice(1) || '';
        const queryIndex = hash.indexOf('?');
        if (queryIndex === -1) return null;
        const query = hash.substring(queryIndex + 1);
        const params = new URLSearchParams(query);
        return params.get(name);
    }
};