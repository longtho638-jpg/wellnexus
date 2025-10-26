import * as functions from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
export const onMetricsWrite = functions.onDocumentWritten("metrics_daily/{docId}", async (event) => {
    const after = event.data?.after?.data();
    if (!after) {
        console.log("No data after write on metrics_daily/{docId}. Exiting.");
        return;
    }
    // Ensure Realtime Database is enabled and configured for your project.
    try {
        const db = admin.database();
        await db.ref("/realtime/metrics").set({
            ts: Date.now(),
            uptime: after.uptime,
            verifyRate: after.verifyRate,
            errors: after.errors,
        });
        console.log("Realtime metrics update pushed successfully.");
    }
    catch (error) {
        console.error("Failed to push to Realtime Database:", error);
    }
});
