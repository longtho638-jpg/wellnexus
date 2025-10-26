import * as admin from "firebase-admin";
const db = admin.firestore();
export const _onboarding_step_ = async (req, res) => {
    try {
        const { user_id, step, artefact } = req.body;
        // TODO: Validate request body
        // TODO: Check if user exists and is authenticated
        // TODO: Check if step is in order
        // TODO: Persist onboarding_step_record
        await db.collection("onboarding_step_records").add({
            user_id,
            step,
            artefact,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        // TODO: Return next CTA
        res.status(200).json({ next_cta: "Next step" });
    }
    catch (error) {
        console.error("Error in onboarding step:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
