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
            s.style.animationDelay = (1.0 + n++ * 0.24).toFixed(2) + 's';
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
  var userPaused = false, inView = true, heroGone = false;
  var cardVid = document.querySelector('.vcard-video');
  var cardGone = false;
  var cardEl = document.querySelector('.hero-card');
  if (cardEl) {
    cardEl.addEventListener('animationend', function (ev) { if (ev.target === cardEl && ev.animationName === 'cardOut') { cardGone = true; syncVideo(); } });
    cardEl.addEventListener('animationstart', function (ev) { if (ev.target === cardEl && ev.animationName === 'cardGrow') { cardGone = false; syncVideo(); } });
  }
  function syncVideo() {
    if (!video) return;
    var on = desk.matches && !rm.matches && !saveData;
    if (vidBtn) vidBtn.hidden = !on;
    if (cardVid) {
      if (on && !userPaused && inView && !heroGone && !cardGone) {
        if (!cardVid.getAttribute('src')) { cardVid.muted = true; cardVid.src = 'assets/img/omni-card.mp4'; }
        var cq = cardVid.play(); if (cq && cq.catch) cq.catch(function () {});
      } else if (!cardVid.paused) cardVid.pause();
    }
    if (on && !userPaused && inView && !heroGone) {
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

  /* ---- Hero video card: opens the practice video in a dialog ---- */
  var vcard = document.querySelector('.hero-vcard');
  var dlg = document.getElementById('vid-dlg');
  if (vcard && dlg && dlg.showModal) {
    var dv = dlg.querySelector('video');
    vcard.addEventListener('click', function () {
      if (!dv.getAttribute('src')) dv.src = 'assets/img/omni-hero.mp4';
      dlg.showModal();
      var pp = dv.play(); if (pp && pp.catch) pp.catch(function () {});
    });
    dlg.querySelector('.vid-dlg-x').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', function () { dv.pause(); if (!heroEl || !heroEl.classList.contains('done')) vcard.focus({ preventScroll: true }); });
  } else if (vcard) {
    /* no <dialog> support: open the video file itself */
    vcard.addEventListener('click', function () { window.location.href = 'assets/img/omni-hero.mp4'; });
  }

  /* ---- Header: transparent over the dark hero, pearl after ---- */
  var head = document.getElementById('head');
  var pin = document.querySelector('.hero-pin');
  var stage = document.querySelector('.stage');
  var heroEl = document.querySelector('.hero');
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
  /* Final panel edge: 55% of the width, or further right if the headline would sit under it */
  function panelLeft() {
    if (!h1 || !stage) return;
    var rg = document.createRange(); rg.selectNodeContents(h1);
    var right = 0;
    Array.prototype.forEach.call(rg.getClientRects(), function (r) { right = Math.max(right, r.right); });
    var w = document.documentElement.clientWidth;
    stage.parentNode.style.setProperty('--pl', Math.min(70, Math.max(49.5, (right + 40) / w * 100)).toFixed(2));
    /* the intro card sits centred on the panel edge, nudged right if it would touch the text column */
    var pl = Math.min(70, Math.max(49.5, (right + 40) / w * 100));
    var copy = document.querySelector('.hero-copy');
    if (copy && h1) {
      var cardW = Math.min(w * 0.26, 520);
      var textRight = Math.max(right, h1.getBoundingClientRect().left + Math.min(w * 0.27, 520));
      var cardLeft = Math.min(Math.max(w * pl / 100 - cardW / 2, textRight + 32), w - cardW - 24);
      stage.parentNode.style.setProperty('--cardx', Math.round(cardLeft) + 'px');
    }
  }
  panelLeft();
  window.addEventListener('resize', panelLeft);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(panelLeft);
  setTimeout(panelLeft, 2600); /* after the headline words finish arriving */

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
    var eNow = 0;

    /* hero progress: 0 at the top (panel showing), 1 when the panel has risen away */
    if (desk.matches && !rm.matches) {
      var travel = Math.max(1, pin.offsetHeight - vh);
      var t = Math.min(1, Math.max(0, -pr.top / travel));
      var e = t * t * (3 - 2 * t); /* smoothstep: the panel rises evenly with the scroll */
      eNow = e;
      heroEl.style.setProperty('--e', e.toFixed(4));
      heroEl.classList.toggle('done', e > .92);
      var g = e > .92; if (g !== heroGone) { heroGone = g; syncVideo(); }
    } else {
      heroEl.style.removeProperty('--e');
      heroEl.classList.remove('done');
      if (heroGone) { heroGone = false; syncVideo(); }
    }

    var live = desk.matches && !rm.matches;
    if (strip && track) {
      if (live) {
        var sr = strip.getBoundingClientRect();
        var sq = Math.min(1, Math.max(0, (vh - sr.top) / (vh + sr.height)));
        var maxX = Math.max(0, track.scrollWidth - track.parentNode.clientWidth);
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
      jsteps.forEach(function (st, i) {
        st.classList.toggle('on', i === active);
        if (live && i === active) st.setAttribute('aria-current', 'step'); else st.removeAttribute('aria-current');
      });
      pts.forEach(function (pt, i) { pt.classList.toggle('on', i === active); });
    }

    /* the visible hero ends at its rising edge, not at the bottom of the pin */
    var heroBottom = (desk.matches && !rm.matches) ? Math.min(pr.bottom, (1 - eNow) * vh) : pr.bottom;
    head.classList.toggle('on-dark', desk.matches && heroBottom > 90);
    if (floatCta) floatCta.classList.toggle('show', heroBottom < vh * 0.4);

    lines.forEach(function (l, k) {
      var r = lineRects[k];
      var q = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (vh * 0.45)));
      /* while the hero's edge is still rising over the statement, light the words with the edge */
      if (live && eNow < 1 && l.el.closest('.statement')) q = Math.min(1, Math.max(0, (eNow - 0.35) / 0.65));
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

  /* ---- Scrolling strip: pause button (WCAG 2.2.2) ---- */
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
