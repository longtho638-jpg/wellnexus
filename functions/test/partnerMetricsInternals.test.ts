import { describe, expect, it } from "vitest";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";
import {
  MAX_LIMIT,
  parseLimit,
  parseNumber,
  parseUpdatedSince,
  toResponse,
  withinUpdatedSince,
  type PartnerMetricsResponse
} from "../src/api/partnerMetricsInternals";

const createDoc = (
  id: string,
  data: Record<string, unknown>
): QueryDocumentSnapshot => ({
  id,
  data: () => data
} as unknown as QueryDocumentSnapshot);

describe("partnerMetricsInternals", () => {
  describe("parseUpdatedSince", () => {
    it("returns null date when value absent", () => {
      expect(parseUpdatedSince(undefined)).toEqual({ date: null });
      expect(parseUpdatedSince(null)).toEqual({ date: null });
    });

    it("returns error when date invalid", () => {
      expect(parseUpdatedSince("not-a-date")).toEqual({
        date: null,
        error: "Invalid updated_since parameter"
      });
    });

    it("parses valid ISO string", () => {
      const now = new Date();
      const result = parseUpdatedSince(now.toISOString());
      expect(result.error).toBeUndefined();
      expect(result.date?.toISOString()).toEqual(now.toISOString());
    });
  });

  describe("parseLimit", () => {
    it("returns null for empty values", () => {
      expect(parseLimit(undefined)).toEqual({ limit: null });
      expect(parseLimit("")).toEqual({ limit: null });
    });

    it("errors on invalid numbers", () => {
      expect(parseLimit("abc")).toEqual({ limit: null, error: "Invalid limit parameter" });
      expect(parseLimit("0")).toEqual({ limit: null, error: "Limit must be greater than zero" });
    });

    it("clamps to maximum limit", () => {
      expect(parseLimit(String(MAX_LIMIT + 10))).toEqual({ limit: MAX_LIMIT });
    });
  });

  describe("parseNumber", () => {
    it("handles numeric-like input", () => {
      expect(parseNumber(15)).toBe(15);
      expect(parseNumber("20")).toBe(20);
    });

    it("returns zero for invalid values", () => {
      expect(parseNumber("nan")).toBe(0);
      expect(parseNumber({})).toBe(0);
    });
  });

  describe("toResponse", () => {
    it("normalizes missing values", () => {
      const doc = createDoc("p1", {});
      expect(toResponse(doc)).toEqual({
        id: "p1",
        name: "Unknown Partner",
        active_users: 0,
        monthly_revenue: 0
      });
    });

    it("converts timestamp to ISO string", () => {
      const updated = new Date();
      const doc = createDoc("p2", {
        name: "Partner Two",
        active_users: 3,
        monthly_revenue: "42",
        updated_at: { toDate: () => updated }
      });

      expect(toResponse(doc)).toEqual({
        id: "p2",
        name: "Partner Two",
        active_users: 3,
        monthly_revenue: 42,
        updatedAt: updated.toISOString()
      });
    });
  });

  describe("withinUpdatedSince", () => {
    const baseRecord: PartnerMetricsResponse = {
      id: "abc",
      name: "Test Partner",
      active_users: 1,
      monthly_revenue: 2
    };

    it("passes through when no filter", () => {
      expect(withinUpdatedSince(baseRecord, null)).toBe(true);
    });

    it("rejects when record missing timestamp", () => {
      expect(withinUpdatedSince(baseRecord, new Date())).toBe(false);
    });

    it("verifies timestamp against filter", () => {
      const updatedRecord: PartnerMetricsResponse = {
        ...baseRecord,
        updatedAt: new Date().toISOString()
      };
      const filter = new Date(Date.now() - 60_000);
      expect(withinUpdatedSince(updatedRecord, filter)).toBe(true);
      const futureFilter = new Date(Date.now() + 60_000);
      expect(withinUpdatedSince(updatedRecord, futureFilter)).toBe(false);
    });
  });
});
