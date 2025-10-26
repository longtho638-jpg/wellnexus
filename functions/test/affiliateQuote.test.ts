
import "../src/firebase";
import { _affiliate_quote_ } from "../src/affiliateQuote";
import { Request, Response } from "express";

describe("Affiliate Quote", () => {
    it("should calculate the correct quote", async () => {
        const req = {
            body: {
                cart_total_vnd: 1000000,
                ref_code: "REF-7XY",
                rank: "DirectAffiliate"
            }
        } as Request;

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        } as unknown as Response;

        await _affiliate_quote_(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            direct_vnd: 100000,
            bonuses_vnd: 0,
            cap_applied: false,
            total_vnd: 100000
        });
    });
});
