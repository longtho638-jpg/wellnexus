// public/js/ui-shell.js
import { handleSignOut } from './auth.js';
export function renderAppShell(container, user) {
    container.innerHTML = `
        <aside class="w-64 bg-gray-800 text-white p-4">
            <h1 class="font-bold text-xl mb-4">WellNexus</h1>
            <nav class="flex flex-col space-y-2">
                <a href="#/dashboard" class="hover:bg-gray-700 p-2 rounded">Dashboard</a>
                <a href="#/partners" class="hover:bg-gray-700 p-2 rounded">Partner Management</a>
            </nav>
            <div class="mt-auto pt-4 border-t border-gray-700">
                <p class="text-sm">${user.email}</p>
                <button id="signout-btn" class="text-red-400 hover:underline">Sign Out</button>
            </div>
        </aside>
        <main id="main-content" class="flex-1 p-8"></main>
    `;
    document.getElementById('signout-btn').addEventListener('click', handleSignOut);
}
