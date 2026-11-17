// Shared helpers for the check scripts: find playwright-core and Chrome, parse flags, open pages.
import { createRequire } from 'module';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));

// playwright-core can live in the build project, the plugin folder or globally.
export function loadPlaywright() {
  const bases = [join(process.cwd(), 'package.json'), join(here, '..', '..', 'package.json'), join(here, '..', 'package.json')];
  for (const base of bases) {
    try { return createRequire(base)('playwright-core'); } catch {}
  }
  try { return createRequire(import.meta.url)('playwright-core'); } catch {}
  console.error('playwright-core not found. Run `npm i playwright-core` in your build project (or in this skill folder) and try again.');
  process.exit(2);
}

export function chromePath() {
  const candidates = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  ].filter(Boolean);
  return candidates.find(p => existsSync(p)) || null;
}

export async function launch() {
  const { chromium } = loadPlaywright();
  const exe = chromePath();
  const opts = { headless: true };
  if (exe) opts.executablePath = exe; else opts.channel = 'chrome';
  try { return await chromium.launch(opts); }
  catch (e) {
    console.error('Could not start Chrome. Install Google Chrome or set CHROME_PATH to a Chrome or Chromium binary.\n' + e.message);
    process.exit(2);
  }
}

// `--name value` flags plus positional arguments.
export function parseArgs(argv = process.argv.slice(2)) {
  const flags = {}, pos = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2), next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) flags[k] = true; else { flags[k] = next; i++; }
    } else pos.push(a);
  }
  return { flags, pos };
}

export const PHONE = { name: 'iphone-402', width: 402, height: 874 };
export const PHONE_SMALL = { name: 'phone-390', width: 390, height: 844 };
export const DESKTOP = { name: 'desktop', width: 1440, height: 900 };

export async function openPage(browser, url, { width, height, scale = 1, wait = 2200, reducedMotion = false } = {}) {
  const mobile = width < 600;
  const ctx = await browser.newContext({
    viewport: { width, height }, deviceScaleFactor: scale, isMobile: mobile, hasTouch: mobile,
    reducedMotion: reducedMotion ? 'reduce' : 'no-preference',
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  if (wait) await page.waitForTimeout(wait);
  return { ctx, page, errors };
}

// Elements that fade in as they enter the viewport: count them as present so checks see the settled page.
export const SETTLE_CSS = '[data-sc-in], [data-sc-stagger] > *, [data-reveal], .reveal { opacity: 1 !important; transform: none !important; }';

export async function scrollToY(page, y, settle = 300) {
  await page.evaluate(yy => window.scrollTo({ top: yy, behavior: 'instant' }), y);
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  if (settle) await page.waitForTimeout(settle);
}

export async function toggleClass(page, cls, target = 'html') {
  if (!cls) return;
  await page.evaluate(([c, t]) => document.querySelector(t).classList.toggle(c), [cls, target]);
  await page.waitForTimeout(600);
}
