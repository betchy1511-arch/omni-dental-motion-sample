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

/* Round 39 (12 Nov 2026): phones swipe card lists sideways (CSS in omni.css). This adds a thin
   progress bar under each row and lets keyboard users scroll a row that has no links in it. */
(function () {
  'use strict';
  var SEL = '.svc-grid,.why-cards,.rx-cards,.jsteps,.dr-creds,.proc-steps,.itech,.glance';
  var mq = window.matchMedia('(max-width:760px)');
  var rails = Array.prototype.slice.call(document.querySelectorAll(SEL));
  if (!rails.length) return;
  rails.forEach(function (r) {
    var bar = document.createElement('div');
    bar.className = 'rail-bar'; bar.setAttribute('aria-hidden', 'true'); bar.hidden = true;
    var th = document.createElement('i'); bar.appendChild(th);
    r.parentNode.insertBefore(bar, r.nextSibling);
    var focusable = r.querySelector('a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])');
    var sec = r.closest('section'), hd = sec && sec.querySelector('h2');
    var label = (hd ? hd.textContent.replace(/\s+/g, ' ').trim() + ', ' : '') + 'scroll sideways for more';
    function upd() {
      var on = mq.matches && r.scrollWidth > r.clientWidth + 4;
      bar.hidden = !on; r.classList.toggle('rail-on', on);
      if (!focusable) {
        if (on) { r.setAttribute('tabindex', '0'); r.setAttribute('aria-label', label); }
        else { r.removeAttribute('tabindex'); r.removeAttribute('aria-label'); }
      }
      if (!on) return;
      /* cards off to the side never pass through view, so their fade-in would not fire: show them now */
      Array.prototype.forEach.call(r.querySelectorAll('.rv,.pst'), function (c) { c.classList.add('in'); c.classList.add('seen'); });
      if (r.classList.contains('rv')) r.classList.add('in');
      var w = r.clientWidth / r.scrollWidth, max = r.scrollWidth - r.clientWidth;
      th.style.width = (w * 100) + '%';
      th.style.transform = 'translateX(' + ((max ? r.scrollLeft / max : 0) * (1 / w - 1) * 100) + '%)';
    }
    r.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    if (mq.addEventListener) mq.addEventListener('change', upd); else if (mq.addListener) mq.addListener(upd);
    if (window.ResizeObserver) new ResizeObserver(upd).observe(r);
    upd(); setTimeout(upd, 600);
  });
})();
