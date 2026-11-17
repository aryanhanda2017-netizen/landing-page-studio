#!/usr/bin/env node
// Contrast on the rendered page: every visible text line against what is actually behind it,
// with the opacity of every ancestor multiplied in (a faded parent fails as surely as grey text).
//   node contrast.mjs <url> [--toggle-class is-dark] [--toggle-target html] [--min 4.5]
// Large text (24px+, or 18.66px+ bold) needs 3:1. Text over a photo or video can't be measured this way:
// it is counted and listed for a look by eye.
import { launch, openPage, parseArgs, scrollToY, toggleClass, SETTLE_CSS, PHONE_SMALL, DESKTOP } from './lib/browser.mjs';

const { flags, pos } = parseArgs();
const url = pos[0];
if (!url) { console.log('usage: node contrast.mjs <url> [--toggle-class cls] [--min 4.5]'); process.exit(1); }
const minBody = Number(flags.min || 4.5);
const themes = flags['toggle-class'] ? [null, String(flags['toggle-class'])] : [null];

const browser = await launch();
let failedAny = false;
for (const vp of [DESKTOP, PHONE_SMALL]) {
  for (const theme of themes) {
    const { ctx, page } = await openPage(browser, url, vp);
    // settle fade-ins, and make every layer hit-testable so decorative backgrounds with pointer-events: none still count
    await page.addStyleTag({ content: SETTLE_CSS + ' * { pointer-events: auto !important; }' });
    if (theme) await toggleClass(page, theme, flags['toggle-target'] || 'html');
    const stops = await page.evaluate(() => {
      const vh = innerHeight, ys = new Set([0]);
      for (const el of document.querySelectorAll('[data-sc-act], section, footer')) {
        const top = el.getBoundingClientRect().top + scrollY;
        ys.add(Math.round(top));
        if (el.offsetHeight > vh * 1.5) { ys.add(Math.round(top + (el.offsetHeight - vh) / 2)); ys.add(Math.round(top + el.offsetHeight - vh)); }
      }
      return [...ys].sort((a, b) => a - b);
    });
    const fails = new Map(), onImage = new Map();
    let checked = 0;
    for (const y of stops) {
      await scrollToY(page, y, 700);
      const r = await page.evaluate(minBody => {
        const parse = c => { const m = (c.match(/[\d.]+/g) || [0, 0, 0, 0]).map(Number); return { r: m[0], g: m[1], b: m[2], a: m.length > 3 ? m[3] : 1 }; };
        const opacityChain = el => { let o = 1; for (let x = el; x; x = x.parentElement) o *= parseFloat(getComputedStyle(x).opacity); return o; };
        const over = (top, a, base) => ({ r: top.r * a + base.r * (1 - a), g: top.g * a + base.g * (1 - a), b: top.b * a + base.b * (1 - a) });
        const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
        const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
        const hidden = el => { for (let x = el; x && x !== document.body; x = x.parentElement) { const cs = getComputedStyle(x); if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.1 || x.getAttribute('aria-hidden') === 'true') return true; } return false; };
        const out = { fails: [], onImage: [], checked: 0 };
        const seen = new Set();
        const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: n => n.textContent.trim().length > 1 ? 1 : 2 });
        let n;
        while ((n = tw.nextNode())) {
          const el = n.parentElement;
          if (!el || seen.has(el) || el.closest('script, style, noscript')) continue;
          seen.add(el);
          const rg = document.createRange(); rg.selectNodeContents(n);
          const b = rg.getBoundingClientRect();
          if (b.width < 2 || b.height < 2 || b.bottom < 0 || b.top > innerHeight || b.right < 0 || b.left > innerWidth) continue;
          if (hidden(el)) continue;
          const cs = getComputedStyle(el);
          const fg = parse(cs.color), fgA = fg.a * opacityChain(el);
          // What is behind the text, from the top of the stack down.
          const cx = Math.min(innerWidth - 1, Math.max(0, b.left + Math.min(b.width, 40) / 2)), cy = Math.min(innerHeight - 1, Math.max(0, b.top + b.height / 2));
          const stack = document.elementsFromPoint(cx, cy);
          const layers = []; let image = false, reached = false, covered = false;
          for (const s of stack) {
            if (s !== el && el.contains(s)) continue;   // the text's own element can carry its background (buttons, labels)
            const ss = getComputedStyle(s);
            if (!reached && s !== el && !s.contains(el)) {
              // painted above the text: an opaque bar or panel hides it (not a contrast problem); a clear overlay doesn't
              const a = parse(ss.backgroundColor).a * parseFloat(ss.opacity);
              if (['IMG', 'VIDEO', 'CANVAS', 'PICTURE'].includes(s.tagName) || (ss.backgroundImage && ss.backgroundImage !== 'none')) { image = true; break; }   // a cut-out may be clear here: look by eye
              if (a > 0.5) { covered = true; break; }
              continue;
            }
            reached = true;
            if (['IMG', 'VIDEO', 'CANVAS', 'PICTURE', 'IFRAME'].includes(s.tagName) || (ss.backgroundImage && ss.backgroundImage !== 'none' && !ss.backgroundImage.startsWith('linear-gradient(transparent'))) {
              if (parseFloat(ss.opacity) * opacityChain(s) > 0.15) { image = true; break; }
            }
            const bg = parse(ss.backgroundColor), a = bg.a * opacityChain(s);
            if (a > 0.01) { layers.push({ c: bg, a }); if (a >= 0.99) break; }
          }
          if (covered) continue;
          const text = n.textContent.trim().replace(/\s+/g, ' ').slice(0, 60);
          const where = (el.closest('[id]') || {}).id || el.tagName.toLowerCase();
          if (image) { out.onImage.push({ text, where }); continue; }
          let base = { r: 255, g: 255, b: 255 };
          for (const l of layers.reverse()) base = over(l.c, l.a, base);
          const shown = over(fg, fgA, base);
          const size = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight) >= 700;
          const need = size >= 24 || (size >= 18.66 && bold) ? 3 : minBody;
          const cr = ratio(shown, base);
          out.checked++;
          if (cr < need) out.fails.push({ text, where, ratio: Math.round(cr * 100) / 100, need, color: cs.color, opacity: Math.round(opacityChain(el) * 100) / 100 });
        }
        return out;
      }, minBody);
      checked += r.checked;
      for (const f of r.fails) { const k = f.where + '|' + f.text; if (!fails.has(k) || fails.get(k).ratio > f.ratio) fails.set(k, f); }
      for (const f of r.onImage) onImage.set(f.where + '|' + f.text, f);
    }
    const tag = `${vp.name}${theme ? ' (' + theme + ')' : ''}`;
    console.log(`${tag}: ${checked} text checks, ${fails.size} below the minimum, ${onImage.size} over images (check by eye)${fails.size ? '' : '  PASS'}`);
    for (const f of [...fails.values()].slice(0, 40)) console.log(`   ${f.ratio}:1 (needs ${f.need}) "${f.text}" in ${f.where}, color ${f.color}, opacity ${f.opacity}`);
    if (onImage.size) console.log('   over images: ' + [...onImage.values()].slice(0, 8).map(f => `"${f.text.slice(0, 30)}"`).join(', ') + (onImage.size > 8 ? ' ...' : ''));
    if (fails.size) failedAny = true;
    await ctx.close();
  }
}
await browser.close();
process.exit(failedAny ? 1 : 0);
