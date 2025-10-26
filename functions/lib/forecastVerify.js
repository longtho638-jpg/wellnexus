import * as https from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { verifyEd25519Hex } from "./cryptoUtils";
/** /api/forecast/verify?root=... → trả verified + manifest tóm tắt */
export const forecastVerify = https.onRequest(async (req, res) => {
    try {
        const root = String(req.query.root || "");
        if (!root) {
            res.status(400).json({ error: "Missing root" });
            return;
        }
        const snap = await admin.firestore().collection("evidence").doc(root).get();
        if (!snap.exists) {
            res.status(404).json({ error: "Manifest not found" });
            return;
        }
        const m = snap.data();
        const verified = verifyEd25519Hex(m.merkleRoot, m.signature);
        res.set("Cache-Control", "public, max-age=300");
        res.json({
            verified,
            merkleRoot: m.merkleRoot,
            leaves: m.leaves,
            createdAt: m.createdAt,
            kid: m.kid,
            sig_alg: m.sig_alg,
        });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
