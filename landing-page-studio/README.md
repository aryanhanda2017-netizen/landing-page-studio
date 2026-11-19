# Landing Page Studio

A Claude Code plugin for designing landing pages and homepages that look premium and still hold up on a phone. It covers the whole workflow, from reading a business's real material to a live, checked page:

1. **Read the business.** Collect facts with their source URLs, the logo, brand colours, people photos, real work, client logos and contact routes. The `site-inventory` agent does this for a whole site.
2. **Brief and grammar.** Using ScrollCraft's method, write a brief, a page grammar, a feeling curve with one peak, and a signature move.
3. **Layered hero with a reveal.** A back plane (often their wordmark), the subject (often their founders, cut out on-device) and a foreground, all moving at different rates.
4. **Sections from 21st.dev.** Searched one act at a time, then rebuilt by hand in plain HTML, CSS and JS.
5. **Build** on the ScrollCraft engine, with SEO, AEO and GEO built in from the start.
6. **Verify with scripts, not by eye.** The scripts check dead bands, phone screenshots, hero overlap, scroll rails and contrast.
7. **Polish** with unslop.
8. **Review, ship and send.** For a concept rebuild, the page deploys with noindex and you draft the message to the owner.

Every rule in `references/` comes from real review rounds on real pages: each one is something a reviewer caught on a phone or a laptop.

## Install

In Claude Code:

```
/plugin marketplace add aryanhanda2017-netizen/landing-page-studio
/plugin install landing-page-studio@landing-page-studio
```

Or from a terminal:

```bash
claude plugin marketplace add aryanhanda2017-netizen/landing-page-studio
claude plugin install landing-page-studio@landing-page-studio
```

Restart Claude Code after installing so the skill, commands and agent load.

### What it builds on

The plugin doesn't copy other people's work. It calls their tools, so install those once:

| Tool | What it does here | Install |
|---|---|---|
| **ScrollCraft** by Nate Herk (MIT) | Brief method, page grammars, scroll engine, screenshot harness | `/plugin marketplace add nateherkai/scroll-craft` then `/plugin install nateherk-design@nateherk` |
| **21st.dev MCP** | Section and interaction patterns | Get an API key at 21st.dev, then `export TWENTYFIRST_API_KEY=...` before starting Claude Code. The plugin's `.mcp.json` reads it. |
| **unslop** by Damir Sokolovsky (CC BY 4.0) | Final polish pass | `/plugin marketplace add heydamir/unslop` then `/plugin install unslop@heydamir` |
| **claude-seo** by AgriciDaniel | Page and AI-agent checks | github.com/AgriciDaniel/claude-seo (v2.6.2 or newer) |
| **geo-optimizer** | GEO score from 0 to 100 | `pipx install geo-optimizer-skill` |
| playwright-core + Google Chrome | Runs every check script | `npm i playwright-core` in your build project. The scripts find Chrome themselves, or you can set `CHROME_PATH`. |
| ffmpeg, cwebp (optional) | Stills from videos, image compression | `brew install ffmpeg webp` |
| Vercel CLI (optional) | Deploy | `npm i -g vercel` |
| Xcode command line tools (macOS, optional) | On-device cut-outs and face boxes | `xcode-select --install`, then run `tools/vision/build.sh` in the skill folder |

You don't need to check these by hand. When the skill starts, Claude runs its preflight (`scripts/doctor.mjs`), which lists anything missing with the install line for each. To run it yourself, the plugin lives under `~/.claude/plugins/cache/landing-page-studio/`.

## Use

Ask in plain words, for example "design a landing page for my studio", "rebuild acme.com's homepage as a concept" or "make this homepage feel less flat". The skill triggers on its own. There are also three commands:

- `/landing-page-studio:build <business or URL> [own|concept]` runs the full workflow up to the review point.
- `/landing-page-studio:build <business or URL> own from poster-1` does the same, starting from one of the templates below.
- `/landing-page-studio:verify <url>` runs every check and fixes what fails.
- `/landing-page-studio:ship <build folder> [concept <slug>]` deploys and re-checks the live page.

## Templates

`templates/` holds 14 finished homepage templates in seven kinds of page: gallery, chaptered editorial, filmic one-shot, live surface (a form or planner that really works), typographic poster, rhythmic cutlist and continuous world. All of them are filled with one made-up studio's example content, so you can compare the designs side by side, and every one works at any scroll length. They're plain HTML, CSS and JS with no build step.

They arrive with the marketplace install (in `~/.claude/plugins/marketplaces/landing-page-studio/templates/`; the preflight prints the exact folder), or clone this repo. The full list, and how to preview one or make it yours, is in [`templates/README.md`](templates/README.md).

## The check scripts

All of them take a URL, run headless Chrome, and exit non-zero on failure.

| Script | Checks | Pass |
|---|---|---|
| `deadband.mjs <url>` | Tallest empty strip of screen at every scroll step, at 402, 390 and 1440 px wide | Nothing over 25% of the screen |
| `shots.mjs <url> <dir>` | Hero, every section top, and each pinned act at its start, middle and end, on phone and desktop | You look at every image |
| `reveal.mjs <url> <dir>` | Hero reveal frames over time, plus the hero exit | Reads in order and never blocks reading |
| `overlap.mjs <url> --mark sel --subject sel` | How much of the wordmark each hero subject covers, using each cut-out's real transparent top | 15 to 26% at five screen sizes |
| `railcheck.mjs <url> --rail sel` | Whether a sideways rail moves steadily and its last item lands in view | Steady, starts and ends in view |
| `contrast.mjs <url> [--toggle-class cls]` | Every visible text line against what is actually behind it, with ancestor opacity counted | 4.5:1, or 3:1 for large text |
| `prepare-concept.mjs <build> <root> <slug>` | Copies only the page into a deploy folder and adds noindex | Warns if the "not affiliated" line is missing |

## Rules it holds you to

- Every fact on the page comes from the business's own material. When their site contradicts itself, the claim stays out.
- Their logo appears in its own colours, never redrawn.
- No generated photos of the business or its people, and no AI upscaling of real faces.
- A concept rebuild of someone else's site stays noindex, carries a visible "Concept by you. Not affiliated with them." line, and only goes live with your yes. Nothing is ever sent for you.

## Credits

The scroll engine, page grammars and brief method are ScrollCraft by Nate Herk ([nateherkai/scroll-craft](https://github.com/nateherkai/scroll-craft), MIT). The templates ship its runtime (`scrollcraft.js`, `scrollcraft.css`) under that MIT licence. The polish pass is unslop by Damir Sokolovsky ([@heydamir](https://x.com/heydamir), CC BY 4.0). Search checks come from claude-seo by AgriciDaniel and geo-optimizer, and section patterns from 21st.dev. Nate Herk's "build it before you ask" idea shapes the concept-sample flow. This plugin is MIT; see `LICENSE`.
