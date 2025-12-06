# Svensk Databas - Manufacturing Transparency Database

Maximilian is developing a manufacturing transparency database website that tracks Swedish brands and reveals where their products are actually manufactured. The project aims to create transparency around "Made in Sweden" claims by categorizing brands as "Yes," "No," or "Partially" manufactured in Sweden.

## Tech Stack

**Frontend Framework:**
- React 18.3.1 with TypeScript 5.6.2
- Vite 6.0.3 (build tool and dev server)
- Strict TypeScript mode enabled

**Styling:**
- Vanilla CSS (no CSS-in-JS)
- M3 Layout System for responsive design
- Custom Sweden Sans font family (4 weights: 300/400/600/700)

**Development:**
- npm for package management
- ESLint for code quality
- Hot Module Replacement (HMR) via Vite

## Project Structure

```
svenskdatabas/
├── src/
│   ├── components/          # React components
│   │   ├── Header.tsx       # Top navigation bar
│   │   ├── Hero.tsx         # Hero section with title/description
│   │   ├── Search.tsx       # Search input with chip display
│   │   ├── DataTable.tsx    # Main table with expandable rows
│   │   ├── StatusBadge.tsx  # Status indicator (Ja/Nej/Delvis)
│   │   └── Container.tsx    # Layout container (unused)
│   ├── data/
│   │   └── brands.json      # Database of 25 Swedish brands
│   ├── types/
│   │   └── brand.ts         # TypeScript Brand interface
│   ├── App.tsx              # Root component with search logic
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles
├── fonts/                   # Sweden Sans font files
├── index.html               # HTML entry (Swedish lang)
└── CLAUDE.md               # This file
```

## Component Architecture

**Component Hierarchy:**
```
<App> (manages searchQuery state)
├── <Header>
├── <main>
│   └── <div className="container">
│       └── <div className="content">
│           ├── <Hero>
│           ├── <div className="search-wrapper">
│           │   └── <Search>  (controlled input)
│           └── <DataTable>
│               └── For each brand:
│                   ├── <StatusBadge>
│                   └── Expanded details section
```

**Component Responsibilities:**

- **App.tsx**: Root component, manages search state, filters brands
- **Header.tsx**: Fixed navigation with title and "Om" link
- **Hero.tsx**: Landing section with large title and description
- **Search.tsx**: Search input with icon, keyboard support (ESC to clear), removable chip
- **DataTable.tsx**: Expandable table showing brand data and detailed info
- **StatusBadge.tsx**: Color-coded status indicator (Ja/Nej/Delvis)
- **Container.tsx**: Responsive layout wrapper (currently unused in App)

## Features

### Implemented
- ✅ **Search & Filter**: Real-time search across brand names and categories
- ✅ **Expandable Rows**: Click to reveal detailed brand information
- ✅ **Status Badges**: Color-coded manufacturing status (Ja/Nej/Delvis)
- ✅ **Search Chip**: Shows active search with removable × button
- ✅ **Keyboard Shortcuts**: ESC key clears search
- ✅ **Sticky Search**: Search bar sticks to top when scrolling
- ✅ **Responsive Design**: M3 breakpoints for mobile, tablet, desktop
- ✅ **Hover States**: Interactive feedback on table rows
- ✅ **Swedish Localization**: All UI text in Swedish

### Search Behavior
- Filters by brand name (varumärke) and category (kategori)
- Case-insensitive matching
- Uses `useMemo` for performance optimization
- Search chip appears below search input when typing

