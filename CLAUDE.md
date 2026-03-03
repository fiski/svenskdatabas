# Svensk Databas - Manufacturing Transparency Database

Maximilian is developing a manufacturing transparency database website that tracks Swedish brands and reveals where their products are actually manufactured. The project aims to create transparency around "Made in Sweden" claims by categorizing brands as "Yes," "No," or "Partially" manufactured in Sweden.

@BRAND_RESEARCH.md

## Tech Stack

**Frontend Framework:**
- React 18.3.1 with TypeScript 5.6.2
- Vite 6.0.3 (build tool and dev server)
- Strict TypeScript mode enabled

**Dependencies:**
- react-router-dom 7.10.1 (BrowserRouter for client-side routing)
- lucide-react 0.556.0 (Icon library for sort indicators)
- @sanity/client ^6.0.0 (CMS data fetching)
- flag-icons ^7.5.0 (Country flag CSS sprites)

**Styling:**
- Vanilla CSS (no CSS-in-JS)
- M3 Layout System for responsive design
- Custom Sweden Sans font family (4 weights: 300/400/600/700)

**CMS:**
- Sanity.io (project ID: `kmjh3e1f`, dataset: `production`)
- Sanity Studio in `studio/` directory

**Deployment:**
- Cloudflare Pages (frontend)
- Sanity Studio deployed to `*.sanity.studio`

**Development:**
- npm for package management
- ESLint for code quality
- Hot Module Replacement (HMR) via Vite

## Project Structure

```
svenskdatabas/
├── src/
│   ├── components/          # React components
│   │   ├── Header.tsx       # Navigation with react-router Links
│   │   ├── Footer.tsx       # Footer with links and email copy
│   │   ├── Hero.tsx         # Hero with dynamic brand count
│   │   ├── Search.tsx       # Multi-tag search with chip display
│   │   ├── DataTable.tsx    # Sortable table with lucide icons
│   │   ├── StatusBadge.tsx  # Status indicator (Ja/Nej/Delvis), dot variant
│   │   ├── Flag.tsx         # Country flag via flag-icons CSS sprites
│   │   ├── KoncernstrukturTree.tsx  # Visual corporate hierarchy tree
│   │   └── Container.tsx    # Layout container (unused)
│   ├── pages/               # Page components
│   │   ├── Home.tsx         # Main database page — async Sanity fetch
│   │   └── About.tsx        # About page with project info
│   ├── lib/
│   │   ├── sanityClient.ts  # Sanity client (reads env vars)
│   │   └── queries.ts       # ALL_BRANDS_QUERY GROQ (ASCII→Swedish mapping)
│   ├── data/
│   │   └── brands.json      # LEGACY — no longer used; data is in Sanity
│   ├── types/
│   │   └── brand.ts         # Brand, BrandInHierarchy, KoncernNode, SortColumn/SortDirection
│   ├── App.tsx              # Router configuration (BrowserRouter)
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles
├── studio/                  # Sanity Studio (standalone npm project)
│   ├── schemaTypes/
│   │   ├── brand.ts         # Brand document schema
│   │   ├── koncern.ts       # Koncern document schema
│   │   └── index.ts         # Schema registry
│   ├── migrations/
│   │   └── importFromJson.ts  # One-time migration script (legacy)
│   └── sanity.config.ts     # Studio configuration
├── fonts/                   # Sweden Sans font files
├── .env.local               # VITE_SANITY_PROJECT_ID + VITE_SANITY_DATASET (gitignored)
├── index.html               # HTML entry (Swedish lang)
└── CLAUDE.md                # This file
```

## Component Architecture

**Component Hierarchy:**
```
<App> (Router with BrowserRouter)
├── <Header> (uses react-router-dom Link)
├── <Routes>
│   ├── <Route path="/" element={<Home>}>
│   │   └── Home fetches from Sanity, manages search/sort state
│   │       ├── <Hero brandCount={totalBrands}>
│   │       ├── <div className="search-wrapper">
│   │       │   └── <Search> (multi-tag system)
│   │       └── <DataTable> (sortable columns)
│   │           └── For each brand:
│   │               ├── <StatusBadge>
│   │               ├── <Flag>
│   │               └── <KoncernstrukturTree> (expanded details)
│   └── <Route path="/om" element={<About>}>
│       └── About page with sections, email copy functionality
└── <Footer> (always rendered, outside Routes)
```

## Routing

The application uses React Router v7 with **BrowserRouter** for client-side navigation:

**Router Configuration (App.tsx):**
```typescript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';

function App() {
  return (
    <Router>
      <div>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/om" element={<About />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}
```

