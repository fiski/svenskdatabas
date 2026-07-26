# Brand Research Guide

This guide documents the methodology for researching and adding brands to Svensk Databas. It is written as instructions for Claude-assisted sessions: follow the workflow in order, apply the decision rules exactly, and deliver data using the payload templates in §7.

## Automated workflows

This guide is the single source of truth for the methodology. Three Claude Code skills operationalize it (they reference this file — they do not duplicate the rules):

- **`/add-brand [name]`** — research and add one or more named brands.
- **`/discover-brands [category|all]`** — find well-known Swedish brands still missing from the dataset, then research the ones you pick.
- **`/refresh-brands [category|brand|all]`** — re-check existing brands for stale ownership, unsupported manufacturing claims, and missing fields.

All three run the research core via the `brand-researcher` subagent (`.claude/agents/brand-researcher.md`). **They deliberately stop at an unpublished draft** and require your approval before publishing — unlike the manual §7 flow below, which publishes directly. When following this guide by hand, §7's publish step still applies.

**Resuming the database-wide source-citation sweep?** Go straight to **§9**. It records where the sweep stopped, the conventions in force, and the pass criteria — it is written for cold sessions picking the work back up after a pause.

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

### Source access reality (what actually works)

The priority order above is by *authority*. This is by *reachability* — several top-priority sources cannot be fetched by an agent, so plan around it rather than rediscovering it every session.

**Blocked to automated fetching** (403 / empty body): `allabolag.se`, `proff.se` (301-redirects to allabolag), `bolagsfakta.se`, `merinfo.se`, `ratsit.se`, `cision.com` (sometimes). Their content still surfaces in **search-result snippets** — usable, but say so.

**Reachable substitutes that have worked:**
| Need | Source |
|---|---|
| German entities & registry chains | `northdata.com` (also covers Swedish orgs; shows Handelsregister shareholders) |
| Norwegian entities | `data.brreg.no/enhetsregisteret/api/enheter/<orgnr>` and `/roller` — open JSON API, no blocking |
| M&A confirmation | The **advising law firms'** own news posts — they publish deal announcements and are fetchable |
| Listed-company ownership | The company's own IR pages (`corporate.<brand>.com/data-shareholders`) — for a listed issuer this beats allabolag anyway |
| Supplier/factory lists | The brand's sustainability page or a linked supplier-list PDF |
| Country of origin for a device | The brand's own **product manual** (`/manuals/<product>`) — regulatory text names the actual factory even when marketing pages say nothing. FOREO's manual gives "VIS (Shanghai) Technology Co., Ltd." where foreo.com only says "born in Sweden" |
| Ownership chain a wiki only asserts | The parent group's own **history/timeline page** — `fh-group.dk/en/about-us/history/` states the Canica subsidiary relationship outright |

**PDFs:** `WebFetch` returns them as raw binary and there is no local PDF renderer (no poppler). Image-based annual reports are effectively unreadable. Workaround that worked: the `r.jina.ai` text-extraction proxy on the same URL — run it twice and require identical output before trusting extracted tables.

**Always label snippet-only claims.** A researcher must distinguish "I retrieved this page" from "I saw this in a search result". Ownership chains resting on snippets are publishable when corroborated by an independent route, but the caveat must reach the report.

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
| `kallor` | The source URL you used for each key claim (ownership, börsnoterat, manufacturing) — record as `{url, label}`, label = the claim |
| `senastVerifierad` | Today's date (`YYYY-MM-DD`) — the day you verified the facts |
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

### Before EDITING a koncern, check how many brands share it

A koncern document may be referenced by several brands. Patching one to fix a single brand silently rewrites the others:

```groq
*[_type == "koncern" && _id == "<id>"]{
  _id, moderbolag, agare,
  "antalVarumärken": count(*[_type == "brand" && references(^._id)]),
  "varumärken": *[_type == "brand" && references(^._id)].varumarke
}
```

- **1 brand** → safe to patch in place.
- **Several brands** → the change must be true for all of them, or the brand needs its own koncern instead.
- **A shared group koncern already exists** (e.g. `koncern-nod-group` for the NOD/Altor brands) → **repoint the brand's reference to it** rather than editing its private single-brand koncern. This is what makes the sibling list on the site correct. The abandoned single-brand koncern is then orphaned — harmless, leave it.

### Known defect classes in existing koncern data

