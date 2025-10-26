
import * as admin from "firebase-admin";

if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        databaseURL: "https://<your-project-id>.firebaseio.com"
    });
}
