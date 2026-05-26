import { Home } from './pages/Home.js';
import { AdminLogin } from './pages/AdminLogin.js';
import { AdminDashboard } from './pages/AdminDashboard.js';
import { WorkerResults } from './pages/WorkerResults.js';
import { initIcons } from './utils/icons.js';

const routes = {
    '/': Home,
    '/admin_login': AdminLogin,
    '/admin_page': AdminDashboard,
    '/worker_results': WorkerResults
};

export const Router = {
    init() {
        window.addEventListener('hashchange', this.handleRoute.bind(this));
        // Handle initial load
        this.handleRoute();
    },

    async handleRoute() {
        // Strip query params for route lookup (e.g. #/worker_results?id=123 -> /worker_results)
        let hash = window.location.hash.slice(1) || '/';
        const queryIndex = hash.indexOf('?');
        if (queryIndex !== -1) {
            hash = hash.substring(0, queryIndex);
        }

        const page = routes[hash] || Home;
        const app = document.getElementById('app');

        // Simple authorized check (Mock)
        // In a real app, strict checks would be here.
        // For this prototype, we rely on component-level redirects if needed.

        app.innerHTML = await page.render();

        // Post-render lifecycle (e.g., attaching event listeners)
        if (page.afterRender) {
            page.afterRender();
        }

        // Re-initialize icons for new content
        initIcons();
    },

    navigate(path) {
        window.location.hash = path;
    }
};
