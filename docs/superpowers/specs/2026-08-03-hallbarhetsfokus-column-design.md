# Hållbarhetsfokus column — design

**Date:** 2026-08-03
**Status:** approved, not yet implemented

## Context

`hallbarhetsFokus` is free Swedish prose, one short paragraph per brand, describing what a brand's
sustainability work actually consists of. As of 2026-08-03, **102 of 131 published brands have a
value**; all 131 have `intro`. Until earlier today the field was collected, stored, fetched and typed
but never rendered anywhere. It now appears as a paragraph in the expanded row (commit `d4f16e1`).

The prose is good but it is only visible one brand at a time, after a click. Nothing about a brand's
sustainability posture survives at the table level, so the dataset cannot be scanned or compared on
that dimension.

This design adds a **`Hållbarhetsfokus` column carrying a row of themed icons**, so the shape of a
brand's sustainability work is legible without expanding anything. The stated goal is as much visual
as informational: the table currently offers two words and a badge per row, and an icon row gives it
texture.

## Decisions

| Question | Decision |
|---|---|
| Shape | Icon row — several glyphs per brand, not a single marker |
| Vocabulary | Nine themes |
| Colour | Uniform `--color-dawn-blue`; no per-theme colour |
| Icon order | Fixed canonical order, never stored-array order |
| Placement | Fifth content column, before `Mer info` |
| Sortable | **No** |
| Reveal | CSS tooltip on hover, plus a collapsible legend above the table |
| Empty states | `Inget redovisat` and `Uppgift saknas`, distinguished |

Two of these were settled by looking at a rendered mockup rather than by discussion: uniform colour,
and the glyph set itself.

### Why uniform colour

Nine hues would be noise; the token palette has nowhere near nine non-conflicting ones; and colour
coding nine categories fails outright for colourblind readers, so the shape has to carry the meaning
regardless.

Decisively, green and red are already spoken for by `StatusBadge` in the adjacent
`Tillverkad i Sverige` column. In the mockup, a green `Materialval` glyph sat two columns from a green
`Ja` badge on Morakniv, and a red `Kemikalier` glyph sat beside a red `Nej` badge on Haglöfs. Both
read as though the colours meant the same thing.

### Why not sortable

Sorting an icon set can only sort by tag count, which manufactures a "most sustainable" leaderboard
the data does not support. Peak Performance would top it on five tags while Oatly's single but
unusually rigorous per-product CO2e disclosure would sink to the bottom. The column follows
`Mer info` in being non-sortable.

### Why nine themes and not six

Nine is the richest row, which is the point of the feature. It costs three extra glyphs
(`Kemikalier`, `Djurvälfärd`, `Förpackning`) serving roughly 12-18 brands each, and makes the tagging
pass more judgement-heavy. Accepted deliberately.

### One theme deliberately excluded

`Lokal produktion / korta transporter` is a genuine recurring theme in the prose (Svenskt Tenn,
Ekelund, Woolpower, Byarums Bruk, Bruno Mathsson, Kero and others) but it would restate
`Tillverkad i Sverige`, sitting one column to the left, in different notation. Two columns asserting
the same fact is worse than not having it.

## Data model

New field in `studio/schemaTypes/brand.ts`:

```ts
defineField({
  name: 'hallbarhetsTaggar',
  title: 'Hållbarhetstaggar',
  type: 'array',
  of: [{ type: 'string' }],
  options: {
    list: [
      { title: 'Certifiering',    value: 'certifiering' },
      { title: 'Materialval',     value: 'materialval' },
      { title: 'Klimatmål',       value: 'klimatmal' },
      { title: 'Cirkularitet',    value: 'cirkularitet' },
      { title: 'Förnybar energi', value: 'energi' },
      { title: 'Spårbarhet',      value: 'sparbarhet' },
      { title: 'Kemikalier',      value: 'kemikalier' },
      { title: 'Djurvälfärd',     value: 'djurvalfard' },
      { title: 'Förpackning',     value: 'forpackning' },
    ],
  },
})
```

`options.list` makes Studio render checkboxes and makes typos impossible. Slugs are ASCII, matching
the schema convention.

**GROQ** (`src/lib/queries.ts`), next to the existing `hallbarhetsFokus` projection:

```groq
"hallbarhetsTaggar": coalesce(hallbarhetsTaggar, []),
```

