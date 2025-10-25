"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishEvidenceLedger = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const storage_1 = require("firebase-admin/storage");
function getKeys() {
    const { privateKey, publicKey } = crypto.generateKeyPairSync("ed25519");
    return {
        signer: privateKey,
        verifier: publicKey,
    };
}
exports.publishEvidenceLedger = (0, scheduler_1.onSchedule)({ schedule: "every 12 hours", region: "asia-southeast1", timeoutSeconds: 300 }, async () => {
    const db = admin.firestore();
    const colls = ["sales", "commissions", "ad_reviews", "channel_logs"];
    const allDocs = [];
    for (const c of colls) {
        const snap = await db.collection(c).limit(1000).get();
        snap.forEach((d) => allDocs.push({ collection: c, id: d.id, ...d.data() }));
    }
    const json = JSON.stringify(allDocs.sort((a, b) => a.id.localeCompare(b.id)));
    const rootHash = crypto.createHash("sha256").update(json).digest("hex");
    const { signer } = getKeys();
    const signature = crypto.sign(null, Buffer.from(rootHash), signer).toString("base64");
    const manifest = {
        rootHash,
        totalDocs: allDocs.length,
        ts: new Date().toISOString(),
        signature,
        signerId: "auto-generated-dev-key",
    };
    const tempFilePath = path.join("/tmp", "evidence.json");
    fs.writeFileSync(tempFilePath, JSON.stringify(manifest, null, 2));
    await db.collection("evidence").doc(rootHash).set(manifest);
    const bucket = (0, storage_1.getStorage)().bucket();
    await bucket.upload(tempFilePath, {
        destination: ".well-known/evidence.json",
        metadata: {
            contentType: "application/json",
            cacheControl: "public, max-age=43200",
        },
    });
    console.log(`Ledger published successfully: ${rootHash}`);
});
//# sourceMappingURL=publishEvidenceLedger.js.map