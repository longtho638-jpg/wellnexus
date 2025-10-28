const metricsContainer = document.getElementById("metrics");
const totalsContainer = document.getElementById("totals");
const statusElement = document.getElementById("status");
const partnerFilter = document.getElementById("partner-filter");
const updatedFilter = document.getElementById("updated-filter");
const refreshButton = document.getElementById("refresh");
const limitFilter = document.getElementById("limit-filter");
let isLoading = false;

const state = {
  partnerId: "",
  updatedWithin: "",
  resultLimit: ""
};

const TIMEFRAME_PRESETS = {
  "": { durationMs: null, summary: "" },
  "24h": { durationMs: 24 * 60 * 60 * 1000, summary: "updated in the last 24 hours" },
  "7d": { durationMs: 7 * 24 * 60 * 60 * 1000, summary: "updated in the last 7 days" },
  "30d": { durationMs: 30 * 24 * 60 * 60 * 1000, summary: "updated in the last 30 days" }
};

const LIMIT_OPTIONS = new Set(["", "10", "25", "50", "100"]);

const normalizeUpdatedWithin = value => {
  if (typeof value !== "string") {
    return "";
  }
  return TIMEFRAME_PRESETS[value] ? value : "";
};

const normalizeResultLimit = value => {
  if (typeof value !== "string") {
    return "";
  }
  return LIMIT_OPTIONS.has(value) ? value : "";
};

const resolveUpdatedSince = key => {
  const preset = TIMEFRAME_PRESETS[key];
  if (!preset?.durationMs) {
    return null;
  }
  const timestamp = Date.now() - preset.durationMs;
  if (!Number.isFinite(timestamp)) {
    return null;
  }
  return new Date(timestamp).toISOString();
};

const describeTimeframe = key => TIMEFRAME_PRESETS[key]?.summary ?? "";

const setLoadingState = loading => {
  isLoading = loading;
  if (!refreshButton) {
    return;
  }

  refreshButton.disabled = loading;
  refreshButton.setAttribute("aria-busy", loading ? "true" : "false");
  refreshButton.classList.toggle("opacity-50", loading);
};

const formatNumber = new Intl.NumberFormat("en-US");
const formatCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

const knownPartners = new Map();

const setStatus = (message, variant = "info") => {
  if (!statusElement) {
    return;
  }

  const baseClasses =
    "rounded-lg border px-4 py-3 text-sm transition-colors duration-150";
  const variants = {
    info: "border-indigo-300 bg-indigo-50 text-indigo-700",
    success: "border-emerald-300 bg-emerald-50 text-emerald-700",
    error: "border-rose-300 bg-rose-50 text-rose-700"
  };

  statusElement.className = `${baseClasses} ${variants[variant] ?? variants.info}`;
  statusElement.setAttribute("role", variant === "error" ? "alert" : "status");
  statusElement.textContent = message;
};

const updateQueryString = () => {
  const url = new URL(window.location.href);
  if (state.partnerId) {
    url.searchParams.set("partner_id", state.partnerId);
  } else {
    url.searchParams.delete("partner_id");
  }

  if (state.updatedWithin) {
    url.searchParams.set("updated_within", state.updatedWithin);
  } else {
    url.searchParams.delete("updated_within");
  }

  if (state.resultLimit) {
    url.searchParams.set("limit", state.resultLimit);
  } else {
    url.searchParams.delete("limit");
  }

  window.history.replaceState({}, "", url);
};

const ensurePartnerOption = (partnerId, partnerName) => {
  if (!partnerFilter || !partnerId) {
    return;
  }

  if (!knownPartners.has(partnerId)) {
    const option = document.createElement("option");
    option.value = partnerId;
    option.textContent = partnerName;
    partnerFilter.appendChild(option);
    knownPartners.set(partnerId, option);
  } else {
    const option = knownPartners.get(partnerId);
    if (option) {
      option.textContent = partnerName;
    }
  }
};

const renderTotals = metrics => {
  if (!totalsContainer) {
    return;
  }

  totalsContainer.innerHTML = "";

  if (!metrics.length) {
    return;
  }

  const totalUsers = metrics.reduce((sum, item) => sum + (item.active_users ?? 0), 0);
  const totalRevenue = metrics.reduce((sum, item) => sum + (item.monthly_revenue ?? 0), 0);
  const lastUpdated = metrics
    .map(item => item.updatedAt)
    .filter(Boolean)
    .sort()
    .pop();

  const cards = [
    {
      label: "Total active users",
      value: formatNumber.format(totalUsers)
    },
    {
      label: "Total monthly revenue",
      value: formatCurrency.format(totalRevenue)
    },
    {
      label: "Last updated",
      value: lastUpdated ? new Date(lastUpdated).toLocaleString() : "Not available"
    }
  ];

  cards.forEach(card => {
    const wrapper = document.createElement("div");
    wrapper.className = "rounded-lg bg-white p-4 shadow";
    wrapper.innerHTML = `
      <p class="text-xs uppercase tracking-wide text-gray-500">${card.label}</p>
      <p class="mt-2 text-2xl font-semibold text-gray-900">${card.value}</p>
    `;
    totalsContainer.appendChild(wrapper);
  });
};

