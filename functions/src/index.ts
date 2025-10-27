import { onRequest } from "firebase-functions/v2/https";
import { onUserCreate } from "firebase-functions/v2/auth";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

admin.initializeApp();
const db = admin.firestore();

// ... (createPartnerProfile function remains the same)

// --- REFACTORED SECURED API TO INCLUDE ONBOARDING DATA ---
export const getMyMetrics = onRequest({ region: "asia-southeast1", cors: true }, async (req, res) => {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) { res.status(401).send('Unauthorized'); return; }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const partnerId = decodedToken.uid;

        // Fetch both partner profile and metrics in parallel
        const partnerRef = db.collection('partners').doc(partnerId);
        const metricsQuery = db.collection("metrics_daily").where("partner_id", "==", partnerId);

        const [partnerDoc, metricsSnapshot] = await Promise.all([
            partnerRef.get(),
            metricsQuery.get()
        ]);

        if (!partnerDoc.exists) {
            res.status(404).json({ error: "Partner profile not found for this user." });
            return;
        }

        const partnerData = partnerDoc.data();
        
        const metrics = metricsSnapshot.docs.map(doc => doc.data());
        const metricsSummary = metrics.reduce((acc, metric) => {
            acc.totalClicks += metric.clicks || 0;
            acc.totalSales += metric.sales || 0;
            acc.totalCommission += metric.commission || 0;
            return acc;
        }, { totalClicks: 0, totalSales: 0, totalCommission: 0 });

        res.status(200).json({
            metrics: metricsSummary,
            onboarding: {
                status: partnerData.status,
                joined_at: partnerData.joined_at.toDate(),
                // Add more onboarding fields here as we build them
            }
        });

    } catch (error) {
        logger.error("Failed to get my metrics", { error });
        res.status(403).json({ error: "Authentication failed or invalid token." });
    }
});

// ... (All other APIs remain the same)
