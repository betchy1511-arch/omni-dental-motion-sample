/* OMNI REDESIGN SAMPLE: inner pages (11 Nov 2026, round 2). Hero headline words,
   header over the dark hero, scroll reveals, process line, word-lit statement,
   drifting benefit card, floating Book Online button and the mobile menu.
   The home page keeps omni.js; this file has no video or pinned-stage code. */
(function () {
  'use strict';
  var rm = window.matchMedia('(prefers-reduced-motion: reduce)');
  var desk = window.matchMedia('(min-width: 1025px)');
  var motion = !rm.matches;

  /* ---- Hero headline: words rise one by one ---- */
  var h1 = document.querySelector('.sh-h1');
  if (h1 && motion) {
    var n = 0;
    (function split(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var frag = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
            var s = document.createElement('span');
            s.className = 'shw';
            s.textContent = p;
            s.style.animationDelay = (0.25 + n++ * 0.11).toFixed(2) + 's';
            frag.appendChild(s);
          });
          node.replaceChild(frag, c);
        } else if (c.nodeType === 1) split(c);
      });
    })(h1);
  }

  /* ---- Reveals ---- */
  var rvs = document.querySelectorAll('.rv, .pst');
  if ('IntersectionObserver' in window && motion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add(en.target.classList.contains('pst') ? 'seen' : 'in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    rvs.forEach(function (el) { io.observe(el); });
  } else {
    rvs.forEach(function (el) { el.classList.add('in'); el.classList.add('seen'); });
  }

  /* ---- Statement: wrap words so they light up in reading order ---- */
  var lines = [];
  if (motion) {
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

  var head = document.getElementById('head');
  var hero = document.querySelector('.sh');
  var darkHero = head && head.classList.contains('on-dark');
  var floatCta = document.querySelector('.float-cta');
  var track = document.querySelector('.proc-track');
  var line = document.querySelector('.proc-line');
  var steps = Array.prototype.slice.call(document.querySelectorAll('.pst'));
  var benCard = document.querySelector('.ben-card');

  var ticking = false;
  function update() {
    ticking = false;
    var vh = window.innerHeight;
    var hb = hero ? hero.getBoundingClientRect().bottom : 0;
    /* phones: the clear header would sit over the hero text once you scroll, so it turns pearl at once */
    if (darkHero && (!mnav || mnav.hidden)) head.classList.toggle('on-dark', hb > 90 && (desk.matches || window.scrollY < 8));
    if (floatCta) floatCta.classList.toggle('show', hb < vh * 0.3);

    /* process: the gold line fills as the band crosses the screen, steps light as it passes */
    if (track && line) {
      if (motion && desk.matches) {
        var r = track.getBoundingClientRect();
        var p = Math.min(1, Math.max(0, (vh * 0.75 - r.top) / (r.height + vh * 0.2)));
        line.style.setProperty('--p', p.toFixed(3));
        var lr = line.getBoundingClientRect();
        steps.forEach(function (st) {
          var nr = st.querySelector('.pst-n').getBoundingClientRect();
          st.classList.toggle('on', lr.left + lr.width * p >= nr.left + nr.width / 2);
        });
      } else {
        line.style.removeProperty('--p');
        steps.forEach(function (st) { st.classList.remove('on'); });
      }
    }

    /* benefit card drifts a little against the photo */
    if (benCard) {
      if (motion && desk.matches) {
        var br = benCard.parentNode.getBoundingClientRect();
        var q = Math.min(1, Math.max(-1, (br.top + br.height / 2 - vh / 2) / vh));
        benCard.style.setProperty('--y', (q * 36).toFixed(1) + 'px');
      } else benCard.style.removeProperty('--y');
    }

    lines.forEach(function (l) {
      var rr = l.el.getBoundingClientRect();
      var k = Math.min(1, Math.max(0, (vh * 0.85 - rr.top) / (vh * 0.5)));
      var lit = Math.round(k * l.words.length);
      for (var i = 0; i < l.words.length; i++) l.words[i].classList.toggle('on', i < lit);
    });
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();

  /* ---- Mobile menu ---- */
  var burger = document.querySelector('.burger');
  var mnav = document.getElementById('mnav');
  if (burger && mnav) {
    var closeMenu = function () { mnav.hidden = true; burger.setAttribute('aria-expanded', 'false'); if (darkHero) onScroll(); };
    if (desk.addEventListener) desk.addEventListener('change', function (e) { if (e.matches) closeMenu(); });
    burger.addEventListener('click', function () {
      var open = mnav.hidden;
      mnav.hidden = !open;
      burger.setAttribute('aria-expanded', String(open));
      /* the open menu is pearl, so the header switches to dark text while it is open */
      if (darkHero) { if (open) head.classList.remove('on-dark'); else onScroll(); }
    });
    mnav.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !mnav.hidden) { closeMenu(); burger.focus(); } });
  }
})();
