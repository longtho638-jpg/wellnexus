import { onRequest } from "firebase-functions/v2/https";
import { onUserCreate } from "firebase-functions/v2/auth";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

admin.initializeApp();
const db = admin.firestore();

const ONBOARDING_STEPS_CONFIG = [
    { id: 'day1', title: 'Day 1: Account Activation & KYC' },
    { id: 'day3', title: 'Day 3: SKU & Pricing Quiz' },
    { id: 'day7', title: 'Day 7: Generate Referral Code' },
    { id: 'day14', title: 'Day 14: First Sale Training' },
    { id: 'day21', title: 'Day 21: Ad Compliance' },
    { id: 'day30', title: 'Day 30: Mini-Report' },
];

// AUTH TRIGGER: Initializes the sequential onboarding journey
export const createPartnerProfile = onUserCreate({ region: "asia-southeast1" }, async (user) => {
  // ... (user creation logic remains the same)
  const partnerRef = db.collection("partners").doc(user.uid);
  const batch = db.batch();
  batch.set(partnerRef, { /* ... partner data ... */ });

  // Initialize all onboarding steps with correct sequential statuses
  ONBOARDING_STEPS_CONFIG.forEach((step, index) => {
      const stepRef = partnerRef.collection("onboarding_steps").doc(step.id);
      batch.set(stepRef, { 
          title: step.title, 
          status: index === 0 ? 'active' : 'locked' // First step is active, others are locked
      });
  });

  await batch.commit();
});

// API: Completes a step AND unlocks the next one
export const completeOnboardingStep = onRequest({ region: "asia-southeast1", cors: true }, async (req, res) => {
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
                throw new Error("This step is not active or does not exist.");
            }

            // 1. Complete the current step
            transaction.update(currentStepRef, { status: "completed" });

            // 2. Find and unlock the next step
            const currentIndex = ONBOARDING_STEPS_CONFIG.findIndex(step => step.id === stepId);
            const nextStep = ONBOARDING_STEPS_CONFIG[currentIndex + 1];
            if (nextStep) {
                const nextStepRef = partnerRef.collection("onboarding_steps").doc(nextStep.id);
                transaction.update(nextStepRef, { status: "active" });
                logger.info(`Unlocked step ${nextStep.id} for partner ${partnerId}`);
            } else {
                logger.info(`Onboarding journey completed for partner ${partnerId}`);
            }
        });
        
        res.status(200).json({ message: `Step ${stepId} completed successfully.` });
    } catch (error) {
        logger.error(`Failed to complete step ${stepId}`, { error: (error as Error).message });
        res.status(500).json({ error: (error as Error).message });
    }
});

// ... (Other functions like getMyMetrics, approvePartner, etc. remain the same)
export const getMyMetrics = onRequest({ region: "asia-southeast1", cors: true }, async (req, res) => { /* ... */ });
export const approvePartner = onRequest({ region: "asia-southeast1", cors: true }, async (req, res) => { /* ... */ });
export const healthCheck = onRequest({ region: "asia-southeast1", cors: true }, (req, res) => { /* ... */ });
