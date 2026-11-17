---
name: landing-page-studio
description: Design, build or rebuild a premium, scroll-driven landing page or homepage from a business's real assets, then prove it works on a phone before anyone sees it. Covers reading the business, a layered hero with a reveal, sections picked from 21st.dev, ScrollCraft scroll motion, SEO/AEO/GEO built in, automatic checks for dead space, phone layout, overlap, contrast and motion, and shipping to Vercel. Use it whenever someone asks to design a landing page, build or redesign a homepage, rebuild a website (their own or a prospect's as a concept sample), make a site "premium", "less flat", "with depth", or "with scroll animations", or wants a homepage that ranks in Google and gets quoted by ChatGPT and Perplexity, even if they never say "landing page".
---

# Landing Page Studio

A landing page that wins has three things: it is built from the business's own truth (their name, people, work and results), it has one moment with real depth that people remember, and it holds up on the phone in the visitor's hand. This skill is the workflow that gets all three, and the checks that catch what eyes miss.

It orchestrates other tools rather than replacing them:
- **ScrollCraft** (`nateherk-design:scroll-craft`) owns the method: brief, page grammar, feeling curve, the scroll engine and its screenshot harness.
- **21st.dev MCP** supplies section patterns and small interactions, rebuilt by hand in plain HTML/CSS/JS.
- **unslop** does the final polish pass.
- **claude-seo** and **geo-optimizer** score search and AI-search readiness before and after.
- This skill adds the hero recipe, the craft defaults, the engine traps, the verification scripts and the ship steps that came out of real client review rounds.

Run `node <this skill>/scripts/doctor.mjs` first. It lists what is missing and how to install it.

## Two modes

Ask which one applies if it isn't obvious.

- **Own page**: the user's own business. Their brand, their copy approval, deployed normally.
- **Concept rebuild**: a redesign of someone else's live site, made as a sample to show its owner (an agency pitching a client, a freelancer pitching a prospect). Everything below applies, plus the concept rules: facts only from their own site, their logo untouched, `noindex`, a visible "Concept by <you>. Not affiliated with <them>." line, takedown on request, and nothing public without the user's yes. See `references/deploy.md` and `references/send-the-sample.md`.

## The workflow

Keep a task list with these phases. Show the user the work at the review point in phase 7, not before; it saves rounds.

### 1. Read the business (inventory first, design second)

Read `references/facts-and-assets.md`.

Before any design decision, collect: what they sell, to whom, where; every fact with its source URL; their logo and exact brand colours; their own photos (founders and team first, then work, then product); their videos (real stills can come from these); client logos; testimonials word for word; contact routes (check whether their form actually submits anywhere). Write down contradictions on their own site and leave contradicted claims out.

For a site with many pages, dispatch the `site-inventory` agent (one per site when doing several) and work from its report.

### 2. Brief, grammar and the one moment

Invoke the ScrollCraft skill and follow its Step 0 to Step 2: a brief (self-authored when the user delegates creative direction; say so), the visitor journey, one page grammar out of its eight, the feeling curve with one engineered peak, a signature move invented for this site, and the fingerprint gate against earlier builds.

Then apply this skill's hero rules from `references/hero-recipe.md`:
- The hero is a **layered scene with a reveal**, not a flat collage: a back plane (often their own wordmark), a subject (often their people, cut out on-device), a foreground (a ledge, frame or label) that overlap and move at different rates.
- **People first** when the business has founder or team photos; they are the one thing a competitor can't copy.
- **No paragraph in the hero.** Eyebrow, headline, one action, the scene. The plain "what we do, for whom, where" passage (the AEO passage) opens the next relevant section instead.
- If the assigned grammar forbids what the hero needs (a typographic poster forbids photography, a chaptered editorial forbids media above the fold), tell the user the trade-off and let them choose; don't break the grammar silently.

### 3. Sections from 21st.dev

