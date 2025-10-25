"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forecastBadge = exports.forecastVerify = exports.forecastManifestPublic = exports.signForecast = exports.predictFairness = exports.auditEvidence = exports.analyticsFairness = exports.onMetricsWrite = exports.onEvidenceWrite = exports.partnerDigest = exports.transparencyFeed = exports.metricsSummary = exports.metricsCollector = exports.partnersUpdate = exports.partnersList = exports.evidenceList = exports.evidenceBadge = exports.evidenceVerify = exports.publishEvidenceLedger = exports.channelAutoAttr = exports.channelGuard = exports.adStatus = exports.adSubmit = exports.affiliateSettle = exports.affiliateQuote = exports.onboardingStep = void 0;
const admin = require("firebase-admin");
// SEED
const onboardingStep_1 = require("./onboardingStep");
// TREE
const affiliateQuote_1 = require("./affiliateQuote");
const affiliateSettle_1 = require("./affiliateSettle");
const adSubmit_1 = require("./adSubmit");
const adStatus_1 = require("./adStatus");
const channelGuard_1 = require("./channelGuard");
const channelAutoAttr_1 = require("./channelAutoAttr");
// FOREST
const publishEvidenceLedger_1 = require("./publishEvidenceLedger");
const evidenceVerify_1 = require("./evidenceVerify");
const evidenceBadge_1 = require("./evidenceBadge");
const partnersList_1 = require("./partnersList");
const partnersUpdate_1 = require("./partnersUpdate");
const evidenceList_1 = require("./evidenceList");
const metricsCollector_1 = require("./metricsCollector");
const metricsSummary_1 = require("./metricsSummary");
const transparencyFeed_1 = require("./transparencyFeed");
const partnerDigest_1 = require("./partnerDigest");
const onEvidenceWrite_1 = require("./onEvidenceWrite");
const onMetricsWrite_1 = require("./onMetricsWrite");
const analyticsFairness_1 = require("./analyticsFairness");
const auditEvidence_1 = require("./auditEvidence");
const predictFairness_1 = require("./predictFairness");
const signForecast_1 = require("./signForecast");
const forecastManifestPublic_1 = require("./forecastManifestPublic");
const forecastVerify_1 = require("./forecastVerify");
const forecastBadge_1 = require("./forecastBadge");
admin.initializeApp();
const db = admin.firestore();
// Onboarding
exports.onboardingStep = (0, onboardingStep_1.onboardingStep)(db);
// Affiliate
exports.affiliateQuote = affiliateQuote_1.affiliateQuote;
exports.affiliateSettle = affiliateSettle_1.affiliateSettle;
// Ads & Compliance
exports.adSubmit = adSubmit_1.adSubmit;
exports.adStatus = adStatus_1.adStatus;
// Channel
exports.channelGuard = channelGuard_1.channelGuard;
exports.channelAutoAttr = channelAutoAttr_1.channelAutoAttr;
// Evidence & Ledger
exports.publishEvidenceLedger = publishEvidenceLedger_1.publishEvidenceLedger;
exports.evidenceVerify = evidenceVerify_1.evidenceVerify;
exports.evidenceBadge = evidenceBadge_1.evidenceBadge;
exports.evidenceList = evidenceList_1.evidenceList;
// Partners
exports.partnersList = partnersList_1.partnersList;
exports.partnersUpdate = partnersUpdate_1.partnersUpdate;
// Metrics & SLA
exports.metricsCollector = metricsCollector_1.metricsCollector;
exports.metricsSummary = metricsSummary_1.metricsSummary;
// Transparency
exports.transparencyFeed = transparencyFeed_1.transparencyFeed;
exports.partnerDigest = partnerDigest_1.partnerDigest;
// Realtime
exports.onEvidenceWrite = onEvidenceWrite_1.onEvidenceWrite;
exports.onMetricsWrite = onMetricsWrite_1.onMetricsWrite;
// Analytics & Fairness
exports.analyticsFairness = analyticsFairness_1.analyticsFairness;
exports.auditEvidence = auditEvidence_1.auditEvidence;
exports.predictFairness = predictFairness_1.predictFairness;
// Forecast Signing & Verification
exports.signForecast = signForecast_1.signForecast;
exports.forecastManifestPublic = forecastManifestPublic_1.forecastManifestPublic;
exports.forecastVerify = forecastVerify_1.forecastVerify;
exports.forecastBadge = forecastBadge_1.forecastBadge;
//# sourceMappingURL=index.js.map