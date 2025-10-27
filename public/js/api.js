// public/js/api.js
async function authenticatedFetch(user, path, options = {}) {
    const idToken = await user.getIdToken();
    return fetch(`/api/${path}`, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json',
        },
    }).then(res => res.json());
}

export const api = {
    getMyMetrics: (user) => authenticatedFetch(user, 'getMyMetrics'),
    getPartnerList: (user) => authenticatedFetch(user, 'getPartnerList'),
    approvePartner: (user, partnerId) => authenticatedFetch(user, 'approvePartner', {
        method: 'POST',
        body: JSON.stringify({ partnerId }),
    }),
    // ... add other API calls here
};