Read `references/sections-21st.md`. One query per act, written from that act's job and the real content. Pull 6 to 8 candidates, run them through the gates (flat craft, real content only, rebuildable in plain HTML, works at 390 px, has a reduced-motion version, not already used in the same role), retrieve the winner with `get_component`, rebuild it by hand, and log the pick (act, component, id, why it won) in the brief and in a shared picks file so many builds don't converge on the same parts.

### 4. Build

Read `references/craft-defaults.md` and `references/scrollcraft-traps.md` before writing markup. Copy the ScrollCraft engine into the build folder, theme it with tokens, write real HTML. Every section gets a `data-sc-act` (the engine only animates and the harness only screenshots inside acts). Assets: their images resized to the size used and compressed (webp), cut-outs with `tools/vision/cutout`, no generated imagery of the business or its people. Build SEO, AEO and GEO in from the start (`references/seo-aeo-geo.md`).

### 5. Verify (the part that catches what eyes miss)

Read `references/verification.md` and run every check it lists against the local server. The thresholds that matter most:
- **No dead band**: no strip of empty screen taller than 25% of the viewport, anywhere, on phone or desktop (`scripts/deadband.mjs`).
- **Phone first**: screenshots at 402 x 874 (a current iPhone) and 390 x 844, not just desktop (`scripts/shots.mjs`), plus the hero reveal frame by frame (`scripts/reveal.mjs`).
- **Layering holds**: the hero subject covers about 15 to 26% of the wordmark at every screen size (`scripts/overlap.mjs`).
- **Scroll motion is honest**: horizontal rails reach their end and land jumps correctly (`scripts/railcheck.mjs`); sideways scroll animation runs on the browser's scroll timeline so it stays smooth on a real iPhone (`references/scrollcraft-traps.md` §3).
- **Contrast** at 4.5:1 for body text including inherited opacity, in every theme mode (`scripts/contrast.mjs`).
- Search: claude-seo `page_checks.py` with 0 High and 0 Medium findings, `agentic_check.py`, and the ScrollCraft harness on desktop, phone and reduced motion with no dead scroll.

Fix and re-run until clean. Say plainly what a headless check can't prove (a real phone's touch scrolling and video decoding).

### 6. Polish

Run unslop in polish mode against the page: fix what its audit finds, keep the brand and the direction. Where unslop's defaults clash with the craft defaults (tracked small-caps labels, one italic serif accent, layered parallax), keep the craft defaults and note it.

### 7. Review with the user

Show, in one message: phone-size and desktop screenshots (hero, each pinned act at its key positions, the close), the 21st.dev picks table, and before vs after scores. When they push back ("lack of depth", "this spacing is off on my phone"), give a real position: agree where they're right, push back where a rule or the grammar says otherwise, then fix and re-verify with the scripts, not by eye.

### 8. Ship

`references/deploy.md`: own page deploys normally; a concept deploys to a path on a concept project with `noindex` (meta and header), the "not affiliated" line, and only with the user's yes. Re-check the live URL at phone size (a CDN can serve the old file for a few seconds). Run the GEO score on the live link; geo-optimizer refuses localhost.

### 9. Send the sample (concept mode, optional)

`references/send-the-sample.md`: read the contact history first, draft a four-line message, flag any line that commits the user to free work, and never send it yourself.

## What to report at the end

One table per site: GEO before and after, page findings before vs after, AI-agent check before vs after, 21st.dev parts used, worst dead band, folder size, time spent, screenshot paths, and what was not verified.

## Truth rules (non-negotiable in both modes)

- Every fact, number, client, logo, testimonial and result on the page comes from the business's own material. If their site contradicts itself, leave the claim out and say why.
- Their logo in its own colours, never redrawn or "improved"; a white version only if they use one themselves.
- No generated photos of the business or its people, and no AI upscaling of real faces (it redraws them). Real photos can be cut out, cropped, resized and gently sharpened.
- Keep their real contact routes; don't wire a form to nowhere.
