# Brand Research Guide

This guide documents the methodology for researching and adding brands to Svensk Databas.

## 1. Research Sources (priority order)

- **allabolag.se** — primary source for:
  - Ownership chain (ägare, moderbolag)
  - Country of registration for each entity
  - Börsnoterat status (check ultimate owner / group listing)
  - Org number, registered address
- **Company website** — manufacturing locations, product history, sustainability claims
- **Product labels / press releases** — "Made in Sweden" / "Tillverkad i Sverige" claims
- **Google News** — recent ownership changes, acquisitions

---

## 2. Field Research Cheat Sheet

| Sanity Field | Where to find it |
|---|---|
| `varumarke` | Official brand name (website, packaging) |
| `kategori` | Match to existing categories (see §5 below) |
| `tillverkadISverige` | Company website, product labels |
| `borsnoterat` | allabolag.se → look up ultimate owner, check if publicly listed |
| `brandLand` | ISO 2-letter code of brand's home country (default `SE`) |
| `tillverkningslander` | Company about page, press releases, product labels |
| `intro` | Write 1–2 sentences: founded year, product type, location |
| `hallbarhetsFokus` | Sustainability page on company website |
| `koncern.moderbolag` | allabolag.se: "Moderbolag" under company info |
| `koncern.moderbolagLand` | allabolag.se: country of moderbolag registration |
| `koncern.agare` | allabolag.se: ultimate owner (topp i ägarkedjan) |
| `koncern.agareLand` | allabolag.se: country of ultimate owner registration |

---

## 3. Research Workflow (step-by-step)

1. Search allabolag.se for the brand name or company name
2. Check "Ägarstruktur" / ownership chain — note moderbolag and ägare with their countries
3. Check if any entity in the chain is publicly listed (börsnoterat)
4. Visit company website for manufacturing info and intro text
5. Determine if a `koncern` document is needed:
   - Independent Swedish company → no koncern reference, `borsnoterat = Nej`
   - Part of a group → check if a koncern doc already exists in Sanity (see §4)

---

## 4. Checking for Existing Koncern

Before creating a new `koncern` document, query Sanity to avoid duplicates:

```groq
*[_type == "koncern" && moderbolag == "Company Name"]{ _id, moderbolag, agare }
```

- **Reuse** existing koncern if it matches the same corporate group
- **Create new** only if the brand belongs to a genuinely different group

---

## 5. Existing Categories (for reference)

Current values in use (use these exact strings for consistency):

> Smycken, Handskar, Friluftskläder, Underkläder, Fordon, Mat och Dryck, Möbler, Kläder, Elektronik, Städprodukter

---

## 6. Sanity MCP Workflow

### Step 1 — Create koncern (if needed)
```
mcp__Sanity__create_documents_from_json
  resource: { projectId: "kmjh3e1f", dataset: "production" }
  documents: [{
    _type: "koncern",
    moderbolag: "...",
    moderbolagLand: "SE",
    agare: "...",
    agareLand: "SE"
  }]
```
Then publish:
```
mcp__Sanity__publish_documents
  resource: { projectId: "kmjh3e1f", dataset: "production" }
  ids: ["drafts.<koncern-id>"]
```

### Step 2 — Create brand draft
```
mcp__Sanity__create_documents_from_json
  resource: { projectId: "kmjh3e1f", dataset: "production" }
  documents: [{
    _type: "brand",
    varumarke: "...",
    kategori: "...",
    tillverkadISverige: "Ja" | "Nej" | "Delvis",
    borsnoterat: "Ja" | "Nej",
    brandLand: "SE",
    tillverkningslander: ["SE"],
    intro: "...",
    hallbarhetsFokus: "...",
    koncern: { _type: "reference", _ref: "<koncern-id>" }
  }]
```

### Step 3 — Publish brand
```
mcp__Sanity__publish_documents
  resource: { projectId: "kmjh3e1f", dataset: "production" }
  ids: ["drafts.<brand-id from step 2>"]
```

### Step 4 — Verify (optional)
```
mcp__Sanity__query_documents
  resource: { projectId: "kmjh3e1f", dataset: "production" }
  query: *[_type == "brand" && varumarke == "BrandName"]{ _id, varumarke, tillverkadISverige }
```

---

## Notes

- **ASCII field names** in Sanity schema (e.g. `varumarke`, `agare`) — the GROQ query in `src/lib/queries.ts` maps these to Swedish display names
- `brandLand` defaults to `"SE"` for Swedish brands; use ISO 3166-1 alpha-2 for others
- `tillverkningslander` is an array of country name strings (e.g. `["Sverige", "Portugal"]`)
- The `intro` field accepts plain text (not Portable Text)
