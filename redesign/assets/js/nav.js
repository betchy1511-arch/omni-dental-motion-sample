/* OMNI REDESIGN SAMPLE (11 Nov 2026): Services drop-down in the main menu.
   Opens on hover and keyboard focus (CSS), and on click or tap of the arrow button (here). */
/* 24 Nov 2026: two drop-downs (Services, Service Areas), each wired the same way */
Array.prototype.forEach.call(document.querySelectorAll('.nav-dd'), function (dd) {
  'use strict';
  var btn = dd.querySelector('.nav-dd-btn');
  function set(open) { dd.classList.toggle('open', open); if (open) dd.classList.remove('shut'); btn.setAttribute('aria-expanded', String(open)); }
  btn.addEventListener('click', function (e) { e.stopPropagation(); set(!dd.classList.contains('open')); });
  document.addEventListener('click', function (e) { if (!dd.contains(e.target)) set(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && dd.contains(document.activeElement)) { set(false); dd.classList.add('shut'); btn.focus(); } });
  dd.addEventListener('focusout', function (e) { if (!dd.contains(e.relatedTarget)) { set(false); dd.classList.remove('shut'); } });
  dd.addEventListener('mouseleave', function () { dd.classList.remove('shut'); });
});

/* Round 39 (12 Nov 2026): phones swipe card lists sideways (CSS in omni.css). This adds a thin
   progress bar under each row and lets keyboard users scroll a row that has no links in it. */
