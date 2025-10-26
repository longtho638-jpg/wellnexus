import { execSync } from "child_process";
import { runSmokeTests } from "./verifyAgent.js";
import { rollbackHosting } from "./rollbackAgent.js";

export async function autoDeploy() {
  try {
    console.log("🚀 [Agent] Starting deploy...");
    execSync("npx firebase deploy --only functions,hosting --force", { stdio: "inherit", cwd: "/workspace" });

    console.log("✅ [Agent] Deploy complete. Running smoke tests...");
    const result = await runSmokeTests();

    if (result.latency_p95 < 1500 && result.error_rate < 0.01) {
      console.log("🎯 [Agent] Deployment healthy:", result);
    } else {
      console.warn("⚠️ [Agent] SLO breach detected:", result);
      await rollbackHosting();
    }
  } catch (err) {
    console.error("❌ [Agent] Deploy failed:", err.message);
    await rollbackHosting();
  }
}
