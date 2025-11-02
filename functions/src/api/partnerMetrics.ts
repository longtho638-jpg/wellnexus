import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type {
  Query,
  DocumentSnapshot,
  QueryDocumentSnapshot
} from "firebase-admin/firestore";
import {
  parseLimit,
  parseUpdatedSince,
  toResponse,
  withinUpdatedSince,
  type PartnerMetricsResponse
} from "./partnerMetricsInternals";

if (!admin.apps.length) {
  admin.initializeApp();
}

const metricsCollection = () => admin.firestore().collection("partner_metrics");

export type PartnerMetricsStore = {
  fetchById: (id: string) => Promise<DocumentSnapshot>;
  fetchAll: (options: {
    updatedSince: Date | null;
    limit: number | null;
  }) => Promise<QueryDocumentSnapshot[]>;
};

const defaultStore: PartnerMetricsStore = {
  fetchById: id => metricsCollection().doc(id).get(),
  fetchAll: async ({ updatedSince, limit }) => {
    let query: Query = metricsCollection();

    if (updatedSince) {
      query = query
        .where("updated_at", ">=", admin.firestore.Timestamp.fromDate(updatedSince))
        .orderBy("updated_at", "desc");
    } else {
      query = query.orderBy("name");
    }

    if (limit && limit > 0) {
      query = query.limit(limit);
    }

    const snapshot = await query.get();
    return snapshot.docs;
  }
};

export const createPartnerMetricsHandler = (store: PartnerMetricsStore) =>
  async (req: functions.Request, res: functions.Response) => {
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
    const partnerId = Array.isArray(partnerIdParam) ? partnerIdParam[0] : partnerIdParam;
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
        const doc = await store.fetchById(normalizedPartnerId);
        if (!doc.exists) {
          res.status(404).json({ ok: false, error: "Partner metrics not found" });
          return;
        }
        const record = toResponse(doc);
        data = withinUpdatedSince(record, updatedSince) ? [record] : [];
      } else {
        const docs = await store.fetchAll({ updatedSince, limit: normalizedLimit });
        data = docs.map(doc => toResponse(doc));

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
  };

export const partnerMetrics = functions
  .region("us-central1")
  .https.onRequest(createPartnerMetricsHandler(defaultStore));
