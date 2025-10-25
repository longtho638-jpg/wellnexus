"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.channelAutoAttr = void 0;
const functions = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const crypto = require("crypto");
exports.channelAutoAttr = functions.onRequest(async (req, res) => {
    try {
        const { buyer_id, ref_code, sale_id, channel } = req.body;
        if (!buyer_id || !sale_id) {
            res.status(400).json({ error: "Thiếu buyer_id hoặc sale_id" });
            return;
        }
        const refCode = ref_code ?? `AUTO-${buyer_id.slice(0, 4)}-${Date.now()}`;
        const digest = crypto.createHash("sha256").update(refCode).digest("hex");
        const saleDoc = {
            sale_id,
            buyer_id,
            ref_code: refCode,
            channel,
            attribution: "auto",
            hash: digest,
            ts: admin.firestore.FieldValue.serverTimestamp(),
        };
        await admin.firestore().collection("sales").doc(sale_id).set(saleDoc, { merge: true });
        res.json({ ok: true, ref_code: refCode, hash: digest });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
//# sourceMappingURL=channelAutoAttr.js.map