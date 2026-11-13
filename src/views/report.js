'use strict';

const { CATEGORIES, ID_TYPES, STATES, MAX_FILES } = require('../config');
const { icon, layout, alertBox } = require('./layout');
const { escapeHtml } = require('../util');

function fieldError(errors, key) {
  return errors && errors[key] ? `<span class="field-error">${icon('alert', 13)} ${escapeHtml(errors[key])}</span>` : '';
}

function fieldClass(errors, key) {
  return errors && errors[key] ? 'has-error' : '';
}

function textField({ name, label, value = '', placeholder = '', type = 'text', errors, hint = '', required = true, autocomplete = 'off', maxlength = '', inputmode = '' }) {
  return `
  <div class="field ${fieldClass(errors, name)}">
    <label for="f-${name}">${label}${required ? ' <span class="req">*</span>' : ' <span class="opt">(optional)</span>'}</label>
    <input id="f-${name}" name="${name}" type="${type}" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}"
      ${required ? 'required' : ''} autocomplete="${autocomplete}" ${maxlength ? `maxlength="${maxlength}"` : ''} ${inputmode ? `inputmode="${inputmode}"` : ''}>
    ${hint ? `<span class="field-hint">${hint}</span>` : ''}
    ${fieldError(errors, name)}
  </div>`;
}

function selectField({ name, label, options, value = '', errors, required = true, hint = '', placeholder = 'Select…', valuesAreObjects = false }) {
  return `
  <div class="field ${fieldClass(errors, name)}">
    <label for="f-${name}">${label}${required ? ' <span class="req">*</span>' : ' <span class="opt">(optional)</span>'}</label>
    <div class="select-wrap">
      <select id="f-${name}" name="${name}" ${required ? 'required' : ''}>
        <option value="">${escapeHtml(placeholder)}</option>
        ${options.map((o) => {
          const val = valuesAreObjects ? o.value : o;
          const text = valuesAreObjects ? o.label : o;
          return `<option value="${escapeHtml(val)}" ${String(value) === String(val) ? 'selected' : ''}>${escapeHtml(text)}</option>`;
        }).join('')}
      </select>
      ${icon('chevronDown', 16)}
    </div>
    ${hint ? `<span class="field-hint">${hint}</span>` : ''}
    ${fieldError(errors, name)}
  </div>`;
}

function textareaField({ name, label, value = '', placeholder = '', errors, hint = '', rows = 6, required = true, maxlength = 4000 }) {
  return `
  <div class="field field-wide ${fieldClass(errors, name)}">
    <label for="f-${name}">${label}${required ? ' <span class="req">*</span>' : ' <span class="opt">(optional)</span>'}</label>
    <textarea id="f-${name}" name="${name}" rows="${rows}" placeholder="${escapeHtml(placeholder)}" maxlength="${maxlength}" ${required ? 'required' : ''}>${escapeHtml(value)}</textarea>
    <div class="field-foot">
      <span class="field-hint">${hint || ''}</span>
      <span class="char-count" data-count-for="${name}">0 / ${maxlength}</span>
    </div>
    ${fieldError(errors, name)}
  </div>`;
}

