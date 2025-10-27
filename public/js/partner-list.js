// public/js/partner-list.js
// This script requires Firebase SDKs to be loaded. We'll add them to the HTML.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, onSnapshot, query } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY", // Replace with your actual config
    authDomain: "apex-ba819.firebaseapp.com",
    projectId: "apex-ba819",
    storageBucket: "apex-ba819.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
    const loadingEl = document.getElementById('loading');
    const tableEl = document.getElementById('partner-table');
    const tableBody = document.getElementById('partner-list-body');

    const q = query(collection(db, "partners"));

    onSnapshot(q, (querySnapshot) => {
        loadingEl.classList.add('hidden');
        tableEl.classList.remove('hidden');
        tableBody.innerHTML = ''; // Clear previous data

        querySnapshot.forEach((doc) => {
            const partner = doc.data();
            const partnerId = doc.id;
            const row = document.createElement('tr');
            
            let actionButton = `<span class="text-green-500 font-semibold">Approved</span>`;
            if (partner.status === 'pending') {
                actionButton = `<button data-id="${partnerId}" class="approve-btn bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">Approve</button>`;
            }

            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">${partner.name}</td>
                <td class="px-6 py-4 whitespace-nowrap">${partner.email}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${partner.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                        ${partner.status}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">${actionButton}</td>
            `;
            tableBody.appendChild(row);
        });
    });

    tableBody.addEventListener('click', async (event) => {
        if (event.target.classList.contains('approve-btn')) {
            const button = event.target;
            const partnerId = button.dataset.id;
            button.textContent = 'Approving...';
            button.disabled = true;

            try {
                const response = await fetch('/api/partner/approve', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ partnerId }),
                });

                if (!response.ok) {
                    throw new Error('API call failed.');
                }
                // Firestore's onSnapshot will automatically update the UI
            } catch (error) {
                console.error('Failed to approve partner:', error);
                button.textContent = 'Retry';
                button.disabled = false;
            }
        }
    });
});
