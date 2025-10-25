"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metricsCollector = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
exports.metricsCollector = (0, scheduler_1.onSchedule)({ schedule: "every 6 hours", region: "asia-southeast1" }, async () => {
    const db = admin.firestore();
    const now = new Date();
    const dateKey = now.toISOString().slice(0, 10);
    // Dummy uptime & verify data – sau này có thể thay bằng probe thực tế
    const uptime = Math.random() * (0.999 - 0.985) + 0.985;
    const verifyRate = Math.random() * (0.995 - 0.97) + 0.97;
    const errors = Math.floor(Math.random() * 3);
    await db.collection("metrics_daily").doc(dateKey).set({
        uptime,
        verifyRate,
        errors,
        ts: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log("Metrics logged:", dateKey, uptime, verifyRate);
});
//# sourceMappingURL=metricsCollector.js.map