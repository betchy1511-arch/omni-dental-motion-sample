/* OMNI REDESIGN SAMPLE (11 Nov 2026): review cards show a 4-line excerpt, with a
   "Read Full Review" button only on the quotes that are really cut off.
   Without JavaScript every quote shows in full. Shared by the home page and inner pages. */
(function () {
  'use strict';
  var ES = document.documentElement.classList.contains('lang-es');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.rx-card'));
  if (!cards.length) return;

  function measure(card) {
    var q = card.querySelector('.rx-q');
    var btn = card.querySelector('.rx-toggle');
    if (!q || !btn) return;
    if (card.classList.contains('open')) return;
    q.classList.add('clamp');
    /* hidden cards (inside a closed "more" panel) measure 0 tall: retry when shown */
    var t = q.querySelector('p') || q;
    if (!t.offsetHeight) return;
    btn.hidden = !(t.scrollHeight > t.clientHeight + 2);
  }
  function all() { cards.forEach(measure); }

  cards.forEach(function (card) {
    var q = card.querySelector('.rx-q');
    var btn = card.querySelector('.rx-toggle');
    if (!q || !btn) return;
    btn.addEventListener('click', function () {
      var open = card.classList.toggle('open');
      q.classList.toggle('clamp', !open);
      btn.setAttribute('aria-expanded', String(open));
      var lab = btn.querySelector('.rx-t') || btn;
      lab.textContent = open ? (ES ? 'Ver menos' : 'Show Less') : (ES ? 'Leer reseña completa' : 'Read Full Review');
    });
  });

  document.querySelectorAll('.rx-more').forEach(function (d) { d.addEventListener('toggle', all); });
  all();
  var t;
  window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(all, 150); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(all);
})();
