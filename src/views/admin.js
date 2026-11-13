'use strict';

const { CATEGORIES, STATUSES, STATES, CHART_COLORS } = require('../config');
const { icon, statusBadge, statusLabel, priorityBadge, categoryMeta, pagination, emptyState } = require('./layout');
const { escapeHtml, formatDate, formatDateTime, timeAgo, inr, formatBytes, maskEmail } = require('../util');
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function dateOrRaw(value) {
  if (!value) return '—';
  const d = new Date(value + 'T00:00:00');
  if (isNaN(d.getTime())) return String(value);
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

const STATUS_TONE = Object.fromEntries(STATUSES.map((s) => [s.id, s.tone]));

function adminShell({ title, active, admin, body, wide = false }) {
  const nav = [
    { href: '/admin', label: 'Dashboard', ico: 'dashboard', key: 'dashboard' },
    { href: '/admin/complaints', label: 'Complaints', ico: 'list', key: 'complaints' },
    { href: '/admin/analytics', label: 'Analytics', ico: 'trend', key: 'analytics' },
  ];
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} | NCRP Officer Console</title>
  <meta name="robots" content="noindex,nofollow">
  <link rel="icon" href="/img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body class="admin-body">
  <a class="skip-link" href="#adminMain">Skip to main content</a>
  <div class="admin-layout">
    <aside class="admin-side" id="adminSide">
      <div class="admin-brand">
        <img src="/img/emblem.png" alt="" width="30" height="48">
        <div><strong>NCRP Console</strong><span>Officer access</span></div>
      </div>
      <nav class="admin-nav" aria-label="Officer console">
        ${nav.map((n) => `<a href="${n.href}" class="admin-nav-link ${active === n.key ? 'is-active' : ''}">${icon(n.ico, 18)}<span>${n.label}</span></a>`).join('')}
        <div class="admin-nav-sep">Citizen portal</div>
        <a href="/" class="admin-nav-link">${icon('globe', 18)}<span>Public website</span></a>
      </nav>
      <div class="admin-side-foot">
        <div class="admin-user">
          <span class="admin-avatar">${escapeHtml((admin.name || 'O').split(' ').map((p) => p[0]).slice(-2).join(''))}</span>
          <div><strong>${escapeHtml(admin.name)}</strong><span>${escapeHtml(admin.unit || 'Cyber Crime Unit')}</span></div>
        </div>
        <a class="admin-logout" href="/admin/logout">${icon('logout', 16)} Sign out</a>
      </div>
    </aside>
    <div class="admin-main-wrap">
      <header class="admin-topbar">
        <button class="admin-menu-btn" id="adminMenuBtn" aria-label="Toggle menu" aria-expanded="false">${icon('menu', 20)}</button>
        <div class="admin-crumbs">${escapeHtml(title)}</div>
        <div class="admin-topbar-right">
          <span class="admin-env">${icon('info', 14)} Prototype environment</span>
          <span class="admin-dot" title="Online"></span>
        </div>
      </header>
      <main class="admin-main ${wide ? 'admin-main-wide' : ''}" id="adminMain">${body}</main>
    </div>
  </div>
  <script src="/js/admin.js" defer></script>
</body>
</html>`;
}

function loginPage({ error = '', username = '', demo = true }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Officer Login | NCRP Console</title>
  <meta name="robots" content="noindex,nofollow">
  <link rel="icon" href="/img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body class="login-body">
  <div class="login-shell">
    <div class="login-brand">
      <img src="/img/emblem.png" alt="State Emblem of India" width="52" height="83">
      <h1>National Cyber Crime<br>Reporting Portal</h1>
      <p>Officer Console · Authorised personnel only</p>
      <div class="login-badges">
        <span>${icon('lock', 14)} Signed sessions</span>
        <span>${icon('user', 14)} Role-based access</span>
        <span>${icon('file', 14)} Audit trail</span>
      </div>
      <a class="login-back" href="/">${icon('arrowLeft', 15)} Back to citizen portal</a>
    </div>
    <div class="login-card-wrap">
      <div class="login-card">
        <div class="login-card-head">
          <span class="login-ico">${icon('lock', 22)}</span>
          <div><h2>Officer sign in</h2><p>Enter your department credentials</p></div>
        </div>
        ${error ? `<div class="alert alert-error">${icon('alert', 18)}<div class="alert-body">${escapeHtml(error)}</div></div>` : ''}
        <form method="post" action="/admin/login" class="login-form">
          <div class="field">
            <label for="username">Username / Officer ID</label>
            <input id="username" name="username" value="${escapeHtml(username)}" required autocomplete="username" placeholder="e.g. admin">
          </div>
          <div class="field">
            <label for="password">Password</label>
            <div class="pw-wrap">
              <input id="password" name="password" type="password" required autocomplete="current-password" placeholder="Enter password">
              <button type="button" class="pw-toggle" aria-label="Show password" data-pw-toggle>${icon('eye', 17)}</button>
            </div>
          </div>
          <button class="btn btn-primary btn-block" type="submit">${icon('logout', 16)} Sign in securely</button>
        </form>
        ${demo ? `<div class="login-demo">
          <strong>${icon('info', 14)} Demo credentials</strong>
          <table>
            <tr><td>Administrator</td><td><code>admin</code> / <code>Admin@1930</code></td></tr>
            <tr><td>Officer</td><td><code>officer</code> / <code>Officer@1930</code></td></tr>
          </table>
          <span>Change these via the ADMIN_PASSWORD environment variable before deploying publicly.</span>
        </div>` : ''}
      </div>
      <p class="login-foot">This is a demonstration prototype. All records are fictitious.</p>
    </div>
  </div>
</body>
</html>`;
}

