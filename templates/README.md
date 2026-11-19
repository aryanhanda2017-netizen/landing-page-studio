# Website templates

Finished homepage templates, built with the Landing Page Studio workflow. Each one is a single static page (plain HTML, CSS and JS, no build step) with its own layout and scroll motion. All of them are filled with the same made-up studio, so you can compare the designs side by side. Every name, person, client, project, number and contact detail in them is example content.

Every template works with any scroll length: wherever a visitor stops, they see a finished, readable screen. No scroll-jacking, no forced snaps.

## The templates

| Template | Kind | What it does | Colours |
|---|---|---|---|
| [gallery-1](gallery-1/) | Gallery | Three cut-out team members stand over a giant wordmark; the work hangs like a show, and a fader turns the whole page from quiet to loud. | Tomato Press |
| [gallery-2](gallery-2/) | Gallery | Every project is a printed carton that folds up as you reach it; the close is one last carton addressed to the visitor. | Blush Gallery |
| [gallery-3](gallery-3/) | Gallery | A building you ride up floor by floor: each floor is one service, and the roof has three beacons. | Forest Floor |
| [gallery-4](gallery-4/) | Gallery | 25 labelled objects in one catalogue, ending on a full-screen film card. | Ice Blue |
| [editorial-1](editorial-1/) | Chaptered editorial | A magazine in chapters, with a page that turns in the corner and a colophon at the back. | Night Kiln |
| [editorial-2](editorial-2/) | Chaptered editorial | A quill writes the page; it closes on a letter card from the founders. | Mint Machine |
| [editorial-3](editorial-3/) | Chaptered editorial | Four chapters (Listen, Decide, Make, Launch) around a tin that returns at the close with its label. | Oat and Ink |
| [filmic-1](filmic-1/) | Filmic one-shot | One long camera shot past the studio's mark, a deck of case cards and a wall of people. | Deep Teal |
| [filmic-2](filmic-2/) | Filmic one-shot | The camera pushes into a speech bubble; it ends on rolling credits and an end card. | Cobalt Signal |
| [filmic-3](filmic-3/) | Filmic one-shot | A night drive down a road of lit signs to an exit ramp. | Night Kiln |
| [live-1](live-1/) | Live surface | Visitors drop services into a box and build a real quote that opens in WhatsApp. | Oat and Ink |
| [live-2](live-2/) | Live surface | One free-text box that turns what the visitor types into a ready WhatsApp message. | Clay Room |
| [live-3](live-3/) | Live surface | A real monthly planner: type your brand and it lands on the next free day. | Ice Blue |
| [poster-1](poster-1/) | Typographic poster | A flight through giant letters onto a glass sphere; no photos needed. | Midnight Brass |
| [poster-2](poster-2/) | Typographic poster | Big type on a fabric band, with an arrow that lifts each section. | Tomato Press |
| [poster-3](poster-3/) | Typographic poster | A poster that opens like a box and closes as a press release. | Moss Paper |
| [cutlist-1](cutlist-1/) | Rhythmic cutlist | A stamped badge, a staircase of offers and hard cuts between projects. | Newsprint |
| [cutlist-2](cutlist-2/) | Rhythmic cutlist | Fast, even cuts from project to project with no pinned sections at all. | Deep Teal |
| [cutlist-3](cutlist-3/) | Rhythmic cutlist | Vertical video-style frames in a steady rhythm, ending on one big button. | Sunflower |
| [world-1](world-1/) | Continuous world | A camera glides through one night city, stopping at each card. | Mint Machine |

## Look at one

Open the folder and serve it locally (some browsers block local files):

```bash
cd templates/poster-1
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Make it yours with Claude Code

With the plugin installed (see the main README), ask:

```
/landing-page-studio:build <your business or website> own from poster-1
```

or in plain words: "Build my homepage starting from the poster-1 template." The skill copies the template, reads your business, replaces every piece of example content with yours, and runs the phone and scroll checks before showing you the result. Where you have nothing real for a section (say, no team photos), it drops or reshapes that section instead of keeping the example.

To do it by hand: change the colour tokens at the top of the page's `<style>`, replace the text, and swap the images in `assets/` for your own at the same size.

## Licences

- Templates: MIT, same as the plugin. Use them for your own site or your clients'.
- `scrollcraft.js` and `scrollcraft.css`: ScrollCraft by Nate Herk ([nateherkai/scroll-craft](https://github.com/nateherkai/scroll-craft)), MIT.
- Fonts in `assets/fonts/`: Google Fonts under the SIL Open Font License 1.1.
- Images: generated for these templates as example content. Replace them with your own before you publish.
