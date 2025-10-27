import { onRequest } from "firebase-functions/v2/https";
import { onUserCreate } from "firebase-functions/v2/auth"; // Import the auth trigger
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

admin.initializeApp();
const db = admin.firestore();

// --- NEW AUTH TRIGGER TO AUTOMATE PARTNER CREATION ---
export const createPartnerProfile = onUserCreate({ region: "asia-southeast1" }, async (user) => {
  logger.info(`New user created: ${user.uid}, email: ${user.email}`);
  
  if (!user.email) {
    logger.error("User created without an email address.", { uid: user.uid });
    return;
  }

  try {
    const partnerRef = db.collection("partners").doc(user.uid); // Use Auth UID as Partner ID
    await partnerRef.set({
      email: user.email,
      name: user.displayName || "New Partner",
      status: "pending", // All new partners start as pending approval
      joined_at: admin.firestore.FieldValue.serverTimestamp(),
      auth_uid: user.uid,
    });
    logger.info(`Successfully created partner profile for user: ${user.uid}`);
  } catch (error) {
    logger.error(`Failed to create partner profile for user: ${user.uid}`, error);
  }
});


// --- REFACTORED SECURED API FOR PERSONALIZED DASHBOARD ---
// Now it looks up by UID instead of email for better security and performance
export const getMyMetrics = onRequest({ region: "asia-southeast1", cors: true }, async (req, res) => {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) { res.status(401).send('Unauthorized'); return; }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const partnerId = decodedToken.uid; // Use UID from token

        // Fetch metrics for that specific partner
        const metricsSnapshot = await db.collection("metrics_daily").where("partner_id", "==", partnerId).get();
        // ... (rest of the logic remains the same)
        
        res.status(200).json({ totalClicks: 0, totalSales: 0, totalCommission: 0 });

    } catch (error) {
        logger.error("Failed to get my metrics", { error });
        res.status(403).json({ error: "Authentication failed or invalid token." });
    }
});


// ... (All other APIs like approvePartner, healthCheck, etc. remain the same)
// Note: The manual registerPartner API is now redundant and can be removed in a future step.
export const approvePartner = onRequest({ region: "asia-southeast1", cors: true }, async (req, res) => {
    // ... implementation
});
export const healthCheck = onRequest({ region: "asia-southeast1", cors: true }, (req, res) => {
    res.status(200).json({ status: "ok", phase: "TREE" });
});
