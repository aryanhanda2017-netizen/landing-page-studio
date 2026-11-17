---
description: Run every landing-page check (dead bands, phone shots, hero overlap, rails, contrast, SEO) against a local or live URL
argument-hint: <url> [--mark sel --subject sel] [--rail sel] [--toggle-class cls]
---

Verify this page: $ARGUMENTS

Use the `landing-page-studio` skill and run `references/verification.md` in order against the URL. Work out the selectors you need (wordmark, hero subjects, scroll rails, theme class) from the page source if I didn't give them. Report one table: check, result, pass or fail, and what each failure means on screen. Then fix the failures in the build, re-run the failing checks, and say what a headless check can't prove.
