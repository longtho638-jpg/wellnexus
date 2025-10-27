// public/js/partner-dashboard.js
// ... (imports and helper functions remain the same)

async function handleCompleteStep(stepId, user) {
    const button = document.querySelector(`button[data-step-id="${stepId}"]`);
    button.textContent = 'Completing...';
    button.disabled = true;

    try {
        const idToken = await user.getIdToken();
        const response = await fetch('/api/completeOnboardingStep', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${idToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ stepId }),
        });

        if (!response.ok) { throw new Error('API call failed'); }
        // Firestore's onSnapshot would ideally handle the UI update,
        // but for now, we can optimistically update the UI.
        button.textContent = 'Completed';
        button.className = 'ml-auto bg-green-500 text-white px-3 py-1 rounded-full cursor-not-allowed';
        const listItem = button.closest('li');
        listItem.classList.remove('opacity-50');
        const iconDiv = listItem.querySelector('div');
        iconDiv.className = 'w-8 h-8 rounded-full flex items-center justify-center mr-4 font-bold bg-green-500 text-white';

    } catch (error) {
        console.error(`Failed to complete step ${stepId}:`, error);
        button.textContent = 'Retry';
        button.disabled = false;
    }
}

function renderOnboardingJourney(steps, user) {
    const journeyEl = document.getElementById('onboarding-journey');
    const listEl = journeyEl.querySelector('ul');
    listEl.innerHTML = '';

    steps.sort((a, b) => a.id.localeCompare(b.id));

    steps.forEach(step => {
        const isCompleted = step.status === 'completed';
        const li = document.createElement('li');
        li.className = `flex items-center p-2 rounded-lg ${!isCompleted ? 'opacity-75' : 'bg-green-50'}`;
        
        // ... (icon and text rendering remains the same)
        let actionHtml = `<span class="ml-auto font-semibold text-green-600">Done</span>`;
        if (!isCompleted) {
            actionHtml = `<button data-step-id="${step.id}" class="complete-step-btn ml-auto bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Complete</button>`;
        }
        
        li.innerHTML = `
            <div class="w-8 h-8 rounded-full flex items-center justify-center mr-4 font-bold ${isCompleted ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'}">${listEl.children.length + 1}</div>
            <span>${step.title}</span>
            ${actionHtml}
        `;

        listEl.appendChild(li);
    });

    // Add event listeners to all "Complete" buttons
    document.querySelectorAll('.complete-step-btn').forEach(button => {
        button.addEventListener('click', () => handleCompleteStep(button.dataset.stepId, user));
    });
}

async function renderDashboard() {
    // ... (logic to fetch data remains the same)
    const user = auth.currentUser;
    const data = await fetchPersonalizedData(user);
    if (data.onboarding.status === 'approved') {
        renderOnboardingJourney(data.onboarding.steps, user); // Pass user object
        // ...
    }
}

// ... (main execution logic remains the same)
