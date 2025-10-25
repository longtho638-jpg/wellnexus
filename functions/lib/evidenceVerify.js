"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evidenceVerify = void 0;
const functions = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const crypto = require("crypto");
// Helper function to get public key (for demo purposes)
function getPublicKey() {
    // This is a placeholder. In a real application, you would fetch
    // the corresponding public key from a secure store based on the 'signerId'
    // from the manifest. For this example, we regenerate a key pair
    // and only use the public part. This WILL NOT verify the signature from
    // the 'publishEvidenceLedger' function because the keys are different.
    // A real implementation is required for verification to work.
    const { publicKey } = crypto.generateKeyPairSync("ed25519");
    return publicKey;
}
exports.evidenceVerify = functions.onRequest(async (req, res) => {
    try {
        const { root } = req.query;
        if (!root || typeof root !== "string") {
            res.status(400).json({ error: "Thiếu 'root' hash" });
            return;
        }
        const snap = await admin.firestore().collection("evidence").doc(root).get();
        if (!snap.exists) {
            res.status(404).json({ error: "Không tìm thấy manifest" });
            return;
        }
        const data = snap.data();
        if (!data || !data.rootHash || !data.signature) {
            res.status(500).json({ error: "Dữ liệu manifest không hợp lệ" });
            return;
        }
        // IMPORTANT: This verification is for demonstration purposes.
        // The key here is generated on the fly and WILL NOT MATCH the one used for signing.
        // A production system must fetch the correct public key.
        const verifier = getPublicKey();
        const isVerified = crypto.verify(null, Buffer.from(data.rootHash), verifier, Buffer.from(data.signature, "base64"));
        res.json({
            verified: isVerified,
            message: isVerified
                ? "Chữ ký hợp lệ (LƯU Ý: khóa dev được tạo tự động)."
                : "Chữ ký KHÔNG hợp lệ (LƯU Ý: khóa dev không khớp, đây là điều dự kiến).",
            ...data,
        });
    }
    catch (err) {
        console.error("Verification error:", err);
        res.status(500).json({ error: err.message });
    }
});
//# sourceMappingURL=evidenceVerify.js.map