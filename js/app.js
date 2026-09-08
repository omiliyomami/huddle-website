/* HuddleShift homepage — interactions */
(function () {
  'use strict';
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var ref = function (name) { return $('[data-ref="' + name + '"]'); };
  var bind = function (name, value) {
    $$('[data-bind="' + name + '"]').forEach(function (el) { el.textContent = value; });
  };

  var DEPTS = [
    { label: 'FRONT OF HOUSE', scheduled: 18, in: 17, late: 1, open: 2,
      rows: [['Emma', '08:00–16:00', 'On site'], ['Jack', '12:00–20:00', 'On site'], ['Sophie', '16:00–00:00', 'Upcoming']],
      note: 'Front of House is fully staffed for tonight.' },
    { label: 'KITCHEN', scheduled: 14, in: 12, late: 2, open: 1,
      rows: [['Noah', '07:00–15:00', 'On site'], ['Liam', '11:00–19:00', '6 min late'], ['Chloe', '15:00–23:00', 'Upcoming']],
      note: 'Kitchen is one short for the evening service.' },
    { label: 'BAR', scheduled: 8, in: 6, late: 0, open: 3,
      rows: [['Grace', '18:00–02:00', 'Upcoming'], ['Mia', '18:00–02:00', 'Upcoming'], ['Ethan', '20:00–02:00', 'Open shift']],
      note: 'The Bar is one person below planned coverage tonight.' },
    { label: 'MANAGEMENT', scheduled: 4, in: 4, late: 0, open: 0,
      rows: [['Olivia', '09:00–18:00', 'On site'], ['Adam', '10:00–19:00', 'On site'], ['Ruby', '14:00–23:00', 'On site']],
      note: 'All managers are on site today.' }
  ];

  /* ---------- department switcher ---------- */
  function renderDept(i) {
    var d = DEPTS[i];
    bind('dLabel', d.label);
    bind('dScheduled', d.scheduled);
    bind('dIn', d.in);
    bind('dLate', d.late);
    bind('dOpen', d.open);
    bind('dNote', d.note);
    d.rows.forEach(function (r, n) {
      bind('dRow' + n + 'Name', r[0]);
      bind('dRow' + n + 'Time', r[1]);
      bind('dRow' + n + 'State', r[2]);
    });
    $$('[data-dept]').forEach(function (el) {
      var on = Number(el.getAttribute('data-dept')) === i;
      el.style.background = on ? '#FFFFFF' : 'transparent';
      el.style.color = on ? '#050505' : '#B8B8B8';
      el.style.borderColor = on ? '#FFFFFF' : 'rgba(255,255,255,0.16)';
      el.style.cursor = 'pointer';
    });
  }
  $$('[data-dept]').forEach(function (el) {
    el.addEventListener('click', function () { renderDept(Number(el.getAttribute('data-dept'))); });
  });
  renderDept(0);

  /* ---------- hero video ---------- */
  var video = ref('heroVideoRef');
  if (video) {
    video.muted = true; video.loop = true; video.playsInline = true;
    var play = function () { var p = video.play(); if (p && p.catch) p.catch(function () {}); };
    play();
    video.addEventListener('canplay', play, { once: true });
  }

  /* ---------- rotating AI conversations ---------- */
  function rotate(host, ms) {
    if (!host) return;
    var items = $$('[data-convo]', host);
    if (items.length < 2) return;
    var i = 0;
    setInterval(function () {
      i = (i + 1) % items.length;
      items.forEach(function (el, n) { el.style.opacity = n === i ? '1' : '0'; });
    }, ms);
  }
  rotate(ref('convoRef'), 4400);
  rotate(ref('entConvoRef'), 4800);

  /* ---------- AI schedule generation ---------- */
  var grid = ref('gridRef');
  var status = ref('aiStatusRef');
  var generating = false;

  function runGenerate() {
    if (!grid || generating) return;
    generating = true;
    if (status) { status.textContent = 'BUILDING…'; status.style.color = '#00FFFF'; }
    var cells = $$('[data-cell]', grid);
    cells.forEach(function (c) { c.style.background = 'rgba(255,255,255,0.035)'; c.textContent = ''; });
    var shifts = cells.filter(function (c) { return c.dataset.shift; });
    shifts.forEach(function (c, i) {
      setTimeout(function () {
        var accent = c.hasAttribute('data-accent');
        c.style.transition = 'background 320ms cubic-bezier(.16,1,.3,1)';
        c.style.background = accent ? '#00FFFF' : 'rgba(255,255,255,0.14)';
        c.style.color = accent ? '#050505' : '#B8B8B8';
        c.style.fontSize = '10.5px';
        c.style.display = 'flex';
        c.style.alignItems = 'center';
        c.style.justifyContent = 'center';
        c.textContent = c.dataset.shift;
        if (c.animate) {
          c.animate([{ transform: 'translateY(6px)', opacity: 0.2 }, { transform: 'none', opacity: 1 }],
            { duration: 320, easing: 'cubic-bezier(.16,1,.3,1)' });
        }
        if (i === shifts.length - 1 && status) {
          status.textContent = 'READY TO REVIEW';
          status.style.color = '#00FFFF';
        }
      }, 260 + i * 90);
    });
    setTimeout(function () { generating = false; }, 260 + shifts.length * 90 + 400);
  }

  var generateBtn = $('[data-action="generate"]');
  if (generateBtn) {
    generateBtn.style.cursor = 'pointer';
    generateBtn.addEventListener('click', function () { generating = false; runGenerate(); });
  }
  if (grid && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { runGenerate(); io.disconnect(); } });
    }, { threshold: 0.35 });
    io.observe(grid);
  }

  /* ---------- footer wordmark auto-fit ---------- */
  var wordmark = ref('wordmarkRef');
  function fitWordmark() {
    if (!wordmark || !wordmark.parentElement) return;
    var target = wordmark.parentElement.clientWidth * 0.985;
    if (!target) return;
    var measure = function () {
      var r = document.createRange();
      r.selectNodeContents(wordmark);
      return r.getBoundingClientRect().width;
    };
    var size = target * 0.16;
    wordmark.style.fontSize = size + 'px';
    for (var i = 0; i < 24; i++) {
      var w = measure();
      if (!w) break;
      var next = size * (target / w);
      var done = Math.abs(next - size) < 0.4;
      size = next;
      wordmark.style.fontSize = size + 'px';
      if (done) break;
    }
    wordmark.style.height = 'auto';
  }
  fitWordmark();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitWordmark);

  /* ---------- scroll: nav chrome + contextual sticky CTA ---------- */
  var nav = ref('navRef');
  var ent = ref('entRef');
  var stickyLink = ref('stickyLinkRef');
  var inEnt = null;

  function onScroll() {
    if (nav) {
      var on = window.scrollY > 40;
      nav.style.background = on ? 'rgba(5,5,5,0.78)' : 'transparent';
      nav.style.backdropFilter = on ? 'blur(16px)' : 'none';
      nav.style.borderBottomColor = on ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0)';
    }
    if (ent && stickyLink) {
      var r = ent.getBoundingClientRect();
      var now = r.top < window.innerHeight * 0.5 && r.bottom > window.innerHeight * 0.5;
      if (now !== inEnt) {
        inEnt = now;
        stickyLink.textContent = now ? 'Book a demo' : 'Get the app';
        stickyLink.setAttribute('href', now ? 'demo.html' : 'https://apps.apple.com/us/app/huddle-shift-staff-planner/id6785232071');
      }
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { fitWordmark(); onScroll(); });
  onScroll();
}());
