import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

admin.initializeApp();
const db = admin.firestore();

// --- Foundation: Partner & Metrics APIs ---

// POST /api/partner/register
export const registerPartner = onRequest({ region: "asia-southeast1", cors: true }, async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }
  
  const { name, email } = req.body;
  if (!name || !email) {
    res.status(400).json({ error: "Missing name or email" });
    return;
  }

  try {
    const partnerRef = db.collection("partners").doc();
    await partnerRef.set({
      name,
      email,
      status: "pending", // Default status, requires 2-eyes approval
      joined_at: admin.firestore.FieldValue.serverTimestamp(),
      metrics_ref: db.collection("metrics_daily").doc(), // Link to a new metrics doc
    });
    res.status(201).json({ id: partnerRef.id, message: "Partner registered successfully." });
  } catch (error) {
    logger.error("Failed to register partner", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/partner/metrics?partner_id=<id>
export const getPartnerMetrics = onRequest({ region: "asia-southeast1", cors: true }, async (req, res) => {
  const partnerId = req.query.partner_id as string;
  if (!partnerId) {
    res.status(400).json({ error: "Missing partner_id query parameter" });
    return;
  }

  try {
    const metricsSnapshot = await db.collection("metrics_daily").where("partner_id", "==", partnerId).get();
    if (metricsSnapshot.empty) {
      res.status(404).json({ message: "No metrics found for this partner." });
      return;
    }
    const metrics = metricsSnapshot.docs.map(doc => doc.data());
    res.status(200).json(metrics);
  } catch (error) {
    logger.error("Failed to get partner metrics", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/metrics/summary
export const getMetricsSummary = onRequest({ region: "asia-southeast1", cors: true }, async (req, res) => {
    try {
        const snapshot = await db.collection("metrics_daily").get();
        const summary = snapshot.docs.reduce((acc, doc) => {
            const data = doc.data();
            acc.totalClicks += data.clicks || 0;
            acc.totalSales += data.sales || 0;
            acc.totalCommission += data.commission || 0;
            return acc;
        }, { totalClicks: 0, totalSales: 0, totalCommission: 0 });

        res.status(200).json(summary);
    } catch (error) {
        logger.error("Failed to get metrics summary", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


// --- Health Check for CI/CD ---
export const healthCheck = onRequest(
  { region: "asia-southeast1", cors: true },
  async (req, res) => {
    res.status(200).json({ status: "ok", source: "TREE-v1-Foundation" });
  }
);
