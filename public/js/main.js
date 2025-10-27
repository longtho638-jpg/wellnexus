// public/js/main.js
// ... (imports and top-level code remain the same)

// ... (API Helpers remain the same)

// --- RENDER FUNCTIONS ---
// ... (renderLogin remains the same)

async function renderDashboard(user) {
    appRoot.innerHTML = dashboardTemplate(user);
    document.getElementById('signout-btn').addEventListener('click', () => signOut(auth));
    
    const onboardingContainer = document.getElementById('onboarding-journey-container');
    const refCodeContainer = document.getElementById('ref-code-container');
    
    try {
        const data = await fetchMyMetrics(user);
        const { onboarding, partner } = data;

        // --- Render Referral Code ---
        if (partner && partner.refCode) {
            // ... (Ref code rendering logic is correct and remains the same)
        }

        // --- Render Onboarding Journey ---
        if (onboarding.status === 'approved') {
            let stepsHtml = '<ul class="space-y-2">';
            data.onboarding.steps.sort((a,b) => a.id.localeCompare(b.id)).forEach(step => {
                
                // --- PATCH CORE: Override step 7 status if refCode exists ---
                if (step.id === 'day7' && partner && partner.refCode) {
                    step.status = 'completed';
                }
                // --- END PATCH ---

                let stepHtml;
                switch (step.status) {
                    case 'completed':
                        stepHtml = `<li class="flex items-center p-2 rounded bg-green-100">✅ <span class="ml-2">${step.title}</span><span class="ml-auto font-semibold text-green-700">Done</span></li>`;
                        break;
                    case 'active':
                        let buttonHtml = `<button data-step-id="${step.id}" class="complete-step-btn ml-auto bg-blue-500 text-white px-3 py-1 rounded">Start</button>`;
                        if (step.id === 'day7') {
                            buttonHtml = `<button data-step-id="${step.id}" class="generate-code-btn ml-auto bg-purple-500 text-white px-3 py-1 rounded">Generate Code</button>`;
                        }
                        stepHtml = `<li class="flex items-center p-2 rounded bg-blue-100">⏳ <span class="ml-2">${step.title}</span>${buttonHtml}</li>`;
                        break;
                    default: // locked
                        stepHtml = `<li class="flex items-center p-2 rounded opacity-50">🔒 <span class="ml-2">${step.title}</span><span class="ml-auto text-xs text-gray-500">Locked</span></li>`;
                        break;
                }
                stepsHtml += stepHtml;
            });
            stepsHtml += '</ul>';
            onboardingContainer.innerHTML = `<div class="bg-white p-6 rounded-lg shadow-md"><h2 class="font-bold mb-2">Your Onboarding Journey</h2>${stepsHtml}</div>`;
            
            // ... (Event listeners remain the same)
        }
    } catch (error) {
        onboardingContainer.innerHTML = `<div class="bg-red-100 p-4 rounded-lg">Error loading data: ${error.message}</div>`;
    }
}

// ... (main function remains the same)
