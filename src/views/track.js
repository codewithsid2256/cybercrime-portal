'use strict';

const { STATUSES } = require('../config');
const { icon, layout, statusBadge, statusLabel, priorityBadge, categoryMeta, alertBox } = require('./layout');
const { escapeHtml, formatDate, formatDateTime, inr, maskMobile, formatBytes } = require('../util');
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function dateOrRaw(value) {
  if (!value) return '—';
  const d = new Date(value + 'T00:00:00');
  if (isNaN(d.getTime())) return String(value);
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function trackForm({ user, values = {}, error = '' }) {
  const body = `
  <section class="page-head">
    <div class="container">
      <span class="kicker">Citizen service</span>
      <h1>Track your complaint</h1>
      <p class="page-sub">Enter the complaint number you received and the mobile number used while filing, to see the live status, officer remarks and evidence on record.</p>
    </div>
  </section>

  <section class="section section-tight">
    <div class="container track-wrap">
      <div class="track-form-card">
        ${error ? alertBox('error', error) : ''}
        <form class="track-form" method="post" action="/track" novalidate>
          <div class="field">
            <label for="f-complaintNo">Complaint number <span class="req">*</span></label>
            <input id="f-complaintNo" name="complaintNo" placeholder="NCRP/2026/010482" value="${escapeHtml(values.complaintNo || '')}" required autocomplete="off">
            <span class="field-hint">Format: NCRP/YYYY/NNNNNN — mentioned in your acknowledgement.</span>
          </div>
          <div class="field">
            <label for="f-mobile">Registered mobile number <span class="req">*</span></label>
            <input id="f-mobile" name="mobile" type="tel" inputmode="numeric" maxlength="10" placeholder="10-digit mobile number" value="${escapeHtml(values.mobile || '')}" required autocomplete="off">
          </div>
          <button class="btn btn-primary btn-block" type="submit">${icon('search', 17)} Check status</button>
        </form>
        <div class="track-demo-hint">
          ${icon('info', 15)}
          <div><strong>Trying the demo?</strong> Use <button type="button" class="linklike" data-fill-demo>sample complaint NCRP/2026/010482</button> with mobile <code>9830012345</code>.</div>
        </div>
      </div>
      <div class="track-help">
        <h3>${icon('info', 18)} Lost your complaint number?</h3>
        <ul class="side-list">
          <li>Check the acknowledgement email sent when you filed the complaint.</li>
          <li>Look for the SMS confirming your submission.</li>
          <li>Call the helpline at <a href="tel:1930"><strong>1930</strong></a> and quote your registered mobile number.</li>
        </ul>
        <h3 style="margin-top:26px">${icon('lock', 18)} Privacy</h3>
        <p class="side-small">For your protection, a complaint can only be viewed with both the complaint number and the registered mobile number. Officers see an internal record with additional details.</p>
      </div>
    </div>
  </section>

  <section class="section section-alt">
    <div class="container">
      <div class="section-head"><div><span class="kicker">Status legend</span><h2>What each status means</h2></div></div>
      <div class="status-legend">
        ${STATUSES.map((s) => `
          <div class="legend-item">
            ${statusBadge(s.id)}
            <p>${s.citizen}</p>
          </div>`).join('')}
      </div>
    </div>
  </section>`;

  return layout({ title: 'Track Complaint', active: 'track', user, body, scripts: ['/js/track.js'] });
}

function statusStepper(currentStatus) {
  const order = STATUSES.map((s) => s.id);
  const idx = order.indexOf(currentStatus);
  return `
  <ol class="stepper">
    ${STATUSES.map((s, i) => {
      const state = i < idx ? 'done' : i === idx ? 'current' : 'todo';
      return `<li class="stepper-item is-${state}">
        <span class="stepper-node">${i < idx ? icon('checkSimple', 13) : i + 1}</span>
        <span class="stepper-label">${s.label}</span>
      </li>`;
    }).join('')}
  </ol>`;
}

function complaintResult({ user, complaint }) {
  const cat = categoryMeta(complaint.category);
  const attachments = complaint.attachments || [];

  const timeline = complaint.timeline
    .slice()
    .reverse()
    .map((t, i) => `
      <li class="tl-item ${i === 0 ? 'is-latest' : ''}">
        <span class="tl-dot"></span>
        <div class="tl-body">
          <div class="tl-head">
            <strong>${statusLabel(t.status)}</strong>
            <span class="tl-time">${formatDateTime(t.at)}</span>
          </div>
          <p>${escapeHtml(t.note)}</p>
          <span class="tl-by">${icon('user', 13)} ${escapeHtml(t.by || 'System')}</span>
        </div>
      </li>`).join('');

  const attachmentCards = attachments.length
    ? attachments.map((a) => {
        const isImage = (a.mime || '').startsWith('image/');
        return `<a class="att-card" href="${escapeHtml(a.url)}" target="_blank" rel="noopener">
          <span class="att-thumb">${isImage ? `<img src="${escapeHtml(a.url)}" alt="">` : icon('file', 20)}</span>
          <span class="att-info"><strong>${escapeHtml(a.originalName)}</strong><span>${formatBytes(a.size)} · ${escapeHtml((a.mime || '').split('/')[1] || 'file')}</span></span>
          ${icon('external', 15)}
        </a>`;
      }).join('')
    : `<p class="muted-sm">No evidence files were attached to this complaint.</p>`;

  const body = `
  <section class="page-head page-head-slim">
    <div class="container">
      <a class="back-link" href="/track">${icon('arrowLeft', 15)} Search another complaint</a>
      <div class="result-head">
        <div>
          <span class="kicker">Complaint record</span>
          <h1>${escapeHtml(complaint.complaintNo)}</h1>
          <p class="page-sub">Filed on ${formatDateTime(complaint.createdAt)} · ${escapeHtml(cat.label)}</p>
        </div>
        <div class="result-head-right">
          ${statusBadge(complaint.status)}
          ${priorityBadge(complaint.priority)}
        </div>
      </div>
    </div>
  </section>

  <section class="section section-tight">
    <div class="container result-wrap">
      <div class="result-main">
        <div class="card">
          <div class="card-head"><h2>${icon('dashboard', 18)} Progress</h2></div>
          <div class="card-body">
            ${statusStepper(complaint.status)}
            <div class="progress-note">${icon('info', 15)} ${escapeHtml((STATUSES.find((s) => s.id === complaint.status) || {}).citizen || '')}</div>
          </div>
        </div>

        <div class="card">
          <div class="card-head"><h2>${icon('clock', 18)} Activity timeline</h2></div>
          <div class="card-body">
            <ul class="timeline">${timeline}</ul>
          </div>
        </div>

        <div class="card">
          <div class="card-head"><h2>${icon('file', 18)} Evidence on record</h2><span class="chip chip-xs">${attachments.length} file${attachments.length === 1 ? '' : 's'}</span></div>
          <div class="card-body">
            <div class="att-grid">${attachmentCards}</div>
            <p class="muted-sm" style="margin-top:14px">${icon('lock', 13)} Files are stored privately and accessible only to investigating officers.</p>
          </div>
        </div>
      </div>

      <aside class="result-side">
        <div class="card">
          <div class="card-head"><h2>${icon('user', 18)} Complainant</h2></div>
          <div class="card-body">
            <dl class="kv">
              <dt>Name</dt><dd>${escapeHtml(complaint.complainant.name)}</dd>
              <dt>Mobile</dt><dd>${maskMobile(complaint.complainant.mobile)}</dd>
              <dt>Email</dt><dd>${escapeHtml(complaint.complainant.email)}</dd>
              <dt>State</dt><dd>${escapeHtml(complaint.complainant.state)}</dd>
              <dt>District</dt><dd>${escapeHtml(complaint.complainant.district)}</dd>
            </dl>
          </div>
        </div>
        <div class="card">
          <div class="card-head"><h2>${icon('file', 18)} Incident</h2></div>
          <div class="card-body">
            <dl class="kv">
              <dt>Category</dt><dd>${escapeHtml(cat.label)}</dd>
              <dt>Date</dt><dd>${escapeHtml(dateOrRaw(complaint.incident.date))}${complaint.incident.time ? ', ' + escapeHtml(complaint.incident.time) : ''}</dd>
              <dt>Amount lost</dt><dd>${complaint.incident.amountLost ? inr(complaint.incident.amountLost) : 'No financial loss'}</dd>
              <dt>Assigned to</dt><dd>${escapeHtml(complaint.assignedTo || 'Awaiting assignment')}</dd>
              ${complaint.firNo ? `<dt>Reference FIR</dt><dd>${escapeHtml(complaint.firNo)}</dd>` : ''}
            </dl>
          </div>
        </div>
        <div class="card card-tint">
          <div class="card-body">
            <h3>${icon('siren', 18)} Funds still moving?</h3>
            <p class="muted-sm">Call the cyber helpline immediately — bank freezes are most effective in the first hour.</p>
            <a class="btn btn-primary btn-block" href="tel:1930">${icon('phone', 16)} Call 1930</a>
          </div>
        </div>
      </aside>
    </div>
  </section>`;

  return layout({ title: `Complaint ${complaint.complaintNo}`, active: 'track', user, body, scripts: ['/js/track.js'] });
}

function successPage({ user, complaint }) {
  const cat = categoryMeta(complaint.category);
  const ref = escapeHtml(complaint.complaintNo);
  const mockQr = `<svg viewBox="0 0 120 120" width="120" height="120" role="img" aria-label="QR code placeholder">
    <rect width="120" height="120" fill="#fff"/>
    ${(() => {
      // decorative deterministic pseudo-QR pattern
      let cells = '';
      let seed = 7;
      const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
      for (let y = 0; y < 15; y++) {
        for (let x = 0; x < 15; x++) {
          const finder = (x < 4 && y < 4) || (x > 10 && y < 4) || (x < 4 && y > 10);
          if (finder) continue;
          if (rnd() > 0.55) cells += `<rect x="${8 + x * 7}" y="${8 + y * 7}" width="6" height="6" fill="#0d3866"/>`;
        }
      }
      const f = (x, y) => `<rect x="${8 + x * 7}" y="${8 + y * 7}" width="27" height="27" fill="#0d3866"/><rect x="${12 + x * 7}" y="${12 + y * 7}" width="19" height="19" fill="#fff"/><rect x="${16 + x * 7}" y="${16 + y * 7}" width="11" height="11" fill="#0d3866"/>`;
      return cells + f(0, 0) + f(11, 0) + f(0, 11);
    })()}
  </svg>`;

  const body = `
  <section class="section section-tight">
    <div class="container narrow">
      <div class="success-card">
        <div class="success-ico">${icon('check', 40)}</div>
        <h1>Complaint submitted successfully</h1>
        <p class="success-lead">Your complaint has been registered on the National Cyber Crime Reporting Portal. Keep the acknowledgement number below safe — it is required to track your complaint.</p>

        <div class="ack-box">
          <span class="ack-label">Your NCRP complaint number</span>
          <div class="ack-num-row">
            <strong id="ackNo">${ref}</strong>
            <button class="btn btn-sm btn-outline" data-copy="${ref}" type="button">${icon('copy', 15)} Copy</button>
          </div>
          <span class="ack-meta">Filed ${formatDateTime(complaint.createdAt)} · ${escapeHtml(cat.label)} · Status: ${statusLabel('submitted')}</span>
        </div>

        <div class="ack-grid">
          <div class="ack-item">
            <span class="ack-item-label">Complainant</span>
            <span>${escapeHtml(complaint.complainant.name)}</span>
          </div>
          <div class="ack-item">
            <span class="ack-item-label">Registered mobile</span>
            <span>${maskMobile(complaint.complainant.mobile)}</span>
          </div>
          <div class="ack-item">
            <span class="ack-item-label">State / District</span>
            <span>${escapeHtml(complaint.complainant.state)} / ${escapeHtml(complaint.complainant.district)}</span>
          </div>
          <div class="ack-item">
            <span class="ack-item-label">Evidence attached</span>
            <span>${(complaint.attachments || []).length} file(s)</span>
          </div>
        </div>

        <div class="ack-qr">
          <div class="ack-qr-art">${mockQr}</div>
          <div>
            <strong>${icon('info', 15)} What happens next</strong>
            <ol class="side-list">
              <li>Your complaint is queued for verification by the concerned cyber cell.</li>
              <li>You will be contacted on your registered mobile number if more details are needed.</li>
              <li>Track progress any time using the button below.</li>
            </ol>
            <p class="muted-sm">${icon('info', 13)} The QR block above is a decorative placeholder in this prototype; it does not open a real record.</p>
          </div>
        </div>

        <div class="ack-actions">
          <a class="btn btn-primary" href="/track">${icon('search', 17)} Track this complaint</a>
          <button class="btn btn-outline" type="button" data-print>${icon('print', 17)} Print acknowledgement</button>
          <a class="btn btn-ghost" href="/">Back to home</a>
        </div>
      </div>
    </div>
  </section>`;

  return layout({ title: 'Complaint Submitted', active: 'report', user, body, scripts: ['/js/track.js'] });
}

module.exports = { trackForm, complaintResult, successPage, statusStepper };
