// public/js/register.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('register-form');
    const messageEl = document.getElementById('message');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        messageEl.textContent = 'Registering...';
        messageEl.className = 'text-gray-500';

        const name = form.elements.name.value;
        const email = form.elements.email.value;

        try {
            const response = await fetch('/api/partner/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Registration failed.');
            }
            
            messageEl.textContent = `Success! Your Partner ID is ${result.id}. You will be contacted after approval.`;
            messageEl.className = 'text-green-500';
            form.reset();

        } catch (error) {
            messageEl.textContent = `Error: ${error.message}`;
            messageEl.className = 'text-red-500';
        }
    });
});
