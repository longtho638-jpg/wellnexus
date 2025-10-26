/* service-worker.js
 * Chiến lược:
 * - Assets (script/style/image/font): Cache-first.
 * - HTML (navigation): Network-first để nhận bản mới nhanh.
 * - Thông báo cập nhật: qua postMessage SKIP_WAITING từ sw-register.js.
 */

const BUILD_REV = "2025.10.25-forest-final"; 
const PRECACHE = `precache-${BUILD_REV}`;
const RUNTIME = `runtime-${BUILD_REV}`;

// Liệt kê các file cần precache ngay khi cài đặt.
const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/seed-dashboard.html",
  "/seed-dashboard.js",
  "/manifest-seed.json",
  "/status.html",
  "/onboarding.html",
  "/affiliate.html",
  "/ad-review.html",
  "/channel.html",
  "/admin/partners.html",
  "/admin/verify.html",
  "/admin/realtime.html",
  "/admin/audit.html",
  "/admin/leaderboard.html"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(PRECACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Xoá cache cũ
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== PRECACHE && key !== RUNTIME)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

function isStaticAsset(req) {
  const d = req.destination;
  if (["script", "style", "image", "font"].includes(d)) return true;
  const url = new URL(req.url);
  return /\.(css|js|mjs|jsx|ts|tsx|png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf)$/.test(
    url.pathname
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request));
    return;
  }
});

async function cacheFirst(request) {
  const cache = await caches.open(RUNTIME);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response && (response.status === 200 || response.type === "opaque")) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const fromPrecache = await caches.match(request);
    if (fromPrecache) return fromPrecache;
    throw err;
  }
}

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME);
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    const index = await caches.match("/index.html");
    if (index) return index;
    throw err;
  }
}

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
