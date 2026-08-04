# Hållbarhetsfokus column — design

**Date:** 2026-08-03
**Status:** approved, not yet implemented
**Revised:** 2026-08-04 after a code review of this document. Corrections are folded into the sections
below. Two taxonomy questions could not be resolved without a decision and are collected under
*Open questions*; they block the backfill, not the rendering work.

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

## Open questions — these block the backfill

Both surfaced in the 2026-08-04 review and neither can be settled from the prose alone. The schema,
GROQ, module, CSS and test work below is unaffected; the 102-brand tagging pass cannot start until
these are answered, because the answer changes what a glyph asserts.

### 1. Whose sustainability work do the tags describe?

Nothing in this design separates a brand's own claims from its parent group's, and the prose routinely
contains both. Malaco's value opens *"Inget Malaco-specifikt hållbarhetsarbete redovisas"* and then
describes Cloetta's recyclable packaging and RSPO-certified palm oil. Höganäs Keramik says *"Inga
varumärkesspecifika hållbarhetsmål finns"* and then lists Fiskars' scope 1-2 targets and circular
product goal. Tagged literally from the glyph table below, both brands get two Dawn Blue glyphs
asserting work their own text explicitly denies — the exact false attribution the `Inget redovisat`
state was introduced to prevent, re-entering through parent-group text.

Options:

- **(a) Brand-level claims only.** Koncern programmes never earn a glyph. Honest reading of a column
  headed by the brand's name, but it discards real information the prose contains.
- **(b) Either counts.** The expanded row's prose carries the distinction. Cheapest to tag, and makes
  the column mean "sustainability work in this brand's supply chain", not "by this brand".
- **(c) Either counts, group-level tags marked.** Needs a second visual state per glyph, which the
  uniform-colour decision has no room for.

Whichever is chosen has to be written into the backfill instructions as a rule, or the 102-brand pass
will not be reproducible.

### 2. Does the `Inget redovisat` state survive that decision?

All five brands cited under *Cell states* as proof of the state do match themes under this document's
own glyph table. POC's *"Utfasning av PFAS/PFC-behandlingar"* is verbatim the `kemikalier` row, and
its GRS-certified recycled polyester hits `certifiering` + `materialval`. Malaco's RSPO is listed by
name under `certifiering`. Höganäs Keramik's scope 1-2 and scope 3 figures are `klimatmal`. Iris
Hantverk's organic cotton and Svenskt Tenn's *"100 procent bomull eller lin"* are both `materialval`.
So the claim that they "match zero themes" is false as written.

Under option (a) the state is reachable and these five are plausibly its examples. Under (b) it is
close to unreachable, and both the state and its test should be dropped rather than shipped dead. The
justification currently reads as though (b) were chosen and (a) were true at the same time.

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

`options.list` makes Studio render checkboxes, but it does **not** make typos impossible: it is a
Studio input affordance only. The Content Lake accepts any string, and the backfill below writes
through `patch_documents`, bypassing Studio entirely — the same reason the existing `options.list`
fields in this schema never constrained their values either. A slug mistyped during the 102-brand pass
(`klimatmål` with å, `certifieringar`, `forpakning`) is stored happily, then silently dropped at
render because the cell filters the canonical list rather than mapping the stored array. A brand whose
slugs are all mistyped falls through to `Inget redovisat`, publicly asserting it reports nothing.

So the field carries an explicit rule, which at least fails a Studio save:

```ts
validation: (Rule) =>
  Rule.unique().custom((taggar) =>
    (taggar ?? []).every((t) => HALLBARHET_SLUGS.includes(t)) || 'Okänd hållbarhetstagg'
  ),
```

That still does not cover the API path, so the backfill gets a verification step: after each batch,
query for documents holding a slug outside the nine and fix them before continuing. The unknown-slug
render test covers the display side. Slugs are ASCII, matching the schema convention.

**GROQ** (`src/lib/queries.ts`), next to the existing `hallbarhetsFokus` projection:

```groq
"hallbarhetsTaggar": coalesce(hallbarhetsTaggar, []),
```

The `coalesce` is not optional. It follows the `coalesce(tillverkningslander, [])` precedent added
when a `null` array crashed `DataTable` in production — the TypeScript type will declare
`HallbarhetsTagg[]` and this is what makes it an array rather than `undefined`. It does not make the
members valid: nothing at the type level or the query level constrains them to the nine slugs, which is
what the schema `validation` rule and the render-time filter are for.

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

