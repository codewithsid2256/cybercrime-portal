/* Contact form — prototype acknowledgement only (no transmission). */
(function () {
  'use strict';
  var form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var note = document.createElement('div');
    note.className = 'alert alert-success';
    note.setAttribute('role', 'status');
    note.innerHTML = '<div class="alert-body"><strong>Message noted.</strong> This is a prototype form — nothing is transmitted. For real cyber crime, call 1930 or use the official portal.</div>';
    form.insertAdjacentElement('beforebegin', note);
    form.reset();
    note.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
})();
