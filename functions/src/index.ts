import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

admin.initializeApp();

export const healthCheck = onRequest(
  { region: "asia-southeast1", cors: true }, // Enable CORS
  async (req, res) => {
    try {
      await admin.firestore().collection("system_probes").add({
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: "ok",
        source: "healthCheck-v2"
      });
      res.status(200).json({ status: "ok" });
    } catch (error) {
      res.status(500).json({ status: "error", message: (error as Error).message });
    }
  }
);