The middle state was justified by five brands whose prose says precisely that nothing is reported —
Svenskt Tenn (*"Bolaget redovisar inga egna klimatmål eller certifieringar"*), POC, Iris Hantverk,
Malaco, Höganäs Keramik — on the argument that they match zero themes and so "reports nothing" becomes
a real, distinct state. **That argument does not hold as written: all five match at least one theme
under the glyph table below.** Whether the state is reachable at all depends on open question 1; see
open question 2. Do not implement the middle branch, or its test, until that is decided.

`Uppgift saknas` reuses the wording already used for missing `tillverkningsländer`.

### Markup

The `Flag.tsx` pattern — `<span role="img" aria-label="…">` per glyph — does **not** transfer here.
`Flag` only ever renders inside `expanded-details` via `KoncernstrukturTree`; this cell renders inside
`.table-row`, which carries `role="button"` and `tabIndex={0}` (`DataTable.tsx:89-99`). ARIA treats a
`button` as having presentational children, so nine `role="img"` descendants are not announced as nine
labelled images: at best their labels are folded into the row's own accessible name, at worst dropped,
and either way the reading is inconsistent between screen readers and unusably long on the richest
rows.

So the glyphs are `aria-hidden` and the cell carries one visually-hidden text alternative instead:

```tsx
<div className="table-cell" data-label="Hållbarhetsfokus">
  <span className="visually-hidden">Hållbarhetsfokus: Certifiering, Materialval, Förnybar energi</span>
  <span className="hallbarhet-icons" aria-hidden="true">{/* glyphs */}</span>
</div>
```

One phrase, built from the same `HALLBARHET_TAGGAR` labels, that reads correctly as part of the row
name. Nothing is focusable. `.visually-hidden` does not exist in `index.css` yet and comes with this
work.

## Tooltip and legend

**Tooltip:** pure CSS, `::after` carrying `content: attr(...)` plus a `::before` arrow, both
`pointer-events: none`, revealed on `:hover`. No JS, no new tab stops. Needs a
`prefers-reduced-motion` guard on the opacity transition, matching `.text-link`.

It also needs an explicit **`z-index` above 10 and a positioned ancestor**. `.letter-section-header` is
`position: sticky; z-index: 10` inside `.letter-section { position: relative }` (`index.css:538-554`),
and the sticky `.search-wrapper` above the table is `z-index: 40` (`index.css:303-314`). A tooltip left
at `z-index: auto` paints under the sticky letter header, so hovering an icon in the first row or two of
any letter group — where users scan first — hides the label. The tooltip opens **downward** for the same
reason; upward puts it straight under the sticky header.

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

**The gate has to widen.** That block currently renders only inside
`{brand.merInfo.hallbarhetsFokus && (…)}` (`DataTable.tsx:166`), and tags are an independent Sanity
field — the table cell keys off `tags.length > 0` regardless of prose. A brand that is tagged but has no
prose (or whose prose an editor later clears in Studio) would show a row of unlabelled glyphs in the
table and nothing at all on expanding, which with a hover-only tooltip leaves a touch user no route to
the labels. The condition becomes `hallbarhetsFokus || tags.length > 0`, with the prose paragraph itself
still conditional on `hallbarhetsFokus`.

## Responsive

**Desktop** (`>839px`): `.table-row` is `display: flex` with `.table-cell { flex: 1 }`. A fifth
content column takes each from 25% to 20%, roughly 230px at a 1200px container. `Kategori`'s longest
values already wrap at 25%; they will wrap slightly more often, absorbed by `min-height: 64px`.

**The header is a separate container and needs its own cell.** `.table-header` is an independent flex
container (`index.css:481-486`) holding one 48px spacer plus exactly four `.table-header-cell { flex: 1 }`
children (`DataTable.tsx:270-337`). Adding only the body cell leaves the header at four cells of 25%
against body rows of five at 20%: every label drifts one column right of its data, so `Tillverkad i
Sverige` sits over the icon column and `Mer info` over nothing, and because three of the four header
cells are the sort controls, a click above `Kategori` sorts by `Varumärke`. Add
`<div className="table-header-cell">Hållbarhetsfokus</div>` before the `Mer info` header, unsortable and
matching the cell's position.

**Mobile** (`≤839px`): the row is a `48px 1fr auto` two-row grid with cells positioned by
`:nth-child()` (`index.css:596-648`). Column 3, row 2 — under the status badge — is empty, and the icon
row goes there. This does need new CSS, on two counts:

