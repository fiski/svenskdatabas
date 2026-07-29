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
| Who actually manufactures a Swedish consumer product | The **Svanen licence register**, `svanen.se/licensinnehavare/<company>` — registry-grade and names the licence *holder*, i.e. whoever controls formulation and production. Proved Häxan's goods are made by Cleano Production AB, not by Häxan itself |
| Whether a claimed parent company still exists | The Finnish **PRH** open data / `northdata.com` name history. Two traps found at `H`: "Iittala Oy Ab" had been **deregistered since 2005**, and "Haglöfs Scandinavia AB" is a **former name of the same legal entity** as Haglöfs AB. Confirm a parent is *active* and *distinct*, not merely real |
| **Who the Swedish parent company is** | **`hitta.se/företagsinformation/<bolag>/<orgnr>`** — fetchable where allabolag/proff/bolagsfakta all block, and it prints **"Koncernmoderbolag"** plus the full subsidiary tree. Resolved two self-referential `moderbolag` in one batch at `I`+`J` (Icebug → GtoG AB; Iris Hantverk → Edhäll Sparrenhök Holding AB), and two more at `K`. **Try this before northdata** when the question is specifically *who owns this Swedish company* — **but see the staleness warning below** |

> **hitta.se is fast, not fresh — it can lag a real transaction by years.** At `K` its Kasthall entry still named **K III Denmark K/S** (the Karnell fund vehicle) as koncernmoderbolag and grouped the company with Silva, though Karnell had sold Kasthall to Altor-owned NOD in **September 2023**. Following it blindly would have rewritten the koncern *backwards in time* — and worse, **Karnell Group AB listed on First North in December 2023**, so the stale chain would also have flipped `borsnoterat` to a wrong "Ja". Use hitta.se for stable family-owned companies; whenever a deal in the last ~3 years is even suspected, confirm against the **acquirer's own site or portfolio page**.

> **A self-referential-looking `moderbolag` is an indication, not a verdict.** At `K`, three were genuine defects (Karesuandokniven, Klippan, Kero) but **Klättermusen AB really is the koncernmoderbolag** over six subsidiaries with no holding company above it. Before "fixing" the pattern, check whether the company is itself listed as group parent over other entities.

> **Check which half of a corporate split you are looking at.** "Kero Holding AB" is real, active and almost the right name — but it owns the **tannery** (Kero Leather AB), not the boot maker (Kero Försäljning AB) that the brand entry is about; the two separated in 2005. Same trap class as IKEA's Ingka vs Inter IKEA. When a company's history contains a split, ask which branch makes *the product the entry is about*.

> **`(publ)` is a Swedish company form, not a stock listing.** Koenigsegg Automotive AB became a *publikt* AB in August 2025 while preparing an IPO and remains unlisted. WebFetch's summariser misread the suffix as "publicly listed company" — a company must actually trade on a marketplace for `borsnoterat: "Ja"`.

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
| `intro` | Write 1–2 sentences: founded year, product type, location. **No em or en dashes** — see the house style rule below |
| `hallbarhetsFokus` | Sustainability page on company website. **No em or en dashes** |
| `kallor` | The source URL you used for each key claim (ownership, börsnoterat, manufacturing) — record as `{url, label}`, label = the claim |
| `senastVerifierad` | Today's date (`YYYY-MM-DD`) — the day you verified the facts |
| `koncern.moderbolag` | allabolag.se: "Moderbolag" under company info |
| `koncern.moderbolagLand` | allabolag.se: country of moderbolag registration |
| `koncern.agare` | allabolag.se: ultimate owner (topp i ägarkedjan) |
| `koncern.agareLand` | allabolag.se: country of ultimate owner registration |

### House style for `intro` and `hallbarhetsFokus`

**Never use an em dash (`—`) or an en dash (`–`) in brand-facing copy.** Maximilian's ruling, applied across all 131 brands on 2026-07-29. Use a comma, a colon, a semicolon, parentheses, or a full stop instead, and a plain hyphen (`-`) where a dash is genuinely needed:

- Parenthetical aside → commas or parentheses: `Naturmaterial utan syntetfyllning, som tagel, lin, bomull och ull, med stomme av svensk furu`
- Explanation or list introduction → colon: `minskat e-avfall: enheterna är designade för flera års användning`
- Two independent statements → full stop: `Bolaget har ingen egen fabrik. Produkterna utvecklas i Varberg`
- Numeric ranges and scope numbers → hyphen: `scope 1-3`, `55-60 %`, `2004-2005`, `90-160 g`

