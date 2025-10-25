import * as functions from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

export const channelGuard = functions.onRequest(async (req, res) => {
  try {
    const { seller_id, sku, online_price, npp_price, is_official } = req.body;
    if (!seller_id || !sku) {
      res.status(400).json({ error: "Thiếu dữ liệu kênh hoặc SKU" });
      return;
    }

    const violations: string[] = [];
    if (online_price < npp_price)
      violations.push("Giá online thấp hơn NPP — vi phạm.");
    if (is_official && !sku.includes("bundle") && !sku.includes("special"))
      violations.push("SKU official phải là bundle hoặc special.");

    const verdict = violations.length > 0 ? "violated" : "passed";
    const doc = {
      seller_id,
      sku,
      online_price,
      npp_price,
      is_official,
      verdict,
      violations,
      ts: admin.firestore.FieldValue.serverTimestamp(),
    };

    await admin.firestore().collection("channel_logs").add(doc);
    res.json({ verdict, violations });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
