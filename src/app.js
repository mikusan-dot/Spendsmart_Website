(function () {
  'use strict';
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme ---------- */
  var themeBtn = $('#themeBtn');
  var demoSwitch = $('#demoSwitch');
  var mq = window.matchMedia('(prefers-color-scheme: dark)');

  function isDark() {
    var t = root.getAttribute('data-theme');
    return t ? t === 'dark' : mq.matches;
  }
  function syncThemeUI() {
    var dark = isDark();
    if (themeBtn) themeBtn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    if (demoSwitch) demoSwitch.setAttribute('aria-checked', String(dark));
  }
  function setTheme(mode) {
    root.setAttribute('data-theme', mode);
    try { localStorage.setItem('ss-theme', mode); } catch (e) {}
    syncThemeUI();
  }
  function toggleTheme() { setTheme(isDark() ? 'light' : 'dark'); }
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
  if (demoSwitch) demoSwitch.addEventListener('click', toggleTheme);
  mq.addEventListener && mq.addEventListener('change', syncThemeUI);
  syncThemeUI();

  /* ---------- Nav ---------- */
  var nav = $('.nav');
  var menu = $('#menu');
  var menuBtn = $('#menuBtn');
  function onScroll() { if (nav) nav.classList.toggle('is-stuck', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    if (!menu || !menuBtn) return;
    menu.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (menuBtn) menuBtn.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
  if (menu) menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Hero donut (sample data, interactive filter) ---------- */
  var donut = $('#donut');
  if (donut) {
    var data = [
      { name: 'Food', value: 940, color: '#F5A524' },
      { name: 'Bills', value: 670, color: '#4C8DF6' },
      { name: 'Transport', value: 496, color: '#8B6CF0' },
      { name: 'Fun', value: 374, color: '#E8576F' }
    ];
    var total = data.reduce(function (s, d) { return s + d.value; }, 0);
    var R = 42, C = 2 * Math.PI * R, GAP = 3;
    var NS = 'http://www.w3.org/2000/svg';
    var valueEl = $('#donutValue');
    var labelEl = $('#donutLabel');
    var chips = $('#chips');
    var money = function (n) { return '$' + n.toLocaleString('en-US'); };
    var segs = [];
    var offset = 0;

    data.forEach(function (d) {
      var len = (d.value / total) * C;
      var c = document.createElementNS(NS, 'circle');
      c.setAttribute('class', 'donut__seg');
      c.setAttribute('cx', 60); c.setAttribute('cy', 60); c.setAttribute('r', R);
      c.setAttribute('stroke', d.color);
      c.setAttribute('stroke-dashoffset', -offset);
      c.setAttribute('stroke-dasharray', reduce ? (len - GAP) + ' ' + C : '0 ' + C);
      c._len = len - GAP;
      donut.appendChild(c);
      segs.push(c);
      offset += len;
    });

    if (!reduce) {
      requestAnimationFrame(function () {
        setTimeout(function () {
          segs.forEach(function (c) { c.setAttribute('stroke-dasharray', c._len + ' ' + C); });
        }, 250);
      });
    }

    function select(i) {
      segs.forEach(function (c, j) { c.classList.toggle('dim', i !== -1 && i !== j); });
      $$('.chip', chips).forEach(function (b, j) { b.setAttribute('aria-pressed', String(i === j)); });
      if (i === -1) { valueEl.textContent = money(total); labelEl.textContent = 'Total spent'; }
      else { valueEl.textContent = money(data[i].value); labelEl.textContent = data[i].name; }
    }
    data.forEach(function (d, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'chip'; b.setAttribute('aria-pressed', 'false');
      b.innerHTML = '<i style="--c:' + d.color + '"></i>' + d.name;
      b.addEventListener('click', function () { select(b.getAttribute('aria-pressed') === 'true' ? -1 : i); });
      chips.appendChild(b);
    });
    valueEl.textContent = money(total);
  }

  /* ---------- Reveal feature visuals once when scrolled into view ---------- */
  var animated = $$('.bars, .meters, .spark');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: .35 });
    animated.forEach(function (el) { io.observe(el); });
  } else {
    animated.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Sample sync key (same format as the real one: ss-XXXX x5, 100 bits) ---------- */
  var keyOut = $('#keyOut');
  var keyBtn = $('#keyBtn');
  var ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 32 symbols = 5 bits each; 20 symbols = 100 bits
  function makeKey() {
    var bytes = new Uint8Array(20);
    (window.crypto || window.msCrypto).getRandomValues(bytes);
    var out = [];
    for (var i = 0; i < 20; i++) out.push(ALPHA[bytes[i] & 31]);
    var groups = [];
    for (var g = 0; g < 5; g++) groups.push(out.slice(g * 4, g * 4 + 4).join(''));
    return 'ss-' + groups.join('-');
  }
  if (keyOut && keyBtn) {
    keyOut.textContent = makeKey();
    keyBtn.addEventListener('click', function () { keyOut.textContent = makeKey(); });
  }

  /* ---------- Copy checksum ---------- */
  var hashBtn = $('#hashBtn');
  var hashText = $('#hashText');
  var status = $('#copyStatus');
  if (hashBtn && hashText) {
    hashBtn.addEventListener('click', function () {
      var text = hashText.textContent.trim();
      var done = function (ok) {
        if (status) status.textContent = ok ? 'Checksum copied' : 'Copy failed, select the text manually';
        if (ok) {
          hashBtn.classList.add('done');
          setTimeout(function () { hashBtn.classList.remove('done'); }, 1600);
        }
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
      } else {
        var r = document.createRange(); r.selectNodeContents(hashText);
        var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
        try { done(document.execCommand('copy')); } catch (e) { done(false); }
      }
    });
  }

  /* ---------- Privacy page: highlight current section in the contents list ---------- */
  var toc = $('.toc');
  if (toc && 'IntersectionObserver' in window) {
    var links = $$('a', toc);
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (a) { a.classList.remove('on'); });
          var a = map[en.target.id]; if (a) a.classList.add('on');
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    $$('.prose section[id]').forEach(function (s) { so.observe(s); });
  }
})();