function reportPage({ user, values = {}, errors = {}, captcha, preselectedCategory = '', refNo = '' }) {
  const v = values || {};
  const selectedCat = v.category || preselectedCategory;
  const steps = [
    { id: 1, label: 'Category', sub: 'What happened?' },
    { id: 2, label: 'Your details', sub: 'Who is reporting' },
    { id: 3, label: 'Incident', sub: 'When & how' },
    { id: 4, label: 'Evidence', sub: 'Proof & review' },
  ];

  const catCards = CATEGORIES.map((c) => `
    <label class="cat-option ${selectedCat === c.id ? 'is-selected' : ''}">
      <input type="radio" name="category" value="${c.id}" ${selectedCat === c.id ? 'checked' : ''} required>
      <span class="cat-option-ico">${icon(c.icon, 22)}</span>
      <span class="cat-option-text">
        <strong>${c.label}</strong>
        <span>${c.desc}</span>
      </span>
      <span class="cat-option-check">${icon('checkSimple', 14)}</span>
    </label>`).join('');

  const body = `
  <section class="page-head page-head-slim">
    <div class="container">
      <span class="kicker">Citizen service</span>
      <h1>Register a cyber crime complaint</h1>
      <p class="page-sub">Fields marked <span class="req">*</span> are mandatory. Your complaint is confidential and is visible only to authorised cyber cell officers.</p>
    </div>
  </section>

  <section class="section section-tight">
    <div class="container report-wrap">
      <div class="report-main">
        ${Object.keys(errors).length ? alertBox('error', '<strong>Please correct the highlighted fields.</strong> Your entries have been preserved so you do not need to retype them.') : ''}
        ${refNo ? alertBox('success', `Complaint <strong>${escapeHtml(refNo)}</strong> was filed successfully.`) : ''}

        <form id="reportForm" class="report-form" action="/report" method="post" enctype="multipart/form-data" novalidate>
          <div class="wizard-progress" aria-hidden="true">
            ${steps.map((s) => `
              <div class="wiz-step" data-step-dot="${s.id}">
                <span class="wiz-dot"><span class="wiz-num">${s.id}</span>${icon('checkSimple', 14)}</span>
                <span class="wiz-txt"><strong>${s.label}</strong><span>${s.sub}</span></span>
              </div>`).join('')}
          </div>

          <!-- STEP 1 -->
          <fieldset class="wizard-step" data-step="1">
            <legend class="wiz-legend"><span class="wiz-badge">Step 1 of 4</span><h2>Select the category that best describes the crime</h2></legend>
            <div class="cat-options">${catCards}</div>
            ${fieldError(errors, 'category')}
            <div class="wiz-actions">
              <a class="btn btn-ghost" href="/">${icon('arrowLeft', 16)} Cancel</a>
              <button type="button" class="btn btn-primary" data-next>Continue ${icon('arrowRight', 16)}</button>
            </div>
          </fieldset>

          <!-- STEP 2 -->
          <fieldset class="wizard-step" data-step="2">
            <legend class="wiz-legend"><span class="wiz-badge">Step 2 of 4</span><h2>Your details</h2><p>Provided for verification and to contact you about this complaint. Your name is never shown publicly.</p></legend>
            <div class="form-grid">
              ${textField({ name: 'name', label: 'Full name', value: v.name, placeholder: 'As per your identity document', errors, maxlength: 100 })}
              ${textField({ name: 'mobile', label: 'Mobile number', value: v.mobile, placeholder: '10-digit Indian mobile number', errors, type: 'tel', inputmode: 'numeric', maxlength: 10, hint: 'Used for OTP-free status tracking and officer callbacks.' })}
              ${textField({ name: 'email', label: 'Email address', value: v.email, placeholder: 'you@example.com', errors, type: 'email', maxlength: 120 })}
              ${selectField({ name: 'idType', label: 'Identity document type', options: ID_TYPES, value: v.idType, errors, placeholder: 'Select document' })}
              ${textField({ name: 'idNumber', label: 'Identity document number', value: v.idNumber, placeholder: 'Enter document number', errors, maxlength: 24, hint: 'Only the last 4 characters are ever displayed on screen.' })}
              ${selectField({ name: 'state', label: 'State / Union Territory', options: STATES, value: v.state, errors, placeholder: 'Select state or UT' })}
              ${textField({ name: 'district', label: 'District', value: v.district, placeholder: 'e.g. Howrah', errors, maxlength: 80 })}
              ${textField({ name: 'pincode', label: 'PIN code', value: v.pincode, placeholder: '6-digit PIN code', errors, maxlength: 6, inputmode: 'numeric' })}
              ${textField({ name: 'address', label: 'Address', value: v.address, placeholder: 'House / street / locality', errors, maxlength: 200, required: false })}
            </div>
            <div class="wiz-actions">
              <button type="button" class="btn btn-ghost" data-prev>${icon('arrowLeft', 16)} Back</button>
              <button type="button" class="btn btn-primary" data-next>Continue ${icon('arrowRight', 16)}</button>
            </div>
          </fieldset>

          <!-- STEP 3 -->
          <fieldset class="wizard-step" data-step="3">
            <legend class="wiz-legend"><span class="wiz-badge">Step 3 of 4</span><h2>Incident details</h2><p>Describe what happened. Precise amounts and identifiers help officers trace the money faster.</p></legend>
            <div class="form-grid">
              ${textField({ name: 'incidentDate', label: 'Date of incident', value: v.incidentDate, errors, type: 'date' })}
              ${textField({ name: 'incidentTime', label: 'Approximate time', value: v.incidentTime, errors, type: 'time', required: false })}
              ${textField({ name: 'amountLost', label: 'Amount lost (₹)', value: v.amountLost, placeholder: '0 if no money was lost', errors, type: 'number', inputmode: 'numeric', required: false, hint: 'Approximate is fine — officers will corroborate with the bank.' })}
              ${selectField({ name: 'priority', label: 'Is the fraud still ongoing?', options: [
                { value: 'normal', label: 'No — the incident is over' },
                { value: 'high', label: 'Money was transferred within the last 24 hours' },
                { value: 'critical', label: 'Yes — I am still being contacted / money still moving' },
              ], valuesAreObjects: true, value: v.priority || 'normal', errors, required: false, placeholder: 'Select urgency' })}
              ${textareaField({ name: 'description', label: 'What happened?', value: v.description, errors, rows: 7, placeholder: 'Describe the sequence of events — how you were contacted, what was said or sent, what you did, and what the loss or impact was.', hint: 'Do not include passwords or OTPs. Mention any UTR / transaction reference numbers.' })}
            </div>
            <h3 class="form-subhead">${icon('globe', 17)} Details of the suspect / platform <span class="opt">(optional but helpful)</span></h3>
            <div class="form-grid">
              ${textField({ name: 'suspectPlatform', label: 'Platform / medium used', value: v.suspectPlatform, errors, placeholder: 'e.g. WhatsApp, Instagram, UPI, phone call', required: false, maxlength: 80 })}
              ${textField({ name: 'suspectUrl', label: 'Website / profile URL', value: v.suspectUrl, errors, placeholder: 'https://…', required: false, maxlength: 200 })}
              ${textField({ name: 'suspectPhone', label: 'Phone number used', value: v.suspectPhone, errors, placeholder: '+91 …', required: false, maxlength: 20 })}
              ${textField({ name: 'suspectAccount', label: 'Bank A/C or UPI ID used', value: v.suspectAccount, errors, placeholder: 'A/C number, IFSC or UPI handle', required: false, maxlength: 120 })}
            </div>
            <div class="wiz-actions">
              <button type="button" class="btn btn-ghost" data-prev>${icon('arrowLeft', 16)} Back</button>
              <button type="button" class="btn btn-primary" data-next>Continue ${icon('arrowRight', 16)}</button>
            </div>
          </fieldset>

          <!-- STEP 4 -->
          <fieldset class="wizard-step" data-step="4">
            <legend class="wiz-legend"><span class="wiz-badge">Step 4 of 4</span><h2>Attach evidence &amp; submit</h2><p>Upload screenshots, statements, PDFs or a short video. Files are encrypted at rest in production deployments.</p></legend>

            <div class="upload-zone" id="uploadZone">
              <input type="file" id="evidenceInput" name="evidence" multiple accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.mp4,.mov,.txt" hidden>
              <span class="upload-ico">${icon('upload', 28)}</span>
              <strong>Drag &amp; drop files here, or <button type="button" class="linklike" id="browseBtn">browse</button></strong>
              <span class="upload-hint">JPG, PNG, WEBP, GIF, PDF, MP4, MOV or TXT · up to ${MAX_FILES} files · max 5 MB each</span>
            </div>
            <ul class="upload-list" id="uploadList"></ul>
            ${fieldError(errors, 'evidence')}

            <div class="review-box">
              <h3>${icon('file', 17)} Declaration</h3>
              <label class="checkbox-row ${fieldClass(errors, 'declaration')}">
                <input type="checkbox" name="declaration" value="yes" ${v.declaration ? 'checked' : ''} required>
                <span>I declare that the information provided is true to the best of my knowledge, and I understand that filing a false complaint is a punishable offence. I consent to being contacted by cyber cell officers regarding this complaint.</span>
              </label>
              ${fieldError(errors, 'declaration')}
            </div>

            <div class="captcha-box">
              <div>
                <label for="f-captcha">Security check <span class="req">*</span></label>
                <p class="captcha-q">What is <strong>${captcha.a} + ${captcha.b}</strong>?</p>
                ${fieldError(errors, 'captcha')}
              </div>
              <div class="captcha-input">
                <input id="f-captcha" name="captcha" type="text" inputmode="numeric" autocomplete="off" required placeholder="Answer">
                <input type="hidden" name="captchaToken" value="${captcha.token}">
                <button type="button" class="btn btn-sm btn-outline" id="captchaRefresh" title="Get a new question">${icon('refresh', 15)} New</button>
              </div>
            </div>

            <div class="wiz-actions">
              <button type="button" class="btn btn-ghost" data-prev>${icon('arrowLeft', 16)} Back</button>
              <button type="submit" class="btn btn-primary btn-lg" id="submitBtn">${icon('shield', 18)} Submit complaint</button>
            </div>
            <p class="submit-note">${icon('lock', 14)} After submission you will receive a unique <strong>NCRP complaint number</strong>. Save it — it is required to track status.</p>
          </fieldset>
        </form>
      </div>

      <aside class="report-side">
        <div class="side-card sticky">
          <h3>${icon('info', 18)} Before you begin</h3>
          <ul class="side-list side-list-tick">
            <li>Have your identity document handy.</li>
            <li>Keep screenshots of chats, emails and payment pages.</li>
            <li>Note UTR / transaction reference numbers.</li>
            <li>For money already transferred, call <a href="tel:1930"><strong>1930</strong></a> first.</li>
          </ul>
          <hr class="side-hr">
          <h3>${icon('clock', 18)} What happens next</h3>
          <ol class="side-list">
            <li>Instant acknowledgement with an NCRP number.</li>
            <li>Verification by a cyber cell officer.</li>
            <li>Coordination with banks / platforms.</li>
            <li>Status updates visible under "Track Complaint".</li>
          </ol>
          <hr class="side-hr">
          <p class="side-small">${icon('lock', 13)} Your identity is protected. Complaints involving harassment or sextortion are handled with additional confidentiality safeguards.</p>
        </div>
      </aside>
    </div>
  </section>`;

  return layout({
    title: 'Report a Cyber Crime',
    active: 'report',
    user,
    body,
    bodyClass: 'page-report',
    scripts: ['/js/report.js'],
  });
}

module.exports = { reportPage };
