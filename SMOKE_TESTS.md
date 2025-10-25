# Smoke Tests for WellNexus Commerce OS

This document outlines a series of smoke tests to ensure that the core functionalities of the WellNexus Commerce OS are working as expected after a deployment.

## 1. Affiliate Quote API

### Description
This test verifies that the `/api/affiliate/quote` endpoint correctly calculates a commission quote based on the provided cart total and affiliate rank.

### Request
```bash
curl -X POST https://asia-southeast1-wellnexus-dev.cloudfunctions.net/affiliateQuote \
  -H "Content-Type: application/json" \
  -d '{
    "cart_total_vnd": 1000000,
    "ref_code": "TEST123",
    "rank": "DirectAffiliate"
  }'
```

### Expected Response
```json
{
  "direct_vnd": 100000,
  "bonuses_vnd": 0,
  "cap_applied": false,
  "total_vnd": 100000
}
```

---

## 2. Affiliate Settle API

### Description
This test verifies that the `/api/affiliate/settle` endpoint can process a settlement request with the required idempotency and two-eyes-token headers.

### Request
```bash
curl -X POST https://asia-southeast1-wellnexus-dev.cloudfunctions.net/affiliateSettle \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H "X-Two-Eyes-Token: some-valid-token" \
  -d '{
    "sale_id": "sale-12345"
  }'
```

### Expected Response
A successful response with a `commission_id`, `manifest_root`, and a status of `processed`.

```json
{
  "commission_id": "commission_...",
  "manifest_root": "manifest_...",
  "status": "processed"
}
```

### Idempotency Check
Running the same request again with the same `Idempotency-Key` should return a response with the status `processed_earlier`.

---

## 3. Ad Submit and Status APIs

### Description
This test verifies the basic workflow of submitting an ad and then checking its status.

### Step 1: Submit Ad
```bash
curl -X POST https://asia-southeast1-wellnexus-dev.cloudfunctions.net/adSubmit \
  -H "Content-Type: application/json" \
  -d '{
    "ad_content": "This is a test ad."
  }'
```
**Expected Response:** A JSON object with a `status` of `submitted` and an `ad_id`.

### Step 2: Check Status
Use the `ad_id` from the previous step.
```bash
curl "https://asia-southeast1-wellnexus-dev.cloudfunctions.net/adStatus?ad_id=<ad_id_from_step_1>"
```
**Expected Response:** A JSON object with the ad's status, which should be `pending_review`.


## 4. Firestore Rules

### Description
This test manually verifies that the Firestore rules are correctly enforced. This requires authenticating as different users in the Firebase console or in a client application.

### Test Cases
- **npp_profiles:**
  - An authenticated user can read and write their own profile.
  - A user cannot read or write another user's profile.
- **sales:**
  - An authenticated user can create a sale.
  - A user can read a sale where they are the seller.
  - A user cannot update or delete a sale.
- **evidence:**
  - Anyone can read from the evidence collection.
  - No one can write to the evidence collection directly.

## 5. Scheduled Functions

### Description
This test verifies that the scheduled functions are triggered as expected. This can be checked by:
1. Manually running the functions in the Google Cloud Console.
2. Checking the function logs in the Firebase console to see the "Function execution started" and "Function execution took..." messages.

### Functions to Check
- `reconcileCommissions`
- `publishEvidenceLedger`

A successful test is seeing the log messages for these functions appearing at their scheduled times.
