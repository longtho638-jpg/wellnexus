// public/js/partner-list.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, onSnapshot, query } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

async function initializeFirebase() {
    try {
        const response = await fetch('/api/getFirebaseConfig');
        if (!response.ok) {
            throw new Error('Failed to fetch Firebase config');
        }
        const firebaseConfig = await response.json();
        
        const app = initializeApp(firebaseConfig);
        return getFirestore(app);
    } catch (error) {
        console.error("Could not initialize Firebase:", error);
        document.getElementById('loading').textContent = `Error: Could not initialize Firebase. ${error.message}`;
        return null;
    }
}

async function main() {
    const db = await initializeFirebase();
    if (!db) return;

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
            } catch (error) {
                console.error('Failed to approve partner:', error);
                button.textContent = 'Retry';
                button.disabled = false;
            }
        }
    });
}

main();
