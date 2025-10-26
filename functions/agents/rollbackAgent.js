import { execSync } from "child_process";

export async function rollbackHosting() {
  try {
    console.log("🔁 [Agent] Rolling back hosting...");
    execSync("firebase hosting:rollback", { stdio: "inherit" });
    console.log("✅ [Agent] Rollback completed.");
  } catch (err) {
    console.error("❌ [Agent] Rollback failed:", err.message);
  }
}
