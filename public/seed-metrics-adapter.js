/*
 * seed-metrics-adapter.js
 * ------------------------------------------------------------
 * Adapter đọc số liệu thật từ Firebase (Firestore / HTTPS Callable Functions)
 * và ánh xạ (map) vào cấu trúc metrics mà UI đang dùng (ví dụ: sample.metrics).
 *
 * Thiết kế theo nguyên tắc:
 *  - Không phụ thuộc cứng vào nơi lưu trữ: có thể lấy từ Cloud Functions hoặc Firestore.
 *  - Mapping linh hoạt qua config: destKey -> path | [path, transformFn] | (raw)=>any
 *  - Có cache TTL để giảm tải đọc.
 *  - Hỗ trợ subscribe realtime (Firestore) bên cạnh fetch-one-shot.
 *  - Không chứa bí mật. Firebase App/Instances nên được inject từ bên ngoài.
 *
 * YÊU CẦU: Firebase SDK v9+ (modular). Bạn có thể truyền {app, db, functions}
 * đã khởi tạo vào constructor. Nếu không truyền, adapter sẽ cố gắng import động
 * các module cần thiết. Không tự khởi tạo Firebase App (tránh lộ config).
 *
 * Ví dụ dùng (xem thêm ở cuối file trong phần USAGE):
 *   const adapter = new SeedMetricsAdapter({ db, functions });
 *   const metrics = await adapter.getOnce('functions', mapping);
 *   const unsubscribe = adapter.subscribe({ mapping, onData, onError });
 */

/* eslint-disable no-console */

// ------------------------------------------------------------
// Utilities
// ------------------------------------------------------------
const isFn = (v) => typeof v === 'function';
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

/**
 * Lấy giá trị lồng nhau theo path kiểu 'a.b.c'. Nếu không có trả về undefined.
 */
function getByPath(obj, path) {
  if (!obj || !path) return undefined;
  const parts = path.split('.');
  let cur = obj;
  for (const p of parts) {
    if (!isObj(cur) && !Array.isArray(cur)) return undefined;
    cur = cur?.[p];
    if (cur === undefined) return undefined;
  }
  return cur;
}

/**
 * Chuẩn hoá số: parseFloat và loại NaN => 0.
 */
