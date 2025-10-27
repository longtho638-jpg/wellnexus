// public/js/auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

async function initializeFirebase() {
    const response = await fetch('/api/getFirebaseConfig');
    const firebaseConfig = await response.json();
    const app = initializeApp(firebaseConfig);
    return getAuth(app);
}

document.addEventListener('DOMContentLoaded', async () => {
    const auth = await initializeFirebase();
    if (!auth) {
        document.getElementById('message').textContent = 'Error: Could not initialize authentication.';
        return;
    }

    const loginBtn = document.getElementById('login-btn');
    const messageEl = document.getElementById('message');

    // Redirect if already logged in
    onAuthStateChanged(auth, (user) => {
        if (user) {
            window.location.href = '/partner-dashboard';
        }
    });

    loginBtn.addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            // onAuthStateChanged will handle the redirect
            messageEl.textContent = 'Login successful! Redirecting...';
        } catch (error) {
            console.error("Authentication failed:", error);
            messageEl.textContent = `Login failed: ${error.message}`;
            messageEl.className = 'text-red-500';
        }
    });
});
