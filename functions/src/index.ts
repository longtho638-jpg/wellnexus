// functions/src/index.ts
import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
// ... other imports

admin.initializeApp();
const db = admin.firestore();

export const apiHandler = onRequest({ region: "asia-southeast1", cors: true }, async (req, res) => {
    const path = req.path.split('/').pop();

    switch (path) {
        // ... (getMyMetrics, getFirebaseConfig cases remain the same)
        
        case 'logSale':
            const idToken = req.headers.authorization?.split('Bearer ')[1];
            if (!idToken) { res.status(401).send('Unauthorized'); return; }

            try {
                const decodedToken = await admin.auth().verifyIdToken(idToken);
                const partnerId = decodedToken.uid;
                
                const { amount, items } = req.body;
                if (!amount || !items) { res.status(400).json({ error: "Missing amount or items" }); return; }

                // 1. Log the sale
                const saleRef = await db.collection('sales').add({
                    seller_id: partnerId,
                    amount: amount,
                    items: items,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });

                // 2. Update daily metrics transactionally
                const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
                const metricsRef = db.collection('metrics_daily').doc(`${partnerId}_${today}`);

                await db.runTransaction(async (transaction) => {
                    const metricsDoc = await transaction.get(metricsRef);
                    if (!metricsDoc.exists) {
                        transaction.set(metricsRef, {
                            partner_id: partnerId,
                            date: today,
                            sales: 1,
                            commission: amount * 0.1, // Simplified 10% commission
                            clicks: 0,
                        });
                    } else {
                        transaction.update(metricsRef, {
                            sales: admin.firestore.FieldValue.increment(1),
                            commission: admin.firestore.FieldValue.increment(amount * 0.1),
                        });
                    }
                });

                res.status(201).json({ saleId: saleRef.id, message: "Sale logged successfully." });

            } catch (error) {
                // ... error handling
            }
            break;
            
        // ... other cases
    }
});

// ... (Other functions remain the same)
