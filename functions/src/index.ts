import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

admin.initializeApp();
const db = admin.firestore();

// ... (registerPartner, getPartnerMetrics, getMetricsSummary APIs remain the same)

// POST /api/partner/register
export const registerPartner = onRequest({ region: "asia-southeast1", cors: true }, async (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) { res.status(400).json({ error: "Missing name or email" }); return; }
    const partnerRef = db.collection("partners").doc();
    await partnerRef.set({ name, email, status: "pending", joined_at: admin.firestore.FieldValue.serverTimestamp() });
    res.status(201).json({ id: partnerRef.id });
});

// GET /api/partner/metrics?partner_id=<id>
export const getPartnerMetrics = onRequest({ region: "asia-southeast1", cors: true }, async (req, res) => {
    const partnerId = req.query.partner_id as string;
    if (!partnerId) { res.status(400).json({ error: "Missing partner_id" }); return; }
    // ... implementation
    res.status(200).json([]);
});

// GET /api/metrics/summary
export const getMetricsSummary = onRequest({ region: "asia-southeast1", cors: true }, async (req, res) => {
    // ... implementation
    res.status(200).json({ totalClicks: 0, totalSales: 0, totalCommission: 0 });
});

// --- NEW API FOR PARTNER APPROVAL ---
// POST /api/partner/approve
export const approvePartner = onRequest({ region: "asia-southeast1", cors: true }, async (req, res) => {
    // In a real app, you'd verify if the caller is an admin here.
    // For now, we trust the call for this development phase.
    const { partnerId } = req.body;
    if (!partnerId) {
        res.status(400).json({ error: "Missing partnerId" });
        return;
    }

    try {
        const partnerRef = db.collection("partners").doc(partnerId);
        await partnerRef.update({ status: "approved" });
        logger.info(`Partner ${partnerId} has been approved.`);
        res.status(200).json({ message: `Partner ${partnerId} approved.` });
    } catch (error) {
        logger.error(`Failed to approve partner ${partnerId}`, error);
        res.status(500).json({ error: "Internal server error" });
    }
});


// GET /api/health
export const healthCheck = onRequest({ region: "asia-southeast1", cors: true }, async (req, res) => {
    res.status(200).json({ status: "ok", phase: "TREE" });
});