The `coalesce` is not optional. It follows the `coalesce(tillverkningslander, [])` precedent added
when a `null` array crashed `DataTable` in production — the TypeScript type will declare
`HallbarhetsTagg[]` and this is what makes that declaration true.

**Type** (`src/types/brand.ts`), inside `merInfo`:

```ts
hallbarhetsTaggar: HallbarhetsTagg[];   // always an array, never undefined
```

with `HallbarhetsTagg` a union of the nine slug literals. Note this stays ASCII in the TypeScript
interface rather than being mapped to Swedish, consistent with the existing `hallbarhetsFokus`
precedent and diverging from the `tillverkningsländer` / `börsnoterat` / `ägare` convention
documented in `CLAUDE.md`. That inconsistency predates this work and is not addressed here.

## New module: `src/lib/hallbarhet.ts`

The single source of truth, consumed by the table cell, the legend and the expanded row:

```ts
export const HALLBARHET_TAGGAR = [
  { slug: 'certifiering',  label: 'Certifiering',    Icon: BadgeCheck },
  { slug: 'materialval',   label: 'Materialval',     Icon: Recycle },
  { slug: 'klimatmal',     label: 'Klimatmål',       Icon: TrendingDown },
  { slug: 'cirkularitet',  label: 'Cirkularitet',    Icon: Wrench },
  { slug: 'energi',        label: 'Förnybar energi', Icon: Zap },
  { slug: 'sparbarhet',    label: 'Spårbarhet',      Icon: Eye },
  { slug: 'kemikalier',    label: 'Kemikalier',      Icon: FlaskConical },
  { slug: 'djurvalfard',   label: 'Djurvälfärd',     Icon: PawPrint },
  { slug: 'forpackning',   label: 'Förpackning',     Icon: Package },
] as const;
```

Array order **is** the canonical render order. Rendering filters this list by the brand's tags rather
than mapping over the brand's tags, which is what guarantees `Certifiering` is always leftmost and
makes the column scannable down its length instead of shuffling per row.

Adding a tenth theme later is a one-line change in this file plus one entry in the Sanity list.

### Glyph rationale

All from `lucide-react`, already a dependency (`DataTable.tsx:2` uses it for sort icons), so nothing
new is installed.

| Slug | Glyph | Covers |
|---|---|---|
| `certifiering` | `BadgeCheck` | FSC, GOTS, OEKO-TEX, Svanen, B Corp, ISO 14001, bluesign, LWG, Fair Wear, BSCI, RSPO, Rainforest Alliance, ECOCERT |
| `materialval` | `Recycle` | recycled metals and plastics, organic cotton, FSC wood, vegetable-tanned leather |
| `klimatmal` | `TrendingDown` | SBTi-validated targets, scope 1-3 percentages, net-zero years |
| `cirkularitet` | `Wrench` | repair services, take-back, resale, spare parts, warranties, on-demand production |
| `energi` | `Zap` | renewable or fossil-free energy in own production, biogas, solar, waste heat |
| `sparbarhet` | `Eye` | public supplier lists, tier 1/2 traceability, factory audits |
| `kemikalier` | `FlaskConical` | PFAS/PFC phase-out, REACH, ZDHC MRSL, lead-free glass |
| `djurvalfard` | `PawPrint` | vegan, cruelty-free, mulesing-free, RDS/RWS, down and wool promises |
| `forpackning` | `Package` | packaging material, recycled or recyclable packaging, plastic reduction |

`TrendingDown` was chosen over `Target`, and `Wrench` over `RefreshCw`, for distinctness at 16px:
`Target` and `Eye` are both round, and `RefreshCw` and `Recycle` are both circular arrows.

## Rendering

### Cell states

```
tags.length > 0                        → icon row
tags.length === 0 && hallbarhetsFokus  → "Inget redovisat"
neither                                → "Uppgift saknas"
```

The middle state matters. Several brands have prose whose content is precisely that nothing is
reported — Svenskt Tenn (*"Bolaget redovisar inga egna klimatmål eller certifieringar"*), POC, Iris
Hantverk, Malaco, Höganäs Keramik. Under a single presence marker they would have been marked as
having sustainability work, the opposite of what their text says. Nine categories resolve this for
free: they match zero themes, so "reports nothing" becomes a real, distinct state.

`Uppgift saknas` reuses the wording already used for missing `tillverkningsländer`.

### Markup

Each icon is `<span role="img" aria-label="Certifiering">` wrapping the SVG, following the
established `Flag.tsx` pattern. Not focusable, and `aria-hidden` on the inner SVG.