**Routes:**
- `/` → Home page (main database with search/filter/sort)
- `/om` → About page (project information and feedback)

## Component Responsibilities

- **App.tsx**: BrowserRouter configuration, renders Header + Routes + Footer
- **Home.tsx**: Main page — async fetch from Sanity, search/filter/sort state management
  - Manages: `allBrands`, `loading`, `error`, `currentInput`, `searchTags`, `sortColumn`, `sortDirection`
  - Fetches via `sanityClient.fetch(ALL_BRANDS_QUERY)` on mount
  - Loading state: shows Swedish loading message; Error state: shows Swedish error message
  - Swedish locale comparator for proper Å, Ä, Ö sorting
  - Status order mapping (Ja=1, Delvis=2, Nej=3)
  - Hybrid filtering: tags (AND logic) + live input
  - `useMemo` for performance optimization (depends on `allBrands`)
- **About.tsx**: Full About page implementation with email copy feature
- **Header.tsx**: Navigation using react-router-dom Link components
- **Footer.tsx**: Footer with Om link, LinkedIn, and email copy-to-clipboard ("Kontakt")
- **Hero.tsx**: Receives `brandCount` prop, displays dynamic count
- **Search.tsx**: Multi-tag search system
  - Props: `currentInput`, `onInputChange`, `searchTags`, `onAddTag`, `onRemoveTag`, `onClearAll`
  - Enter key creates new tag; ESC clears all
- **DataTable.tsx**: Sortable columns with lucide-react icons
  - Props: `brands`, `sortColumn`, `sortDirection`, `onSort`
  - Expandable rows use `Set<string>` (brand IDs are strings from Sanity)
  - Renders `<KoncernstrukturTree>` in expanded section
- **StatusBadge.tsx**: Color-coded status indicator
  - Props: `status`, `size?: 'default' | 'xs'`, `variant?: 'badge' | 'dot'`
  - `dot` variant renders a colored dot (no text) used inside KoncernstrukturTree for sibling brands
- **Flag.tsx**: Renders a country flag using `flag-icons` CSS library
  - Props: `countryCode` (ISO 3166-1 alpha-2, e.g. `"SE"`), `size?: 'small' | 'medium'`
  - Returns `null` if no countryCode provided
- **KoncernstrukturTree.tsx**: Visual tree showing corporate hierarchy
  - Props: `koncernstruktur: KoncernNode | string`, `currentBrandName`, `currentBrandStatus`
  - Falls back to plain text display for legacy string format
  - Tree levels: ÄGARE → MODERBOLAG → VARUMÄRKE
  - Renders `<Flag>` for country codes; `<StatusBadge variant="dot">` for Swedish siblings
  - Shows "Oberoende svenskt företag" for single-brand companies
- **Container.tsx**: Responsive layout wrapper (currently unused)

## Sanity CMS Integration

### Configuration
- **Project ID**: `kmjh3e1f`
- **Dataset**: `production`
- **CORS origins**: `http://localhost:5173`, `http://localhost:3333`

### Environment Variables (`.env.local`)
```
VITE_SANITY_PROJECT_ID=kmjh3e1f
VITE_SANITY_DATASET=production
VITE_SANITY_WRITE_TOKEN=REDACTED_TOKEN_1
VITE_SANITY_WRITE_TOKEN=REDACTED_TOKEN_2
```
Both vars must also be set in Cloudflare Pages environment settings for production.

### Sanity Client (`src/lib/sanityClient.ts`)
```typescript
import { createClient } from '@sanity/client'

export const sanityClient = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID as string,
  dataset: (import.meta.env.VITE_SANITY_DATASET as string) ?? 'production',
  useCdn: true,
  apiVersion: '2024-01-01',
})
```

### GROQ Query (`src/lib/queries.ts`)
```groq
*[_type == "brand"] | order(varumarke asc) {
  "id": _id,
  "varumärke": varumarke,
  "kategori": kategori,
  "tillverkadISverige": tillverkadISverige,
  "merInfo": {
    "moderbolag": coalesce(koncern->moderbolag, ""),
    "ägare": coalesce(koncern->agare, ""),
    "börsnoterat": borsnoterat,
    "tillverkningsländer": tillverkningslander,
    "intro": intro,
    "hallbarhetsFokus": hallbarhetsFokus,
    "koncernstruktur": {
      "moderbolag": koncern->moderbolag,
      "moderbolagLand": koncern->moderbolagLand,
      "ägare": koncern->agare,
      "ägareLand": koncern->agareLand,
      "varumärken": select(
        defined(koncern) => *[_type == "brand" && references(^.koncern._ref)] | order(varumarke asc) {
          "namn": varumarke,
          "land": brandLand,
          "ärHuvudvarumärke": _id == ^._id,
          "status": tillverkadISverige
        }
      )
    }
  }
}
```

