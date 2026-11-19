# Picking sections from 21st.dev

21st.dev's MCP (`mcp__21st__*`, configured by this plugin's `.mcp.json` with your `TWENTYFIRST_API_KEY`, or by your own 21st.dev MCP server) searches a large catalogue of React/shadcn components. Searches are free; `get_component` returns full code (paid tiers retrieve without a daily cap). Use it as a pattern library, not a page builder.

## The site decides, not the catalogue

ScrollCraft's grammar and feeling curve give each act one job ("prove the work", "show who they serve", "say what they do"). Search for that job with the real content in mind.

1. **One query per act**, written from its job, the grammar and their content: "sticky horizontal case study gallery with captions", "client logo wall grid", "services index with hover image".
2. Run `search` with `type: "component"` (or `get_inspiration`) and pull 6 to 8 candidates. **Bookmarked items rank first whether they fit or not** (a glass dashboard topped a portfolio query); never take result one blindly.
3. **Gates, all must pass:**
   - fits the craft defaults: flat surfaces, hairlines, no glass, no glow, no gradient text;
   - needs only content the business really has (no fake dashboards, counters or avatars);
   - can be rebuilt in plain HTML/CSS/JS with all content in the HTML;
   - works on a 390 px phone;
   - has, or can be given, a reduced-motion version;
   - isn't already used in the same role on another build (check the picks log).
4. Retrieve the winner with `get_component`, read its structure and motion, and **rebuild it by hand**. Swap its easing to `cubic-bezier(.16,1,.3,1)` and its springs to short eased transitions.
5. **Log it**: in `BRIEF.md`, a table of act, component, 21st id, URL and why it won over the runners-up; and one line per pick in a shared `21ST-PICKS.md` so many builds don't converge on the same parts.
6. Client logos for brands the site names: `search_logo` (svgl), in each logo's own colours.

For big retrievals, let a subagent fetch the code and summarise the recipe (structure, sizes, motion values, accessibility) so the long source doesn't fill your context.

## Division of labour

- ScrollCraft's engine owns the scroll timeline and the page's one signature move (invented for the site, never copied).
- 21st.dev supplies section patterns and small interactions (reveals, marquees, hovers, a rotating disc, an index list).
- The craft defaults set easing, timing and type.

## Patterns that worked well

- A sideways case-study walk (sticky section, vertical scroll drives the row), each case on its own colour wall with a museum-style label (Brief, Work, Result).
- A scroll-turned services disc: their own service illustrations on white circle plates around a coloured wheel, half off the right edge on desktop and rising from the bottom on phones; each service holds for part of the scroll, then the disc turns; copy swaps with a quick crossfade so it is never blank mid-turn.
- A 1 px hairline logo grid with every brand in its own colours.
- A staggered testimonials grid with crop-mark hairlines, no avatars unless the business has real ones.
