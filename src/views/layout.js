'use strict';

const { SITE, CATEGORIES, STATUSES } = require('../config');
const { escapeHtml, formatDate, formatDateTime, timeAgo, inr } = require('../util');

/* ------------------------------------------------------------------ */
/* Inline SVG icon set                                                 */
/* ------------------------------------------------------------------ */

const ICONS = {
  shield: '<path d="M12 3 4 6v5.5c0 4.6 3.2 8.4 8 9.5 4.8-1.1 8-4.9 8-9.5V6l-8-3Z"/><path d="m9 12 2 2 4-4.5"/>',
  lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15.5" r="1.4"/>',
  alert: '<path d="M12 3.5 22 20H2L12 3.5Z"/><path d="M12 9.5v4.5"/><circle cx="12" cy="17" r=".8"/>',
  phone: '<path d="M6.5 3h3l1.6 4.2-2.1 1.5a12.5 12.5 0 0 0 6.3 6.3l1.5-2.1L21 14.5v3a2.5 2.5 0 0 1-2.7 2.5C10.6 19.4 4.6 13.4 4 5.7A2.5 2.5 0 0 1 6.5 3Z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>',
  file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  user: '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>',
  users: '<circle cx="9" cy="8" r="3.2"/><path d="M2.8 19.5a6.2 6.2 0 0 1 12.4 0"/><circle cx="17.5" cy="9.5" r="2.6"/><path d="M15.4 14.4a5.2 5.2 0 0 1 6.3 4"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  check: '<circle cx="12" cy="12" r="8.5"/><path d="m8 12.2 2.7 2.7L16.3 9"/>',
  checkSimple: '<path d="m4.5 12.5 5 5 10-11"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  arrowRight: '<path d="M4 12h15M13 6l6 6-6 6"/>',
  arrowLeft: '<path d="M20 12H5M11 18l-6-6 6-6"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  chevronRight: '<path d="m9 6 6 6-6 6"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 19v-3"/>',
  download: '<path d="M12 4v12M7 11l5 5 5-5"/><path d="M4 19h16"/>',
  print: '<path d="M7 8V3h10v5"/><rect x="3.5" y="8" width="17" height="9" rx="1.5"/><path d="M7 14h10v7H7z"/>',
  copy: '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  logout: '<path d="M9 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H9"/><path d="M15 8l4 4-4 4M19 12H9"/>',
  dashboard: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.2"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
  bug: '<rect x="7" y="7" width="10" height="12" rx="5"/><path d="M12 7V4M8 4.5 6.5 3M16 4.5 17.5 3M7 11H3.5M7 15H3.5M20.5 11H17M20.5 15H17M12 19v2.5"/>',
  bank: '<path d="M3 9.5 12 4l9 5.5"/><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20.5h18"/>',
  card: '<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.5 9.5h19M6 14.5h4"/>',
  upi: '<rect x="6" y="2.5" width="12" height="19" rx="2.6"/><path d="M10.5 18.5h3"/><path d="M9.5 9.5h5M12 7v5"/><path d="m9.5 14 5-3"/>',
  social: '<circle cx="7" cy="7" r="3"/><circle cx="17" cy="7" r="3"/><circle cx="12" cy="18" r="3"/><path d="M9 9.2 11 15M15 9.2 13 15M9 7h6"/>',
  briefcase: '<rect x="3" y="7.5" width="18" height="12.5" rx="2"/><path d="M8.5 7.5V5a1.5 1.5 0 0 1 1.5-1.5h4A1.5 1.5 0 0 1 15.5 5v2.5M3 12.5h18"/>',
  cart: '<circle cx="9.5" cy="19.5" r="1.4"/><circle cx="17.5" cy="19.5" r="1.4"/><path d="M3 4h2.2l2.4 11.2h11.6L21 7.5H6"/>',
  trend: '<path d="M3.5 17.5 9 11.5l3.8 3.6L20.5 7"/><path d="M15.5 7h5v5"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-9.6A4.4 4.4 0 0 1 12 7a4.4 4.4 0 0 1 7.5 3.4C19.5 15.4 12 20 12 20Z"/>',
  grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.2"/>',
  globe: '<circle cx="12" cy="12" r="8.6"/><path d="M3.4 12h17.2M12 3.4c2.4 2.3 3.7 5.3 3.7 8.6S14.4 18.3 12 20.6C9.6 18.3 8.3 15.3 8.3 12S9.6 5.7 12 3.4Z"/>',
  wallet: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M16.5 14.5h1.5"/>',
  eye: '<path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.6"/>',
  pin: '<path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  filter: '<path d="M4 5h16l-6.2 7.5V19l-3.6 2v-8.5L4 5Z"/>',
  refresh: '<path d="M20 5v5h-5"/><path d="M19.4 10a8 8 0 1 0 .2 4"/>',
  trash: '<path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/><path d="M10.5 11v5M13.5 11v5"/>',
  chat: '<path d="M4 5.5h16v11H9l-5 4v-15Z"/><path d="M8 9.5h8M8 12.5h5"/>',
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5A2.5 2.5 0 0 1 4 20.5Z"/>',
  external: '<path d="M14 4h6v6"/><path d="M20 4 10.5 13.5"/><path d="M18 14v5a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V7.5A1.5 1.5 0 0 1 5 6h5"/>',
  language: '<circle cx="12" cy="12" r="8.6"/><path d="M3.4 12h17.2M12 3.4c2.4 2.3 3.7 5.3 3.7 8.6S14.4 18.3 12 20.6C9.6 18.3 8.3 15.3 8.3 12S9.6 5.7 12 3.4Z"/>',
  volume: '<path d="M4 9.5h3l4.5-3.5v12L7 14.5H4v-5Z"/><path d="M15 9a4 4 0 0 1 0 6M17.5 6.5a7.5 7.5 0 0 1 0 11"/>',
  star: '<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9L12 3.5Z"/>',
  info: '<circle cx="12" cy="12" r="8.6"/><path d="M12 10.5V17"/><circle cx="12" cy="7.6" r=".9"/>',
  siren: '<path d="M7 18v-5a5 5 0 0 1 10 0v5"/><path d="M5 21h14M12 4V2M5 6 3.5 4.5M19 6l1.5-1.5"/>',
  fingerprint: '<path d="M12 3.5a8.5 8.5 0 0 1 8.5 8.5c0 2-.2 3.9-.7 5.7"/><path d="M12 6.8A5.2 5.2 0 0 1 17.2 12c0 2.6-.3 5-1 7.2"/><path d="M6.6 19.6A17 17 0 0 0 8 12a4 4 0 0 1 8 0c0 1.4 0 2.7-.2 4"/><path d="M3.8 17.4A14 14 0 0 0 5 12a7 7 0 0 1 1.2-3.9"/><path d="M12 21c-.9-.8-1.5-2-1.5-3.5"/>',
};

