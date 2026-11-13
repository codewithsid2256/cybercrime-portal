/* Officer console interactions: sidebar toggle, password reveal, keyboard shortcut. */
(function () {
  'use strict';

  var menuBtn = document.getElementById('adminMenuBtn');
  var side = document.getElementById('adminSide');
  if (menuBtn && side) {
    menuBtn.addEventListener('click', function () {
      var open = side.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) {
      if (window.innerWidth <= 1024 && side.classList.contains('is-open') && !side.contains(e.target) && !menuBtn.contains(e.target)) {
        side.classList.remove('is-open');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  document.querySelectorAll('[data-pw-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var input = document.getElementById('password');
      if (!input) return;
      var show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    });
  });

  /* "/" focuses the register search */
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
      var search = document.querySelector('.filter-search input');
      if (search) { e.preventDefault(); search.focus(); }
    }
  });
})();