Seen repeatedly; check for these whenever you touch a koncern:
- **Self-referential `moderbolag`** — the parent is the brand's own AB (`Blåkläder AB` for Blåkläder). Conveys nothing; find the real parent.
- **Fabricated entity names** — a plausible-looking `"<Brand> AB"` that is not registered anywhere (`Berg & Berg AB`). Always confirm the legal name exists.
- **Placeholder `agare`** — `"Privatägd"`, `"Familjeägt"`. Acceptable only after a genuine attempt to name the owner. Because the field is this dirty, group by `moderbolag` (not `agare`) for any ownership chart or analysis.
- **Prose stuffed into `agare`** — shareholder lists with percentages that go stale fast. Keep it short: `Börsnoterat (<largest owner>)`.
- **Country code contradicting the entity** — `moderbolagLand: "US"` on something named "SNA Europe". If the name and the code disagree, one of them is wrong.

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
2. **Verify every claim independently** using §1–§4 — proposals are unverified user input. The `kallor` array (structured source links) and the free-text `kommentarer` field may contain sources; check them, and carry the ones that hold up into the brand's `kallor`.
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
    kallor: [                                 // the sources you used, one per key claim
      { url: "https://...", label: "Ägarstruktur" },
      { url: "https://...", label: "Tillverkning" }
    ],
    senastVerifierad: "YYYY-MM-DD",           // today's date
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

## 9. Re-verification sweeps (source citations for the whole database)

An ongoing project: give **every** brand source citations (`kallor`) and a verification date (`senastVerifierad`), correcting facts along the way. Worked **alphabetically by brand name, one letter-group at a time**, because the database is large and the work spans many sessions separated by usage-limit pauses.

This section exists so a cold session can resume without re-deriving anything.

### Where did we stop?

**Derive it from the data, not from memory.** `senastVerifierad` is the progress marker — anything unset has never been verified:

```groq
*[_type == "brand" && !defined(senastVerifierad)] | order(varumarke asc) {
  varumarke, _id
}
```

The first letter in that result is the next letter-group.

> Snapshot as of **2026-07-25**: **45 of 132** brands verified — `&` and `A` (2026-07-24), `B`, `C`, `D`+`E`, `F`+`G` (2026-07-25). Next group is **`H`** (H&M, H&M Home, Haglöfs, Hasselblad, Hernö Gin, Hestra, Hultafors, Husqvarna, Hästens, Häxan, Höganäs Keramik). This line is a convenience only; the query above is authoritative and self-correcting.

> **Small letter-groups can be batched.** `D` held a single brand, so it was run together with `E` as one 10-brand batch (two research waves of 5); `F`+`G` ran the same way as 11 brands. Dispatching ~5 researchers at a time keeps web-search quality up; 10 at once degrades sourcing.

> **Batch the write, too.** `patch_documents` silently truncates an oversized payload and fails with a JSON parse error — stage **at most 3 brands per call** when each carries 3 `kallor` plus an `intro` rewrite.

To pull one group's full current state:

```groq
*[_type == "brand" && string::startsWith(lower(varumarke), "c")] | order(varumarke asc) {
  _id, varumarke, kategori, tillverkadISverige, borsnoterat, brandLand,
  tillverkningslander, intro, hallbarhetsFokus, senastVerifierad,
  "antalKallor": count(kallor),
  koncern->{_id, moderbolag, moderbolagLand, agare, agareLand}
}
```

> **GROQ gotcha:** use `string::startsWith(lower(varumarke), "c")`. Do **not** use `varumarke match "C*"` — the tokenizer over-matches and pulls in unrelated brands.

Narrative progress (what changed per brand, watch items carried forward) is kept in the session memory note `source-verification-progress`. The GROQ above is authoritative if the two ever disagree.

### Sweep workflow

1. **Preflight** — `mcp__Sanity__whoami`. Load `select:mcp__Sanity__query_documents,mcp__Sanity__patch_documents,mcp__Sanity__publish_documents,mcp__Sanity__create_documents,WebSearch,WebFetch`. Do not research first and discover the write path is closed.
2. **Load the letter-group** with the query above. A group is typically 5–15 brands — one batch.
3. **Dispatch one `brand-researcher` per brand, research-only.** They have no Sanity write tools. Give each agent: the brand's current field values verbatim, its known/suspected defects, and the output contract below. Stagger in waves of ~5 so parallel web search doesn't degrade into weak sourcing.
4. **Batch report** — one table of flagged brands only: `| Brand | Field | Current | Proposed | Source |`, plus checked-vs-clean counts. **Change nothing yet.** Surface medium-confidence items as explicit questions rather than quietly applying or quietly dropping them.
5. **Stage drafts on approval** — patch `drafts.<id>`, never the published doc. Koncern docs and brand docs can be staged in the same pass.
6. **Publish koncern docs first, then brands.** Verify with the query in "Pass criteria" below.
7. **Update the progress note** — per-brand one-liners, next letter, any new gotchas and watch items.

