"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.partnersUpdate = void 0;
const functions = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
exports.partnersUpdate = functions.onRequest(async (req, res) => {
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
//# sourceMappingURL=partnersUpdate.js.map