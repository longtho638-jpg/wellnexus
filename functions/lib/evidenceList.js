"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evidenceList = void 0;
const functions = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
exports.evidenceList = functions.onRequest(async (_req, res) => {
    try {
        const snap = await admin.firestore().collection("evidence").orderBy("ts", "desc").limit(50).get();
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        res.json({ evidence: data });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
//# sourceMappingURL=evidenceList.js.map