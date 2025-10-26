
import * as functions from "firebase-functions/v2/https";
import express, { Request, Response } from "express";
import cors from "cors";
import { _ad_submit_ } from "./adSubmit";
import { _ad_status_ } from "./adStatus";


const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.post("/submit", _ad_submit_);
app.get("/status", _ad_status_);


export const ad = functions.onRequest({ region: "asia-southeast1" }, app);
