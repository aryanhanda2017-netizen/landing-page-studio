# Verification

A scroll page has no single state, and a reviewer looks at it on a phone. Run all of this against the local server before showing anyone, fix, and run it again. `SKILL` below means this skill's folder.

Serve the build on its own port (ScrollCraft's `scripts/serve.mjs --root <build> --port <port>`, or a `.claude/launch.json` entry started with the preview tool). Stop the server when done; these checks open Chrome and memory adds up.

## 1. ScrollCraft harness (desktop, phone, reduced motion)

```bash
SC=$(dirname "$(find ~/.claude/plugins -path '*scroll-craft/SKILL.md' | head -1)")
node $SC/scripts/shoot.mjs --url http://localhost:<port> --out lab/<slug>/shots
node $SC/scripts/shoot.mjs --url http://localhost:<port> --out lab/<slug>/mobile --width 390 --height 844
node $SC/scripts/shoot.mjs --url http://localhost:<port> --out lab/<slug>/reduced --reduced-motion
```

Pass: "no dead scroll detected" in all three, no console errors. Read each `sheet.png`; it proves things move, not that they look right. **Keep these folders outside the build folder**: three contact sheets pushed one build past 130 MB.

## 2. Dead bands (the check reviewers care about most)

```bash
node SKILL/scripts/deadband.mjs http://localhost:<port>/
```

Scrolls the whole page at 402 x 874, 390 x 844 and 1440 x 900 and reports the tallest strip of screen with nothing in it at each step. A screen row counts as content when it has visible text or media, or when its pixels aren't one flat colour (cards, discs, borders, photos), so a flat coloured band with nothing on it still counts as empty. Small fixed elements are hidden first and fade-ins count as present. Pass: nothing over 25% of the screen. Typical causes: stacked section padding after a pinned act, a rail centred vertically in a tall stage, copy that blanks out mid-transition, a hero stretched to `100svh` on phones.

## 3. Phone-size screenshots

```bash
node SKILL/scripts/shots.mjs http://localhost:<port>/ lab/<slug>/review
```

Hero after the reveal, every section top, and each pinned act at the start, middle and end, at 402 x 874 (2x) and 1440 x 900; add `--toggle-class is-dark` (or whatever class your second theme uses) for a second theme. Look at every one.

```bash
node SKILL/scripts/reveal.mjs http://localhost:<port>/ lab/<slug>/reveal
```

The hero at 150, 500, 900, 1400 and 2200 ms after load, then as it scrolls away. The reveal should read in order (back plane, subject, foreground, words) and the headline should be readable well before the last frame.

## 4. Hero layering

```bash
node SKILL/scripts/overlap.mjs http://localhost:<port>/ --mark '.hero__wordmark' --subject '.hero__person img'
```

How much of the wordmark each subject covers, at 5 screen sizes, using each image's real transparent top. Pass: 15 to 26% everywhere.

## 5. Scroll rails

```bash
node SKILL/scripts/railcheck.mjs http://localhost:<port>/ --rail '.rail'
```

At 0, 25, 50 and 100% of the pinned act the rail is where the scroll says it should be, and at 100% its last item is in view. Pass on phone and desktop. A smooth headless run does not prove a smooth iPhone; the CSS scroll-timeline rule (`scrollcraft-traps.md` §3) is what fixes phone stutter.

## 6. Contrast

```bash
node SKILL/scripts/contrast.mjs http://localhost:<port>/ --toggle-class is-dark
```

Every visible text line at 4.5:1 (3:1 for large text) against what is actually painted behind it, with all ancestor opacity multiplied in, at every section and pinned-act stop, in every theme. Lines hidden under an opaque bar are skipped. Lines over a photo or a cut-out can't be measured, so they are listed for a look by eye. Pass: 0 failures, and the listed lines look readable.

## 7. Search and AI readiness

`seo-aeo-geo.md`: `page_checks.py` 0 High and 0 Medium, `agentic_check.py`, and the GEO score on the live link after deploy.

## 8. Copy

`grep -c "—" index.html` is 0; no hype verbs; one label per action.

## What headless checks can't prove

A real phone's touch scrolling, Safari's address bar, video decoding and Low Power Mode. Say so in the report, and when the user reports a phone problem, reproduce it at their exact viewport size before fixing.
