# Rename to `brandsfrom.se`, move attribution to the footer

**Date:** 2026-07-26
**Status:** Approved

## Problem

The site presents itself under three different names — `Svensk databas av Maximilian` (header),
`Svensk databas` (footer), `Svensk Databas` (metadata, llms.txt, README) — none of which match the
domain it is served from, `brandsfrom.se`.

Two distinct issues are tangled in the header string:

1. **`av Maximilian` occupies the wordmark slot.** The instinct is sound: a transparency database
   needs a visible human behind it, and the About page's "Ingen information är sponsrad" claim is
   more credible with a name attached. But the header title is the home link and wordmark. A byline
   there is long on mobile, is not a name a reader can repeat, and reads as a personal blog rather
   than a reference source.
2. **`Svensk databas` is purely descriptive.** A database of what? It is unmemorable, uncompetitive
   in search, and unrelated to the domain.

## Decisions

**Scope of the name.** The project may expand beyond Swedish brands — `brandsfrom.se` already
implies "brands from [country]". The name therefore must not hardcode `svensk`.

**Chosen name: `brandsfrom.se`.** The name is the domain. This is the dominant convention for Swedish
reference sites (allabolag.se, hitta.se, ratsit.se, blocket.se); it scales to other countries by
construction; and it makes name, URL, and expansion story a single decision. The cost — an English
wordmark on a Swedish-language UI — is small, since Swedish readers parse `.se` domains as names.

Rejected: `Ursprung` (evocative and scope-flexible, but unrelated to the domain, so two identities
would need maintaining); `Tillverkat` / `Var tillverkas` (hardcodes manufacturing as the scope,
which may not hold, and its Swedish-language form fights the multi-country ambition).

**Attribution moves to the footer**, as `Ett oberoende projekt av Maximilian`, directly above the
existing LinkedIn and Kontakt links — where a reader asking "who is behind this?" actually looks.

## Changes

### 1. Wordmark — `src/components/Header.tsx:13`, `src/index.css:120-142`

Header text becomes `brandsfrom.se`.

`.header-title` is currently `20px / weight 400 / #6e6e6e`, identical to a nav link. That suits a long
grey byline but leaves a 13-character wordmark reading as weak. It takes `font-weight: 700` and
`color: #1a3050` — the treatment `.footer-title` (`index.css:1510-1515`) already uses for the brand.
No new design tokens.

This requires splitting `.header-title` out of the rule it shares with `.header-link`. `.header-link`
is dead — no component references it — so the shared rule is deleted rather than duplicated, across
the base rule, the `:hover` rule, and the `max-width: 599px` block.

### 2. Attribution — `src/components/Footer.tsx:21-25`, `src/index.css`

Footer title becomes `brandsfrom.se`. A byline paragraph is added below the description:

```
brandsfrom.se
Transparens kring svenska varumärken och deras tillverkning
Ett oberoende projekt av Maximilian
```

One new class, `.footer-byline`, inheriting the muted treatment of `.footer-description` with a small
`margin-top`.

### 3. Titles and metadata

| Location | New value |
|---|---|
| `index.html:12,13,21,29` | `Var tillverkas svenska varumärken? – brandsfrom.se` |
| `index.html:24` (`og:site_name`) | `brandsfrom.se` |
| `src/pages/Home.tsx:40` | `Var tillverkas svenska varumärken? – brandsfrom.se` |
| `src/pages/About.tsx:7` | `Om projektet – brandsfrom.se` |

**Stale count fix.** The meta description (`index.html:14`, and its `og:` and `twitter:` copies at
lines 22 and 30) reads `Sök bland 25+ varumärken`. The dataset holds 132 published brands — the text
Google shows understates the database by roughly 5×. It becomes `130+`, which is accurate and cannot
go stale downward.

### 4. Non-UI surfaces

`public/llms.txt` and `public/llms-full.txt` (heading and first body sentence), `README.md:1,9`, and
`studio/sanity.config.ts:9`. The llms files retain "an independent transparency project by
Maximilian" — for an AI-facing provenance file, the human's name is the point.

## Out of scope

The domain, favicon, and colour palette are unchanged. About page body copy stays as written: it
already opens with "Detta är ett oberoende projekt", which now reinforces the footer byline instead
of duplicating a header one. `dist/` is build output and regenerates. `migration-spec.md` is a
historical record. `CLAUDE.md` and the `.claude/skills/*` descriptions continue to say
"Svensk Databas" — internal tooling, not worth the churn.

## Verification

Copy and two CSS rules; no tests warranted. `npm run build` must succeed, and the running site is
checked for the header wordmark, the footer byline, and the document titles on `/` and `/om`.
