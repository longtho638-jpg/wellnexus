// public/js/auth-actions.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

let auth;

async function initializeFirebase() {
    if (auth) return auth;
    const response = await fetch('/api/getFirebaseConfig');
    const firebaseConfig = await response.json();
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    return auth;
}

export async function handleSignOut() {
    try {
        const authInstance = await initializeFirebase();
        await signOut(authInstance);
        console.log("User signed out successfully.");
        window.location.href = '/login'; // Redirect to login page after sign out
    } catch (error) {
        console.error("Sign out failed:", error);
        alert(`Sign out failed: ${error.message}`);
    }
}
