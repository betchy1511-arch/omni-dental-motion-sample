/* OMNI REDESIGN SAMPLE (11 Nov 2026): Services drop-down in the main menu.
   Opens on hover and keyboard focus (CSS), and on click or tap of the arrow button (here). */
(function () {
  'use strict';
  var dd = document.querySelector('.nav-dd');
  if (!dd) return;
  var btn = dd.querySelector('.nav-dd-btn');
  function set(open) { dd.classList.toggle('open', open); if (open) dd.classList.remove('shut'); btn.setAttribute('aria-expanded', String(open)); }
  btn.addEventListener('click', function (e) { e.stopPropagation(); set(!dd.classList.contains('open')); });
  document.addEventListener('click', function (e) { if (!dd.contains(e.target)) set(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && dd.contains(document.activeElement)) { set(false); dd.classList.add('shut'); btn.focus(); } });
  dd.addEventListener('focusout', function (e) { if (!dd.contains(e.relatedTarget)) { set(false); dd.classList.remove('shut'); } });
  dd.addEventListener('mouseleave', function () { dd.classList.remove('shut'); });
})();