- **Width.** Column 3 is `auto`, and the status badge already occupies column 3, row 1, so the track
  sizes to whichever of the two is wider. Nine 16px glyphs plus gaps is roughly 180-200px; on a 360px
  viewport that leaves the `1fr` name column around 110px, and long names (`EKA (Eskilstuna
  Kniffabriks Aktiebolag)`, `Skultuna Messingsbruk`) wrap to three or four lines — worst on exactly the
  richest rows the feature exists to show off. Either cap the strip (`flex-wrap: wrap` with a
  `max-width`, or fewer glyphs per line) or move it to column 2, row 3 and accept a taller row. Decide
  against a rendered mobile row, as with the colour decision.
- **Padding.** After the renumbering below, the new cell is `:nth-child(5)` and has no mobile rule, so
  it inherits the desktop base `padding: 16px` (`index.css:579-581`) while every sibling is overridden
  to `0 8px` or `0`. It needs its own block: `grid-column`, `grid-row` and `padding: 0`.

**The trap:** mobile positioning is `:nth-child()`-based, so inserting a cell renumbers everything
after it. The rule at `index.css:644`, `.table-cell:nth-child(5) { display: none }`, currently hides
`Mer info` and **must become `nth-child(6)`**. Miss this and the new column is hidden on mobile while
`Mer info` appears. This is the one change in the whole design that fails silently.

## Backfill — 102 brands

No re-research needed; the existing prose is specific enough to tag from. Process:

0. Settle open question 1 and write the answer into the tagging rule, so the pass is reproducible.
1. Read all 102 values and propose tags per brand as a reviewable list.
2. Maximilian corrects the list before anything is written.
3. Patch in batches. `BRAND_RESEARCH.md` documents `patch_documents` truncating around 4.5 kB, but
   that was with full field sets including rewritten `intro` and three `kallor`. Tag-only patches are
   tiny, so 10-15 brands per call is safe.
4. After each batch, query for slugs outside the nine (see *Data model*) and fix any before continuing.

**The column ships after the backfill, not alongside it.** The cell's middle state renders
`Inget redovisat` for any brand that has prose but no tags, so deploying the render before the batches
finish makes the site state that Morakniv, Haglöfs and Peak Performance report no sustainability work
while the expanded row directly below quotes their ISO 14001, bluesign and SBTi text — the same false
claim the state exists to avoid, inverted, across up to 102 rows. The schema field and the backfill can
land first and separately; the GROQ projection, cell, legend and header cell go in one commit after all
102 are tagged and reviewed.

The 29 brands with no `hallbarhetsFokus` need nothing and render `Uppgift saknas`.

## Tests

`src/lib/hallbarhet.ts` and the three-state cell logic are pure functions, making them the natural
first tests in a repo that currently has none and a `npm run lint` script that fails because `eslint`
was never installed. Add `vitest` here rather than as a separate chore. Cover:

- canonical ordering: a brand tagged `['forpackning','certifiering']` renders Certifiering first
- unknown slug in the array is ignored rather than crashing
- the three cell states, including `[]` for tags, plus a defensive case for the field being absent
  entirely (the `coalesce` should make that unreachable, and the test is what proves it) — but the
  middle state's test waits on open question 2; if that state goes, the test goes with it rather than
  being written against a branch nothing reaches

## Known limitations

- **Tags are our reading of the prose, not the brand's own claim.** A brand does not choose its tags;
  we infer them. The expanded row always shows the source text so a reader can check the inference.
- **29 brands render `Uppgift saknas`**, and 11 of those are large companies that certainly
  publish sustainability programmes (Volvo Cars, Volvo Trucks, Absolut Vodka, Thule, Acne Studios,
  Santa Maria, Hasselblad, Bahco, Tretorn, Rörstrand, Gense). The column makes those gaps
  conspicuous, which is an argument for a research pass, not against the column.
- **The tooltip is hover-only.** Keyboard and touch users get the labels from the legend and the
  expanded row. Per-icon focus was rejected: five icons across 131 rows would add 400+ tab stops, and
  focusable children inside a `role="button"` row are handled inconsistently by screen readers. Note
  this is not only a tooltip limitation — because the row is a `role="button"`, per-glyph ARIA labels
  are not reliably announced either, which is why the cell carries one visually-hidden phrase instead
  (see *Markup*). A screen reader user hears the themes as part of the row name, not as a scannable
  list; the expanded row remains the place the labels are properly enumerated.
- **Tag counts are not comparable between brands.** Five tags does not mean better than one. This is
  why the column does not sort, but nothing stops a reader inferring it anyway.

## Out of scope

- Filtering the table by tag. A natural follow-up, but it needs new filter UI in `Home.tsx` alongside
  the existing search chips and is a separate piece of work.
- Researching the 29 missing brands.
- Renaming `hallbarhetsFokus` / `hallbarhetsTaggar` to match the Swedish field-name convention.
