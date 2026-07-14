---
name: add-brand
description: Research a named Swedish brand and add it to the Svensk Databas Sanity dataset. Runs the full BRAND_RESEARCH.md workflow via the brand-researcher subagent, stages an unpublished draft with sources, and publishes only after you approve. Use when the user names one or more brands to add (e.g. "add Tretorn", "research and add Björn Borg").
user-invocable: true
argument-hint: "[brand name(s)]"
---

Research the brand(s) the user named and add them to Sanity, with a human approval gate before anything goes live. The heavy research lives in the `brand-researcher` subagent — this skill orchestrates it and owns the publish decision.

## Steps

1. **Determine the brand(s).** Use `$ARGUMENTS` if given; otherwise ask the user which brand(s) to add. Pass along any hints they give (website, legal name, category).

2. **Dispatch the researcher.** For each brand, dispatch the `brand-researcher` subagent (Agent tool, `subagent_type: "brand-researcher"`) with the brand name and hints. For 2+ brands, dispatch them **in a single message** so they run in parallel. Each returns a structured summary and the `drafts.<id>` it created (or a `blocked`/`flagged` result).

3. **Present for approval.** Show the user each returned summary as-is — proposed fields, **sources per claim**, koncern reused-vs-created, checklist gaps, confidence, and flags. Call out anything the researcher flagged (unverified manufacturing, new category, possible duplicate). Do **not** publish yet.

4. **Publish on approval.** For each brand the user approves, load `ToolSearch` `select:mcp__Sanity__publish_documents,mcp__Sanity__query_documents` and publish its draft(s):
   - Publish the **koncern draft first** (if one was created), then the brand draft — so the reference resolves.
   - `mcp__Sanity__publish_documents` with `ids: ["drafts.<id>"]`.
   - If the user rejects a brand, leave the draft unpublished (or discard it with `mcp__Sanity__discard_drafts` if they ask) — do not delete anything else.

5. **Verify** each published brand per BRAND_RESEARCH.md §7 Step 4: query it back, confirm the koncern dereference resolves and sibling brands appear. Report the result briefly.

## Rules
- Never publish without explicit user approval for that specific brand.
- The methodology is entirely in `BRAND_RESEARCH.md` (read by the subagent) — do not second-guess or duplicate its rules here.
- If a researcher returns `blocked` (Sanity not authenticated), surface that and stop — the user needs to authenticate first.
