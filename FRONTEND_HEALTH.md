# Frontend health and improvement backlog

Findings from a CSS/HTML structural review on **2026-07-29**. Two items were fixed the same day (see "Done"); the rest are written down here rather than done, because each is either a design decision or a larger refactor.

Loaded on demand, like `BRAND_RESEARCH.md` — not part of always-on context.

---

## Open: HTML structure and accessibility

- [ ] **The data table is not a table.** `DataTable.tsx` is built entirely from `<div>`s with `data-label` attributes — there is no `<table>`, `<thead>`, `<th scope>`, or `<caption>` anywhere in `src/`. It looks right, but screen readers get no row/column relationships and the sortable columns announce nothing. On a site whose entire purpose is a queryable dataset, this is the biggest semantic gap. `CLAUDE.md`'s "semantic HTML structure" claim holds for header/main/footer and not for the table. A real `<table>` with `scope` and `aria-sort` would also keep the responsive card layout if the `data-label` pattern moves to `td::before`.
- [ ] **The modal is not announced as a dialog.** `AddBrandForm` handles `Escape` and has a click-to-dismiss backdrop, but no `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, or focus trap, so keyboard users can tab into the page behind it and screen readers do not learn that a dialog opened.
- [ ] **Group labels use `<label>` where `<fieldset>`/`<legend>` belongs.** `BrandSuggestionForm` has 12 `<label>` for 7 `htmlFor` and `AddBrandForm` has 16 for 10. The unmatched ones label *groups* of controls (`Tillverkad i Sverige`, `Tillverkningsländer`, `Källor (länkar)`, `Nuvarande koncernstruktur`), so they point at nothing. A bare `<label>` with no `for` is inert.
- [ ] **Heading level skip on the home page.** `h1` in `Hero`, then the footer's `h3`, with no `h2` between. `About.tsx` is correctly nested, so this is home-only.

## Open: CSS

- [ ] **The page overflows horizontally at 320px, on every route.** Found 2026-08-04 while checking the widened home `<h1>`, via Chrome headless screenshots at `320x760`. Content is clipped at the right edge: the header's `+ Föreslå märke` button is cut mid-word, and so is body copy on both `/` and `/om`. **It is not the data table** — `/om` contains no table and clips identically, which isolates it to site chrome. Prime suspect is the header row, where the `brandsfrom.se` wordmark plus the filled and outlined buttons need more than the `calc(100vw - 32px)` = 288px the container allows at that width; the exact offending element was not pinned down. Note the smallest explicit breakpoint is `max-width: 599px`, so nothing in the stylesheet targets the 320-360px band that real small phones still occupy. Renders correctly at 599px and above. Related to the breakpoint item below, and worth measuring `document.documentElement.scrollWidth` per route before fixing.
- [ ] **Consolidate the grey ramp.** The token block now names 15 distinct greys (`--color-grey-25` … `--color-grey-900`) because tokenising was deliberately 1:1 with no visual change. Several are within one or two steps of each other (`#888888` / `#909090`, `#6b6b6b` / `#6e6e6e`, `#7e211a` / `#852221`) and almost certainly want merging. That *is* a visual change, so it needs a design decision per pair.
- [ ] **Decide on the two deviations from the official Sweden palette.** `--color-sweden-blue` is the flag blue `#006aa7` rather than Sweden Blue Standard `#005293` (also hardcoded as `theme-color` in `index.html`), and `--color-sweden-yellow` is `#fecc02` against the standard `#fecb00`. Either is defensible; right now the deviation is documented in `index.css` but unresolved.
- [ ] **Unify the breakpoint conventions.** 25 media queries mix mobile-first (`min-width: 840px`) with desktop-first (`max-width: 839px`) and ranges, so overrides are order-dependent. Breakpoints cluster at 599/600, 839/840, 1199/1200 and 1600, with a one-off at **520px** that looks accidental. Tokens exist for colour now; breakpoints deserve the same treatment (a documented set, one direction).
- [ ] **Tokenise the remaining non-colour values.** Three `rgba(0, 0, 0, …)` shadows, plus spacing and radii, are still literals. Colour was the worst offender and is done; shadows are the natural next step.
- [ ] **`--color-link-hover` is now unused.** Its only consumer was `.brand-website-link:hover`, deleted on 2026-08-03 when both links moved to `.text-link` (which inverts the fill instead of darkening the text). The token is still defined at `index.css:66`. Either drop it or keep it as the reserved darker link blue for a future non-inverting link — a palette decision, so it is written down rather than guessed at.
- [ ] Only **5 `!important`** in 1788 lines, which is healthy. No action.

