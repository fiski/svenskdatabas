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

- [ ] **Consolidate the grey ramp.** The token block now names 15 distinct greys (`--color-grey-25` … `--color-grey-900`) because tokenising was deliberately 1:1 with no visual change. Several are within one or two steps of each other (`#888888` / `#909090`, `#6b6b6b` / `#6e6e6e`, `#7e211a` / `#852221`) and almost certainly want merging. That *is* a visual change, so it needs a design decision per pair.
- [ ] **Decide on the two deviations from the official Sweden palette.** `--color-sweden-blue` is the flag blue `#006aa7` rather than Sweden Blue Standard `#005293` (also hardcoded as `theme-color` in `index.html`), and `--color-sweden-yellow` is `#fecc02` against the standard `#fecb00`. Either is defensible; right now the deviation is documented in `index.css` but unresolved.
- [ ] **Unify the breakpoint conventions.** 25 media queries mix mobile-first (`min-width: 840px`) with desktop-first (`max-width: 839px`) and ranges, so overrides are order-dependent. Breakpoints cluster at 599/600, 839/840, 1199/1200 and 1600, with a one-off at **520px** that looks accidental. Tokens exist for colour now; breakpoints deserve the same treatment (a documented set, one direction).
- [ ] **Tokenise the remaining non-colour values.** Three `rgba(0, 0, 0, …)` shadows, plus spacing and radii, are still literals. Colour was the worst offender and is done; shadows are the natural next step.
- [ ] Only **5 `!important`** in 1788 lines, which is healthy. No action.

## Open: `index.html`

- [ ] **No `og:image` / `twitter:image`.** Shared links render as text-only cards. The single highest-value SEO/social fix available.
- [ ] **No JSON-LD structured data.** For a searchable manufacturing database, `WebSite` + `Dataset` markup is what makes the content usable by AI answer surfaces. See the `seo-aeo-best-practices` skill.
- [ ] **The cookieyes script sits above `<meta charset>`** and loads synchronously in `<head>`. Charset should be inside the first 1024 bytes, and a third-party blocking script in `<head>` delays first paint. Move the meta up and defer the script.
- [ ] Twitter tags use `property=` where the spec expects `name=`. Works in practice; cosmetic.
- [ ] The `<title>` contains an en dash, which is the character banned from brand copy on 2026-07-29. Site chrome was deliberately left alone — decide whether the ban extends here.

---

## Done 2026-07-29

- [x] **Colour tokens.** All 142 hex literals in `index.css` replaced with 33 `--color-*` custom properties named after the official Sweden brand palette (`sharingsweden.se/the-sweden-brand/brand-visual-identity/colour`). Exact official matches keep the official name (**Dawn Blue** `#1a3050`, **Pale Winter Grey 2** `#ededed`, **White**); greys use a numeric ramp; the specialty families (Green, Red, Blue) use tint/shade pairs, mirroring how the official palette structures its seven steps. Verified colour-for-colour identical: 142 slots before, 142 after, same values in the same order.
- [x] **Render-blocking CSS cut from 442 kB to 51 kB** (gzip 89 → 12 kB). `flag-icons` ships ~540 flags and Vite's default 4 kB inline limit base64-inlined 400 of them into the stylesheet. `assetsInlineLimit: 0` in `vite.config.ts` turns each into a cached file fetched only when shown; nothing in `src/` imports images, so the change touches only flag-icons.
- [x] **Fixed a live crash.** `DataTable.tsx` called `tillverkningsländer.join()` unguarded while one published brand (Verso Skincare) has the field as `null`. Fixed at the GROQ boundary with `coalesce(tillverkningslander, [])` plus a `?.length` guard rendering `Uppgift saknas`. The TypeScript type said `string[]` and was wrong.
