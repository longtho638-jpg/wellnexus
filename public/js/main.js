// public/js/main.js
// --- MAIN APP ENTRY POINT ---
import { handleAuthStateChanged } from './auth.js';
import { renderAppShell } from './ui-shell.js';
import { renderRouter } from './router.js';

function main() {
    handleAuthStateChanged((user) => {
        const appContainer = document.getElementById('app-container');
        if (user) {
            renderAppShell(appContainer, user);
            renderRouter(user); // Handle routing for authenticated users
        } else {
            // Render a full-page login view if not authenticated
            appContainer.innerHTML = `<div class="w-full"></div>`; // Placeholder for login component
            import('./login.js').then(module => module.renderLogin(appContainer));
        }
    });
}

main();
