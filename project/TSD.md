# Technical Specification Document (TSD)

**Product:** WellNexus Commerce OS — v3.2 DeepIDX
**Date:** 2025-10-25
**Owner:** WellNexus Studio / Engineering
**Status:** Draft v1.0

---

## 1) Scope & Objectives

### 1.1 Modules in Scope (v1)

* **Onboarding 30 ngày**: hành trình 6 mốc (Day 1,3,7,14,21,30) với artefacts (KYC, quiz, ref code, sale digest, ad review record, evidence manifest).
* **Affiliate Quote & Settle**: `/api/affiliate/quote` (dry-run) và `/api/affiliate/settle` (idempotent + 2-eyes), áp dụng **caps 22%**, **depth ≤ 3**, **cash chỉ direct & 1-hop**; credits cho level 2-3.
* **Ad Review & Compliance**: nộp asset, auto checks (keyword blacklist, citation presence, OCR match), human review, attest, publish/deny; claim policy (allowed/forbidden/disclaimer).
* **Evidence Layer**: hash chain + Merkle, signing (JWKS; Ed25519/ES256), SRI JSON, verify API & public feeds.
* **Channel Conflict Guard**: enforce giá/sku Official Store, auto-attribute referral nếu có ref code; hành động warn/auto-attribute/freeze.

### 1.2 Business Goals & KPI/SLO

* **NPP active (90d)**: ≥ **200**.
* **Retail ratio**: ≥ **0.5** (ND40/2018 định hướng bán lẻ thật).
* **Affiliate quote p95**: ≤ **150 ms**; **settle p99**: ≤ **600 ms**.
* **Ad review TAT p50**: ≤ **60 phút**.
* **Error rate**: < **1%** (4xx tách riêng).
* **SLA platform**: 99.9% (FOREST giai đoạn).
* **Transparency**: Status Page + public verify endpoints.

---

## 2) Architecture & Constraints

### 2.1 Platform & Runtime

* **Firebase Studio IDX-first**: Hosting, Functions **Node ≥ 20**, Firestore, Schedulers; Region: `asia-southeast1`.
* **HTTP Functions**: timeouts/memory theo profile; concurrency 100 (baseline), rate limit theo endpoint.
* **Hosting rewrites**: map 7 endpoints `/api/...` đến Functions.

### 2.2 Security, Compliance, Guardrails

* **Deny-by-default**: Rules least-privilege; server-only writes với `commissions/evidence`.
* **Two-eyes**: bắt buộc cho `promote_to_prod`, `payout_execute/affiliate_settle_execute`, `publish_artifact`.
* **Idempotency**: header `Idempotency-Key` (TTL 24h; collection `idempotency_keys`).
* **Geo-fence**: deny restricted jurisdictions.
* **Privacy**: PII minimization; logs không chứa dữ liệu nhạy cảm.
* **Regulatory mapping**: ND40/2018 core: `product_sales_ratio_min=0.5`, `recruitment_fee_share_max=0.0`; Quảng cáo: cấm claim y khoa quá mức; bắt buộc disclaimer/citation.

### 2.3 Observability

* **Logs**: structured (`reqId, actor, path, latency_ms, result, idempotency_key`).
* **Metrics**: histograms `latency_ms`; counters `5xx,4xx,settle_ok`; gauges `queue_depth, dlq_depth`.
* **Tracing**: W3C Trace Context; join với partner khi khả dụng.

---

## 3) Prioritized Use Cases (Cockburn style)

> Mỗi UC nêu: Actors · Preconditions · Trigger · Main Flow · Alternate/Exceptions · NFR/SLA · Data/Artifacts.

### UC1 — Record Onboarding Step

* **Actors**: NPP (user), System.
* **Pre**: Auth OK; profile tồn tại.
* **Trigger**: User hoàn thành step.
* **Main**: `POST /api/onboarding/step` → validate → persist `onboarding_step_record` → trả next CTA.
* **Alt/Ex**: step out-of-order → 409; thiếu artefact → 422.
* **SLA**: p95 ≤ 150 ms; err < 1%.
* **Artifacts**: step record; optional evidence.

### UC2 — Affiliate Quote (Dry-Run)

