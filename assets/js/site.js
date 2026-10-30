/* =============================================================
   DIRECTION D — SHARED JAVASCRIPT
   Covers: header scroll state, mobile menu, reveal on scroll
   (no-JS fallback: content stays visible without this script),
   FAQ accordion, form mock handling.
   Generated: 2026-10-14
   ============================================================= */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── No-JS class removal ──────────────────────────────────────────
     Add class="no-js" to <html>; this script removes it on load.   */
  document.documentElement.classList.remove('no-js');

  /* ── Header scroll state ──────────────────────────────────────── */
  var header = document.getElementById('site-header');
  if (header) {
    function handleHeaderScroll() {
      header.classList.toggle('scrolled', window.scrollY > 60);
    }
    window.addEventListener('scroll', handleHeaderScroll, { passive: true });
    handleHeaderScroll();
  }

  /* ── Mobile nav ───────────────────────────────────────────────── */
  var navToggle = document.getElementById('navToggle');
  var mobileNav = document.getElementById('mobileNav');
  if (navToggle && mobileNav) {
    window.closeMobileNav = function () {
      mobileNav.classList.remove('open');
      mobileNav.setAttribute('aria-hidden', 'true');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };
    navToggle.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('open');
      mobileNav.setAttribute('aria-hidden', String(!open));
      navToggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    /* Close mobile nav on Escape */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { window.closeMobileNav(); }
    });
  }

  /* ── Scroll reveal (IntersectionObserver; no-JS fallback = visible) */
  if (prefersReduced) {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('is-visible');
    });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) {
      io.observe(el);
    });
  }

  /* ── FAQ accordion ────────────────────────────────────────────── */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var btn = item.querySelector('.faq-question');
    var answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;
    btn.addEventListener('click', function () {
      var isOpen = item.getAttribute('data-open') === 'true';
      /* Close all */
      document.querySelectorAll('.faq-item').forEach(function (i) {
        i.setAttribute('data-open', 'false');
        var q = i.querySelector('.faq-question');
        var a = i.querySelector('.faq-answer');
        if (q) q.setAttribute('aria-expanded', 'false');
        if (a) a.hidden = true;
      });
      /* Open this one if it was closed */
      if (!isOpen) {
        item.setAttribute('data-open', 'true');
        btn.setAttribute('aria-expanded', 'true');
        answer.hidden = false;
      }
    });
  });

  /* ── Form mock handling ───────────────────────────────────────── */
  document.querySelectorAll('form[data-mock]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var successEl = form.querySelector('.form-success');
      if (successEl) {
        form.querySelectorAll('.form-row, .form-consent, .form-disclaimer, button[type="button"], button[type="submit"]').forEach(function (el) {
          el.style.display = 'none';
        });
        successEl.style.display = 'block';
      }
    });
  });
  /* Also handle the onclick="return false" pattern */
  document.querySelectorAll('form[onsubmit]').forEach(function (form) {
    form.addEventListener('submit', function (e) { e.preventDefault(); });
  });

})();
