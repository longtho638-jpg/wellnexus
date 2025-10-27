import { onRequest } from "firebase-functions/v2/https";
import { onUserCreate } from "firebase-functions/v2/auth";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

admin.initializeApp();
const db = admin.firestore();

// ... (ONBOARDING_STEPS constant and createPartnerProfile function remain the same)

// --- NEW API TO COMPLETE AN ONBOARDING STEP ---
export const completeOnboardingStep = onRequest({ region: "asia-southeast1", cors: true }, async (req, res) => {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) { res.status(401).send('Unauthorized'); return; }

    const { stepId } = req.body;
    if (!stepId) {
        res.status(400).json({ error: "Missing stepId" });
        return;
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const partnerId = decodedToken.uid;

        const stepRef = db.collection("partners").doc(partnerId).collection("onboarding_steps").doc(stepId);
        
        await stepRef.update({ status: "completed" });
        
        logger.info(`Step ${stepId} completed for partner ${partnerId}`);
        res.status(200).json({ message: `Step ${stepId} completed successfully.` });
    } catch (error) {
        logger.error(`Failed to complete step ${stepId}`, error);
        res.status(500).json({ error: "Internal server error" });
    }
});


// ... (getMyMetrics, approvePartner, healthCheck, etc. remain the same)
export const getMyMetrics = onRequest({ region: "asia-southeast1", cors: true }, async (req, res) => { /* ... */ });
export const approvePartner = onRequest({ region: "asia-southeast1", cors: true }, async (req, res) => { /* ... */ });
export const healthCheck = onRequest({ region: "asia-southeast1", cors: true }, (req, res) => { /* ... */ });
