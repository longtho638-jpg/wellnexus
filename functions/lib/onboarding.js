import * as functions from "firebase-functions/v2/https";
import express from "express";
import cors from "cors";
import { _onboarding_step_ } from "./onboardingStep";
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());
app.post("/step", _onboarding_step_);
export const onboarding = functions.onRequest({ region: "asia-southeast1" }, app);
