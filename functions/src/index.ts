import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

admin.initializeApp();
const db = admin.firestore();

// --- NEW SECURED API FOR PERSONALIZED DASHBOARD ---
export const getMyMetrics = onRequest({ region: "asia-southeast1", cors: true }, async (req, res) => {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) {
        res.status(401).send('Unauthorized');
        return;
    }

    try {
        // Verify the token
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const userEmail = decodedToken.email;

        // Find the partner document using the user's email
        const partnersQuery = await db.collection('partners').where('email', '==', userEmail).limit(1).get();
        if (partnersQuery.empty) {
            res.status(404).json({ error: "Partner profile not found for this user." });
            return;
        }
        const partnerDoc = partnersQuery.docs[0];
        const partnerId = partnerDoc.id;

        // Fetch metrics for that specific partner
        const metricsSnapshot = await db.collection("metrics_daily").where("partner_id", "==", partnerId).get();
        const metrics = metricsSnapshot.docs.map(doc => doc.data());
        
        // For now, let's return a summary similar to the old API but just for this partner
        const summary = metrics.reduce((acc, metric) => {
            acc.totalClicks += metric.clicks || 0;
            acc.totalSales += metric.sales || 0;
            acc.totalCommission += metric.commission || 0;
            return acc;
        }, { totalClicks: 0, totalSales: 0, totalCommission: 0 });
        
        res.status(200).json(summary);

    } catch (error) {
        logger.error("Failed to get my metrics", { error });
        res.status(403).json({ error: "Authentication failed or invalid token." });
    }
});


// ... (All other APIs remain the same)
// POST /api/partner/register, GET /api/partner/metrics, etc.
// GET /api/health
export const healthCheck = onRequest({ region: "asia-southeast1", cors: true }, (req, res) => {
    res.status(200).json({ status: "ok", phase: "TREE" });
});
// ... (and the other functions)
