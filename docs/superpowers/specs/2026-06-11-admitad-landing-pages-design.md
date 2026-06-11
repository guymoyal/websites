# Admitad Affiliate Landing Pages — Design

**Date:** 2026-06-11
**Status:** Approved design, pending implementation plan
**Site:** aibuzz.world (Admitad ad space `2945005`)

## Goal

A manually-run, one-command pipeline that turns approved Admitad affiliate programs into
polished, professional landing pages served at the root of aibuzz.world — one page per
campaign — with AI-generated copy and the campaign's tracking link as the CTA.

## Verified feasibility (checked live against the Admitad API, 2026-06-11)

- OAuth2 client-credentials auth works with the existing `ADMIT_CLIENT_ID`/`ADMIT_CLIENT_SECRET` in `.env.local`.
- Granted scopes: `websites`, `advcampaigns`, `advcampaigns_for_website`, `manage_advcampaigns`, `deeplink_generator`. Note: `manage_advcampaigns` is useless for attaching — see "Known API quirks" below.
- Ad spaces: `2913701` swiftherb.com, `2945005` aibuzz.world — both active.
- Full catalog (`GET /advcampaigns/`) returns 1,320 programs. ~102 active programs in
  software/IT-services/education categories; a "June AI Fest" category holds 86 AI-related
  programs (e.g. LastPass WW, F-Secure WW, TurboVPN WW, DocHub WW).
- Existing `scripts/fetchAdmitadPrograms.js` correctly pulls connected programs; it returned 0
  rows only because the two existing applications (iHerb, on the swiftherb ad space) were
  declined by the advertiser. Tracking links (`gotolink`) exist only for approved connections.
- No scraping or session cookies are needed anywhere.

### Known API quirks (handle in implementation)

- `GET /advcampaigns/?website=<id>` returns 0 for both ad spaces — discovery must use the
  unfiltered catalog, then check per-program availability via
  `GET /advcampaigns/{id}/website/{w_id}/`.
- The catalog list response does NOT include the `moderation` (instant-approval) flag.
- List responses sometimes omit `gotolink`; the fetch script already enriches from the detail
  endpoint (keep that behavior).
- **Attach API retired (2026-06-11):** `POST /advcampaigns/{id}/attach/{w_id}/` returns
  `410 Gone` with body `{"error":"This API method is no longer available"}`. No replacement
  endpoint exists (v2/connect variants 404). The `manage_advcampaigns` scope is therefore
  useless for attaching. Publishers must join programs manually in the Admitad dashboard.
  The discovery script (`yarn partners:discover`) is now read-only and advisory only.

## Decisions

| Question | Decision |
|---|---|
| Relation to existing site | Add to the existing aibuzz.world site; keep all current content (helps advertiser approvals). |
| Page URLs | Root-level, one per campaign: `aibuzz.world/<campaign-slug>/`. The site exports statically with `trailingSlash: true`, so the slash form is canonical; a literal `.html` suffix is not used. Slugs come from `makeSlug()` in the fetch script (program name + campaign/website ids). |
| Program selection | Discovery script lists niche-fit candidates (AI/software/IT-services/e-learning categories and "June AI Fest") sorted by rating; user reviews the table and joins chosen programs manually in the Admitad dashboard (attach API retired, 410). |
| Page generation | One hand-crafted, high-quality landing template (existing Tailwind/component stack); AI (DeepSeek/Gemini, same pattern as `scripts/generateContent.js`) writes structured copy per program. |
| Automation level | Manual: a single command chains the steps. Scheduled automation is explicitly future work. |

## Architecture

### Pipeline — `yarn partners:sync` (runs steps 2–3; step 1 is its own command)

1. **Discover & apply** — `scripts/discoverAdmitadPrograms.js` (new), `yarn partners:discover`
   - Pull the full catalog, filter to active programs in target categories
     (configurable allowlist; default: Программы и IT-сервисы / Интернет-услуги /
     Онлайн-образование / June AI Fest, plus a name/description keyword filter for AI relevance).
   - For each candidate, fetch detail for ad space 2945005 to determine moderation status.
   - Auto-attach instant-approval programs via `POST /advcampaigns/{id}/attach/2945005/`.
   - Print a table of manual-moderation candidates (name, categories, commission) for the user.
   - Never mass-applies to manual-moderation programs (account-flagging risk).
2. **Fetch approved** — `scripts/fetchAdmitadPrograms.js` (existing, minor tweaks)
   - Connected mode for ad space 2945005 → `content/admitad-landings.json`
     (slug, path, gotolink, program metadata, `content` slot).
   - Must not overwrite a previously generated `content` field (merge with existing file).
3. **Generate copy** — `scripts/generateLandingCopy.js` (new)
   - For each entry with `content: null`, call the AI provider to produce structured JSON copy:
     headline, subheadline, intro, 4–6 benefit cards, how-it-works steps, FAQ (4–6 Q&A),
     CTA label, meta title/description. Language matches the program's market.
   - Idempotent: skips entries that already have content. Failures leave `content: null`
     and are listed in the run summary; the page falls back to the program's own description.
4. **Build & deploy** — existing `yarn deploy:cloudflare` (build + wrangler deploy), run manually.

### Rendering

- New dynamic route `app/[slug]/page.tsx` with `generateStaticParams` reading
  `content/admitad-landings.json`. Next.js resolves static routes first, so existing pages
  (e.g. `/tools`, `/articles`) take precedence; the dynamic route must 404 cleanly for
  unknown slugs (`dynamicParams = false`).
- One landing template component (`components/partners/CampaignLanding.tsx`): hero with
  program image + headline, benefits grid, how-it-works, FAQ accordion, prominent CTA
  button(s) → `gotolink` (`rel="sponsored nofollow"`), affiliate-disclosure footer.
- `/partners/` index page listing all live campaign pages.
- All campaign pages added to the sitemap; indexable.

### Data flow

```
Admitad API ──discover/apply──▶ (connections on Admitad)
Admitad API ──fetch──▶ content/admitad-landings.json ──generate copy──▶ same JSON (content filled)
admitad-landings.json ──next build──▶ out/<slug>/index.html ──wrangler deploy──▶ aibuzz.world/<slug>/
```

`content/admitad-landings.json` is committed to git (it is build input, like other content JSON).

## Error handling

- Program later declined/disconnected → next fetch drops its `gotolink` → page excluded from
  the build (no dead affiliate links). Its generated copy is retained in the JSON in case the
  connection is restored.
- AI generation failure for one program → continue with others; fall back to program
  description; flag in summary.
- API rate limits → existing per-call delay pattern (`ADMIT_DETAIL_DELAY_MS`) reused in the
  discovery script.
- Token/scope errors → fail fast with the actionable messages already used in the fetch script.

## Testing / verification

- Run discovery against the live account; verify the candidate table looks sane before any attach.
- Test-attach one program (user-confirmed) and verify `connection_status` then `gotolink`
  via the fetch script.
- Generate copy for the first approved program(s); human-review quality once.
- `yarn build`, open the built page locally, click the CTA, and confirm the outgoing URL is the
  Admitad tracking link (contains the campaign/ad-space identifiers).
- Confirm existing site routes are unaffected (build output unchanged for current pages).

## Out of scope (future)

- Scheduled end-to-end automation (GitHub Actions cron → deploy).
- Deeplink-based pages targeting specific advertiser products (scope already granted).
- Using the swiftherb.com ad space (2913701) for the same pipeline.
- Coupons/promotions feeds.
