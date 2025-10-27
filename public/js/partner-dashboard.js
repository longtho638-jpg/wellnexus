// public/js/partner-dashboard.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// This auth logic is now part of the main dashboard flow
async function getFirebaseConfigData() {
    const response = await fetch('/api/getFirebaseConfig');
    return await response.json();
}

async function fetchPersonalizedMetrics(user) {
    if (!user) {
        throw new Error("User not authenticated.");
    }

    const idToken = await user.getIdToken();
    const response = await fetch('/api/getMyMetrics', {
        headers: {
            'Authorization': `Bearer ${idToken}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API returned status ${response.status}`);
    }
    return await response.json();
}

async function renderDashboard() {
    const loadingEl = document.getElementById('loading');
    const contentEl = document.getElementById('dashboard-content');
    const totalClicksEl = document.getElementById('total-clicks');
    const totalSalesEl = document.getElementById('total-sales');
    const totalCommissionEl = document.getElementById('total-commission');

    try {
        const firebaseConfig = await getFirebaseConfigData();
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const user = auth.currentUser;

        const summary = await fetchPersonalizedMetrics(user);

        // Update the UI with personalized data
        if (totalClicksEl) totalClicksEl.textContent = summary.totalClicks.toLocaleString();
        if (totalSalesEl) totalSalesEl.textContent = summary.totalSales.toLocaleString();
        if (totalCommissionEl) totalCommissionEl.textContent = `$${summary.totalCommission.toFixed(2)}`;
        
        // --- Chart.js Integration ---
        const ctx = document.getElementById('metricsChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Your Clicks', 'Your Sales'],
                datasets: [{
                    label: 'Your Performance',
                    data: [summary.totalClicks, summary.totalSales],
                    backgroundColor: ['rgba(59, 130, 246, 0.5)', 'rgba(16, 185, 129, 0.5)'],
                    borderColor: ['rgba(59, 130, 246, 1)', 'rgba(16, 185, 129, 1)'],
                    borderWidth: 1
                }]
            }
        });

        loadingEl.classList.add('hidden');
        contentEl.classList.remove('hidden');

    } catch (error) {
        loadingEl.textContent = `Failed to load your dashboard: ${error.message}`;
        loadingEl.classList.add('text-red-500');
    }
}

// The auth guard will ensure this runs only when the user is authenticated
renderDashboard();
