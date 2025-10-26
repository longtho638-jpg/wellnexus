/*
  WellNexus • SEED Dashboard logic (ES Module)
  - Không dùng thư viện ngoài
  - Lưu trạng thái nhẹ bằng localStorage
  - Component hóa qua hàm render nhỏ, Tailwind cho layout
*/

const LS_KEYS = {
  THEME: 'wn:theme',
  TASKS: 'wn:seed:tasks',
  TIMEFRAME: 'wn:seed:timeframe',
  SEGMENT: 'wn:seed:segment',
  COMPLIANCE: 'wn:seed:compliance'
};

// ==========================
// Data mẫu (có thể thay thế bằng API sau này)
// ==========================
const sample = {
  metrics: {
    retentionRate: 0.56, // ≥ 0.50 là đạt mục tiêu SEED
    ltvToCAC: 5.8,       // mục tiêu > 5:1
    newNPP: 138,
    firstOrders: 92
  },
  spark: {
    retention: [48, 52, 54, 55, 57, 56, 58],
    ltv: [3.1, 4.2, 4.8, 5.0, 5.4, 5.7, 5.8],
    npp: [10, 18, 22, 19, 24, 21, 24],
    orders: [9, 11, 12, 15, 13, 14, 18]
  },
  tasks72h: [
    { id: 't1', label: 'Tạo danh sách 20 khách hàng tiềm năng', done: false },
    { id: 't2', label: 'Thực hiện 5 cuộc gọi giới thiệu', done: false },
    { id: 't3', label: 'Đăng bài social với nội dung mẫu đã phê duyệt', done: false },
    { id: 't4', label: 'Gửi form KYC + cam kết truyền thông', done: false },
    { id: 't5', label: 'Nhận đơn hàng đầu tiên', done: false }
  ],
  onboarding: [
    { id: 'ob1', name: 'Đào tạo nền tảng • 101', percent: 72 },
    { id: 'ob2', name: 'Gamified Onboarding • 30 ngày', percent: 54 },
    { id: 'ob3', name: 'Compliance & Truyền thông', percent: 61 }
  ],
  compliance: [
    { id: 'c1', label: 'Thông điệp KHÔNG ngụ ý chữa bệnh', ok: true },
    { id: 'c2', label: 'Hoa hồng ≥ 50% đến từ bán lẻ cho NTD', ok: true },
    { id: 'c3', label: 'Bài đăng dùng nội dung mẫu đã duyệt', ok: false }
  ],
  activity: [
    { id: 'a1', who: 'Mai Anh', what: 'đạt mốc 5 cuộc gọi/ngày', when: '-1h' },
    { id: 'a2', who: 'Quốc Huy', what: 'đơn hàng đầu tiên • 1.290.000đ', when: '-3h' },
    { id: 'a3', who: 'Thảo', what: 'hoàn thành “Kịch bản gọi 101”', when: '-6h' }
  ]
};

// ==========================
// Helpers
// ==========================
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

function pct(n) { return Math.round(n * 100); }

function saveLS(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
function loadLS(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}

// Tạo sparkline SVG từ mảng số
function sparkSVG(values, { width = 160, height = 48, pad = 4 } = {}) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const dx = (width - pad * 2) / (values.length - 1);
  const scaleY = (v) => {
    if (max === min) return height / 2;
    return height - pad - ((v - min) / (max - min)) * (height - pad * 2);
  };
  const pts = values.map((v, i) => `${pad + i * dx},${scaleY(v)}`).join(' ');
  return `
    <svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" aria-hidden="true" class="overflow-visible">
      <polyline points="${pts}" fill="none" stroke="currentColor" stroke-width="2" class="text-brand-600 dark:text-brand-400" />
    </svg>`;
}

// ==========================
// Renderers
// ==========================
function renderKPIs({ metrics, spark }) {
  const cards = [
    { key: 'retentionRate', label: 'Tỷ lệ giữ chân', fmt: (v) => pct(v) + '%', spark: spark.retention, help: 'Mục tiêu ≥ 50% cho SEED' },
    { key: 'ltvToCAC', label: 'LTV:CAC (NPP)', fmt: (v) => v.toFixed(1) + ':1', spark: spark.ltv, help: 'Mục tiêu > 5:1' },
    { key: 'newNPP', label: 'NPP mới', fmt: (v) => v, spark: spark.npp, help: 'Trong khung thời gian' },
    { key: 'firstOrders', label: 'Đơn hàng đầu tiên', fmt: (v) => v, spark: spark.orders, help: 'Số NPP có first-win' }
  ];
  const grid = $('#kpiGrid');
  grid.innerHTML = cards.map(c => `
    <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <header class="mb-3 flex items-center justify-between">
        <h4 class="text-xs font-medium text-slate-500">${c.label}</h4>
        <span class="text-[10px] text-slate-400">${c.help}</span>
      </header>
      <div class="flex items-end justify-between">
        <div>
          <div class="text-2xl font-semibold">${c.fmt(sample.metrics[c.key])}</div>
        </div>
        <div class="text-brand-600 dark:text-brand-400">${sparkSVG(c.spark)}</div>
      </div>
    </article>
  `).join('');
}

