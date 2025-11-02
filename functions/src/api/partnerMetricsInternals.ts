import type { DocumentSnapshot, QueryDocumentSnapshot } from "firebase-admin/firestore";

export type PartnerMetricsRecord = {
  name?: unknown;
  active_users?: unknown;
  monthly_revenue?: unknown;
  updated_at?: { toDate?: () => Date | null } | null;
};

export type PartnerMetricsResponse = {
  id: string;
  name: string;
  active_users: number;
  monthly_revenue: number;
  updatedAt?: string;
};

export const MAX_LIMIT = 100;

export const parseNumber = (value: unknown): number => {
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

export const parseUpdatedSince = (
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

export const parseLimit = (value: unknown): { limit: number | null; error?: string } => {
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

export const toResponse = (
  doc: DocumentSnapshot | QueryDocumentSnapshot
): PartnerMetricsResponse => {
  const data = (doc.data() as PartnerMetricsRecord | undefined) ?? {};
  const updatedAt = data.updated_at?.toDate?.()?.toISOString();

  return {
    id: doc.id,
    name: typeof data.name === "string" && data.name.trim().length ? data.name : "Unknown Partner",
    active_users: parseNumber(data.active_users),
    monthly_revenue: parseNumber(data.monthly_revenue),
    ...(updatedAt ? { updatedAt } : {})
  };
};

export const withinUpdatedSince = (
  record: PartnerMetricsResponse,
  updatedSince: Date | null
): boolean => {
  if (!updatedSince) {
    return true;
  }

  if (!record.updatedAt) {
    return false;
  }

  const updatedAt = new Date(record.updatedAt);
  return !Number.isNaN(updatedAt.getTime()) && updatedAt >= updatedSince;
};
