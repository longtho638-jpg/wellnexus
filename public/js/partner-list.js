// public/js/partner-list.js
import { api } from './api.js';

export async function renderPartnerList(container, user) {
    container.innerHTML = `<div>Loading Partners...</div>`;
    try {
        const partners = await api.getPartnerList(user);
        let rows = partners.map(p => `
            <tr>
                <td>${p.name}</td>
                <td>${p.email}</td>
                <td>${p.status}</td>
                <td>${p.status === 'pending' ? `<button data-id="${p.id}" class="approve-btn">Approve</button>` : ''}</td>
            </tr>
        `).join('');
        container.innerHTML = `
            <h1 class="text-2xl font-bold">Partner Management</h1>
            <table><thead>...</thead><tbody>${rows}</tbody></table>
        `;
        // Add event listeners for approve buttons
        document.querySelectorAll('.approve-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                await api.approvePartner(user, btn.dataset.id);
                renderPartnerList(container, user); // Re-render
            });
        });
    } catch (error) {
        container.innerHTML = `<div>Error loading partners.</div>`;
    }
}