### Field Name Mapping (Sanity → TypeScript)
| Sanity field (ASCII) | TypeScript interface (Swedish) |
|---|---|
| `varumarke` | `varumärke` |
| `tillverkningslander` | `tillverkningsländer` |
| `borsnoterat` | `börsnoterat` |
| `agare` | `ägare` |
| `agareLand` | `ägareLand` |
| `brandLand` | `land` (in BrandInHierarchy) |

### GROQ Sibling Pattern
```groq
"varumärken": *[_type == "brand" && references(^.koncern._ref)] | order(varumarke asc) {
  "namn": varumarke,
  "land": brandLand,
  "ärHuvudvarumärke": _id == ^._id,   // ^ = outer brand document
  "status": tillverkadISverige
}
```
Verified: Kosta Boda ↔ Orrefors correctly list each other as siblings.

### Studio Schema
Located in `studio/schemaTypes/`:

**brand.ts fields** (document type `brand`):
- `varumarke` (string, required) — brand name
- `kategori` (string, required) — product category
- `tillverkadISverige` (string, radio: Ja/Nej/Delvis, required)
- `tillverkningslander` (array of string) — manufacturing countries
- `borsnoterat` (string, radio: Ja/Nej, required)
- `brandLand` (string, required, default `"SE"`) — ISO country code for this brand
- `intro` (text) — optional brand description
- `hallbarhetsFokus` (string) — optional sustainability focus
- `koncern` (reference → `koncern`) — optional corporate group reference

**koncern.ts fields** (document type `koncern`):
- `moderbolag` (string, required) — parent company name
- `moderbolagLand` (string, required, max 2) — ISO country code
- `agare` (string, required) — ultimate owner name
- `agareLand` (string, required, max 2) — ISO country code

## Data Structures

### TypeScript Types (`src/types/brand.ts`)
```typescript
export interface BrandInHierarchy {
  namn: string;                  // Brand name
  land: string;                  // ISO 3166-1 alpha-2 code (e.g., "SE")
  ärHuvudvarumärke: boolean;    // true for the current brand
  status?: 'Ja' | 'Nej' | 'Delvis';
}

export interface KoncernNode {
  moderbolag?: string;           // e.g., "Fenix Outdoor International AG"
  moderbolagLand?: string;       // ISO country code (e.g., "CH")
  ägare?: string;                // e.g., "Fenix Outdoor AB"
  ägareLand?: string;            // ISO country code (e.g., "SE")
  varumärken?: BrandInHierarchy[];
}

export interface Brand {
  id: string;                    // Sanity _id (e.g., "brand-1")
  varumärke: string;
  kategori: string;
  tillverkadISverige: 'Ja' | 'Nej' | 'Delvis';
  merInfo: {
    moderbolag: string;
    ägare: string;
    börsnoterat: string;
    tillverkningsländer: string[];
    koncernstruktur: KoncernNode | string;  // Union for legacy migration
    intro?: string;
    hallbarhetsFokus?: string;
  };
}

export type SortColumn = 'varumärke' | 'kategori' | 'tillverkadISverige' | null;
export type SortDirection = 'asc' | 'desc';
```

**Note:** `id` is `string` (Sanity `_id`), not `number`. This affects `Set<string>` for expandedRows in DataTable.

### Current Dataset
- **Total Brands**: 94+ (fetched live from Sanity)
- **Koncern documents**: 86+
- **Categories**: Smycken, Handskar, Friluftskläder, Underkläder, Fordon, Mat och Dryck, Möbler, Kläder, Elektronik, etc.

## Features

