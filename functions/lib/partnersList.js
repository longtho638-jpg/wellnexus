"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.partnersList = void 0;
const functions = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
exports.partnersList = functions.onRequest(async (_req, res) => {
    try {
        const snap = await admin.firestore().collection("partners").get();
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        res.json({ partners: data });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
//# sourceMappingURL=partnersList.js.map