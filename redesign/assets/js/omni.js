/* OMNI REDESIGN SAMPLE (31 Oct 2026): opening sequence, pinned hero stage,
   word-by-word statement, scroll reveals, header state, mobile menu. */
(function () {
  'use strict';

  var root = document.documentElement;
  var rm = window.matchMedia('(prefers-reduced-motion: reduce)');
  var desk = window.matchMedia('(min-width: 1025px)');
  var saveData = navigator.connection && navigator.connection.saveData;

  /* ---- Opening sequence: split the H1 into words, then play the intro once ---- */
  var h1 = document.querySelector('.hero-h1');
  if (h1 && !rm.matches) {
    var n = 0;
    (function split(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var parts = c.textContent.split(/(\s+)/);
          var frag = document.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
            var s = document.createElement('span');
            s.className = 'hw';
            s.textContent = p;
            s.style.animationDelay = (0.45 + n++ * 0.09).toFixed(2) + 's';
            frag.appendChild(s);
          });
          node.replaceChild(frag, c);
        } else if (c.nodeType === 1) {
          split(c);
        }
      });
    })(h1);
    root.classList.add('intro');
  }

  /* ---- Hero video: desktop, motion allowed, no data saver. Mobile keeps the poster ---- */
  var video = document.querySelector('.stage-video');
  if (video && desk.matches && !rm.matches && !saveData) {
    video.src = 'assets/img/omni-hero.mp4';
    video.muted = true;
    var p = video.play();
    if (p && p.catch) p.catch(function () { /* autoplay refused: poster stays */ });
  }
  if (rm.addEventListener) rm.addEventListener('change', function (e) { if (e.matches && video) video.pause(); });

  /* ---- Header: transparent over the dark hero, pearl after ---- */
  var head = document.getElementById('head');
  var pin = document.querySelector('.hero-pin');
  var stage = document.querySelector('.stage');
  var floatCta = document.querySelector('.float-cta');

  /* ---- Statement: wrap words so they light up in reading order ---- */
  var lines = [];
  if (!rm.matches) {
    document.querySelectorAll('[data-words]').forEach(function (el) {
      var words = el.textContent.trim().split(/\s+/);
      el.textContent = '';
      words.forEach(function (w, i) {
        var s = document.createElement('span');
        s.className = 'w';
        s.textContent = w;
        el.appendChild(s);
        if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
      });
      lines.push({ el: el, words: el.querySelectorAll('.w') });
    });
  }

  var ticking = false;
  function update() {
    ticking = false;
    var vh = window.innerHeight;
    var pr = pin.getBoundingClientRect();
    var lineRects = lines.map(function (l) { return l.el.getBoundingClientRect(); });

    /* pinned stage progress: 0 at the top, 1 when the photo has settled into its panel */
    if (desk.matches && !rm.matches) {
      var travel = Math.max(1, pin.offsetHeight - vh);
      var t = Math.min(1, Math.max(0, -pr.top / (travel * 0.8)));
      var e = 1 - Math.pow(1 - t, 3);
      stage.style.setProperty('--e', e.toFixed(4));
    } else {
      stage.style.removeProperty('--e');
    }

    head.classList.toggle('on-dark', desk.matches && pr.bottom > 90);
    if (floatCta) floatCta.classList.toggle('show', pr.bottom < vh * 0.4);

    lines.forEach(function (l, k) {
      var r = lineRects[k];
      var q = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (vh * 0.45)));
      var lit = Math.round(q * l.words.length);
      for (var i = 0; i < l.words.length; i++) l.words[i].classList.toggle('on', i < lit);
    });
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();

  /* ---- Reveals ---- */
  var rvs = document.querySelectorAll('.rv, .step');
  if ('IntersectionObserver' in window && !rm.matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    rvs.forEach(function (el) { io.observe(el); });
  } else {
    rvs.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- Mobile menu ---- */
  var burger = document.querySelector('.burger');
  var mnav = document.getElementById('mnav');
  if (burger && mnav) {
    function closeMenu() { mnav.hidden = true; burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Open menu'); }
    burger.addEventListener('click', function () {
      var open = mnav.hidden;
      mnav.hidden = !open;
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    mnav.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !mnav.hidden) { closeMenu(); burger.focus(); } });
  }
})();
