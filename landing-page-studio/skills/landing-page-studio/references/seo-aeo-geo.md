# SEO, AEO and GEO, built in

The page is static HTML, so search engines and AI answer engines read exactly what you write. Build these in while building, then score before and after.

## Before scores (on the live site)

```bash
geo audit --url https://their-site.com --format json --output before-geo.json          # geo-optimizer, 0 to 100
~/.claude/skills/seo/scripts/claude-seo run page_checks.py --url https://their-site.com > before-page.json
~/.claude/skills/seo/scripts/claude-seo run agentic_check.py --json https://their-site.com > before-agentic.json
```

(The claude-seo path depends on how you installed it; `scripts/doctor.mjs` prints the one it found.)

## In the page

- All real content in the HTML; JavaScript only animates.
- One `<h1>`, ordered headings, a unique `<title>` of 50 to 60 characters and a meta description of 140 to 160, `lang`, canonical to the business's real domain (check which host the live site redirects to: www or not).
- Open Graph and Twitter tags with an absolute image URL; their favicon.
- Every `<img>` has real alt text describing the image (not the brand), `width` and `height`, lazy loading below the fold, `decoding="async"` on large images; preload the hero image and the fonts used above the fold.
- JSON-LD: `Organization`, or `ProfessionalService`/`LocalBusiness` when they show an address (name, legal name, url, logo, sameAs, contact point, address, founders if named), plus `WebSite`. `FAQPage` only for a real Q&A section whose answers come from their site.
- **The AEO passage**: one plain, quotable 40 to 60 word paragraph that answers "what does <business> do, for whom, and where". Put it where it reads naturally (opening the services section works well), not stuffed into the hero.
- Service sections as short self-contained passages with clear headings, each tied to real work where possible ("Seen in: <case>").
- Ship `robots.txt` (allow all, including GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended; point to the sitemap), `sitemap.xml` on their domain, and `llms.txt` (a Markdown summary with links). Templates in `templates/`.

## After scores

```bash
~/.claude/skills/seo/scripts/claude-seo run page_checks.py --file index.html --base-url https://their-site.com/ > after-page.json
CLAUDE_SEO_LOCAL_TARGETS=localhost:<port> ~/.claude/skills/seo/scripts/claude-seo run agentic_check.py --json http://localhost:<port>/ > after-agentic.json
```

Fix every High and Medium page finding and re-run. geo-optimizer refuses localhost, so run the GEO after-score on the deployed link. On a concept deployed to a path (`/slug/`), llms.txt and the sitemap don't sit at the domain root, so that part of the score stays at 0; say so rather than inflating it.

