import { execSync } from "child_process";

export async function rollbackHosting() {
  try {
    console.log("🔁 [Agent] Rolling back hosting...");
    execSync("npx firebase hosting:channel:deploy live --only apex-ba819", { stdio: "inherit", cwd: "/workspace" });
    console.log("✅ [Agent] Rollback completed.");
  } catch (err) {
    console.error("❌ [Agent] Rollback failed:", err.message);
  }
}
