# Svensk Databas - Manufacturing Transparency Database

Maximilian is developing a manufacturing transparency database website that tracks Swedish brands and reveals where their products are actually manufactured. The project aims to create transparency around "Made in Sweden" claims by categorizing brands as "Yes," "No," or "Partially" manufactured in Sweden.

## Tech Stack

**Frontend Framework:**
- React 18.3.1 with TypeScript 5.6.2
- Vite 6.0.3 (build tool and dev server)
- Strict TypeScript mode enabled

**Dependencies:**
- react-router-dom 7.10.1 (HashRouter for client-side routing)
- lucide-react 0.556.0 (Icon library for sort indicators)

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
│   │   ├── Header.tsx       # Navigation with react-router Links
│   │   ├── Hero.tsx         # Hero with dynamic brand count
│   │   ├── Search.tsx       # Multi-tag search with chip display
│   │   ├── DataTable.tsx    # Sortable table with lucide icons
│   │   ├── StatusBadge.tsx  # Status indicator (Ja/Nej/Delvis)
│   │   └── Container.tsx    # Layout container (unused)
│   ├── pages/               # Page components
│   │   ├── Home.tsx         # Main database page with search/filter/sort
│   │   └── About.tsx        # About page with project info
│   ├── data/
│   │   └── brands.json      # Database of 25 Swedish brands
│   ├── types/
│   │   └── brand.ts         # Brand interface + SortColumn/SortDirection
│   ├── App.tsx              # Router configuration (HashRouter)
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles including About page
├── fonts/                   # Sweden Sans font files
├── index.html               # HTML entry (Swedish lang)
└── CLAUDE.md               # This file
```

## Component Architecture

**Component Hierarchy:**
```
<App> (Router with HashRouter)
├── <Header> (uses react-router-dom Link)
├── <Routes>
    ├── <Route path="/" element={<Home>}>
    │   └── Home manages: searchTags, currentInput, sort state
    │       ├── <Hero brandCount={totalBrands}>
    │       ├── <div className="search-wrapper">
    │       │   └── <Search> (multi-tag system)
    │       └── <DataTable> (sortable columns)
    │           └── For each brand:
    │               ├── <StatusBadge>
    │               └── Expanded details section
    └── <Route path="/om" element={<About>}>
        └── About page with sections, email copy functionality
