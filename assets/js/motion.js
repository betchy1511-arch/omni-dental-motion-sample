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
})();
