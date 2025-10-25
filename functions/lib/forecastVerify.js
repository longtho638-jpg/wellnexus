"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forecastVerify = void 0;
const https = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const cryptoUtils_1 = require("./cryptoUtils");
/** /api/forecast/verify?root=... → trả verified + manifest tóm tắt */
exports.forecastVerify = https.onRequest(async (req, res) => {
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
        const verified = (0, cryptoUtils_1.verifyEd25519Hex)(m.merkleRoot, m.signature);
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
//# sourceMappingURL=forecastVerify.js.map