* **Actors**: Shopper/NPP, System.
* **Pre**: cart_total_vnd>0; ref code optional.
* **Main**: `POST /api/affiliate/quote` → compute direct 10% + conditional bonuses (KhoiNghiep 21% nếu đủ điều kiện) → cap 22% → trả breakdown.
* **Alt/Ex**: retail_ratio < 0.5 → flag & warn; geo-fence → 403.
* **SLA**: p95 ≤ 150 ms.
* **Artifacts**: quote response.

### UC3 — Affiliate Settle (Idempotent + Two-Eyes)

* **Actors**: Service (checkout), Approver (2-eyes), System.
* **Pre**: sale_id hợp lệ; header `Idempotency-Key` + `X-Two-Eyes-Token`.
* **Main**: `POST /api/affiliate/settle` → verify 2-eyes → compute commissions with caps/depth/retail ratio → persist `commissions` (server-only) → sign manifest → return `commission_id, manifest_root`.
* **Alt/Ex**: missing idempotency → 400 (E1001); duplicate → 200 same-body (E1002); retail_ratio breach → 409 (E3001); geo-fence → 403 (E2001).
* **SLA**: p99 ≤ 600 ms; DLQ fallback on transient.
* **Artifacts**: commission record + signed manifest.

### UC4 — Submit Ad for Review

* **Actors**: NPP, Reviewer, System.
* **Pre**: Auth OK; asset uploaded.
* **Main**: `POST /api/ad/submit` → auto checks (blacklist/citation/OCR) → enqueue human review → status `pending`.
* **Alt/Ex**: forbidden claims → `deny`; requires disclaimer → `needs_disclaimer`.
* **SLA**: TAT p50 ≤ 60 phút.
* **Artifacts**: ad record, auto-check logs.

### UC5 — Get Ad Status

* **Actors**: NPP, Reviewer, System.
* **Main**: `GET /api/ad/status?ad_id=` → trả `verdict + audit trail`.
* **SLA**: p95 ≤ 120 ms.

### UC6 — Evidence Anchor

* **Actors**: Service, Auditor.
* **Pre**: payload digest sẵn; policy version pinned.
* **Main**: `POST /api/evidence/anchor` → hash→merkle→sign (JWKS) → store `evidence` → return badge URL.
* **Alt/Ex**: signing error → E5001.
* **SLA**: p95 ≤ 300 ms.

### UC7 — Evidence Verify

* **Actors**: Public verifier.
* **Main**: `GET /api/evidence/verify?root=` → verify sig/SRI → trả `{verified, txHash?, CID?, badgeURL}`.
* **SLA**: p95 ≤ 120 ms.

### UC8 — Channel Guard Auto-Attribute

* **Actors**: Checkout, Channel Guard, System.
* **Main**: detect `ref_code` + Official Store policy → auto-attribute commission; if rule conflict → `freeze_campaign`.
* **SLA**: online path không tăng p95 > 10 ms.

---

## 4) Data Model & APIs

### 4.1 Firestore Schemas (core fields)

* **npp_profiles**: `user_id, kyc_status, tier, join_ts, ref_code`
* **sales**: `sale_id, buyer_id, seller_id, sku, qty, gross, vat, net, channel, ref_code, ts, inputs_hash`
* **commissions**: `commission_id, sale_id, recipient_id, tier, pct, amount, calc_manifest_root, signer, status, ts`
* **ad_reviews**: `ad_id, owner_id, claim_type, evidence_links, verdict, reviewer, ts, hash`
* **evidence**: `id, type, dataset_digest, calc_params, result_hash, cid, root, signature, ts`
* **risk_events**: `id, type, metric, threshold, action, actor, ts`
* **idempotency_keys**: `key, at, ttl`

### 4.2 Indexes (required)

* sales: `(seller_id, ts desc)`
* commissions: `(recipient_id, ts desc)`
* ad_reviews: `(owner_id, ts desc)`

### 4.3 API Endpoints & Contracts (summary)

