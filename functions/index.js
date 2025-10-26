import { autoDeploy } from "./agents/autoDeployAgent.js";

export const deployAgent = async (req, res) => {
  await autoDeploy();
  res.status(200).send("Auto-deploy agent completed.");
};