function donutChart(byStatus, total) {
  const items = STATUSES.map((s) => ({ ...s, value: byStatus[s.id] || 0 }));
  const size = 168;
  const r = 64;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const segments = items
    .filter((i) => i.value > 0)
    .map((i) => {
      const frac = i.value / Math.max(1, total);
      const dash = frac * circ;
      const seg = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--tone-${i.tone === 'slate' ? 'slate' : i.tone})" stroke-width="20"
        stroke-dasharray="${dash} ${circ - dash}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${cx} ${cy})"/>`;
      offset += dash;
      return seg;
    })
    .join('');
  const legend = items
    .map((i) => `<li><span class="dot" style="background:var(--tone-${i.tone === 'slate' ? 'slate' : i.tone})"></span><span class="legend-label">${i.label}</span><strong>${i.value}</strong></li>`)
    .join('');
  return `<div class="donut-wrap">
    <div class="donut">
      <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="Complaints by status">
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--line)" stroke-width="20"/>
        ${segments}
        <text x="${cx}" y="${cy - 2}" text-anchor="middle" class="donut-total">${total}</text>
        <text x="${cx}" y="${cy + 16}" text-anchor="middle" class="donut-label">complaints</text>
      </svg>
    </div>
    <ul class="donut-legend">${legend}</ul>
  </div>`;
}

function barChart(byCategory, total) {
  const rows = CATEGORIES.map((c, i) => ({ label: c.short, value: byCategory[c.id] || 0, color: CHART_COLORS[i % CHART_COLORS.length] }))
    .sort((a, b) => b.value - a.value);
  const max = Math.max(1, ...rows.map((r) => r.value));
  return `<div class="bars">
    ${rows.map((r) => `
      <div class="bar-row">
        <span class="bar-label">${escapeHtml(r.label)}</span>
        <span class="bar-track"><span class="bar-fill" style="width:${(r.value / max) * 100}%; background:${r.color}"></span></span>
        <span class="bar-value">${r.value}</span>
      </div>`).join('')}
  </div>`;
}

function sparkline(series) {
  const w = 620;
  const h = 120;
  const pad = 6;
  const max = Math.max(1, ...series.map((s) => s.count));
  const step = (w - pad * 2) / Math.max(1, series.length - 1);
  const pts = series.map((s, i) => [pad + i * step, h - pad - (s.count / max) * (h - pad * 2)]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${h - pad} L${pad},${h - pad} Z`;
  return `<div class="spark">
    <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="Complaints per day, last 30 days">
      <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0e7490" stop-opacity=".28"/><stop offset="100%" stop-color="#0e7490" stop-opacity="0"/>
      </linearGradient></defs>
      <path d="${area}" fill="url(#sg)"/>
      <path d="${line}" fill="none" stroke="#0e7490" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    </svg>
    <div class="spark-axis"><span>${formatDate(series[0].date)}</span><span>Today</span></div>
  </div>`;
}