* **POST /api/onboarding/step** → body: `{user_id, step, artefact?}` → `{next_cta}`
* **POST /api/affiliate/quote** → `{cart_total_vnd, ref_code?, rank}` → `{direct_vnd, bonuses_vnd, cap_applied, total_vnd}`
* **POST /api/affiliate/settle** ↔ headers: `Idempotency-Key, X-Two-Eyes-Token` → `{sale_id}` → `{commission_id, manifest_root, status}`
* **POST /api/ad/submit** → `{ad_id, assets[], claims[], citations[]}` → `{status}`
* **GET  /api/ad/status?ad_id=...`** → `{verdict, audit}`
* **POST /api/evidence/anchor** → `{type, dataset_digest, calc_params, result_hash}` → `{root, signature, badgeURL}`
* **GET  /api/evidence/verify?root=...`** → `{verified, badgeURL, txHash?, CID?}`

---

## 5) Integrations & External Interfaces

* **JWKS keypair** (Secrets: `JWKS_PRIVATE`, `JWKS_PUBLIC`) cho signing Ed25519/ES256; rotate mỗi 90 ngày.
* **Reviewer Webhook** (`REVIEWER_WEBHOOK_URL`) cho handoff review; HMAC optional.
* **On-chain**: mặc định **tắt** (can enable via config).
* **Headers**: `Idempotency-Key`, `X-Two-Eyes-Token`.

---

## 6) SLOs, Telemetry & Dashboards

* **SLO**: affiliate_settle p99 ≤ 600 ms; ad_review p99 ≤ 1200 ms; error_rate < 1%.
* **Burn-rate alerts**: retail_ratio_breach, error_burst, payout_queue_backlog.
* **Dashboards**: Affiliate SLO, Ad Review Flow, Evidence Verify.

---

## 7) Security & Threat Model

* **Actors xấu**: malicious_affiliate, compromised_admin, scraper, rate_abuser.
* **Attack surface**: `/api/affiliate/settle`, `/api/ad/submit`, `/api/evidence/anchor`.
* **Controls**: HMAC (optional), idempotency + replay window 24h, RBAC least-privilege, geo-fence deny, rate limit + circuit breaker.
* **Resilience**: exponential backoff + jitter; DLQ; canary.

---

## 8) Release & Operations

