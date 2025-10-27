// public/js/main.js
// ... (imports and top-level code remain the same)

// --- API HELPERS ---
// ... (fetchMyMetrics, completeStepAPI remain the same)
async function generateCodeAPI(user) {
    if (!user) throw new Error("User not authenticated.");
    const idToken = await user.getIdToken();
    const response = await fetch('/api/generateReferralCode', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${idToken}` },
    });
    if (!response.ok) throw new Error('Failed to generate code');
    return response.json();
}

// --- RENDER FUNCTIONS ---
// ... (renderLogin remains the same)

async function renderDashboard(user) {
    // ... (logic to fetch data and handle pending status remains the same)

    if (data.onboarding.status === 'approved') {
        let stepsHtml = '<ul class="space-y-2">';
        data.onboarding.steps.sort((a,b) => a.id.localeCompare(b.id)).forEach(step => {
            let stepHtml;
            if (step.id === 'day7' && step.status === 'active') {
                stepHtml = `<li class="flex items-center p-2 rounded bg-purple-100">...<button data-step-id="${step.id}" class="generate-code-btn ml-auto bg-purple-500 text-white px-3 py-1 rounded">Generate Code</button></li>`;
            } else if (step.status === 'active') {
                stepHtml = `<li class="flex items-center p-2 rounded bg-blue-100">...<button data-step-id="${step.id}" class="complete-step-btn ml-auto bg-blue-500 text-white px-3 py-1 rounded">Start</button></li>`;
            }
            // ... (completed and locked cases remain the same)
            stepsHtml += stepHtml;
        });
        stepsHtml += '</ul>';
        onboardingContainer.innerHTML = `...${stepsHtml}`;
        
        // Add event listeners AFTER rendering for both button types
        document.querySelectorAll('.complete-step-btn').forEach(button => {
            button.addEventListener('click', async () => {
                button.textContent = 'Working...';
                await completeStepAPI(user, button.dataset.stepId);
                renderDashboard(user); // Re-render
            });
        });
        document.querySelectorAll('.generate-code-btn').forEach(button => {
            button.addEventListener('click', async () => {
                button.textContent = 'Generating...';
                await generateCodeAPI(user);
                renderDashboard(user); // Re-render
            });
        });
    }
}
// ... (main function remains the same)