function dashboardPage({ admin, stats, recent, alerts }) {
  const kpis = [
    { label: 'Total complaints', value: stats.total, delta: `+${stats.last7} this week`, ico: 'file', tone: 'blue' },
    { label: 'Awaiting action', value: (stats.byStatus.submitted || 0) + (stats.byStatus['under-review'] || 0), delta: 'Submitted + under review', ico: 'clock', tone: 'amber' },
    { label: 'Under investigation', value: (stats.byStatus.investigation || 0) + (stats.byStatus['action-taken'] || 0), delta: 'Active cases', ico: 'search', tone: 'violet' },
    { label: 'Closed', value: stats.byStatus.closed || 0, delta: 'Resolved & disposed', ico: 'check', tone: 'green' },
    { label: 'Amount at stake', value: inr(stats.amount), delta: 'Across all complaints', ico: 'wallet', tone: 'rose' },
    { label: 'Avg. handling time', value: '3.4 days', delta: 'Prototype workflow', ico: 'clock', tone: 'teal' },
  ];

  const recentRows = recent.map((c) => `
    <tr>
      <td><a class="tbl-link" href="/admin/complaints/${c.id}">${escapeHtml(c.complaintNo)}</a></td>
      <td><span class="tbl-main">${escapeHtml(c.complainant.name)}</span><span class="tbl-sub">${escapeHtml(c.complainant.district)}, ${escapeHtml(c.complainant.state)}</span></td>
      <td>${escapeHtml(c.categoryLabel)}</td>
      <td>${statusBadge(c.status, { small: true })}</td>
      <td>${priorityBadge(c.priority)}</td>
      <td class="tbl-num">${inr(c.incident.amountLost)}</td>
      <td class="tbl-time">${timeAgo(c.createdAt)}</td>
    </tr>`).join('');

  const body = `
  <div class="admin-pagehead">
    <div>
      <h1>Good to see you, ${escapeHtml(admin.name.split(' ').slice(-1)[0])}</h1>
      <p>Workload overview for ${escapeHtml(admin.unit || 'the cyber crime unit')} · ${formatDate(new Date().toISOString())}</p>
    </div>
    <div class="admin-pagehead-actions">
      <a class="btn btn-outline btn-sm" href="/admin/complaints">${icon('list', 15)} Open register</a>
      <a class="btn btn-primary btn-sm" href="/admin/export.csv">${icon('download', 15)} Export CSV</a>
    </div>
  </div>

  <div class="kpi-grid">
    ${kpis.map((k) => `
      <div class="kpi-card">
        <span class="kpi-ico tone-${k.tone}">${icon(k.ico, 20)}</span>
        <div class="kpi-body"><span class="kpi-value">${k.value}</span><span class="kpi-label">${k.label}</span><span class="kpi-delta">${k.delta}</span></div>
      </div>`).join('')}
  </div>

  <div class="admin-grid-2">
    <div class="panel">
      <div class="panel-head"><h2>${icon('trend', 17)} Complaints per day</h2><span class="panel-tag">Last 30 days</span></div>
      <div class="panel-body">${sparkline(stats.series)}</div>
    </div>
    <div class="panel">
      <div class="panel-head"><h2>${icon('dashboard', 17)} By status</h2></div>
      <div class="panel-body">${donutChart(stats.byStatus, stats.total)}</div>
    </div>
  </div>

  <div class="admin-grid-2">
    <div class="panel">
      <div class="panel-head"><h2>${icon('grid', 17)} By category</h2></div>
      <div class="panel-body">${barChart(stats.byCategory, stats.total)}</div>
    </div>
    <div class="panel">
      <div class="panel-head"><h2>${icon('alert', 17)} Needs attention</h2></div>
      <div class="panel-body">
        ${alerts.length ? `<ul class="alert-list">
          ${alerts.map((c) => `
            <li>
              <span class="alert-dot pri-${c.priority}"></span>
              <div><a href="/admin/complaints/${c.id}"><strong>${escapeHtml(c.complaintNo)}</strong></a>
              <span>${escapeHtml(c.categoryLabel)} · ${inr(c.incident.amountLost)} · ${priorityBadge(c.priority)}</span></div>
              <span class="alert-age">${timeAgo(c.createdAt)}</span>
            </li>`).join('')}
        </ul>` : '<p class="muted-sm">No high-priority complaints awaiting action.</p>'}
      </div>
    </div>
  </div>

  <div class="panel">
    <div class="panel-head"><h2>${icon('list', 17)} Latest complaints</h2><a class="panel-link" href="/admin/complaints">View all ${icon('arrowRight', 14)}</a></div>
    <div class="table-wrap">
      <table class="data-table">
        <thead><tr><th>Complaint No.</th><th>Complainant</th><th>Category</th><th>Status</th><th>Priority</th><th class="tbl-num">Amount</th><th>Filed</th></tr></thead>
        <tbody>${recentRows}</tbody>
      </table>
    </div>
  </div>`;

  return adminShell({ title: 'Dashboard', active: 'dashboard', admin, body, wide: true });
}