```

## Routing

The application uses React Router v7 with HashRouter for client-side navigation:

**Router Configuration (App.tsx:1-20):**
```typescript
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
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
      </div>
    </Router>
  );
}
```

**Routes:**
- `/` → Home page (main database with search/filter/sort)
- `/om` → About page (project information and feedback)

**Component Responsibilities:**

- **App.tsx**: Router configuration with HashRouter, no business logic
- **Home.tsx**: Main page with search/filter/sort state management
  - Manages: `currentInput`, `searchTags`, `sortColumn`, `sortDirection`
  - Swedish locale comparator for proper Å, Ä, Ö sorting
  - Status order mapping (Ja=1, Delvis=2, Nej=3)
  - Hybrid filtering: tags (AND logic) + live input
  - `useMemo` for performance optimization
- **About.tsx**: Full About page implementation
  - Copy-to-clipboard for email (maximilian.relam@gmail.com)
  - Timed notification for copy confirmation (2 seconds)
  - Keyboard-accessible email interaction
  - Comprehensive project documentation with sections
- **Header.tsx**: Navigation using react-router-dom Link components
- **Hero.tsx**: Receives `brandCount` prop, displays dynamic count
- **Search.tsx**: Multi-tag search system
  - Props: `currentInput`, `onInputChange`, `searchTags`, `onAddTag`, `onRemoveTag`, `onClearAll`
  - Enter key creates new tag
  - ESC clears all
  - Helper text for user guidance
  - Individual tag removal via × buttons
- **DataTable.tsx**: Sortable columns with lucide-react icons
  - Props: `brands`, `sortColumn`, `sortDirection`, `onSort`
  - Click headers to sort (first click = asc, second = desc)
  - Visual sort indicators (ArrowUpDown, ArrowUpAZ, ArrowDownZA)
  - Maintains expandable rows functionality
- **StatusBadge.tsx**: Color-coded status indicator (Ja/Nej/Delvis)
- **Container.tsx**: Responsive layout wrapper (currently unused)

## Features

### Implemented
- ✅ **Routing System**: React Router with HashRouter for client-side navigation
- ✅ **Multi-tag Search**: AND logic between tags, hybrid live + tag filtering
- ✅ **Sortable Columns**: Click headers to sort (Varumärke, Kategori, Status)
- ✅ **Swedish Locale Sorting**: Proper Å, Ä, Ö ordering using `localeCompare('sv-SE')`
- ✅ **Sort Indicators**: lucide-react icons (ArrowUpDown, ArrowUpAZ, ArrowDownZA)
- ✅ **Dynamic Brand Count**: Hero displays actual brand count from data
- ✅ **About Page**: Complete implementation with project info and feedback mechanism
- ✅ **Email Copy**: Click email to copy to clipboard with confirmation
- ✅ **Search Chip System**: Visual tags with individual remove buttons
- ✅ **Keyboard Shortcuts**: ESC clears search, Enter creates tag
- ✅ **Expandable Rows**: Click to reveal detailed brand information
- ✅ **Status Badges**: Color-coded manufacturing status (Ja/Nej/Delvis)
- ✅ **Sticky Search**: Search bar sticks to top when scrolling
- ✅ **Responsive Design**: M3 breakpoints for mobile, tablet, desktop
- ✅ **Hover States**: Interactive feedback on table rows
- ✅ **Swedish Localization**: All UI text in Swedish

### Search Behavior

The search system supports advanced multi-tag filtering with real-time results:

**Multi-tag System:**
- Create multiple search tags by typing and pressing Enter
- Each tag filters independently
- **AND Logic**: Brands must match ALL tags simultaneously
- **Hybrid Search**: Active tags + current input filter together in real-time
- Remove individual tags via × button or clear all with ESC

**Search Coverage:**
- Filters by brand name (varumärke)
- Filters by category (kategori)
- Filters by manufacturing status (tillverkadISverige)
- Case-insensitive matching across all fields

**User Interface:**
- Helper text: "Tryck Enter för att lägga till fler sökfilter"
- Visual tag chips displayed below search input
- Search maintains focus for continuous filtering
- Uses `useMemo` for performance optimization

**Example (Home.tsx:53-103):**
```typescript
// Filter brands based on search tags and current input (hybrid live search)
const filteredBrands = useMemo(() => {
  let results = brandsData.brands as Brand[];

  // Step 1: Filter by tags (AND logic between tags)
  if (searchTags.length > 0) {
    results = results.filter((brand) => {
      return searchTags.every((tag) => {
        const tagLower = tag.toLowerCase();
        const matchesName = brand.varumärke.toLowerCase().includes(tagLower);
        const matchesCategory = brand.kategori.toLowerCase().includes(tagLower);
        const matchesStatus = brand.tillverkadISverige.toLowerCase().includes(tagLower);
        return matchesName || matchesCategory || matchesStatus;
      });
    });
  }

  // Step 2: Filter by current input (live search)
  const trimmedInput = currentInput.trim();
  if (trimmedInput) {
    const inputLower = trimmedInput.toLowerCase();
    results = results.filter((brand) => {
      const matchesName = brand.varumärke.toLowerCase().includes(inputLower);
      const matchesCategory = brand.kategori.toLowerCase().includes(inputLower);
      const matchesStatus = brand.tillverkadISverige.toLowerCase().includes(inputLower);
      return matchesName || matchesCategory || matchesStatus;
    });
  }

  return results;
}, [searchTags, currentInput]);
```

### Sorting Features

Tables support column-based sorting with Swedish locale awareness:

**Sortable Columns:**
- Varumärke (Brand name)
- Kategori (Category)
- Tillverkad i Sverige (Manufacturing status)

**Interaction:**
- Click header once: Sort ascending
- Click header again: Sort descending
- Click different header: New sort (starts with ascending)

**Visual Indicators (lucide-react icons):**
- `ArrowUpDown`: Column not currently sorted
- `ArrowUpAZ`: Sorted ascending (A→Z, Ja→Nej)
- `ArrowDownZA`: Sorted descending (Z→A, Nej→Ja)

**Swedish Locale Support (Home.tsx:8-10):**
```typescript
// Swedish locale comparator for proper Å, Ä, Ö ordering
const compareSwedish = (a: string, b: string): number => {
  return a.localeCompare(b, 'sv-SE', { sensitivity: 'base' });
};
```

**Status Sorting Order:**
- Ja (1) → Delvis (2) → Nej (3)

**Keyboard Support:**
- Headers are keyboard-accessible with Tab navigation
- Headers have hover and focus states for accessibility

### Table Features
- **Columns**: Varumärke, Kategori, Tillverkad i Sverige, Mer info
- **Expandable Details**: Moderbolag, Ägare, Börsnoterat, Tillverkningsländer, Koncernstruktur
- **Row States**: Default, hover (#f5f5f5), expanded (#f5f5f5)
- **Icons**: Chevron rotates on expansion, sort indicators in headers

### About Page Features

Fully implemented About page accessible via `/om` route:

**Content Sections:**
- Project mission and transparency goals
- Status category explanations (Ja/Nej/Delvis) with styled badges
- Methodology for data collection
- Feedback mechanism with email link
- Future features roadmap
- Transparency & limitations disclosure
- Personal signature ("//Max")

**Copy-to-Clipboard Implementation (About.tsx:4-12):**
```typescript
const [copied, setCopied] = useState(false);

