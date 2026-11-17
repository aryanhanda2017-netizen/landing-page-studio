#!/usr/bin/env node
// Dead-band check: scroll the whole page and report the tallest strip of screen with nothing in it.
//   node deadband.mjs <url> [--limit 0.25] [--step 0.2] [--ignore "sel,sel"] [--sizes phone,phone390,desktop]
// A screen row counts as content when it has visible text or media (from the DOM), or when the pixels on that row
// aren't one flat colour (shapes, cards, discs, borders, photos). A flat coloured band with nothing on it is empty.
// Small fixed elements (top bars, floating labels, chat buttons) are hidden first; fade-ins count as present.
import { launch, openPage, parseArgs, scrollToY, SETTLE_CSS, PHONE, PHONE_SMALL, DESKTOP } from './lib/browser.mjs';

const { flags, pos } = parseArgs();
const url = pos[0];
if (!url) { console.log('usage: node deadband.mjs <url> [--limit 0.25] [--step 0.2] [--ignore "sel"] [--sizes phone,phone390,desktop]'); process.exit(1); }
const limit = Number(flags.limit || 0.25), step = Number(flags.step || 0.2);
const all = { phone: PHONE, phone390: PHONE_SMALL, desktop: DESKTOP };
const sizes = (flags.sizes ? String(flags.sizes).split(',') : ['phone', 'phone390', 'desktop']).map(k => all[k]).filter(Boolean);

const browser = await launch();
let failed = false;
for (const vp of sizes) {
  const { ctx, page, errors } = await openPage(browser, url, vp);
  await page.addStyleTag({ content: SETTLE_CSS });
  const total = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const hits = []; let worst = { gap: 0 };
  for (let y = 0; y <= total + 1; y += Math.round(vp.height * step)) {
    await scrollToY(page, Math.min(y, total), 320);
    // 1. DOM: top bar position, hide small fixed things, rows covered by visible text and media.
    const dom = await page.evaluate(ignore => {
      const vh = innerHeight, vw = innerWidth;
      let barB = 0;
      for (const el of document.body.querySelectorAll('*')) {
        const cs = getComputedStyle(el);
        if (cs.position !== 'fixed' && cs.position !== 'sticky') continue;
        const b = el.getBoundingClientRect();
        if (b.top <= 2 && b.height > 0 && b.height < vh * 0.3 && b.width > vw * 0.5) barB = Math.max(barB, b.bottom);
        if (cs.position === 'fixed' && b.width * b.height < vw * vh * 0.25) { el.dataset.dbHidden = '1'; el.style.visibility = 'hidden'; }
      }
      const skip = el => !el || el.closest('[data-db-hidden], script, style, noscript, template') || (ignore && el.closest(ignore));
      const visible = el => { for (let x = el; x && x !== document.body; x = x.parentElement) { const cs = getComputedStyle(x); if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.1) return false; } return true; };
      const rows = new Uint8Array(Math.ceil(vh));
      const mark = b => { if (b.right < 0 || b.left > vw || b.bottom < 0 || b.top > vh || b.width < 2 || b.height < 2) return; for (let yy = Math.max(0, Math.floor(b.top)); yy < Math.min(Math.ceil(b.bottom), vh); yy++) rows[yy] = 1; };
      const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: n => n.textContent.trim() && !skip(n.parentElement) ? 1 : 2 });
      let n; while ((n = tw.nextNode())) { if (!visible(n.parentElement)) continue; const rg = document.createRange(); rg.selectNodeContents(n); for (const b of rg.getClientRects()) mark(b); }
      for (const el of document.querySelectorAll('img, picture, video, canvas, iframe, input, select, textarea, button')) { if (!skip(el) && visible(el)) mark(el.getBoundingClientRect()); }
      return { barB: Math.ceil(barB), rows: Array.from(rows) };
    }, flags.ignore || '');
    // 2. Pixels: a row is content when more than 1.5% of it differs clearly from the row's main colour.
    const png = (await page.screenshot({ type: 'png' })).toString('base64');
    const r = await page.evaluate(async ({ png, barB, rows }) => {
      const im = new Image(); im.src = 'data:image/png;base64,' + png; await im.decode();
      const w = im.naturalWidth, h = im.naturalHeight, sx = w / innerWidth, vh = innerHeight;
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const g = c.getContext('2d'); g.drawImage(im, 0, 0);
      const d = g.getImageData(0, 0, w, h).data;
      const cov = Uint8Array.from(rows);
      for (let yy = barB; yy < vh; yy++) {
        if (cov[yy]) continue;
        const py = Math.min(h - 1, Math.round(yy * sx)), base = py * w * 4;
        const counts = new Map();
        for (let i = 0; i < 48; i++) { const p = base + Math.floor(i * (w - 1) / 47) * 4; const k = (d[p] >> 3) + ',' + (d[p + 1] >> 3) + ',' + (d[p + 2] >> 3); counts.set(k, (counts.get(k) || 0) + 1); }
        const modeKey =[...counts.entries()].sort((a, b) => b[1] - a[1])[0][0].split(',').map(v => Number(v) * 8 + 4);
        let off = 0;
        for (let x = 0; x < w; x++) { const p = base + x * 4; if (Math.abs(d[p] - modeKey[0]) + Math.abs(d[p + 1] - modeKey[1]) + Math.abs(d[p + 2] - modeKey[2]) > 48) off++; }
        if (off > w * 0.015) cov[yy] = 1;
      }
      let best = 0, bs = 0, run = 0, rs = 0;
      for (let yy = barB; yy < vh; yy++) { if (!cov[yy]) { if (!run) rs = yy; run++; if (run > best) { best = run; bs = rs; } } else run = 0; }
      document.querySelectorAll('[data-db-hidden]').forEach(el => { el.style.visibility = ''; delete el.dataset.dbHidden; });
      const mid = document.elementFromPoint(innerWidth / 2, Math.min(vh - 1, bs + best / 2));
      const sec = mid && mid.closest('section, footer, header, [data-sc-act]');
      const label = sec ? (sec.id ? '#' + sec.id : sec.tagName.toLowerCase() + (sec.classList[0] ? '.' + sec.classList[0] : '')) : '?';
      return { gap: best, at: bs, sec: label };
    }, { png, barB: dom.barB, rows: dom.rows });
    if (r.gap > worst.gap) worst = { ...r, y };
    if (r.gap > vp.height * limit) hits.push(`scrollY=${y}: empty strip ${r.gap}px (${Math.round(r.gap / vp.height * 100)}%) starting ${r.at}px down, in ${r.sec}`);
  }
  const pct = Math.round(worst.gap / vp.height * 100);
  console.log(`${vp.name} ${vp.width}x${vp.height}: worst ${worst.gap}px (${pct}% of screen) at scrollY=${worst.y ?? 0} in ${worst.sec ?? '-'}; ${hits.length} over ${Math.round(limit * 100)}%${hits.length ? '' : '  PASS'}`);
  hits.slice(0, 30).forEach(f => console.log('   ' + f));
  if (errors.length) console.log('   page errors: ' + errors.slice(0, 3).join(' | '));
  if (hits.length) failed = true;
  await ctx.close();
}
await browser.close();
process.exit(failed ? 1 : 0);
