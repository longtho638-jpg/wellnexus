async function loadMetrics() {
  const res = await fetch("/api/partner/metrics");
  const json = await res.json();
  if (!json.ok) return;
  const container = document.getElementById("metrics");
  container.innerHTML = "";
  json.data.forEach(p => {
    const card = document.createElement("div");
    card.className = "p-4 bg-white rounded shadow";
    card.innerHTML = `
      <h2 class="font-bold">${p.name}</h2>
      <p>Active Users: ${p.active_users}</p>
      <p>Revenue: $${p.monthly_revenue.toLocaleString()}</p>`;
    container.appendChild(card);
  });
}
loadMetrics();
setInterval(loadMetrics, 30000);
