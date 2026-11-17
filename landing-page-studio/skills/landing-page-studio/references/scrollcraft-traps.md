# ScrollCraft engine traps (and the fixes that shipped)

ScrollCraft's engine (`scrollcraft.js`) is excellent; these are the places a real build tripped over it. Never edit the engine itself; fix in page CSS/JS.

## 1. Every section needs an act

The engine drives `data-sc-reveal`, `data-sc-parallax` and `data-sc-cue` only inside elements with `data-sc-act`, and `shoot.mjs` only samples acts. A plain `<section>` gets no wipe, no parallax and is never screenshotted. Give ordinary sections `data-sc-act="flow"`.

## 2. Never set `position` on a stage

`[data-sc-stage]` of a pinned act must stay `position: sticky` (the engine sets it). A page rule like `.my-stage { position: relative }` silently un-pins it and the whole act scrolls away; frames after the first come out blank. The engine logs a warning in the console; read it.

## 3. Sideways rails stutter on a real iPhone

When the engine's JavaScript writes the rail's `transform` from `scrollY`, it runs a frame behind the phone's compositor scroll, worst during momentum scrolling and when Safari's address bar hides. Headless Chrome shows a perfect 60 fps and never reproduces it. The fix that shipped: let the browser drive the rail with a CSS scroll-driven animation, keep the engine as the fallback.

```css
@keyframes rail-pan { from { transform: translate3d(0,0,0); } to { transform: translate3d(calc(var(--rail-travel, 0px) * -1), 0, 0); } }
@supports (animation-timeline: scroll()) {
  @media (prefers-reduced-motion: no-preference) {
    html.sda .rail { animation: rail-pan linear both; animation-timeline: scroll(root block);
                     animation-range: var(--rail-start, 0px) var(--rail-end, 1px); }
  }
}
```

```js
// before ScrollCraft.mount(document.body):
const rail = document.querySelector('.rail');
if (CSS.supports('animation-timeline: scroll()') && CSS.supports('animation-range: 0px 1px')
    && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  rail.removeAttribute('data-sc-pan');            // engine no longer touches it
  document.documentElement.classList.add('sda');
}
// after mount, and on width changes, load and fonts.ready:
function setTravel() {
  const act = rail.closest('[data-sc-act]');
  const start = act.getBoundingClientRect().top + scrollY;
  rail.style.setProperty('--rail-travel', Math.max(0, rail.scrollWidth - innerWidth) * 1.02 + 'px');
  rail.style.setProperty('--rail-start', start + 'px');
  rail.style.setProperty('--rail-end', start + Math.max(1, act.offsetHeight - innerHeight) + 'px');
}
```

Use the pixel range; a `view()` timeline with `contain` measured the wrong length. On phones, re-measure only on width changes (the address bar changes the height constantly). Also drop per-card effects on phones (a vertical "settle", separate art and label speeds): only the row should move, or it reads as a wobble.

## 4. Measure with instant scrolling

The engine's CSS sets `scroll-behavior: smooth`. A test that calls `scrollTo(0, y)` and measures 250 ms later reads a mid-glide position and reports a bug that isn't there. Always `scrollTo({ top: y, behavior: 'instant' })` in checks.

## 5. Reduced motion and pinned acts

Under `prefers-reduced-motion`, pinned pans and pinned "disc" or carousel acts keep their tall scroll height while the content stops moving: screens of dead scroll. Collapse them:

```css
@media (prefers-reduced-motion: reduce) {
  .rail-act, .wheel-act { height: auto !important; }
  .rail-act [data-sc-stage], .wheel-act [data-sc-stage] { position: static !important; height: auto !important; }
  .rail { transform: none !important; flex-direction: column; width: auto; }
}
```

## 6. Drift fights theme switches

`data-sc-drift` writes `--sc-canvas` inline on `<html>`, which beats any class-based dark or alternate theme. Don't combine drift with a theme toggle; paint grounds per section instead.

## 7. Flow-act parallax isn't zero at rest

For a flow act, progress at the top of the page is `vh / (height + vh)`, which is 0.5 only when the act is exactly one viewport tall. A short phone hero therefore starts with its parallax layers already shifted. Turn hero parallax off on phones, or make the hero exactly `100svh`.

## 8. Your own rules can bite later in the cascade

A later rule in the same media block re-centred a rail vertically and opened a 350 px empty gap on phones. When a layout looks wrong, read the computed style of the element in the browser before guessing at the source.

## 9. Effects that fade content break contrast

An arriving card at 72% opacity failed 4.5:1 on its small labels. Measure contrast with every ancestor's opacity multiplied in (`scripts/contrast.mjs` does), and keep any "settle" opacity floor at about 0.9 or higher.
