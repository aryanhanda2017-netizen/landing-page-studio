#!/usr/bin/env node
// Hero reveal frames: screenshots at fixed times after the page starts loading, then the hero as it exits.
//   node reveal.mjs <url> <outdir> [--times 150,500,900,1400,2200] [--exit 0.45]
// Use it to check that the reveal reads in order (back plane, subject, foreground, words) and never blocks reading.
import { mkdirSync } from 'fs';
import { join } from 'path';
import { launch, parseArgs, PHONE, DESKTOP } from './lib/browser.mjs';

const { flags, pos } = parseArgs();
const [url, out] = pos;
if (!url || !out) { console.log('usage: node reveal.mjs <url> <outdir> [--times 150,500,900,1400,2200]'); process.exit(1); }
mkdirSync(out, { recursive: true });
const times = String(flags.times || '150,500,900,1400,2200').split(',').map(Number);
const exitAt = Number(flags.exit || 0.45);

const browser = await launch();
for (const vp of [{ ...DESKTOP, scale: 1 }, { ...PHONE, scale: 2 }]) {
  const mobile = vp.width < 600;
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.scale, isMobile: mobile, hasTouch: mobile });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'commit' });
  await page.waitForSelector('body');
  const t0 = Date.now();
  for (const t of times) {
    const wait = t - (Date.now() - t0); if (wait > 0) await page.waitForTimeout(wait);
    await page.screenshot({ path: join(out, `${vp.name}-reveal-${t}ms.png`) });
  }
  await page.evaluate(f => window.scrollTo({ top: innerHeight * f, behavior: 'instant' }), exitAt);
  await page.waitForTimeout(600);
  await page.screenshot({ path: join(out, `${vp.name}-hero-exit.png`) });
  await ctx.close();
}
await browser.close();
console.log(`reveal frames in ${out}`);
