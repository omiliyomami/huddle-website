/* HuddleShift demo request page */
(function () {
  'use strict';
  var form = document.querySelector('[data-panel="form"]');
  var sent = document.querySelector('[data-panel="sent"]');
  var button = document.querySelector('[data-action="submit"]');
  if (!form || !sent || !button) return;
  button.addEventListener('click', function () {
    form.style.display = 'none';
    sent.style.display = 'flex';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}());
