import * as functions from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

export const transparencyFeed = functions.onRequest(async (_req, res) => {
  try {
    const db = admin.firestore();

    const [evSnap, metSnap, partSnap] = await Promise.all([
      db.collection("evidence").orderBy("ts", "desc").limit(10).get(),
      db.collection("metrics_daily").orderBy("ts", "desc").limit(30).get(),
      db.collection("partners").get(),
    ]);

    const evidence = evSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const metrics = metSnap.docs.map((d) => ({ id: d.id, ...d.data() as any }));
    const partners = partSnap.docs.map((d) => ({ id: d.id, ...d.data() as any }));

    const summary = {
      uptime_30d:
        metrics.reduce((s, m) => s + (m.uptime || 0), 0) / (metrics.length || 1),
      verify_rate_30d:
        metrics.reduce((s, m) => s + (m.verifyRate || 0), 0) / (metrics.length || 1),
      evidence_count: evidence.length,
      partners_active: partners.filter((p) => p.status === "approved").length,
    };

    res.set("Cache-Control", "public, max-age=3600");
    res.json({
      updated_at: new Date().toISOString(),
      summary,
      evidence,
      metrics,
      partners: partners.map((p) => ({
        name: p.name,
        email: p.email,
        status: p.status,
      })),
    });
  } catch (err: any) {
    console.error("Error in transparencyFeed:", err);
    res.status(500).json({ error: err.message });
  }
});
