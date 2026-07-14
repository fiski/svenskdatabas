---
name: discover-brands
description: Discover well-known Swedish brands that are MISSING from the Svensk Databas dataset. Pulls the current brand list from Sanity, generates candidates via category gaps, competitors of existing brands, and Swedish business news, dedupes against what's already there, and lets the user pick which to research and add. Use when the user wants to grow the database or find what's missing.
user-invocable: true
argument-hint: "[category | \"all\"]"
---

Find Swedish brands missing from the database and, on the user's selection, research and stage them. This is **heuristic discovery** — be explicit that it is not exhaustive, and say what you skipped.

## Steps

1. **Load the current dataset.** `ToolSearch` `select:mcp__Sanity__query_documents,mcp__Sanity__whoami`. Confirm auth (`whoami`); if not authenticated, stop and tell the user to authenticate. Then query existing brands:
   ```groq
   *[_type == "brand"]{ "namn": varumarke, "kat": kategori }
   ```
   Build a **dedupe set** of normalized names (lowercase, strip diacritics/punctuation) and note the category distribution.

2. **Generate candidates** using three seeds. Respect `$ARGUMENTS`: a category name scopes to that category; `all` or empty runs all three broadly.
   - **Category gaps** — for each existing category (Smycken, Handskar, Friluftskläder, Underkläder, Fordon, Mat och Dryck, Möbler, Kläder, Elektronik, Städprodukter), use `WebSearch` for prominent Swedish brands in that category and note which are absent from the dedupe set.
   - **Competitors of existing** — for a sample of brands already in the DB, search their Swedish competitors / sibling brands.
   - **News-driven (lighter pass)** — search Swedish business news for newly notable, newly launched, or recently acquired Swedish brands ("svenskt varumärke", "svenskt märke lanseras/förvärvas").

3. **Dedupe & rank.** Drop any candidate whose normalized name is already in the set (watch for spelling/diacritic variants and parent-vs-brand confusion). Present a table:
   | Candidate | Likely category | Why Swedish / notable | Seed | Confidence |
   State clearly this is a heuristic sample and list categories or seeds you did not fully cover.

4. **User selects.** Ask which candidates to research (or "all"). Only proceed on selected ones.

5. **Fan out research.** Dispatch a `brand-researcher` subagent per selected candidate (Agent tool, `subagent_type: "brand-researcher"`), passing the name + likely category as a hint. Batch them across messages in **bounded groups (~4–6 at a time)** to stay within parallelism limits; wait for each group before starting the next.

6. **Review & publish** — hand off exactly like the `/add-brand` skill's steps 3–5: present each researcher's summary with sources, publish (koncern draft first, then brand) only for brands the user approves, and verify each via BRAND_RESEARCH.md §7 Step 4.

## Rules
- Dedupe hard — the worst failure mode is re-adding an existing brand under a variant spelling.
- Never publish without explicit approval per brand.
- Be honest about coverage; never imply the candidate list is complete.
