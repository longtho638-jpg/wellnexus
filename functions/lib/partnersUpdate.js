import * as functions from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
export const partnersUpdate = functions.onRequest(async (req, res) => {
    try {
        const auth = req.get("X-Two-Eyes-Token");
        if (auth !== "OK-APPROVED") {
            res.status(403).json({ error: "Cần 2-eyes approval" });
            return;
        }
        const { id, updates } = req.body;
        if (!id || !updates) {
            res.status(400).json({ error: "Thiếu dữ liệu" });
            return;
        }
        await admin.firestore().collection("partners").doc(id).set(updates, { merge: true });
        res.json({ ok: true });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
