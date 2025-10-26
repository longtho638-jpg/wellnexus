import functions from "firebase-functions";
import admin from "firebase-admin";
import { autoDeploy } from "./agents/autoDeployAgent.js";

admin.initializeApp();

// Onboarding
export const onboardingStep = functions.https.onRequest((request, response) => {
  response.send("onboardingStep function");
});

// Affiliate
export const affiliateQuote = functions.https.onRequest((request, response) => {
  response.send("affiliateQuote function");
});

export const affiliateSettle = functions.https.onRequest((request, response) => {
  response.send("affiliateSettle function");
});

// Ad Review
export const adSubmit = functions.https.onRequest((request, response) => {
  response.send("adSubmit function");
});

export const adStatus = functions.https.onRequest((request, response) => {
  response.send("adStatus function");
});

// Evidence
export const evidenceAnchor = functions.https.onRequest((request, response) => {
  response.send("evidenceAnchor function");
});

export const evidenceVerify = functions.https.onRequest((request, response) => {
  response.send("evidenceVerify function");
});

// Scheduled functions
export const reconcileCommissions = functions.pubsub.schedule("every day 02:00").onRun((context) => {
  console.log("reconcileCommissions function");
  return null;
});

export const publishEvidenceLedger = functions.pubsub.schedule("every 12 hours").onRun((context) => {
  console.log("publishEvidenceLedger function");
  return null;
});

export const deployAgent = functions.https.onRequest(async (req, res) => {
  await autoDeploy();
  res.status(200).send("Auto-deploy agent completed.");
});
