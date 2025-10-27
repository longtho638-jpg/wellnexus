import { onRequest } from "firebase-functions/v2/https";
import { onUserCreate } from "firebase-functions/v2/auth";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

admin.initializeApp();
const db = admin.firestore();

// --- AUTH TRIGGER TO AUTOMATE PARTNER CREATION & BOOTSTRAP METRICS ---
export const createPartnerProfile = onUserCreate({ region: "asia-southeast1" }, async (user) => {
  logger.info(`New user created: ${user.uid}, email: ${user.email}`);
  
  if (!user.email) {
    logger.error("User created without an email address.", { uid: user.uid });
    return;
  }

  const partnerRef = db.collection("partners").doc(user.uid);
  const metricsRef = db.collection("metrics_daily").doc(); // Create a new doc for day-zero metrics

  const batch = db.batch();

  // 1. Create the partner profile
  batch.set(partnerRef, {
    email: user.email,
    name: user.displayName || "New Partner",
    status: "pending",
    joined_at: admin.firestore.FieldValue.serverTimestamp(),
    auth_uid: user.uid,
    metrics_ref: metricsRef, // Link to the metrics document as per TSD
  });

  // 2. Create the initial day-zero metrics document
  batch.set(metricsRef, {
    partner_id: user.uid, // Link back to the partner
    date: admin.firestore.FieldValue.serverTimestamp(),
    clicks: 0,
    sales: 0,
    commission: 0,
  });

  try {
    await batch.commit();
    logger.info(`Successfully created partner profile and initial metrics for user: ${user.uid}`);
  } catch (error) {
    logger.error(`Failed to create partner profile for user: ${user.uid}`, error);
  }
});


// ... (All other APIs remain the same)
export const getMyMetrics = onRequest({ region: "asia-southeast1", cors: true }, async (req, res) => {
    // ... implementation
});
export const approvePartner = onRequest({ region: "asia-southeast1", cors: true }, async (req, res) => {
    // ... implementation
});
export const healthCheck = onRequest({ region: "asia-southeast1", cors: true }, (req, res) => {
    res.status(200).json({ status: "ok", phase: "TREE" });
});
// ... and other functions
