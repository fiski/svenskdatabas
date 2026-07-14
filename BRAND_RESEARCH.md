# Brand Research Guide

This guide documents the methodology for researching and adding brands to Svensk Databas. It is written as instructions for Claude-assisted sessions: follow the workflow in order, apply the decision rules exactly, and deliver data using the payload templates in §7.

## Automated workflows

This guide is the single source of truth for the methodology. Three Claude Code skills operationalize it (they reference this file — they do not duplicate the rules):

- **`/add-brand [name]`** — research and add one or more named brands.
- **`/discover-brands [category|all]`** — find well-known Swedish brands still missing from the dataset, then research the ones you pick.
- **`/refresh-brands [category|brand|all]`** — re-check existing brands for stale ownership, unsupported manufacturing claims, and missing fields.

All three run the research core via the `brand-researcher` subagent (`.claude/agents/brand-researcher.md`). **They deliberately stop at an unpublished draft** and require your approval before publishing — unlike the manual §7 flow below, which publishes directly. When following this guide by hand, §7's publish step still applies.

## Prerequisites

Before starting any brand research, verify that the Sanity MCP server is authenticated and responsive:

1. Call `mcp__Sanity__whoami` — if it returns a user identity, you're connected.
2. If it fails or prompts for auth, complete the authentication flow first (open the provided URL, paste the redirect back). Do not begin research until this succeeds.

Skipping this check risks completing full research and then being unable to write to Sanity.

## 1. Research Sources (priority order)

### Ownership & company structure
- **allabolag.se** — primary source for Swedish entities:
  - Search the legal company name (not the brand name — find the legal name on the brand website footer/imprint first)
  - The company page shows **"Koncernmoder"** / **"Moderbolag"** (direct parent) and the ownership chain
  - Note the **country of registration** for every entity in the chain
  - Org number and registered address confirm you have the right company
- **proff.se** — fallback if allabolag.se lacks data; similar ownership info
- **Bolagsverket (näringslivsregistret)** — authoritative registration data when sources conflict
- **Annual reports (årsredovisning)** — the "Koncernstruktur"/"Ägarförhållanden" section states the parent and ultimate owner explicitly; best source for complex groups
- **For foreign parents**: the parent company's own investor-relations pages or annual report; search "[Company] annual report ownership structure"

### Manufacturing
- **Company website** — "Om oss", "Vår produktion", "Tillverkning" pages
- **Product labels / packaging** — "Made in X" markings are the strongest evidence
- **Press releases / interviews** — factory openings, relocations, "tillverkad i Sverige" claims
- **Sustainability reports** — often list production countries explicitly

### Recency check (always do this last)
- **Google News** search "[brand] uppköpt OR förvärv OR säljs" — ownership changes happen often and stale data is worse than no data. If an acquisition closed recently, the new structure applies.

---

## 2. Field Research Cheat Sheet

| Sanity Field | Where to find it |
|---|---|
| `varumarke` | Official brand name (website, packaging) |
| `kategori` | Match to existing categories (see §5 below) |
| `tillverkadISverige` | Company website, product labels — see decision rules in §3 |
| `borsnoterat` | Check EVERY entity in the ownership chain for a stock listing |
| `brandLand` | ISO 2-letter code of brand's home country (default `SE`) |
| `tillverkningslander` | Company about page, press releases, product labels |
| `intro` | Write 1–2 sentences: founded year, product type, location |
| `hallbarhetsFokus` | Sustainability page on company website |
| `koncern.moderbolag` | allabolag.se: "Moderbolag" under company info |
| `koncern.moderbolagLand` | allabolag.se: country of moderbolag registration |
| `koncern.agare` | allabolag.se: ultimate owner (topp i ägarkedjan) |
| `koncern.agareLand` | allabolag.se: country of ultimate owner registration |

---

## 3. Decision Rules

### `tillverkadISverige` (Ja / Delvis / Nej)
- **Ja** — all or essentially all production happens in Sweden. Requires positive evidence (label, explicit website claim, factory location).
- **Delvis** — some product lines or production steps in Sweden, others abroad. Use when the company says e.g. "designed and partly manufactured in Sweden" or names both Swedish and foreign factories.
- **Nej** — production abroad, even if the brand is Swedish-owned and designed in Sweden. "Design in Sweden" alone is **Nej**.
- If no manufacturing information can be found at all: do not guess — flag the brand for manual review instead of adding it.

### `borsnoterat` (Ja / Nej)
- **Ja** if the company **or any entity above it in the ownership chain** is listed on a stock exchange (Nasdaq Stockholm, First North, NYSE, etc.), including foreign listings.
- Private equity ownership is **Nej** unless the PE firm itself is listed and consolidates the brand.

### `koncern` reference (when is one needed?)
- **Independent Swedish company** (owns itself, no parent above it): no koncern reference, `borsnoterat` usually `Nej`.
- **Part of a group**: koncern reference required. `moderbolag` = direct parent; `agare` = top of the chain (ultimate owner). If they are the same entity, use the same name in both fields.

