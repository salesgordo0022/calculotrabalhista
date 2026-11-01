/* Cadra — app.js */
const views = {};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const navItems = $$('.nav-item');
const pageTitle = $('#pageTitle');
const pageHeading = $('#pageHeading');
const viewContainer = $('#viewContainer');

function setActiveNav(path) {
  navItems.forEach(el => {
    const href = el.getAttribute('href');
    el.classList.toggle('active', href === path);
  });
}

function setTitle(label) {
  pageTitle.textContent = label;
  pageHeading.textContent = label;
  document.title = label + ' · Cadra';
}

function html(str) {
  const t = document.createElement('template');
  t.innerHTML = str;
  return t.content.firstElementChild;
}

function mount(viewName) {
  const view = views[viewName];
  if (!view) return;
  viewContainer.innerHTML = '';
  const el = view.render();
  viewContainer.appendChild(el);
  if (view.mount) view.mount(el);
  el.classList.add('view');
}

function navigate() {
  const hash = location.hash.replace('#/', '') || 'dashboard';
  const path = '#/' + hash;
  setActiveNav(path);
  const viewName = hash.split('/')[0];
  setTitle(viewName.charAt(0).toUpperCase() + viewName.slice(1));
  mount(viewName);
}

window.addEventListener('hashchange', navigate);
window.addEventListener('load', navigate);

// Tema claro/escuro
const themeToggle = $('#themeToggle');
const root = document.documentElement;
function applyTheme(theme) {
  root.setAttribute('data-theme', theme);
  localStorage.setItem('cadra-theme', theme);
}
themeToggle.addEventListener('click', () => {
  const cur = root.getAttribute('data-theme') || 'light';
  applyTheme(cur === 'light' ? 'dark' : 'light');
});
const saved = localStorage.getItem('cadra-theme') || 'light';
applyTheme(saved);

