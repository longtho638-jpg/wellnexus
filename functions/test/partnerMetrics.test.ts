import { describe, expect, it, vi } from "vitest";
import type { Request, Response } from "firebase-functions";
import type {
  DocumentSnapshot,
  QueryDocumentSnapshot
} from "firebase-admin/firestore";
import {
  createPartnerMetricsHandler,
  type PartnerMetricsStore
} from "../src/api/partnerMetrics";
import type { PartnerMetricsRecord } from "../src/api/partnerMetricsInternals";

const createTimestamp = (iso: string) => ({
  toDate: () => new Date(iso)
});

const createDocument = (
  options: Partial<{
    id: string;
    exists: boolean;
    record: PartnerMetricsRecord | null;
  }> = {}
) => {
  const { id = "alpha", exists = true, record } = options;
  const data: PartnerMetricsRecord =
    record ?? {
      name: "Alpha Partner",
      active_users: 42,
      monthly_revenue: 1234,
      updated_at: createTimestamp("2024-01-01T00:00:00.000Z")
    };

  const snapshot = {
    id,
    exists,
    data: () => (exists ? (data as PartnerMetricsRecord) : undefined)
  } as unknown as DocumentSnapshot;

  return snapshot;
};

const createQueryDocument = (
  options: Partial<{
    id: string;
    record: PartnerMetricsRecord;
  }>
) => {
  const snapshot = createDocument({ ...options, exists: true });
  return snapshot as unknown as QueryDocumentSnapshot;
};

const createResponse = () => {
  const headers = new Map<string, string>();
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    headers,
    status: vi.fn().mockImplementation(function status(code: number) {
      res.statusCode = code;
      return res;
    }),
    json: vi.fn().mockImplementation(function json(payload: unknown) {
      res.body = payload;
      return res;
    }),
    send: vi.fn().mockImplementation(function send(payload: unknown) {
      res.body = payload;
      return res;
    }),
    set: vi.fn().mockImplementation(function set(key: string, value: string) {
      headers.set(key, value);
      return res;
    })
  };

  return res as Response & {
    statusCode: number;
    body: unknown;
    headers: Map<string, string>;
  };
};

const createRequest = (
  overrides: Partial<Request> & { query?: Record<string, unknown> } = {}
) => {
  const req = {
    method: "GET",
    query: {},
    headers: {},
    ...overrides
  } as unknown as Request;

  return req;
};

const createStore = (
  overrides: Partial<PartnerMetricsStore> = {}
): PartnerMetricsStore => ({
  fetchById: vi.fn(),
  fetchAll: vi.fn(),
  ...overrides
});

describe("partnerMetrics handler", () => {
  it("rejects non-GET methods", async () => {
    const store = createStore();
    const handler = createPartnerMetricsHandler(store);
    const req = createRequest({ method: "POST" });
    const res = createResponse();

    await handler(req, res);

    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(res.headers.get("Access-Control-Allow-Methods")).toBe("GET, OPTIONS");
    expect(res.headers.get("Access-Control-Allow-Headers")).toBe(
      "Content-Type, Authorization"
    );
    expect(res.headers.get("Access-Control-Max-Age")).toBe("600");
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ ok: false, error: "Method Not Allowed" });
    expect(store.fetchById).not.toHaveBeenCalled();
    expect(store.fetchAll).not.toHaveBeenCalled();
  });

  it("handles CORS preflight", async () => {
    const store = createStore();
    const handler = createPartnerMetricsHandler(store);
    const req = createRequest({ method: "OPTIONS" });
    const res = createResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalledWith("");
  });

  it("validates updated_since parameter", async () => {
    const store = createStore();
    const handler = createPartnerMetricsHandler(store);
    const req = createRequest({ query: { updated_since: "not-a-date" } });
    const res = createResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      error: "Invalid updated_since parameter"
    });
  });

  it("validates limit parameter", async () => {
    const store = createStore();
    const handler = createPartnerMetricsHandler(store);
    const req = createRequest({ query: { limit: "zero" } });
    const res = createResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      error: "Invalid limit parameter"
    });
  });

  it("returns 404 when partner not found", async () => {
    const store = createStore({
      fetchById: vi.fn().mockResolvedValueOnce(
        createDocument({ id: "missing", exists: false })
      )
    });
    const handler = createPartnerMetricsHandler(store);
    const req = createRequest({ query: { partner_id: "missing" } });
    const res = createResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      error: "Partner metrics not found"
    });
  });

  it("returns single partner metrics when found", async () => {
    const partnerDoc = createDocument({
      id: "beta",
      record: {
        name: "Beta",
        active_users: 100,
        monthly_revenue: 2000,
        updated_at: createTimestamp("2024-03-01T00:00:00.000Z")
      }
    });
    const store = createStore({
      fetchById: vi.fn().mockResolvedValueOnce(partnerDoc)
    });
    const handler = createPartnerMetricsHandler(store);
    const req = createRequest({ query: { partner_id: "beta" } });
    const res = createResponse();

    await handler(req, res);

    expect(res.json).toHaveBeenCalledWith({
      ok: true,
      data: [
        {
          id: "beta",
          name: "Beta",
          active_users: 100,
          monthly_revenue: 2000,
          updatedAt: "2024-03-01T00:00:00.000Z"
        }
      ],
      meta: {
        count: 1,
        partnerId: "beta"
      }
    });
  });

  it("lists partner metrics with filtering", async () => {
    const recentRecord: PartnerMetricsRecord = {
      name: "Recent",
      active_users: 5,
      monthly_revenue: 55,
      updated_at: createTimestamp("2024-02-10T10:00:00.000Z")
    };
    const staleRecord: PartnerMetricsRecord = {
      name: "Stale",
      active_users: 1,
      monthly_revenue: 10,
      updated_at: createTimestamp("2023-12-01T00:00:00.000Z")
    };
    const store = createStore({
      fetchAll: vi.fn().mockResolvedValueOnce([
        createQueryDocument({ id: "recent", record: recentRecord }),
        createQueryDocument({ id: "stale", record: staleRecord })
      ])
    });
    const handler = createPartnerMetricsHandler(store);
    const updatedSince = new Date("2024-01-01T00:00:00.000Z");
    const req = createRequest({
      query: {
        updated_since: updatedSince.toISOString(),
        limit: "5"
      }
    });
    const res = createResponse();

    await handler(req, res);

    expect(store.fetchAll).toHaveBeenCalledWith({
      updatedSince,
      limit: 5
    });
    expect(res.json).toHaveBeenCalledWith({
      ok: true,
      data: [
        {
          id: "recent",
          name: "Recent",
          active_users: 5,
          monthly_revenue: 55,
          updatedAt: "2024-02-10T10:00:00.000Z"
        }
      ],
      meta: {
        count: 1,
        partnerId: null,
        updatedSince: updatedSince.toISOString(),
        limit: 5
      }
    });
  });

  it("returns error response when store throws", async () => {
    const store = createStore({
      fetchAll: vi.fn().mockRejectedValueOnce(new Error("boom"))
    });
    const handler = createPartnerMetricsHandler(store);
    const req = createRequest();
    const res = createResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ ok: false, error: "boom" });
  });
});