### Table Features
- **Columns**: Varumärke, Kategori, Tillverkad i Sverige, Mer info
- **Expandable Details**: Moderbolag, Ägare, Börsnoterat, Tillverkningsländer, Koncernstruktur
- **Row States**: Default, hover (#f5f5f5), expanded (#f5f5f5)
- **Icons**: Chevron rotates on expansion

## Data Structure

### Brand Interface
```typescript
interface Brand {
  id: number;
  varumärke: string;              // Brand name
  kategori: string;                // Product category
  tillverkadISverige: 'Ja' | 'Nej' | 'Delvis';  // Manufacturing status
  merInfo: {
    moderbolag: string;            // Parent company
    ägare: string;                 // Owner type
    börsnoterat: string;           // Stock listing (Ja/Nej)
    tillverkningsländer: string[]; // Manufacturing countries
    koncernstruktur: string;       // Corporate structure
  };
}
```

### Current Dataset
- **Total Brands**: 25
- **Categories**: Smycken, Handskar, Friluftskläder, Underkläder, Fordon, Mat och Dryck, Möbler, Kläder, Elektronik, etc.
- **Examples**:
  - **Ja** (Swedish-made): All Blues, Woolpower, Absolut Vodka
  - **Delvis** (Partial): Hestra, Volvo Cars, Scania, Hasselblad
  - **Nej** (Not Swedish-made): Fjällräven, IKEA, H&M, Nudie Jeans

## Styling & Design System

### Color Palette
```css
/* Backgrounds */
--page-bg: #ededed        /* Light gray page background */
--row-hover: #f5f5f5      /* Table row hover/expanded state */
--expanded-bg: #f5f5f5    /* Expanded details section */

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
- **Search Placeholder**: 32px, weight 400, #959da8

### Responsive Breakpoints (M3 Layout)
```css
/* Default: 24px margins */
max-width: calc(100vw - 48px)

/* 840-1199px: 24px margins */
@media (min-width: 840px) { max-width: calc(100vw - 48px) }

/* 1200-1599px: 200px margins */
@media (min-width: 1200px) { max-width: calc(100vw - 400px) }

/* 1600px+: fixed content width */
@media (min-width: 1600px) { max-width: 1199px }
```

## Development

### Commands
```bash
npm run dev      # Start Vite dev server (http://localhost:5173)
npm run build    # TypeScript compile + Vite build
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

### Key Files for Common Tasks

**Adding a new brand:**
- Edit: `src/data/brands.json`
- Follow existing structure with all required fields

**Modifying search logic:**
- File: `src/App.tsx` (filteredBrands useMemo)
- Current: Searches varumärke and kategori fields

**Styling changes:**
- File: `src/index.css`
- Sections: Header, Hero, Search, Data Table, Status Badge, Expanded Details

**Component modifications:**
- Files: `src/components/*.tsx`
- All components use TypeScript with proper interfaces

**Type definitions:**
- File: `src/types/brand.ts`
- Update when adding new data fields

### Code Patterns

**State Management:**
- Local React state with `useState`
- Memoized computations with `useMemo`
- No external state management (Redux, Zustand, etc.)

**Styling:**
- CSS classes in index.css
- Component-specific classes (e.g., `.search`, `.data-table`)
- BEM-like naming for related elements (e.g., `.search-chip`, `.search-chip-text`)

**TypeScript:**
- Strict mode enabled
- Explicit interfaces for props and data
- No `any` types allowed

## Future Enhancements

### Planned/Suggested
- [ ] **Dynamic Brand Count**: Replace "[current number]" placeholder in Hero with actual count
- [ ] **Backend Integration**: Replace static JSON with API calls
- [ ] **Routing**: Add react-router for brand detail pages
- [ ] **Admin Interface**: CRUD operations for managing brands
- [ ] **Advanced Filtering**: Filter by status, category, owner type
- [ ] **Export Functionality**: Download filtered results as CSV/JSON
- [ ] **Pagination**: Handle large datasets efficiently
- [ ] **Data Visualization**: Charts showing manufacturing distribution
- [ ] **About Page**: Make "Om" link functional with project info
- [ ] **Search History**: Recently searched brands
- [ ] **Favorites**: Save brands for quick access

### Known TODOs
- Container component imported but not used in App.tsx
- "Om" navigation link doesn't route anywhere
- Hero description has hardcoded placeholder text

## Swedish Terms Reference

- **Varumärke**: Brand name
- **Kategori**: Category
- **Tillverkad i Sverige**: Manufactured in Sweden
- **Ja**: Yes
- **Nej**: No
- **Delvis**: Partially
- **Moderbolag**: Parent company
- **Ägare**: Owner
- **Börsnoterat**: Publicly traded / Stock listed
- **Tillverkningsländer**: Manufacturing countries
- **Koncernstruktur**: Corporate structure
- **Mer info**: More information
- **Sök i registret**: Search the registry
- **Visa mer info**: Show more information

## Accessibility

- ARIA labels on buttons ("Expandera rad", "Clear search")
- Semantic HTML structure (header, main, section)
- Keyboard support (ESC key, tab navigation)
- Focus states with visible outlines
- Proper heading hierarchy

## Performance

- `useMemo` for search filtering optimization
- CSS transitions (0.15s ease) for smooth interactions
- Vite's automatic code splitting
- Font preloading with woff2 format
- No unnecessary re-renders (controlled components)

---

**Last Updated**: Based on codebase analysis as of the current session
**Maintained By**: Maximilian with Claude Code assistance
