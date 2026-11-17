---
description: Deploy a finished page (own site, or a noindex concept at /<slug>/) and re-check it live
argument-hint: <build folder> [concept <slug>]
---

Ship this build: $ARGUMENTS

Use the `landing-page-studio` skill and follow `references/deploy.md`. Before deploying, confirm with me in one line: which folder, which project, which URL it will land on. For a concept, run `scripts/prepare-concept.mjs`, deploy only after my yes, check the `X-Robots-Tag: noindex` header and the visible "not affiliated" line on the live URL, then re-run `overlap.mjs` and `railcheck.mjs` against the live link and the GEO score with `geo audit`. Don't draft or send any message to the business unless I ask.
