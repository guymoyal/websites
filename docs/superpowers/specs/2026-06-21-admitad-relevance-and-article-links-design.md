# Admitad Relevance Cleanup + Article Affiliate Links — Design

**Date:** 2026-06-21
**Branch:** partner-harvest
**Status:** Approved design, pending implementation plan

## Problem

The aibuzz.world build currently emits ~3,623 pages. **3,520 of those are
auto-generated partner landing pages — one per Admitad merchant** (at `/<slug>`),
created by an earlier `partners:harvest` + `partners:copy` run. Reality:

- **Only 1 of 3,520 programs is connected/active** in Admitad (AliExpress WW).
  The other 3,519 link to tracking URLs for programs the account has not joined,
  so their clicks almost certainly will not track or pay. The Admitad dashboard
  showing 1 click / $0 confirms this.
- **3,519 merchants have no category metadata** (the harvest only captured name +
  description), so they cannot be matched to article topics as-is.
- **3,520 near-templated affiliate landing pages against only 26 real articles
  (~135:1)** is the classic thin/doorway-content pattern Google penalizes, and it
  endangers the rankings of the 26 genuine articles.

The 26 articles themselves currently have **no in-content affiliate links** — only
display ads (`MonetizationLeaderboard`, `ResidualDisplayAd`) around the body. The
user wants the "swiftherb" pattern: relevant affiliate links woven into each
article, pointing at merchants that are actually relevant and connected.

## Goal

1. Reduce the merchant footprint to a **relevant, connectable** set (target ~80–120
   surviving pages, decided by relevance — NOT an arbitrary page count).
2. Give the user a prioritized **connect-list** so those programs can be joined and
   start earning.
3. **Prune** the irrelevant pages and de-index them cleanly to remove the
   thin-content SEO risk.
4. Inject **relevant in-content affiliate links** into the 26 articles, pointing at
   relevant *connected* merchants via the existing `/go/<slug>/` redirect.

### Non-goals (YAGNI)

- No targeting an arbitrary page count (200–300). Page count follows relevance.
- No automated *joining* of programs (Admitad joins often need advertiser approval
  and are done in the dashboard). We generate the list + connect links only.
- No rewriting of article markdown bodies. Links render from a data file.
- No new content generation in this project (growing articles is a separate effort).

## SEO rationale (why ~100, not 300)

Google rewards unique value per page, not page count. The risk signal for affiliate
sites is a **high ratio of thin affiliate pages to real editorial content**. With 26
articles: ~80 merchant pages ≈ 3:1 (healthy niche site); ~300 ≈ 12:1 (thin-affiliate
doorway pattern). A keyword scan found only ~140 even loosely relevant merchants, so
reaching 300 would require re-including the exact irrelevant pages we are pruning.
The defensible move is fewer, relevant, earning-capable pages.

## Architecture — four components (pipeline A→B→C→D)

Each component is a standalone script + data artifact, runnable independently and
idempotently. They communicate through JSON files in `content/`, matching the
existing `partners:*` script conventions.

```
admitad-landings.json (3,520)
   │
   ▼  [A] classify
relevant-merchants.json (~80–120, with category + anchorIdeas)
   │
   ├─▼ [B] connect-list  → connect-list.md / .csv  (manual join in dashboard)
   │       then: yarn partners:fetch → refresh `active` status
   │
   ├─▼ [C] prune+rebuild → filtered admitad-landings.json, goLinks.json,
   │                        sitemap, worker 410/noindex list
   │
   └─▼ [D] article linker → article-affiliates.json → rendered component
```

### A. Relevance classifier

- **Script:** `scripts/classifyRelevantMerchants.js` (new). New package script
  `partners:classify`.
- **Input:** `content/admitad-landings.json`.
- **Step 1 — keyword prefilter:** score each merchant on `name + description` text
  against tiered keyword buckets (core AI/software/SaaS; adjacent hosting/VPN/cloud/
  edu/design; broad electronics/gadget/marketplace). Keep the **Broad** candidate
  pool (~140) to maximize recall before the precision pass.
- **Step 2 — LLM verification:** for each candidate, call the existing Gemini/DeepSeek
  helper (reuse `scripts/lib` + `analyzeToolWithGemini.js` patterns) with the
  merchant name + description and ask for a strict JSON verdict:
  `{ relevant: boolean, category: <one of the 9 article categories or "General">,
  anchorIdeas: string[], reason: string }`. Drop `relevant:false`.
- **Output:** `content/relevant-merchants.json` — array of
  `{ slug, name, gotolink, connectionStatus, category, anchorIdeas, score }`.
- **Idempotent / cacheable:** cache LLM verdicts keyed by slug so re-runs skip
  already-classified merchants (avoids re-billing API for 140 calls each run).
- **Cost guard:** ~140 LLM calls max. Log count + a dry-run mode (`--dry`) that
  prints the keyword-prefiltered candidates without calling the LLM.

### B. Connect-list generator

- **Script:** `scripts/generateConnectList.js` (new). Package script
  `partners:connect-list`.
- **Input:** `content/relevant-merchants.json`.
- **Output:** `content/connect-list.md` (human-readable, sorted by category then
  score) and `content/connect-list.csv`. Each row: merchant name, category,
  current `connectionStatus`, Admitad store/connect URL (built from campaignId +
  websiteId), and a short "why relevant" note.