function icon(name, size = 20, cls = '') {
  const body = ICONS[name] || ICONS.shield;
  return `<svg class="icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

const STATUS_MAP = Object.fromEntries(STATUSES.map((s) => [s.id, s]));

function statusBadge(statusId, { small = false } = {}) {
  const s = STATUS_MAP[statusId] || { label: statusId, tone: 'slate' };
  return `<span class="badge badge-${s.tone}${small ? ' badge-sm' : ''}"><span class="badge-dot"></span>${escapeHtml(s.label)}</span>`;
}

function statusLabel(statusId) {
  return (STATUS_MAP[statusId] || { label: statusId }).label;
}

function priorityBadge(p) {
  const map = {
    critical: ['Critical', 'red'],
    high: ['High', 'amber'],
    normal: ['Normal', 'slate'],
  };
  const [label, tone] = map[p] || map.normal;
  return `<span class="badge badge-${tone} badge-sm">${label}</span>`;
}

function categoryMeta(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
}

function categoryChip(id, { link = false } = {}) {
  const c = categoryMeta(id);
  const inner = `<span class="cat-ico">${icon(c.icon, 16)}</span>${escapeHtml(c.short)}`;
  return link
    ? `<a class="chip" href="/report?category=${encodeURIComponent(c.id)}">${inner}</a>`
    : `<span class="chip">${inner}</span>`;
}

function breadcrumb(items) {
  if (!items.length) return '';
  const parts = items.map((it, i) =>
    i === items.length - 1
      ? `<span aria-current="page">${escapeHtml(it.label)}</span>`
      : `<a href="${it.href}">${escapeHtml(it.label)}</a><span class="sep">${icon('chevronRight', 13)}</span>`
  );
  return `<nav class="breadcrumb" aria-label="Breadcrumb">${parts.join('')}</nav>`;
}

function pageHeader({ title, subtitle = '', crumbs = [], accent = '' }) {
  return `
  <section class="page-head ${accent}">
    <div class="container">
      ${breadcrumb(crumbs)}
      <h1>${escapeHtml(title)}</h1>
      ${subtitle ? `<p class="page-sub">${subtitle}</p>` : ''}
    </div>
  </section>`;
}

function alertBox(type, html, { dismissible = false } = {}) {
  const ic = { success: 'check', error: 'alert', warning: 'alert', info: 'info' }[type] || 'info';
  return `<div class="alert alert-${type}" role="status">${icon(ic, 19)}<div class="alert-body">${html}</div>${
    dismissible ? `<button class="alert-close" aria-label="Dismiss">${icon('x', 16)}</button>` : ''
  }</div>`;
}

function pagination({ page, pages, base, query = {} }) {
  if (pages <= 1) return '';
  const url = (p) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    params.set('page', p);
    return `${base}?${params.toString()}`;
  };
  const nums = [];
  const push = (p) => nums.includes(p) || nums.push(p);
  push(1);
  for (let p = page - 2; p <= page + 2; p++) if (p > 1 && p < pages) push(p);
  if (pages > 1) push(pages);
  nums.sort((a, b) => a - b);

  let last = 0;
  const items = nums.map((n) => {
    const gap = n - last > 1 ? '<span class="page-gap">…</span>' : '';
    last = n;
    return `${gap}${n === page
      ? `<span class="page-btn is-active" aria-current="page">${n}</span>`
      : `<a class="page-btn" href="${url(n)}">${n}</a>`}`;
  }).join('');

  return `<nav class="pagination" aria-label="Pagination">
    ${page > 1 ? `<a class="page-btn page-arrow" href="${url(page - 1)}">${icon('arrowLeft', 16)} Prev</a>` : `<span class="page-btn page-arrow is-disabled">${icon('arrowLeft', 16)} Prev</span>`}
    ${items}
    ${page < pages ? `<a class="page-btn page-arrow" href="${url(page + 1)}">Next ${icon('arrowRight', 16)}</a>` : `<span class="page-btn page-arrow is-disabled">Next ${icon('arrowRight', 16)}</span>`}
  </nav>`;
}

function emptyState({ icon: ic = 'search', title, text = '', action = '' }) {
  return `<div class="empty-state">
    <div class="empty-icon">${icon(ic, 34)}</div>
    <h3>${escapeHtml(title)}</h3>
    ${text ? `<p>${text}</p>` : ''}
    ${action}
  </div>`;
}

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

const NAV = [
  { href: '/', label: 'Home', key: 'home' },
  { href: '/report', label: 'Report a Crime', key: 'report', cta: true },
  { href: '/track', label: 'Track Complaint', key: 'track' },
  { href: '/crime-types', label: 'Crime Types', key: 'crime-types' },
  { href: '/awareness', label: 'Awareness', key: 'awareness' },
  { href: '/resources', label: 'Resources', key: 'resources' },
  { href: '/contact', label: 'Contact', key: 'contact' },
];

function tricolorStrip(cls = '') {
  return `<div class="tricolor ${cls}"><span class="saffron"></span><span class="white"></span><span class="green"></span></div>`;
}

function topBar() {
  return `
  <div class="topbar">
    <div class="container topbar-inner">
      <div class="topbar-left">
        <span class="gov-flag" aria-hidden="true"></span>
        <span>Government of India</span>
        <span class="dot-sep"></span>
        <span class="hide-sm">Ministry of Home Affairs</span>
      </div>
      <div class="topbar-right">
        <a href="#main" class="top-link">Skip to main content</a>
        <span class="dot-sep"></span>
        <a href="/helpline" class="top-link">${icon('siren', 14)} Helpline 1930</a>
        <span class="dot-sep hide-sm"></span>
        <a href="/page/accessibility" class="top-link hide-sm">Accessibility</a>
        <button class="top-link lang-btn" type="button" id="langBtn">${icon('language', 14)} <span id="langLabel">हिन्दी</span></button>
      </div>
    </div>
  </div>`;
}

function masthead(user) {
  const adminLink = user
    ? `<a class="mast-link" href="/admin">${icon('dashboard', 15)} Console</a>`
    : `<a class="mast-link" href="/admin/login">${icon('lock', 15)} Officer Login</a>`;
  return `
  ${tricolorStrip('strip-top')}
  <header class="masthead">
    <div class="container masthead-inner">
      <a class="brand" href="/">
        <img src="/img/emblem.png" alt="State Emblem of India" class="emblem" width="46" height="74">
        <span class="brand-text">
          <span class="brand-hi">${SITE.nameHi}</span>
          <span class="brand-en">${SITE.name}</span>
          <span class="brand-sub">Cyber Crime Coordination Centre · Ministry of Home Affairs</span>
        </span>
      </a>
      <div class="mast-side">
        <a class="helpline-box" href="tel:1930">
          <span class="helpline-ico">${icon('phone', 20)}</span>
          <span class="helpline-txt">
            <span class="helpline-label">National Cyber Crime Helpline</span>
            <span class="helpline-num">1930</span>
          </span>
        </a>
        ${adminLink}
      </div>
    </div>
  </header>`;
}

function mainNav(active, user) {
  const items = NAV.map((n) => {
    const cls = ['nav-link', n.key === active ? 'is-active' : '', n.cta ? 'nav-cta' : ''].filter(Boolean).join(' ');
    return `<li><a class="${cls}" href="${n.href}">${n.cta ? icon('plus', 15) : ''}${n.label}</a></li>`;
  }).join('');
  const authItem = '';
  return `
  <div class="navbar">
    <div class="container navbar-inner">
      <button class="nav-toggle" id="navToggle" aria-expanded="false" aria-controls="mainNav">
        ${icon('menu', 20)} <span>Menu</span>
      </button>
      <ul class="nav-list" id="mainNav">${items}${user ? `<li class="nav-auth-m"><a class="nav-link" href="/admin">${icon('dashboard', 15)} Officer Console</a></li><li class="nav-auth-m"><a class="nav-link" href="/admin/logout">${icon('logout', 15)} Sign out</a></li>` : `<li class="nav-auth-m"><a class="nav-link" href="/admin/login">${icon('lock', 15)} Officer Login</a></li>`}</ul>
      <div class="nav-right">
        <a class="nav-quick-cta" href="/report">${icon('plus', 13)} Report</a>
        ${user
          ? `<a class="nav-login" href="/admin/logout">${icon('logout', 14)} Sign out</a>`
          : `<a class="nav-login" href="/admin/login">${icon('lock', 14)} Officer Login</a>`}
        <a class="nav-emergency" href="tel:112">${icon('alert', 14)} Emergency 112</a>
      </div>
    </div>
  </div>`;
}

function ticker() {
  return `
  <div class="ticker" role="region" aria-label="Advisories">
    <div class="container ticker-inner">
      <span class="ticker-tag">${icon('volume', 15)} ADVISORY</span>
      <div class="ticker-track"><div class="ticker-move">
        <span>Beware of fraudsters posing as bank officers and asking you to scan QR codes to <em>receive</em> money — scanning always sends money.</span>
        <span>Report cyber fraud within the &ldquo;golden hour&rdquo; by calling <strong>1930</strong> to maximise the chance of freezing stolen funds.</span>
        <span>Never share OTPs, CVV, UPI PIN or screen-sharing access with anyone, including people claiming to be from your bank.</span>
      </div></div>
    </div>
  </div>`;
}

function footer() {
  const catLinks = CATEGORIES.slice(0, 6)
    .map((c) => `<li><a href="/crime-types#${c.id}">${escapeHtml(c.label)}</a></li>`)
    .join('');
  return `
  ${tricolorStrip('strip-bottom')}
  <footer class="site-footer">
    <div class="container footer-grid">
      <div class="footer-col footer-brand">
        <div class="footer-brand-head">
          <img src="/img/emblem.png" alt="State Emblem of India" width="38" height="61">
          <div>
            <strong>${SITE.name}</strong>
            <span>Government of India</span>
          </div>
        </div>
        <p class="footer-about">A single window for citizens, victims and organisations to report cyber crime, attach digital evidence, and track the progress of their complaint online.</p>
        <div class="footer-contact">
          <a href="tel:1930">${icon('phone', 15)} Helpline 1930 (24×7)</a>
          <a href="mailto:${SITE.email}">${icon('mail', 15)} ${SITE.email}</a>
          <span>${icon('pin', 15)} ${SITE.address}</span>
        </div>
      </div>
      <div class="footer-col">
        <h4>Cyber Crime Types</h4>
        <ul>${catLinks}</ul>
      </div>
      <div class="footer-col">
        <h4>Citizen Services</h4>
        <ul>
          <li><a href="/report">File a Complaint</a></li>
          <li><a href="/track">Track Complaint Status</a></li>
          <li><a href="/crime-types">Crime Category Guide</a></li>
          <li><a href="/awareness">Awareness &amp; Advisories</a></li>
          <li><a href="/resources">Downloads &amp; Resources</a></li>
          <li><a href="/helpline">Helpline &amp; Emergency</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>About</h4>
        <ul>
          <li><a href="/about">About this Portal</a></li>
          <li><a href="/contact">Contact &amp; Offices</a></li>
          <li><a href="/page/faq">Frequently Asked Questions</a></li>
          <li><a href="/page/privacy">Privacy Policy</a></li>
          <li><a href="/page/terms">Terms of Use</a></li>
          <li><a href="/page/accessibility">Accessibility Statement</a></li>
        </ul>
      </div>
    </div>
    <div class="container footer-note-wrap">
      <div class="footer-note">
        <strong>Disclaimer:</strong> ${escapeHtml(SITE.prototypeNotice)}
      </div>
    </div>
    <div class="footer-bottom">
      <div class="container footer-bottom-inner">
        <span>© 2026 ${SITE.short} Prototype · Built for demonstration &amp; learning</span>
        <span class="footer-bottom-links">
          <a href="/page/privacy">Privacy</a>
          <a href="/page/terms">Terms</a>
          <a href="/page/accessibility">Accessibility</a>
          <a href="/admin/login">Officer Console</a>
        </span>
        <span class="last-updated">Last updated: ${SITE.lastUpdated}</span>
      </div>
    </div>
    ${tricolorStrip('strip-footer')}
  </footer>`;
}

function layout({ title, active = '', user = null, body = '', bodyClass = '', scripts = [], description = '' }) {
  const pageTitle = title ? `${title} | ${SITE.name}` : SITE.name;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(pageTitle)}</title>
  <meta name="description" content="${escapeHtml(description || 'Report cyber crime online, attach digital evidence and track your complaint on the National Cyber Crime Reporting Portal (demonstration prototype).')}">
  <meta name="theme-color" content="#0d3866">
  <link rel="icon" href="/img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body class="${bodyClass}">
  <a class="skip-link" href="#main">Skip to main content</a>
  ${topBar()}
  ${masthead(user)}
  ${mainNav(active, user)}
  ${ticker()}
  <main id="main">${body}</main>
  ${footer()}
  <script src="/js/main.js" defer></script>
  ${scripts.map((s) => `<script src="${s}" defer></script>`).join('\n')}
</body>
</html>`;
}

module.exports = {
  icon,
  layout,
  statusBadge,
  statusLabel,
  priorityBadge,
  categoryMeta,
  categoryChip,
  breadcrumb,
  pageHeader,
  alertBox,
  pagination,
  emptyState,
  tricolorStrip,
  STATUS_MAP,
  formatDate,
  formatDateTime,
  timeAgo,
  inr,
};
