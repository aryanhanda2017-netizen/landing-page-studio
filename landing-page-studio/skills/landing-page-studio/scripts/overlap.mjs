#!/usr/bin/env node
// Hero layering: how much of the back-plane wordmark each cut-out subject covers, at five screen sizes.
//   node overlap.mjs <url> --mark ".hero__wordmark" --subject ".hero__person img" [--min 15] [--max 26] [--out dir]
// Reads each cut-out's real transparent top from its pixels (same-origin images), and handles object-fit fill/contain/cover.
// 100% means the subject's top sits at the top of the wordmark; 0% means it sits below the wordmark.
import { mkdirSync } from 'fs';
import { join } from 'path';
import { launch, openPage, parseArgs } from './lib/browser.mjs';

const { flags, pos } = parseArgs();
const url = pos[0];
if (!url || !flags.mark || !flags.subject) {
  console.log('usage: node overlap.mjs <url> --mark "<wordmark selector>" --subject "<subject img selector>" [--min 15] [--max 26] [--out dir]');
  process.exit(1);
}
const min = Number(flags.min || 15), max = Number(flags.max || 26);
if (flags.out) mkdirSync(flags.out, { recursive: true });
const sizes = [['402x874', 402, 874], ['390x844', 390, 844], ['360x640', 360, 640], ['1440x900', 1440, 900], ['1000x526', 1000, 526]];

const browser = await launch();
let failed = false;
for (const [name, width, height] of sizes) {
  const { ctx, page } = await openPage(browser, url, { width, height, scale: 2, wait: 2400 });
  const r = await page.evaluate(async ({ markSel, subjSel }) => {
    const mark = document.querySelector(markSel);
    if (!mark) return { error: `no element matches ${markSel}` };
    const m = mark.getBoundingClientRect();
    const imgs = [...document.querySelectorAll(subjSel)].filter(el => el.tagName === 'IMG');
    if (!imgs.length) return { error: `no <img> matches ${subjSel}` };
    const alphaTop = async img => {
      const src = img.currentSrc || img.src;
      const im = new Image(); im.crossOrigin = 'anonymous'; im.src = src;
      await im.decode();
      const h = Math.min(400, im.naturalHeight), w = Math.round(im.naturalWidth * h / im.naturalHeight);
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const g = c.getContext('2d'); g.drawImage(im, 0, 0, w, h);
      let data; try { data = g.getImageData(0, 0, w, h).data; } catch { return null; }
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (data[(y * w + x) * 4 + 3] > 32) return y / h;
      return 1;
    };
    const posY = v => {
      const p = (v || '50% 50%').split(' ')[1] || '50%';
      if (p === 'top') return 0; if (p === 'bottom') return 1; if (p === 'center') return 0.5;
      return p.endsWith('%') ? parseFloat(p) / 100 : 0.5;
    };
    const out = { wordmarkHeight: Math.round(m.height) };
    for (const [i, img] of imgs.entries()) {
      const b = img.getBoundingClientRect(), cs = getComputedStyle(img);
      const nw = img.naturalWidth, nh = img.naturalHeight;
      let drawnH = b.height, offY = 0;
      if (cs.objectFit === 'contain' || cs.objectFit === 'cover') {
        const s = (cs.objectFit === 'contain' ? Math.min : Math.max)(b.width / nw, b.height / nh);
        drawnH = nh * s; offY = (b.height - drawnH) * posY(cs.objectPosition);
      }
      const t = await alphaTop(img);
      const label = img.alt ? img.alt.split(/[,.]/)[0].slice(0, 28) : `subject ${i + 1}`;
      if (t === null) { out[label] = 'image not readable (cross-origin)'; continue; }
      const top = b.top + offY + drawnH * t;
      const horiz = b.right > m.left && b.left < m.right;
      out[label] = horiz ? Math.round((m.bottom - top) / m.height * 100) : 'beside the wordmark';
    }
    return out;
  }, { markSel: flags.mark, subjSel: flags.subject });
  if (r.error) { console.log(`${name}: ${r.error}`); failed = true; await ctx.close(); continue; }
  const vals = Object.entries(r).filter(([k, v]) => k !== 'wordmarkHeight' && typeof v === 'number');
  const bad = vals.filter(([, v]) => v < min || v > max);
  if (bad.length) failed = true;
  const shown = Object.entries(r).map(([k, v]) => `${k}: ${typeof v === 'number' && k !== 'wordmarkHeight' ? v + '%' : v}`).join(', ');
  console.log(`${name}  ${shown}  ${bad.length ? 'OUTSIDE ' + min + '-' + max + '%' : 'PASS'}`);
  if (flags.out) await page.screenshot({ path: join(flags.out, `overlap-${name}.png`) });
  await ctx.close();
}
await browser.close();
process.exit(failed ? 1 : 0);
