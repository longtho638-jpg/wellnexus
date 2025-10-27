import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

admin.initializeApp();
const db = admin.firestore();

// ... (registerPartner, getPartnerMetrics, getMetricsSummary, approvePartner APIs remain the same)

// --- NEW API FOR SECURELY PROVIDING FIREBASE CONFIG ---
export const getFirebaseConfig = onRequest({ region: "asia-southeast1", cors: true }, (req, res) => {
  try {
    // process.env.FIREBASE_CONFIG is automatically populated by Firebase
    const config = JSON.parse(process.env.FIREBASE_CONFIG || '{}');
    res.status(200).json({
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      storageBucket: config.storageBucket,
      messagingSenderId: config.messagingSenderId,
      appId: config.appId,
    });
  } catch (error) {
    logger.error("Failed to get Firebase config", error);
    res.status(500).json({ error: "Could not retrieve Firebase configuration." });
  }
});


// POST /api/partner/register
export const registerPartner = onRequest({ region: "asia-southeast1", cors: true }, async (req, res) => {
    // ... implementation
});

// GET /api/partner/metrics?partner_id=<id>
export const getPartnerMetrics = onRequest({ region: "asia-southeast1", cors: true }, async (req, res) => {
    // ... implementation
});

// GET /api/metrics/summary
export const getMetricsSummary = onRequest({ region: "asia-southeast1", cors: true }, async (req, res) => {
    // ... implementation
});

// POST /api/partner/approve
export const approvePartner = onRequest({ region: "asia-southeast1", cors: true }, async (req, res) => {
    // ... implementation
});

// GET /api/health
export const healthCheck = onRequest({ region: "asia-southeast1", cors: true }, async (req, res) => {
    res.status(200).json({ status: "ok", phase: "TREE" });
});