function complaintsPage({ admin, result, filters, states }) {
  const rows = result.rows.map((c) => `
    <tr>
      <td><a class="tbl-link" href="/admin/complaints/${c.id}">${escapeHtml(c.complaintNo)}</a></td>
      <td><span class="tbl-main">${escapeHtml(c.complainant.name)}</span><span class="tbl-sub">${escapeHtml(c.complainant.mobile)}</span></td>
      <td>${escapeHtml(c.categoryLabel)}</td>
      <td>${escapeHtml(c.complainant.state)}</td>
      <td>${statusBadge(c.status, { small: true })}</td>
      <td>${priorityBadge(c.priority)}</td>
      <td class="tbl-num">${inr(c.incident.amountLost)}</td>
      <td class="tbl-time">${formatDate(c.createdAt)}</td>
      <td class="tbl-actions"><a class="icon-btn" href="/admin/complaints/${c.id}" title="Open case">${icon('chevronRight', 16)}</a></td>
    </tr>`).join('');

  const statusOptions = [{ value: '', label: 'All statuses' }, ...STATUSES.map((s) => ({ value: s.id, label: s.label }))];
  const catOptions = [{ value: '', label: 'All categories' }, ...CATEGORIES.map((c) => ({ value: c.id, label: c.label }))];
  const stateOptions = [{ value: '', label: 'All states' }, ...states.map((s) => ({ value: s, label: s }))];

  const body = `
  <div class="admin-pagehead">
    <div><h1>Complaint register</h1><p>${result.total} record${result.total === 1 ? '' : 's'} match the current filters</p></div>
    <div class="admin-pagehead-actions"><a class="btn btn-primary btn-sm" href="/admin/export.csv">${icon('download', 15)} Export CSV</a></div>
  </div>

  <form class="filter-bar" method="get" action="/admin/complaints">
    <div class="filter-search">
      ${icon('search', 16)}
      <input name="q" value="${escapeHtml(filters.q)}" placeholder="Search by complaint no., name, mobile, district, keyword…">
    </div>
    <div class="filter-select"><select name="status">${statusOptions.map((o) => `<option value="${o.value}" ${filters.status === o.value ? 'selected' : ''}>${escapeHtml(o.label)}</option>`).join('')}</select>${icon('chevronDown', 14)}</div>
    <div class="filter-select"><select name="category">${catOptions.map((o) => `<option value="${o.value}" ${filters.category === o.value ? 'selected' : ''}>${escapeHtml(o.label)}</option>`).join('')}</select>${icon('chevronDown', 14)}</div>
    <div class="filter-select"><select name="state">${stateOptions.map((o) => `<option value="${o.value}" ${filters.state === o.value ? 'selected' : ''}>${escapeHtml(o.label)}</option>`).join('')}</select>${icon('chevronDown', 14)}</div>
    <div class="filter-select"><select name="priority">${[{ value: '', label: 'Any priority' }, { value: 'critical', label: 'Critical' }, { value: 'high', label: 'High' }, { value: 'normal', label: 'Normal' }].map((o) => `<option value="${o.value}" ${filters.priority === o.value ? 'selected' : ''}>${o.label}</option>`).join('')}</select>${icon('chevronDown', 14)}</div>
    <div class="filter-select"><select name="sort">${[{ value: 'newest', label: 'Newest first' }, { value: 'oldest', label: 'Oldest first' }, { value: 'amount', label: 'Highest amount' }, { value: 'updated', label: 'Recently updated' }].map((o) => `<option value="${o.value}" ${filters.sort === o.value ? 'selected' : ''}>${o.label}</option>`).join('')}</select>${icon('chevronDown', 14)}</div>
    <button class="btn btn-primary btn-sm" type="submit">${icon('filter', 15)} Apply</button>
    <a class="btn btn-ghost btn-sm" href="/admin/complaints">Reset</a>
  </form>

  <div class="panel">
    ${result.rows.length ? `<div class="table-wrap">
      <table class="data-table">
        <thead><tr><th>Complaint No.</th><th>Complainant</th><th>Category</th><th>State</th><th>Status</th><th>Priority</th><th class="tbl-num">Amount</th><th>Filed</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>` : emptyState({ icon: 'search', title: 'No complaints match', text: 'Try clearing the search or widening the filters.' })}
    <div class="panel-foot">
      <span class="muted-sm">Page ${result.page} of ${result.pages}</span>
      ${pagination({ page: result.page, pages: result.pages, base: '/admin/complaints', query: { q: filters.q, status: filters.status, category: filters.category, state: filters.state, priority: filters.priority, sort: filters.sort } })}
    </div>
  </div>`;

  return adminShell({ title: 'Complaints', active: 'complaints', admin, body, wide: true });
}

