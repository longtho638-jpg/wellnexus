// public/js/login.js
import { signInWithGoogle } from './auth.js';
export function renderLogin(container) {
    container.innerHTML = `
        <div class="w-full flex items-center justify-center">
            <div class="w-full max-w-sm bg-white p-8 rounded-lg shadow-md text-center">
                <h1 class="text-2xl font-bold mb-6">WellNexus Portal</h1>
                <button id="login-btn" class="w-full bg-red-500 text-white py-2 rounded-lg">Sign in with Google</button>
            </div>
        </div>
    `;
    document.getElementById('login-btn').addEventListener('click', signInWithGoogle);
}
