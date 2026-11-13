/* Multi-step complaint wizard with client-side validation and evidence staging. */
(function () {
  'use strict';

  var form = document.getElementById('reportForm');
  if (!form) return;

  var steps = Array.prototype.slice.call(form.querySelectorAll('.wizard-step'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-step-dot]'));
  var current = 0;

  /* Determine the first step with server-side errors (if any) */
  var errorFields = form.querySelectorAll('.has-error');
  if (errorFields.length) {
    var stepOf = errorFields[0].closest('.wizard-step');
    var idx = steps.indexOf(stepOf);
    if (idx > -1) current = idx;
  }

  function show(index) {
    current = Math.max(0, Math.min(steps.length - 1, index));
    steps.forEach(function (s, i) { s.classList.toggle('is-active', i === current); });
    dots.forEach(function (d, i) {
      d.classList.toggle('is-current', i === current);
      d.classList.toggle('is-done', i < current);
      d.classList.remove('is-todo');
    });
    var heading = steps[current].querySelector('h2');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
    var top = form.getBoundingClientRect().top + window.pageYOffset - 90;
    window.scrollTo({ top: top, behavior: 'smooth' });
  }

  function validateStep(index) {
    var step = steps[index];
    var ok = true;
    var firstInvalid = null;

    /* Radio group on step 1 */
    if (index === 0) {
      if (!form.querySelector('input[name="category"]:checked')) {
        ok = false;
        var box = step.querySelector('.cat-options');
        if (box) {
          var msg = step.querySelector('.js-cat-error');
          if (!msg) {
            msg = document.createElement('span');
            msg.className = 'field-error js-cat-error';
            msg.textContent = 'Please select a crime category to continue.';
            box.insertAdjacentElement('afterend', msg);
          }
          firstInvalid = msg;
        }
      }
    }

    var fields = step.querySelectorAll('input:not([type="hidden"]):not([type="file"]):not([type="radio"]), select, textarea');
    fields.forEach(function (f) {
      var wrap = f.closest('.field');
      var bad = false;
      if (f.hasAttribute('required') && !f.value.trim()) bad = true;
      if (f.type === 'email' && f.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.value.trim())) bad = true;
      if (f.name === 'mobile' && f.value.trim() && !/^[6-9]\d{9}$/.test(f.value.replace(/\D/g, ''))) bad = true;
      if (f.name === 'pincode' && f.value.trim() && !/^\d{6}$/.test(f.value.trim())) bad = true;
      if (f.name === 'description' && f.value.trim() && f.value.trim().length < 30) bad = true;
      if (f.name === 'name' && f.value.trim() && f.value.trim().length < 3) bad = true;

      if (wrap) wrap.classList.toggle('has-error', bad);
      var existing = wrap && wrap.querySelector('.field-error.js-client');
      if (bad) {
        ok = false;
        if (!existing && wrap) {
          var m = document.createElement('span');
          m.className = 'field-error js-client';
          m.textContent = f.name === 'description'
            ? 'Please write at least 30 characters.'
            : f.name === 'mobile'
            ? 'Enter a valid 10-digit mobile number.'
            : f.name === 'pincode'
            ? 'Enter a valid 6-digit PIN code.'
            : 'Please check this field.';
          wrap.appendChild(m);
        }
        if (!firstInvalid) firstInvalid = wrap;
      } else if (existing) {
        existing.remove();
      }
    });

    if (!ok && firstInvalid) {
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return ok;
  }

  form.querySelectorAll('[data-next]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (validateStep(current)) show(current + 1);
    });
  });
  form.querySelectorAll('[data-prev]').forEach(function (btn) {
    btn.addEventListener('click', function () { show(current - 1); });
  });

  /* Category selection styling */
  form.querySelectorAll('.cat-option input').forEach(function (input) {
    input.addEventListener('change', function () {
      form.querySelectorAll('.cat-option').forEach(function (l) { l.classList.remove('is-selected'); });
      var lbl = input.closest('.cat-option');
      if (lbl) lbl.classList.add('is-selected');
      var msg = form.querySelector('.js-cat-error');
      if (msg) msg.remove();
    });
  });

  /* ------------------------ Evidence picker ------------------------ */
  var MAX_FILES = 5;
  var MAX_BYTES = 5 * 1024 * 1024;
  var ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'video/mp4', 'video/quicktime', 'text/plain'];
  var input = document.getElementById('evidenceInput');
  var zone = document.getElementById('uploadZone');
  var list = document.getElementById('uploadList');
  var staged = [];

  function humanSize(n) {
    if (n < 1024) return n + ' B';
    if (n < 1048576) return Math.round(n / 1024) + ' KB';
    return (n / 1048576).toFixed(1) + ' MB';
  }

  function renderList() {
    if (!list) return;
    list.innerHTML = '';
    staged.forEach(function (f, i) {
      var li = document.createElement('li');
      li.className = 'upload-item';
      var thumb = f.type.indexOf('image/') === 0
        ? '<img alt="" src="' + URL.createObjectURL(f) + '">'
        : '<svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/><path d="M14 3v5h5"/></svg>';
      li.innerHTML =
        '<span class="up-thumb">' + thumb + '</span>' +
        '<span class="up-main"><span class="up-name"></span><span class="up-size">' + humanSize(f.size) + '</span></span>' +
        '<button type="button" class="up-remove" aria-label="Remove file">' +
        '<svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>';
      li.querySelector('.up-name').textContent = f.name;
      li.querySelector('.up-remove').addEventListener('click', function () {
        staged.splice(i, 1);
        syncInput();
        renderList();
      });
      list.appendChild(li);
    });
  }

  function syncInput() {
    if (!input) return;
    try {
      var dt = new DataTransfer();
      staged.forEach(function (f) { dt.items.add(f); });
      input.files = dt.files;
    } catch (e) { /* older browsers */ }
  }

  function addFiles(files) {
    var notice = '';
    Array.prototype.forEach.call(files, function (f) {
      if (staged.length >= MAX_FILES) { notice = 'You can attach up to ' + MAX_FILES + ' files.'; return; }
      if (f.size > MAX_BYTES) { notice = '"' + f.name + '" is larger than 5 MB.'; return; }
      if (ALLOWED.indexOf(f.type) === -1 && !/\.(jpe?g|png|webp|gif|pdf|mp4|mov|txt)$/i.test(f.name)) {
        notice = '"' + f.name + '" has an unsupported file type.'; return;
      }
      var dup = staged.some(function (s) { return s.name === f.name && s.size === f.size; });
      if (!dup) staged.push(f);
    });
    if (notice) {
      var m = document.getElementById('uploadNotice');
      if (!m) {
        m = document.createElement('span');
        m.id = 'uploadNotice';
        m.className = 'field-error';
        zone.insertAdjacentElement('afterend', m);
      }
      m.textContent = notice;
    }
    syncInput();
    renderList();
  }

  if (zone && input) {
    zone.addEventListener('click', function () { input.click(); });
    zone.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); }
    });
    zone.setAttribute('tabindex', '0');
    zone.setAttribute('role', 'button');
    ['dragenter', 'dragover'].forEach(function (ev) {
      zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.add('is-drag'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.remove('is-drag'); });
    });
    zone.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files);
    });
    input.addEventListener('change', function () {
      addFiles(input.files);
    });
  }

  /* Captcha refresh */
  var refresh = document.getElementById('captchaRefresh');
  if (refresh) {
    refresh.addEventListener('click', function () { window.location.reload(); });
  }

  /* Final submit guard */
  form.addEventListener('submit', function (e) {
    for (var i = 0; i < 3; i++) {
      if (!validateStep(i)) { e.preventDefault(); show(i); return; }
    }
    var decl = form.querySelector('input[name="declaration"]');
    if (decl && !decl.checked) {
      e.preventDefault();
      show(3);
      var box = decl.closest('.checkbox-row');
      if (box) box.classList.add('has-error');
      return;
    }
    var btn = document.getElementById('submitBtn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Submitting…';
    }
  });

  show(current);
})();
