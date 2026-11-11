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

  /* ---- Phones: hero heading on one line, shrunk just enough to fit its column ---- */
  var phone = window.matchMedia('(max-width: 600px)');
  function fitH1() {
    var h = document.querySelector('.sh-h1');
    if (!h) return;
    h.style.fontSize = '';
    h.classList.toggle('fit1', phone.matches);
    if (!phone.matches) return;
    var fs = parseFloat(getComputedStyle(h).fontSize), min = 18;
    while (h.scrollWidth > h.clientWidth + 0.5 && fs > min) { fs -= 0.5; h.style.fontSize = fs + 'px'; }
    if (h.scrollWidth > h.clientWidth + 0.5) { h.classList.remove('fit1'); h.style.fontSize = ''; }
  }
  fitH1();

  /* ---- Laptops and up: explainer and process headings on one line (Beth, 11 Nov: "1 line") ---- */
  var wide = window.matchMedia('(min-width: 1025px)');
  function fitHeads() {
    document.querySelectorAll('.und h2, .proc-head h2').forEach(function (h) {
      h.style.fontSize = '';
      h.classList.toggle('fit1', wide.matches);
      if (!wide.matches) return;
      var fs = parseFloat(getComputedStyle(h).fontSize);
      while (h.scrollWidth > h.clientWidth + 0.5 && fs > 30) { fs -= 0.5; h.style.fontSize = fs + 'px'; }
      if (h.scrollWidth > h.clientWidth + 0.5) { h.classList.remove('fit1'); h.style.fontSize = ''; }
    });
  }
  fitHeads();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitHeads);
  window.addEventListener('resize', fitHeads);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitH1);
  window.addEventListener('resize', fitH1);

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

  /* ---- Technology tiles: play the scan once when the grid comes into view ---- */
  var scanEl = document.querySelector('[data-scan]');
  if (scanEl) {
    if ('IntersectionObserver' in window && motion) {
      var sio = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { scanEl.classList.add('scan'); sio.disconnect(); }
      }, { threshold: 0.25 });
      sio.observe(scanEl);
    } else scanEl.classList.add('scan');
  }

  /* ---- Statement: wrap words so they light up in reading order ---- */
  var lines = [];
  if (motion) {
    document.querySelectorAll('[data-words]').forEach(function (el) {
      /* wrap every word in a span, keeping highlighted <em> phrases intact */
      (function wrap(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (c) {
          if (c.nodeType === 3) {
            var frag = document.createDocumentFragment();
            c.textContent.split(/(\s+)/).forEach(function (part) {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
              var sp = document.createElement('span');
              sp.className = 'w';
              sp.textContent = part;
              frag.appendChild(sp);
            });
            node.replaceChild(frag, c);
          } else if (c.nodeType === 1) wrap(c);
        });
      })(el);
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
  var sayPh = Array.prototype.slice.call(document.querySelectorAll('.say-ph'));
  var sayLine = document.querySelector('.say-line');
  var sayRates = [0.5, -0.35, 0.8];

  var ticking = false;
  function update() {
    ticking = false;
    var vh = window.innerHeight;
    var hb = hero ? hero.getBoundingClientRect().bottom : 0;
    /* phones: the clear header would sit over the hero text once you scroll, so it turns pearl at once */
    /* over the dark hero the header stays dark: clear at the very top, dark glass once scrolled */
    if (darkHero && (!mnav || mnav.hidden)) {
      head.classList.toggle('on-dark', hb > 90);
      head.classList.toggle('solid', hb > 90 && window.scrollY > 8);
    }
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

    /* statement: photos drift at different speeds, the gold line draws as the words light */
    var sayEl = sayLine ? sayLine.closest('.say') : null;
    if (sayEl) {
      var sr = sayEl.getBoundingClientRect();
      var sq = Math.min(1, Math.max(-1, (sr.top + sr.height / 2 - vh / 2) / vh));
      sayPh.forEach(function (ph, i) {
        if (motion) ph.style.setProperty('--y', (sq * 120 * sayRates[i % sayRates.length]).toFixed(1) + 'px');
      });
      if (motion) sayLine.style.setProperty('--p', Math.min(1, Math.max(0, (vh * 0.8 - sr.top) / (sr.height * 0.9))).toFixed(3));
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

  /* ---- Moving strip in the end banner: pause button (WCAG 2.2.2) ---- */
  var mqBtn = document.querySelector('.mq-pause');
  if (mqBtn) mqBtn.addEventListener('click', function () {
    var on = mqBtn.parentNode.classList.toggle('paused');
    mqBtn.setAttribute('aria-pressed', String(on));
    mqBtn.textContent = on ? 'Play' : 'Pause';
  });

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
      if (darkHero) { if (open) { head.classList.remove('on-dark'); head.classList.remove('solid'); } else onScroll(); }
    });
    mnav.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !mnav.hidden) { closeMenu(); burger.focus(); } });
  }
})();