Two traps when clearing dashes:
- **Don't silently alter a quotation.** Massproductions' `hallbarhetsFokus` quoted a product-page label containing a dash (`"CO2 Impact – Total Climate Footprint"`); the fix was to describe the label in prose rather than reword someone else's words inside quote marks.
- **Find them with GROQ, not by reading.** `count(*[_type=="brand" && length(string::split(intro, "—")) > 1])` works; `intro match "*—*"` does not, because the tokenizer strips punctuation. Run it for both dash characters and both fields.

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
- **The wrong half of a split corporate structure** — the recorded parent is a real, active, correctly-named entity that simply isn't the one that owns the manufacturing. IKEA's koncern held **Ingka Holding B.V.** (the largest *franchisee*, which runs the stores) when the entity that owns the brand, the concept and the factories is **Inter IKEA**. Two separate groups, no common owner. For a manufacturing database, record the side that owns the factories — and expect the same trap on any franchise- or licence-built brand.

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

> Snapshot as of **2026-07-29**: **102 of 131** brands verified — `&` and `A` (2026-07-24), `B`, `C`, `D`+`E`, `F`+`G` (2026-07-25), `H`, `I`+`J` (2026-07-26), `K` (2026-07-27), `L`+`M`, `N` (2026-07-28), `O`, `P`, `R` and 5 of `S` (2026-07-29). Next is **`S` wave 2**, 12 brands. This line is a convenience only; the query above is authoritative and self-correcting.

> **When the usage window is nearly spent, run a short wave and publish per brand.** With a third of a window left, opening all 17 of `S` would have risked a sixth cap-death with unstaged research. Two brands whose evidence was already in hand (Sätila of Sweden from the Nudie supplier list, String Furniture from the NOD/Altor siblings) were researched, staged and **published one at a time**, with the progress note updated straight after. Leave the multi-country industrials (Sandvik, Scania) and continent defects (Satake) for a full window — on those the country list *is* the job.

> **A "next up" group can be half-finished, not un-started.** The session before `P`'s completion published five of the seven `P` brands and died before updating anything — the progress note still read "86/132, next up P (7)" while the data said 41 unverified, not 46, with `senastVerifierad` already set on five of the seven. **Run the progress query *and* the letter-group query before dispatching any research.** This is a separate check from the transcript-recovery rule below: that one looks for research that was never applied, this one looks for work that was already published.

> **Run the progress query with `perspective: "published"`.** The default `raw` perspective also counts unpublished drafts, and there is exactly one — a `Relam Holding` brand draft that was never published and does not render on the site. It is why `raw` reports 133 brands where `published` reports 132.

> **A verified brand is not necessarily a *passing* brand.** `& Other Stories` and `ARKET` carried `senastVerifierad` from the sources-only `A` batch but still failed `fel_kontinent` — the early letter-groups predate these pass criteria. Run the pass query over **already-verified** groups too, not just the current one.

> **The database held one duplicate, now merged** — two published `Rörstrand` documents (`brand-30`, `brand-81`) created 51 seconds apart in the February migration, disagreeing on koncern and country list, both rendering on the live site. Merged at `R` on 2026-07-29 into `brand-30`; `brand-81` was unpublished and its draft discarded. **The published brand count is 131, not 132**, from that date on. A full-name scan found no other duplicates.

> **Small letter-groups can be batched.** `D` held a single brand, so it was run together with `E` as one 10-brand batch (two research waves of 5); `F`+`G` ran the same way as 11 brands. Dispatching ~5 researchers at a time keeps web-search quality up; 10 at once degrades sourcing.

> **Lost research is not always in a `<task-notification>` — the main loop's own tool calls count too.** The recovery rule below was written for subagent reports, but the session before `R` researched the whole group *itself* with WebSearch/WebFetch and died mid-brand. There were **no task-notifications at all**; the material sat in ordinary `tool_use` / `tool_result` pairs. **Grep the transcript for the brand names, not for notification blocks**, then dump each `tool_use` input and `tool_result` body from that point on — roughly 40 fetches were recovered that way, covering three brands in full and a fourth in part.

