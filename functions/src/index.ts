// File: functions/src/index.ts
// Project: WellNexus — API Skeleton (Idempotency-Key + X-Two-Eyes-Token)
// Runtime: Firebase Functions (v2) with Express
// Purpose: Tạo stubs cho 3 endpoint:
//   POST /api/affiliate/quote
//   POST /api/affiliate/settle
//   POST /api/evidence/verify
// Yêu cầu header:
//   - Idempotency-Key: bắt buộc cho mọi POST
//   - X-Two-Eyes-Token: bắt buộc cho các thao tác mang tính phê duyệt (settle, verify)
// Ghi chú: Idempotency store hiện là InMemory — cần thay bằng Firestore/Redis cho production.

import * as functions from "firebase-functions/v2/https";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import crypto from "crypto";

// ===============
// Types & Helpers
// ===============

type IdemKey = string;

type CachedResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: unknown;
  createdAt: number; // epoch ms
};

// In-memory idempotency cache (replace with Firestore/Redis in production)
const idemCache = new Map<IdemKey, CachedResponse>();

const REQUIRED_IDEM_HEADER = "idempotency-key"; // normalized
const TWO_EYES_HEADER = "x-two-eyes-token"; // normalized
const REQUEST_ID_HEADER = "x-request-id";

function now() {
  return Date.now();
}

function genRequestId() {
  return crypto.randomUUID();
}

function normalizeHeader(req: Request, name: string): string | undefined {
  const v = req.headers[name.toLowerCase()];
  if (Array.isArray(v)) return v[0];
  return v as string | undefined;
}

function ok<T>(res: Response, payload: T, meta: Record<string, unknown> = {}) {
  return res.status(200).json({ ok: true, data: payload, meta });
}

function accepted<T>(res: Response, payload: T, meta: Record<string, unknown> = {}) {
  return res.status(202).json({ ok: true, data: payload, meta });
}

function badRequest(res: Response, message: string, meta: Record<string, unknown> = {}) {
  return res.status(400).json({ ok: false, error: { code: "BAD_REQUEST", message }, meta });
}

function unauthorized(res: Response, message: string, meta: Record<string, unknown> = {}) {
  return res.status(401).json({ ok: false, error: { code: "UNAUTHORIZED", message }, meta });
}

function conflict(res: Response, message: string, meta: Record<string, unknown> = {}) {
  return res.status(409).json({ ok: false, error: { code: "CONFLICT", message }, meta });
}

// ===============
// Middleware
// ===============

// Attach x-request-id if missing, and basic CORS/JSON
const baseMiddleware = [
  cors({ origin: true }),
  express.json({ limit: "1mb" }),
  (req: Request, res: Response, next: NextFunction) => {
    const requestId = normalizeHeader(req, REQUEST_ID_HEADER) ?? genRequestId();
    res.setHeader(REQUEST_ID_HEADER, requestId);
    // also expose header for browsers
    res.setHeader("Access-Control-Expose-Headers", `${REQUEST_ID_HEADER}, Idempotency-Key`);
    next();
  },
];

// Require Idempotency-Key on all POST requests; serve cached response if exists
function requireIdempotency(req: Request, res: Response, next: NextFunction) {
  if (req.method !== "POST") return next();
  const key = normalizeHeader(req, REQUIRED_IDEM_HEADER);
  if (!key) {
    return badRequest(res, `Missing header: Idempotency-Key`, { hint: "Provide a unique key per logical operation." });
  }

  // If cached, replay saved response
  const cached = idemCache.get(key);
  if (cached) {
    Object.entries(cached.headers).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(cached.statusCode).json(cached.body);
  }

  // Stash key on req for handlers
  (req as any).idempotencyKey = key;
  next();
}

// Optional: enforce Two-Eyes for sensitive ops
function requireTwoEyes(req: Request, res: Response, next: NextFunction) {
  const token = normalizeHeader(req, TWO_EYES_HEADER);
  if (!token) {
    return unauthorized(res, `Missing header: X-Two-Eyes-Token`, { hint: "Two-person control required." });
  }

  // TODO: integrate with your approval service/DB to validate token
  const isValid = mockValidateTwoEyes(token);
  if (!isValid) {
    return unauthorized(res, `Invalid X-Two-Eyes-Token`, { hint: "Token must be approved by two distinct reviewers." });
  }

  (req as any).twoEyesToken = token;
  next();
}

