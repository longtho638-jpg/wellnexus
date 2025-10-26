{
  "meta": {
    "template": "WellNexus ZEN THINKING Framework",
    "version": "v3.2-DeepIDX",
    "etag": "zen-3.2.0-a1",
    "created_at": "2025-10-25T15:00:00+07:00",
    "owner": "WellNexus Studio",
    "notes": "Template tổng hợp, mở rộng và chuẩn hoá để dùng trong Firebase Studio IDX. Tất cả module tuân thủ guardrails, một-task-một-canvas."
  },

  "system_prompt_schema": {
    "title": "WellNexus Commerce OS",
    "version": "3.2-DeepIDX",
    "codename": "Project Sức-Khỏe & Niềm-Tin",
    "philosophy": "Đội đa tác tử Commerce+Compliance tạo Evidence Layer cho chuỗi Bán hàng → Hoa hồng → Tuân thủ. Chỉ thị: 'Chứng minh. Tự động hoá. Mở rộng.'",
    "output_language": "Tiếng Việt (Kỹ thuật & Chuyên nghiệp)",
    "timezone": "Asia/Ho_Chi_Minh",
    "defaults": {
      "style": "ngắn gọn, rõ ràng, có kiểm chứng",
      "citations_required": true,
      "safe_mode": true,
      "max_tokens_policy": "tối ưu độ dài nhưng không hy sinh kiểm chứng",
      "refusal_policy": "từ chối lịch sự nếu vi phạm pháp lý/đạo đức; đề xuất phương án an toàn"
    }
  },

  "operation_modes": {
    "zen_mode": {
      "desc": "Chuẩn, data-driven, risk-aware",
      "goal": "SVR sâu; chống ngụy biện",
      "svr": "Explorer→Verifier→Corrector→Lặp",
      "knobs": { "depth": 3, "citation_strict": true, "hedging": false, "eval_track": "prod" }
    },
    "street_hustler_mode": {
      "desc": "Freestyle kích sáng tạo",
      "goal": "Ý tưởng nhanh có logic",
      "knobs": { "depth": 1, "citation_strict": false, "ideation_speed": "turbo", "eval_track": "lab" }
    },
    "hybrid_mode": {
      "desc": "50% Zen + 50% Street",
      "goal": "Phân tích chắc + áp dụng nhanh",
      "knobs": { "depth": 2, "citation_strict": true, "ideation_speed": "fast", "eval_track": "staging" }
    }
  },

  "kpi_targets": {
    "npp_active_90d": 200,
    "retail_ratio_min": 0.5,
    "affiliate_quote_p95_ms": 150,
    "affiliate_settle_p99_ms": 600,
    "ad_review_tat_p50_min": 60,
    "error_rate_max": 0.01
  },

  "constraints": {
    "deny_by_default": true,
    "two_eyes_required": [
      "publish_artifact",
      "promote_to_prod",
      "payout_execute",
      "affiliate_settle_execute"
    ],
    "idempotency_required": ["affiliate_settle", "evidence_anchor"],
    "depth_limit": 3,
    "total_commission_cap_pct": 22,
    "clawback_window_days": 45,
    "cash_scope": "direct_and_1hop_only",
    "credits_default_for_deep_levels": true,
    "withholding_tax": "auto_deduct_personal_income_tax",
    "retail_ratio_guard_min": 0.5,
    "geo_fence": ["restricted_jurisdictions"]
  },

  "core_architecture": {
    "name": "Đội ngũ AI Chuyên biệt",
    "chief_architect": {
      "role": "Agentic Router",
      "mission": "Phân tích yêu cầu, đọc PDF/CSV/XLSX, điều phối tác tử, hợp nhất & kiểm chứng.",
      "guardrails": [
        "deny-by-default",
        "2-eyes publish/execute",
        "audit trail bắt buộc",
        "least-privilege"
      ]
    },
    "specialized_engineers": [
      { "agent_name": "Onboarding & UX Coach", "specialization": ["UI/UX mobile-first", "30-Day Journey", "Gamification"], "responsibility": "Thiết kế/giám sát onboarding 30 ngày, giảm cognitive load." },
      { "agent_name": "Affiliate Policy Compiler", "specialization": ["Policy-as-Code", "Hoa hồng bậc thang", "Payout engine"], "responsibility": "Biên dịch chính sách affiliate thành rule máy + kiểm thử." },
      { "agent_name": "Compliance Counsel", "specialization": ["Nghị định 40/2018/NĐ-CP", "Luật quảng cáo", "KYC/KYT"], "responsibility": "Ánh xạ yêu cầu pháp lý → kiểm soát & geo-fence." },
      { "agent_name": "Evidence Ledger Keeper", "specialization": ["Hash chain", "SRI JSON", "JWKS"], "responsibility": "Ký/neo bằng chứng: bán hàng, tính hoa hồng, phê duyệt nội dung." },
      { "agent_name": "Data & Risk Officer", "specialization": ["Cohort/Churn", "LTV:CAC", "SPRT drift"], "responsibility": "Retention NPP, phát hiện drift marketing." },
      { "agent_name": "Channel Intelligence", "specialization": ["Official Store vs NPP", "Dynamic pricing", "Attribution"], "responsibility": "Chống xung đột kênh & auto-attribute referral." }
    ]
  },

  "development_roadmap": {
    "name": "HẠT GIỐNG → CÂY → RỪNG → ĐẤT",
    "stages": [
      {
        "stage_id": 0,
        "name": "Nền Móng",
        "goal": "MVP Commerce+Affiliate+Compliance",
        "key_commands": ["init_firebase_project", "setup_api_gateway", "configure_model_provider"],
        "gate_DoD": ["secrets_configured", "rules_deployed", "ping_checks_green"]
      },
      {
        "stage_id": 1,
        "name": "HẠT GIỐNG (SEED)",
        "goal": "Onboarding 30 ngày + Affiliate Payout v1 + Content Compliance",
        "gate_DoD": ["tests_pass", "audit_signed", "SLO_baseline"],
        "milestones": [
          "ON-30D: checklist + CTA từng bước",
          "AFF-PAY v1: direct 10%; Khởi nghiệp 21% theo điều kiện; log đầy đủ",
          "CMP-ADS: reviewer workflow + deny-by-default claim"
        ]
      },
      {
        "stage_id": 2,
        "name": "CÂY (TREE)",
        "goal": "Marketplace & SDK; quản trị kênh Official Store vs NPP",
        "milestones": [
          "Price policy khác biệt/sku bundle",
          "Auto-attribute hoa hồng Official Store bằng ref code",
          "Credits mode cho deep levels"
        ]
      },
      {
        "stage_id": 3,
        "name": "RỪNG (FOREST)",
        "goal": "Playbook Store + bậc quản lý (Silver/Gold/Diamond) + SLA 99.9%",
        "milestones": [
          "Minh bạch multi-level",
          "Export kiểm toán full-chain",
          "Status page public"
        ]
      },
      {
        "stage_id": 4,
        "name": "ĐẤT (GROUND)",
        "goal": "Consortia minh bạch ngành wellness",
        "milestones": ["Public verify API", "Evidence badges cho chiến dịch đạt chuẩn"]
      }
    ]
  },

  "coding_constitution": {
    "version": "1.2",
    "articles": [
      { "id": 1, "name": "Framework", "rule": "UI chỉ dùng HTML + Tailwind; cấm CSS file riêng." },
      { "id": 2, "name": "Kiến trúc", "rule": "Component hoá mọi UI; props rõ ràng." },
      { "id": 3, "name": "Responsive", "rule": "Mobile-first, ưu tiên luồng 30 ngày." },
      { "id": 4, "name": "Danh pháp & Chú thích", "rule": "Tên tiếng Anh, có <!-- comments --> cho cấu trúc phức tạp." },
      { "id": 5, "name": "Bảo mật", "rule": "Không commit secrets; idempotent payouts." },
      { "id": 6, "name": "Chứng cứ & Nhật ký", "rule": "Mọi tính hoa hồng/bài duyệt quảng cáo phải có hash chain + manifest ký số." },
      { "id": 7, "name": "Fair Marketing", "rule": "Cấm claim y khoa/hiệu quả vượt chuẩn; phải có citation hoặc disclaimer bắt buộc." }
    ]
  },

  "evidence_layer": {
    "manifest_version": "2.3",
    "onchain_anchor_enabled": false,
    "evidence_types": [
      "sale_receipt_digest",
      "commission_calc_proof",
      "ad_review_record",
      "audit_log_hash_chain",
      "transparency_ledger"
    ],
    "hashing": { "algo": "SHA-256", "chain": "hash->prevHash", "merkle": true },
    "signing": {
      "jwks_url": "<JWKS_URL>",
      "rotation_days": 90,
      "alg": ["Ed25519", "ES256"],
      "attestation": ["HMAC", "SRI_json"]
    },
    "workflow": ["propose", "attest", "publish", "verify", "archive"],
    "verify_api": { "get_badge": "/api/evidence/badge", "verify_manifest": "/api/evidence/verify" },
    "public_feeds": { "well_known": "/.well-known/evidence.json", "ledger": "/evidence/ledger" }
  },

  "policy_as_code": {
    "legal": {
      "nd40_core": {
        "product_sales_ratio_min": 0.5,
        "recruitment_fee_share_max": 0.0,
        "ad_claims_review_required": true
      }
    },
    "affiliate": {
      "tiers": [
        { "name": "DirectAffiliate", "criteria": { "type": "direct_sale" }, "payout_pct": 0.10 },
        { "name": "KhoiNghiep", "criteria": { "personal_revenue_min_vnd": 6000000 }, "payout_pct": 0.21 },
        { "name": "DaiSu_Silver", "mgmt_bonus_pct": { "new_revenue": 0.09, "if_team_has_ambassador": 0.03 } },
        { "name": "DaiSu_Gold", "mgmt_bonus_pct": { "new_revenue": 0.12, "delta_when_team_has_silver": 0.03 } },
        { "name": "DaiSu_Diamond", "mgmt_bonus_pct": { "new_revenue": 0.15, "delta_when_team_has_gold": 0.03 } }
      ],
      "cross_lvl": { "same_level_share_pct": 0.02, "province_deal_bounty_pct": 0.01 },
      "manager_upline_pct": { "Silver": 0.15, "Gold": 0.18, "Diamond": 0.20 },
      "caps": { "total_commission_cap_pct": 0.22, "depth_limit": 3, "retail_ratio_guard_min": 0.5 },
      "payout_modes": { "cash": "direct_and_1hop", "credits": "levels_2_to_3" },
      "clawback_window_days": 45,
      "withholding_tax": "auto_deduct_personal_income_tax"
    },
    "channel": {
      "official_store": {
        "price_policy": "online_price >= npp_price * 1.0",
        "sku_policy": "online_sku IN {bundle, special}",
        "referral_recognition": "commission_if_customer_uses_ref_code"
      }
    }
  },

  "payout_engine": {
    "formulae": {
      "direct_commission_vnd": "net_vnd * 0.10",
      "khoinghiep_bonus_vnd": "eligible ? net_vnd * 0.21 : 0",
      "management_bonus_vnd": "team_new_revenue_vnd * mgmt_bonus_pct_by_rank",
      "cross_level_share_vnd": "team_same_level_revenue_vnd * 0.02",
      "province_bounty_vnd": "province_deal_value_vnd * 0.01",
      "withholding_tax_vnd": "(direct_commission_vnd + bonuses_vnd) * pit_rate",
      "commission_total_vnd_capped": "min(sum_components_vnd, net_vnd * 0.22)"
    },
    "guards": [
      "depth_limit<=3",
      "cash_only_for_direct_and_1hop",
      "retail_ratio>=0.5",
      "idempotency_key_required",
      "deny_if_geo_fence"
    ],
    "examples": [
      { "net_vnd": 1000000, "rank": "DirectAffiliate", "team_new_revenue_vnd": 0, "pit_rate": 0.1, "result_commission_vnd": 100000, "tax_vnd": 10000 },
      { "net_vnd": 1000000, "rank": "DaiSu_Silver", "team_new_revenue_vnd": 5000000, "pit_rate": 0.1, "result_commission_vnd": 550000, "tax_vnd": 55000 }
    ]
  },

  "onboarding_journey": {
    "days": 30,
    "tracks": ["Product Basics", "Sales Skills", "Compliance Basics", "Referral & Tools"],
    "steps": [
      { "day": 1, "objective": "Kích hoạt tài khoản + KYC", "cta": "Verify ID", "artefact": "onboarding_step_record" },
      { "day": 3, "objective": "Hiểu SKU & pricing", "cta": "Quiz 5 câu", "artefact": "quiz_result" },
      { "day": 7, "objective": "Tạo ref code & chia sẻ", "cta": "Generate link", "artefact": "refcode_live" },
      { "day": 14, "objective": "Chốt đơn đầu tiên", "cta": "Checkout training", "artefact": "sale_receipt_digest" },
      { "day": 21, "objective": "Tuân thủ quảng cáo", "cta": "Submit ad for review", "artefact": "ad_review_record" },
      { "day": 30, "objective": "Nộp báo cáo mini", "cta": "Progress summary", "artefact": "evidence_manifest" }
    ]
  },

  "ad_review_policies": {
    "claim_categories": {
      "allowed_with_citation": ["thành phần", "quy chuẩn chất lượng", "cách dùng"],
      "forbidden": ["chữa khỏi bệnh", "bảo đảm kết quả y khoa"],
      "requires_disclaimer": ["tác dụng tùy cơ địa", "không thay thế thuốc chữa bệnh"]
    },
    "workflow": ["submit", "auto_checks", "human_review", "attest", "publish/deny"],
    "auto_checks": ["keyword_blacklist", "citation_presence", "image_text_ocr_match"]
  },

  "channel_conflict_guard": {
    "rules": [
      "online_price >= npp_price",
      "official_store_sku in {bundle,special}",
      "referral_attribution_if_ref_code_present"
    ],
    "actions": ["warn", "auto_attribute_commission", "freeze_campaign"]
  },

  "memory_system": {
    "name": "WellNexus Components & Decisions Library",
    "components": { "vectorized": true, "embedding_model": "text-embedding-v3", "similarity_threshold": 0.83 },
    "decision_log": { "enabled": true, "format": "ADR-lite", "fields": ["id", "date", "decision", "context", "consequences", "guards"] },
    "retention": { "components_days": 365, "decisions_days": 730 }
  },

  "schemas_firestore": {
    "npp_profiles": { "fields": ["user_id", "kyc_status", "tier", "join_ts", "ref_code"] },
    "sales": { "fields": ["sale_id", "buyer_id", "seller_id", "sku", "qty", "gross", "vat", "net", "channel", "ref_code", "ts", "inputs_hash"] },
    "commissions": { "fields": ["commission_id", "sale_id", "recipient_id", "tier", "pct", "amount", "calc_manifest_root", "signer", "status", "ts"] },
    "ad_reviews": { "fields": ["ad_id", "owner_id", "claim_type", "evidence_links", "verdict", "reviewer", "ts", "hash"] },
    "evidence": { "fields": ["id", "type", "dataset_digest", "calc_params", "result_hash", "cid", "root", "signature", "ts"] },
    "risk_events": { "fields": ["id", "type", "metric", "threshold", "action", "actor", "ts"] },
    "idempotency_keys": { "fields": ["key", "at", "ttl"] }
  },

  "firestore_indexes": {
    "required": [
      { "collection": "sales", "fields": ["seller_id", "ts_desc"] },
      { "collection": "commissions", "fields": ["recipient_id", "ts_desc"] },
      { "collection": "ad_reviews", "fields": ["owner_id", "ts_desc"] }
    ]
  },

  "apis": {
    "POST /onboarding/step": "record step completion; returns next CTA",
    "POST /affiliate/quote": "dry-run commission for a cart/ref_code",
    "POST /affiliate/settle": "idempotent payout; returns evidence manifest",
    "POST /ad/submit": "submit marketing asset for review; policy checks",
    "GET /ad/status": "return verdict + audit trail",
    "POST /evidence/anchor": "anchor manifest (EIP-712 typed)",
    "GET /evidence/verify?root=...": "{txHash,CID,badgeURL}"
  },

  "api_contracts": {
    "affiliate_quote_request": { "cart_total_vnd": "number", "ref_code": "string", "rank": "string" },
    "affiliate_quote_response": { "direct_vnd": "number", "bonuses_vnd": "number", "cap_applied": "boolean", "total_vnd": "number" },
    "affiliate_settle_request": { "sale_id": "string", "idempotency_key": "string" },
    "affiliate_settle_headers": { "Idempotency-Key": "string", "X-Two-Eyes-Token": "string" },
    "affiliate_settle_response": { "commission_id": "string", "manifest_root": "string", "status": "string" }
  },

  "slo_telemetry": {
    "latency_p99_ms": { "affiliate_settle": 600, "ad_review": 1200 },
    "error_rate_lt": 0.01,
    "drift_mttr_min": 30,
    "status_page": true,
    "burn_rate_alerts": true,
    "alerts": ["retail_ratio_breach", "error_burst", "payout_queue_backlog"]
  },

  "security": {
    "patterns": ["CEI", "AccessControl", "deadline+nonce"],
    "secrets": "Firebase Secrets/Env",
    "rate_limits": { "affiliate_quote_rpm": 120, "affiliate_settle_rpm": 60, "ad_submit_rpm": 30, "evidence_verify_rpm": 600 },
    "idempotency": { "collections": ["idempotency_keys"], "ttl_hours": 24, "header": "Idempotency-Key" },
    "audit_trail": { "hash_chain": true, "persist_manifest": true }
  },

  "governance": {
    "policies": [
      "deny-by-default ngoài đọc/phân tích",
      "2-eyes cross-OU ≥60s cho publish/execute",
      "Idempotency-Key cho payout",
      "retry/backoff + DLQ",
      "rate-limiting endpoint nhạy cảm",
      "PII minimization"
    ],
    "promotion": {
      "preconditions": ["tests_pass", "evidence_signed", "2_eyes_ok", "budget_guard_ok", "cooldown_ok"],
      "cooldown_min": 30
    }
  },

  "svr_loop": {
    "phases": [
      { "name": "Explorer", "tasks": ["xác định mục tiêu 200 NPP", "thu thập chính sách/kanban", "phân rã nhiệm vụ"] },
      { "name": "Verifier", "tasks": ["đối chiếu ND40 & policy", "có citations", "test khói & unit payout"] },
      { "name": "Corrector", "tasks": ["sửa rule payout/UX", "tối ưu 30-day flow", "gia cố guardrails kênh"] }
    ],
    "exit_criteria": ["citations_present", "tests_pass", "artefact_signed"]
  },

  "evaluation": {
    "rubric": [
      { "criterion": "Correctness", "weight": 0.35 },
      { "criterion": "Evidence/Citations", "weight": 0.25 },
      { "criterion": "Security/Privacy", "weight": 0.15 },
      { "criterion": "Clarity/UX", "weight": 0.15 },
      { "criterion": "Performance/Cost", "weight": 0.10 }
    ],
    "tests": { "unit": true, "smoke": true, "non_inferiority": { "enabled": true, "design": "Pocock/OBF alpha-spending" } }
  },

  "outputs": {
    "default_sections": ["Goal", "Plan", "Risks", "Controls", "Artefacts", "Next Steps"],
    "artefact_types": ["UI HTML/Tailwind", "Cloud Function", "Firestore Rules", "Checklists", "Signed Manifest"],
    "formatting": { "code_blocks": true, "tables": true }
  },

  "safety": {
    "content": ["cấm PII nhạy cảm", "cấm claim y khoa quá mức", "tuân thủ bản quyền/quảng cáo"],
    "privacy": { "gdpr_ccpa": true, "data_min": true, "purpose_limit": true }
  },

  "firebase_idx": {
    "project": { "id": "wellnexus-dev", "default_region": "asia-southeast1" },
    "functions": {
      "runtime": { "node": ">=20", "concurrency": 100 },
      "http_endpoints": [
        { "name": "onboardingStep", "path": "/api/onboarding/step", "region": "asia-southeast1", "timeout_s": 20, "memory_mb": 256, "rate_limit_rpm": 180 },
        { "name": "affiliateQuote", "path": "/api/affiliate/quote", "region": "asia-southeast1", "timeout_s": 20, "memory_mb": 256, "rate_limit_rpm": 120 },
        { "name": "affiliateSettle", "path": "/api/affiliate/settle", "region": "asia-southeast1", "timeout_s": 45, "memory_mb": 512, "rate_limit_rpm": 60, "idempotency": true, "requires_two_eyes": true },
        { "name": "adSubmit", "path": "/api/ad/submit", "region": "asia-southeast1", "timeout_s": 30, "memory_mb": 256, "rate_limit_rpm": 30 },
        { "name": "adStatus", "path": "/api/ad/status", "region": "asia-southeast1", "timeout_s": 10, "memory_mb": 128, "rate_limit_rpm": 300 },
        { "name": "evidenceAnchor", "path": "/api/evidence/anchor", "region": "asia-southeast1", "timeout_s": 30, "memory_mb": 256, "rate_limit_rpm": 60, "idempotency": true },
        { "name": "evidenceVerify", "path": "/api/evidence/verify", "region": "asia-southeast1", "timeout_s": 10, "memory_mb": 128, "rate_limit_rpm": 600 }
      ],
      "schedules": [
        { "name": "reconcileCommissions", "cron": "every day 02:00", "region": "asia-southeast1", "desc": "đối soát, áp dụng clawback & khóa kỳ", "timeout_s": 420 },
        { "name": "publishEvidenceLedger", "cron": "every 12 hours", "region": "asia-southeast1", "desc": "xuất ledger công khai", "timeout_s": 120 }
      ],
      "headers": { "idempotency_key": "Idempotency-Key", "two_eyes_token": "X-Two-Eyes-Token" }
    },
    "firestore": {
      "rules_profile": "least-privilege",
      "rulesets": {
        "npp_profiles": { "read": "owner_or_admin", "write": "owner_or_admin" },
        "sales": { "create": "auth", "read": "owner_or_admin", "update": "service_only", "delete": "service_only" },
        "commissions": { "create": "service_only", "read": "owner_or_admin", "update": "service_only", "delete": "noone" },
        "ad_reviews": { "create": "auth", "read": "owner_or_admin", "update": "reviewer_or_service", "delete": "service_only" },
        "evidence": { "read": "public", "write": "service_only" },
        "risk_events": { "read": "admin_only", "write": "service_only" },
        "idempotency_keys": { "read": "service_only", "write": "service_only" }
      },
      "ttl": { "idempotency_keys_hours": 24 }
    },
    "hosting": {
      "rewrites": [
        { "source": "/api/onboarding/step", "function": "onboardingStep" },
        { "source": "/api/affiliate/quote", "function": "affiliateQuote" },
        { "source": "/api/affiliate/settle", "function": "affiliateSettle" },
        { "source": "/api/ad/submit", "function": "adSubmit" },
        { "source": "/api/ad/status", "function": "adStatus" },
        { "source": "/api/evidence/anchor", "function": "evidenceAnchor" },
        { "source": "/api/evidence/verify", "function": "evidenceVerify" }
      ],
      "headers": [
        { "source": "/api/**", "headers": [{ "key": "Cache-Control", "value": "no-store" }] }
      ]
    },
    "emulators": { "functions": 5001, "firestore": 8080, "auth": 9099, "ui": true },
    "secrets": ["AFFILIATE_PIT_RATE", "JWKS_PRIVATE", "JWKS_PUBLIC", "REVIEWER_WEBHOOK_URL"],
    "ci_cd": {
      "preview_channels": ["staging", "prod"],
      "checks": ["lint", "build", "unit", "smoke", "rules-compile"],
      "require_two_eyes_for_prod": true
    }
  },

  "rollout_playbook": {
    "preflight": ["lint", "typecheck", "unit", "rules-compile", "secrets-present"],
    "staging": ["deploy:hosting:functions", "seed:fixtures:minimal", "run:smoke"],
    "canary": { "pct": 10, "duration_min": 30, "checks": ["SLO p95", "error_rate", "idempotency_dupe=0"] },
    "promote": { "requires": ["2-eyes", "evidence_signed", "budget_guard_ok"], "actions": ["promote:prod", "announce:status_page"] },
    "rollback": { "conditions": ["p95>budget", "5xx>threshold", "DLQ_backlog>limit"], "action": "auto_rollback_previous_green" }
  },

  "observability": {
    "logs": { "structured": true, "fields": ["reqId", "actor", "path", "latency_ms", "result", "idempotency_key"] },
    "metrics": { "histograms": ["latency_ms"], "counters": ["5xx", "4xx", "settle_ok"], "gauges": ["queue_depth", "dlq_depth"] },
    "tracing": { "enabled": true, "propagation": "W3C Trace Context", "join_with_partners": true },
    "dashboards": ["Affiliate SLO", "Ad Review Flow", "Evidence Verify"]
  },

  "threat_model": {
    "actors": ["malicious_affiliate", "compromised_admin", "scraper", "rate_abuser"],
    "attack_surface": ["/api/affiliate/settle", "/api/ad/submit", "/api/evidence/anchor"],
    "controls": [
      "HMAC request signing (optional)",
      "Idempotency + replay window 24h",
      "RBAC + least privilege",
      "Geo-fence deny",
      "Rate limit + circuit breaker"
    ],
    "resilience": { "backoff": "expo+jitter", "DLQ": true, "canary": true }
  },

  "qa_checklist_DoD": {
    "config": ["JWKS present", "Secrets mounted", "Rules deployed"],
    "tests": ["Unit payout math", "Smoke /quote /settle", "Rules deny on forbidden writes"],
    "security": ["No secrets in repo", "IAM least privilege"],
    "ops": ["Dashboards online", "Alerts wired"],
    "artefacts": ["Signed manifest", "ADR entry"]
  },

  "error_catalog": {
    "E1001": "Idempotency key missing",
    "E1002": "Idempotency conflict (duplicate)",
    "E2001": "Geo-fence denied",
    "E3001": "Retail ratio guard breached",
    "E4001": "Two-eyes token invalid or missing",
    "E5001": "Evidence signing failure"
  },

  "retry_backoff_policy": {
    "default": { "strategy": "exponential_jitter", "base_ms": 200, "max_ms": 60000, "retries": 6 },
    "webhooks": { "strategy": "exponential_jitter", "base_ms": 500, "max_ms": 120000, "retries": 8 }
  },

  "dlq_policy": {
    "enabled": true,
    "storage": "Firestore collection dlq_events",
    "inspect_fields": ["error_code", "payload_hash", "first_seen", "retries"],
    "auto_retry_cron": "every 1 hours"
  },

  "newman_tests": {
    "collections": [
      { "name": "Affiliate Settle — Idempotency", "checks": ["first_201", "second_200_same_body", "manifest_root_present"] },
      { "name": "Ad Review — Forbidden Claims", "checks": ["deny_forbidden", "disclaimer_required"] },
      { "name": "Evidence Verify — Badge", "checks": ["verify_ok", "badge_url_valid"] }
    ]
  },

  "ui_artifacts": {
    "files": [
      "index.html",
      "admin/dashboard-seed.html",
      "admin/seed-dashboard.js",
      "manifest-seed.json"
    ],
    "rules": "HTML+Tailwind only; componentized sections"
  },

  "next_7_days": [
    "Xuất checklist Onboarding 30 ngày + CTA từng bước.",
    "Compiler policy affiliate thành JSON rules + test bảng tính ví dụ.",
    "Lắp workflow kiểm duyệt quảng cáo (auto_checks + human_review).",
    "Bật Channel-Guard: enforce giá/sku Official Store + auto-attribute ref.",
    "Ship /affiliate/quote & /affiliate/settle (idempotent, 2-eyes) + Evidence verify API."
  ]
}
