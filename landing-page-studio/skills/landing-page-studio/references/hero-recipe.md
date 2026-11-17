# The layered hero (recipe)

The most common review comment on a first build is "it lacks depth": a nice photo, a headline, some fades. A hero earns attention when the visitor sees separate planes that overlap and move at different rates, and when it **arrives** (a reveal) instead of simply being there.

## 1. Choose the subject

In order of preference:
1. **Their people.** Founder or team photos. Nobody else has them. Real faces beat any illustration.
2. **Their product or work**, if it has a strong silhouette that can be cut out.
3. **Their wordmark and type alone**, for brands whose asset is a sentence (pairs with ScrollCraft's typographic poster grammar).

Check sizes early. Small source photos (250 to 300 px wide is common on agency sites) limit how big the subject can be: plan the subject at no more than about 1.5x its source size on a normal screen. Don't AI-upscale faces; it invents skin, hair and teeth.

## 2. Build one scene box, not a page of loose layers

The failure: the wordmark is sized to the screen width while the people sit on the screen bottom. On a shorter or narrower window the people slide up over the whole name. Fix it structurally:

```css
.scene {
  position: relative; container-type: inline-size;   /* children use cqw */
  aspect-ratio: 100 / 58;                              /* the composition */
  width: var(--scene-w, min(80vw, 1120px));
  clip-path: inset(-20% -30% 0 -30%);                 /* hides what sits below the ledge */
}
.mark   { position: absolute; top: 4.4cqw; left: -9cqw; width: 118cqw; }   /* back plane */
.window { position: absolute; left: 7cqw; right: 7cqw; top: 22cqw; bottom: 0;
          container-type: inline-size; }               /* people + frame + ledge */
```

Everything inside is placed in units of the scene's own width, so the overlap and spacing are identical on every screen. Only the scene's size changes.

On desktop, fit the scene to the height left under the headline with a few lines of JS (re-run on resize):

```js
const head = entry.querySelector('.entry__head');
const avail = Math.max(innerHeight, 640) - (head.offsetTop + head.offsetHeight) - padBottom - 24;
entry.style.setProperty('--scene-w', Math.min(innerWidth * .84, 1280, Math.max(560, avail / .58)) + 'px');
```

On phones use `width: 100vw` and re-tune only the wordmark's position variables.

## 3. Planes

- **Back: their wordmark**, large. Use their own logo file. Enlarge it once (Lanczos, 2 to 3x) and tighten the alpha edge so the flat colour stays crisp; check the colour matches theirs exactly. Draw it as a CSS mask (`background: var(--mark-colour); mask: url(wordmark.png) center / contain no-repeat;`) so a dark or alternate theme can switch it to their white version, but only if their own site uses a white version.
- **Middle: the subject cut-outs.** `tools/vision/cutout in.jpg out.png` uses Apple's on-device Vision foreground mask: it removes the background and invents nothing. Great on studio backdrops and clean product shots; it fails on flat rectangles (browser screenshots) and white objects. For those, put the object on a white circle plate instead of cutting it out. Enlarge 2x with Lanczos plus a light unsharp mask.
- **Front: a frame or ledge** in the brand colour that the subjects lean out of. It hides the bottoms of the cut-outs and carries names and roles.

## 4. Several people

- **Equal heads.** People photographed separately come out at different scales. Measure: `tools/vision/faces a.png b.png c.png` prints each face box; add each cut-out's transparent top (first non-transparent row) to get hair-to-chin height, then set widths so the heads match. A reviewer will spot "she looks bigger" instantly.
- **Even spacing.** Same gap between centres; match eye lines with small vertical offsets.
- **Hide every crop edge.** Each photo ends in a hard vertical edge where it was framed. Order depth left to right (back to front) so each person covers the edge of the one behind; frame posts hide the two outer edges; feather the one edge that still crosses another person with a mask. Use two mask layers that overlap (for example 42% top and 60% bottom) or a 1 px seam appears.
- Keep faces clear of each other's hair and hands at phone size; if they collide, the people are too big for that screen.

## 5. The overlap target

The subject may cover the bottom of the wordmark, about 15 to 26% of the letter height, never most of it. Measure it at five screen sizes with `scripts/overlap.mjs --mark <selector> --subject <selector>`; it reads each cut-out's real transparent top from the image itself.

## 6. The reveal

About 1.4 s total, on `cubic-bezier(.16,1,.3,1)`:
1. The wordmark rises from behind its own baseline (`clip-path: inset(0 0 100% 0)` to `inset(0)` plus a small translate), 0.9 s.
2. The frame or ledge slides up, 0.5 s, from 0.2 s.
3. The people pop up from behind the ledge one by one, 140 ms apart, 0.85 s each.
4. The headline and the one action fade up early so reading is never blocked.

Gate it so no-JS and reduced-motion visitors get the finished composition:

```html
<script>if (!matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.classList.add('pre-reveal');</script>
```

Hidden states live only under `html.pre-reveal`; remove the class after the hero images `decode()` (with a 1.6 s fallback timeout), two animation frames later.

## 7. Scroll depth

On desktop, give each plane a different `data-sc-parallax` rate (the name recedes, the people come forward, the ledge holds) and, on fine pointers, a small pointer offset per plane with the CSS `translate` property (it composes with the engine's `transform`).

**On phones, turn scroll parallax off for the hero planes** (`transform: none !important`). A flow act whose height differs from the viewport starts its parallax already offset, which shifts the layers by a different amount on every phone height and wrecks the overlap.

## 8. What the hero must not have

A paragraph (move the AEO passage to the services section), more than one action, a stat that the business can't support, or a subject so large it covers the brand name.