> **Research killed by the usage cap is recoverable — do not re-run it.** Two sessions on 2026-07-28 researched all of `L`+`M` and both died on the cap before staging anything, leaving the dataset untouched and the progress note claiming `K` was current. The reports were recovered from the session transcripts at `~/.claude/projects/<project-slug>/<session-id>.jsonl`: parse each line as JSON and pull the `<result>` payload out of every `<task-notification>` block (regex the raw file if per-message parsing misses some — background-agent notifications repeat, so de-duplicate by agent name). **Check for this before dispatching researchers for any group the note says is "next up"** — a large recent `.jsonl` for this project means work may already exist. Copy anything recovered out of the session scratchpad, which is session-scoped and disposable.

> **When a group gets researched twice, reconcile the two runs before applying either.** The two `L`+`M` runs reached **opposite** conclusions on Löfbergs, and the second one asked Maximilian a question whose premise the first had already disproved with a stronger source — he answered `Delvis` for a Latvian roastery that a Löfbergs SKU sold in Latvia declares as `Izcelsmes valsts: Zviedrija`. **A decision is only as good as the premise it was put on;** if a parallel run contradicts that premise, re-ask rather than apply. (Resolved: `Ja` kept, Latvia carried as a watch item.)

> **Batch the write, too — and the limit is BYTES, not brands.** `patch_documents` silently truncates an oversized payload and fails with a JSON parse error at roughly **4,5 KB**. The old "3 brands per call" rule broke at `H`, where each brand carried a rewritten `intro` **plus** `hallbarhetsFokus` **plus** 3 `kallor`. Use **one brand per call** for a full field set; koncern-only patches (2–4 short fields each) batch fine at 4 per call.

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
- **A search-result title is NOT evidence a site is live — fetch it.** A search hit rendered as "Nocs Design – high-end speakers. Latest launch Braque." and I reported the site as live on that basis; both `nocs.se` and `nocsdesign.com` actually return **HTTP 402** with Shopify's *"This store is currently unavailable"*. Search indexes serve cached titles long after a store goes dark. This applies to every citation: the rule that each `kallor` URL must be fetched before staging covers snippets too.
- **A suspended storefront is a finding, not a fetch failure.** `HTTP 402 Payment Required` on a Shopify domain means the store is frozen, not that you were bot-blocked — and `r.jina.ai` will render the actual message so you can tell the difference. A brand whose shop is offline while the registry still says *aktivt* changes no field on its own, but it belongs in the report and as a high-priority watch item.
- **A Swedish row in a supplier list can be genuine — and if the supplier is itself in this database, cross-check its entry.** The Haglöfs rule (a Swedish-addressed supplier that produces in China) says check what the entity *makes*; Nudie Jeans is the opposite outcome. Its own supplier list names **Sätila of Sweden AB** for *"Knitting Beanies"*, and Sätila's own site says *"Stickat i Sätila sedan 1896"* with knitting in its own factory — real Swedish garment production, which upgraded Nudie to `Delvis`. **Run the supplier name against `*[_type=="brand"]` first**: Sätila was already a brand document, so its stored values and site were one query away.
- **Before changing a founding year, search for the STORED value specifically.** A researcher reported *"no source supports 2008"* for Nocs and proposed 2003; a source does support 2008, and 2003 turned out to be the founder's earlier **design studio**. Absence of evidence in one researcher's pass is not evidence of absence — and founding years are the field most likely to have three defensible anchors (company registration, brand launch, predecessor). When they conflict, keep the stored value and record the conflict.
- **A DTC brand's `/policies/terms-of-service` page names its legal operating entity — try it before trusting a trademark record.** Myrqvist's stored `moderbolag` "Myrqvist AB" was a **fabricated entity**; the real company is Vensar AB, and the proof is on the brand's own terms page (`Vensar AB`, VAT `SE556830189801`). Its *privacy policy* named nobody, and the registry page for Vensar AB never mentions Myrqvist — so neither route alone tied brand to entity. On Shopify-hosted brands try `/policies/terms-of-service` first, then `/policies/privacy-policy`, then the trademark register.
- **"Self-referential-looking `moderbolag`" has three outcomes, not two.** (1) *Genuine* — the company really is koncernmoder with nothing above it (Klättermusen, L:a Bruket, **Morjas**). (2) *Genuine defect* — a real holding company sits above it (Morakniv, **Målerås Glasbruk**). (3) *Fabricated name* — the stored entity **does not exist**, and the real entity is *also* the top of the chain, just under a different name (**Myrqvist**: "Myrqvist AB" → Vensar AB). Always establish the registered legal name and org.nr **before** deciding which case you are in.
- **On hitta.se, the ABSENCE of a `Koncernmoderbolag` field is itself evidence.** Morjas & Co AB's page shows no such field, which is what confirmed it sits at the top of its own structure — a positive finding from a missing field. Say so explicitly in the report rather than leaving it as "no parent found".
- **For a private AB's `borsnoterat: "Nej"`, cite northdata, not a news article.** Researchers keep reaching for whatever mentions money — a Wikipedia article for Målerås, a 2019 funding-round piece for Morjas. Neither proves absence of a listing. `northdata.com/<Company Name AB>,+<City>/<orgnr>` shows company form and the absence of any ticker, and it is fetchable where allabolag is not.
- **A stored claim can go stale because the page it rested on was deleted, not because the fact changed.** Massproductions' `hallbarhetsFokus` named "The Transparency Project"; that page now 404s after a migration to Shopify, while the substance (per-product CO2 figures) survives on product pages. Check the cited page still resolves, then re-cite the surviving evidence — don't drop a true claim because its URL died, and don't keep a programme name the company has retired.
- **Grocery data-pool sheets (`dabas.com/productsheet/<EAN>`) are label-grade for country of origin — but verify the EAN maps to the product you think it does.** A researcher filed EAN `07622300788834` as Marabou *Dubbel Choklad*; it is *Bubblig Mjölkchoklad*. The Norway origin declaration held, the product name did not, and the `kallor` label would have been publicly wrong. The origin field is supplier-declared regulatory text filed by the manufacturer itself, so it beats retailer spec tables.
- **A brand fact-box on a corporate site can be a CMS artifact.** `hmgroup.com/brands/monki/` reads "Founded: 2025" — the Weekday-relaunch year, not the founding. Monki was founded 2006. Don't correct a founding year to match a field like that.
- **A stored source URL can silently move domains.** All `morakniv.se/*` paths now 301 to `morakniv.com`, and one of them lands on a 404. Re-point old `kallor` to the current domain when a sweep touches the brand.
- **Retailer PIM `Tillverkningsland` fields can name the country the brand refuses to name — and they reopened the Kosta Boda gap.** NordicNest and RoyalDesign product pages expose a supplier-declared `Tillverkningsland`. For Orrefors, *Informal* and *Carat* both read **Tyskland** across two independent retailers; for Kosta Boda, *Viva* reads Tyskland while *Château* and *Line* read Sverige. That is a different, stronger evidence class than the Wikipedia-grade Turkiet/Slovakien claims rejected at `K`, so `["Sverige","Europa"]` cleared **upward** to `["Sverige","Tyskland"]`. **Caveat: the field is present on only some SKUs** (Orrefors *More* and *Pulse* omit it), so check several products across several series before concluding — and it names *a* foreign country, not necessarily the only one.
- **An "honest gap" decision is provisional, and reopening it obliges you to reopen the SIBLINGS in the same pass.** Kosta Boda was deliberately left `["Sverige"]` at `K` because nothing could be named. Orrefors' research at `O` found Germany first-hand — and the same route works on Kosta Boda, same koncern, same factory network. Shipping Orrefors as `["Sverige","Tyskland"]` while leaving the sibling at `["Sverige"]` would have put two brands in one koncern in visible contradiction. **When a later group finds a nameable country, re-run the koncern-sharing check backwards and patch the already-verified siblings too.**
- **An announced-then-cancelled factory can sit in the DB as a production country.** Oatly carried `Storbritannien`; Oatly has **never produced in the UK** — the Peterborough plant was scrapped mid-2024 before construction completed, and Oatly's own LCA says UK-market oat drink comes from Vlissingen. Meanwhile `Kina` (Ma'anshan) was missing. **Cite the facility list in the annual report, not press coverage of plans** — coverage of a groundbreaking outlives coverage of a cancellation.
- **An ADS ratio makes percentages in SEC ownership filings non-comparable.** A Polestar Class A ADS represents **30 ordinary shares**. The same holder, PSD Investment, is reported at **39,1 % of the ordinary shares** (13D/A, June 2025) and **30,0 % "of the class"** counted in Class A ADSs (13D/A, March 2026). Neither figure is wrong — they count different classes. **Establish which class a filing counts before storing a percentage**, and say so in the `kallor` label. Same family as Oatly's 20:1 ADR-ratio change.
- **A 20-F is too large for `r.jina.ai`, but the company's own IR site serves the filing as a fetchable `static-files` object.** `sec.gov` returns 403 to WebFetch, and `r.jina.ai` fetched Polestar's 8 MB 20-F without surfacing the Item 7 shareholder table. `investors.polestar.com/static-files/<uuid>` returned the whole Schedule 13D/A — every reporting person, its **jurisdiction of organization**, and exact percentages. **Look for `/static-files/` on the IR site before giving up on a SEC table.**
- **A figure in a company press release can be revised downward by that same company's later release.** Carlsberg's 2023-10-24 release said CO2 recovery at Falkenberg would cover *"upp till 40 procent"* of carbonation need; the 2025-10-21 release reports the actual at **25 %** (~2 000 tonnes). Both are first-party. **When a figure is phrased as an expectation, search for a newer release before citing it** — the defect is in the tense, not in a dead link (contrast Massproductions, where the page itself died).
- **A consumer-service or Q&A subdomain can be first-party — but check it names the brand.** `carlsbergkonsumentservice.se` states verbatim which drinks are made in Falkenberg, yet **never mentions Pripps Blå**. The citation that shipped was the brand's own product pages, which declare `Producerat: Sverige` per variant. A first-party answer about the wrong object is not evidence.
- **The cancelled-factory rule runs forwards too: an announced future plant is not a production country.** Polestar 7 is slated for Volvo's Kosice plant in Slovakia from 2028, and Polestar's Q1 2026 release says it currently produces "across two continents — North America and Asia". `Slovakien` stayed out of `tillverkningslander` and went into the `intro` as planned capacity. Add it when the plant builds cars, not when it is announced.
- **`references()` does not find string-keyed pointers — check `brandStats` before deleting any document.** `*[references("brand-81")]` returned nothing, yet `brandStats` points at brands through a plain string field (`brandId: "brand-30"`), not a reference. That query is what decided which duplicate survived: `brand-30` carried a view counter, `brand-81` carried none. Always add `*[_type=="brandStats" && brandId == "<id>"]`. Note that `unpublish_documents` refuses to unpublish documents other documents *reference* — that safeguard does not cover string pointers.
- **Deleting a document is two steps: `unpublish_documents`, then `discard_drafts`.** The Sanity MCP surface has no delete tool. Unpublishing moves the document to a draft, and the draft must be discarded separately — otherwise the thing you "deleted" lingers as an invisible draft and throws off the `raw`-vs-`published` counts (the same way the `Relam Holding` draft does).
- **First-party origin disclosure can exist for one product category and not another at the same brand.** `iittala.com` prints "Tillverkad i Thailand" on the stoneware (Höganäs Keramik) but names **no country at all** on Rörstrand's porcelain pages — checked across two SKUs and the FAQ — and Fiskars' 2025 annual report never mentions Rörstrand once (it says Business Area Vita ran nine own manufacturing units, without locations). A group disclosing origin somewhere is not the same as disclosing it for the brand in front of you.
- **Retailer PIM `Tillverkad i` is populated per SERIES, not per brand.** RoyalDesign exposes it on Rörstrand **Swedish Grace** (three SKUs → Indonesien, one vase → Thailand) but not on Mon Amie or Ostindia, and NordicNest omits it on every Rörstrand page. Same shape as Orrefors, where *More* and *Pulse* lacked the field. Walk series by series, and expect only the best-selling one to carry it.
- **A supplier list that states each facility's ROLE can move a country list in both directions at once.** Sandqvist's own supply-chain page names every facility and what it does: final assembly at Pungkook in Vietnam and Butler Leather in Chennai, versus **components only** in China (metal and plastic trims, webbings, labels), South Korea (fabrics), Denmark and Taiwan (tanning). `["Kina","Vietnam"]` became `["Vietnam","Indien"]` in one pass: India added as assembly, China removed as component-only under the Myrqvist/Chimi/Our Legacy material-origin rule, with all four component countries moved into the `intro`. **Read the role column before adding or removing a country** — a list of "suppliers" mixes assembly and materials, and India happened to occupy both roles here.
- **"Developed in Sweden" is not a manufacturing claim, and the FAQ is where the real answer lives.** Sachajuan's own story page says only *"Developed in Sweden"* (the FOREO trap), and secondary sources asserted Swedish manufacturing with nothing behind it. The FAQ answered it outright: *"All our product development is based in Sweden and the vast majority of our products are made here"*, with production elsewhere **when local legislation requires it**. Try `/pages/faq` before accepting or rejecting a `tillverkadISverige` value on a beauty or consumer brand — it is where companies answer the question a marketing page dodges.
- **A foundation-owned brand usually has a holding company between the brand and the foundation.** Svenskt Tenn's stored `moderbolag` was self-referential, and `agare` (Kjell och Märta Beijers Stiftelse) was already right — but hitta.se showed **both** levels in one fetch: `Moderbolag: Kjell och Märta Beijer AB` and `Koncernmoderbolag: Kjell Och Märta Beijers Stiftelse`. The database had skipped the holding AB. When the owner is a foundation, assume an intermediate company exists and look for it.
- **A brand that admits unnamed exceptions to "made in Sweden" still keeps `Ja`.** Svenskt Tenn writes *"Basically the entire range is manufactured in Sweden. And if we sometimes make an exception it is either because there aren't the quality suppliers we require or the production capacity isn't available"* — an admission with **no country attached**, and none could be found. `Ja` + `["Sverige"]` was kept (the Hultafors rule: don't downgrade when the company's own disclosure names no foreign origin) and the admission was written into the `intro` (the Kosta Boda rule: prose carries what a filterable field must not invent). Downgrading to `Delvis` with a single country in the list would claim foreign production the sources do not show.
- **A stored `moderbolag` can be wrong in two ways at once — a former name *and* the wrong level.** "Resteröds AB" is both an old name for the same legal person (now **JBS Textile Group Sweden AB**, the Haglöfs class) and one level too low: that entity's own hitta.se page carries a `Moderbolag` field naming **JBS Textile Group A/S**. One fetch produced both the corrected name and the level above it — look for that field on the entity you suspect is self-referential before reaching for northdata.
- **Translate "Made in \<region\>" to the schema's granularity.** Rubato states **"Made in Scotland"**; `tillverkningslander` holds countries, so the value stored was **Storbritannien**, with Scotland named in the `intro`. Same defect class as the ISO code found on Sätila: right fact, wrong granularity, invisible to the country filter.
- **Check every product category before concluding a brand has one production country.** Rubato's knitwear is made in Scotland and its shirts, trousers and denim in Japan; stopping at the first product page would have stored one of two true countries. And the material-origin trap still applies in a form where it *looks* resolved: the Irish linen trousers are sewn in Japan, and several models use Japanese woven cloth — fabric origin and assembly country coincide for one and not the other.
- **Clearing a defect may mean removing a value without replacing it.** Kosta Boda's `"Europa"` had to go, but no source names a single foreign glassworks country — the company deliberately says only "carefully selected glassworks throughout Europe". The choice was `["Sverige"]` (true but incomplete) versus three Wikipedia-grade country names. **Take the honest gap and state the missing half in the `intro` instead.** A filterable field must not carry invented precision; prose can carry the caveat.

