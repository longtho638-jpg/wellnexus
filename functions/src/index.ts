// functions/src/index.ts
import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { onUserCreate } from "firebase-functions/v2/auth";

admin.initializeApp();
const db = admin.firestore();

export const apiHandler = onRequest({ region: "asia-southeast1", cors: true }, async (req, res) => {
    const path = req.path.split('/').pop();
    const idToken = req.headers.authorization?.split('Bearer ')[1];

    if (!idToken && path !== 'getFirebaseConfig' && path !== 'healthCheck') {
        res.status(401).send('Unauthorized');
        return;
    }

    let decodedToken;
    if (idToken) {
        try {
            decodedToken = await admin.auth().verifyIdToken(idToken);
        } catch (error) {
            res.status(403).send('Invalid Token');
            return;
        }
    }

    switch (path) {
        case 'getFirebaseConfig':
            res.status(200).json(JSON.parse(process.env.FIREBASE_CONFIG || '{}'));
            break;

        case 'getMyMetrics':
            // ... (Implementation from previous successful steps) ...
            break;

        case 'logSale':
            // ... (Implementation from previous successful steps) ...
            break;

        case 'getPartnerList':
            // In a real app, check for admin role in decodedToken
            const snapshot = await db.collection('partners').get();
            const partners = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            res.status(200).json(partners);
            break;

        case 'approvePartner':
            // In a real app, check for admin role
            const { partnerId } = req.body;
            if (!partnerId) { res.status(400).json({ error: "Missing partnerId" }); return; }
            await db.collection('partners').doc(partnerId).update({ status: 'approved' });
            res.status(200).json({ message: 'Partner approved' });
            break;

        default:
            res.status(404).send('Not Found');
    }
});

export const createPartnerProfile = onUserCreate({ region: "asia-southeast1" }, async (user) => {
  // ... (Implementation from previous successful steps) ...
});
