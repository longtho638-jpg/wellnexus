import * as functions from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

export const adStatus = functions.onRequest(async (req, res) => {
  try {
    const { ad_id } = req.query;
    if (!ad_id) {
      res.status(400).json({ error: "Thiếu ad_id" });
      return;
    }
    const snap = await admin.firestore().collection("ad_reviews").doc(String(ad_id)).get();
    if (!snap.exists) {
      res.status(404).json({ error: "Không tìm thấy quảng cáo" });
      return;
    }
    res.json(snap.data());
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
