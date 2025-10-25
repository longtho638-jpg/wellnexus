"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.affiliateQuote = void 0;
const functions = require("firebase-functions/v2/https");
exports.affiliateQuote = functions.onRequest(async (req, res) => {
    try {
        const { cart_total_vnd, rank } = req.body;
        if (!cart_total_vnd || !rank) {
            res.status(400).json({ error: "Thiếu dữ liệu đầu vào" });
            return;
        }
        // Công thức cơ bản (rút từ JSON policy)
        const pctMap = {
            DirectAffiliate: 0.10,
            KhoiNghiep: 0.21,
            DaiSu_Silver: 0.15,
            DaiSu_Gold: 0.18,
            DaiSu_Diamond: 0.20,
        };
        const pct = pctMap[rank] ?? 0.1;
        const direct_vnd = cart_total_vnd * pct;
        const bonuses_vnd = 0;
        const total_vnd = Math.min(cart_total_vnd * 0.22, direct_vnd + bonuses_vnd);
        res.json({
            direct_vnd,
            bonuses_vnd,
            cap_applied: total_vnd < direct_vnd,
            total_vnd,
            tax_vnd: total_vnd * 0.1,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
//# sourceMappingURL=affiliateQuote.js.map