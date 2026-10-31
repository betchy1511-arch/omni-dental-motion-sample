/* OMNI MOTION SAMPLE (31 Oct 2026): hero video + reveal stagger.
   Runs after site.js. Reduced motion: still image only, no stagger. */
(function () {
  'use strict';

  var rm = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = rm.matches;
  var wide = window.matchMedia('(min-width: 769px)').matches;
  var saveData = navigator.connection && navigator.connection.saveData;

  /* Hero video: desktop only, never under reduced motion or data saver */
  var panel = document.querySelector('.hero-photo-panel');
  if (panel && !reduced && wide && !saveData) {
    var v = document.createElement('video');
    v.className = 'om-video';
    v.muted = true; v.loop = true; v.autoplay = true;
    v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
    v.setAttribute('preload', 'metadata');
    v.setAttribute('aria-hidden', 'true');
    v.src = 'assets/omni-hero.mp4';
    v.addEventListener('playing', function () { v.classList.add('is-playing'); });
    panel.appendChild(v);
    var p = v.play();
    if (p && p.catch) p.catch(function () { /* autoplay refused: the still stays */ });
    /* Reduced motion switched on later: stop and remove the video */
    var stop = function (e) { if (e.matches && v.parentNode) { v.pause(); v.remove(); } };
    if (rm.addEventListener) rm.addEventListener('change', stop);
  }

  /* Stagger sibling reveals (cards, steps) so they arrive one after another */
  if (!reduced) {
    var parents = [];
    document.querySelectorAll('.reveal').forEach(function (el) {
      if (parents.indexOf(el.parentElement) === -1) parents.push(el.parentElement);
    });
    parents.forEach(function (parent) {
      var kids = Array.prototype.filter.call(parent.children, function (c) {
        return c.classList.contains('reveal');
      });
      if (kids.length < 2) return;
      /* Delay by column so each row arrives left to right */
      var top0 = kids[0].offsetTop;
      var n = kids.filter(function (k) { return k.offsetTop === top0; }).length || 1;
      kids.forEach(function (k, i) {
        k.style.transitionDelay = ((i % n) * 110) + 'ms';
      });
    });
  }

  /* Big outlined step numbers (decorative, hidden from screen readers) */
  document.querySelectorAll('.steps-grid .step-card').forEach(function (card, i) {
    var b = document.createElement('span');
    b.className = 'om-bignum';
    b.setAttribute('aria-hidden', 'true');
    b.textContent = ('0' + (i + 1)).slice(-2);
    card.insertBefore(b, card.firstChild);
  });

  if (reduced) return;

  /* Intro lines: wrap each word so it can light up in reading order */
  var lines = [];
  document.querySelectorAll('#services .section-intro, #your-visit .section-header-center p').forEach(function (p) {
    if (p.children.length) return; /* plain text only */
    var words = p.textContent.trim().split(/\s+/);
    p.textContent = '';
    words.forEach(function (w, i) {
      var s = document.createElement('span');
      s.className = 'om-w';
      s.textContent = w;
      p.appendChild(s);
      if (i < words.length - 1) p.appendChild(document.createTextNode(' '));
    });
    lines.push({ el: p, words: p.querySelectorAll('.om-w') });
  });

  /* Service photos: gentle drift, desktop only (checked live so a resize or rotation is respected) */
  var wideMq = window.matchMedia('(min-width: 769px)');
  var photos = Array.prototype.slice.call(document.querySelectorAll('.service-card-photo img'));

  var ticking = false;
  function update() {
    ticking = false;
    var vh = window.innerHeight;
    lines.forEach(function (l) {
      var r = l.el.getBoundingClientRect();
      /* 0 when the line enters the lower part of the screen, 1 by the middle */
      var p = Math.min(1, Math.max(0, (vh * 0.9 - r.top) / (vh * 0.4)));
      var lit = Math.round(p * l.words.length);
      for (var i = 0; i < l.words.length; i++) l.words[i].classList.toggle('on', i < lit);
    });
    var drift = wideMq.matches;
    /* read every frame position first, then write, so the browser lays out once */
    var rects = photos.map(function (img) { return img.parentNode.getBoundingClientRect(); });
    photos.forEach(function (img, i) {
      if (!drift) { img.style.removeProperty('--om-py'); return; }
      var r = rects[i];
      if (r.bottom < 0 || r.top > vh) return;
      /* clamp so the shift never exceeds the zoom headroom (14px at scale 1.16) */
      var c = Math.max(-0.5, Math.min(0.5, (r.top + r.height / 2 - vh / 2) / vh));
      img.style.setProperty('--om-py', (c * -26).toFixed(1) + 'px');
    });
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
