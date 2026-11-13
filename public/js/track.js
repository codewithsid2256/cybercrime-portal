/* Tracking page helpers: demo autofill, complaint-number formatting, print. */
(function () {
  'use strict';

  document.querySelectorAll('[data-fill-demo]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var no = document.querySelector('input[name="complaintNo"]');
      var mob = document.querySelector('input[name="mobile"]');
      if (no) { no.value = 'NCRP/2026/010482'; no.focus(); }
      if (mob) mob.value = '9830012345';
    });
  });

  var noInput = document.querySelector('input[name="complaintNo"]');
  if (noInput) {
    noInput.addEventListener('blur', function () {
      var v = noInput.value.trim().toUpperCase().replace(/\s+/g, '');
      if (/^NCRP\d{4}\d{6}$/.test(v)) {
        noInput.value = 'NCRP/' + v.slice(4, 8) + '/' + v.slice(8);
      } else if (/^NCRP\/?\d{0,4}\/?\d*$/.test(v) && v.length > 4) {
        noInput.value = v;
      }
    });
  }

  var mob = document.querySelector('input[name="mobile"]');
  if (mob) {
    mob.addEventListener('input', function () {
      mob.value = mob.value.replace(/\D/g, '').slice(0, 10);
    });
  }
})();
