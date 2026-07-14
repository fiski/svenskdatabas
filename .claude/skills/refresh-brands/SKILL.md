---
name: refresh-brands
description: Re-check existing brands in the Svensk Databas dataset for stale or missing data — ownership changes/acquisitions, manufacturing claims that no longer hold, and empty fields. Produces a report of flagged brands with proposed fixes and stages patched drafts for approval; publishes only after you approve. Use when the user wants to audit, refresh, or fact-check brands already in the database.
user-invocable: true
argument-hint: "[category | brand name | \"all\"]"
---

Audit brands already in the database for staleness and gaps, then stage fixes behind an approval gate. Ownership changes are the highest-value target — stale ownership is worse than no data (BRAND_RESEARCH.md §1 recency check).

## Steps

1. **Load the batch.** `ToolSearch` `select:mcp__Sanity__query_documents,mcp__Sanity__whoami,mcp__Sanity__patch_documents,mcp__Sanity__publish_documents`. Confirm `whoami`; stop if not authenticated. Query existing brands with koncern dereferenced, scoped by `$ARGUMENTS` (a category, a single brand name, or `all`):
   ```groq
   *[_type == "brand" && (<scope filter>)]{
     _id, varumarke, kategori, tillverkadISverige, borsnoterat,
     tillverkningslander, hallbarhetsFokus, intro,
     koncern->{_id, moderbolag, moderbolagLand, agare, agareLand}
   }
   ```
   If scope is `all`, work in small batches (~10 brands) and confirm before moving to the next batch — this is web-search-heavy.

2. **Check each brand** (this is research — offload heavy per-brand work to a `brand-researcher` subagent when a full re-verify is warranted, or do lightweight checks inline for a quick sweep):
   - **Ownership recency** — BRAND_RESEARCH.md §1 recency check: search "[brand] förvärv OR uppköpt OR säljs" and recent news. Flag if the current `koncern.moderbolag`/`agare` looks outdated.
   - **Manufacturing** — is `tillverkadISverige` still supported by current evidence? Flag contradictions.
   - **börsnoterat** — re-check across the ownership chain if ownership changed.
   - **Gaps** — empty `tillverkningslander`, missing `hallbarhetsFokus` or `intro`, missing `brandLand`.

3. **Report.** Present a table of only the **flagged** brands:
   | Brand | Issue | Current value | Proposed value | Source |
   Say how many brands were checked and how many were clean. Do not change anything yet.

4. **Stage fixes on approval.** For brands the user approves, create a **patched draft** — `mcp__Sanity__patch_documents` targeting `drafts.<id>` (creating the draft edit), NOT the published doc. If an ownership change means a different koncern, reuse-or-create it per BRAND_RESEARCH.md §5/§7 (as a draft) before repointing the reference. Keep the published version untouched until publish.

5. **Publish on approval** — `mcp__Sanity__publish_documents` (koncern first if changed, then brand), then verify via §7 Step 4.

## Rules
- Never mutate a published document directly and never publish without per-brand approval.
- Prefer flagging "unverified/uncertain" over overwriting a fact you can't currently re-confirm — do not downgrade good data on weak evidence.
- Reference BRAND_RESEARCH.md for all decision rules; don't restate them.