* **Environments**: staging → canary (10%, ≥30') → prod.
* **CI/CD checks**: lint, build, unit, smoke, rules-compile.
* **Promotion gates**: `2-eyes`, `evidence_signed`, `budget_guard_ok`, `cooldown_ok` (≥30').
* **Rollback**: auto if `p95>budget` ∨ `5xx>threshold` ∨ `DLQ_backlog>limit`.

---

## 9) Test Strategy

* **Unit**: payout math; caps; depth; retail_ratio guard; evidence signing.
* **Smoke**: `/quote`, `/settle`, `/evidence/verify` happy paths.
* **Newman**: idempotency (201 → 200 same body), ad forbidden claims, badge verify.
* **Performance**: load for `/quote` 120 rpm; `/settle` 60 rpm; validate latencies.
* **Security**: negative tests (missing headers, geo-fence, two-eyes invalid).

---

## 10) Acceptance Criteria / Definition of Done (DoD)

* **Config**: Secrets mounted; JWKS present; env set to `asia-southeast1`.
* **Security**: Firestore Rules deployed (least-privilege); 2-eyes wired; rate limits active.
* **Quality**: Unit+Smoke green; Newman suites green; rules compile OK.
* **Evidence**: manifests signed; public verify live; status page updated.
* **Ops**: dashboards online; alerts wired; runbook rollback.

---

## 11) Risks & Mitigations

* **R1**: Retail ratio guard gây từ chối settle hợp lệ biên → "review window" + override audit 2-eyes.
* **R2**: Drift marketing → burn-rate alerts + channel guard freeze.
* **R3**: Key rotation lỗi → dual-key overlap + staged rotate + self-verify.
* **R4**: DLQ backlog → scheduled auto-retry + circuit-breaker payout.

---

## 12) Roadmap & Timeline (v1 → 7 ngày)

1. **D1–2**: Scaffolding Functions + Hosting rewrites + Secrets mount.
2. **D2–3**: `/quote` + unit/perf tests; Dashboard baseline.
3. **D3–4**: `/settle` idempotent + 2-eyes; Newman idempotency.
4. **D4–5**: Ad Review submit/status + auto checks.
5. **D5–6**: Evidence anchor/verify + badge; public feeds.
6. **D7**: Canary 10% (≥30'); evaluate SLO; promote or rollback.

---

## 13) Open Questions

* On-chain anchor cần bật ngay v1 hay staging? (mặc định tắt)
* HMAC bắt buộc cho reviewer webhook hay optional? (mặc định optional)
* Mức threshold DLQ_backlog để tự rollback? (đề xuất: > 200 events/15')

---

## 14) Fully-Dressed Use Case Template (Cockburn)

**Template fields**: Goal · Scope · Level · Primary Actor · Stakeholders & Interests · Preconditions · Minimal Guarantees · Success Guarantees · Trigger · Main Success Scenario · Extensions (Alt/Exceptions) · Special Rules/Policies · Non-Functional Reqs (SLA/SLO) · Open Issues.

**Example — UC3: Affiliate Settle (Idempotent + Two-Eyes)**

* **Goal**: Tính và ghi nhận hoa hồng cho một đơn hàng, sinh manifest chữ ký để kiểm toán.
* **Scope/Level**: System / User-goal.
* **Primary Actor**: Checkout Service. **Supporting**: Approver (2-eyes), Payout Engine, Evidence Signer.
* **Stakeholders & Interests**: Finance (đúng + cap 22%), Compliance (ND40, retail ratio≥0.5), NPP (minh bạch), Security (idempotent, chống replay).
* **Preconditions**: Sale tồn tại; profile hợp lệ; headers: `Idempotency-Key`, `X-Two-Eyes-Token`.
* **Minimal Guarantees**: Không ghi trùng; log structured + trace id; nếu thất bại, không side-effects.
* **Success Guarantees**: Commission ghi đúng; manifest ký số lưu `evidence`; trả `commission_id`, `manifest_root`.
* **Trigger**: Checkout gọi `/api/affiliate/settle`.
* **Main Success Scenario**: (1) Validate headers & tokens → (2) Load sale & compute payouts (caps/depth/retail ratio) → (3) Write `commissions` (server-only) atomically → (4) Build Merkle, sign JWKS → (5) Persist `evidence` → (6) Return 201 with body & cache `Idempotency-Key`.
* **Extensions**: E1001 thiếu idempotency → 400; E1002 duplicate → 200 same-body; E3001 retail_ratio<0.5 → 409; E2001 geo-fence → 403; E5001 signing fail → 500 + DLQ.
* **Policies/Rules**: depth≤3; cash=direct+1hop; credits cho deep levels; withholding_tax auto.
* **NFR/SLA**: p99≤600ms; error<1%; durability≥11 9s (Firestore).
* **Open Issues**: bật on-chain anchor khi nào; ngưỡng rollback DLQ.

---

## 15) Sequence Diagrams (ASCII)

**UC3 — Affiliate Settle**

```
Client → API /settle: POST {sale_id}, Idempotency-Key, X-Two-Eyes-Token
API → Authz: validate two-eyes token
API → Store: GET sale, GET/PUT idempotency
API → PayoutEngine: compute(caps, depth, retail_ratio)
API → Store: WRITE commissions (server-only)
API → Signer: sign(manifest) → manifest_root
API → Store: WRITE evidence(manifest_root, sig)
API → Client: 201 {commission_id, manifest_root}
```

**UC4 — Ad Review**

```
NPP → API /ad/submit: POST asset, claims, citations
API → AutoChecks: blacklist, citation, OCR
AutoChecks → Queue: enqueue human review
Reviewer → System: verdict (approve/deny/needs_disclaimer)
System → Store: WRITE ad_reviews + audit trail
NPP → API /ad/status?ad_id=
API → NPP: status + audit trail
```

---

## 16) Policy-as-Code (JSON) — Snapshot

```json
{
  "legal": {
    "nd40_core": {
      "product_sales_ratio_min": 0.5,
      "recruitment_fee_share_max": 0.0,
      "ad_claims_review_required": true
    }
  },
  "affiliate": {
    "caps": {"total_commission_cap_pct": 0.22, "depth_limit": 3, "retail_ratio_guard_min": 0.5},
    "tiers": [
      {"name": "DirectAffiliate", "payout_pct": 0.10},
      {"name": "KhoiNghiep", "criteria": {"personal_revenue_min_vnd": 6000000}, "payout_pct": 0.21}
    ],
    "cross_level": {"same_level_share_pct": 0.02, "province_deal_bounty_pct": 0.01},
    "manager_upline_pct": {"Silver": 0.15, "Gold": 0.18, "Diamond": 0.20},
    "payout_modes": {"cash": "direct_and_1hop", "credits": "levels_2_to_3"},
    "clawback_window_days": 45,
    "withholding_tax": "auto_deduct_personal_income_tax"
  },
  "channel": {
    "official_store": {
      "price_policy": "online_price >= npp_price * 1.0",
      "sku_policy": ["bundle", "special"],
      "referral_recognition": "commission_if_customer_uses_ref_code"
    }
  }
}
```

---

## 17) Firestore Security Rules — Core Snippet

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    function isOwnerOrAdmin(uid) {
      return request.auth != null && (request.auth.uid == uid || request.auth.token.admin == true);
    }
    match /commissions/{id} { allow read: if isOwnerOrAdmin(resource.data.recipient_id); allow write: if false; }
    match /evidence/{id}    { allow read: if true; allow write: if false; }
    match /sales/{id}       { allow create: if request.auth != null; allow read: if isOwnerOrAdmin(resource.data.seller_id); allow update, delete: if false; }
    match /ad_reviews/{id}  { allow create: if request.auth != null; allow read: if isOwnerOrAdmin(resource.data.owner_id); allow update: if request.auth.token.reviewer == true; allow delete: if false; }
    match /idempotency_keys/{key} { allow read, write: if request.auth.token.service == true; }
  }
}
```

---

## 18) API Examples (cURL)

**Settle (Idempotent + Two-Eyes)**

```bash
curl -X POST https://<host>/api/affiliate/settle \n  -H 'Content-Type: application/json' \n  -H 'Idempotency-Key: 3f6d7b3e-9b9a-4b6a-8a1e-92b...' \n  -H 'X-Two-Eyes-Token: eyJhbGciOi...' \n  -d '{"sale_id":"S-2025-10-25-001"}'
```

**Quote (Dry-run)**

```bash
curl -X POST https://<host>/api/affiliate/quote -d '{"cart_total_vnd": 1250000, "ref_code":"REF-7XY", "rank":"DirectAffiliate"}'
```

**Evidence Verify**

```bash
curl https://<host>/api/evidence/verify?root=0xabc123...
```

---

## 19) Newman/Postman Collection — Skeleton

```json
{
  "info": {"name": "WellNexus v1", "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"},
  "item": [
    {"name": "Affiliate — Settle Idempotency", "request": {"method": "POST", "header": [{"key":"Idempotency-Key","value":"{{$guid}}"},{"key":"X-Two-Eyes-Token","value":"{{TWO_EYES}}"}], "url": "{{HOST}}/api/affiliate/settle", "body": {"mode":"raw","raw": "{\n  \\"sale_id\\": \\"S-001\\"\n}"}}, "event": [{"listen":"test","script":{"exec":["pm.test('201 or 200', ()=> pm.expect([200,201]).to.include(pm.response.code));","pm.test('manifest_root present', ()=> pm.expect(pm.response.json()).to.have.property('manifest_root'));"]}}]},
    {"name": "Ad — Forbidden Claims", "request": {"method":"POST","url":"{{HOST}}/api/ad/submit"}}
  ]
}
```

---

## 20) Performance Non-Regression Plan

* **Targets**: `/quote` p95≤150ms @120 rpm; `/settle` p99≤600ms @60 rpm.
* **Data**: warm cache vs cold start; payload sizes realistic.
* **K6 Snippet**

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';
export let options = { scenarios: { quote: { executor: 'constant-arrival-rate', rate: 120, timeUnit: '1m', duration: '5m', preAllocatedVUs: 20 }}};
export default function() {
  const res = http.post(`${__ENV.HOST}/api/affiliate/quote`, JSON.stringify({cart_total_vnd: 1000000, rank: 'DirectAffiliate'}), { headers: {'Content-Type':'application/json'}});
  check(res, { 'p95<150': (r)=> r.timings.duration < 150 });
  sleep(0.5);
}
```

---

## 21) Observability Spec

* **Metric names**: `http_latency_ms{path="/api/affiliate/settle"}`, `http_errors_total{code}`, `payout_settle_ok_total`, `dlq_depth`.
* **SLO math**: Error budget = 1% * period; Burn-rate alerts at 2× and 4× over 1h/6h.
* **Log fields**: `reqId, traceId, actor, path, latency_ms, result, idem_key`.
* **Dashboards**: panels cho latency histograms, error counters, queue gauges, %cap-applied.

---

## 22) Threat Model — STRIDE per Endpoint

| Endpoint          | S         | T            | R             | I               | D             | E     | Controls                                          |
| ----------------- | --------- | ------------ | ------------- | --------------- | ------------- | ----- | ------------------------------------------------- |
| /affiliate/settle | JWT theft | Token replay | Rule bypass   | Data tamper     | Repudiation   | DoS   | Idempotency, 2-eyes, rate-limit, audit hash chain |
| /ad/submit        | XSS asset | Phishing     | OCR bypass    | Metadata tamper | Claim dispute | Flood | Keyword blacklist, reviewer role, size caps       |
| /evidence/anchor  | Key leak  | Sig forgery  | Merkle bypass | Root tamper     | Non-repudiate | Burst | JWKS rotate, HSM/Secrets, DLQ                     |

---

## 23) CI/CD Pipeline (GitHub Actions) — Skeleton

```yaml
name: ci
on: [push]
jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci && npm run lint && npm run test
      - run: npm run rules:compile && npm run newman
  deploy-staging:
    needs: build-test
    steps:
      - run: firebase deploy --only hosting,functions --project wellnexus-dev --token ${{ secrets.FIREBASE_TOKEN }}
  promote-prod:
    if: ${{ github.event.inputs.two_eyes_token }}
    steps:
      - run: ./scripts/promote.sh --two-eyes ${{ github.event.inputs.two_eyes_token }}
```

---

## 24) Rollback & Incident Runbook

1. Freeze writes to `/settle` via feature-flag. 2) Rollback `functions@prev_green`. 3) Drain DLQ with backoff. 4) Verify dashboards and error-rate<1%. 5) Postmortem ADR.

