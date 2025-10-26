import * as admin from "firebase-admin";
const db = admin.firestore();
export const _affiliate_quote_ = async (req, res) => {
    try {
        const { cart_total_vnd, ref_code, rank } = req.body;
        // Validation
        if (!cart_total_vnd || cart_total_vnd <= 0) {
            return res.status(400).json({ error: "cart_total_vnd must be a positive number" });
        }
        let direct_vnd = 0;
        let bonuses_vnd = 0;
        let cap_applied = false;
        // Tiers
        const tiers = {
            DirectAffiliate: { payout_pct: 0.10 },
            KhoiNghiep: { payout_pct: 0.21, criteria: { personal_revenue_min_vnd: 6000000 } }
        };
        const tier = tiers[rank];
        if (tier) {
            // Check for KhoiNghiep bonus
            if (rank === 'KhoiNghiep' && cart_total_vnd >= tier.criteria.personal_revenue_min_vnd) {
                bonuses_vnd = cart_total_vnd * (tier.payout_pct - tiers.DirectAffiliate.payout_pct);
            }
            direct_vnd = cart_total_vnd * tiers.DirectAffiliate.payout_pct;
        }
        let total_vnd = direct_vnd + bonuses_vnd;
        // Apply cap
        const total_commission_cap_pct = 0.22;
        if (total_vnd > cart_total_vnd * total_commission_cap_pct) {
            total_vnd = cart_total_vnd * total_commission_cap_pct;
            cap_applied = true;
        }
        res.status(200).json({
            direct_vnd,
            bonuses_vnd,
            cap_applied,
            total_vnd
        });
    }
    catch (error) {
        console.error("Error in affiliate quote:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
