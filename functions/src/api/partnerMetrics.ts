import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { DocumentSnapshot, Query, QueryDocumentSnapshot } from "firebase-admin/firestore";

if (!admin.apps.length) {
  admin.initializeApp();
}

type PartnerMetricsRecord = {
  name?: unknown;
  active_users?: unknown;
  monthly_revenue?: unknown;
  updated_at?: admin.firestore.Timestamp;
};

type PartnerMetricsResponse = {
  id: string;
  name: string;
  active_users: number;
  monthly_revenue: number;
  updatedAt?: string;
};

const MAX_LIMIT = 100;

const metricsCollection = () => admin.firestore().collection("partner_metrics");

const parseNumber = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim().length) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return 0;
};

const parseUpdatedSince = (
  value: unknown
): { date: Date | null; error?: string } => {
  if (value === undefined || value === null) {
    return { date: null };
  }

  const raw = value.toString().trim();
  if (!raw.length) {
    return { date: null };
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return { date: null, error: "Invalid updated_since parameter" };
  }

  return { date: parsed };
};

const parseLimit = (value: unknown): { limit: number | null; error?: string } => {
  if (value === undefined || value === null) {
    return { limit: null };
  }

  const raw = value.toString().trim();
  if (!raw.length) {
    return { limit: null };
  }

  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) {
    return { limit: null, error: "Invalid limit parameter" };
  }

  if (parsed <= 0) {
    return { limit: null, error: "Limit must be greater than zero" };
  }

  return { limit: Math.min(parsed, MAX_LIMIT) };
};

const toResponse = (
  doc: DocumentSnapshot | QueryDocumentSnapshot
): PartnerMetricsResponse => {
  const data = (doc.data() as PartnerMetricsRecord | undefined) ?? {};
  const updatedAt = data.updated_at?.toDate?.().toISOString();

  return {
    id: doc.id,
    name: typeof data.name === "string" && data.name.trim().length ? data.name : "Unknown Partner",
    active_users: parseNumber(data.active_users),
    monthly_revenue: parseNumber(data.monthly_revenue),
    ...(updatedAt ? { updatedAt } : {})
  };
};

const withinUpdatedSince = (record: PartnerMetricsResponse, updatedSince: Date | null) => {
  if (!updatedSince) {
    return true;
  }

  if (!record.updatedAt) {
    return false;
  }

  const updatedAt = new Date(record.updatedAt);
  return !Number.isNaN(updatedAt.getTime()) && updatedAt >= updatedSince;
};

export const partnerMetrics = functions
  .region("us-central1")
  .https.onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set("Access-Control-Max-Age", "600");

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "GET") {
      res.status(405).json({ ok: false, error: "Method Not Allowed" });
      return;
    }

    const partnerIdParam = req.query.partner_id;
    const partnerId = Array.isArray(partnerIdParam)
      ? partnerIdParam[0]
      : partnerIdParam;
    const normalizedPartnerId = partnerId?.toString().trim() || null;

    const updatedSinceParam = req.query.updated_since;
    const updatedSinceValue = Array.isArray(updatedSinceParam)
      ? updatedSinceParam[0]
      : updatedSinceParam;
    const { date: updatedSince, error: updatedSinceError } = parseUpdatedSince(updatedSinceValue);
    if (updatedSinceError) {
      res.status(400).json({ ok: false, error: updatedSinceError });
      return;
    }

    const limitParam = req.query.limit;
    const limitValue = Array.isArray(limitParam) ? limitParam[0] : limitParam;
    const { limit: parsedLimit, error: limitError } = parseLimit(limitValue);
    if (limitError) {
      res.status(400).json({ ok: false, error: limitError });
      return;
    }

    const normalizedLimit = parsedLimit && parsedLimit > 0 ? parsedLimit : null;

    try {
      let data: PartnerMetricsResponse[] = [];

      if (normalizedPartnerId) {
        const doc = await metricsCollection().doc(normalizedPartnerId).get();
        if (!doc.exists) {
          res.status(404).json({ ok: false, error: "Partner metrics not found" });
          return;
        }
        const record = toResponse(doc);
        data = withinUpdatedSince(record, updatedSince) ? [record] : [];
      } else {
        let query: Query = metricsCollection();

        if (updatedSince) {
          query = query
            .where("updated_at", ">=", admin.firestore.Timestamp.fromDate(updatedSince))
            .orderBy("updated_at", "desc");
        } else {
          query = query.orderBy("name");
        }

        if (normalizedLimit) {
          query = query.limit(normalizedLimit);
        }

        const snapshot = await query.get();
        data = snapshot.docs.map(doc => toResponse(doc));

        if (updatedSince) {
          data = data.filter(record => withinUpdatedSince(record, updatedSince));
        }
      }

      res.set("Cache-Control", "public, max-age=60, s-maxage=120");
      functions.logger.info("Partner metrics response", {
        partnerId: normalizedPartnerId,
        count: data.length,
        updatedSince: updatedSince?.toISOString() ?? null,
        limit: normalizedLimit
      });
      res.json({
        ok: true,
        data,
        meta: {
          count: data.length,
          partnerId: normalizedPartnerId,
          ...(updatedSince ? { updatedSince: updatedSince.toISOString() } : {}),
          ...(normalizedLimit ? { limit: normalizedLimit } : {})
        }
      });
    } catch (error) {
      functions.logger.error("Failed to load partner metrics", error);
      const message = error instanceof Error ? error.message : "Unexpected error";
      res.status(500).json({ ok: false, error: message });
    }
  });
