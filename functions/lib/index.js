"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.evidenceVerify = exports.evidenceAnchor = exports.adSubmit = exports.affiliateSettle = exports.affiliateQuote = void 0;
const functions = __importStar(require("firebase-functions/v2"));
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
const db = admin.firestore();
exports.affiliateQuote = functions.https.onRequest(async (req, res) => {
    try {
        const { cart_total_vnd, rank } = req.body; // Removed unused ref_code
        const net = Number(cart_total_vnd) || 0;
        let pct = 0.10; // DirectAffiliate mặc định
        if (rank === "KhoiNghiep")
            pct = 0.21;
        if (rank === null || rank === void 0 ? void 0 : rank.startsWith("DaiSu_Silver"))
            pct = 0.21 + 0.09;
        if (rank === null || rank === void 0 ? void 0 : rank.startsWith("DaiSu_Gold"))
            pct = 0.21 + 0.12;
        if (rank === null || rank === void 0 ? void 0 : rank.startsWith("DaiSu_Diamond"))
            pct = 0.21 + 0.15;
        const capped = Math.min(net * pct, net * 0.22);
        const pit = Number(process.env.AFFILIATE_PIT_RATE || 0.1);
        const tax = Math.round(capped * pit);
        const payout = Math.round(capped - tax);
        res.json({
            direct_vnd: Math.round(net * 0.10),
            bonuses_vnd: Math.round(capped - net * 0.10),
            cap_applied: capped === net * 0.22,
            total_vnd: payout,
            tax_vnd: tax
        });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
exports.affiliateSettle = functions.https.onRequest(async (req, res) => {
    const idemKey = req.headers["idempotency-key"];
    if (!idemKey) {
        res.status(400).send("Missing Idempotency-Key");
        return;
    }
    const idemRef = db.collection("idempotency_keys").doc(String(idemKey));
    const idemSnap = await idemRef.get();
    if (idemSnap.exists) {
        res.status(200).json({ status: "duplicate" });
        return;
    }
    await idemRef.set({
        at: admin.firestore.FieldValue.serverTimestamp(),
        ttl: Date.now() + 24 * 3600 * 1000
    });
    const { sale_id, commission } = req.body || {};
    const doc = await db.collection("commissions").add({
        sale_id, commission, status: "settled",
        ts: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ commission_id: doc.id, manifest_root: "sha256:placeholder", status: "ok" });
});
exports.adSubmit = functions.https.onRequest(async (req, res) => {
    const { ad_id, claim_type, evidence_links } = req.body || {};
    const forbidden = ["chữa khỏi", "đảm bảo", "thần dược"];
    const violation = forbidden.find(w => (claim_type || "").includes(w));
    if (violation) {
        res.status(400).json({ verdict: "deny", reason: violation });
        return;
    }
    const ref = await db.collection("ad_reviews").add({
        ad_id, claim_type, evidence_links, verdict: "approved",
        ts: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ review_id: ref.id, verdict: "approved" });
});
exports.evidenceAnchor = functions.https.onRequest(async (req, res) => {
    const { dataset_digest } = req.body || {};
    const id = await db.collection("evidence").add({
        type: "anchor", dataset_digest,
        ts: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ anchor_id: id.id, status: "anchored" });
});
exports.evidenceVerify = functions.https.onRequest(async (req, res) => {
    const { root } = req.query;
    const snap = await db.collection("evidence").where("dataset_digest", "==", root).get();
    if (snap.empty) {
        res.status(404).json({ verified: false });
        return;
    }
    res.json({ verified: true, count: snap.size });
});
//# sourceMappingURL=index.js.map