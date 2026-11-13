/* Global behaviours: mobile nav, language toggle stub, dismissible alerts, smooth reveals. */
(function () {
  'use strict';

  /* Mobile nav */
  var toggle = document.getElementById('navToggle');
  var navList = document.getElementById('mainNav');
  if (toggle && navList) {
    toggle.addEventListener('click', function () {
      var open = navList.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) {
      if (!navList.contains(e.target) && !toggle.contains(e.target)) {
        navList.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* Language toggle (illustrative) */
  var langBtn = document.getElementById('langBtn');
  var langLabel = document.getElementById('langLabel');
  if (langBtn && langLabel) {
    langBtn.addEventListener('click', function () {
      var hi = langLabel.textContent.trim() === 'हिन्दी';
      langLabel.textContent = hi ? 'English' : 'हिन्दी';
      document.documentElement.lang = hi ? 'hi' : 'en';
      var note = document.createElement('div');
      note.className = 'alert alert-info';
      note.setAttribute('role', 'status');
      note.style.cssText = 'position:fixed;bottom:18px;left:50%;transform:translateX(-50%);z-index:200;max-width:420px;box-shadow:0 10px 30px rgba(0,0,0,.18);margin:0';
      note.innerHTML = '<div class="alert-body">' + (hi
        ? 'भाषा टॉगल केवल प्रदर्शन के लिए है — यह पोर्टल अभी पूर्ण रूप से अनुवादित नहीं है।'
        : 'The language toggle is illustrative only — this prototype is not fully translated.') + '</div>';
      document.body.appendChild(note);
      setTimeout(function () { note.remove(); }, 3800);
    });
  }

  /* Dismissible alerts */
  document.querySelectorAll('.alert-close').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var alert = btn.closest('.alert');
      if (alert) alert.remove();
    });
  });

  /* Copy buttons */
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy') || '';
      var done = function () {
        var old = btn.innerHTML;
        btn.innerHTML = '<svg class="icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m4.5 12.5 5 5 10-11"/></svg> Copied';
        setTimeout(function () { btn.innerHTML = old; }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () {});
      } else {
        var ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (e) {}
        ta.remove();
      }
    });
  });

  /* Character counters */
  document.querySelectorAll('[data-count-for]').forEach(function (el) {
    var name = el.getAttribute('data-count-for');
    var input = document.getElementById('f-' + name);
    if (!input) return;
    var max = input.getAttribute('maxlength') || '';
    var update = function () { el.textContent = input.value.length + ' / ' + max; };
    input.addEventListener('input', update);
    update();
  });

  /* Print buttons */
  document.querySelectorAll('[data-print]').forEach(function (btn) {
    btn.addEventListener('click', function () { window.print(); });
  });

  /* Auto-close success alerts after a while */
  document.querySelectorAll('.alert-success').forEach(function (a) {
    setTimeout(function () {
      a.style.transition = 'opacity .4s ease';
      a.style.opacity = '0.85';
    }, 6000);
  });
})();
