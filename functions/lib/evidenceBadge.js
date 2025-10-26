import * as functions from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as crypto from "crypto";
// Placeholder for fetching the correct public key
function getPublicKey() {
    // In a real application, this would fetch the key based on `signerId`
    // For this demo, it regenerates a key, so verification will likely fail.
    const { publicKey } = crypto.generateKeyPairSync("ed25519");
    return publicKey;
}
export const evidenceBadge = functions.onRequest(async (req, res) => {
    try {
        const { root } = req.query;
        if (!root || typeof root !== 'string') {
            res.setHeader("Content-Type", "image/svg+xml");
            res.status(400).send(`
        <svg xmlns="http://www.w3.org/2000/svg" width="160" height="40" rx="6">
          <rect width="160" height="40" fill="#ef4444"/>
          <text x="50%" y="55%" font-size="14" font-family="monospace" text-anchor="middle" fill="#fff">MISSING ROOT</text>
        </svg>`);
            return;
        }
        const doc = await admin.firestore().collection("evidence").doc(root).get();
        if (!doc.exists) {
            res.setHeader("Content-Type", "image/svg+xml");
            res.status(404).send(`
        <svg xmlns="http://www.w3.org/2000/svg" width="160" height="40" rx="6">
          <rect width="160" height="40" fill="#f59e0b"/>
          <text x="50%" y="55%" font-size="14" font-family="monospace" text-anchor="middle" fill="#fff">NOT FOUND</text>
        </svg>`);
            return;
        }
        const data = doc.data();
        if (!data || !data.rootHash || !data.signature) {
            res.setHeader("Content-Type", "image/svg+xml");
            res.status(500).send(`
        <svg xmlns="http://www.w3.org/2000/svg" width="160" height="40" rx="6">
            <rect width="160" height="40" fill="#ef4444"/>
            <text x="50%" y="55%" font-size="14" font-family="monospace" text-anchor="middle" fill="#fff">INVALID DATA</text>
        </svg>`);
            return;
        }
        // NOTE: This verification is for demo only and will likely fail
        // as it generates a new key pair each time.
        const verifier = getPublicKey();
        const isVerified = crypto.verify(null, Buffer.from(data.rootHash), verifier, Buffer.from(data.signature, "base64"));
        const color = isVerified ? "#10b981" : "#f59e0b";
        const label = isVerified ? "Verified" : "Unverified";
        const shortHash = data.rootHash.slice(0, 8);
        // Set cache headers for the badge
        res.setHeader("Content-Type", "image/svg+xml");
        res.setHeader("Cache-Control", "public, max-age=3600"); // Cache for 1 hour
        res.status(200).send(`
      <svg xmlns="http://www.w3.org/2000/svg" width="240" height="40" >
        <rect width="240" height="40" rx="6" fill="#424242"/>
        <rect width="90" height="40" rx="6" fill="${color}"/>
        <text x="45" y="25" font-family="monospace" text-anchor="middle" fill="#fff" font-size="14">${label}</text>
        <text x="105" y="25" font-family="monospace" fill="#fff" font-size="14">root:${shortHash}</text>
      </svg>
    `);
    }
    catch (err) {
        console.error("Badge generation error:", err);
        res.status(500).send(err.message);
    }
});