/* ===== Helpers gráficos ===== */
function sparkline(canvas, points, color) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.parentElement.clientWidth || 300;
  const h = 44;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);
  if (points.length < 2) return;
  const minX = 0, maxX = w;
  const ys = points.map(p => p[1]);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const range = maxY - minY || 1;
  ctx.beginPath();
  points.forEach((p, i) => {
    const x = (p[0] / (points.length - 1)) * w;
    const y = h - ((p[1] - minY) / range) * (h - 6);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
}

/* ===== VIEW: dashboard ===== */
views.dashboard = {
  render() {
    return html(`
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-head">
            <div class="stat-label">Revenue this month</div>
            <span class="badge stat-tag tag-green"><span class="dot" style="background:var(--good);"></span> up 14%</span>
          </div>
          <div class="stat-value">$93,474</div>
          <div class="stat-sub">11 days in · on pace for $256k</div>
          <div class="stat-chart"><canvas id="revChart"></canvas></div>
        </div>
        <div class="stat-card">
          <div class="stat-head">
            <div class="stat-label">Bikes built (14 days)</div>
            <span class="badge stat-tag tag-green"><span class="dot" style="background:var(--sky);"></span> 3 so far today</span>
          </div>
          <div class="stat-value">57</div>
          <div class="stat-sub">down 2 pts from October</div>
          <div class="stat-chart"><canvas id="bikesChart"></canvas></div>
        </div>
        <div class="stat-card">
          <div class="stat-head">
            <div class="stat-label">Open order book</div>
            <span class="badge stat-tag tag-green"><span class="dot" style="background:var(--teal);"></span> 9 orders</span>
          </div>
          <div class="stat-value">$131,360</div>
          <div class="stat-sub">9 orders confirmed or building</div>
          <div class="stat-chart"><canvas id="orderChart"></canvas></div>
        </div>
        <div class="stat-card">
          <div class="stat-head">
            <div class="stat-label">On-time delivery</div>
            <span class="badge stat-tag tag-red"><span class="dot" style="background:var(--rose);"></span> down 2 pts</span>
          </div>
          <div class="stat-value">91%</div>
          <div class="stat-sub">down 2 pts from October</div>
          <div class="stat-chart"><canvas id="deliveryChart"></canvas></div>
        </div>
      </div>

      <div class="section-card">
        <div class="section-header">
          <h2>Cash on hand</h2>
          <div class="section-actions">
            <button class="btn-sm">Payments →</button>
            <button class="dropdown" aria-label="Filter">F</button>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th style="width:40%">Source</th><th>In</th><th>Out</th><th>Net</th></tr></thead>
            <tbody>
              <tr><td>October sales</td><td><span class="badge-pill badge-done">+$42,100</span></td><td>-</td><td><span class="badge-pill badge-done">+$42,100</span></td></tr>
              <tr><td>Bike frame order</td><td>-</td><td><span class="badge-pill badge-pending">-$18,400</span></td><td><span class="badge-pill badge-pending">-$18,400</span></td></tr>
              <tr><td>Parts restock</td><td>-</td><td><span class="badge-pill badge-pending">-$9,200</span></td><td><span class="badge-pill badge-pending">-$9,200</span></td></tr>
              <tr><td>Workshop rent</td><td>-</td><td><span class="badge-pill badge-late">-$3,600</span></td><td><span class="badge-pill badge-late">-$3,600</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="section-card" style="grid-column: 1 / -1;">
        <div class="section-header">
          <h2>Year at a glance</h2>
          <div class="section-actions">
            <button class="btn-sm">Revenue & cost</button>
            <button class="btn-sm">Bikes built</button>
            <button class="dropdown" aria-label="Year">2025 ▾</button>
          </div>
        </div>
        <div style="padding:22px; height:220px; position:relative;">
          <canvas id="yearChart" style="width:100%;height:100%;display:block;"></canvas>
        </div>
      </div>

      <div class="section-card">
        <div class="section-header">
          <h2>Sales funnel</h2>
          <div class="section-actions">
            <button class="btn-sm">Board →</button>
            <button class="dropdown" aria-label="View">Q3 ▾</button>
          </div>
        </div>
        <div class="sales-board">
          <div class="funnel-row"><span class="funnel-name">Quote</span><span class="funnel-value">$58,802</span></div>
          <div class="funnel-bar"><div class="funnel-fill" style="width:88%;background:var(--slate);" id="fillQuote"></div></div>
          <div class="funnel-row"><span class="funnel-name">Confirmed</span><span class="funnel-value">$16,040</span></div>
          <div class="funnel-bar"><div class="funnel-fill" style="width:32%;background:var(--sky);" id="fillConfirmed"></div></div>
          <div class="funnel-row"><span class="funnel-name">In production</span><span class="funnel-value">$108,992</span></div>
          <div class="funnel-bar"><div class="funnel-fill" style="width:65%;background:var(--teal);" id="fillProd"></div></div>
          <div class="funnel-row"><span class="funnel-name">Ready to ship</span><span class="funnel-value">$7,607</span></div>
          <div class="funnel-bar"><div class="funnel-fill" style="width:12%;background:var(--amber);" id="fillShip"></div></div>
          <div class="funnel-row"><span class="funnel-name">Shipped</span><span class="funnel-value">$10,014</span></div>
          <div class="funnel-bar"><div class="funnel-fill" style="width:18%;background:var(--good);" id="fillShipped"></div></div>
        </div>
      </div>

      <div class="section-card">
        <div class="section-header">
          <h2>On the floor today</h2>
          <div class="section-actions"><button class="btn-sm">Schedule →</button></div>
        </div>
        <div style="padding:0 22px 16px;">
          <div class="floor-row"><span class="name">Tube cutting</span><span class="code">WO-2041 · Commuter Seven-20</span><span class="pill pill-plan" title="Plan"></span><div class="progress-bar"><div class="fill fill-blue" style="width:70%"></div></div></div>
          <div class="floor-row"><span class="name">TIG welding</span><span class="code">WO-2042 · Tempo Road-48</span><span class="pill pill-actual" title="Actual"></span><div class="progress-bar"><div class="fill fill-teal" style="width:55%"></div></div></div>
          <div class="floor-row"><span class="name">Quality check</span><span class="code">WO-2043 · Mountain Trail-10</span><span class="pill pill-plan" title="Plan"></span><div class="progress-bar"><div class="fill fill-slate" style="width:40%"></div></div></div>
          <div class="floor-row"><span class="name">Paint coat</span><span class="code">WO-2044 · Mountain Gravel-12</span><span class="pill pill-actual" title="Actual"></span><div class="progress-bar"><div class="fill fill-amber" style="width:90%"></div></div></div>
          <div class="floor-row"><span class="name">Wheel build</span><span class="code">WO-2045 · Jumper Trail-16</span><span class="pill pill-plan" title="Plan"></span><div class="progress-bar"><div class="fill fill-blue" style="width:30%"></div></div></div>
        </div>
      </div>

      <div class="section-card" style="grid-column: 1 / -1;">
        <div class="section-header">
          <h2>Running low</h2>
          <div class="section-actions"><button class="btn-sm">Reorder →</button></div>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th style="width:34%">Part</th><th style="width:26%">SKU / note</th><th>On hand</th><th>On order</th></tr></thead>
            <tbody>
              <tr><td>Jungle Rimnest</td><td>LS-2049 · Rear 29"</td><td><span class="badge-pill badge-late">1</span></td><td><span class="badge-pill badge-pending">6</span></td></tr>
              <tr><td>Powder coat — Signal orange</td><td>PC-1102 · 15 kg can</td><td><span class="badge-pill badge-late">6</span></td><td><span class="badge-pill badge-pending">9</span></td></tr>
              <tr><td>CIDER hydraulic brakes (set)</td><td>BR-9081 · front</td><td><span class="badge-pill badge-late">9</span></td><td><span class="badge-pill badge-pending">3</span></td></tr>
              <tr><td>Jumper Trail</td><td>FK-4044 · knobby</td><td><span class="badge-pill badge-late">3</span></td><td><span class="badge-pill badge-pending">8</span></td></tr>
              <tr><td>Head-threaded bearings (set)</td><td>HB-2210 · ISO</td><td><span class="badge-pill badge-late">8</span></td><td><span class="badge-pill badge-pending">11</span></td></tr>
              <tr><td>After carbon fork</td><td>CF-3301 · 1 1/8"</td><td><span class="badge-pill badge-late">11</span></td><td><span class="badge-pill badge-pending">4</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="section-card">
        <div class="section-header">
          <h2>On the road</h2>
          <div class="section-actions"><button class="btn-sm">All →</button></div>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th style="width:10%">Ref</th><th style="width:30%">Customer</th><th style="width:30%">Shipment</th><th>Status</th></tr></thead>
            <tbody>
              <tr><td><span style="color:var(--sky)">●</span> RS</td><td>Rosewood Bikes · 7781 Oak Ave</td><td>Out for delivery · arrives today</td><td><span class="badge-pill badge-done">On time</span></td></tr>
              <tr><td><span style="color:var(--teal)">●</span> OT</td><td>Ortlieb · Via Malpensa</td><td>Exception · needs action</td><td><span class="badge-pill badge-late">Delayed</span></td></tr>
              <tr><td><span style="color:var(--amber)">●</span> SB</td><td>Saltmarsh Bicycle Co. · 2731 Dockside</td><td>In transit · 3 days</td><td><span class="badge-pill badge-done">On time</span></td></tr>
              <tr><td><span style="color:var(--rose)">●</span> GC</td><td>Gearhouse Collective · 84 Dock St</td><td>Ready for pickup · arrives in 4 days</td><td><span class="badge-pill badge-pending">Preparing</span></td></tr>
              <tr><td><span style="color:var(--slate)">●</span> TR</td><td>Two Rivers Cycle · 3793 Northlands TL</td><td>Packing · leaves in 2 days</td><td><span class="badge-pill badge-pending">Packing</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="section-card" style="grid-column: 1 / -1;">
        <div class="section-header">
          <h2>Team today</h2>
          <div class="section-actions"><button class="btn-sm">Attendance →</button></div>
        </div>
        <div class="team-wrap">
          <div style="font-size:12px;color:var(--muted);margin-bottom:8px;">20 of 22 working</div>
          <div class="team-strip">
            <div class="team-member present" title="Present">AD</div>
            <div class="team-member present" title="Present">JM</div>
            <div class="team-member present" title="Present">KS</div>
            <div class="team-member present" title="Present">EL</div>
            <div class="team-member present" title="Present">RS</div>
            <div class="team-member away" title="Away">L1</div>
            <div class="team-member away" title="Away">R2</div>
            <div class="team-member on" title="On leave">L3</div>
            <div class="team-member off" title="Day off">D1</div>
            <div class="team-member late" title="Late">LM</div>
          </div>
          <div style="font-size:11px;color:var(--faint);margin-top:6px;">Present 17 · Away 2 · On leave 1 · Day off 1 · Late 1</div>
        </div>
      </div>

      <div class="section-card" style="grid-column: 1 / -1;">
        <div class="section-header">
          <h2>Activity</h2>
          <div class="section-actions"><span class="live-dot" style="margin-right:6px;"></span><span style="font-size:11px;color:var(--muted);">LIVE</span></div>
        </div>
        <div class="activity-list">
          <div class="activity-item"><div class="activity-avatar">JB</div><div class="activity-body"><div class="act-name">Jonas Berger</div><div class="act-text">started Powder coat on WO-2041 (Bridgestone ×12)</div></div><div class="activity-time">5 h ago</div></div>
          <div class="activity-item"><div class="activity-avatar">IM</div><div class="activity-body"><div class="act-name">Inga Nagel</div><div class="act-text">sold ×10-RT to the showroom — <span class="act-amount">$798.00</span></div></div><div class="activity-time">3 h ago</div></div>
          <div class="activity-item"><div class="activity-avatar">TS</div><div class="activity-body"><div class="act-name">Tamás Silver</div><div class="act-text">gave 20 followers against PO-3207</div></div><div class="activity-time">2 h ago</div></div>
          <div class="activity-item"><div class="activity-avatar">IE</div><div class="activity-body"><div class="act-name">Inez Morales</div><div class="act-text">sold Ridgeline Gravel to Jordans Elbis — <span class="act-amount">$3,962.10</span></div></div><div class="activity-time">1 h ago</div></div>
          <div class="activity-item"><div class="activity-avatar">ED</div><div class="activity-body"><div class="act-name">Edil Derrar</div><div class="act-text">sent a quote $3,232 to Saltmarsh Bicycle Co.</div></div><div class="activity-time">45 min ago</div></div>
          <div class="activity-item"><div class="activity-avatar">NP</div><div class="activity-body"><div class="act-name">Nor Park</div><div class="act-text">flagged SHP-7791 — had to customs in Blaine</div></div><div class="activity-time">22 min ago</div></div>
          <div class="activity-item"><div class="activity-avatar">PR</div><div class="activity-body"><div class="act-name">Priya Raman</div><div class="act-text">recorded a $4,320.00 payment from Lunebike Studio</div></div><div class="activity-time">7 min ago</div></div>
        </div>
      </div>
    `);
  },
  mount(el) {
    const charts = [
      { id: 'revChart', pts: [[0,28],[1,22],[2,30],[3,26],[4,34],[5,40],[6,38],[7,44],[8,52],[9,48],[10,56],[11,50]], color: 'var(--sky)' },
      { id: 'bikesChart', pts: [[0,3],[1,2],[2,4],[3,3],[4,5],[3,6],[2,5],[3,7],[4,8],[3,6],[4,7],[3,5]], color: 'var(--coral)' },
      { id: 'orderChart', pts: [[0,42],[1,38],[2,45],[3,48],[4,52],[5,56],[6,54],[7,60],[8,64],[9,58],[10,62],[11,56]], color: 'var(--teal)' },
      { id: 'deliveryChart', pts: [[0,92],[1,91],[2,89],[3,90],[4,88],[5,91],[6,89],[7,92],[8,90],[9,91],[10,89],[11,91]], color: 'var(--rose)' },
    ];
    charts.forEach(c => {
      const canvas = el.querySelector('#' + c.id);
      if (canvas) sparkline(canvas, c.pts, getComputedStyle(document.documentElement).getPropertyValue(c.color).trim() || c.color);
    });
    // Animate funnel fills
    setTimeout(() => {
      $$('.funnel-fill', el).forEach(f => {
        const w = f.style.width;
        f.style.width = '0%';
        setTimeout(() => { f.style.width = w; }, 50);
      });
    }, 100);
  }
};

/* ===== VIEW genérica para outras páginas ===== */
function genericView(title, subtitle, rows) {
  return {
    render() {
      return html(`
        <div class="page-scaffold">
          <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:20px;">
            <div>
              <h2 style="font-size:17px;font-weight:700;color:var(--ink);">${title}</h2>
              <div style="font-size:12.5px;color:var(--muted);">${subtitle}</div>
            </div>
            <button class="btn-sm" style="margin-left:auto;">Export →</button>
          </div>
          <div class="section-card">
            <div class="table-wrap">
              <table>
                <thead><tr>${rows.headers.map(h => '<th>' + h + '</th>').join('')}</tr></thead>
                <tbody>
                  ${rows.data.map(r => '<tr>' + r.map(c => '<td>' + c + '</td>').join('') + '</tr>').join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `);
    },
    mount() {}
  };
}

views.sales = genericView('Pipeline', 'Open quotes and orders across all channels', {
  headers: ['Quote', 'Customer', 'Value', 'Stage', 'Expected'],
  data: [
    ['QT-4401', 'Rosewood Bikes', '$12,400', 'Confirmed', 'Nov 14'],
    ['QT-4402', 'Saltmarsh Bicycle Co.', '$8,900', 'Quote', 'Nov 18'],
    ['QT-4403', 'Ortlieb', '$4,200', 'In production', 'Nov 22'],
    ['QT-4404', 'Gearhouse Collective', '$19,600', 'Ready to ship', 'Nov 12'],
    ['QT-4405', 'Two Rivers Cycle', '$6,100', 'Shipped', 'Nov 8'],
  ]
});

views.manufacturing = genericView('Scheduling', 'Work orders and production line status', {
  headers: ['Order', 'Product', 'Qty', 'Stage', 'Due'],
  data: [
    ['WO-2041', 'Commuter Seven-20', '12', 'Tube cutting', 'Nov 14'],
    ['WO-2042', 'Tempo Road-48', '8', 'TIG welding', 'Nov 16'],
    ['WO-2043', 'Mountain Trail-10', '6', 'Quality check', 'Nov 18'],
    ['WO-2044', 'Mountain Gravel-12', '10', 'Paint coat', 'Nov 20'],
    ['WO-2045', 'Jumper Trail-16', '4', 'Wheel build', 'Nov 22'],
  ]
});

views.stock = genericView('Stock', 'Inventory levels and low-stock alerts', {
  headers: ['Part', 'SKU', 'On hand', 'Min', 'Status'],
  data: [
    ['Jungle Rimnest', 'LS-2049', '1', '6', 'Low'],
    ['Powder coat — Signal orange', 'PC-1102', '6', '10', 'Low'],
    ['CIDER hydraulic brakes', 'BR-9081', '9', '12', 'Low'],
    ['Jumper Trail', 'FK-4044', '3', '8', 'Low'],
    ['Head-threaded bearings', 'HB-2210', '8', '14', 'Low'],
  ]
});

views.accounting = genericView('Accounting', 'Invoices, bills and payment runs', {
  headers: ['Invoice', 'Customer', 'Amount', 'Due', 'Status'],
  data: [
    ['INV-8810', 'Rosewood Bikes', '$4,200.00', 'Nov 10', 'Overdue'],
    ['INV-8811', 'Saltmarsh Bicycle Co.', '$1,950.00', 'Nov 14', 'Open'],
    ['INV-8812', 'Ortlieb', '$3,100.00', 'Nov 18', 'Open'],
    ['INV-8813', 'Gearhouse Collective', '$6,400.00', 'Nov 22', 'Open'],
    ['INV-8814', 'Two Rivers Cycle', '$1,200.00', 'Nov 8', 'Paid'],
  ]
});

views.hr = genericView('HR', 'Time-off requests and team attendance', {
  headers: ['Employee', 'Request', 'From', 'To', 'Status'],
  data: [
    ['Noor Haddad', 'Vacation', 'Nov 20', 'Nov 24', 'Pending'],
    ['Inga Nagel', 'Sick leave', 'Nov 12', 'Nov 12', 'Approved'],
    ['Jonas Berger', 'Vacation', 'Dec 1', 'Dec 5', 'Pending'],
    ['Tamás Silver', 'Personal', 'Nov 15', 'Nov 15', 'Approved'],
    ['Inez Morales', 'Vacation', 'Dec 10', 'Dec 14', 'Pending'],
  ]
});

views.reporting = genericView('Reporting', 'Sales, manufacturing and financial reports', {
  headers: ['Report', 'Period', 'Last run', 'Format', 'Action'],
  data: [
    ['Monthly sales', 'October 2025', 'Nov 1, 9:00 AM', 'PDF', 'View'],
    ['Production output', 'October 2025', 'Nov 1, 8:45 AM', 'CSV', 'View'],
    ['Stock valuation', 'Current', 'Oct 31, 5:00 PM', 'PDF', 'View'],
    ['Aging report', 'Current', 'Oct 30, 4:20 PM', 'CSV', 'View'],
  ]
});