## Open: `index.html`

- [ ] **No `og:image` / `twitter:image`.** Shared links render as text-only cards. The single highest-value SEO/social fix available.
- [ ] **No JSON-LD structured data.** For a searchable manufacturing database, `WebSite` + `Dataset` markup is what makes the content usable by AI answer surfaces. See the `seo-aeo-best-practices` skill.
- [ ] **The cookieyes script sits above `<meta charset>`** and loads synchronously in `<head>`. Charset should be inside the first 1024 bytes, and a third-party blocking script in `<head>` delays first paint. Move the meta up and defer the script.
- [ ] Twitter tags use `property=` where the spec expects `name=`. Works in practice; cosmetic.

---

## Done 2026-08-04

- [x] **The dash ban extends to site chrome.** The open question here was whether the en dash banned from brand copy on 2026-07-29 also applied to titles. Maximilian's ruling: it does. All five title strings now use a plain hyphen: `index.html:12,13,21,29` (`<title>`, `meta name="title"`, `og:title`, `twitter:title`) plus the two runtime `document.title` calls at `src/pages/Home.tsx:40` and `src/pages/About.tsx:7`. Wording was left untouched, so the `varumärken` (title tag) vs `märken` (hero) vocabulary split still stands as a separate open question.
- [x] **Home `<h1>` widened to `Svenska märken och tillverkare`** (`src/components/Hero.tsx:9`). It read `Svenska märken`, a leftover the 2026-07-26 `brandsfrom.se` rename missed, which was narrower than its own subhead (`märken och tillverkare`) and hardcoded the `svensk` the rename had deliberately dropped from the wordmark directly above it. The subhead lost its redundant third `märken`. The About `<h1>` went from `Svensktillverkat?` to `Vad betyder svensktillverkat?` so it no longer reads as a fourth site name. **Still open:** the stale-count problem is structural, not fixed — `index.html:14,22,30` and `public/llms*.txt` hold a hand-maintained `135+` floor because static files cannot read the live count the hero gets from Sanity. Bump it when the dataset grows meaningfully.

---

## Done 2026-08-03

- [x] **One canonical text link.** The expanded row rendered two adjacent external links with two unrelated classes: `.brand-website-link` (the `Länk till <varumärke>` anchor, added 2026-03-07) and `.kalla-link` (the `Källor` anchors, rewritten 2026-07-25). `bf67043` had retrofitted the older one's colour to `--color-link` so the two wouldn't clash side by side, but nothing else carried over, so they shared a blue and differed in everything else. Both are now the shared **`.text-link`** class, defined once where `.brand-website-link` used to sit. The `Källor` links are unchanged; the brand website link gains `text-underline-offset`, the inverted hover fill, `overflow-wrap: anywhere` in place of `word-break: break-all` (which breaks mid-word), the transition with its `prefers-reduced-motion` guard, and a **`:focus-visible` state it previously did not have at all** — it was the one link in the app with no visible keyboard focus. Link text is still the raw URL; no copy change.

## Done 2026-07-29

- [x] **Colour tokens.** All 142 hex literals in `index.css` replaced with 33 `--color-*` custom properties named after the official Sweden brand palette (`sharingsweden.se/the-sweden-brand/brand-visual-identity/colour`). Exact official matches keep the official name (**Dawn Blue** `#1a3050`, **Pale Winter Grey 2** `#ededed`, **White**); greys use a numeric ramp; the specialty families (Green, Red, Blue) use tint/shade pairs, mirroring how the official palette structures its seven steps. Verified colour-for-colour identical: 142 slots before, 142 after, same values in the same order.
- [x] **Render-blocking CSS cut from 442 kB to 51 kB** (gzip 89 → 12 kB). `flag-icons` ships ~540 flags and Vite's default 4 kB inline limit base64-inlined 400 of them into the stylesheet. `assetsInlineLimit: 0` in `vite.config.ts` turns each into a cached file fetched only when shown; nothing in `src/` imports images, so the change touches only flag-icons.
- [x] **Fixed a live crash.** `DataTable.tsx` called `tillverkningsländer.join()` unguarded while one published brand (Verso Skincare) has the field as `null`. Fixed at the GROQ boundary with `coalesce(tillverkningslander, [])` plus a `?.length` guard rendering `Uppgift saknas`. The TypeScript type said `string[]` and was wrong.
