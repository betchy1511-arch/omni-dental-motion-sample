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
  var vidBtn = document.querySelector('.vid-toggle');
  var userPaused = false, inView = true;
  function syncVideo() {
    if (!video) return;
    var on = desk.matches && !rm.matches && !saveData;
    if (vidBtn) vidBtn.hidden = !on;
    if (on && !userPaused && inView) {
      if (!video.getAttribute('src')) { video.src = 'assets/img/omni-hero.mp4'; video.muted = true; }
      var p = video.play();
      if (p && p.catch) p.catch(function () { /* autoplay refused: poster stays */ });
    } else if (!video.paused) {
      video.pause();
    }
  }
  /* Pause control (WCAG 2.2.2) and pause when the hero is off screen */
  if (vidBtn) vidBtn.addEventListener('click', function () {
    userPaused = !userPaused;
    vidBtn.setAttribute('aria-pressed', String(userPaused));
    vidBtn.textContent = userPaused ? 'Play video' : 'Pause video';
    syncVideo();
  });
  if (video && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { inView = en[0].isIntersecting; syncVideo(); }).observe(video);
  }
  syncVideo();
  if (desk.addEventListener) desk.addEventListener('change', syncVideo);
  if (rm.addEventListener) rm.addEventListener('change', syncVideo);

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

  /* ---- Office strip, floating photos and first-visit dial ---- */
  var strip = document.querySelector('.strip');
  var track = document.querySelector('.strip-track');
  var floatPin = document.querySelector('.float-pin');
  var fps = Array.prototype.slice.call(document.querySelectorAll('.fp'));
  var speeds = [0.9, 1.3, 1.6, 1.1];
  var jPin = document.querySelector('.journey-pin');
  var wheel = document.querySelector('.dial-wheel');
  var jsteps = Array.prototype.slice.call(document.querySelectorAll('.jstep'));
  var STEP_DEG = 32, pts = [];
  if (wheel) {
    jsteps.forEach(function (st, i) {
      var pt = document.createElement('span');
      pt.className = 'dial-pt';
      pt.style.setProperty('--a', (i * STEP_DEG) + 'deg');
      pt.innerHTML = '<span class="dial-dot"></span><span class="dial-badge">' + (i + 1) + '</span>';
      wheel.appendChild(pt);
      pts.push(pt);
    });
  }
  function prog(el, vh) {
    var r = el.getBoundingClientRect();
    return Math.min(1, Math.max(0, -r.top / Math.max(1, el.offsetHeight - vh)));
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

    var live = desk.matches && !rm.matches;
    if (strip && track) {
      if (live) {
        var sr = strip.getBoundingClientRect();
        var sq = Math.min(1, Math.max(0, (vh - sr.top) / (vh + sr.height)));
        var maxX = Math.max(0, track.scrollWidth - document.documentElement.clientWidth);
        track.style.setProperty('--x', (-sq * maxX).toFixed(1) + 'px');
      } else track.style.removeProperty('--x');
    }
    if (floatPin) {
      var fq = prog(floatPin, vh);
      fps.forEach(function (f, i) {
        if (live) f.style.setProperty('--y', ((0.35 - fq) * speeds[i % speeds.length] * vh).toFixed(1) + 'px');
        else f.style.removeProperty('--y');
      });
    }
    if (jPin && wheel) {
      var jq = live ? prog(jPin, vh) : 0;
      var pos = jq * (jsteps.length - 1);
      var active = Math.round(pos);
      wheel.style.setProperty('--rot', (-pos * STEP_DEG).toFixed(2) + 'deg');
      jsteps.forEach(function (st, i) { st.classList.toggle('on', i === active); });
      pts.forEach(function (pt, i) { pt.classList.toggle('on', i === active); });
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
    function closeMenu() { mnav.hidden = true; burger.setAttribute('aria-expanded', 'false'); }
    if (desk.addEventListener) desk.addEventListener('change', function (e) { if (e.matches) closeMenu(); });
    burger.addEventListener('click', function () {
      var open = mnav.hidden;
      mnav.hidden = !open;
      burger.setAttribute('aria-expanded', String(open));
    });
    mnav.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !mnav.hidden) { closeMenu(); burger.focus(); } });
  }
})();