### Full-database integrity audit

The letter sweep cannot see cross-cutting defects. Run this in one call (`perspective: "published"`) at the start or end of a session; it costs almost nothing and it has found live bugs:

```groq
{
  "ja_utan_sverige":       *[_type=="brand" && tillverkadISverige=="Ja" && !("Sverige" in tillverkningslander)]{varumarke, tillverkningslander},
  "nej_med_sverige":       *[_type=="brand" && tillverkadISverige=="Nej" && "Sverige" in tillverkningslander]{varumarke},
  "delvis_ett_land":       *[_type=="brand" && tillverkadISverige=="Delvis" && count(tillverkningslander)==1]{varumarke, tillverkningslander},
  "tom_landlista":         *[_type=="brand" && (!defined(tillverkningslander) || count(tillverkningslander)==0)]{varumarke},
  "status_enum_fel":       *[_type=="brand" && !(tillverkadISverige in ["Ja","Nej","Delvis"])]{varumarke, tillverkadISverige},
  "borsnoterat_enum_fel":  *[_type=="brand" && !(borsnoterat in ["Ja","Nej"])]{varumarke, borsnoterat},
  "brutna_koncernref":     *[_type=="brand" && defined(koncern) && !defined(koncern->moderbolag)]{varumarke},
  "kallor_fel_antal":      *[_type=="brand" && defined(senastVerifierad) && count(kallor)!=3]{varumarke, "n": count(kallor)},
  "kallor_utan_url":       *[_type=="brand" && count(kallor[!defined(url) || url == ""])>0]{varumarke},
  "utan_intro":            *[_type=="brand" && (!defined(intro) || intro == "")].varumarke,
  "koncern_platshallare":  *[_type=="koncern" && agare in ["Privatägd","Privatägt","Familjeägt","Familjeägd","Privat","Investeringsbolag"]]{_id, moderbolag, agare, "brands": *[_type=="brand" && references(^._id)].varumarke},
  "alla_lander":           array::unique(*[_type=="brand"].tillverkningslander[]),
  "brandLand_varden":      array::unique(*[_type=="brand"].brandLand)
}
```