- After the user connects programs in the dashboard, they re-run
  `yarn partners:fetch` (existing) to refresh `connectionStatus: active` in
  `admitad-landings.json`. Components C and D treat `active` as the gate for what is
  actually earning (D links only to connected merchants; see Open Questions).

### C. Pruner + rebuild

- **Script:** `scripts/prunePartnerPages.js` (new). Package script `partners:prune`.
- **Input:** `content/admitad-landings.json` + `content/relevant-merchants.json`.
- **Actions:**
  - Write a filtered landings file (relevant slugs only) that `lib/partnerLandings.ts`
    reads — so `app/[slug]` `generateStaticParams` builds only relevant pages.
    Approach: filter `admitad-landings.json` in place (keep a backup
    `admitad-landings.full.json`) OR add a relevant-slug allowlist that
    `getPartnerLandings()` intersects. **Chosen:** allowlist intersection in
    `lib/partnerLandings.ts` — non-destructive, reversible, keeps the full harvest.
  - Regenerate `src/goLinks.json` via existing `partners:redirects` (now only
    relevant slugs, since it reads the same source).
  - Sitemap (`app/sitemap.ts`) already derives partner pages from
    `getPartnerLandings()`, so it shrinks automatically.
  - **De-index removed slugs:** emit `content/pruned-slugs.json` (the ~3,400 removed
    slugs). Extend `src/worker.ts` to return **`410 Gone` + `X-Robots-Tag: noindex`**
    for `/<prunedSlug>` so Google drops them cleanly instead of seeing soft-404s.
    Use a Set lookup; keep the file out of the client bundle (worker import only).
- **Reversible:** allowlist + retained full harvest means re-widening is a config
  change, not a re-harvest.

### D. Article → merchant linker (the swiftherb part)

- **Script:** `scripts/linkArticlesToMerchants.js` (new). Package script
  `partners:link-articles`.
- **Input:** `content/articles.json` + `content/relevant-merchants.json` (filtered to
  `connectionStatus: active` so we never link to a non-earning program).
- **Matching:** for each article, match on `category` first, then keyword overlap
  between `article.keywords` and merchant category/anchorIdeas; LLM-assisted pass to
  pick the best **1–3** merchants and produce natural anchor text per article.
- **Output:** `content/article-affiliates.json` — map of
  `articleSlug → [{ slug, anchorText, blurb }]` (slug → `/go/<slug>/`).
- **Rendering:** new server component
  `components/ads/ArticleAffiliatePicks.tsx` that reads the map for the current
  article slug and renders a labeled **"Recommended tools"** block (clearly marked
  as affiliate, `rel="sponsored nofollow"`, links to `/go/<slug>/`). Inserted into
  `app/blog/[slug]/page.tsx` after the article body. **No article markdown is
  modified** — links are data-driven and rendered separately.
- If an article has no good match (no relevant connected merchant), render nothing.

## Data flow summary

| Step | Reads | Writes | Manual? |
|------|-------|--------|---------|
| A classify | admitad-landings.json | relevant-merchants.json | no (LLM) |
| B connect-list | relevant-merchants.json | connect-list.md/.csv | **user joins in dashboard** |
| (refresh) | Admitad API | admitad-landings.json (active flags) | `yarn partners:fetch` |
| C prune | landings + relevant-merchants | allowlist, goLinks.json, pruned-slugs.json | no |
| D link | articles + relevant (active) | article-affiliates.json | no (LLM) |
| render | article-affiliates.json | (page output) | no |

## Error handling

- All scripts: wrap file reads in try/catch, fail loud with the offending path, and
  never write a partial/empty output over a good file (write to a temp file, then
  rename only on success).
- LLM calls: retry with backoff; on persistent failure, mark the merchant
  `relevant: null` (excluded, logged) rather than crashing the whole run.
- Pruner: refuse to run if `relevant-merchants.json` is missing or empty (guards
  against accidentally pruning every page).
- Worker 410 list: if `pruned-slugs.json` fails to import, the worker falls through
  to normal asset serving (fail-open, no crash).

## Testing

- **A:** unit-test the keyword prefilter (known relevant/irrelevant fixtures); LLM
  pass tested with a stubbed classifier returning canned verdicts. Assert false
  positives like "Pai Wellness" are droppable and gems (fireflies.ai, Lalal.ai) kept.
- **C:** test that `getPartnerLandings()` returns only allowlisted slugs; test the
  worker returns 410+noindex for a pruned slug and 302 for a live `/go/` slug.
- **D:** test matching picks ≤3 merchants, only `active` ones; test
  `ArticleAffiliatePicks` renders nothing for an unmatched slug and a labeled block
  with `rel="sponsored nofollow"` for a matched one.
- **Build:** `yarn build` succeeds and page count drops from ~3,623 to ~(100 + 26 +
  ~75) ≈ ~200. Verify via `find out -name '*.html' | wc -l`.

## Open questions / decisions to confirm during planning

1. **Link to connected-only, or also "pending"?** D links only to
   `connectionStatus: active` by default (safest — every link earns). If the user
   wants links live before joins are approved, we can include pending merchants and
   refresh later. **Default: active-only.**
2. **Prune timing vs. connecting.** We can prune to the relevant set immediately
   (removes SEO risk now) even before all joins are approved, since C uses the
   relevant allowlist, not the active flag. Connecting then flips earning on for D.
3. **410 vs. 301.** Removed merchant pages have no equivalent to redirect to → `410
   Gone` is the correct, clean signal. Confirm we are not redirecting them to the
   homepage (which can look manipulative).
