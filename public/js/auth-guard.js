// public/js/auth-guard.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

async function initializeFirebase() {
    const response = await fetch('/api/getFirebaseConfig');
    const firebaseConfig = await response.json();
    const app = initializeApp(firebaseConfig);
    return getAuth(app);
}

const auth = await initializeFirebase();

onAuthStateChanged(auth, (user) => {
    if (!user) {
        // If not logged in, redirect to the login page
        console.log("User not authenticated. Redirecting to /login");
        window.location.href = '/login';
    } else {
        // If logged in, show the protected content
        document.body.classList.remove('hidden');
    }
});
