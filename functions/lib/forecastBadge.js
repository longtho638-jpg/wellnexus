import * as https from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { verifyEd25519Hex } from "./cryptoUtils";
export const forecastBadge = https.onRequest(async (req, res) => {
    try {
        const root = String(req.query.root || "");
        if (!root) {
            res.set("Content-Type", "image/svg+xml");
            res.status(400).send(`<svg xmlns='http://www.w3.org/2000/svg' width='220' height='40'>
        <rect width='220' height='40' rx='6' fill='#ef4444'/>
        <text x='110' y='25' font-size='14' text-anchor='middle' fill='#fff'>Missing root</text></svg>`);
            return;
        }
        const snap = await admin.firestore().collection("evidence").doc(root).get();
        if (!snap.exists) {
            res.set("Content-Type", "image/svg+xml");
            res.status(404).send(`<svg xmlns='http://www.w3.org/2000/svg' width='220' height='40'>
        <rect width='220' height='40' rx='6' fill='#ef4444'/>
        <text x='110' y='25' font-size='14' text-anchor='middle' fill='#fff'>Not Found</text></svg>`);
            return;
        }
        const m = snap.data();
        const ok = verifyEd25519Hex(m.merkleRoot, m.signature);
        const color = ok ? "#10b981" : "#f59e0b";
        const label = ok ? "Verified" : "Unverified";
        const short = m.merkleRoot.slice(0, 10);
        res.set("Content-Type", "image/svg+xml");
        res.send(`<svg xmlns='http://www.w3.org/2000/svg' width='260' height='40'>
      <rect width='260' height='40' rx='6' fill='${color}'/>
      <text x='14' y='25' font-family='monospace' fill='#fff' font-size='14'>${label}</text>
      <text x='160' y='25' font-family='monospace' fill='#fff' font-size='14'>${short}</text></svg>`);
    }
    catch (e) {
        res.status(500).send(e.message);
    }
});
