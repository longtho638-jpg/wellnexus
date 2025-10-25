import * as https from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

/** Trả manifest forecast mới nhất tại /.well-known/forecast.json */
export const forecastManifestPublic = https.onRequest(async (_req, res) => {
  try {
    const db = admin.firestore();
    const meta = await db.collection("evidence_meta").doc("forecast_latest").get();
    if (!meta.exists) {
      res.status(404).json({ error: "No forecast manifest yet" });
      return;
    }
    const { root } = meta.data() as any;

    const snap = await db.collection("evidence").doc(root).get();
    if (!snap.exists) {
      res.status(404).json({ error: "Manifest not found" });
      return;
    }

    res.set("Cache-Control", "public, max-age=3600");
    res.json({ ...snap.data() });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