### Implemented
- ✅ **Sanity CMS Integration**: All brand data served from Sanity (project `kmjh3e1f`)
- ✅ **Routing System**: React Router v7 with BrowserRouter
- ✅ **Footer**: Site-wide footer with navigation, LinkedIn, email copy
- ✅ **Country Flags**: `flag-icons` library renders ISO country flag sprites
- ✅ **Corporate Tree**: `KoncernstrukturTree` shows Ägare → Moderbolag → Varumärken hierarchy
- ✅ **Dot Status Badge**: Compact dot variant for sibling brands in tree (no text label)
- ✅ **Multi-tag Search**: AND logic between tags, hybrid live + tag filtering
- ✅ **Sortable Columns**: Click headers to sort (Varumärke, Kategori, Status)
- ✅ **Swedish Locale Sorting**: `localeCompare('sv-SE')` for proper Å, Ä, Ö
- ✅ **Sort Indicators**: lucide-react icons (ArrowUpDown, ArrowUpAZ, ArrowDownZA)
- ✅ **Dynamic Brand Count**: Hero displays actual count fetched from Sanity
- ✅ **Loading/Error States**: Home page shows Swedish-language loading and error messages
- ✅ **About Page**: Complete with project info and feedback mechanism
- ✅ **Search Chip System**: Visual tags with individual remove buttons
- ✅ **Keyboard Shortcuts**: ESC clears search, Enter creates tag
- ✅ **Expandable Rows**: Click to reveal detailed brand info including KoncernstrukturTree
- ✅ **Status Badges**: Color-coded manufacturing status (Ja/Nej/Delvis)
- ✅ **Sticky Search**: Search bar sticks to top when scrolling
- ✅ **Responsive Design**: M3 breakpoints for mobile, tablet, desktop
- ✅ **Swedish Localization**: All UI text in Swedish
- ✅ **Cloudflare Pages Deployment**: Frontend deployed via Cloudflare Pages
- ✅ **Studio Deployment**: Sanity Studio deployed to `*.sanity.studio`

### Search Behavior

The search system supports advanced multi-tag filtering with real-time results:

**Multi-tag System:**
- Create multiple search tags by typing and pressing Enter
- Each tag filters independently; **AND Logic** means brands must match ALL tags
- **Hybrid Search**: Active tags + current input filter together in real-time
- Remove individual tags via × button or clear all with ESC

**Search Coverage:**
- Filters by brand name, category, and manufacturing status
- Case-insensitive matching

### Sorting Features

**Sortable Columns:** Varumärke, Kategori, Tillverkad i Sverige

**Status Sorting Order:** Ja (1) → Delvis (2) → Nej (3)

**Swedish Locale Support:**
```typescript
const compareSwedish = (a: string, b: string): number => {
  return a.localeCompare(b, 'sv-SE', { sensitivity: 'base' });
};
```

## Styling & Design System

### Color Palette
```css
/* Backgrounds */
--page-bg: #ededed        /* Light gray page background */
--row-hover: #f5f5f5      /* Table row hover/expanded state */

/* Text Colors */
--primary-text: #1a3050   /* Dark blue headers */
--secondary-text: #525252 /* Gray body text */
--tertiary-text: #6e6e6e  /* Light gray text */

/* Status Badge Colors */
--ja-bg: #99dec9          /* Green background (Yes) */
--ja-text: #004530        /* Dark green text */
--nej-bg: #edb0ab         /* Red background (No) */
--nej-text: #7e211a       /* Dark red text */
--delvis-bg: #99D5ED      /* Blue background (Partial) */
--delvis-text: #005D7F    /* Dark blue text */

/* Borders */
--border-light: #c6c6c6   /* Light borders */
--border-medium: #888888  /* Medium borders */
```

### Typography
- **Hero Title**: 80px, weight 600, #1a3050
- **Hero Description**: 24px, weight 300, max-width 534px
- **Table Headers**: 18px, weight 600, #1a3050
- **Table Cells**: 16px, weight 400, #525252
- **Search Input**: 32px, weight 400, #2c2c2c

### CSS Patterns for New Components

**Flag component:**
```css
.flag-icon { display: inline-block; vertical-align: middle; }
.flag-small { width: 16px; height: 12px; }
.flag-medium { width: 24px; height: 18px; }
```

**StatusBadge dot variant:**
```css
.status-badge.dot { width: 10px; height: 10px; border-radius: 50%; padding: 0; }
.status-badge.dot.ja  { background: var(--ja-bg); }
/* etc. */
```

**KoncernstrukturTree:**
```css
.koncernstruktur-tree { ... }
.tree-hierarchy { display: flex; flex-direction: column; gap: 8px; }
.tree-children { margin-left: 24px; border-left: 2px solid #ccc; padding-left: 12px; }
.tree-node { border: 1px solid var(--border-light); border-radius: 6px; padding: 8px 12px; }
.brand-list { display: flex; flex-wrap: wrap; gap: 6px; }
.brand-item { display: flex; align-items: center; gap: 4px; }
.brand-item.main-brand { font-weight: 600; }
```

**Footer:**
```css
.footer { background: #fff; border-top: 1px solid var(--border-light); padding: 32px 0; }
.footer-content { display: flex; justify-content: space-between; align-items: flex-start; }
.footer-nav { display: flex; gap: 24px; }
.footer-link { color: var(--secondary-text); text-decoration: none; cursor: pointer; }
.footer-copied { color: #004530; font-size: 14px; }
```

