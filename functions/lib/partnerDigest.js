import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";
// NOTE: Nodemailer setup requires valid SMTP credentials in environment variables.
// For this example, it will not send emails without SMTP_USER and SMTP_PASS.
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
export const partnerDigest = onSchedule({ schedule: "every sunday 09:00", region: "asia-southeast1", timeoutSeconds: 300 }, async () => {
    const db = admin.firestore();
    const partnersSnap = await db.collection("partners").where("status", "==", "approved").get();
    if (partnersSnap.empty) {
        console.log("No approved partners to send digests to.");
        return;
    }
    const metricsSnap = await db.collection("metrics_daily").orderBy("ts", "desc").limit(30).get();
    const evidenceSnap = await db.collection("evidence").orderBy("ts", "desc").limit(10).get();
    const metrics = metricsSnap.docs.map((d) => d.data());
    const evidenceCount = evidenceSnap.size;
    const avgUptime = (metrics.reduce((s, m) => s + (m.uptime || 0), 0) / (metrics.length || 1) * 100).toFixed(2);
    const avgVerify = (metrics.reduce((s, m) => s + (m.verifyRate || 0), 0) / (metrics.length || 1) * 100).toFixed(2);
    const htmlBody = `
      <h2>WellNexus Transparency Digest</h2>
      <p>Xin chào,</p>
      <p>Đây là báo cáo minh bạch tự động hàng tuần của WellNexus.</p>
      <ul>
        <li><strong>Uptime (30 ngày gần nhất):</strong> ${avgUptime}%</li>
        <li><strong>Tỷ lệ xác thực thành công (30 ngày gần nhất):</strong> ${avgVerify}%</li>
        <li><strong>Số bằng chứng mới được ghi nhận (tuần qua):</strong> ${evidenceCount}</li>
      </ul>
      <p>Bạn có thể xem chi tiết tại <a href="https://wellnexus-87243274-b52ca.web.app/status.html">Trang trạng thái của chúng tôi</a>.</p>
      <p>Trân trọng,<br/>Đội ngũ WellNexus</p>
    `;
    for (const partnerDoc of partnersSnap.docs) {
        const { email, name } = partnerDoc.data();
        if (!email)
            continue;
        try {
            await transporter.sendMail({
                from: `"WellNexus Transparency" <${process.env.SMTP_USER}>`,
                to: email,
                subject: `Báo cáo minh bạch WellNexus - ${new Date().toLocaleDateString('vi-VN')}`,
                html: `<p>Chào ${name},</p>${htmlBody}`,
            });
            console.log(`Digest sent to ${email}`);
        }
        catch (error) {
            console.error(`Failed to send email to ${email}:`, error);
        }
    }
    console.log(`Digest process completed for ${partnersSnap.size} partners.`);
});
