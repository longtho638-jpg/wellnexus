/*
 * seed-dashboard.js
 * Tích hợp SeedMetricsAdapter để kéo dữ liệu thật.
 */
import { SeedMetricsAdapter, defaultMapping } from './seed-metrics-adapter.js';

// Khởi tạo Firebase (chỉ làm ví dụ - production nên inject config an toàn)
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

// IMPORTANT: Thay bằng config Firebase của bạn
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "wellnexus-87243274-b52ca",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const functions = getFunctions(app, 'asia-southeast1');

const adapter = new SeedMetricsAdapter({ db, functions });

// --- Các hàm render và helpers giữ nguyên từ file gốc ---
// (bỏ phần sample data)

// ==========================
// Cập nhật hàm init để kéo dữ liệu từ adapter
// ==========================
async function init() {
  // ... (phần theme, timeframe, buttons giữ nguyên)

  // Tải dữ liệu KPI & sections từ adapter
  try {
    const metrics = await adapter.getOnce('firestore', defaultMapping);
    
    // Giả lập sparkline data vì adapter chưa cung cấp
    const spark = {
        retention: [50, 52, 55, 58, 60, 59, 62],
        ltv: [4, 4.5, 5, 5.2, 5.8, 6, 6.1],
        npp: [10, 15, 20, 25, 30, 35, 40],
        orders: [5, 8, 12, 15, 18, 20, 22]
    };
    
    // Cần tạo một object `metrics` tương thích với `renderKPIs`
    const kpiMetrics = {
        retentionRate: metrics.retention90d,
        ltvToCAC: 6.0, // Giả lập
        newNPP: 50, // Giả lập
        firstOrders: 30 // Giả lập
    };

    renderKPIs({ metrics: kpiMetrics, spark });

    // Các phần còn lại có thể giữ nguyên dữ liệu mẫu hoặc fetch tương tự
    // renderTasks(loadLS(LS_KEYS.TASKS, sample.tasks72h));
    // renderOnboarding(sample.onboarding);
    // renderCompliance(loadLS(LS_KEYS.COMPLIANCE, sample.compliance));
    // renderActivity(sample.activity);

  } catch (error) {
    console.error("Failed to load metrics:", error);
    // Hiển thị lỗi trên UI
  }
  
  // Build time footer
  $('#buildTime').textContent = new Date().toLocaleString('vi-VN');
}

// Kick
init();
