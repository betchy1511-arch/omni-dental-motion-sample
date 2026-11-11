/* OMNI REDESIGN SAMPLE (11 Nov 2026): EN | ES switch on every page.
   ES turns on Google's free page translator for the whole site (sample only; the live
   WordPress site would use a translation plugin with real Spanish pages instead).
   The choice is kept in the googtrans cookie, so every page opens in the chosen language.
   Must load before omni.js and inner.js, which split some headings into single words. */
(function () {
  'use strict';
  var root = document.documentElement;
  var KEY = 'googtrans';

  function isES() { return /(?:^|;\s*)googtrans=\/en\/es(?:;|$)/.test(document.cookie); }
  function setLang(es) {
    var h = location.hostname;
    var tail = es ? '' : '; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    ['', '; domain=' + h, '; domain=.' + h].forEach(function (d) {
      document.cookie = KEY + '=' + (es ? '/en/es' : '') + '; path=/' + d + tail;
    });
  }

  var es = isES();
  var links = document.querySelectorAll('.lang a, .mnav-lang a');

  /* the old Spanish placeholder page (redesign/es/): send visitors to the Spanish home page */
  if (root.lang === 'es') {
    var home = document.querySelector('.lang a[hreflang="en"]');
    setLang(true);
    location.replace(home ? home.href : '../');
    return;
  }

  links.forEach(function (a) {
    var toES = a.getAttribute('hreflang') === 'es';
    if (toES === es) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    a.addEventListener('click', function (e) {
      e.preventDefault();
      if (toES === es) return;
      setLang(toES);
      location.reload();
    });
  });

  if (!es) return;
  root.classList.add('lang-es');

  /* keep names and patients' own review words exactly as written */
  document.querySelectorAll('.brand, .foot-brand, .rx-name, .rx-q, .rx-feature blockquote, .area-words, .lang, .mnav-lang a').forEach(function (el) {
    el.setAttribute('translate', 'no');
    el.classList.add('notranslate');
  });
  /* word-by-word effects would be translated one word at a time, so show those sentences whole */
  document.querySelectorAll('[data-words]').forEach(function (el) { el.removeAttribute('data-words'); });

  /* a line break that is hidden on phones would otherwise join two words ("modernaen") */
  document.querySelectorAll('h1 br, h2 br, h3 br').forEach(function (br) {
    br.parentNode.insertBefore(document.createTextNode(' '), br);
  });
  /* buttons whose words the page scripts swap (Pause, Read Full Review): the scripts write Spanish themselves */
  document.querySelectorAll('.rx-toggle, .vid-toggle, .mq-pause, .strip-pause').forEach(function (el) {
    el.setAttribute('translate', 'no');
    el.classList.add('notranslate');
  });
  document.querySelectorAll('.rx-toggle').forEach(function (b) {
    var t = b.querySelector('.rx-t'), by = b.querySelector('.vh');
    if (t) t.textContent = 'Leer reseña completa';
    if (by) by.textContent = by.textContent.replace(/^\s*by\s+/, ' de ');
  });
  document.querySelectorAll('.vid-toggle').forEach(function (b) { b.textContent = 'Pausar video'; });
  document.querySelectorAll('.mq-pause').forEach(function (b) { b.textContent = 'Pausar'; });

  /* "Home" comes back as "Hogar"; the usual Spanish menu word is "Inicio" */
  document.querySelectorAll('a').forEach(function (a) {
    if (a.children.length === 0 && a.textContent.trim() === 'Home') {
      a.textContent = 'Inicio';
      a.setAttribute('translate', 'no');
      a.classList.add('notranslate');
    }
  });

  /* the translator adds full stops to headings and short labels; our headings never end in one */
  var SHORT = 'h1,h2,h3,.eyebrow,.svc-name,.step-t,.mq-item,.btn,.svc-link,.area-k,.band-ins-k,.end-k,.rx-score-word,.dr-role,.nap dt,.ins-count';
  function tidy() {
    document.querySelectorAll(SHORT).forEach(function (el) {
      var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), t, last = null;
      while ((t = w.nextNode())) { if (t.nodeValue.trim() && !(t.parentNode.closest && t.parentNode.closest('.vh'))) last = t; }
      /* keep abbreviations such as Dr. Dra. Sr. St. U.S. EE. UU. */
      if (last && /[^.]\.\s*$/.test(last.nodeValue) && !/(?:\b[A-Z][a-z]{0,2}|\.[A-Za-z]+|\b[A-Z]{2})\.\s*$/.test(last.nodeValue)) last.nodeValue = last.nodeValue.replace(/\.\s*$/, '');
    });
  }
  var timer;
  new MutationObserver(function () { clearTimeout(timer); timer = setTimeout(tidy, 250); })
    .observe(document.body, { childList: true, subtree: true, characterData: true });

  var note = document.querySelector('.foot-note');
  if (note) {
    var p = document.createElement('p');
    p.className = 'foot-note';
    p.textContent = 'This Spanish version uses automatic translation for the design sample. The final Spanish will be reviewed before launch.';
    note.parentNode.insertBefore(p, note.nextSibling);
  }

  var css = document.createElement('style');
  css.textContent = 'body{top:0!important}iframe.skiptranslate,.goog-te-banner-frame,#goog-gt-tt,.goog-te-balloon-frame,.VIpgJd-ZVi9od-ORHb-OEVmcd,.VIpgJd-ZVi9od-aZ2wEe-wOHMyf{display:none!important}.goog-text-highlight{background:none!important;box-shadow:none!important}font{background:none!important;box-shadow:none!important}' +
    /* one-line headings were sized for the English words; Spanish runs longer, so let them wrap */
    '.lang-es .hero-h1,.lang-es .fit1,.lang-es .ben h2,.lang-es .st-tech .it-h,.lang-es .why h2 em.nw{white-space:normal!important}' +
    '.lang-es .btn{white-space:normal;text-align:center;line-height:1.25}';
  document.head.appendChild(css);

  /* small "translating" note until the first Spanish words appear (heading first), so the short wait does not look like a broken switch */
  var pill = document.createElement('div');
  pill.className = 'gt-wait notranslate';
  pill.setAttribute('translate', 'no');
  pill.setAttribute('role', 'status');
  pill.textContent = 'Traduciendo al español…';
  pill.style.cssText = 'position:fixed;left:50%;bottom:96px;transform:translateX(-50%);z-index:9999;padding:9px 18px;border-radius:999px;background:#1b1712;color:#f3e7c9;font:600 13px/1.2 Manrope,system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.3);pointer-events:none';
  document.body.appendChild(pill);
  function done() { if (pill.parentNode) pill.parentNode.removeChild(pill); }
  /* Google marks the page as translated when it starts; translated words arrive wrapped in <font> */
  var mo = new MutationObserver(function () {
    if (document.querySelector('main h1 font, main font')) { done(); mo.disconnect(); }
  });
  mo.observe(document.body, { childList: true, subtree: true });
  setTimeout(done, 15000);

  /* the page head normally starts the translator already; this is the fallback */
  if (!window.__gtLoading) {
    var box = document.createElement('div');
    box.id = 'gt-el';
    box.hidden = true;
    document.body.appendChild(box);
    window.googleTranslateElementInit = function () {
      new window.google.translate.TranslateElement({ pageLanguage: 'en', includedLanguages: 'es', autoDisplay: false }, 'gt-el');
    };
    var s = document.createElement('script');
    s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(s);
  }
})();
