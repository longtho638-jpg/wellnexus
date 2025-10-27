// public/js/router.js
import { renderDashboard } from './dashboard.js';
import { renderPartnerList } from './partner-list.js';

export function renderRouter(user) {
    const mainContent = document.getElementById('main-content');
    const routes = {
        '#/dashboard': () => renderDashboard(mainContent, user),
        '#/partners': () => renderPartnerList(mainContent, user),
    };

    function navigate() {
        const path = window.location.hash || '#/dashboard';
        const renderFunc = routes[path] || routes['#/dashboard'];
        renderFunc();
    }

    window.addEventListener('hashchange', navigate);
    navigate(); // Initial render
}
