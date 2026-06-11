# Partner-Program Harvest Plan (Admitad → aibuzz.world landing pages)

**Date:** 2026-06-11
**Status:** Harvest of all 3,519 programs running under the Swift Herb AI ad space;
**waiting on user** to connect the AI Buzz world ad space to the partner catalog (see "Your one manual task").

## Goal

Turn every no-approval program in Admitad's **"Affiliate programs from partners"** catalog
(Takeads / `tatrck.com` links — no advertiser approval needed, link works instantly) into a
polished landing page at `aibuzz.world/<program-slug>/`, fully automated.

## Background — what we learned

- The official Admitad publisher API does **not** expose this catalog (all candidate endpoints 404),
  and the program-attach API for the regular catalog was retired (410). Regular-catalog programs
  need per-advertiser approval; partner-network programs need none.
- The dashboard's internal API does everything we need, using a logged-in browser session:
  - Catalog list: `GET catalog.store.admitad.com/en/catalog/api/v1/website/{adSpaceId}/offers/all_partners_programs/?limit=&offset=` (3,519 programs)
  - Link generation: `POST .../offers/{campaignId}/goto_link/generate_partners_programs/` → `{"goto_link": "https://tatrck.com/h/..."}`
- Login session is saved once via Playwright (real Chrome, automation fingerprint disabled so
  Google SSO works) into `.admitad-profile/` (gitignored, local only).
- **Tracking links are tied to an ad space.** Swift Herb AI (id 2913701, swiftherb.com) is already
  connected to the partner catalog; **AI Buzz world (id 2951457, aibuzz.world) is NOT yet connected** —
  its Get-link modal says "To receive affiliate links, connect your ad space to the program catalog."

## Pipeline (all commands exist and are committed)

| Step | Command | What it does |
|---|---|---|
| 0. Login (once / on expiry) | `yarn partners:login` | Opens Chrome, you log in, session saved locally |
| 1. Harvest | `yarn partners:harvest` | Pulls the full partner catalog + generates a tracking link per program into `content/partner-programs.json` |
| 2. Sync | `yarn partners:sync` | Merges programs into `content/admitad-landings.json`, then DeepSeek writes copy for every entry without it (parallel, resumable) |
| 3. Build | `yarn build` | Static-exports one landing page per program + `/partners/` index + sitemap entries |
| 4. Deploy | `yarn deploy:cloudflare` | Publishes to aibuzz.world (run only when ready) |

Useful env vars:
- `HARVEST_WEBSITE_ID` — ad space for harvesting (default `2913701` Swift Herb; **switch to `2951457` once AI Buzz world is connected**)
- `HARVEST_LIMIT`, `HARVEST_KEYWORDS`, `HARVEST_DELAY_MS` — partial/filtered harvests
- `COPY_CONCURRENCY` (default 4), `COPY_DELAY_MS`, `COPY_LANGUAGE` — copy generation

## Current execution state (2026-06-11)

1. ✅ Login captured; internal API discovered and verified (smoke test: 5/5 links).
2. 🔄 Full harvest of 3,519 programs running under **Swift Herb AI** (zero failures so far).
3. ⏭ Next (automatic): `partners:sync` — AI copy for all programs (~1 h), then `yarn build`.
4. ⏸ Deploy is **not** automatic — user decides when to publish.
5. ⏸ Re-harvest under AI Buzz world — **blocked on the manual task below.**

## Your one manual task — connect AI Buzz world to the partner catalog

In the Admitad dashboard:

1. Top-right ad-space selector → choose **AI Buzz world**.
2. Open the **"Affiliate programs from partners"** tab (Programs menu).
3. Click **Get link** on any program → the modal shows **"Connect my ad space"** → click it.
4. Fill the short enrollment form (monthly active users + preferred contact info) and submit.
5. Wait for the one-time approval (this is the only approval in the whole system; after it,
   every program stays approval-free).

## After AI Buzz world is connected

Tell Claude (or run yourself):

```bash
HARVEST_WEBSITE_ID=2951457 yarn partners:harvest   # regenerate all links under aibuzz.world (~30-45 min)
yarn partners:sync                                  # re-merge; all existing AI copy is preserved (keyed by slug)
yarn build && yarn deploy:cloudflare                # rebuild + publish
```

Only the `link` values change — slugs, copy, and pages stay identical, so the re-run is cheap.

## Risks / notes

- **Attribution mismatch (temporary):** until the re-harvest, links are attributed to the
  swiftherb.com ad space while pages live on aibuzz.world. Commissions could in theory be
  rejected for traffic-source mismatch — this is why the re-harvest under 2951457 matters.
- **SEO (accepted by user):** publishing 3,519 thin affiliate pages at once risks Google's
  "scaled content abuse" policies and could affect existing rankings. User chose all 3,519.
- **Session expiry:** harvest fails with "session expired" → run `yarn partners:login` again.
- **Internal API fragility:** these endpoints are undocumented and may change with any
  dashboard redesign; the harvester logs failures loudly rather than guessing.
- **Site-wide canonical domain** still points at `aibuzztools.com` while deployment is
  `aibuzz.world` (pre-existing issue, affects all pages incl. landings) — fix pending user
  confirmation of the canonical domain.