function toNumber(v) {
  const n = typeof v === 'number' ? v : parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

// ------------------------------------------------------------
// Default mapping (có thể thay đổi tuỳ dự án UI)
// ------------------------------------------------------------
export const defaultMapping = {
  totalSales: 'kpis.revenue.total',
  ordersToday: 'kpis.orders.today',
  activeDistributors: 'kpis.distributors.active',
  churnRate: ['kpis.rates.churn', (v) => toNumber(v)],
  mrr: ['kpis.revenue.mrr', (v) => toNumber(v)],
  arr: ['kpis.revenue.arr', (v) => toNumber(v)],
  conversionRate: ['kpis.rates.conversion', (v) => toNumber(v)],
  retention90d: ['kpis.rates.retention90d', (v) => toNumber(v)],
  repeatRate: ['kpis.rates.repeat', (v) => toNumber(v)],
  nps: ['kpis.nps', (v) => toNumber(v)],
  updatedAt: (raw) => raw?.updatedAt ?? null,
};

// ------------------------------------------------------------
// Core Adapter
// ------------------------------------------------------------
export class SeedMetricsAdapter {
  constructor(options = {}) {
    const {
      app,
      db,
      functions,
      callableName = 'getMetricsSummary',
      collectionPath = 'metrics',
      docId = 'global',
      cacheTtlMs = 30_000,
      logger,
    } = options;

    this._app = app || null;
    this._db = db || null;
    this._functions = functions || null;

    this._callableName = callableName;
    this._collectionPath = collectionPath;
    this._docId = docId;
    this._cacheTtlMs = cacheTtlMs;
    this._logger = logger || ((msg, extra) => (extra ? console.debug(msg, extra) : console.debug(msg)));

    this._cache = { data: null, ts: 0 };
    this._unsub = null;
  }

  async getOnce(source = 'functions', mapping = defaultMapping, opts = {}) {
    const now = Date.now();
    const useCache = !opts.force && now - this._cache.ts < this._cacheTtlMs && this._cache.data;
    if (useCache) {
      this._log('return cache');
      return this._applyMapping(this._cache.data, mapping);
    }

    let raw;
    if (source === 'functions') {
      raw = await this._fetchFromFunctions();
    } else if (source === 'firestore') {
      raw = await this._fetchFromFirestore();
    } else {
      throw new Error(`Unknown source: ${source}`);
    }

    this._cache = { data: raw, ts: Date.now() };
    return this._applyMapping(raw, mapping);
  }

  subscribe({ mapping = defaultMapping, onData, onError } = {}) {
    if (!isFn(onData)) throw new Error('onData callback is required');
    this._ensureFirestoreReady(true)
      .then(({ onSnapshot, doc }) => {
        if (this._unsub) this._unsub();
        this._unsub = onSnapshot(doc(this._db, this._collectionPath, this._docId), (snapshot) => {
          const raw = snapshot.exists() ? snapshot.data() : {};
          this._cache = { data: raw, ts: Date.now() };
          const mapped = this._applyMapping(raw, mapping);
          onData(mapped, raw);
        }, (err) => {
          this._log('onSnapshot error', err);
          onError?.(err);
        });
      })
      .catch((err) => {
        this._log('subscribe() init error', err);
        onError?.(err);
      });

    return () => {
      if (this._unsub) this._unsub();
      this._unsub = null;
    };
  }

  _log(msg, extra) {
    try { this._logger?.(`[SeedMetricsAdapter] ${msg}`, extra); } catch (_) {}
  }

  async _fetchFromFunctions() {
    const { httpsCallable } = await this._ensureFunctionsReady();
    try {
      const callable = httpsCallable(this._functions, this._callableName);
      const res = await callable({ scope: 'global' });
      const raw = res?.data ?? {};
      this._log('functions ok');
      return raw;
    } catch (err) {
      this._log('functions error, fallback firestore', err);
      return this._fetchFromFirestore();
    }
  }

  async _fetchFromFirestore() {
    const { getDoc, doc, serverTimestamp } = await this._ensureFirestoreReady();
    try {
      const ref = doc(this._db, this._collectionPath, this._docId);
      const snap = await getDoc(ref);
      const raw = snap.exists() ? snap.data() : {};
      if (!raw.updatedAt) raw.updatedAt = serverTimestamp?.() ?? new Date().toISOString();
      this._log('firestore ok');
      return raw;
    } catch (err) {
      this._log('firestore error', err);
      return {};
    }
  }

  _applyMapping(raw, mapping) {
    const out = {};
    for (const [destKey, rule] of Object.entries(mapping || {})) {
      try {
        if (typeof rule === 'string') {
          out[destKey] = getByPath(raw, rule);
        } else if (Array.isArray(rule)) {
          const [path, transform] = rule;
          const v = getByPath(raw, path);
          out[destKey] = isFn(transform) ? transform(v, raw) : v;
        } else if (isFn(rule)) {
          out[destKey] = rule(raw);
        } else {
          out[destKey] = undefined;
        }
      } catch (e) {
        this._log(`map error @${destKey}`, e);
        out[destKey] = undefined;
      }
    }
    return out;
  }

  async _ensureFunctionsReady() {
    if (this._functions) return this._importFunctionsHelpers();
    await this._ensureAppReady();
    const { getFunctions } = await this._dynamicImport('firebase/functions');
    this._functions = getFunctions(this._app, undefined);
    return this._importFunctionsHelpers();
  }

  async _ensureFirestoreReady(returnHelpersOnly = false) {
    if (!this._db) {
      await this._ensureAppReady();
      const { getFirestore } = await this._dynamicImport('firebase/firestore');
      this._db = getFirestore(this._app);
    }
    return this._importFirestoreHelpers();
  }

  async _ensureAppReady() {
    if (this._app) return;
    const { getApps, getApp } = await this._dynamicImport('firebase/app');
    const apps = getApps();
    if (apps.length) {
      this._app = getApp();
    } else {
      throw new Error('Firebase App not found. Please initialize and inject {app} into SeedMetricsAdapter.');
    }
  }

  async _importFunctionsHelpers() {
    return import('firebase/functions');
  }

  async _importFirestoreHelpers() {
    return import('firebase/firestore');
  }

  async _dynamicImport(spec) {
    try {
      return await import(spec);
    } catch (e) {
      this._log(`dynamic import failed: ${spec}`);
      throw e;
    }
  }
}
