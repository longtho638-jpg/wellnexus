const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// Onboarding
exports.onboardingStep = functions.https.onRequest((request, response) => {
  response.send("onboardingStep function");
});

// Affiliate
exports.affiliateQuote = functions.https.onRequest((request, response) => {
  response.send("affiliateQuote function");
});

exports.affiliateSettle = functions.https.onRequest((request, response) => {
  response.send("affiliateSettle function");
});

// Ad Review
exports.adSubmit = functions.https.onRequest((request, response) => {
  response.send("adSubmit function");
});

exports.adStatus = functions.https.onRequest((request, response) => {
  response.send("adStatus function");
});

// Evidence
exports.evidenceAnchor = functions.https.onRequest((request, response) => {
  response.send("evidenceAnchor function");
});

exports.evidenceVerify = functions.https.onRequest((request, response) => {
  response.send("evidenceVerify function");
});

// Scheduled functions
exports.reconcileCommissions = functions.pubsub.schedule("every day 02:00").onRun((context) => {
  console.log("reconcileCommissions function");
  return null;
});

exports.publishEvidenceLedger = functions.pubsub.schedule("every 12 hours").onRun((context) => {
  console.log("publishEvidenceLedger function");
  return null;
});