function complaintDetailPage({ admin, c, flash }) {
  const cat = categoryMeta(c.category);
  const attachments = c.attachments || [];
  const timeline = c.timeline.slice().reverse().map((t) => `
    <li class="tl-item ${t === c.timeline.slice().reverse()[0] ? 'is-latest' : ''}">
      <span class="tl-dot"></span>
      <div class="tl-body">
        <div class="tl-head"><strong>${statusLabel(t.status)}</strong><span class="tl-time">${formatDateTime(t.at)}</span></div>
        <p>${escapeHtml(t.note)}</p>
        <span class="tl-by">${icon('user', 13)} ${escapeHtml(t.by || 'System')}</span>
      </div>
    </li>`).join('');

  const evCards = attachments.length
    ? attachments.map((a) => {
        const isImage = (a.mime || '').startsWith('image/');
        return `<div class="ev-card">
          <a class="ev-thumb" href="${escapeHtml(a.url)}" target="_blank" rel="noopener">
            ${isImage ? `<img src="${escapeHtml(a.url)}" alt="${escapeHtml(a.originalName)}" loading="lazy">` : `<span class="ev-file-ico">${icon('file', 30)}</span>`}
          </a>
          <div class="ev-meta">
            <strong title="${escapeHtml(a.originalName)}">${escapeHtml(a.originalName)}</strong>
            <span>${formatBytes(a.size)} · ${escapeHtml(a.mime || 'file')}${a.seeded ? ' · sample' : ''}</span>
            <a href="${escapeHtml(a.url)}" download="${escapeHtml(a.originalName)}">${icon('download', 13)} Download</a>
          </div>
        </div>`;
      }).join('')
    : `<p class="muted-sm">No evidence attached.</p>`;

  const body = `
  <a class="admin-back" href="/admin/complaints">${icon('arrowLeft', 15)} Back to register</a>
  ${flash ? `<div class="alert alert-success">${icon('check', 18)}<div class="alert-body">${escapeHtml(flash)}</div></div>` : ''}

  <div class="admin-pagehead admin-pagehead-detail">
    <div>
      <div class="detail-title-row">
        <h1>${escapeHtml(c.complaintNo)}</h1>
        ${statusBadge(c.status)} ${priorityBadge(c.priority)}
      </div>
      <p>Filed ${formatDateTime(c.createdAt)} · Last updated ${timeAgo(c.updatedAt)} · ${escapeHtml(cat.label)}${c.firNo ? ` · FIR ${escapeHtml(c.firNo)}` : ''}</p>
    </div>
    <div class="admin-pagehead-actions">
      <button class="btn btn-outline btn-sm" data-print>${icon('print', 15)} Print</button>
    </div>
  </div>

  <div class="detail-layout">
    <div class="detail-main">
      <div class="panel">
        <div class="panel-head"><h2>${icon('user', 17)} Complainant details</h2></div>
        <div class="panel-body">
          <dl class="detail-dl">
            <div><dt>Full name</dt><dd>${escapeHtml(c.complainant.name)}</dd></div>
            <div><dt>Mobile</dt><dd>${escapeHtml(c.complainant.mobile)}</dd></div>
            <div><dt>Email</dt><dd>${escapeHtml(c.complainant.email)}</dd></div>
            <div><dt>Identity</dt><dd>${escapeHtml(c.complainant.idType)} · …${escapeHtml(String(c.complainant.idNumber || '').slice(-4))}</dd></div>
            <div><dt>Address</dt><dd>${escapeHtml(c.complainant.address || '—')}</dd></div>
            <div><dt>District / State</dt><dd>${escapeHtml(c.complainant.district)}, ${escapeHtml(c.complainant.state)} — ${escapeHtml(c.complainant.pincode || '')}</dd></div>
          </dl>
        </div>
      </div>

      <div class="panel">
        <div class="panel-head"><h2>${icon('file', 17)} Incident</h2></div>
        <div class="panel-body">
          <dl class="detail-dl detail-dl-3">
            <div><dt>Category</dt><dd>${escapeHtml(cat.label)}</dd></div>
            <div><dt>Date / time</dt><dd>${escapeHtml(dateOrRaw(c.incident.date))}${c.incident.time ? ' at ' + escapeHtml(c.incident.time) : ''}</dd></div>
            <div><dt>Amount lost</dt><dd>${c.incident.amountLost ? inr(c.incident.amountLost) : 'No financial loss'}</dd></div>
          </dl>
          <div class="desc-block">
            <h3>Description</h3>
            <p>${escapeHtml(c.incident.description)}</p>
          </div>
          ${c.suspect && (c.suspect.platform || c.suspect.url || c.suspect.phone || c.suspect.account || c.suspect.wallet) ? `
          <div class="desc-block">
            <h3>Suspect / platform identifiers</h3>
            <dl class="detail-dl detail-dl-3">
              ${c.suspect.platform ? `<div><dt>Platform</dt><dd>${escapeHtml(c.suspect.platform)}</dd></div>` : ''}
              ${c.suspect.phone ? `<div><dt>Phone</dt><dd>${escapeHtml(c.suspect.phone)}</dd></div>` : ''}
              ${c.suspect.url ? `<div><dt>URL / handle</dt><dd class="break">${escapeHtml(c.suspect.url)}</dd></div>` : ''}
              ${c.suspect.account ? `<div><dt>Bank / UPI</dt><dd class="break">${escapeHtml(c.suspect.account)}</dd></div>` : ''}
              ${c.suspect.wallet ? `<div><dt>Wallet</dt><dd class="break">${escapeHtml(c.suspect.wallet)}</dd></div>` : ''}
            </dl>
          </div>` : ''}
        </div>
      </div>

      <div class="panel">
        <div class="panel-head"><h2>${icon('file', 17)} Evidence</h2><span class="panel-tag">${attachments.length} file(s)</span></div>
        <div class="panel-body"><div class="ev-grid">${evCards}</div></div>
      </div>

      <div class="panel">
        <div class="panel-head"><h2>${icon('clock', 17)} Case timeline</h2></div>
        <div class="panel-body"><ul class="timeline">${timeline}</ul></div>
      </div>
    </div>

    <aside class="detail-side">
      <div class="panel panel-accent">
        <div class="panel-head"><h2>${icon('refresh', 17)} Update case</h2></div>
        <div class="panel-body">
          <form method="post" action="/admin/complaints/${c.id}/status" class="stack-form">
            <div class="field">
              <label for="a-status">Status</label>
              <div class="select-wrap">
                <select id="a-status" name="status">${STATUSES.map((s) => `<option value="${s.id}" ${c.status === s.id ? 'selected' : ''}>${s.label}</option>`).join('')}</select>
                ${icon('chevronDown', 15)}
              </div>
            </div>
            <div class="field">
              <label for="a-priority">Priority</label>
              <div class="select-wrap">
                <select id="a-priority" name="priority">${[['normal', 'Normal'], ['high', 'High'], ['critical', 'Critical']].map(([v, l]) => `<option value="${v}" ${c.priority === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
                ${icon('chevronDown', 15)}
              </div>
            </div>
            <div class="field">
              <label for="a-assigned">Assigned officer</label>
              <input id="a-assigned" name="assignedTo" value="${escapeHtml(c.assignedTo || '')}" placeholder="e.g. SI A. Chatterjee">
            </div>
            <div class="field">
              <label for="a-fir">Reference FIR no.</label>
              <input id="a-fir" name="firNo" value="${escapeHtml(c.firNo || '')}" placeholder="Optional">
            </div>
            <div class="field">
              <label for="a-note">Case note <span class="req">*</span></label>
              <textarea id="a-note" name="note" rows="4" required placeholder="What action was taken? Visible to the complainant in the tracking timeline."></textarea>
            </div>
            <button class="btn btn-primary btn-block" type="submit">${icon('checkSimple', 16)} Save update</button>
            <p class="muted-sm" style="margin-top:8px">Note is timestamped and attributed to you.</p>
          </form>
        </div>
      </div>

      <div class="panel">
        <div class="panel-head"><h2>${icon('info', 17)} Quick facts</h2></div>
        <div class="panel-body">
          <dl class="kv kv-tight">
            <dt>Complaint No.</dt><dd>${escapeHtml(c.complaintNo)}</dd>
            <dt>Priority</dt><dd>${escapeHtml(c.priority)}</dd>
            <dt>Assigned</dt><dd>${escapeHtml(c.assignedTo || 'Unassigned')}</dd>
            <dt>FIR</dt><dd>${escapeHtml(c.firNo || 'Not registered')}</dd>
            <dt>Officer</dt><dd>${escapeHtml(admin.name)}</dd>
          </dl>
        </div>
      </div>
    </aside>
  </div>`;

  return adminShell({ title: c.complaintNo, active: 'complaints', admin, body, wide: true });
}

function analyticsPage({ admin, stats }) {
  const stateRows = Object.entries(stats.byState).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxState = Math.max(1, ...stateRows.map(([, v]) => v));
  const body = `
  <div class="admin-pagehead">
    <div><h1>Analytics</h1><p>Distribution of complaints in this prototype dataset</p></div>
    <div class="admin-pagehead-actions"><a class="btn btn-outline btn-sm" href="/admin/export.csv">${icon('download', 15)} Export CSV</a></div>
  </div>
  <div class="admin-grid-2">
    <div class="panel"><div class="panel-head"><h2>${icon('trend', 17)} Complaints per day</h2></div><div class="panel-body">${sparkline(stats.series)}</div></div>
    <div class="panel"><div class="panel-head"><h2>${icon('dashboard', 17)} Status split</h2></div><div class="panel-body">${donutChart(stats.byStatus, stats.total)}</div></div>
  </div>
  <div class="admin-grid-2">
    <div class="panel"><div class="panel-head"><h2>${icon('grid', 17)} Category split</h2></div><div class="panel-body">${barChart(stats.byCategory, stats.total)}</div></div>
    <div class="panel">
      <div class="panel-head"><h2>${icon('pin', 17)} Top states</h2></div>
      <div class="panel-body">
        <div class="bars">
          ${stateRows.map(([name, v]) => `<div class="bar-row"><span class="bar-label">${escapeHtml(name)}</span><span class="bar-track"><span class="bar-fill" style="width:${(v / maxState) * 100}%; background:#0d3866"></span></span><span class="bar-value">${v}</span></div>`).join('')}
        </div>
      </div>
    </div>
  </div>
  <div class="panel">
    <div class="panel-head"><h2>${icon('info', 17)} Method note</h2></div>
    <div class="panel-body"><p class="muted-sm">All figures are computed live from the prototype's own JSON store, which begins with a set of seeded, fictitious complaint records. No real crime data is used or displayed.</p></div>
  </div>`;
  return adminShell({ title: 'Analytics', active: 'analytics', admin, body, wide: true });
}

module.exports = { loginPage, dashboardPage, complaintsPage, complaintDetailPage, analyticsPage };
