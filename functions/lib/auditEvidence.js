import * as functions from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as crypto from "crypto";
export const auditEvidence = functions.onRequest(async (req, res) => {
    // IMPORTANT: In a real environment, use a secure method for admin keys.
    const key = req.headers["x-admin-key"];
    if (key !== (process.env.ADMIN_KEY || "demo")) {
        res.status(403).json({ error: "Unauthorized" });
        return;
    }
    try {
        const db = admin.firestore();
        const [partnersSnap, metricsSnap] = await Promise.all([
            db.collection("partners").get(),
            db.collection("metrics_daily").orderBy("ts", "desc").limit(60).get(),
        ]);
        const partners = partnersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (partners.length === 0) {
            res.json({ root: null, count: 0, topBias: [] });
            return;
        }
        const metrics = metricsSnap.docs.map(d => d.data());
        const biasScores = partners.map(p => {
            const partnerMetrics = metrics.filter(m => m.partnerId === p.id);
            const avgUptime = partnerMetrics.reduce((s, m) => s + (m.uptime || 0), 0) / (partnerMetrics.length || 1);
            const avgVerify = partnerMetrics.reduce((s, m) => s + (m.verifyRate || 0), 0) / (partnerMetrics.length || 1);
            const avgRebate = p.rebateRate || 0;
            // Simplified bias risk proxy
            const biasRisk = Math.max(0, (avgRebate - avgVerify) * (1 - avgUptime));
            return {
                id: p.id,
                name: p.name,
                biasRisk: Number(biasRisk.toFixed(4)),
                avgUptime,
                avgVerify,
                avgRebate
            };
        });
        const sorted = biasScores.sort((a, b) => b.biasRisk - a.biasRisk);
        const root = crypto.createHash("sha256").update(JSON.stringify(sorted)).digest("hex");
        await db.collection("audit_reports").doc(root).set({
            ts: new Date().toISOString(),
            biasScores: sorted,
        });
        res.json({ root, count: sorted.length, topBias: sorted.slice(0, 5) });
    }
    catch (err) {
        console.error("Error in auditEvidence:", err);
        res.status(500).json({ error: err.message });
    }
});
