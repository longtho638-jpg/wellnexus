// functions/src/index.ts
import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { onUserCreate } from "firebase-functions/v2/auth";

admin.initializeApp();
const db = admin.firestore();

const ONBOARDING_STEPS_CONFIG = ['day1', 'day3', 'day7', 'day14', 'day21', 'day30'];

export const apiHandler = onRequest({ region: "asia-southeast1", cors: true }, async (req, res) => {
    const path = req.path.split('/').pop();
    logger.info(`API call for: ${path}`);

    switch (path) {
        // ... (getFirebaseConfig, getMyMetrics cases remain the same)
        
        case 'completeOnboardingStep':
            const idToken = req.headers.authorization?.split('Bearer ')[1];
            if (!idToken) { res.status(401).send('Unauthorized'); return; }

            const { stepId } = req.body;
            if (!stepId) { res.status(400).json({ error: "Missing stepId" }); return; }

            try {
                const decodedToken = await admin.auth().verifyIdToken(idToken);
                const partnerId = decodedToken.uid;
                const partnerRef = db.collection("partners").doc(partnerId);

                await db.runTransaction(async (transaction) => {
                    const currentStepRef = partnerRef.collection("onboarding_steps").doc(stepId);
                    const currentStepDoc = await transaction.get(currentStepRef);

                    if (!currentStepDoc.exists || currentStepDoc.data()?.status !== 'active') {
                        throw new Error("Step is not active or does not exist.");
                    }

                    transaction.update(currentStepRef, { status: "completed" });

                    const currentIndex = ONBOARDING_STEPS_CONFIG.indexOf(stepId);
                    const nextStepId = ONBOARDING_STEPS_CONFIG[currentIndex + 1];
                    if (nextStepId) {
                        const nextStepRef = partnerRef.collection("onboarding_steps").doc(nextStepId);
                        transaction.update(nextStepRef, { status: "active" });
                    }
                });
                
                res.status(200).json({ message: `Step ${stepId} completed.` });
            } catch (error) {
                logger.error(`Failed to complete step ${stepId}`, { error: (error as Error).message });
                res.status(500).json({ error: (error as Error).message });
            }
            break;

        default:
            res.status(404).send('Not Found');
    }
});

// ... (onUserCreate trigger remains the same)
