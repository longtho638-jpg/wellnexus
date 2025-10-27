import { onRequest } from "firebase-functions/v2/https";
import { onUserCreate } from "firebase-functions/v2/auth";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

admin.initializeApp();
const db = admin.firestore();

// ... (ONBOARDING_STEPS_CONFIG remains the same)

// AUTH TRIGGER: Initializes profile with a null refCode
export const createPartnerProfile = onUserCreate({ region: "asia-southeast1" }, async (user) => {
  // ...
  const partnerRef = db.collection("partners").doc(user.uid);
  batch.set(partnerRef, {
    // ... other fields
    refCode: null, // Initialize refCode field
  });
  // ... rest of the function
});

// --- NEW API TO GENERATE REF CODE AND COMPLETE THE STEP ---
export const generateReferralCode = onRequest({ region: "asia-southeast1", cors: true }, async (req, res) => {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) { res.status(401).send('Unauthorized'); return; }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const partnerId = decodedToken.uid;
        
        const partnerRef = db.collection("partners").doc(partnerId);

        await db.runTransaction(async (transaction) => {
            const partnerDoc = await transaction.get(partnerRef);
            if (!partnerDoc.exists) throw new Error("Partner not found.");
            if (partnerDoc.data()?.refCode) throw new Error("Referral code already exists.");

            // 1. Generate and save the referral code
            const newRefCode = `${partnerDoc.data()?.name.split(' ')[0].toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
            transaction.update(partnerRef, { refCode: newRefCode });

            // 2. Complete 'day7' step and unlock 'day14'
            const currentStepRef = partnerRef.collection("onboarding_steps").doc("day7");
            const nextStepRef = partnerRef.collection("onboarding_steps").doc("day14");
            transaction.update(currentStepRef, { status: "completed" });
            transaction.update(nextStepRef, { status: "active" });
        });
        
        res.status(200).json({ message: "Referral code generated and step completed." });
    } catch (error) {
        logger.error("Failed to generate referral code", { error: (error as Error).message });
        res.status(500).json({ error: (error as Error).message });
    }
});


// ... (Other functions like getMyMetrics, approvePartner, etc. remain the same)
// The generic completeOnboardingStep is now used for simpler steps.
export const completeOnboardingStep = onRequest({ region: "asia-southeast1", cors: true }, async (req, res) => { /* ... */ });
export const getMyMetrics = onRequest({ region: "asia-southeast1", cors: true }, async (req, res) => { /* ... */ });
export const approvePartner = onRequest({ region: "asia-southeast1", cors: true }, async (req, res) => { /* ... */ });
export const healthCheck = onRequest({ region: "asia-southeast1", cors: true }, (req, res) => { /* ... */ });
