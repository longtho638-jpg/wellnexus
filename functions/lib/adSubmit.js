"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adSubmit = void 0;
const functions = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const crypto = require("crypto");
const forbidden = ["chữa khỏi bệnh", "bảo đảm kết quả", "thần dược"];
const requiresDisclaimer = ["tùy cơ địa", "không thay thế thuốc"];
exports.adSubmit = functions.onRequest(async (req, res) => {
    try {
        const { owner_id, claim_text } = req.body;
        if (!owner_id || !claim_text) {
            res.status(400).json({ error: "Thiếu dữ liệu" });
            return;
        }
        const verdict = forbidden.some(k => claim_text.includes(k))
            ? "rejected"
            : requiresDisclaimer.some(k => claim_text.includes(k))
                ? "requires_disclaimer"
                : "approved";
        const digest = crypto.createHash("sha256").update(claim_text).digest("hex");
        const ad_id = digest.slice(0, 12);
        const doc = {
            ad_id,
            owner_id,
            claim_text,
            verdict,
            reviewer: verdict === "approved" ? "auto" : "pending",
            ts: admin.firestore.FieldValue.serverTimestamp(),
            hash: digest,
        };
        await admin.firestore().collection("ad_reviews").doc(ad_id).set(doc);
        res.json({
            ad_id,
            verdict,
            message: verdict === "approved"
                ? "✅ Quảng cáo hợp lệ"
                : verdict === "requires_disclaimer"
                    ? "⚠️ Cần thêm disclaimer"
                    : "❌ Từ khóa bị cấm",
            hash: digest,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
//# sourceMappingURL=adSubmit.js.map