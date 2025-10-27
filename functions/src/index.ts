import { onRequest } from "firebase-functions/v2/https";
import { onUserCreate } from "firebase-functions/v2/auth";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

admin.initializeApp();
const db = admin.firestore();

const ONBOARDING_STEPS = [
    { id: 'day1', title: 'Day 1: Account Activation & KYC', status: 'completed' },
    { id: 'day3', title: 'Day 3: SKU & Pricing Quiz', status: 'pending' },
    { id: 'day7', title: 'Day 7: Generate Referral Code', status: 'pending' },
    { id: 'day14', title: 'Day 14: First Sale Training', status: 'pending' },
    { id: 'day21', title: 'Day 21: Ad Compliance', status: 'pending' },
    { id: 'day30', title: 'Day 30: Mini-Report', status: 'pending' },
];

// --- AUTH TRIGGER TO AUTOMATE PARTNER CREATION & ONBOARDING STATE ---
export const createPartnerProfile = onUserCreate({ region: "asia-southeast1" }, async (user) => {
  logger.info(`New user created: ${user.uid}, email: ${user.email}`);
  if (!user.email) { return; }

  const partnerRef = db.collection("partners").doc(user.uid);
  const onboardingStepsCollection = partnerRef.collection("onboarding_steps");
  
  const batch = db.batch();

  // 1. Create the main partner profile
  batch.set(partnerRef, {
    email: user.email,
    name: user.displayName || "New Partner",
    status: "pending",
    joined_at: admin.firestore.FieldValue.serverTimestamp(),
  });

  // 2. Initialize all onboarding steps for the new partner
  ONBOARDING_STEPS.forEach(step => {
      const stepRef = onboardingStepsCollection.doc(step.id);
      batch.set(stepRef, { title: step.title, status: step.status });
  });

  try {
    await batch.commit();
    logger.info(`Successfully created partner profile and onboarding steps for user: ${user.uid}`);
  } catch (error) {
    logger.error(`Failed to create partner profile for user: ${user.uid}`, error);
  }
});

// --- API TO INCLUDE DYNAMIC ONBOARDING STEPS ---
export const getMyMetrics = onRequest({ region: "asia-southeast1", cors: true }, async (req, res) => {
    // ... (token verification logic remains the same)
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) { res.status(401).send('Unauthorized'); return; }
    
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
            // metrics data can be added back here later
            onboarding: {
                status: partnerDoc.data().status,
                steps: onboardingSteps,
            }
        });

    } catch (error) {
        logger.error("Failed to get my metrics", error);
        res.status(403).json({ error: "Authentication failed." });
    }
});

// ... (Other functions remain the same)
export const approvePartner = onRequest({ region: "asia-southeast1", cors: true }, async (req, res) => { /* ... */ });
export const healthCheck = onRequest({ region: "asia-southeast1", cors: true }, (req, res) => { /* ... */ });
