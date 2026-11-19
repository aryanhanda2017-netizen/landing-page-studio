/* One wireframe city on one canvas behind the page (dark towers, mint edges, floor lines, a ground grid, fog).
   The page scrolls like any page. The block crossing a line on the screen (40% down;
   15% for the first reading section, 10% for the close) picks the camera stop; when the stop changes, the camera flies there on its own clock (about one
   second, ease in and out) and holds. Nothing is tied to the scroll position, so every rest is a finished screen. */
(function (root) {
  'use strict';
  // ---------- blocks in page order, and the camera stop each one shows ----------
  // stops: 0 city, 1 what we make, 2-7 the six campaigns, 8 the reading sections (dimmed backdrop), 9 the studio
  var BLOCKS = ['city', 'what', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'creatives', 'voices', 'clients', 'questions', 'studio'];
  var STOP = [0, 1, 2, 3, 4, 5, 6, 7, 8, 8, 8, 8, 9];
  var NAMES = ['Lowmere', 'What we make', 'Tallow Lane Coffee', 'Shelterly', 'The Larchway', 'Fizzwold', 'Paywren', 'Velloway', 'Work and films', 'In their words', 'Clients and process', 'Questions', 'The studio'];
  // the line (fraction of the screen from the top) each block must cross to become current
  var TRIG = [.4, .4, .4, .4, .4, .4, .4, .4, .15, .4, .4, .4, .1];
  var FLY = 0.95, FLYMAX = 1.05, ARRIVE = 0.75;

  // ---------- scene (world px; y up is negative; the route runs toward -z) ----------
  var towers = [], boards = [], trails = {};
  function tw(x, z, w, d, h, n, o) { o = o || {}; towers.push({ x: x, z: z, w: w, d: d, h: h, n: n, dsk: !!o.dsk, lit: o.lit, core: o.core, dl: o.dl || 0, bc: h >= 520 && o.bc !== false, band: o.band }); }
  // the core blocks, x40
  [[0,0,5,5,24,6],[7,2,3.5,4,18,5],[-7,-2,4,3.5,20,5],[3,-8,3,3,14,4],[-3,8,3,3,16,4],[14,-3,2.5,2.5,12,3],[-13,3,3,2,10,3],[5,13,2,2.5,10,3],[-5,-13,2.5,2,9,3],[18,1,2,2,7,2],[-18,0,2,2.5,8,2],[10,10,1.8,1.8,7,2],[-10,-10,1.8,1.8,6,2],[21,-8,1.5,1.5,5,2],[-21,8,1.5,2,6,2],[0,20,1.5,1.5,5,2],[0,-20,2,1.5,7,2]]
    .forEach(function (b, i) { tw(b[0] * 40, b[1] * 40, b[2] * 40, b[3] * 40, b[4] * 40, b[5] * 2, { core: true, dsk: i >= 9, dl: .1 + Math.hypot(b[0], b[1]) / 21 * .55 }); });
  var PROJ = [
    { k: 2, s: 1, h: 1040, n: 13, img: 'assets/work/board-01.webp', iw: 200, ih: 356 },
    { k: 3, s: -1, h: 880, n: 11, img: 'assets/work/work-02.webp', iw: 300, ih: 300 },
    { k: 4, s: 1, villas: true },
    { k: 5, s: -1, h: 960, n: 12, img: 'assets/work/work-04.webp', iw: 300, ih: 300 },
    { k: 6, s: 1, h: 820, n: 10, img: 'assets/work/work-05.webp', iw: 300, ih: 300 },
    { k: 7, s: -1, h: 740, n: 9, img: 'assets/work/work-06.webp', iw: 300, ih: 300 }
  ];
  PROJ.forEach(function (p, i) {
    var z = -3300 - 1400 * i, s = p.s; p.z = z;
    if (p.villas) {
      p.x = 540;
      [[0, 0, 0], [-1, -1, 0], [1, 1, 0], [1, -1, 1], [-1, 1, 1]].forEach(function (v) { tw(540 + v[0] * 190, z + v[1] * 190, 110, 110, 100 + (v[0] + v[1] === 0 ? 20 : 0), 2, { lit: p.k, dsk: !!v[2], bc: false }); });
      trails[p.k] = [[0, z + 1000], [0, z], [540 - 300, z]];
    } else {
      p.x = s * 480;
      tw(p.x, z, 220, 220, p.h, p.n, { lit: p.k });
      tw(p.x + s * 400, z - 220, 150, 160, Math.round(p.h * .55), 6, { dsk: true, bc: false });
      var hx = s * 170, hz = z + 520;
      boards.push({ x: hx, z: hz, y: -150, w: p.iw, h: p.ih, src: p.img, legs: 150, k: p.k, a: 0 });
      trails[p.k] = [[hx, hz], [0, hz], [0, z], [p.x - s * 130, z]];
    }
  });
  var ZC = -11700, ZD = -13100, ZP = -14500, ZQ = -15900, ZO = -17300;
  tw(460, ZC, 260, 200, 780, 8, { bc: false }); tw(900, ZC - 320, 180, 180, 480, 6, { dsk: true });
  tw(-420, ZD, 220, 220, 520, 6); tw(0, ZD - 380, 200, 200, 640, 7); tw(420, ZD + 80, 240, 200, 440, 5);
  tw(-780, ZD - 420, 180, 180, 380, 4, { dsk: true }); tw(820, ZD - 360, 200, 180, 580, 6, { dsk: true });
  tw(-480, ZP, 240, 200, 560, 6); tw(560, ZP - 300, 220, 220, 460, 5, { dsk: true });
  tw(480, ZQ, 300, 300, 1500, 18); tw(920, ZQ + 300, 200, 200, 700, 8, { dsk: true });
  tw(300, ZO, 440, 320, 720, 9, { bc: false, band: true });
  boards.push({ x: 300, z: ZO + 161, y: -649, w: 352, h: 62, src: 'assets/wordmark.svg', legs: 0, bare: true, k: 9, a: 0 });
  [[-1500, -1300], [1600, -5500], [-1700, -9100], [1500, -12300]].forEach(function (f) { tw(f[0], f[1], 200, 200, 520, 6, { dsk: true, bc: false }); });

  // ---------- camera poses per stop: c = position, l = look-at (D desktop, M phones) ----------
  var POSE = { D: [], M: [] };
  POSE.D[0] = { c: [-420, -900, 1750], l: [-760, -330, 0] };
  POSE.M[0] = { c: [0, -1250, 2300], l: [0, 450, -500] };
  POSE.D[1] = { c: [-200, -1250, 700], l: [760, -60, -1600] };
  POSE.M[1] = { c: [0, -1350, 900], l: [0, -250, -1700] };
  PROJ.forEach(function (p) {
    var s = p.s, z = p.z;
    if (p.villas) {
      POSE.D[p.k] = { c: [-s * 120, -520, z + 1250], l: [s * 60, -240, z + 60] };
      POSE.M[p.k] = { c: [0, -1100, z + 2600], l: [s * 400, 1100, z - 300] };
    } else {
      POSE.D[p.k] = { c: [-s * 140, -560, z + 1750], l: [s * 40, -545, z + 80] };
      POSE.M[p.k] = { c: [s * 60, -1000, z + 3800], l: [s * 300, 1000, z - 200] };
    }
  });
  POSE.D[8] = { c: [0, -1500, ZD + 1800], l: [0, -200, ZD] };
  POSE.M[8] = { c: [0, -1700, ZD + 2100], l: [0, 300, ZD - 300] };
  POSE.D[9] = { c: [-300, -480, ZO + 1200], l: [20, -460, ZO] };
  POSE.M[9] = { c: [300, -400, ZO + 1400], l: [320, -102, ZO] };

  var DATA = { blocks: BLOCKS, stop: STOP, names: NAMES, trig: TRIG, fly: FLY, towers: towers, boards: boards, trails: trails, pose: POSE };
  root.__WORLD = DATA;
  if (typeof document === 'undefined') return;

  // ---------- runtime ----------
  var H = document.documentElement, fx = H.classList.contains('fx');
  var cv = document.getElementById('city-canvas'), ctx = cv.getContext('2d', { alpha: false });
  var els = BLOCKS.map(function (id) { var el = document.getElementById(id); return el.closest('.step') || el; });
  var dots = [].slice.call(document.querySelectorAll('#dots button'));
  var mapLinks = [].slice.call(document.querySelectorAll('#map a'));
  var nowName = document.getElementById('nowName');
  // anything on the page that can scroll over a billboard: cards and grids by their box, text by its own extent,
  // and the first reading section's ground where it is painted (it is clear for its first 72 px)
  var occ = [].slice.call(document.querySelectorAll('.card, .sec__in > *, #creatives'));
  function occRect(el) {
    if (el.id === 'creatives') { var r = el.getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top + 72, bottom: r.bottom, height: r.height }; }
    if (/^(P|H2|H3)$/.test(el.tagName)) { var rg = document.createRange(); rg.selectNodeContents(el); return rg.getBoundingClientRect(); }
    return el.getBoundingClientRect();
  }
  var W = 0, Hh = 0, dpr = 1, F = 900, mob = null, tops = [], curN = -1;
  var raf = 0, lastNow = 0, R0 = fx ? null : -1e9;
  var tgt = -1, fl = null, curP = null, arrAt = -1e9, leave = {};
  var imgs = {};
  boards.forEach(function (b) { if (!imgs[b.src]) { var im = new Image(); im.decoding = 'async'; im.onload = function () { kick(); }; im.src = b.src; imgs[b.src] = im; } });
  var clamp = function (x, a, b) { return x < a ? a : x > b ? b : x; };
  var eout = function (x) { return 1 - Math.pow(1 - x, 3); };

  // pre-rendered sky pieces: stars tile and far skyline tile
  function tile(w, h, draw) { var c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d')); return c; }
  var seed = 11, rnd = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  var starTile = tile(420, 300, function (g) { for (var i = 0; i < 46; i++) { g.fillStyle = 'rgba(207,235,221,' + (.25 + rnd() * .4).toFixed(2) + ')'; g.beginPath(); g.arc(rnd() * 420, rnd() * 300, .7 + rnd() * .8, 0, 6.3); g.fill(); } });
  var skyTile = tile(1200, 200, function (g) { g.strokeStyle = 'rgba(111,191,152,.30)'; g.fillStyle = '#0C1C15'; g.lineWidth = 1; var x = 0; while (x < 1200) { var w = 30 + rnd() * 60, h = 30 + rnd() * 150; g.fillRect(x, 200 - h, w, h); g.strokeRect(x + .5, 200 - h + .5, w, h); x += w + 4 + rnd() * 26; } });
  var starPat = null, skyPat = null;

  // ---------- the flight: a quintic ease in and out from the current pose and speed to the stop's pose ----------
  function poseVec(k) { var p = (mob ? POSE.M : POSE.D)[k]; return [p.c[0], p.c[1], p.c[2], p.l[0], p.l[1], p.l[2]]; }
  function sample(now) {
    if (!fl) return { p: curP, v: [0, 0, 0, 0, 0, 0], u: 1 };
    var u = clamp((now - fl.t0) / (fl.D * 1000), 0, 1), u2 = u * u, u3 = u2 * u, u4 = u3 * u, u5 = u4 * u;
    var h0 = 1 - 10 * u3 + 15 * u4 - 6 * u5, h1 = u - 6 * u3 + 8 * u4 - 3 * u5, h5 = 10 * u3 - 15 * u4 + 6 * u5;
    var d0 = -30 * u2 + 60 * u3 - 30 * u4, d1 = 1 - 18 * u2 + 32 * u3 - 15 * u4;
    var p = [], v = [];
    for (var i = 0; i < 6; i++) { p[i] = h0 * fl.p0[i] + h1 * fl.D * fl.v0[i] + h5 * fl.p1[i]; v[i] = (d0 * (fl.p0[i] - fl.p1[i]) + d1 * fl.D * fl.v0[i]) / fl.D; }
    return { p: p, v: v, u: u };
  }
  function litP(k, now) { return eout(clamp((now - arrAt - 180) / 320, 0, 1)); }
  function goStop(k, instant) {
    if (k === tgt && !instant) return;
    var now = performance.now(), p1 = poseVec(k);
    if (tgt >= 2 && tgt !== k) leave[tgt] = { t: now, p: litP(tgt, now) };
    if (instant || !fx || curP === null) { curP = p1; fl = null; tgt = k; arrAt = now - 5000; kick(); return; }
    var s = sample(now), v = s.v, dl = 0, dot = 0, vl = 0;
    for (var i = 0; i < 6; i++) { var d = p1[i] - s.p[i]; dl += d * d; dot += d * v[i]; vl += v[i] * v[i]; }
    var D = Math.min(FLYMAX, FLY + .05 * Math.max(0, Math.abs(k - tgt) - 1));
    dl = Math.sqrt(dl); vl = Math.sqrt(vl);
    if (dot <= 0) v = [0, 0, 0, 0, 0, 0];
    else if (vl * D > 1.5 * dl) v = v.map(function (x) { return x * 1.5 * dl / (vl * D); });
    fl = { p0: s.p, v0: v, p1: p1, t0: now, D: D };
    tgt = k; arrAt = now + ARRIVE * D * 1000; kick();
  }

  function layout() {
    var w = innerWidth, h = innerHeight, m = w <= 760;
    dpr = Math.min(2, devicePixelRatio || 1);
    W = w; Hh = h; F = m ? .8 * h : 1.125 * h;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    starPat = ctx.createPattern(starTile, 'repeat'); skyPat = ctx.createPattern(skyTile, 'repeat-x');
    if (m !== mob) { mob = m; if (tgt >= 0) goStop(tgt, true); }
    measure(); pick(); kick();
  }
  function measure() { var y = scrollY; tops = els.map(function (el) { return el.getBoundingClientRect().top + y; }); }

  // which block is current: the last one whose top has crossed its trigger line
  function pick() {
    var n = 0, vh = innerHeight;
    for (var i = 0; i < tops.length; i++) if (tops[i] <= scrollY + TRIG[i] * vh) n = i;
    if (n !== curN) {
      curN = n;
      var j = Math.min(n, dots.length - 1);
      dots.forEach(function (b, i) { b.setAttribute('aria-current', String(i === j)); b.classList.toggle('past', i < j); });
      mapLinks.forEach(function (a, i) { a.setAttribute('aria-current', String(i === j)); });
      nowName.textContent = NAMES[n];
      H.classList.toggle('dock-away', n === 0 || n === BLOCKS.length - 1);
    }
    // the city is dimmed behind the reading sections, and lifts as soon as the close comes into view
    H.classList.toggle('dimmed', STOP[n] === 8 && tops[tops.length - 1] > scrollY + .9 * vh);
    goStop(fx ? STOP[n] : 0, curP === null);
    // a billboard that a card now covers (or has just cleared) fades on its own clock
    boards.forEach(function (b) { if (b.k === tgt && b.sr) { var c = covered(b.sr); if (c !== b.cov) { b.cov = c; kick(); } } });
  }
  // the billboard's screen box (image and frame) and whether any card or section block comes within 16 px of it
  function boardRect(b) {
    var base = cam(b.x, b.y, b.z); if (base[2] < NEAR * 4) return null;
    var q = px(base), s = F / base[2], w = b.w * s + 4, h = b.h * s + 2;
    return { l: q[0] - w / 2, r: q[0] + w / 2, t: q[1] - h, b: q[1] + 2 };
  }
  function covered(r) {
    if (!r) return false;
    for (var i = 0; i < occ.length; i++) { var c = occRect(occ[i]); if (c.height > 0 && c.bottom > r.t - 16 && c.top < r.b + 16 && c.right > r.l - 16 && c.left < r.r + 16) return true; }
    return false;
  }

  // ---------- camera and drawing ----------
  var C = {};
  function setCam(p) {
    var dx = p[3] - p[0], dy = p[4] - p[1], dz = p[5] - p[2];
    var yaw = Math.atan2(dx, -dz), pitch = Math.atan2(dy, Math.hypot(dx, dz));
    C.x = p[0]; C.y = p[1]; C.z = p[2]; C.cy = Math.cos(yaw); C.sy = Math.sin(yaw); C.cp = Math.cos(-pitch); C.sp = Math.sin(-pitch); C.yaw = yaw; C.pitch = pitch;
  }
  function cam(x, y, z) {
    var dx = x - C.x, dy = y - C.y, dz = z - C.z;
    var x1 = dx * C.cy + dz * C.sy, z1 = -dx * C.sy + dz * C.cy;
    return [x1, dy * C.cp - z1 * C.sp, -(dy * C.sp + z1 * C.cp)];
  }
  var NEAR = 30;
  function clipPoly(P) {
    var out = [];
    for (var i = 0; i < P.length; i++) {
      var a = P[i], b = P[(i + 1) % P.length], ia = a[2] >= NEAR, ib = b[2] >= NEAR;
      if (ia) out.push(a);
      if (ia !== ib) { var t = (NEAR - a[2]) / (b[2] - a[2]); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, NEAR]); }
    }
    return out;
  }
  function px(p) { return [W / 2 + p[0] * F / p[2], Hh / 2 + p[1] * F / p[2]]; }
  function seg(a, b) { // camera-space segment, clipped; returns screen points or null
    if (a[2] < NEAR && b[2] < NEAR) return null;
    if (a[2] < NEAR) { var t = (NEAR - a[2]) / (b[2] - a[2]); a = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, NEAR]; }
    else if (b[2] < NEAR) { var u = (NEAR - b[2]) / (a[2] - b[2]); b = [b[0] + (a[0] - b[0]) * u, b[1] + (a[1] - b[1]) * u, NEAR]; }
    return [px(a), px(b)];
  }
  var fog = function (d) { return clamp(1 - (d - 2400) / 4600, .1, 1); };

  function drawGround(now) {
    var hy = Hh / 2 - F * Math.tan(C.pitch), hx = -F * Math.tan(C.yaw);
    if (hy > 0) {
      ctx.save(); ctx.translate((hx * .5) % 420, 0); ctx.fillStyle = starPat; ctx.fillRect(-420, 0, W + 840, Math.min(Hh, hy - 30)); ctx.restore();
      ctx.save(); ctx.translate((hx - C.x * .03) % 1200, hy - 200); ctx.fillStyle = skyPat; ctx.fillRect(-1200, 0, W + 2400, 200); ctx.restore();
    }
    var g = ctx.createLinearGradient(0, Math.max(0, hy), 0, Hh);
    g.addColorStop(0, '#0F241B'); g.addColorStop(.25, '#0B1B14'); g.addColorStop(1, '#07120D');
    ctx.fillStyle = g; ctx.fillRect(0, Math.max(0, hy), W, Hh);
    // grid, aligned to world multiples of 160; segments faded with distance (and drawn out from the centre on load)
    var rev = R0 === null ? 0 : clamp((now - R0) / 1500, 0, 1), rr = eout(rev) * 5200, revealing = rev < 1;
    var x0 = Math.floor((C.x - 2560) / 160) * 160, x1 = C.x + 2560, zA = C.z + 400, zB = C.z - 6800;
    ctx.lineWidth = 1;
    for (var pass = 0; pass < 2; pass++) {
      for (var gx = x0; gx <= x1; gx += 160) {
        var major = Math.round(gx / 160) % 4 === 0; if ((pass === 1) !== major) continue;
        for (var gz = Math.ceil(zA / 640) * 640; gz > zB; gz -= 640) line(gx, gz, gx, gz - 640, major);
      }
      for (var gz2 = Math.ceil(zB / 160) * 160; gz2 <= zA; gz2 += 160) {
        var mj = Math.round(gz2 / 160) % 4 === 0; if ((pass === 1) !== mj) continue;
        for (var gx2 = x0; gx2 < x1; gx2 += 640) line(gx2, gz2, gx2 + 640, gz2, mj);
      }
    }
    function line(ax, az, bx, bz, major) {
      var a = cam(ax, 0, az), b = cam(bx, 0, bz), s = seg(a, b); if (!s) return;
      var d = (Math.max(a[2], NEAR) + Math.max(b[2], NEAR)) / 2, al = (major ? .62 : .34) * fog(d);
      if (revealing) al *= clamp((rr - Math.hypot((ax + bx) / 2, (az + bz) / 2)) / 700, 0, 1);
      if (al < .02) return;
      ctx.strokeStyle = major ? 'rgba(95,168,133,' + al.toFixed(3) + ')' : 'rgba(52,104,80,' + al.toFixed(3) + ')';
      ctx.beginPath(); ctx.moveTo(s[0][0], s[0][1]); ctx.lineTo(s[1][0], s[1][1]); ctx.stroke();
    }
    return revealing;
  }

  function poly(P, fill, stroke) {
    var c = clipPoly(P); if (c.length < 3) return;
    ctx.beginPath(); var q = px(c[0]); ctx.moveTo(q[0], q[1]);
    for (var i = 1; i < c.length; i++) { q = px(c[i]); ctx.lineTo(q[0], q[1]); }
    ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.stroke(); }
  }
  // a campaign tower lights floor by floor after the camera arrives; when the camera leaves, the light fades out
  function litState(k, now) {
    if (k === tgt) return { p: litP(k, now), a: 1, busy: now < arrAt + 520 };
    var L = leave[k]; if (!L) return null;
    var a = 1 - (now - L.t) / 350; if (a <= 0 || L.p <= 0) { delete leave[k]; return null; }
    return { p: L.p, a: a, busy: true };
  }
  function drawTower(t, now) {
    var grow = 1, busy = false;
    if (R0 !== null && now - R0 < 2600) grow = eout(clamp((now - R0 - (t.core ? t.dl * 1000 : 420)) / 1150, 0, 1));
    else if (R0 === null) grow = 0;
    if (grow < 1) busy = true;
    var h = t.h * grow; if (h < 2) return busy;
    var xa = t.x - t.w / 2, xb = t.x + t.w / 2, za = t.z - t.d / 2, zb = t.z + t.d / 2;
    // a tower the camera passes close to thins out instead of filling the screen
    var nd = Math.hypot(Math.max(xa - C.x, 0, C.x - xb), Math.max(-h - C.y, 0, C.y), Math.max(za - C.z, 0, C.z - zb));
    var near = clamp((nd - 200) / 500, 0, 1); if (near <= 0) return busy;
    ctx.globalAlpha = near;
    var d = cam(t.x, -h / 2, t.z)[2], f = fog(d), o = (t.h > 800 ? .95 : t.h > 560 ? .85 : t.h > 360 ? .72 : .6) * f;
    var edge = 'rgba(143,211,176,' + o.toFixed(3) + ')', floorC = 'rgba(111,191,152,' + (o * .5).toFixed(3) + ')';
    var ls = t.lit ? litState(t.lit, now) : null, lit = ls ? ls.p : 0, la = ls ? ls.a : 0;
    if (ls && ls.busy) busy = true;
    var faces = [];
    if (C.z > zb) faces.push([[xa, 0, zb], [xb, 0, zb], [xb, -h, zb], [xa, -h, zb]]);
    if (C.z < za) faces.push([[xb, 0, za], [xa, 0, za], [xa, -h, za], [xb, -h, za]]);
    if (C.x < xa) faces.push([[xa, 0, za], [xa, 0, zb], [xa, -h, zb], [xa, -h, za]]);
    if (C.x > xb) faces.push([[xb, 0, zb], [xb, 0, za], [xb, -h, za], [xb, -h, zb]]);
    ctx.lineWidth = 1;
    faces.forEach(function (F4) {
      var P = F4.map(function (v) { return cam(v[0], v[1], v[2]); });
      poly(P, '#07120D', null);
      if (lit > 0) {
        var ly = -h * lit, L = [F4[0], F4[1], [F4[1][0], ly, F4[1][2]], [F4[0][0], ly, F4[0][2]]].map(function (v) { return cam(v[0], v[1], v[2]); });
        poly(L, 'rgba(255,107,74,' + (.5 * f * la).toFixed(3) + ')', null);
      }
      ctx.beginPath();
      for (var i = 1; i < t.n; i++) {
        var y = -h * i / t.n, s = seg(cam(F4[0][0], y, F4[0][2]), cam(F4[1][0], y, F4[1][2]));
        if (s) { ctx.moveTo(s[0][0], s[0][1]); ctx.lineTo(s[1][0], s[1][1]); }
      }
      ctx.strokeStyle = floorC; ctx.stroke();
      if (lit > 0) {
        ctx.beginPath();
        for (var j = 1; j < t.n; j++) { var yy = -h * j / t.n; if (yy < -h * lit) break; var s2 = seg(cam(F4[0][0], yy, F4[0][2]), cam(F4[1][0], yy, F4[1][2])); if (s2) { ctx.moveTo(s2[0][0], s2[0][1]); ctx.lineTo(s2[1][0], s2[1][1]); } }
        ctx.strokeStyle = 'rgba(255,184,164,' + (.8 * f * la).toFixed(3) + ')'; ctx.stroke();
      }
      poly(P, null, edge);
    });
    if (C.y < -h) poly([[xa, -h, za], [xb, -h, za], [xb, -h, zb], [xa, -h, zb]].map(function (v) { return cam(v[0], v[1], v[2]); }), '#07120D', edge);
    if (t.band) { var y0 = -h * 8 / 9; poly([[xa, -h, zb], [xb, -h, zb], [xb, y0, zb], [xa, y0, zb]].map(function (v) { return cam(v[0], v[1], v[2] + 1); }), 'rgba(255,107,74,' + (.34 * f).toFixed(3) + ')', 'rgba(255,184,164,' + (.7 * f).toFixed(3) + ')'); }
    if (t.bc && grow > .98) { var b = cam(t.x, -h - 22, t.z); if (b[2] > NEAR) { var q = px(b), r = clamp(5 * F / b[2], 1.5, 6); ctx.fillStyle = 'rgba(255,107,74,' + f.toFixed(3) + ')'; ctx.beginPath(); ctx.arc(q[0], q[1], r, 0, 6.3); ctx.fill(); } }
    ctx.globalAlpha = 1;
    return busy;
  }
  function drawBoard(b) {
    var im = imgs[b.src]; if (!im || !im.complete || !im.naturalWidth || b.a <= 0) return;
    var base = cam(b.x, b.y, b.z); if (base[2] < NEAR * 4) return;
    var q = px(base), s = F / base[2], w = b.w * s, h = b.h * s, f = fog(base[2]) * b.a;
    ctx.globalAlpha = f;
    if (b.legs) { var g = px(cam(b.x, 0, b.z)); ctx.fillStyle = '#3E7A5E'; ctx.fillRect(q[0] - w * .34, q[1], Math.max(1, 6 * s), g[1] - q[1]); ctx.fillRect(q[0] + w * .34 - Math.max(1, 6 * s), q[1], Math.max(1, 6 * s), g[1] - q[1]); }
    if (!b.bare) { ctx.fillStyle = '#BCE1CF'; ctx.fillRect(q[0] - w / 2 - 2, q[1] - h - 2, w + 4, h + 4); }
    ctx.drawImage(im, q[0] - w / 2, q[1] - h, w, h);
    ctx.globalAlpha = 1;
  }
  // the lead trail: three points of light run from the hoarding down the street to the tower, once, on arrival
  function drawTrail(now) {
    var path = trails[tgt]; if (!path || now < arrAt) return now < arrAt + 700;
    var segs = [], total = 0, bd = null;
    boards.forEach(function (b) { if (b.k === tgt) bd = b; });
    var vis = bd && !(mob && bd.legs) ? bd.a : 1;
    for (var i = 1; i < path.length; i++) { var L = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]); segs.push(L); total += L; }
    for (var j = 0; j < 3; j++) {
      var p = (now - arrAt - j * 60) / 420; if (p < 0 || p > 1) continue;
      var e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2, dist = e * total, i2 = 0;
      while (i2 < segs.length - 1 && dist > segs[i2]) { dist -= segs[i2]; i2++; }
      var a = path[i2], b = path[i2 + 1], u = clamp(dist / segs[i2], 0, 1);
      var c = cam(a[0] + (b[0] - a[0]) * u, -18, a[1] + (b[1] - a[1]) * u); if (c[2] < NEAR) continue;
      var q = px(c), r = Math.max(2.5, 15 * F / c[2]), al = Math.min(1, p * 8, (1 - p) * 8) * vis;
      ctx.fillStyle = 'rgba(255,200,186,' + al.toFixed(3) + ')'; ctx.beginPath(); ctx.arc(q[0], q[1], r, 0, 6.3); ctx.fill();
    }
    return now < arrAt + 700;
  }

  function render(now, u, dt) {
    setCam(curP);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#08140F'; ctx.fillRect(0, 0, W, Hh);
    var busy = drawGround(now);
    // a hoarding fades in over the second half of the flight into its stop, and out as soon as the camera leaves
    // or a card comes over it (it returns once the card has cleared it): never left partly covered
    boards.forEach(function (b) {
      var goal = 0;
      // phones show no campaign hoardings: the cards sit too close together to keep one clear (the studio sign stays)
      if (b.k === tgt && u >= .5 && !(mob && b.legs)) { b.sr = boardRect(b); b.cov = covered(b.sr); goal = b.cov ? 0 : 1; } else b.sr = null;
      if (b.a !== goal) { b.a = goal > b.a ? Math.min(goal, b.a + dt / .3) : Math.max(goal, b.a - dt / .3); busy = true; }
    });
    var list = [];
    towers.forEach(function (t) { if (mob && t.dsk) return; var c = cam(t.x, -t.h / 2, t.z); if (c[2] < -400 || c[2] > 7600) return; list.push([c[2], 0, t]); });
    boards.forEach(function (b) { var c = cam(b.x, b.y, b.z); if (c[2] < NEAR || c[2] > 7600) return; list.push([c[2] - 2, 1, b]); });
    list.sort(function (a, b) { return b[0] - a[0]; });
    list.forEach(function (it) { if (it[1]) drawBoard(it[2]); else if (drawTower(it[2], now)) busy = true; });
    if (tgt >= 2 && tgt <= 7 && drawTrail(now)) busy = true;
    return busy;
  }

  function loop(now) {
    raf = 0;
    var dt = lastNow ? Math.min(.5, Math.max(0, now - lastNow) / 1000) : .016; lastNow = now;
    var s = sample(now); curP = s.p; if (fl && s.u >= 1) fl = null;
    var busy = render(now, s.u, dt);
    if (fl || busy || R0 === null) raf = requestAnimationFrame(loop); else lastNow = 0;
  }
  function kick() { if (!raf && curP) raf = requestAnimationFrame(loop); }

  addEventListener('scroll', pick, { passive: true });
  addEventListener('resize', layout);
  layout();
  if (window.ResizeObserver) new ResizeObserver(function () { measure(); pick(); }).observe(document.getElementById('copy'));

  // nav: land on a finished stop (a step card centred on screen) or a section (its top under the bar)
  function go(n) {
    measure();
    var y = 0, vh = innerHeight, bar = document.getElementById('bar').offsetHeight;
    if (n >= 1 && n <= 7) { var r = document.getElementById(BLOCKS[n]).getBoundingClientRect(); y = r.top + scrollY + r.height / 2 - vh * .5; }
    else if (n > 7) y = tops[n] - bar;
    // never land short of this block's line or past the next block's line
    if (n > 0) y = Math.max(y, tops[n] - TRIG[n] * vh + 1);
    if (n < tops.length - 1) y = Math.min(y, tops[n + 1] - TRIG[n + 1] * vh - 1);
    y = clamp(Math.round(y), 0, document.documentElement.scrollHeight - vh);
    scrollTo({ top: y, behavior: fx ? 'smooth' : 'instant' });
  }
  document.addEventListener('click', function (e) { var t = e.target.closest('[data-go]'); if (t) { e.preventDefault(); go(+t.dataset.go); closeMap(); } });
  var nowBtn = document.getElementById('now'), map = document.getElementById('map');
  function closeMap() { map.hidden = true; nowBtn.setAttribute('aria-expanded', 'false'); }
  nowBtn.addEventListener('click', function () {
    var open = map.hidden; map.hidden = !open; nowBtn.setAttribute('aria-expanded', String(open));
    if (open) { var r = nowBtn.getBoundingClientRect(); map.style.left = innerWidth > 760 ? Math.max(12, Math.min(innerWidth - 332, r.left)) + 'px' : ''; }
  });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMap(); });
  document.addEventListener('pointerdown', function (e) { if (!map.hidden && !map.contains(e.target) && !nowBtn.contains(e.target)) closeMap(); });

  // films: tap a poster, the still opens over the page
  var lb = document.getElementById('lb'), lbv = document.getElementById('lbv'), lbc = document.getElementById('lbc');
  document.addEventListener('click', function (e) {
    var s = e.target.closest('.reel'); if (!s) return;
    lbv.src = s.dataset.src; lbv.alt = s.dataset.label; lbc.textContent = s.dataset.label;
    if (lb.showModal) lb.showModal(); else lb.setAttribute('open', '');
  });
  function closeLb() { lbv.removeAttribute('src'); if (lb.close) lb.close(); else lb.removeAttribute('open'); }
  document.getElementById('lbx').addEventListener('click', closeLb);
  lb.addEventListener('cancel', function () { lbv.removeAttribute('src'); });

  // load reveal: the grid draws out, the towers rise, then the beacons; the h1 and CTA are CSS
  function reveal() { if (R0 !== null) return; R0 = performance.now(); H.classList.remove('pre'); H.classList.add('go'); kick(); }
  if (R0 === null) {
    var fire = function () { requestAnimationFrame(function () { requestAnimationFrame(reveal); }); };
    if (document.readyState === 'complete') fire(); else addEventListener('load', fire);
    setTimeout(reveal, 2200);
  } else H.classList.add('go');
  function relayout() { measure(); pick(); kick(); }
  addEventListener('load', relayout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
})(typeof window !== 'undefined' ? window : globalThis);
