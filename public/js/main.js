// public/js/main.js
// ... (imports and top-level code remain the same)

// --- API HELPERS ---
// ... (fetchMyMetrics remains the same)
async function completeStepAPI(user, stepId) {
    if (!user) throw new Error("User not authenticated.");
    const idToken = await user.getIdToken();
    const response = await fetch('/api/completeOnboardingStep', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stepId }),
    });
    if (!response.ok) throw new Error('Failed to complete step');
    return response.json();
}

// --- RENDER FUNCTIONS ---
// ... (renderLogin remains the same)

async function renderDashboard(user) {
    appRoot.innerHTML = dashboardTemplate(user);
    document.getElementById('signout-btn').addEventListener('click', () => signOut(auth));
    
    const onboardingContainer = document.getElementById('onboarding-journey-container');
    try {
        const data = await fetchMyMetrics(user);
        // ... (onboarding status check remains the same)

        if (data.onboarding.status === 'approved') {
            let stepsHtml = '<ul class="space-y-2">';
            data.onboarding.steps.sort((a,b) => a.id.localeCompare(b.id)).forEach(step => {
                let stepHtml;
                switch (step.status) {
                    case 'completed':
                        stepHtml = `<li class="flex items-center p-2 rounded bg-green-100">✅ <span class="ml-2">${step.title}</span><span class="ml-auto font-semibold text-green-700">Done</span></li>`;
                        break;
                    case 'active':
                        stepHtml = `<li class="flex items-center p-2 rounded bg-blue-100">⏳ <span class="ml-2">${step.title}</span><button data-step-id="${step.id}" class="complete-step-btn ml-auto bg-blue-500 text-white px-3 py-1 rounded">Start</button></li>`;
                        break;
                    default: // locked
                        stepHtml = `<li class="flex items-center p-2 rounded opacity-50">🔒 <span class="ml-2">${step.title}</span><span class="ml-auto text-xs text-gray-500">Locked</span></li>`;
                        break;
                }
                stepsHtml += stepHtml;
            });
            stepsHtml += '</ul>';
            onboardingContainer.innerHTML = `<div class="bg-white p-6 rounded-lg shadow-md"><h2 class="font-bold mb-2">Your Onboarding Journey</h2>${stepsHtml}</div>`;
            
            // Add event listeners AFTER rendering
            document.querySelectorAll('.complete-step-btn').forEach(button => {
                button.addEventListener('click', async () => {
                    button.textContent = 'Working...';
                    await completeStepAPI(user, button.dataset.stepId);
                    renderDashboard(user); // Re-render the dashboard to show the new state
                });
            });
        }
    } catch (error) {
        onboardingContainer.innerHTML = `<div class="bg-red-100 p-4 rounded-lg">Error loading data: ${error.message}</div>`;
    }
}
// ... (main function remains the same)
