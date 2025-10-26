export async function runSmokeTests() {
  const fetch = (await import("node-fetch")).default;
  const t0 = Date.now();
  const response = await fetch("https://wellnexus.web.app/api/health");
  const latency = Date.now() - t0;

  return {
    latency_p95: latency,
    error_rate: response.ok ? 0 : 1,
    status: response.status,
    body: await response.text()
  };
}
