import * as functions from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
export const evidenceList = functions.onRequest(async (_req, res) => {
    try {
        const snap = await admin.firestore().collection("evidence").orderBy("ts", "desc").limit(50).get();
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        res.json({ evidence: data });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