(function () {
  'use strict';
  var SEL = '.svc-grid,.why-cards,.rx-cards,.jsteps,.dr-creds,.proc-steps,.itech,.glance,.ticks';
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

/* Section headings: one line when the heading only just misses it (Beth, 25 Nov 2026: "one line avoid spaces").
   If a h2 would fit on one line at up to 15% smaller text, shrink it to fit (never below 85%); otherwise leave it.
   Hero headings (.sh) and headings inner.js already fits (.und, .proc-head, .fit1) or CSS keeps on one line (.st-tech .it-h) are left alone. Reads are batched to avoid layout thrash. Re-runs on resize, after the web
   fonts load, when the page language changes (Spanish switch) and when a details/accordion opens. */
(function () {
  var MIN = 0.85;
  function textWidth(h) {
    var r = document.createRange();
    r.selectNodeContents(h);
    return r.getBoundingClientRect().width;
  }
  function wraps(h) {
    var r = document.createRange();
    r.selectNodeContents(h);
    var tops = [].map.call(r.getClientRects(), function (x) { return Math.round(x.top); }).sort(function (a, b) { return a - b; });
    for (var k = 1; k < tops.length; k++) if (tops[k] - tops[0] > 12) return true;
    return false;
  }
  function over(h) { return h.scrollWidth > h.clientWidth + 4; }  /* 4px: italic glyphs overhang by 1-2px */
  /* Hero "Dr." chip overhangs the photo; when a long hero H1 line reaches under it, slide the chip right
     (the heading keeps its full width so its word pairs never break). */
  function chipGap() {
    var h = document.querySelector('h1.sh-h1'), c = document.querySelector('.sh-chip-dr');
    if (!h || !c) return;
    c.style.marginLeft = '';
    h.style.maxWidth = '';
    if (innerWidth < 1025 || !c.getClientRects().length) return;
    var r = document.createRange(); r.selectNodeContents(h);
    var cb = c.getBoundingClientRect(), need = 0;
    [].forEach.call(r.getClientRects(), function (x) {
      if (x.bottom + 16 < cb.top || x.top - 16 > cb.bottom) return;
      need = Math.max(need, x.right + 20 - cb.left);
    });
    if (need > 0) c.style.marginLeft = Math.ceil(need) + 'px';
  }
  function fit() {
    var _h1 = document.querySelector('h1.sh-h1'); if (_h1) _h1.style.maxWidth = '';
    var hs = [].filter.call(document.querySelectorAll('h2, h1.sh-h1'), function (h) {
      return (h.matches('h1') || !h.closest('.sh')) && !h.querySelector('br') && !h.classList.contains('fit1');
    });
    hs.forEach(function (h) {
      if (!h.dataset.fit) return;
      h.style.fontSize = ''; h.style.whiteSpace = '';
      [].forEach.call(h.querySelectorAll('.nw'), function (s) { s.style.whiteSpace = ''; });
      delete h.dataset.fit;
    });
    var m = hs.map(function (h) {
      if (!h.getClientRects().length) return null;
      var cs = getComputedStyle(h);
      var o = { h: h, fs: parseFloat(cs.fontSize), forced: cs.whiteSpace === 'nowrap',
                pad: parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) };
      o.w = h.clientWidth - o.pad;
      o.min = h.matches('h1') ? 0.6 : MIN;  /* hero h1 may drop further; it is ~90px and stays large */  /* box width read BEFORE any nowrap (a flex item grows when nowrap is on) */
      if (over(h)) { o.kind = 'over'; o.ratio = o.w / (h.scrollWidth - o.pad); return o; }
      if (!o.forced && !h.matches('h1') && wraps(h)) { o.kind = 'wrap'; return o; }  /* hero h1: only fix overflow, its 2-line design stays */
      return null;
    }).filter(Boolean);
    var wr = m.filter(function (o) { return o.kind === 'wrap'; });
    wr.forEach(function (o) { o.h.style.whiteSpace = 'nowrap'; });
    wr.forEach(function (o) { o.ratio = o.w / textWidth(o.h); });
    wr.forEach(function (o) { o.h.style.whiteSpace = ''; });
    m.forEach(function (o) {
      o.h.dataset.fit = '1';
      if (o.ratio >= o.min) {
        o.h.style.fontSize = Math.max(o.fs * o.min, Math.floor(o.fs * Math.min(o.ratio, 1) * 0.97 * 10) / 10) + 'px';
      } else if (o.kind === 'over') {
        unstick(o);
      }
    });
    m.forEach(function (o) {
      if (!o.h.style.fontSize) return;
      if (o.kind === 'wrap' ? wraps(o.h) : over(o.h)) {
        o.h.style.fontSize = '';
        if (o.kind === 'over') unstick(o);
      }
    });
    chipGap();
  }
  function unstick(o) {
    if (o.forced) o.h.style.whiteSpace = 'normal';
    [].forEach.call(o.h.querySelectorAll('.nw'), function (s) { s.style.whiteSpace = 'normal'; });
  }
  var t;
  function later() { clearTimeout(t); t = setTimeout(fit, 150); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fit); else fit();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  window.addEventListener('load', function () { fit(); setTimeout(fit, 1200); setTimeout(fit, 2600); });
  if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', later);
  window.addEventListener('resize', later);
  document.addEventListener('toggle', later, true);
  if (window.MutationObserver) {
    new MutationObserver(later).observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'lang'] });
    var textWatch = new MutationObserver(later);
    [].forEach.call(document.querySelectorAll('h2'), function (h) { textWatch.observe(h, { childList: true, subtree: true, characterData: true }); });
  }
})();

/* Back to top button (Beth 25 Nov 2026): shows after scrolling down, every page */
(function () {
  var root = document.documentElement;
  var b = document.createElement('button');
  b.type = 'button';
  b.className = 'to-top notranslate';
  b.setAttribute('translate', 'no');
  b.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function label() {
    var es = root.classList.contains('lang-es');
    var t = es ? 'Volver arriba' : 'Back to top';
    b.setAttribute('aria-label', t);
    b.title = t;
  }
  function add() {
    document.body.appendChild(b);
    label();
    if (window.MutationObserver) new MutationObserver(label).observe(root, { attributes: true, attributeFilter: ['class', 'lang'] });
    function check() { b.classList.toggle('show', (window.scrollY || root.scrollTop) > 600); }
    window.addEventListener('scroll', check, { passive: true });
    check();
  }
  b.addEventListener('click', function () {
    var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var target = document.querySelector('main') || document.querySelector('h1');
    if (target) {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
    window.scrollTo({ top: 0, behavior: still ? 'instant' : 'smooth' });
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', add); else add();
})();
