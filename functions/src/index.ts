import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

admin.initializeApp();
const db = admin.firestore();

// POST /api/partner/register
export const registerPartner = onRequest({ region: "asia-southeast1", cors: true }, async (req, res) => {
 // ... (implementation from previous successful step)
 const { name, email } = req.body;
 if (!name || !email) { res.status(400).json({ error: "Missing name or email" }); return; }
 const partnerRef = db.collection("partners").doc();
 await partnerRef.set({ name, email, status: "pending", joined_at: admin.firestore.FieldValue.serverTimestamp() });
 res.status(201).json({ id: partnerRef.id });
});

// GET /api/partner/metrics?partner_id=<id>
export const getPartnerMetrics = onRequest({ region: "asia-southeast1", cors: true }, async (req, res) => {
    const partnerId = req.query.partner_id as string;
    if (!partnerId) {
      res.status(400).json({ error: "Missing partner_id" });
      return;
    }
    const metricsSnapshot = await db.collection("metrics_daily").where("partner_id", "==", partnerId).get();
    const metrics = metricsSnapshot.docs.map(doc => doc.data());
    res.status(200).json(metrics);
});

// GET /api/metrics/summary
export const getMetricsSummary = onRequest({ region: "asia-southeast1", cors: true }, async (req, res) => {
    try {
        const snapshot = await db.collection("metrics_daily").get();
        const summary = snapshot.docs.reduce((acc, doc) => {
            const data = doc.data();
            acc.totalClicks += data.clicks || 0;
            acc.totalSales += data.sales || 0;
            acc.totalCommission += data.commission || 0; // Correctly calculate total commission
            return acc;
        }, { totalClicks: 0, totalSales: 0, totalCommission: 0 }); // Initialize totalCommission

        res.status(200).json(summary);
    } catch (error) {
        logger.error("Failed to get metrics summary", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// GET /api/health
export const healthCheck = onRequest({ region: "asia-southeast1", cors: true }, async (req, res) => {
    res.status(200).json({ status: "ok", phase: "TREE" });
});
