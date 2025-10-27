// public/js/main.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const appRoot = document.getElementById('app-root');
let auth;

// --- API HELPER ---
async function fetchMyMetrics(user) {
    if (!user) throw new Error("User not authenticated.");
    const idToken = await user.getIdToken();
    const response = await fetch('/api/getMyMetrics', {
        headers: { 'Authorization': `Bearer ${idToken}` },
    });
    if (!response.ok) throw new Error('Failed to fetch data');
    return response.json();
}

// --- TEMPLATES ---
const loginTemplate = `...`; // (same as before)

const dashboardTemplate = (userData) => `
    <div class="container mx-auto p-8">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold">Partner Dashboard</h1>
            <button id="signout-btn" class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">Sign Out</button>
        </div>
        <div id="onboarding-journey-container">Loading Onboarding Status...</div>
    </div>
`;

// --- RENDER FUNCTIONS ---
function renderLogin() { /* ... */ }

async function renderDashboard(user) {
    appRoot.innerHTML = dashboardTemplate(user);
    document.getElementById('signout-btn').addEventListener('click', () => signOut(auth));
    
    const onboardingContainer = document.getElementById('onboarding-journey-container');
    try {
        const data = await fetchMyMetrics(user);
        const { onboarding } = data;

        if (onboarding.status === 'pending') {
            onboardingContainer.innerHTML = '<div class="bg-yellow-100 p-4 rounded-lg">Your application is pending approval.</div>';
        } else if (onboarding.status === 'approved') {
            let stepsHtml = '<ul class="space-y-2">';
            onboarding.steps.sort((a,b) => a.id.localeCompare(b.id)).forEach(step => {
                const isCompleted = step.status === 'completed';
                stepsHtml += `<li class="flex items-center p-2 rounded ${isCompleted ? 'bg-green-100' : ''}">${isCompleted ? '✅' : '⏳'} <span class="ml-2">${step.title}</span></li>`;
            });
            stepsHtml += '</ul>';
            onboardingContainer.innerHTML = `<div class="bg-white p-6 rounded-lg shadow-md"><h2 class="font-bold mb-2">Your Onboarding Journey</h2>${stepsHtml}</div>`;
        }
    } catch (error) {
        onboardingContainer.innerHTML = `<div class="bg-red-100 p-4 rounded-lg">Error loading data: ${error.message}</div>`;
    }
}

// --- MAIN APP LOGIC ---
async function main() { /* ... */ }

main();
