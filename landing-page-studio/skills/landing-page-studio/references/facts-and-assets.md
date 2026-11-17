# Reading the business: facts and assets

Design follows inventory. Most weak pages come from designing before knowing what the business actually has.

## Capture the live page

Save the current homepage and a screenshot before touching anything (unslop ships `scripts/snapshot.mjs <url> out.html` for this). These are the "before" for the scores and the comparison.

## Read every page that holds facts

Homepage, about, services, work or case studies, team, contact, footer. For each fact keep the claim, the exact wording and the source URL in a facts table inside the build's `BRIEF.md` (`templates/BRIEF-template.md`).

- **Case studies beat banners.** Banner images often carry their own text ("15k followers in 4 months") that disagrees with the case page ("crossed 10k in November"). Use the case page and note the conflict.
- **Contradictions mean silence.** If the site states two different numbers for the same thing (200 clients in one block, 30 in another), use neither.
- **Testimonials word for word**, attributed exactly as they are. Only light whitespace fixes.
- **Check the contact form.** An empty `action` and no submit script means it sends nowhere. Use their real email and phone instead. Fix broken `tel:` links with the number printed on the page.
- **Count logos as files, not markup.** Markup repeats logos for carousels. Name each brand by reading the logo itself; a filename like `rbl.png` turned out to be Reliance Brands Limited, not RBL Bank.

## Assets

- Download their real images into the build's `assets/`, resized to the size they're shown at and compressed (`cwebp -q 78`). Keep originals outside the build folder.
- **Banner art with baked-in text**: crop to the art.
- **Videos are a source of real stills**: `ffmpeg -ss <t> -i in.mp4 -frames:v 1 -q:v 3 out.jpg` at 5 to 8 timestamps; skip motion blur and title cards. Don't put the video on the page unless the design needs it.
- **Cut-outs** of people or products: `tools/vision/cutout` (on-device, no upload, invents nothing). Check edges over light and dark grounds.
- **Their logo** keeps its own colours and shapes. Enlarging it is fine; redrawing or "correcting" it is not.
- **Fonts**: their brand font only if its licence allows web use (many agency sites run trial or desktop-licensed fonts). Otherwise use the craft default stack (`craft-defaults.md`).
- **Client logos** in their own colours. Logo-cloud components that grey them out are rejected.
- **No stock photos and no generated images** of the business, its people, its work or its results.

## For several sites at once

Dispatch one `site-inventory` agent per site. Each returns: offer and audience in one sentence, the facts table, an asset list with sizes, people photos (count, size, backdrop), contradictions, contact routes, and its recommendation for the hero subject.

## Concept rebuilds

You are showing an owner their own business, better. Anything invented ends the conversation. Keep the same business, same promise, same audience; tighten and clarify the copy, never change what they sell.
