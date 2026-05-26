import { Router } from './router.js';
import { AppContext } from './context/AppContext.js';
import { initIcons } from './utils/icons.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize App Context
    AppContext.init();

    // Initialize Router
    Router.init();

    // Initial Icon Render
    initIcons();
});
