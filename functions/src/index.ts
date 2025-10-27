// functions/src/index.ts
// This single function will handle all API requests, simplifying the architecture.
// More complex routing can be handled inside this function if needed.

import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

admin.initializeApp();

export const apiHandler = onRequest({ region: "asia-southeast1", cors: true }, async (req, res) => {
    // This is a simple router. A more robust solution like Express could be used later.
    const path = req.path.split('/').pop(); // Gets the last part of the URL path

    logger.info(`API call received for: ${path}`);

    switch (path) {
        case 'getFirebaseConfig':
            // Logic for getting Firebase config
            res.status(200).json(JSON.parse(process.env.FIREBASE_CONFIG || '{}'));
            break;
        case 'healthCheck':
            res.status(200).json({ status: "ok" });
            break;
        // Add cases for 'getMyMetrics', 'registerPartner', etc. here
        default:
            res.status(404).send('Not Found');
    }
});