function renderTasks(tasks) {
  const list = $('#taskList');
  list.innerHTML = tasks.map(t => `
    <li class="flex items-start gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
      <input id="${t.id}" type="checkbox" ${t.done ? 'checked' : ''} class="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-600 dark:border-slate-700" />
      <label for="${t.id}" class="text-sm">${t.label}</label>
    </li>
  `).join('');

  const done = tasks.filter(t => t.done).length;
  $('#taskProgressText').textContent = `${done}/${tasks.length} hoàn thành`;

  // Lắng nghe thay đổi
  $$('input[type="checkbox"]', list).forEach(cb => {
    cb.addEventListener('change', () => {
      const idx = tasks.findIndex(t => t.id === cb.id);
      tasks[idx].done = cb.checked;
      saveLS(LS_KEYS.TASKS, tasks);
      renderTasks(tasks);
    });
  });
}

function renderOnboarding(items) {
  const wrap = $('#onboardingStats');
  wrap.innerHTML = items.map(it => `
    <div>
      <div class="mb-1 flex items-center justify-between text-xs">
        <span class="font-medium">${it.name}</span>
        <span>${it.percent}%</span>
      </div>
      <div class="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${it.percent}">
        <div class="h-2 rounded-full bg-brand-600" style="width:${it.percent}%"></div>
      </div>
    </div>
  `).join('');
}

function renderActivity(list) {
  const feed = $('#activityFeed');
  feed.innerHTML = list.map(a => `
    <li class="rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-800">
      <div class="flex items-center justify-between">
        <span><strong>${a.who}</strong> ${a.what}</span>
        <time class="text-xs text-slate-500">${a.when}</time>
      </div>
    </li>
  `).join('');
}

function renderCompliance(items) {
  const ul = $('#complianceList');
  ul.innerHTML = items.map(c => `
    <li class="flex items-center justify-between rounded-xl border p-3 text-sm ${c.ok ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20' : 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20'}">
      <span>${c.label}</span>
      <span class="text-xs ${c.ok ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}">${c.ok ? 'ĐẠT' : 'CẦN SỬA'}</span>
    </li>
  `).join('');
}

// ==========================
// State bootstrap
// ==========================
function init() {
  // Theme
  const savedTheme = loadLS(LS_KEYS.THEME);
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
  $('#themeToggle').addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    const mode = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    saveLS(LS_KEYS.THEME, mode);
  });

  // Timeframe
  const timeframeSel = $('#timeframe');
  timeframeSel.value = loadLS(LS_KEYS.TIMEFRAME, '30d');
  timeframeSel.addEventListener('change', () => {
    saveLS(LS_KEYS.TIMEFRAME, timeframeSel.value);
    // Hook: cập nhật số liệu theo timeframe nếu có API – hiện tại chỉ cập nhật nhãn
    document.title = `WellNexus • SEED Dashboard (${timeframeSel.value})`;
  });

  // KPI & sections
  renderKPIs(sample);
  const tasks = loadLS(LS_KEYS.TASKS, sample.tasks72h);
  renderTasks(tasks);
  renderOnboarding(sample.onboarding);
  const compliance = loadLS(LS_KEYS.COMPLIANCE, sample.compliance);
  renderCompliance(compliance);
  renderActivity(sample.activity);

  // Buttons
  $('#btnExport').addEventListener('click', () => {
    const payload = {
      timeframe: $('#timeframe').value,
      metrics: sample.metrics,
      tasks: loadLS(LS_KEYS.TASKS, sample.tasks72h),
      compliance: loadLS(LS_KEYS.COMPLIANCE, sample.compliance)
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: 'seed-export.json' });
    a.click();
    URL.revokeObjectURL(url);
  });

  $('#btnReset').addEventListener('click', () => {
    localStorage.removeItem(LS_KEYS.TASKS);
    localStorage.removeItem(LS_KEYS.COMPLIANCE);
    renderTasks(sample.tasks72h.map(t => ({ ...t, done: false })));
    renderCompliance(sample.compliance);
  });

  // Build time footer
  $('#buildTime').textContent = new Date().toLocaleString('vi-VN');
}

// Kick
init();