function mockValidateTwoEyes(token: string): boolean {
  // Placeholder logic — replace with real verification (e.g., signed JWT, DB lookup, expiry window)
  // For local dev, accept tokens starting with "ok-"
  return token.startsWith("ok-");
}

// Persist idempotent response in cache (swap to Firestore/Redis)
function saveIdempotentResponse(req: Request, res: Response, statusCode: number, body: unknown) {
  const key: string | undefined = (req as any).idempotencyKey;
  if (!key) return; // safety
  const headers: Record<string, string> = {
    [REQUEST_ID_HEADER]: (res.getHeader(REQUEST_ID_HEADER) as string) ?? genRequestId(),
    "content-type": "application/json; charset=utf-8",
    "Idempotency-Key": key,
  };
  idemCache.set(key, { statusCode, headers, body, createdAt: now() });
}

// ===============
// Express App & Routes
// ===============

const app = express();
app.use(baseMiddleware);
app.use(requireIdempotency);

// Health check
app.get("/api/health", (_req, res) => {
  return ok(res, { status: "healthy", ts: now() });
});

// ----------
// 1) POST /api/affiliate/quote
// ----------
app.post("/api/affiliate/quote", async (req: Request, res: Response) => {
  // TODO: Validate req.body (e.g., Zod/Yup) — stub only
  const idem = (req as any).idempotencyKey as string;

  // Business stub: compute quote for an affiliate transaction
  const quoteId = crypto.randomUUID();
  const simulatedAmount = 123_456; // VNĐ — stub

  const payload = {
    quoteId,
    amount: simulatedAmount,
    currency: "VND",
    inputs: req.body ?? {},
  };

  const meta = { requestId: res.getHeader(REQUEST_ID_HEADER), idempotencyKey: idem };
  saveIdempotentResponse(req, res, 202, { ok: true, data: payload, meta });
  return accepted(res, payload, meta);
});

// ----------
// 2) POST /api/affiliate/settle  (Two-Eyes required)
// ----------
app.post("/api/affiliate/settle", requireTwoEyes, async (req: Request, res: Response) => {
  const idem = (req as any).idempotencyKey as string;
  const twoEyes = (req as any).twoEyesToken as string;

  // Business stub: create a settlement record for an approved payout
  const settlementId = crypto.randomUUID();

  const payload = {
    settlementId,
    status: "PENDING", // stub; later: QUEUED -> POSTED
    approvedByTwoEyes: true,
    twoEyesRef: twoEyes,
    inputs: req.body ?? {},
  };

  const meta = { requestId: res.getHeader(REQUEST_ID_HEADER), idempotencyKey: idem };
  saveIdempotentResponse(req, res, 202, { ok: true, data: payload, meta });
  return accepted(res, payload, meta);
});

// ----------
// 3) POST /api/evidence/verify  (Two-Eyes required)
// ----------
app.post("/api/evidence/verify", requireTwoEyes, async (req: Request, res: Response) => {
  const idem = (req as any).idempotencyKey as string;
  const twoEyes = (req as any).twoEyesToken as string;

  // Business stub: enqueue evidence for verification (KYC, proof-of-sale, etc.)
  const verificationId = crypto.randomUUID();

  const payload = {
    verificationId,
    queue: "evidence-verify",
    status: "QUEUED",
    twoEyesRef: twoEyes,
    inputs: req.body ?? {},
  };

  const meta = { requestId: res.getHeader(REQUEST_ID_HEADER), idempotencyKey: idem };
  saveIdempotentResponse(req, res, 202, { ok: true, data: payload, meta });
  return accepted(res, payload, meta);
});

// ===============
// Export Function (Firebase v2)
// ===============

export const api = functions.onRequest({ region: "asia-southeast1" }, app);
