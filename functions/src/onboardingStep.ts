import * as functions from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

export const onboardingStep = (db: admin.firestore.Firestore) => functions.onRequest(async (req, res) => {
  try {
    const { user_id, day, artefact } = req.body;
    if (!user_id || !day) {
      res.status(400).json({ error: "Missing user_id or day" });
      return;
    }

    const ref = db.collection("onboarding_progress").doc(user_id);
    await ref.set(
      {
        [day]: {
          artefact,
          ts: admin.firestore.FieldValue.serverTimestamp(),
        },
        last_updated: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    const nextCtaMap: { [key: number]: { cta: string; day: number | null } } = {
      1: { cta: "Hiểu SKU & pricing", day: 3 },
      3: { cta: "Tạo ref code & chia sẻ", day: 7 },
      7: { cta: "Chốt đơn đầu tiên", day: 14 },
      14: { cta: "Tuân thủ quảng cáo", day: 21 },
      21: { cta: "Nộp báo cáo mini", day: 30 },
    };
    
    const nextCta = nextCtaMap[day] ?? { cta: "Hoàn thành 30 ngày 🎉", day: null };

    res.json({
      ok: true,
      next: nextCta,
      message: `Đã ghi nhận ngày ${day}`,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
