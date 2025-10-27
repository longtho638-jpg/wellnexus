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
        
        case 'generateReferralCode':
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

                    const newRefCode = `${partnerDoc.data()?.name.split(' ')[0].toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
                    transaction.update(partnerRef, { refCode: newRefCode });

                    const currentStepRef = partnerRef.collection("onboarding_steps").doc("day7");
                    transaction.update(currentStepRef, { status: "completed" });

                    const nextStepRef = partnerRef.collection("onboarding_steps").doc("day14");
                    transaction.update(nextStepRef, { status: "active" });
                });
                
                res.status(200).json({ message: "Referral code generated." });
            } catch (error) {
                logger.error(`Failed to generate ref code`, { error: (error as Error).message });
                res.status(500).json({ error: (error as Error).message });
            }
            break;
        
        // ... (completeOnboardingStep and other cases remain the same)

        default:
            res.status(404).send('Not Found');
    }
});

// onUserCreate trigger updated to include refCode: null
export const createPartnerProfile = onUserCreate({ region: "asia-southeast1" }, async (user) => {
  // ... (logic to create partner)
  const partnerRef = db.collection("partners").doc(user.uid);
  batch.set(partnerRef, {
    // ... other fields
    refCode: null, // Initialize refCode field
  });
  // ... (logic to create onboarding steps)
});
