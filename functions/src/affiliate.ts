
import * as functions from "firebase-functions/v2/https";
import express, { Request, Response } from "express";
import cors from "cors";
import { _affiliate_quote_ } from "./affiliateQuote";
import { _affiliate_settle_ } from "./affiliateSettle";


const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.post("/quote", _affiliate_quote_);
app.post("/settle", _affiliate_settle_);

export const affiliate = functions.onRequest({ region: "asia-southeast1" }, app);