const handleEmailClick = () => {
  navigator.clipboard.writeText('maximilian.relam@gmail.com');
  setCopied(true);
  setTimeout(() => {
    setCopied(false);
  }, 2000);
};
```

**Interactive Email Link:**
- Click to copy email to clipboard
- Shows "E-postadress kopierad!" confirmation for 2 seconds
- Keyboard accessible (Enter and Space keys)
- Visual hover and active states

**Feedback Types Welcome:**
- Corrections of existing information
- Suggestions for new brands
- Updates about production or ownership changes
- Sources to verify information

**Responsive Design:**
- Mobile-first layout with stacked sections
- Tablet breakpoint adjusts spacing and typography
- Desktop layout with optimal reading width

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

// Sort types for table column sorting
type SortColumn = 'varumärke' | 'kategori' | 'tillverkadISverige' | null;
type SortDirection = 'asc' | 'desc';
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

### Component-Specific Styling

**Search Enhancements:**
- Multi-tag chip display with close buttons (× icon)
- Helper text styling below input ("Tryck Enter...")
- Sticky search wrapper positioning
- Mobile-responsive input scaling (font-size adjusts)
- Individual chip hover states with pointer cursor

**Table Sorting Styles:**
- Sortable header hover states (subtle background change)
- Sort icon positioning and styling (right-aligned in headers)
- Active column indication
- Focus states for keyboard accessibility
- Icon transitions on sort direction change

**About Page Styling (lines ~653-875 in index.css):**
- Hero section with large title (60px) and intro text
- Section headings (32px, weight 600)
- Paragraph spacing and line-height for readability
- Category explanation boxes with colored badges matching status colors
- Interactive email link:
  - Underline decoration
  - Hover: darker color + cursor pointer
  - Active: slightly scaled down (0.98)
- Copied message notification:
  - Green color (#004530)
  - 2-second display with fade
  - Positioned below email link
- List styling with custom bullets and spacing
- Signature styling ("//Max") with monospace feel
- Mobile responsive breakpoints (< 768px, 768-1199px, 1200px+)

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

**Adding/editing pages:**
- New pages: Create in `src/pages/`
- Update routes: Edit `src/App.tsx` Routes section
- Example: Add `<Route path="/new" element={<NewPage />} />`

**Adding a new brand:**
- Edit: `src/data/brands.json`
- Follow existing structure with all required fields

**Modifying search/filter logic:**
- File: `src/pages/Home.tsx`
- Search filtering: `filteredBrands` useMemo (lines 53-103)
- Sorting logic: Uses `compareSwedish` + `statusOrder`
- Current coverage: varumärke, kategori, tillverkadISverige

**Modifying routing:**
- File: `src/App.tsx`
- Add new Route components inside `<Routes>`
- Update Header navigation links

**Styling changes:**
- File: `src/index.css`
- Sections: Header, Hero, Search, Data Table, Status Badge, Expanded Details, About Page
- About page styles: lines ~653-875

**Component modifications:**
- Page components: `src/pages/*.tsx` (Home, About)
- Reusable components: `src/components/*.tsx`
- All components use TypeScript with proper interfaces

**Type definitions:**
- File: `src/types/brand.ts`
- Update when adding new data fields or sort types
- Currently defines: Brand, SortColumn, SortDirection

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
- [ ] **Report Form**: Direct feedback form on About page for corrections
- [ ] **Suggest Brand Form**: Allow users to suggest new brands via UI
- [ ] **Backend Integration**: Replace static JSON with API calls
- [ ] **Brand Detail Pages**: Individual pages per brand with full history
- [ ] **Admin Interface**: CRUD operations for managing brands
- [ ] **Advanced Filters**: Multi-select filters (status, category, owner type)
- [ ] **Export Functionality**: Download filtered results as CSV/JSON
- [ ] **Pagination**: Handle large datasets efficiently (100+ brands)
- [ ] **Data Visualization**: Charts showing manufacturing distribution
- [ ] **Search History**: Recently searched brands with localStorage
- [ ] **Favorites**: Save brands for quick access
- [ ] **Source Citations**: Link to sources for each brand's information
- [ ] **Brand Comparison**: Side-by-side comparison of multiple brands

### Completed Features
- ✅ **Dynamic Brand Count** (Hero displays actual count from brandsData)
- ✅ **Routing System** (React Router with HashRouter implemented)
- ✅ **About Page** (Fully functional with email copy feature)
- ✅ **Multi-tag Search** (Advanced filtering with AND logic)
- ✅ **Sortable Columns** (Swedish locale-aware sorting)

### Known Issues
- ❌ **Container component unused**: Still imported in components but not used in App
  - Location: `src/components/Container.tsx`
  - Consider removing if not needed for future features

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

**Last Updated**: December 2024 - Reflects routing implementation, multi-tag search, sortable tables, and About page
**Maintained By**: Maximilian with Claude Code assistance
