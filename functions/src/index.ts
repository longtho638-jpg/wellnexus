// functions/src/index.ts
import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
// ... other imports

admin.initializeApp();
const db = admin.firestore();

export const apiHandler = onRequest({ region: "asia-southeast1", cors: true }, async (req, res) => {
    const path = req.path.split('/').pop();

    switch (path) {
        case 'getMyMetrics':
            const idToken = req.headers.authorization?.split('Bearer ')[1];
            if (!idToken) { res.status(401).send('Unauthorized'); return; }

            try {
                const decodedToken = await admin.auth().verifyIdToken(idToken);
                const partnerId = decodedToken.uid;
                const partnerRef = db.collection('partners').doc(partnerId);
                // ... (logic to get onboarding steps remains the same)

                const [partnerDoc, onboardingSnapshot] = await Promise.all([ /* ... */ ]);
                if (!partnerDoc.exists) { res.status(404).json({ error: "Partner profile not found." }); return; }

                const partnerData = partnerDoc.data() || {};
                const onboardingSteps = onboardingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                res.status(200).json({
                    onboarding: {
                        status: partnerData.status,
                        steps: onboardingSteps,
                    },
                    partner: {
                        refCode: partnerData.refCode || null // <<< ADDED THIS LINE
                    }
                });
            } catch (error) {
                // ... error handling
            }
            break;
        // ... other cases
    }
});

// ... (Other functions remain the same)
