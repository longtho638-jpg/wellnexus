// public/js/partner-dashboard.js
document.addEventListener('DOMContentLoaded', async () => {
    const loadingEl = document.getElementById('loading');
    const contentEl = document.getElementById('dashboard-content');
    const totalClicksEl = document.getElementById('total-clicks');
    const totalSalesEl = document.getElementById('total-sales');
    const totalCommissionEl = document.getElementById('total-commission');

    try {
        // Fetch summary data from our live API
        const response = await fetch('/api/metrics/summary');
        if (!response.ok) {
            throw new Error(`API returned status ${response.status}`);
        }
        const summary = await response.json();

        // Update the UI with real data
        if (totalClicksEl) totalClicksEl.textContent = summary.totalClicks.toLocaleString();
        if (totalSalesEl) totalSalesEl.textContent = summary.totalSales.toLocaleString();
        if (totalCommissionEl) totalCommissionEl.textContent = `$${summary.totalCommission.toFixed(2)}`;
        
        // --- Chart.js Integration ---
        const ctx = document.getElementById('metricsChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Clicks', 'Sales'],
                datasets: [{
                    label: 'Performance Summary',
                    data: [summary.totalClicks, summary.totalSales],
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.5)',
                        'rgba(16, 185, 129, 0.5)',
                    ],
                    borderColor: [
                        'rgba(59, 130, 246, 1)',
                        'rgba(16, 185, 129, 1)',
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Show the dashboard content
        loadingEl.classList.add('hidden');
        contentEl.classList.remove('hidden');

    } catch (error) {
        loadingEl.textContent = `Failed to load dashboard: ${error.message}`;
        loadingEl.classList.add('text-red-500');
    }
});
