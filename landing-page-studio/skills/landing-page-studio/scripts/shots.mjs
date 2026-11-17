#!/usr/bin/env node
// Review screenshots: hero after the reveal, the top of every section, and each pinned act at start, middle and end.
//   node shots.mjs <url> <outdir> [--toggle-class is-dark] [--toggle-target html] [--sizes phone,desktop] [--positions 0,0.5,1]
// Phone is 402x874 at 2x (a current iPhone), desktop 1440x900. Look at every image; this proves nothing on its own.
import { mkdirSync } from 'fs';
import { join } from 'path';
import { launch, openPage, parseArgs, scrollToY, toggleClass, PHONE, DESKTOP } from './lib/browser.mjs';

const { flags, pos } = parseArgs();
const [url, out] = pos;
if (!url || !out) { console.log('usage: node shots.mjs <url> <outdir> [--toggle-class cls] [--sizes phone,desktop] [--positions 0,0.5,1]'); process.exit(1); }
mkdirSync(out, { recursive: true });
const positions = String(flags.positions || '0,0.5,1').split(',').map(Number);
const all = { phone: { ...PHONE, scale: 2 }, desktop: { ...DESKTOP, scale: 1 } };
const sizes = (flags.sizes ? String(flags.sizes).split(',') : ['phone', 'desktop']).map(k => all[k]).filter(Boolean);
const themes = flags['toggle-class'] ? [null, String(flags['toggle-class'])] : [null];

const browser = await launch();
let count = 0;
for (const vp of sizes) {
  for (const theme of themes) {
    const { ctx, page } = await openPage(browser, url, vp);
    if (theme) { await toggleClass(page, theme, flags['toggle-target'] || 'html'); await scrollToY(page, 0, 900); }
    const tag = `${vp.name}${theme ? '-' + theme : ''}`;
    const plan = await page.evaluate(positions => {
      const vh = innerHeight, steps = [{ label: '00-hero', y: 0 }];
      const name = el => el.id || (el.className && typeof el.className === 'string' ? el.className.split(' ')[0] : el.tagName.toLowerCase());
      const blocks = [...document.querySelectorAll('[data-sc-act], body > section, main > section, footer')]
        .filter((el, i, arr) => !arr.some(o => o !== el && o.contains(el)));
      blocks.forEach((el, i) => {
        const top = el.getBoundingClientRect().top + scrollY;
        const n = String(i + 1).padStart(2, '0') + '-' + name(el).replace(/[^\w-]/g, '').slice(0, 24);
        if (el.offsetHeight > vh * 1.5) {
          // pinned act: shoot along its scroll travel
          for (const p of positions) steps.push({ label: `${n}-at${Math.round(p * 100)}`, y: Math.round(top + (el.offsetHeight - vh) * p) });
        } else if (i > 0 || top > 10) steps.push({ label: n, y: Math.round(top) });
      });
      return steps;
    }, positions);
    for (const s of plan) {
      await scrollToY(page, s.y, 1200);
      await page.screenshot({ path: join(out, `${tag}-${s.label}.png`) });
      count++;
    }
    await ctx.close();
  }
}
await browser.close();
console.log(`${count} screenshots in ${out}`);
