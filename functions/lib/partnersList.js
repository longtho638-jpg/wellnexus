import * as functions from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
export const partnersList = functions.onRequest(async (_req, res) => {
    try {
        const snap = await admin.firestore().collection("partners").get();
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        res.json({ partners: data });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