### Country fields
- `brandLand`, `moderbolagLand`, `agareLand`: **ISO 3166-1 alpha-2** codes (`SE`, `CH`, `US`)
- `tillverkningslander`: **Swedish country names** (`["Sverige", "Portugal"]`) — note the difference!

---

## 4. Research Workflow (step-by-step)

1. Find the **legal company name** behind the brand (brand website footer, imprint, or terms page)
2. Search **allabolag.se** for that legal name; confirm via org number/address
3. Walk the **ownership chain upward**: note each entity's name and registration country until you reach the ultimate owner
4. Check **börsnoterat** for every entity in the chain (§3 rule)
5. Visit the company website for **manufacturing** info; corroborate with labels/press if the claim is vague
6. Run the **recency check** (§1) for ownership changes
7. Determine if a `koncern` document is needed (§3) and whether one already exists (§5)
8. Assemble the payload (§7), validate against the **checklist** (§8), then deliver

---

## 5. Checking for Existing Koncern

Before creating a new `koncern` document, query Sanity to avoid duplicates:

```groq
*[_type == "koncern" && moderbolag == "Company Name"]{ _id, moderbolag, agare }
```

Also search by owner in case the moderbolag name differs slightly:

```groq
*[_type == "koncern" && agare match "Company*"]{ _id, moderbolag, agare }
```

- **Reuse** existing koncern if it matches the same corporate group
- **Create new** only if the brand belongs to a genuinely different group

### Existing Categories (use these exact strings)

> Smycken, Handskar, Friluftskläder, Underkläder, Fordon, Mat och Dryck, Möbler, Kläder, Elektronik, Städprodukter

Only introduce a new category if nothing fits; keep it short, Swedish, plural where natural.

---

## 6. Converting a brandProposal to a brand

User-submitted proposals arrive as `brandProposal` documents (status `pending`) via the website's "Lägg till märke" form. To process one:

1. Query pending proposals:
   ```groq
   *[_type == "brandProposal" && status == "pending"] | order(submittedAt asc)
   ```
2. **Verify every claim independently** using §1–§4 — proposals are unverified user input. The `kommentarer` field may contain source links; check them.
3. Note: proposal `tillverkningslander` contains Swedish country names (correct for brand), but proposal data has no koncern reference — research and create/reuse the koncern yourself.
4. Create the brand + koncern per §7.
5. Patch the proposal: set `status` to `applied` (or `rejected` if the claims don't hold up). Do not delete proposals — they are the audit trail.

---

## 7. Sanity MCP Workflow

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
    kategori: "...",                          // exact string from §5
    tillverkadISverige: "Ja" | "Nej" | "Delvis",
    borsnoterat: "Ja" | "Nej",
    brandLand: "SE",                          // ISO code
    tillverkningslander: ["Sverige"],         // Swedish country NAMES
    intro: "...",                             // 1–2 sentences, plain text
    hallbarhetsFokus: "...",                  // omit if none found
    koncern: { _type: "reference", _ref: "<koncern-id>" }   // omit if independent
  }]
```

### Step 3 — Publish brand
```
mcp__Sanity__publish_documents
  resource: { projectId: "kmjh3e1f", dataset: "production" }
  ids: ["drafts.<brand-id from step 2>"]
```

### Step 4 — Verify
```
mcp__Sanity__query_documents
  resource: { projectId: "kmjh3e1f", dataset: "production" }
  query: *[_type == "brand" && varumarke == "BrandName"]{ _id, varumarke, tillverkadISverige, koncern->{moderbolag, agare} }
```
Confirm the koncern dereference resolves and sibling brands appear correctly on the site.

---

## 8. Pre-delivery Checklist

Before publishing, confirm:

- [ ] `varumarke` is the consumer-facing brand name, not the legal entity name
- [ ] `kategori` matches an existing string from §5 exactly
- [ ] `tillverkadISverige` is backed by positive evidence (not assumption)
- [ ] `borsnoterat` checked for the **whole** ownership chain
- [ ] Land fields are ISO codes; `tillverkningslander` are Swedish names
- [ ] Existing koncern search performed (§5) — no duplicate created
- [ ] Ownership data is current (recency check done)
- [ ] `intro` is 1–2 plain-text sentences
- [ ] Brand published (not left as draft) and verified via §7 Step 4

---

## Notes

- **ASCII field names** in Sanity schema (e.g. `varumarke`, `agare`) — the GROQ query in `src/lib/queries.ts` maps these to Swedish display names
- `brandLand` defaults to `"SE"` for Swedish brands; use ISO 3166-1 alpha-2 for others
- `tillverkningslander` is an array of country name strings (e.g. `["Sverige", "Portugal"]`)
- The `intro` field accepts plain text (not Portable Text)
