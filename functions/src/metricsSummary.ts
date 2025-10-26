import * as functions from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

interface DailyMetric {
    id: string;
    uptime: number;
    verifyRate: number;
    errors: number;
    ts: admin.firestore.Timestamp;
}

export const metricsSummary = functions.onRequest(async (_req, res) => {
  try {
    const db = admin.firestore();
    const snap = await db.collection("metrics_daily").orderBy("ts", "desc").limit(30).get();
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as DailyMetric));

    if (data.length === 0) {
        res.json({ avg7: { uptime: '0.0000', verifyRate: '0.0000' }, avg30: { uptime: '0.0000', verifyRate: '0.0000' }, recent: [] });
        return;
    }

    const last7 = data.slice(0, 7);
    const avg7 = {
      uptime: (last7.reduce((s, x) => s + x.uptime, 0) / last7.length).toFixed(4),
      verifyRate: (last7.reduce((s, x) => s + x.verifyRate, 0) / last7.length).toFixed(4),
    };

    const avg30 = {
      uptime: (data.reduce((s, x) => s + x.uptime, 0) / data.length).toFixed(4),
      verifyRate: (data.reduce((s, x) => s + x.verifyRate, 0) / data.length).toFixed(4),
    };

    res.json({ avg7, avg30, recent: data });
  } catch (err: any) {
    console.error("Error in metricsSummary:", err);
    res.status(500).json({ error: err.message });
  }
});
