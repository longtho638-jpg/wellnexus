// functions/src/index.ts
import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

admin.initializeApp();
const db = admin.firestore();

export const apiHandler = onRequest({ region: "asia-southeast1", cors: true }, async (req, res) => {
    const path = req.path.split('/').pop();
    logger.info(`API call received for: ${path}`);

    switch (path) {
        case 'getFirebaseConfig':
            res.status(200).json(JSON.parse(process.env.FIREBASE_CONFIG || '{}'));
            break;

        case 'getMyMetrics':
            const idToken = req.headers.authorization?.split('Bearer ')[1];
            if (!idToken) {
                res.status(401).send('Unauthorized');
                return;
            }
            try {
                const decodedToken = await admin.auth().verifyIdToken(idToken);
                const partnerId = decodedToken.uid;
                const partnerRef = db.collection('partners').doc(partnerId);
                const onboardingStepsQuery = partnerRef.collection("onboarding_steps");

                const [partnerDoc, onboardingSnapshot] = await Promise.all([
                    partnerRef.get(),
                    onboardingStepsQuery.get()
                ]);

                if (!partnerDoc.exists) {
                    res.status(404).json({ error: "Partner profile not found." });
                    return;
                }

                const onboardingSteps = onboardingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                res.status(200).json({
                    onboarding: {
                        status: partnerDoc.data()?.status,
                        steps: onboardingSteps,
                    },
                    // Metrics can be added here later
                });
            } catch (error) {
                logger.error("Failed to get my metrics", error);
                res.status(403).json({ error: "Authentication failed." });
            }
            break;

        case 'healthCheck':
            res.status(200).json({ status: "ok" });
            break;
            
        default:
            res.status(404).send('Not Found');
    }
});
