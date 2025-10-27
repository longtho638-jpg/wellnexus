// public/js/main.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const appRoot = document.getElementById('app-root');
let auth;

// --- TEMPLATES (HTML literals for different pages) ---
const loginTemplate = `
    <div class="flex items-center justify-center h-screen">
        <div class="w-full max-w-sm bg-white p-8 rounded-lg shadow-md text-center">
            <h1 class="text-2xl font-bold mb-6">WellNexus Portal</h1>
            <button id="login-btn" class="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600">Sign in with Google</button>
        </div>
    </div>
`;

const dashboardTemplate = `
    <div class="container mx-auto p-8">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold">Partner Dashboard</h1>
            <button id="signout-btn" class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">Sign Out</button>
        </div>
        <div id="onboarding-journey"></div>
        <div id="metrics-content"></div>
    </div>
`;

// --- RENDER FUNCTIONS ---
function renderLogin() {
    appRoot.innerHTML = loginTemplate;
    document.getElementById('login-btn').addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    });
}

function renderDashboard(user) {
    appRoot.innerHTML = dashboardTemplate;
    document.getElementById('signout-btn').addEventListener('click', () => signOut(auth));
    // TODO: Fetch and render onboarding & metrics data
}

// --- MAIN APP LOGIC ---
async function main() {
    const response = await fetch('/api/getFirebaseConfig');
    const firebaseConfig = await response.json();
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);

    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in, show the dashboard
            renderDashboard(user);
        } else {
            // User is signed out, show the login page
            renderLogin();
        }
    });
}

main();