## Tooltip and legend

**Tooltip:** pure CSS, `::after` carrying `content: attr(...)` plus a `::before` arrow, both
`pointer-events: none`, revealed on `:hover`. No JS, no new tab stops. Needs a
`prefers-reduced-motion` guard on the opacity transition, matching `.text-link`.

**Legend:** a native `<details>`/`<summary>` disclosure above the table — keyboard accessible, no JS,
collapsed by default so it costs nothing on first paint. Summary reads
`Hållbarhetsfokus: vad betyder ikonerna?`. Nine glyphs is more than anyone discovers by hovering one
at a time, so the legend is not optional garnish.

## Expanded row

The `Hållbarhetsfokus` block added in `d4f16e1` gains a labelled icon strip above its prose, so every
glyph is named in full at least once per brand:

```
Hållbarhetsfokus
✓ Certifiering   ♻ Materialval   ⚡ Förnybar energi
"Certifierade enligt ISO 9001 och ISO 14001 med all tillverkning
 samlad i den egna fabriken i Mora…"
```

This is also the accessible route to the labels for keyboard users, who cannot trigger the hover
tooltip.

## Responsive

**Desktop** (`>839px`): `.table-row` is `display: flex` with `.table-cell { flex: 1 }`. A fifth
content column takes each from 25% to 20%, roughly 230px at a 1200px container. `Kategori`'s longest
values already wrap at 25%; they will wrap slightly more often, absorbed by `min-height: 64px`.

**Mobile** (`≤839px`): the row is a `48px 1fr auto` two-row grid with cells positioned by
`:nth-child()`. Column 3, row 2 — under the status badge — is currently empty, and the icon row goes
there. No new layout needed.

**The trap:** mobile positioning is `:nth-child()`-based, so inserting a cell renumbers everything
after it. The rule at `index.css:644`, `.table-cell:nth-child(5) { display: none }`, currently hides
`Mer info` and **must become `nth-child(6)`**. Miss this and the new column is hidden on mobile while
`Mer info` appears. This is the one change in the whole design that fails silently.

## Backfill — 102 brands

No re-research needed; the existing prose is specific enough to tag from. Process:

1. Read all 102 values and propose tags per brand as a reviewable list.
2. Maximilian corrects the list before anything is written.
3. Patch in batches. `BRAND_RESEARCH.md` documents `patch_documents` truncating around 4.5 kB, but
   that was with full field sets including rewritten `intro` and three `kallor`. Tag-only patches are
   tiny, so 10-15 brands per call is safe.

The 29 brands with no `hallbarhetsFokus` need nothing and render `Uppgift saknas`.

## Tests

`src/lib/hallbarhet.ts` and the three-state cell logic are pure functions, making them the natural
first tests in a repo that currently has none and a `npm run lint` script that fails because `eslint`
was never installed. Add `vitest` here rather than as a separate chore. Cover:

- canonical ordering: a brand tagged `['forpackning','certifiering']` renders Certifiering first
- unknown slug in the array is ignored rather than crashing
- the three cell states, including `[]` for tags, plus a defensive case for the field being absent
  entirely (the `coalesce` should make that unreachable, and the test is what proves it)

## Known limitations

- **Tags are our reading of the prose, not the brand's own claim.** A brand does not choose its tags;
  we infer them. The expanded row always shows the source text so a reader can check the inference.
- **29 brands render `Uppgift saknas`**, and 11 of those are large companies that certainly
  publish sustainability programmes (Volvo Cars, Volvo Trucks, Absolut Vodka, Thule, Acne Studios,
  Santa Maria, Hasselblad, Bahco, Tretorn, Rörstrand, Gense). The column makes those gaps
  conspicuous, which is an argument for a research pass, not against the column.
- **The tooltip is hover-only.** Keyboard and touch users get the labels from the legend and the
  expanded row. Per-icon focus was rejected: five icons across 131 rows would add 400+ tab stops, and
  focusable children inside a `role="button"` row are handled inconsistently by screen readers.
- **Tag counts are not comparable between brands.** Five tags does not mean better than one. This is
  why the column does not sort, but nothing stops a reader inferring it anyway.

## Out of scope

- Filtering the table by tag. A natural follow-up, but it needs new filter UI in `Home.tsx` alongside
  the existing search chips and is a separate piece of work.
- Researching the 29 missing brands.
- Renaming `hallbarhetsFokus` / `hallbarhetsTaggar` to match the Swedish field-name convention.
