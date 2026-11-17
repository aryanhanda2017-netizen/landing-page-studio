#!/usr/bin/env node
// Sideways scroll rails: at 0, 25, 50, 75 and 100% of the pinned act, is the rail where the scroll says it should be,
// does it move steadily, and is its last item fully in view at the end?
//   node railcheck.mjs <url> --rail ".rail" [--act ".rail-act"] [--jump "a[href='#case-3']"]
// --act defaults to the rail's closest [data-sc-act]. --jump clicks an in-page link and reports where its target lands.
import { launch, openPage, parseArgs, scrollToY, PHONE_SMALL, DESKTOP } from './lib/browser.mjs';

const { flags, pos } = parseArgs();
const url = pos[0];
if (!url || !flags.rail) { console.log('usage: node railcheck.mjs <url> --rail "<rail selector>" [--act "<act selector>"] [--jump "<link selector>"]'); process.exit(1); }
const ps = [0, 0.25, 0.5, 0.75, 1];

const browser = await launch();
let failed = false;
for (const vp of [PHONE_SMALL, DESKTOP]) {
  const { ctx, page } = await openPage(browser, url, { ...vp, wait: 1500 });
  const info = await page.evaluate(({ railSel, actSel }) => {
    const rail = document.querySelector(railSel);
    if (!rail) return { error: `no element matches ${railSel}` };
    const act = actSel ? document.querySelector(actSel) : rail.closest('[data-sc-act]') || rail.parentElement;
    const top = act.getBoundingClientRect().top + scrollY;
    return { top, travel: act.offsetHeight - innerHeight, items: rail.children.length };
  }, { railSel: flags.rail, actSel: flags.act || '' });
  if (info.error) { console.log(`${vp.name}: ${info.error}`); failed = true; await ctx.close(); continue; }
  if (info.travel < 50) { console.log(`${vp.name}: the act is not taller than the screen (travel ${info.travel}px), so nothing pins`); await ctx.close(); continue; }
  const xs = [];
  let startState = null, endState = null;
  for (const p of ps) {
    await scrollToY(page, info.top + info.travel * p, 350);
    const s = await page.evaluate(railSel => {
      const rail = document.querySelector(railSel);
      const x = new DOMMatrix(getComputedStyle(rail).transform).m41 || 0;
      const kids = [...rail.children].filter(k => k.offsetWidth);
      const first = kids[0].getBoundingClientRect(), last = kids[kids.length - 1].getBoundingClientRect();
      return { x: Math.round(x), firstLeft: Math.round(first.left), lastLeft: Math.round(last.left), lastRight: Math.round(last.right), vw: innerWidth };
    }, flags.rail);
    xs.push(s.x);
    if (p === 0) startState = s;
    if (p === 1) endState = s;
  }
  // Steady motion: each step should be close to a straight line from start to end.
  const span = xs[xs.length - 1] - xs[0];
  const dev = Math.max(...xs.map((x, i) => Math.abs(x - (xs[0] + span * ps[i]))));
  const steady = Math.abs(span) > 20 && dev <= Math.max(24, Math.abs(span) * 0.08);
  const monotonic = xs.every((x, i) => i === 0 || (span < 0 ? x <= xs[i - 1] + 2 : x >= xs[i - 1] - 2));
  const startsIn = startState.firstLeft >= -2;
  const endsIn = endState.lastRight <= endState.vw + 2 && endState.lastLeft >= -2;
  const ok = steady && monotonic && startsIn && endsIn;
  if (!ok) failed = true;
  console.log(`${vp.name}: x at ${ps.map((p, i) => `${p * 100}%=${xs[i]}`).join(' ')} | max off-line ${Math.round(dev)}px | ` +
    `first item starts in view: ${startsIn ? 'yes' : 'no (left ' + startState.firstLeft + ')'} | last item fully in view at end: ${endsIn ? 'yes' : `no (${endState.lastLeft} to ${endState.lastRight}, screen ${endState.vw})`} | ${ok ? 'PASS' : 'FAIL'}`);
  if (!monotonic) console.log('   the rail moves backwards somewhere along the act');
  if (Math.abs(span) <= 20) console.log('   the rail barely moves: is the scroll animation attached?');
  if (flags.jump) {
    await scrollToY(page, 0, 300);
    const j = await page.evaluate(async sel => {
      const a = document.querySelector(sel); if (!a) return `no element matches ${sel}`;
      a.click(); await new Promise(r => setTimeout(r, 1800));
      const id = (a.getAttribute('href') || '').replace(/^#/, ''); const el = id && document.getElementById(id);
      if (!el) return 'link target not found';
      const b = el.getBoundingClientRect();
      return `target #${id} lands at left ${Math.round(b.left)}, right ${Math.round(b.right)}, top ${Math.round(b.top)} (screen ${innerWidth}x${innerHeight})`;
    }, String(flags.jump));
    console.log('   jump: ' + j);
  }
  await ctx.close();
}
await browser.close();
process.exit(failed ? 1 : 0);
