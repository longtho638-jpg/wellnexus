"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.affiliateSettle = void 0;
const functions = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const crypto_1 = require("crypto");
exports.affiliateSettle = functions.onRequest(async (req, res) => {
    try {
        const idempotencyKey = req.get("Idempotency-Key");
        const twoEyesToken = req.get("X-Two-Eyes-Token");
        const { sale_id, total_vnd, recipient_id } = req.body;
        if (!idempotencyKey || !sale_id) {
            res.status(400).json({ error: "Thiếu Idempotency-Key hoặc sale_id" });
            return;
        }
        const idemRef = admin.firestore().collection("idempotency_keys").doc(idempotencyKey);
        const existing = await idemRef.get();
        if (existing.exists) {
            res.status(200).json(existing.data());
            return;
        }
        // Two-eyes guard
        const isTwoEyes = twoEyesToken && twoEyesToken.startsWith("OK-");
        if (!isTwoEyes) {
            res.status(403).json({ error: "Cần 2-eyes approval trước khi settle" });
            return;
        }
        const commission_id = (0, crypto_1.randomUUID)();
        const doc = {
            commission_id,
            sale_id,
            recipient_id,
            amount: total_vnd,
            pct: 0.1,
            status: "settled",
            ts: admin.firestore.FieldValue.serverTimestamp(),
        };
        await admin.firestore().collection("commissions").doc(commission_id).set(doc);
        await idemRef.set({ ok: true, commission_id, ts: Date.now() });
        res.json({
            commission_id,
            manifest_root: `hash:${commission_id}`,
            status: "settled",
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
//# sourceMappingURL=affiliateSettle.js.map