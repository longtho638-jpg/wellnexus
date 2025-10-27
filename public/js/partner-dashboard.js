// public/js/partner-dashboard.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { handleSignOut } from './auth-actions.js'; // Import the sign-out handler

// ... (getFirebaseConfigData and fetchPersonalizedMetrics functions remain the same)

async function renderDashboard() {
    // ... (rest of the rendering logic remains the same)
}

// --- Main execution ---
document.addEventListener('DOMContentLoaded', () => {
    renderDashboard();

    const signOutBtn = document.getElementById('signout-btn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', handleSignOut);
    }
});
