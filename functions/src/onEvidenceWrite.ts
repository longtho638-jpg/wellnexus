import * as functions from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

export const onEvidenceWrite = functions.onDocumentWritten("evidence/{docId}", async (event) => {
  const after = event.data?.after?.data();
  if (!after) {
    console.log("No data after write on evidence/{docId}. Exiting.");
    return;
  }
  
  // Ensure Realtime Database is enabled and configured for your project.
  try {
    const db = admin.database();
    await db.ref("/realtime/evidence").set({
      ts: Date.now(),
      root: after.rootHash,
      total: after.totalDocs || 0,
    });
    console.log("Realtime evidence update pushed successfully.");
  } catch (error) {
    console.error("Failed to push to Realtime Database:", error);
  }
});