### Researcher output contract

Require exactly this shape back, or the batch report can't be assembled consistently:

- **Verdict per field** — for *every* field, `CONFIRMED (no change)` or `CHANGE: <current> → <proposed>` with a one-line reason. An explicit "no change" is as valuable as a fix; without it you can't tell "checked and fine" from "didn't look".
- **Exactly 3 sources**, one each for ownership / manufacturing / börsnotering.
- **Confidence & caveats** — what was retrieved first-hand vs. seen in a snippet, and what could not be confirmed at all.
- **Recency check result** — stated even when nothing was found.

### Field conventions for a sweep

- **`kallor`** — exactly **3** items, `_key` `k1`/`k2`/`k3`, stored as `{_type: "object", _key, url, label}`. One covers ownership, one manufacturing, one börsnotering.
- **Label format** — `"Claim – detail"`, e.g. `"Ägarstruktur – Traction äger 100% via Ankarsrum Industries"`. En-dash. The label states *what the source proves*, not what the page is called.
- **URLs must be human-browsable** — they render as links on the public site. Prefer a readable page over a `products.json` or raw API endpoint, even when the API was what you actually parsed.
- **`senastVerifierad`** — the date you verified, `YYYY-MM-DD`. Set it on every brand you touch, including ones where nothing changed.
- **`borsnoterat`** — strictly `"Ja"` or `"Nej"`. Never annotate (`"Ja (Snap-on på NYSE)"` breaks the schema enum and the UI filter). Put the reasoning in a `kallor` label.
- **`tillverkningslander`** — Swedish country **names**. Never continents (`"Asien"`, `"Europa"` are defects, not values), never ISO codes.

### Scope discipline

- **In scope:** sources, verification date, fact corrections the research contradicts, structural defects (broken enums, fake/self-referential entities, wrong country codes, placeholder owners).
- **Out of scope:** `kategori`. It is free-text multi-value in the live data (`"Verktyg, Handsågar"`) and has drifted from §5's canonical list. Normalizing one letter-group at a time would leave the database *more* inconsistent, not less — it needs one dedicated full-database pass.
- **Never downgrade good data on weak evidence.** Flag "uncertain" and carry it as a watch item. A field that was right yesterday and is now blank is a regression.

### Pass criteria

```groq
{
  "fel_enum":      count(*[_type == "brand" && string::startsWith(lower(varumarke), "c") && !(borsnoterat in ["Ja","Nej"])]),
  "fel_kallor":    count(*[_type == "brand" && string::startsWith(lower(varumarke), "c") && count(kallor) != 3]),
  "fel_datum":     count(*[_type == "brand" && string::startsWith(lower(varumarke), "c") && !defined(senastVerifierad)]),
  "fel_kontinent": count(*[_type == "brand" && string::startsWith(lower(varumarke), "c") && ("Asien" in tillverkningslander || "Europa" in tillverkningslander)]),
  "fel_brutenRef": count(*[_type == "brand" && string::startsWith(lower(varumarke), "c") && defined(koncern) && !defined(koncern->moderbolag)])
}
```

All five must be `0`, queried with `perspective: "published"`. Drafts passing is not the same as published passing.

### Patch gotchas

- A patch transaction is **per document, all-or-nothing** — a failure rolls back that document's entire `set`. On failure re-apply every intended field; never assume partial success.
- A brand can only hold a **strong** reference to a **published** koncern. For a newly created koncern: stage the brand's ref as `_weak: true`, publish the koncern, then upgrade the ref to strong and publish the brand. (Not needed when reusing an already-published koncern.)
- Patching `drafts.<id>` when no draft exists creates the draft from the published version — safe.

---

## Notes

- **ASCII field names** in Sanity schema (e.g. `varumarke`, `agare`) — the GROQ query in `src/lib/queries.ts` maps these to Swedish display names
- `brandLand` defaults to `"SE"` for Swedish brands; use ISO 3166-1 alpha-2 for others
- `tillverkningslander` is an array of country name strings (e.g. `["Sverige", "Portugal"]`)
- The `intro` field accepts plain text (not Portable Text)
