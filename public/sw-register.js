/* sw-register.js
 * Đăng ký SW + thông báo khi có bản mới. Không phụ thuộc UI framework.
 * Gọi registerSW() sớm (VD: đặt <script defer src="/sw-register.js"></script> trong <head>)
 */

(function () {
  const SW_URL = "/service-worker.js";
  const HOUR = 60 * 60 * 1000;

  function defaultUpdatePrompt(ctx) {
    // ctx.update() sẽ gửi SKIP_WAITING và auto reload khi controllerchange
    const ok = window.confirm("Ứng dụng có phiên bản mới. Tải lại để cập nhật?");
    if (ok) ctx.update();
  }

  function trackInstalling(reg, onUpdate) {
    const worker = reg.installing;
    if (!worker) return;

    worker.addEventListener("statechange", () => {
      if (worker.state === "installed") {
        // Có controller -> nghĩa là đang chạy phiên bản cũ => có bản mới
        if (navigator.serviceWorker.controller) {
          const ctx = {
            worker,
            update() {
              worker.postMessage({ type: "SKIP_WAITING" });
            },
          };
          (onUpdate || defaultUpdatePrompt)(ctx);
        } else {
          // Cài đặt lần đầu: có thể hiển thị "Sẵn sàng offline" nếu muốn
          // console.log("Service Worker installed (first install).");
        }
      }
    });
  }

  function setupAutoReload() {
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  }

  async function registerSW({ onUpdate } = {}) {
    if (!("serviceWorker" in navigator)) return;

    try {
      const reg = await navigator.serviceWorker.register(SW_URL, { scope: "/" });

      // Nếu có worker chờ sẵn (waiting), kích hoạt prompt ngay
      if (reg.waiting && navigator.serviceWorker.controller) {
        (onUpdate || defaultUpdatePrompt)({
          worker: reg.waiting,
          update() {
            reg.waiting.postMessage({ type: "SKIP_WAITING" });
          },
        });
      }

      // Đang cài đặt
      if (reg.installing) trackInstalling(reg, onUpdate);

      // SW mới được tìm thấy (updatefound)
      reg.addEventListener("updatefound", () => trackInstalling(reg, onUpdate));

      // Tự reload khi SW mới activate
      setupAutoReload();

      // Chủ động kiểm tra bản mới: khi tab được focus & theo chu kỳ
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") reg.update();
      });
      setInterval(() => reg.update(), HOUR);
    } catch (e) {
      console.error("[SW] Register failed:", e);
    }
  }

  // Tự chạy với cấu hình mặc định
  registerSW();

  // Expose để tuỳ biến UI thông báo nếu cần
  window.registerSW = registerSW;
})();
