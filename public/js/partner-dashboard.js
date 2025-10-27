// public/js/partner-dashboard.js
// ... (imports and helper functions remain the same)

function renderOnboardingJourney(steps, user) {
    const journeyEl = document.getElementById('onboarding-journey');
    const listEl = journeyEl.querySelector('ul');
    listEl.innerHTML = '';

    steps.sort((a, b) => a.id.localeCompare(b.id));

    steps.forEach(step => {
        const li = document.createElement('li');
        li.className = 'flex items-center p-2 rounded-lg';
        
        let iconHtml, actionHtml;

        switch (step.status) {
            case 'completed':
                li.classList.add('bg-green-50');
                iconHtml = `<div class="w-8 h-8 rounded-full flex items-center justify-center mr-4 font-bold bg-green-500 text-white">✓</div>`;
                actionHtml = `<span class="ml-auto font-semibold text-green-600">Done</span>`;
                break;
            case 'active':
                iconHtml = `<div class="w-8 h-8 rounded-full flex items-center justify-center mr-4 font-bold bg-blue-500 text-white animate-pulse">${listEl.children.length + 1}</div>`;
                actionHtml = `<button data-step-id="${step.id}" class="complete-step-btn ml-auto bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Start</button>`;
                break;
            case 'locked':
            default:
                li.classList.add('opacity-50');
                iconHtml = `<div class="w-8 h-8 rounded-full flex items-center justify-center mr-4 font-bold bg-gray-300 text-gray-700">🔒</div>`;
                actionHtml = `<span class="ml-auto text-xs text-gray-500">Locked</span>`;
                break;
        }
        
        li.innerHTML = `${iconHtml}<span>${step.title}</span>${actionHtml}`;
        listEl.appendChild(li);
    });

    // Add event listeners ONLY to active "Start" buttons
    document.querySelectorAll('.complete-step-btn').forEach(button => {
        button.addEventListener('click', () => handleCompleteStep(button.dataset.stepId, user));
    });
}

// ... (Rest of the file remains the same, handleCompleteStep will now trigger the transaction)
