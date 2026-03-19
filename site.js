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

  /* ── PWA INSTALL PROMPT ──────────────────── */
  (function () {
    var deferredPrompt = null;
    var DISMISSED_KEY  = 'ilc_pwa_dismissed';

    /* Capture the browser's install event */
    window.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault();
      deferredPrompt = e;

      /* Don't show if user dismissed in this session */
      if (sessionStorage.getItem(DISMISSED_KEY)) return;

      /* Slight delay so the page settles first */
      setTimeout(showBanner, 2500);
    });

    function showBanner() {
      if (document.getElementById('ilcPwaBanner')) return; /* already shown */

      var banner = document.createElement('div');
      banner.id = 'ilcPwaBanner';
      banner.setAttribute('role', 'dialog');
      banner.setAttribute('aria-label', 'Install iLoveConvert app');
      banner.innerHTML =
        '<div class="ilc-pwa-inner">' +
          '<span class="ilc-pwa-icon">📲</span>' +
          '<div class="ilc-pwa-text">' +
            '<strong>Install iLoveConvert</strong>' +
            '<span>Add to your home screen for instant access — works offline too!</span>' +
          '</div>' +
          '<button id="ilcPwaInstall" class="ilc-pwa-btn-yes">Install</button>' +
          '<button id="ilcPwaDismiss" class="ilc-pwa-btn-no" aria-label="Dismiss">✕</button>' +
        '</div>';

      /* Inline styles so no CSS file change is needed */
      var style = document.createElement('style');
      style.textContent =
        '#ilcPwaBanner{position:fixed;bottom:0;left:0;right:0;z-index:99999;' +
        'background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);' +
        'border-top:2px solid #e53e3e;padding:12px 16px;' +
        'animation:ilcPwaSlideUp .35s ease;box-shadow:0 -4px 24px rgba(0,0,0,.45);}' +
        '.ilc-pwa-inner{display:flex;align-items:center;gap:12px;max-width:620px;margin:0 auto;}' +
        '.ilc-pwa-icon{font-size:2rem;flex-shrink:0;}' +
        '.ilc-pwa-text{flex:1;min-width:0;}' +
        '.ilc-pwa-text strong{display:block;color:#fff;font-size:.95rem;font-weight:700;}' +
        '.ilc-pwa-text span{display:block;color:#a0aec0;font-size:.8rem;margin-top:2px;}' +
        '.ilc-pwa-btn-yes{background:#e53e3e;color:#fff;border:none;border-radius:8px;' +
        'padding:8px 18px;font-size:.85rem;font-weight:700;cursor:pointer;white-space:nowrap;' +
        'transition:background .2s;}' +
        '.ilc-pwa-btn-yes:hover{background:#c53030;}' +
        '.ilc-pwa-btn-no{background:transparent;color:#718096;border:none;font-size:1.1rem;' +
        'cursor:pointer;padding:4px 8px;line-height:1;flex-shrink:0;}' +
        '@keyframes ilcPwaSlideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}' +
        '@media(max-width:480px){.ilc-pwa-text span{display:none;}' +
        '.ilc-pwa-btn-yes{padding:8px 12px;}}';

      document.head.appendChild(style);
      document.body.appendChild(banner);

      document.getElementById('ilcPwaInstall').addEventListener('click', function () {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function (result) {
          if (result.outcome === 'accepted') {
            removeBanner();
          }
          deferredPrompt = null;
        });
      });

      document.getElementById('ilcPwaDismiss').addEventListener('click', function () {
        sessionStorage.setItem(DISMISSED_KEY, '1');
        removeBanner();
      });
    }

    function removeBanner() {
      var b = document.getElementById('ilcPwaBanner');
      if (b) {
        b.style.transition = 'transform .25s ease, opacity .25s ease';
        b.style.transform  = 'translateY(100%)';
        b.style.opacity    = '0';
        setTimeout(function () { b.remove(); }, 260);
      }
    }

    /* Handle successful install */
    window.addEventListener('appinstalled', function () {
      deferredPrompt = null;
      removeBanner();
    });
  }());

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