> **GROQ gotcha:** `string::length()` is **not available** in this dataset's GROQ version. To spot malformed country codes or non-country values, dump `array::unique(...)` of the field and read the list instead of filtering on length.

Reading the two `array::unique` dumps is what catches **new** defect classes. `"Utomlands"` was found this way at `R`, and the audit on 2026-07-29 turned up `"Globalt"` (Skultuna Messingsbruk) — a value nobody had thought to look for. Do the same for `brandLand`: the only values are `SE` and one legitimate `JP` (Satake).

**The audit found a live crash.** `DataTable.tsx` called `brand.merInfo.tillverkningsländer.join(', ')` unguarded while one published brand (Verso Skincare) has `tillverkningslander: null`, so expanding that row threw. Fixed in two places: `coalesce(tillverkningslander, [])` in `ALL_BRANDS_QUERY` (so every consumer gets an array) and a `?.length` guard in `DataTable.tsx` rendering `Uppgift saknas`. `BrandSuggestionForm.tsx` had already guarded with `?? []`, which is why nobody hit it there. **When the data can be null, fix it at the GROQ boundary, not only at the call site** — the TypeScript type says `string[]` and lied.

### Deferred full-database passes

Work that is real but must not be done one letter-group at a time, because doing half the database leaves it *more* inconsistent than leaving it alone. Each needs its own dedicated pass:

