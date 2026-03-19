/* ═══════════════════════════════════════════════════════════════════
   iLoveConvert — particles.js  v2.0
   Futuristic canvas background: particles + glass morphism integration
   • Dark mode  : deep-space glowing particles, red/purple/cyan palette,
                  connection lines, slow nebula drift
   • Light mode : soft pastel floating orbs, no lines, airy & minimal
   • Mobile     : reduced particle count, no connection lines, 60fps cap
   • Zero pointer-events — never interferes with UI
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ─── CONFIG ─────────────────────────────────────────────────── */
  var CFG = {
    dark: {
      particles   : isMobile() ? 38 : 72,
      colors      : ['#e53e3e','#7c3aed','#3b82f6','#06b6d4','#a855f7','#f97316'],
      bgAlpha     : 0.88,          /* canvas fade-trail alpha */
      minR        : 1.2,
      maxR        : 3.2,
      minSpeed    : 0.18,
      maxSpeed    : 0.55,
      connectDist : isMobile() ? 0 : 130,
      connectAlpha: 0.18,
      glow        : true,
      glowSize    : 3,
      nebulaCount : isMobile() ? 2 : 4,
      pulseSpeed  : 0.012,
    },
    light: {
      particles   : isMobile() ? 28 : 55,
      colors      : ['#e53e3e','#7c3aed','#93c5fd','#f9a8d4','#c4b5fd','#fde68a'],
      bgAlpha     : 0.82,
      minR        : 1.4,
      maxR        : 5.0,
      minSpeed    : 0.10,
      maxSpeed    : 0.38,
      connectDist : 0,
      connectAlpha: 0,
      glow        : true,
      glowSize    : 5,
      nebulaCount : isMobile() ? 2 : 3,
      pulseSpeed  : 0.008,
    }
  };

  var canvas, ctx, W, H, raf, particles, nebulae;
  var theme   = 'dark';
  var hidden  = false;
  var tick    = 0;

  /* ─── HELPERS ────────────────────────────────────────────────── */
  function isMobile() { return window.innerWidth <= 768; }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function hex2rgb(hex) {
    var r = parseInt(hex.slice(1,3),16);
    var g = parseInt(hex.slice(3,5),16);
    var b = parseInt(hex.slice(5,7),16);
    return {r:r, g:g, b:b};
  }

  /* ─── DETECT THEME ───────────────────────────────────────────── */
  function getTheme() {
    /* Both patterns: class on body OR data-theme on <html> */
    if (document.body && document.body.classList.contains('light-mode')) return 'light';
    var dt = document.documentElement.getAttribute('data-theme');
    if (dt === 'light') return 'light';
    return 'dark';
  }

  /* ─── PARTICLE CLASS ──────────────────────────────────────────── */
  function Particle(cfg) {
    this.reset(cfg);
  }
  Particle.prototype.reset = function (cfg) {
    this.x  = rand(0, W);
    this.y  = rand(0, H);
    this.r  = rand(cfg.minR, cfg.maxR);
    var spd = rand(cfg.minSpeed, cfg.maxSpeed);
    var ang = rand(0, Math.PI * 2);
    this.vx = Math.cos(ang) * spd;
    this.vy = Math.sin(ang) * spd;
    var col = cfg.colors[Math.floor(Math.random() * cfg.colors.length)];
    var rgb = hex2rgb(col);
    this.rgb   = rgb;
    this.col   = col;
    this.alpha = rand(0.55, 1.0);
    this.phase = rand(0, Math.PI * 2);   /* for pulse */
    /* subtle wobble */
    this.wx  = rand(0.3, 0.9) * (Math.random() < .5 ? 1 : -1);
    this.wy  = rand(0.3, 0.9) * (Math.random() < .5 ? 1 : -1);
    this.wf  = rand(0.005, 0.018);
    this.wamp= rand(0.2, 0.7);
  };
  Particle.prototype.update = function (cfg) {
    this.x += this.vx + Math.sin(tick * this.wf + this.phase) * this.wamp * 0.1;
    this.y += this.vy + Math.cos(tick * this.wf + this.phase) * this.wamp * 0.1;
    /* Soft wrap — fade at edges */
    var pad = 20;
    if (this.x < -pad) this.x = W + pad;
    if (this.x > W+pad) this.x = -pad;
    if (this.y < -pad) this.y = H + pad;
    if (this.y > H+pad) this.y = -pad;
    /* Pulse alpha */
    this.alpha = 0.55 + 0.45 * Math.abs(Math.sin(tick * cfg.pulseSpeed + this.phase));
  };
  Particle.prototype.draw = function (cfg) {
    ctx.save();
    if (cfg.glow) {
      ctx.shadowBlur  = this.r * cfg.glowSize + 2;
      ctx.shadowColor = this.col;
    }
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.col;
    ctx.fill();
    ctx.restore();
  };

  /* ─── NEBULA BLOBS ────────────────────────────────────────────── */
  function Nebula(cfg) {
    this.reset(cfg);
  }
  Nebula.prototype.reset = function (cfg) {
    this.x    = rand(W * 0.1, W * 0.9);
    this.y    = rand(H * 0.1, H * 0.9);
    this.rx   = rand(W * 0.12, W * 0.28);
    this.ry   = rand(H * 0.10, H * 0.22);
    var col   = cfg.colors[Math.floor(Math.random() * cfg.colors.length)];
    this.rgb  = hex2rgb(col);
    this.vx   = rand(-0.06, 0.06);
    this.vy   = rand(-0.04, 0.04);
    this.phase= rand(0, Math.PI*2);
    this.alpha= theme === 'dark' ? rand(0.018, 0.048) : rand(0.06, 0.14);
  };
  Nebula.prototype.update = function () {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < -this.rx || this.x > W + this.rx) this.vx *= -1;
    if (this.y < -this.ry || this.y > H + this.ry) this.vy *= -1;
  };
  Nebula.prototype.draw = function () {
    var pulse = 0.7 + 0.3 * Math.abs(Math.sin(tick * 0.005 + this.phase));
    var grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.rx * pulse);
    var a   = this.alpha * pulse;
    grd.addColorStop(0, 'rgba('+this.rgb.r+','+this.rgb.g+','+this.rgb.b+','+(a)+')');
    grd.addColorStop(1, 'rgba('+this.rgb.r+','+this.rgb.g+','+this.rgb.b+',0)');
    ctx.save();
    ctx.globalAlpha = 1;
    /* Elliptical stretch */
    ctx.scale(1, this.ry / this.rx);
    ctx.beginPath();
    ctx.arc(this.x, this.y * (this.rx / this.ry), this.rx * pulse, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();
    ctx.restore();
  };

  /* ─── CONNECTIONS ─────────────────────────────────────────────── */
  function drawConnections(cfg) {
    if (!cfg.connectDist) return;
    var dist = cfg.connectDist;
    var n    = particles.length;
    for (var i = 0; i < n; i++) {
      for (var j = i + 1; j < n; j++) {
        var dx = particles[i].x - particles[j].x;
        var dy = particles[i].y - particles[j].y;
        var d  = Math.sqrt(dx*dx + dy*dy);
        if (d < dist) {
          var a = cfg.connectAlpha * (1 - d / dist);
          ctx.save();
          ctx.globalAlpha = a;
          ctx.strokeStyle = particles[i].col;
          ctx.lineWidth   = 0.6;
          ctx.shadowBlur  = 4;
          ctx.shadowColor = particles[i].col;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  /* ─── BUILD SCENE ────────────────────────────────────────────── */
  function buildScene() {
    var cfg   = CFG[theme];
    particles = [];
    nebulae   = [];
    for (var i = 0; i < cfg.particles; i++) particles.push(new Particle(cfg));
    for (var j = 0; j < cfg.nebulaCount; j++) nebulae.push(new Nebula(cfg));
  }

  /* ─── BACKGROUND FILL ────────────────────────────────────────── */
  function fillBg(cfg) {
    if (theme === 'dark') {
      ctx.fillStyle = 'rgba(5,5,12,' + cfg.bgAlpha + ')';
    } else {
      ctx.fillStyle = 'rgba(245,244,255,' + cfg.bgAlpha + ')';
    }
    ctx.fillRect(0, 0, W, H);
  }

  /* ─── RENDER LOOP ────────────────────────────────────────────── */
  function loop() {
    raf = requestAnimationFrame(loop);
    if (hidden) return;

    var cfg = CFG[theme];
    tick++;

    fillBg(cfg);

    /* Nebulae first (background layer) */
    for (var n = 0; n < nebulae.length; n++) {
      nebulae[n].update();
      nebulae[n].draw();
    }

    /* Connection lines */
    drawConnections(cfg);

    /* Particles */
    for (var p = 0; p < particles.length; p++) {
      particles[p].update(cfg);
      particles[p].draw(cfg);
    }
  }

  /* ─── CANVAS SETUP ───────────────────────────────────────────── */
  function setupCanvas() {
    canvas = document.createElement('canvas');
    canvas.id = 'ilcParticleCanvas';

    var s = canvas.style;
    s.position   = 'fixed';
    s.top        = '0';
    s.left       = '0';
    s.width      = '100%';
    s.height     = '100%';
    s.zIndex     = '-1';
    s.pointerEvents = 'none';
    s.display    = 'block';

    document.body.insertBefore(canvas, document.body.firstChild);
    resize();
  }

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    /* Full first frame — no ghost trail */
    if (theme === 'dark') {
      ctx.fillStyle = '#05050c';
    } else {
      ctx.fillStyle = '#f5f4ff';
    }
    ctx.fillRect(0, 0, W, H);
  }

  /* ─── THEME CHANGE ───────────────────────────────────────────── */
  function onThemeChange() {
    var newTheme = getTheme();
    if (newTheme === theme) return;
    theme = newTheme;
    resize();
    buildScene();
  }

  /* Watch for theme changes via MutationObserver */
  function watchTheme() {
    var mo = new MutationObserver(onThemeChange);
    /* Watch body classList (light-mode class) */
    mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    /* Watch html data-theme */
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme','class'] });
  }

  /* ─── VISIBILITY ──────────────────────────────────────────────── */
  document.addEventListener('visibilitychange', function () {
    hidden = document.hidden;
  });

  /* ─── RESIZE ──────────────────────────────────────────────────── */
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      resize();
      buildScene();
    }, 200);
  }, { passive: true });

  /* ─── INJECT GLOBAL CSS ──────────────────────────────────────── */
  function injectCSS() {
    if (document.getElementById('ilc-particle-styles')) return;
    var s = document.createElement('style');
    s.id  = 'ilc-particle-styles';
    s.textContent = [
      /* === BASE LAYOUT FIX === */
      'html { overflow-x: hidden !important; }',
      'body { overflow-x: hidden !important; }',

      /* === CANVAS POSITION === */
      '#ilcParticleCanvas {',
      '  position: fixed; top:0; left:0; width:100%; height:100%;',
      '  z-index: -1; pointer-events: none; display: block;',
      '  max-width: none !important;',
      '}',

      /* === BODY BG — let canvas show through === */
      'body:not(.light-mode):not([data-theme="light"]) { background-color: #05050c !important; }',
      'body.light-mode, [data-theme="light"] body, html[data-theme="light"] body { background-color: #f5f4ff !important; }',

      /* === GLASS MORPHISM — DARK === */
      '.i-card, .tool-card, .i-upload-area, .i-box, .i-result,',
      '.i-faq-item, .i-hero, .i-opts, .i-seo-section,',
      '.dz, .opts, .res, .prev-card, #prev-card, #i-prev-card,',
      '.how-step, .wc, .ft-col { ',
      '  backdrop-filter: blur(14px) saturate(1.3) !important;',
      '  -webkit-backdrop-filter: blur(14px) saturate(1.3) !important;',
      '}',

      /* Glass for dark bg elements */
      'body:not(.light-mode):not([data-theme="light"]) .dz,',
      'body:not(.light-mode):not([data-theme="light"]) .opts,',
      'body:not(.light-mode):not([data-theme="light"]) .i-upload-area,',
      'body:not(.light-mode):not([data-theme="light"]) .how-step,',
      'body:not(.light-mode):not([data-theme="light"]) .wc {',
      '  background: rgba(12, 8, 28, 0.65) !important;',
      '  border-color: rgba(120, 80, 255, 0.18) !important;',
      '  box-shadow: 0 4px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04) !important;',
      '}',

      /* Glass for light bg elements */
      'body.light-mode .dz, [data-theme="light"] .dz,',
      'body.light-mode .opts, [data-theme="light"] .opts,',
      'body.light-mode .i-upload-area, [data-theme="light"] .i-upload-area,',
      'body.light-mode .how-step, [data-theme="light"] .how-step,',
      'body.light-mode .wc, [data-theme="light"] .wc {',
      '  background: rgba(255,255,255,0.72) !important;',
      '  border-color: rgba(124,58,237,0.12) !important;',
      '  box-shadow: 0 4px 24px rgba(124,58,237,0.07), inset 0 1px 0 rgba(255,255,255,0.9) !important;',
      '}',

      /* Nav glass upgrade */
      '.nav, #siteNav, #mainNav, .i-site-nav {',
      '  backdrop-filter: blur(24px) saturate(1.5) !important;',
      '  -webkit-backdrop-filter: blur(24px) saturate(1.5) !important;',
      '}',

      /* Upload hover glow */
      '.dz:hover, .dz.drag, .dz.over {',
      '  border-color: rgba(229,62,62,0.5) !important;',
      '  box-shadow: 0 0 0 3px rgba(229,62,62,0.12), 0 8px 40px rgba(124,58,237,0.2) !important;',
      '}',

      /* === MOBILE FIXES === */
      /* Prevent ANY horizontal overflow */
      '@media (max-width: 768px) {',
      '  html, body { width: 100%; max-width: 100vw; overflow-x: hidden !important; }',
      '  * { max-width: 100%; }',
      '  img, video, canvas:not(#ilcParticleCanvas), iframe { max-width: 100% !important; }',
      /* Reduce blur on mobile for perf */
      '  .i-card, .tool-card, .dz, .opts, .how-step, .wc {',
      '    backdrop-filter: blur(8px) !important;',
      '    -webkit-backdrop-filter: blur(8px) !important;',
      '  }',
      '  .nav, #siteNav, #mainNav, .i-site-nav {',
      '    backdrop-filter: blur(16px) !important;',
      '    -webkit-backdrop-filter: blur(16px) !important;',
      '  }',
      '}',

      /* === PREVENT SCROLL SHIFT ON DRAWER/MODAL OPEN === */
      'body.nav-open {',
      '  overflow: hidden !important;',
      '  position: fixed !important;',
      '  width: 100% !important;',
      '  left: 0 !important;',
      '  right: 0 !important;',
      '}',

      /* Mobile PWA banner above safe area */
      '@media (max-width: 480px) {',
      '  #ilcPwaBanner { padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px)) !important; }',
      '}',

    ].join('\n');

    (document.head || document.documentElement).appendChild(s);
  }

  /* ─── INIT ────────────────────────────────────────────────────── */
  function init() {
    injectCSS();
    theme = getTheme();
    setupCanvas();
    buildScene();
    watchTheme();
    loop();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());
