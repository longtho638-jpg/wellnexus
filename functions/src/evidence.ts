
import * as functions from "firebase-functions/v2/https";
import express, { Request, Response } from "express";
import cors from "cors";
import { _evidence_anchor_ } from "./evidenceAnchor";
import { _evidence_verify_ } from "./evidenceVerify";

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.post("/anchor", _evidence_anchor_);
app.get("/verify", _evidence_verify_);

export const evidence = functions.onRequest({ region: "asia-southeast1" }, app);
