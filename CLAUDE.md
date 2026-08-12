# Svensk Databas - Manufacturing Transparency Database

Maximilian is developing a manufacturing transparency database website that tracks Swedish brands and reveals where their products are actually manufactured. The project aims to create transparency around "Made in Sweden" claims by categorizing brands as "Yes," "No," or "Partially" manufactured in Sweden.

## Git Conventions

- Do **not** include a `Co-Authored-By: Claude` trailer in any commit message

## Brand Research

Methodology for researching and adding brands lives in `BRAND_RESEARCH.md`. It is loaded on demand by the brand skills (`/add-brand`, `/discover-brands`, `/refresh-brands`) and the `brand-researcher` agent — it is intentionally **not** always-loaded from this file.

## Sanity CMS Integration

### Configuration
- **Project ID**: `kmjh3e1f`
- **Dataset**: `production`
- **CORS origins**: `http://localhost:5173`, `http://localhost:3333`

### Environment Variables (`.env.local`)
```
VITE_SANITY_PROJECT_ID=kmjh3e1f
VITE_SANITY_DATASET=production
```
Both vars must also be set in Cloudflare Pages environment settings for production.

**Write access:** The frontend never holds a write token. All writes (brandProposal, suggestion, brandStats, searchStats) go through Cloudflare Pages Functions in `functions/api/` (`/api/proposal`, `/api/suggestion`, `/api/track`). The functions require these server-side env vars (set as secrets in Cloudflare Pages, never with `VITE_` prefix):
```
SANITY_PROJECT_ID=kmjh3e1f
SANITY_DATASET=production
SANITY_WRITE_TOKEN=<secret — Cloudflare Pages only>
```

### Field Name Mapping (Sanity → TypeScript)
Sanity schema fields use ASCII names; the GROQ query in `src/lib/queries.ts` maps them to Swedish display names. This mapping is easy to get wrong:

| Sanity field (ASCII) | TypeScript interface (Swedish) |
|---|---|
| `varumarke` | `varumärke` |
| `tillverkningslander` | `tillverkningsländer` |
| `borsnoterat` | `börsnoterat` |
| `agare` | `ägare` |
| `agareLand` | `ägareLand` |
| `brandLand` | `land` (in BrandInHierarchy) |

## Frontend health

Colour lives in **design tokens** at the top of `src/index.css` (`--color-*`), named after the official Sweden brand palette. Use a token; do not add raw hex to the stylesheet.

External text links use the shared **`.text-link`** class in `src/index.css` (hyperlink blue, inverted fill on hover/`:focus-visible`, `prefers-reduced-motion` guard). Reuse it; do not hand-roll a new link class. Site chrome (`.header-title`, `.footer-link`, `.add-brand-btn`) is deliberately a separate lineage.

Open structural/accessibility work (div-based data table, dialog semantics, breakpoint conventions, missing `og:image` and JSON-LD) is tracked in `FRONTEND_HEALTH.md`, loaded on demand rather than always.

## Data Structures

**Gotcha:** `id` is a `string` (Sanity `_id`, e.g. `"brand-1"`), not a `number`. This is why `expandedRows` in `DataTable.tsx` is a `Set<string>`. See `src/types/brand.ts` for the full type definitions.

## Development

### Key Files for Common Tasks

**Adding/editing a brand:**
- **Automated**: `/add-brand [name]`, `/discover-brands`, `/refresh-brands` — Claude Code skills that research via the `brand-researcher` subagent and stage unpublished drafts for your approval. See `BRAND_RESEARCH.md` → "Automated workflows".
- Use Sanity Studio at `http://localhost:3333` (run `npm run studio`)
- Or edit via sanity.io/manage → project `kmjh3e1f` → dataset `production`
- Do NOT edit `brands.json` (legacy, unused)

**Editing Sanity schema:**
- After editing `studio/schemaTypes/`, redeploy: `npm run studio:deploy`
- Local schema files are source of truth

### Deployment Checklist
1. Add `VITE_SANITY_PROJECT_ID` + `VITE_SANITY_DATASET` to Cloudflare Pages env vars
2. `npm run studio:deploy` to deploy Studio to `*.sanity.studio`
3. Add production domain to CORS in sanity.io/manage → `kmjh3e1f` → API

## Swedish Terms Reference

- **Varumärke**: Brand name
- **Kategori**: Category
- **Tillverkad i Sverige**: Manufactured in Sweden
- **Ja / Nej / Delvis**: Yes / No / Partially
- **Moderbolag**: Parent company
- **Ägare**: Owner
- **Börsnoterat**: Publicly traded / Stock listed
- **Tillverkningsländer**: Manufacturing countries
- **Koncernstruktur**: Corporate structure
- **Koncern**: Corporate group
- **Mer info**: More information
- **Sök i registret**: Search the registry
- **Oberoende**: Independent