- [ ] **`kallor` label dashes.** All **325** labels use the `"Claim – detail"` convention with an en dash, which the house style in §2 bans for brand copy. Not a find-and-replace: **64** labels already contain a colon in the detail (a blanket `–` → `:` swap gives them two colons and reads worse than the dash), and **35** use a *second* dash as genuine prose inside the detail, which is the actual violation. Do it in three parts: (1) clear the 35 prose dashes, defensible on their own and worth doing even if the rest is skipped; (2) swap the 261 clean separators to a colon; (3) reword the 64 double-colon cases individually. §9's `"Claim – detail"` convention changes with it. Count them with `count(*[_type=="brand"].kallor[length(string::split(label, " – ")) > 1])`.
- [ ] **`kategori` normalization.** Free-text multi-value in the live data (`"Verktyg, Handsågar"`), drifted from §5's canonical list. See "Scope discipline" above. Also carries legacy values that are no longer true, e.g. Gustavsberg still lists "Hushållsporslin".
- [ ] **`moderbolag` convention reconciliation.** The database is inconsistent about whether the field holds the Swedish operating entity or the real foreign parent. Decided per brand so far (Marabou and Pripps keep the Swedish entity because it is the declared supplier; Gense and Resteröds hold the foreign parent). One pass should pick a rule and apply it everywhere, or document the split deliberately.
- [ ] **Re-run the pass criteria over the early letter-groups.** `&`, `A` and possibly `B` were verified before the criteria below existed. `& Other Stories` and `ARKET` already turned out to still carry `fel_kontinent` after being marked verified. The integrity audit added three named cases: **A Day's March, Acne Studios and All Blues** all still hold the placeholder `agare: "Privatägd"` on a self-referential `moderbolag`, i.e. exactly the defect class the sweep now fixes on every brand it touches. Those three are the concrete work item; the other 14 placeholder koncerns sit in letter groups that have not been reached yet and will be caught in turn.
- [ ] **Three known data defects waiting for their letter group** (found by the audit 2026-07-29, all still live): **Skultuna Messingsbruk** has `["Sverige","Globalt"]` where `"Globalt"` is not a country (`S`); **Tiger of Sweden** has `borsnoterat: "Ja (del av IC Group)"`, an enum break that also looks stale since IC Group no longer owns it (`T`); **Verso Skincare** has `tillverkningslander: null` while its intro says production is inside the EU, so no country is filterable (`V`). None can be fixed without research, so they were deliberately left rather than guessed.

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
