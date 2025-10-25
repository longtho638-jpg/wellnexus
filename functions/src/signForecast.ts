import * as scheduler from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import { sha256Hex, signEd25519Hex } from "./cryptoUtils";
import { merkleRootHex } from "./merkle";

/**
 * Chạy sau predictFairness (FOREST-6) ~10 phút
 * - Lấy document mới nhất từ collection `predictions`
 * - Tính Merkle root cho mảng `forecast`
 * - Ký Ed25519 và publish manifest
 */
export const signForecast = scheduler.onSchedule(
  { schedule: "10 3 * * *", timeZone: "Asia/Ho_Chi_Minh", region: "asia-southeast1" },
  async () => {
    const db = admin.firestore();

    // Lấy bản dự báo mới nhất theo docId ISO (FOREST-6 đã dùng docId = ISO time)
    const snap = await db
      .collection("predictions")
      .orderBy(admin.firestore.FieldPath.documentId(), "desc")
      .limit(1)
      .get();

    if (snap.empty) {
      console.log("No predictions to sign.");
      return;
    }

    const doc = snap.docs[0];
    const data: any = doc.data();
    const forecast: any[] = data.forecast || [];

    // Tạo leaves từ JSON từng phần tử forecast
    const leaves = forecast.map((f) => sha256Hex(JSON.stringify(f)));
    const root = merkleRootHex(leaves);

    const signature = signEd25519Hex(root);
    const manifest = {
      type: "forecast_manifest",
      alg: "SHA-256",
      sig_alg: "Ed25519",
      kid: process.env.JWKS_KID || "wellnexus-ed25519",
      merkleRoot: root,
      leaves: leaves.length,
      createdAt: new Date().toISOString(),
      signature,
    };

    // Lưu manifest vào evidence (id = merkleRoot)
    await db.collection("evidence").doc(root).set(manifest);
    // Đánh dấu "latest" cho endpoint công khai
    await db.collection("evidence_meta").doc("forecast_latest").set({ root });

    console.log("Signed forecast manifest:", manifest);
  }
);
