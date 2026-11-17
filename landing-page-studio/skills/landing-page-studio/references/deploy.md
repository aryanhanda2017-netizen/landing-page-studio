# Shipping

## Own page

Deploy the build folder the way the business already hosts (Vercel, Netlify, their server). Remove nothing from the SEO setup: canonical, robots, sitemap and llms.txt belong at their domain root. Then run the GEO score on the live URL.

## Concept rebuild (someone else's business)

Only with the user's explicit yes for that site.

- **One project, one path per business**: a concept project such as `<you>-concepts` on Vercel, each site at `/<slug>/`. One project keeps the bare domain from listing anyone.
- **Copy only the page**: `index.html`, the engine files and `assets/`. Never the brief, scores, screenshots or notes. `scripts/prepare-concept.mjs <build-folder> <deploy-root> <slug>` copies these and adds `<meta name="robots" content="noindex">`.
- **noindex twice**: the meta tag and an `X-Robots-Tag: noindex` header from `vercel.json` (`templates/concept-vercel.json`, which also adds trailing slashes so relative asset paths work under `/<slug>/`).
- **A plain root page** that lists nothing (`templates/concept-index.html`).
- **The visible line** "Concept by <you>. Not affiliated with <business>." stays on the page, fixed and readable.
- **Takedown on request**, fast.

```bash
cd <deploy-root> && vercel deploy --prod --yes
curl -sI https://<project>.vercel.app/<slug>/ | grep -i x-robots-tag     # noindex
```

Then open the live URL at phone size and re-run `overlap.mjs` and `railcheck.mjs` against it. A CDN can serve the previous file for a few seconds after a deploy: re-check before telling anyone it's live.

Run `geo audit --url https://<project>.vercel.app/<slug>/` for the GEO after-score.
