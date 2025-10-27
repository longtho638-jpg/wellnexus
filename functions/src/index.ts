import { https } from "firebase-functions"; export const glm46_ref = https.onRequest((req, res) => { res.status(200).json({ ok: true, source: "GLM-4.6" }); });