---

## 25) Evidence Manifest — Schema & Verify (pseudo)

```json
{
  "id":"EV-...",
  "type":"commission_calc_proof",
  "dataset_digest":"sha256-...",
  "calc_params": {"caps":0.22,"depth":3},
  "result_hash":"sha256-...",
  "root":"0x...",
  "signature":"ed25519:...",
  "signer":"kid-2025-10",
  "ts": 1761360000
}
```

**Verify**: recompute root → verify signature (JWKS) → match result_hash → serve badge.

---

## 26) Data Retention & Privacy

* **Retention**: evidence 730d; components 365d; idempotency 24h; logs 90d.
* **PII minimization**: hash emails; redact tokens in logs; purpose limitation.

---

## 27) Test Fixtures

* **Sales**: S-001..S-010 với net {1e6..5e6}. **Profiles**: tiers đa dạng. **Ads**: mẫu claim hợp lệ và bị cấm.

---

## 28) RACI

* **Responsible**: Eng Lead; **Accountable**: CTO; **Consulted**: Legal/Compliance; **Informed**: Ops/Finance.

---

## 29) Budget Guard (Cost Model)

* **Formula**: cost ~= CF_invoc * price + egress + Firestore RWU. Alert nếu COGS/GM vượt ngưỡng ADR.

---

## 30) Glossary & ADR Template

* **Glossary**: NPP, Retail Ratio, Two-eyes, Idempotency, Evidence, DLQ.
* **ADR-lite**: id · date · decision · context · consequences · guards.

---

## CHANGE LOG 📝

* **v1.1 (2025-10-25)**: Bổ sung 17 mục nâng cấp để đạt chuẩn 10/10: UC fully-dressed, sequence ASCII, policy-as-code JSON, Firestore Rules snippet, API cURL, Newman skeleton, perf plan (K6), observability spec, STRIDE, CI/CD skeleton, rollback runbook, evidence schema+verify, retention/privacy, fixtures, RACI, budget guard, glossary+ADR.
* **v1.0 (2025-10-25)**: Khởi tạo TSD bám ZEN THINKING v3.2-DeepIDX; đóng gói phạm vi v1 (Onboarding, Quote/Settle, Ad Review, Evidence, Channel Guard), SLO/guardrails, CI/CD & DoD, test & rủi ro.
