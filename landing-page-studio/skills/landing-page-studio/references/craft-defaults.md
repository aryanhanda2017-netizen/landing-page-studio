# Craft defaults

The layer on top of the business's brand: spacing, type and motion rules, never colour. Their colours lead; these rules make the page feel considered. Change them if the user has their own system.

## Type

- UI and body: the Apple system stack, with Geist as the web-font fallback for non-Apple devices:
  `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Geist", "Helvetica Neue", Helvetica, Arial, sans-serif`.
- One accent face, used for at most one phrase per screen: Instrument Serif italic (a label title, a role, a client name). Ship it as a subset woff2 with its OFL licence.
- If the brand has its own display face and its licence allows web use, it leads the headlines.
- Display tracking tightens as size grows (about -0.02em on large headings); small uppercase labels get wide tracking (0.14 to 0.16em); headings use `text-wrap: balance`, body `text-wrap: pretty`.
- Headline weight 600, not 700 to 900; hierarchy from size and colour.

## Motion

- One easing everywhere: `cubic-bezier(.16, 1, .3, 1)`.
- Movement that reacts to the user finishes well under half a second; reveals on load finish in about 1.4 s and never block reading.
- `transform` and `opacity` (and `clip-path` for wipes) only; no `transition: all`, no animating width, height, top or left.
- A full `prefers-reduced-motion` version from day one: fewer and gentler, not zero, and no dead scroll.
- Hover effects only on `(hover: hover) and (pointer: fine)`.

## Surfaces

"Minimal" means flat surfaces, 1 px hairlines, bold numbers and small pill badges. Not glass, not glow, not gradient text. Depth comes from overlap, real layers and offset shadows with blur, used sparingly.

## Layout

- Spacing on a 4 px grid; more space above a heading than below it.
- One radius scale (for example 4 px for plates, 6 px for controls); no pill buttons on a square-cornered page.
- Body measure 45 to 75 characters.
- Phone is designed, not shrunk: at 390 to 402 px wide, recompose the hero, give rails and discs their own layout, and keep tap targets at 40 px or more.

## Copy

- Plain and specific, one action per screen, the same label for the same action everywhere ("Get in touch" in the nav, the hero and the close).
- No em dashes; use a period, comma, colon or parentheses.
- No hype verbs (leverage, unlock, supercharge, seamless, elevate), no "01 / 06" counters, no "scroll" cues, no eyebrow over every section.
- No trailing period on headlines and one-line subheads.

## Polish pass (unslop)

Run unslop in polish mode at the end and fix what it finds. Where its defaults clash with these (tracked small-caps labels, the italic accent, layered parallax depth), keep these and say so in the report.
