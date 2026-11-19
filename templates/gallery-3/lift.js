/* The lift (any-scroll version).
   The page is ordinary scrolling: one room per screen, its length set by CSS alone. Nothing here reads the scroll
   position to drive content. What it does:
   - opens the doors once on load, when the hero is ready (CSS opens them anyway at 2.6 s if this file never runs);
   - plays each floor's camera push once, when the floor comes into view (triggered, done in 0.6 s, then it holds);
   - rolls the floor display in the bar to the floor in view;
   - makes each floor button a lift ride: the doors shut, the page jumps behind them, they open on that floor;
   - retries an image the server dropped, so no logo plate is left empty. */
(function () {
  var root = document.documentElement;
  var fx = root.classList.contains('fx');
  var secs = [].slice.call(document.querySelectorAll('main > section[data-floor]'));
  var links = [].slice.call(document.querySelectorAll('.panel a[data-go]'));
  var strip = document.getElementById('disp-strip'), arw = document.getElementById('disp-arw');
  var bar = document.getElementById('bar');
  var panel = document.getElementById('panel'), btn = document.getElementById('floors-btn');
  root.classList.add('lift-on');

  /* ---- arrival: each floor's camera glides in once, on its own timing ---- */
  var io = null;
  function arrive(s) { s.classList.add('in'); if (io) io.unobserve(s); }
  if (fx && 'IntersectionObserver' in window) {
    io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) arrive(e.target); });
    }, { rootMargin: '0px 0px -15% 0px' });
    secs.forEach(function (s) { if (!s.classList.contains('in')) io.observe(s); });
  } else {
    secs.forEach(function (s) { s.classList.add('in'); });
  }

  /* ---- the floor display and the lamp on the current floor button ---- */
  var cur = -1, tick = false;
  function floorNow() {
    var line = innerHeight * 0.45, k = 0;
    for (var i = 0; i < secs.length; i++) if (secs[i].getBoundingClientRect().top <= line) k = +secs[i].getAttribute('data-floor');
    return k;
  }
  function chrome() {
    tick = false;
    var k = floorNow();
    if (k === cur) return;
    if (cur >= 0 && arw) arw.innerHTML = k > cur ? '&#9650;' : '&#9660;';
    cur = k;
    strip.style.setProperty('--f', k + 3);
    links.forEach(function (a) { if (+a.getAttribute('data-go') === k) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  }
  addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(chrome); } }, { passive: true });
  addEventListener('resize', function () { cur = -1; chrome(); });
  chrome();

  /* ---- the floor buttons: a lift ride to a finished floor ---- */
  var riding = false, revealed = !root.classList.contains('pre-reveal');
  function floorEl(i) { return document.querySelector('main > section[data-floor="' + i + '"]'); }
  function jump(s) {
    var y = s.id === 'f-g' ? 0 : s.getBoundingClientRect().top + scrollY - bar.offsetHeight;
    scrollTo({ top: Math.max(0, Math.round(y)), behavior: 'instant' });
  }
  function ride(s) {
    if (!fx || riding) { jump(s); arrive(s); chrome(); return; }
    riding = true; revealed = true;
    root.classList.remove('reveal', 'pre-reveal');
    root.classList.add('ride-close');
    setTimeout(function () {
      jump(s);
      s.classList.remove('in');                 /* step back while the doors are shut ... */
      void s.offsetWidth;
      root.classList.remove('ride-close');
      root.classList.add('ride-open');
      arrive(s);                                /* ... and glide in as they open */
      chrome();
      setTimeout(function () { root.classList.remove('ride-open'); riding = false; }, 480);
    }, 270);
  }
  links.forEach(function (a) {
    a.addEventListener('click', function (e) {
      var s = floorEl(+a.getAttribute('data-go')); if (!s) return;
      e.preventDefault();
      setPanel(false);
      ride(s);
    });
  });
  function setPanel(open) {
    panel.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  btn.addEventListener('click', function () { setPanel(!panel.classList.contains('is-open')); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setPanel(false); });
  document.addEventListener('click', function (e) { if (panel.classList.contains('is-open') && !panel.contains(e.target) && !btn.contains(e.target)) setPanel(false); });

  /* ---- an image the server dropped gets up to four more tries (a busy local server resets connections) ---- */
  function retry(im) {
    var n = +(im.getAttribute('data-retry') || 0); if (n >= 4) return;
    im.setAttribute('data-retry', n + 1);
    setTimeout(function () { im.src = im.src.split('?')[0] + '?r=' + (n + 1); }, 300 + n * 500);
  }
  document.addEventListener('error', function (e) { if (e.target && e.target.tagName === 'IMG') retry(e.target); }, true);
  addEventListener('load', function () { [].forEach.call(document.images, function (im) { if (im.complete && !im.naturalWidth && im.getAttribute('src')) retry(im); }); });

  /* ---- the reveal on load, once the type and the first three packs are ready ---- */
  if (root.classList.contains('pre-reveal')) {
    var go = function () {
      if (revealed) return; revealed = true;
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        root.classList.add('reveal'); root.classList.remove('pre-reveal');
        /* once it has played, drop the class so a later ride starts from a clean state */
        setTimeout(function () { root.classList.remove('reveal'); }, 2400);
      }); });
    };
    var waits = [];
    if (document.fonts && document.fonts.ready) waits.push(document.fonts.ready);
    [].forEach.call(document.querySelectorAll('#f-g .pl__top img, .ad img'), function (im) { if (im.decode) waits.push(im.decode().catch(function () {})); });
    Promise.all(waits).then(go, go);
    setTimeout(go, 1600);
  }
})();
