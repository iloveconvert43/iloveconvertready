/* iLoveConvert – site.js
   Handles: theme toggle, dark mode modal, mobile nav, share button
   Injected into every page. Tool logic is NEVER touched. */
(function () {
  'use strict';

  /* ── THEME ───────────────────────────────── */
  function getTheme() { return localStorage.getItem('ilc_theme') || 'light'; }
  function applyTheme(t) {
    if (t === 'dark') {
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
    }
    const btn = document.getElementById('siteThemeBtn');
    if (btn) btn.textContent = t === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('ilc_theme', t);
  }
  window.siteToggleTheme = function () {
    applyTheme(getTheme() === 'dark' ? 'light' : 'dark');
  };
  window.siteEnableDark = function () {
    localStorage.setItem('ilc_theme_asked', '1');
    applyTheme('dark');
    const m = document.getElementById('themeModal');
    if (m) m.classList.add('hidden');
  };
  window.siteStayLight = function () {
    localStorage.setItem('ilc_theme_asked', '1');
    applyTheme('light');
    const m = document.getElementById('themeModal');
    if (m) m.classList.add('hidden');
  };

  /* Apply theme ASAP (before paint) */
  applyTheme(getTheme());

  /* ── MOBILE NAV ───────────────────────────── */
  var mobOpen = false;
  window.siteTogleMob = function () {
    mobOpen = !mobOpen;
    var nav = document.getElementById('siteMobNav');
    var ham = document.getElementById('siteHamBtn');
    if (!nav) return;
    if (mobOpen) {
      nav.classList.add('open');
      if (ham) {
        ham.setAttribute('aria-expanded', 'true');
        var spans = ham.querySelectorAll('span');
        if (spans[0]) spans[0].style.transform = 'rotate(45deg) translate(5px,5px)';
        if (spans[1]) spans[1].style.opacity = '0';
        if (spans[2]) spans[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
      }
    } else {
      siteCloseMob();
    }
  };
  window.siteCloseMob = function () {
    mobOpen = false;
    var nav = document.getElementById('siteMobNav');
    var ham = document.getElementById('siteHamBtn');
    if (nav) nav.classList.remove('open');
    if (ham) {
      ham.setAttribute('aria-expanded', 'false');
      ham.querySelectorAll('span').forEach(function (s) {
        s.style.transform = '';
        s.style.opacity = '';
      });
    }
  };
  document.addEventListener('click', function (e) {
    if (mobOpen && !e.target.closest('#siteMobNav') && !e.target.closest('#siteHamBtn')) {
      siteCloseMob();
    }
  });

  /* ── SHARE ────────────────────────────────── */
  window.siteShare = function () {
    var popup = document.getElementById('sharePopup');
    if (!popup) return;
    popup.classList.toggle('open');
    document.addEventListener('click', function close(e) {
      if (!e.target.closest('#shareBtn')) {
        popup.classList.remove('open');
        document.removeEventListener('click', close);
      }
    });
  };
  window.siteCopyLink = function () {
    navigator.clipboard.writeText(location.href).then(function () {
      var btn = document.querySelector('#sharePopup .sp-copy-label');
      if (btn) { var old = btn.textContent; btn.textContent = '✅ Copied!'; setTimeout(function () { btn.textContent = old; }, 1800); }
    });
    document.getElementById('sharePopup').classList.remove('open');
  };
  window.siteShareNative = function () {
    if (navigator.share) {
      navigator.share({ title: document.title, url: location.href });
    } else {
      document.getElementById('sharePopup').classList.add('open');
    }
  };

  /* ── NAV SHADOW ON SCROLL ─────────────────── */
  window.addEventListener('scroll', function () {
    var nav = document.getElementById('siteNav');
    if (nav) nav.style.boxShadow = window.scrollY > 8 ? '0 2px 20px rgba(0,0,0,.35)' : '';
  }, { passive: true });

  /* ── INTERSECTION OBSERVER (fade-in) ─────── */
  if (typeof IntersectionObserver !== 'undefined') {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.anim-up').forEach(function (el) { io.observe(el); });
  }

  /* ── DARK MODE MODAL ─────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    // Only show on homepage, only once
    var isHome = location.pathname === '/' || location.pathname.endsWith('index.html') || location.pathname === '';
    if (isHome && !localStorage.getItem('ilc_theme_asked') && !localStorage.getItem('ilc_theme')) {
      setTimeout(function () {
        var m = document.getElementById('themeModal');
        if (m) m.classList.remove('hidden');
      }, 1600);
    }
  });

}());
