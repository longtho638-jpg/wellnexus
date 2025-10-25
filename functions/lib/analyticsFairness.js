"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsFairness = void 0;
const functions = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
exports.analyticsFairness = functions.onRequest(async (_req, res) => {
    try {
        const db = admin.firestore();
        // Load data from 3 main collections
        const [partnersSnap, metricsSnap] = await Promise.all([
            db.collection("partners").get(),
            db.collection("metrics_daily").orderBy("ts", "desc").limit(30).get(),
        ]);
        const partners = partnersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const metrics = metricsSnap.docs.map((d) => d.data());
        if (partners.length === 0) {
            res.json({ leaderboard: [], avgRebate: 0, biasSpread: 0 });
            return;
        }
        const avgRebate = partners.reduce((s, p) => s + (p.rebateRate || 0), 0) / partners.length;
        const leaderboard = partners.map((p) => {
            const uptime = metrics.length > 0 ? metrics.reduce((s, m) => s + (m.uptime || 0), 0) / metrics.length : 0;
            const verifyRate = metrics.length > 0 ? metrics.reduce((s, m) => s + (m.verifyRate || 0), 0) / metrics.length : 0;
            const rebateRate = p.rebateRate || 0;
            const fairness = (verifyRate * uptime) / (1 + Math.abs(rebateRate - avgRebate));
            return {
                id: p.id,
                name: p.name,
                status: p.status,
                fairness: Number(fairness.toFixed(4)),
                uptime: Number((uptime * 100).toFixed(2)),
                verifyRate: Number((verifyRate * 100).toFixed(2)),
                rebateRate,
            };
        });
        leaderboard.sort((a, b) => b.fairness - a.fairness);
        const biasSpread = leaderboard.length > 1 ? (leaderboard[0].fairness - leaderboard[leaderboard.length - 1].fairness).toFixed(4) : "0.0000";
        res.set("Cache-Control", "public, max-age=60");
        res.json({
            updated_at: new Date().toISOString(),
            avgRebate,
            leaderboard,
            biasSpread,
        });
    }
    catch (err) {
        console.error("Error in analyticsFairness:", err);
        res.status(500).json({ error: err.message });
    }
});
//# sourceMappingURL=analyticsFairness.js.map