### Responsive Breakpoints (M3 Layout)
```css
/* < 600px: mobile */
/* 600-839px: small tablet */
/* 840-1199px: tablet — 24px margins */
@media (min-width: 840px) { max-width: calc(100vw - 48px) }

/* 1200-1599px: desktop — 200px margins */
@media (min-width: 1200px) { max-width: calc(100vw - 400px) }

/* 1600px+: wide — fixed content width */
@media (min-width: 1600px) { max-width: 1199px }
```

## Development

### Commands
```bash
npm run dev            # Start Vite dev server (http://localhost:5173)
npm run build          # TypeScript compile + Vite build
npm run lint           # Run ESLint
npm run preview        # Preview production build
npm run studio         # Start Sanity Studio (http://localhost:3333)
npm run studio:deploy  # Deploy Sanity Studio to *.sanity.studio
```

### Environment Setup
Create `.env.local` in project root:
```
VITE_SANITY_PROJECT_ID=kmjh3e1f
VITE_SANITY_DATASET=production
```

### Key Files for Common Tasks

**Adding/editing a brand:**
- Use Sanity Studio at `http://localhost:3333` (run `npm run studio`)
- Or edit via sanity.io/manage → project `kmjh3e1f` → dataset `production`
- Do NOT edit `brands.json` (legacy, unused)

**Modifying GROQ query:**
- File: `src/lib/queries.ts`
- Remember ASCII field names in Sanity schema; map to Swedish in projections

**Editing Sanity schema:**
- Files: `studio/schemaTypes/brand.ts`, `studio/schemaTypes/koncern.ts`
- After editing, redeploy: `npm run studio:deploy`
- Local schema files are source of truth

**Adding/editing pages:**
- New pages: Create in `src/pages/`
- Update routes: Edit `src/App.tsx` Routes section

**Modifying search/filter logic:**
- File: `src/pages/Home.tsx`
- `filteredBrands` useMemo depends on `allBrands` (Sanity state), not static JSON

**Styling changes:**
- File: `src/index.css`
- About page styles: lines ~653-875 (approximate — verify on read)

**Type definitions:**
- File: `src/types/brand.ts`
- Update when adding new Sanity fields or GROQ projections

### Deployment Checklist
1. Add `VITE_SANITY_PROJECT_ID` + `VITE_SANITY_DATASET` to Cloudflare Pages env vars
2. `npm run studio:deploy` to deploy Studio to `*.sanity.studio`
3. Add production domain to CORS in sanity.io/manage → `kmjh3e1f` → API

### Code Patterns

**Data fetching pattern (Home.tsx):**
```typescript
useEffect(() => {
  sanityClient
    .fetch<Brand[]>(ALL_BRANDS_QUERY)
    .then((data) => { setAllBrands(data); setLoading(false); })
    .catch((err) => { setError('Kunde inte ladda varumärken.'); setLoading(false); });
}, []);
```

**State Management:**
- Local React state with `useState`
- Memoized computations with `useMemo`
- No external state management

**TypeScript:**
- Strict mode enabled
- Explicit interfaces for all props and data
- No `any` types allowed

## Future Enhancements

### Planned/Suggested
- [ ] **Brand Detail Pages**: Individual pages per brand with full history
- [ ] **Advanced Filters**: Multi-select filters (status, category, owner type)
- [ ] **Report Form**: Direct feedback form for corrections
- [ ] **Export Functionality**: Download filtered results as CSV/JSON
- [ ] **Pagination**: Handle large datasets efficiently
- [ ] **Data Visualization**: Charts showing manufacturing distribution
- [ ] **Source Citations**: Link to sources for each brand's information
- [ ] **Brand Comparison**: Side-by-side comparison of multiple brands

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

## Accessibility

- ARIA labels on buttons ("Expandera rad", "Clear search")
- Semantic HTML structure (header, main, footer)
- Keyboard support (ESC key, tab navigation)
- Focus states with visible outlines
- Proper heading hierarchy
- `role="img"` + `aria-label` on Flag component

## Performance

- `useMemo` for search/filter/sort optimization (runs on `allBrands` state)
- Sanity CDN (`useCdn: true`) for fast global reads
- CSS transitions (0.15s ease) for smooth interactions
- Vite's automatic code splitting
- Font preloading with woff2 format

---

**Last Updated**: February 2026 — Reflects Sanity CMS integration, BrowserRouter migration, new components (Footer, Flag, KoncernstrukturTree), 94+ brands, and Cloudflare Pages deployment
**Maintained By**: Maximilian with Claude Code assistance