const renderMetrics = metrics => {
  if (!metricsContainer) {
    return;
  }

  metricsContainer.innerHTML = "";

  if (!metrics.length) {
    const emptyState = document.createElement("div");
    emptyState.className = "rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500";
    const timeframeSummary = describeTimeframe(state.updatedWithin);
    emptyState.textContent = timeframeSummary
      ? `No partner metrics ${timeframeSummary}.`
      : state.partnerId
      ? "No metrics available for the selected partner."
      : "No partner metrics available.";
    metricsContainer.appendChild(emptyState);
    return;
  }

  metrics.forEach(metric => {
    ensurePartnerOption(metric.id, metric.name);

    const card = document.createElement("article");
    card.className = "rounded-lg bg-white p-6 shadow transition hover:shadow-lg";
    card.innerHTML = `
      <header class="mb-4">
        <h3 class="text-lg font-semibold text-gray-900">${metric.name}</h3>
        <p class="text-xs uppercase tracking-wide text-gray-400">ID: ${metric.id}</p>
      </header>
      <dl class="space-y-2 text-sm text-gray-700">
        <div class="flex items-center justify-between">
          <dt class="font-medium text-gray-500">Active users</dt>
          <dd class="text-base font-semibold">${formatNumber.format(metric.active_users ?? 0)}</dd>
        </div>
        <div class="flex items-center justify-between">
          <dt class="font-medium text-gray-500">Monthly revenue</dt>
          <dd class="text-base font-semibold">${formatCurrency.format(metric.monthly_revenue ?? 0)}</dd>
        </div>
        <div class="flex items-center justify-between text-xs text-gray-400">
          <dt>Last updated</dt>
          <dd>${metric.updatedAt ? new Date(metric.updatedAt).toLocaleString() : "Unknown"}</dd>
        </div>
      </dl>
    `;
    metricsContainer.appendChild(card);
  });
};

const loadMetrics = async () => {
  if (isLoading) {
    return;
  }

  const timeframeSummary = describeTimeframe(state.updatedWithin);
  const loadingMessage = timeframeSummary
    ? `Loading partner metrics ${timeframeSummary}…`
    : "Loading partner metrics…";

  setLoadingState(true);
  setStatus(loadingMessage, "info");

  try {
    const endpoint = new URL("/api/partner/metrics", window.location.origin);
    if (state.partnerId) {
      endpoint.searchParams.set("partner_id", state.partnerId);
    }

    const updatedSinceIso = resolveUpdatedSince(state.updatedWithin);
    if (updatedSinceIso) {
      endpoint.searchParams.set("updated_since", updatedSinceIso);
    }

    if (state.resultLimit) {
      endpoint.searchParams.set("limit", state.resultLimit);
    }

    const response = await fetch(endpoint.toString(), {
      headers: { Accept: "application/json" }
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const payload = await response.json();
    if (!payload.ok) {
      throw new Error(payload.error || "Unexpected response from server");
    }

    const metrics = Array.isArray(payload.data) ? payload.data : [];

    renderTotals(metrics);
    renderMetrics(metrics);

    if (partnerFilter && partnerFilter.value !== state.partnerId) {
      partnerFilter.value = state.partnerId;
    }

    if (updatedFilter && updatedFilter.value !== state.updatedWithin) {
      updatedFilter.value = state.updatedWithin;
    }

    if (limitFilter && limitFilter.value !== state.resultLimit) {
      limitFilter.value = state.resultLimit;
    }

    const refreshedAt = new Date().toLocaleTimeString();
    const limitSummary = state.resultLimit ? ` (limit ${state.resultLimit})` : "";
    const successMessage = metrics.length
      ? `Showing ${metrics.length} partner${metrics.length > 1 ? "s" : ""}${
          timeframeSummary ? ` ${timeframeSummary}` : ""
        }${limitSummary}. Last refreshed at ${refreshedAt}.`
      : state.updatedWithin
      ? "No partner metrics matched the selected timeframe."
      : "No partner metrics returned for this filter.";

    setStatus(successMessage, metrics.length ? "success" : "info");
  } catch (error) {
    console.error("Failed to load partner metrics", error);
    setStatus(
      error instanceof Error
        ? `Unable to load partner metrics (${error.message}).`
        : "Unable to load partner metrics. Please try again.",
      "error"
    );
  } finally {
    setLoadingState(false);
  }
};

const params = new URLSearchParams(window.location.search);
state.partnerId = params.get("partner_id") || "";
state.updatedWithin = normalizeUpdatedWithin(params.get("updated_within") || "");
state.resultLimit = normalizeResultLimit(params.get("limit") || "");

if (partnerFilter) {
  if (state.partnerId) {
    ensurePartnerOption(state.partnerId, state.partnerId);
  }
  partnerFilter.value = state.partnerId;
  partnerFilter.addEventListener("change", event => {
    const select = event.target;
    if (!(select instanceof HTMLSelectElement)) {
      return;
    }
    state.partnerId = select.value;
    updateQueryString();
    loadMetrics();
  });
}

if (updatedFilter) {
  updatedFilter.value = state.updatedWithin;
  updatedFilter.addEventListener("change", event => {
    const select = event.target;
    if (!(select instanceof HTMLSelectElement)) {
      return;
    }
    state.updatedWithin = normalizeUpdatedWithin(select.value);
    updateQueryString();
    loadMetrics();
  });
}

if (limitFilter) {
  limitFilter.value = state.resultLimit;
  limitFilter.addEventListener("change", event => {
    const select = event.target;
    if (!(select instanceof HTMLSelectElement)) {
      return;
    }
    state.resultLimit = normalizeResultLimit(select.value);
    updateQueryString();
    loadMetrics();
  });
}

if (refreshButton) {
  refreshButton.addEventListener("click", () => {
    loadMetrics();
  });
}

updateQueryString();
loadMetrics();
