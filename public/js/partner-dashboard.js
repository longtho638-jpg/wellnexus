// public/js/partner-dashboard.js
// ... (imports and helper functions remain the same)

function renderOnboardingJourney(steps) {
    const journeyEl = document.getElementById('onboarding-journey');
    const listEl = journeyEl.querySelector('ul');
    listEl.innerHTML = ''; // Clear the static list

    steps.sort((a, b) => a.id.localeCompare(b.id)); // Ensure order

    steps.forEach(step => {
        const isCompleted = step.status === 'completed';
        const li = document.createElement('li');
        li.className = `flex items-center ${!isCompleted ? 'opacity-50' : ''}`;

        const iconDiv = document.createElement('div');
        iconDiv.className = `w-8 h-8 rounded-full flex items-center justify-center mr-4 font-bold ${isCompleted ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'}`;
        iconDiv.textContent = listEl.children.length + 1;

        const span = document.createElement('span');
        span.textContent = step.title;

        li.appendChild(iconDiv);
        li.appendChild(span);
        listEl.appendChild(li);
    });
}

async function renderDashboard() {
    const loadingEl = document.getElementById('loading');
    const onboardingPendingEl = document.getElementById('onboarding-pending');
    const onboardingJourneyEl = document.getElementById('onboarding-journey');
    const contentEl = document.getElementById('dashboard-content');
    
    try {
        // ... (Firebase initialization and user fetching remains the same)
        const user = auth.currentUser;
        const data = await fetchPersonalizedData(user);
        const { onboarding } = data;

        // --- Handle Onboarding Status ---
        if (onboarding.status === 'pending') {
            onboardingPendingEl.classList.remove('hidden');
        } else if (onboarding.status === 'approved') {
            renderOnboardingJourney(onboarding.steps);
            onboardingJourneyEl.classList.remove('hidden');
            contentEl.classList.remove('hidden');
        }

        loadingEl.classList.add('hidden');

    } catch (error) {
        loadingEl.textContent = `Failed to load your dashboard: ${error.message}`;
        loadingEl.classList.add('text-red-500');
    }
}

// ... (main execution logic remains the same)
