# Admitad Affiliate Landing Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A manually-run pipeline that turns approved Admitad programs into static landing pages at `aibuzz.world/<slug>/` with AI-generated copy and the campaign tracking link as CTA.

**Architecture:** Node scripts (same style as `scripts/fetchAdmitadPrograms.js`) handle discover→apply→fetch→generate-copy, all writing to `content/admitad-landings.json`. A root-level dynamic Next.js route (`app/[slug]/page.tsx`, static export) renders one `CampaignLanding` template per entry that has a tracking link.

**Tech Stack:** Next.js 14 App Router (`output: 'export'`, `trailingSlash: true`), Tailwind, Node CJS scripts with dotenv, Admitad Publisher API (OAuth2 client-credentials), DeepSeek chat API for copy.

**Spec:** `docs/superpowers/specs/2026-06-11-admitad-landing-pages-design.md`

**Verified API facts (do not re-derive):**
- Token: `POST https://api.admitad.com/token/` with Basic auth (`ADMIT_CLIENT_ID:ADMIT_CLIENT_SECRET`), `grant_type=client_credentials`, space-separated `scope`. Granted scopes include `websites advcampaigns advcampaigns_for_website manage_advcampaigns deeplink_generator`.
- Ad space for aibuzz.world: `2945005`.
- Catalog: `GET /advcampaigns/?limit=&offset=` → `{results, _meta:{count}}`, 1,320 rows. Rows have `id, name, description, raw_description, site_url, image, status, connected, rating, rate_of_approve, regions, categories, allow_deeplink, currency, ...` — **no `moderation` field**.
- `GET /advcampaigns/?website=<id>` returns 0 (quirk) — always use the unfiltered catalog.
- `GET /advcampaigns/{id}/website/{w_id}/` → **404 for non-connected programs**; for connected ones it returns `gotolink`, `connection_status`.
- Apply: `POST /advcampaigns/{c_id}/attach/{w_id}/` — **RETIRED (2026-06-11): returns 410 Gone (`{"error":"This API method is no longer available"}`). No replacement endpoint exists. Auto-apply is impossible; users must join programs manually in the Admitad dashboard.** Detach: `POST /advcampaigns/{c_id}/detach/{w_id}/` (status unknown).
- Instant approval is only observable AFTER attach: re-fetch the program for the website; `connection_status: "active"` immediately = instant, `"pending"` = moderated.

**Repo facts:**
- No test framework exists; do NOT add one. Each task ends with a live verification command and expected output instead of unit tests.
- `scripts/fetchAdmitadPrograms.js` already fetches connected programs → `content/admitad-landings.json` (entries have a `content: null` slot). Its `PATH_PREFIX` uses `|| '/partners'` so an empty env value falls back — Task 4 fixes that.
- `content/admitad-landings.json` currently holds 2 declined iHerb rows (debug leftovers, no `gotolink`) — harmless; reruns overwrite.
- Existing minimal templates `components/landings/LandingFocus.tsx` / `LandingSplit.tsx` stay untouched (they are examples); the new richer template is separate.
- AI scripts pattern: see `scripts/generateContent.js` (DeepSeek, `DEEPSEEK_API_KEY` is set in `.env.local`).

---

### Task 1: Shared Admitad API helper

**Files:**
- Create: `scripts/lib/admitadApi.js`

- [ ] **Step 1: Write the helper**

```js
/** Shared Admitad API helpers for scripts/. CJS, mirrors fetchAdmitadPrograms.js conventions. */
const path = require('path');

require('dotenv').config();
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env.local') });

const API_BASE = (process.env.ADMIT_API_BASE || 'https://api.admitad.com').replace(/\/$/, '');

function basicAuthHeader() {
  const id = process.env.ADMIT_CLIENT_ID;
  const secret = process.env.ADMIT_CLIENT_SECRET;
  if (!id || !secret) {
    throw new Error('Missing ADMIT_CLIENT_ID / ADMIT_CLIENT_SECRET (set them in .env.local).');
  }
  return `Basic ${Buffer.from(`${id}:${secret}`, 'utf8').toString('base64')}`;
}

async function fetchToken(scope) {
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: process.env.ADMIT_CLIENT_ID,
    scope,
  });
  const res = await fetch(`${API_BASE}/token/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: basicAuthHeader(),
    },
    body: body.toString(),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Admitad token ${res.status}: ${text.slice(0, 400)}`);
  const data = JSON.parse(text);
  if (!data.access_token) throw new Error(`Token response missing access_token: ${text.slice(0, 300)}`);
  return data.access_token;
}

async function apiRequest(token, method, urlPath) {
  const res = await fetch(`${API_BASE}${urlPath}`, {
    method,
    headers: { Authorization: `Bearer ${token}` },
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (_) { /* non-JSON body */ }
  return { ok: res.ok, status: res.status, data, text };
}

async function apiGet(token, urlPath) {
  const r = await apiRequest(token, 'GET', urlPath);
  if (!r.ok) throw new Error(`Admitad GET ${urlPath} ${r.status}: ${r.text.slice(0, 400)}`);
  return r.data;
}

/** GET all pages of a `{results, _meta}` endpoint. */
async function apiGetPaged(token, urlPath, searchParams = {}) {
  const limit = Number(process.env.ADMIT_PAGE_LIMIT) || 200;
  const all = [];
  let offset = 0;
  let total = Infinity;
  while (offset < total) {
    const params = new URLSearchParams({ ...searchParams, limit: String(limit), offset: String(offset) });
    const data = await apiGet(token, `${urlPath}?${params}`);
    const batch = Array.isArray(data?.results) ? data.results : [];
    total = typeof data?._meta?.count === 'number' ? data._meta.count : batch.length;
    all.push(...batch);
    if (batch.length === 0) break;
    offset += batch.length;
  }
  return all;
}

/** POST that returns {ok, status, data, text} instead of throwing (attach/detach report errors inline). */
async function apiPost(token, urlPath) {
  return apiRequest(token, 'POST', urlPath);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

module.exports = { API_BASE, fetchToken, apiGet, apiGetPaged, apiPost, sleep };
```

- [ ] **Step 2: Verify it authenticates**

Run: `node -e "require('./scripts/lib/admitadApi.js').fetchToken('websites').then(t=>console.log('token ok:', t.slice(0,8)+'…'))"`
Expected: `token ok: ai4njs…` (any 8-char prefix; no error)

- [ ] **Step 3: Commit**

```bash
git add scripts/lib/admitadApi.js
git commit -m "feat: add shared Admitad API helper for scripts"
```

---

### Task 2: Discovery script (dry-run candidate list)

**Files:**
- Create: `scripts/discoverAdmitadPrograms.js`
- Modify: `package.json` (scripts block)

- [ ] **Step 1: Write the script**

```js
#!/usr/bin/env node
/**
 * Discover Admitad programs for an ad space; optionally apply to selected ones.
 *
 * Dry-run (default): print a table of active catalog programs matching the
 * category allowlist / keyword filter, plus already-connected programs.
 * Apply: --apply --ids 123,456 → POST /advcampaigns/{id}/attach/{w_id}/ for
 * EXACTLY those ids, then report the resulting connection status. Never
 * applies to anything not listed in --ids (mass-applying risks account flags).
 *
 * Usage:
 *   yarn partners:discover
 *   yarn partners:discover --apply --ids 12345
 *
 * Env:
 *   ADMIT_WEBSITE_ID   — ad space (default 2945005 = aibuzz.world)
 *   ADMIT_CATEGORIES   — comma-separated category names (default below)
 *   ADMIT_KEYWORDS     — optional case-insensitive regex over name+description
 *   ADMIT_DETAIL_DELAY_MS — delay between API writes (default 500)
 */
const { fetchToken, apiGet, apiGetPaged, apiPost, sleep } = require('./lib/admitadApi');

const WEBSITE_ID = String(process.env.ADMIT_WEBSITE_ID || '2945005');
const DEFAULT_CATEGORIES = [
  'Программы и IT-сервисы',
  'Интернет-услуги',
  'Онлайн-образование',
  'June AI Fest',
];

function parseArgs(argv) {
  const args = { apply: false, ids: [] };
  for (let i = 2; i < argv.length; i += 1) {
    if (argv[i] === '--apply') args.apply = true;
    if (argv[i] === '--ids' && argv[i + 1]) {
      args.ids = argv[i + 1].split(',').map((s) => Number(s.trim())).filter(Boolean);
      i += 1;
    }
  }
  return args;
}

function matchesFilters(c, categories, keywordRe) {
  const catNames = (c.categories || []).map((k) => k.name);
  const inCategory = catNames.some((n) => categories.includes(n));
  if (!inCategory) return false;
  if (!keywordRe) return true;
  return keywordRe.test(`${c.name || ''} ${c.description || ''}`);
}

function regionList(c) {
  return (c.regions || []).map((r) => r.region).join(',') || '-';
}

function printTable(rows) {
  for (const c of rows) {
    const cats = (c.categories || []).map((k) => k.name).join('/');
    console.log(
      [
        String(c.id).padEnd(8),
        (c.connected ? 'CONNECTED' : 'available').padEnd(10),
        `appr:${c.rate_of_approve ?? '-'}`.padEnd(10),
        `rating:${c.rating ?? '-'}`.padEnd(12),
        regionList(c).slice(0, 18).padEnd(18),
        c.name,
        `| ${cats}`,
      ].join(' ')
    );
  }
}

async function applyTo(token, ids, catalogById) {
  const delay = Number(process.env.ADMIT_DETAIL_DELAY_MS) || 500;
  for (const id of ids) {
    const name = catalogById.get(id)?.name || `campaign ${id}`;
    const res = await apiPost(token, `/advcampaigns/${id}/attach/${WEBSITE_ID}/`);
    if (!res.ok) {
      console.log(`[apply] ${name} (${id}): FAILED ${res.status} ${res.text.slice(0, 200)}`);
      continue;
    }
    await sleep(delay);
    // Detail endpoint exists only after a connection (even pending) — read resulting status.
    let status = 'unknown';
    try {
      const detail = await apiGet(token, `/advcampaigns/${id}/website/${WEBSITE_ID}/`);
      status = detail.connection_status || 'unknown';
      if (detail.gotolink) status += ' (gotolink ready)';
    } catch (err) {
      status = `attach accepted; detail unavailable (${err.message.slice(0, 80)})`;
    }
    console.log(`[apply] ${name} (${id}): ${status}`);
    await sleep(delay);
  }
}

async function main() {
  const args = parseArgs(process.argv);
  const categories = process.env.ADMIT_CATEGORIES
    ? process.env.ADMIT_CATEGORIES.split(',').map((s) => s.trim()).filter(Boolean)
    : DEFAULT_CATEGORIES;
  const keywordRe = process.env.ADMIT_KEYWORDS ? new RegExp(process.env.ADMIT_KEYWORDS, 'i') : null;

  const scope = args.apply
    ? 'advcampaigns advcampaigns_for_website manage_advcampaigns'
    : 'advcampaigns';
  const token = await fetchToken(scope);

  console.log(`[discover] fetching catalog (ad space ${WEBSITE_ID})…`);
  const catalog = await apiGetPaged(token, '/advcampaigns/');
  const active = catalog.filter((c) => c.status === 'active');
  const candidates = active
    .filter((c) => matchesFilters(c, categories, keywordRe))
    .sort((a, b) => (b.rating || 0) - (a.rating || 0));

  console.log(
    `[discover] catalog: ${catalog.length}; active: ${active.length}; matching filters: ${candidates.length}\n`
  );
  printTable(candidates);

  if (!args.apply) {
    console.log('\nDry run. To apply: yarn partners:discover --apply --ids <id1,id2>');
    return;
  }
  if (args.ids.length === 0) {
    throw new Error('--apply requires --ids <comma-separated campaign ids> (no mass-apply).');
  }
  const catalogById = new Map(catalog.map((c) => [c.id, c]));
  await applyTo(token, args.ids, catalogById);
  console.log('\nDone. Run `yarn partners:fetch` to pull tracking links for approved programs.');
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
```

- [ ] **Step 2: Add the npm script**

In `package.json` scripts block, next to `"fetch:admitad"`, add:

```json
"partners:discover": "node scripts/discoverAdmitadPrograms.js",
```

- [ ] **Step 3: Run dry-run against the live account**

Run: `yarn partners:discover | head -40`
Expected: `catalog: ~1320; active: …; matching filters: >50`, then table rows like
`23708    available  appr:93    rating:4.5   WW                 LastPass WW | Программы и IT-сервисы/…`
(ids/numbers will differ; FAILURE = zero matching rows or an HTTP error)

- [ ] **Step 4: Commit**

```bash
git add scripts/discoverAdmitadPrograms.js package.json
git commit -m "feat: add Admitad program discovery script (dry-run + explicit apply)"
```

---

### Task 3: Live test-attach of ONE program — ⚠️ USER CHECKPOINT

**OUTCOME (2026-06-11):** attach API returns 410 Gone (retired by Admitad; docs confirm, no replacement). Auto-apply impossible — user joins programs manually in the dashboard (first pick: Udemy WW, id 22448). Discovery script reduced to read-only in commit 156f262.

This is the spec's "prove attach works" milestone. Applying is visible to the advertiser, so:

- [ ] **Step 1: Show the user the dry-run table and let them pick one program** (good candidates: a WW program with high `rate_of_approve` from the June AI Fest / IT-services rows, e.g. LastPass WW / F-Secure WW / TurboVPN WW). **Do not proceed without the user naming a program.**

- [ ] **Step 2: Apply to exactly that program**

Run: `yarn partners:discover --apply --ids <chosen-id>`
Expected: `[apply] <name> (<id>): active (gotolink ready)` for instant approval, or `[apply] … : pending` for moderated. FAILURE = `FAILED 4xx/5xx` — stop and debug the attach endpoint (check scope `manage_advcampaigns` in error body) before continuing.

- [ ] **Step 3: Record the outcome in the plan** (edit this file: chosen id, resulting status). If status is `pending`, later tasks still proceed — pages only render for entries with `gotolink`, so a pending program simply produces no page until approved.

---

### Task 4: Fetch script — root paths + content-preserving merge

**Files:**
- Modify: `scripts/fetchAdmitadPrograms.js` (lines 35, 482–520)
- Modify: `package.json` (scripts block)

- [ ] **Step 1: Fix PATH_PREFIX so empty string means site root**

Replace line 35:

```js
const PATH_PREFIX = (process.env.ADMIT_LANDING_PATH_PREFIX || '/partners').replace(/\/$/, '');
```

with:

```js
const PATH_PREFIX = (process.env.ADMIT_LANDING_PATH_PREFIX !== undefined
  ? process.env.ADMIT_LANDING_PATH_PREFIX
  : '/partners'
).replace(/\/$/, '');
```

- [ ] **Step 2: Preserve previously generated copy across re-fetches**

In `main()`, after the entries are collected (right before the `payload` is built), merge `content` from the existing output file, keyed by campaign+website ids (slugs are deterministic but ids are safer):

```js
  // Preserve AI-generated copy from the previous run (fetch must never erase it).
  let previous = [];
  try {
    previous = JSON.parse(fs.readFileSync(OUTPUT, 'utf8')).entries || [];
  } catch (_) {
    /* first run or unreadable file */
  }
  const prevContent = new Map(
    previous
      .filter((e) => e.content)
      .map((e) => [`${e.admitad.campaignId}:${e.admitad.websiteId}`, e.content])
  );
  for (const e of entries) {
    const key = `${e.admitad.campaignId}:${e.admitad.websiteId}`;
    if (prevContent.has(key)) e.content = prevContent.get(key);
  }
```

- [ ] **Step 3: Add the npm script for the aibuzz.world ad space with root-level paths**

In `package.json` scripts block:

```json
"partners:fetch": "ADMIT_WEBSITE_ID=2945005 ADMIT_LANDING_PATH_PREFIX= node scripts/fetchAdmitadPrograms.js",
```

- [ ] **Step 4: Run it live**

Run: `yarn partners:fetch && jq '{count, entries: [.entries[] | {slug, path, gotolink: .admitad.gotolink}]}' content/admitad-landings.json`
Expected: if Task 3 got instant approval — `count: 1` and a `path` with NO `/partners` prefix (e.g. `"/lastpass-ww-c23708-w2945005"`) and a non-null `gotolink` containing `ad.admitad.com`. If Task 3 is still pending — `count: 0` (correct behavior; continue).

- [ ] **Step 5: Commit**

```bash
git add scripts/fetchAdmitadPrograms.js package.json content/admitad-landings.json
git commit -m "feat: root-level landing paths and copy-preserving merge in Admitad fetch"
```

---

### Task 5: AI copy generator

**Files:**
- Create: `scripts/generateLandingCopy.js`
- Modify: `package.json` (scripts block)

- [ ] **Step 1: Write the script**

```js
#!/usr/bin/env node
/**
 * Generate landing-page copy for Admitad entries in content/admitad-landings.json.
 * Idempotent: only fills entries where content == null AND a gotolink exists.
 * Failures leave content null (page falls back to program description).
 *
 * Usage: yarn partners:copy
 * Env: DEEPSEEK_API_KEY, optional COPY_LANGUAGE (default "en"), COPY_DELAY_MS (default 1000)
 */
const fs = require('fs');
const path = require('path');

require('dotenv').config();
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DATA_FILE = path.join(__dirname, '..', 'content', 'admitad-landings.json');
const LANGUAGE = process.env.COPY_LANGUAGE || 'en';

const REQUIRED_KEYS = [
  'headline', 'subheadline', 'intro', 'benefits', 'howItWorks', 'faq',
  'ctaLabel', 'metaTitle', 'metaDescription',
];

async function callDeepSeekJson(systemPrompt, userPrompt) {
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: 'json_object' },
    }),
  });
  if (!response.ok) {
    throw new Error(`DeepSeek API ${response.status}: ${(await response.text()).slice(0, 300)}`);
  }
  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from DeepSeek');
  return JSON.parse(text);
}

function buildPrompts(entry) {
  const p = entry.program;
  const systemPrompt = [
    'You write conversion-focused but honest affiliate landing-page copy.',
    'Never invent prices, discounts, or guarantees not present in the input.',
    `Write in language: ${LANGUAGE}.`,
    'Respond with a single JSON object with EXACTLY these keys:',
    'headline (string, <=70 chars), subheadline (string, <=140 chars), intro (string, 2-3 sentences),',
    'benefits (array of 4-6 {title, description}), howItWorks (array of 3-5 strings),',
    'faq (array of 4-6 {question, answer}), ctaLabel (string, <=30 chars),',
    'metaTitle (string, <=60 chars), metaDescription (string, <=155 chars).',
  ].join(' ');
  const userPrompt = [
    `Brand/program: ${p.name}`,
    `Official site: ${p.siteUrl || 'unknown'}`,
    `Categories: ${(p.categories || []).map((c) => c.name).join(', ') || 'unknown'}`,
    `Program description (may contain HTML, treat as source material):`,
    String(p.description || '').slice(0, 4000),
    '',
    'Write landing page copy that helps a visitor decide to click through to this brand.',
    'The page is on an AI/tech site (aibuzz.world); keep the tone professional and helpful.',
  ].join('\n');
  return { systemPrompt, userPrompt };
}

function validateContent(c) {
  for (const k of REQUIRED_KEYS) {
    if (c[k] === undefined || c[k] === null || c[k] === '') return `missing key: ${k}`;
  }
  if (!Array.isArray(c.benefits) || c.benefits.length < 3) return 'benefits must be an array of 3+';
  if (!Array.isArray(c.howItWorks) || c.howItWorks.length < 2) return 'howItWorks must be an array of 2+';
  if (!Array.isArray(c.faq) || c.faq.length < 3) return 'faq must be an array of 3+';
  return null;
}

async function main() {
  if (!DEEPSEEK_API_KEY) throw new Error('DEEPSEEK_API_KEY is required (set in .env.local).');
  const payload = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  const targets = (payload.entries || []).filter((e) => !e.content && e.admitad.gotolink);
  console.log(`[copy] entries: ${payload.entries?.length ?? 0}; needing copy: ${targets.length}`);

  const delay = Number(process.env.COPY_DELAY_MS) || 1000;
  let ok = 0;
  const failed = [];
  for (const entry of targets) {
    const { systemPrompt, userPrompt } = buildPrompts(entry);
    try {
      const content = await callDeepSeekJson(systemPrompt, userPrompt);
      const problem = validateContent(content);
      if (problem) throw new Error(`invalid copy (${problem})`);
      entry.content = { ...content, language: LANGUAGE, generatedAt: new Date().toISOString() };
      ok += 1;
      console.log(`[copy] ✓ ${entry.program.name}`);
    } catch (err) {
      failed.push(`${entry.program.name}: ${err.message.slice(0, 120)}`);
      console.log(`[copy] ✗ ${entry.program.name}: ${err.message.slice(0, 120)}`);
    }
    await new Promise((r) => setTimeout(r, delay));
  }

  fs.writeFileSync(DATA_FILE, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`[copy] done: ${ok} generated, ${failed.length} failed.`);
  if (failed.length) console.log(failed.map((f) => `  - ${f}`).join('\n'));
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
```

- [ ] **Step 2: Add npm scripts (copy + the one-command sync)**

In `package.json` scripts block:

```json
"partners:copy": "node scripts/generateLandingCopy.js",
"partners:sync": "yarn partners:fetch && yarn partners:copy",
```

- [ ] **Step 3: Run it live**

Run: `yarn partners:copy && jq '.entries[] | select(.content) | {slug, headline: .content.headline, benefits: (.content.benefits|length), faq: (.content.faq|length)}' content/admitad-landings.json`
Expected: one block per approved program with a non-empty headline, `benefits >= 3`, `faq >= 3`. If there are 0 approved programs yet: `needing copy: 0` and no output — still a pass; rerun after approval.

- [ ] **Step 4: Re-run `yarn partners:fetch`, then confirm copy survived the merge**

Run: `yarn partners:fetch && jq '[.entries[] | select(.content)] | length' content/admitad-landings.json`
Expected: same count as Step 3 (the Task 4 merge preserved `content`). FAILURE = 0 after having >0 in Step 3.

- [ ] **Step 5: Commit**

```bash
git add scripts/generateLandingCopy.js package.json content/admitad-landings.json
git commit -m "feat: AI landing copy generator (DeepSeek, idempotent)"
```

---

### Task 6: Landing data loader for the app

**Files:**
- Create: `lib/partnerLandings.ts`

- [ ] **Step 1: Write the loader** (server-side `fs` read, same pattern as `lib/content.ts`)

```ts
import fs from 'fs';
import path from 'path';

export interface PartnerLandingContent {
  headline: string;
  subheadline: string;
  intro: string;
  benefits: Array<{ title: string; description: string }>;
  howItWorks: string[];
  faq: Array<{ question: string; answer: string }>;
  ctaLabel: string;
  metaTitle: string;
  metaDescription: string;
  language?: string;
  generatedAt?: string;
}

export interface PartnerLanding {
  slug: string;
  path: string;
  gotolink: string;
  program: {
    name: string;
    description: string | null;
    siteUrl: string | null;
    image: string | null;
    categories: Array<{ id: number; name: string }>;
  };
  content: PartnerLandingContent | null;
}

const DATA_FILE = path.join(process.cwd(), 'content', 'admitad-landings.json');

/** Entries that can become live pages: approved programs with a tracking link. */
export function getPartnerLandings(): PartnerLanding[] {
  let payload: any;
  try {
    payload = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
  const entries: any[] = Array.isArray(payload?.entries) ? payload.entries : [];
  return entries
    .filter((e) => e?.admitad?.gotolink && e?.slug)
    .map((e) => ({
      slug: e.slug,
      path: e.path,
      gotolink: e.admitad.gotolink,
      program: {
        name: e.program?.name ?? e.slug,
        description: e.program?.description ?? null,
        siteUrl: e.program?.siteUrl ?? null,
        image: e.program?.image ?? null,
        categories: e.program?.categories ?? [],
      },
      content: e.content ?? null,
    }))
    .sort((a, b) => a.program.name.localeCompare(b.program.name));
}

export function getPartnerLandingBySlug(slug: string): PartnerLanding | undefined {
  return getPartnerLandings().find((e) => e.slug === slug);
}
```

- [ ] **Step 2: Verify it compiles and reads the JSON**

Run: `npx tsx -e "const m=require('./lib/partnerLandings.ts'); console.log('landings:', m.getPartnerLandings().length)"` — if `tsx` is unavailable, defer verification to the Task 8 build (which type-checks and executes it).
Expected: `landings: <n>` where n = number of entries with gotolink (possibly 0).

- [ ] **Step 3: Commit**

```bash
git add lib/partnerLandings.ts
git commit -m "feat: partner landings data loader"
```

---

### Task 7: CampaignLanding template component

**Files:**
- Create: `components/landings/CampaignLanding.tsx`

Notes: server component, zero client JS (FAQ uses `<details>`), Tailwind classes, plain `<img>` for the external Admitad image (next/image domains are not configured for it). All outbound CTAs: `rel="sponsored noopener noreferrer"`.

- [ ] **Step 1: Write the component**

```tsx
import type { PartnerLanding } from '@/lib/partnerLandings';

const DISCLOSURE =
  'Disclosure: this page contains affiliate links. If you sign up or buy through them, aibuzz.world may earn a commission at no extra cost to you.';

function CtaButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored noopener noreferrer"
      className="inline-block rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-blue-700"
    >
      {label}
    </a>
  );
}

export function CampaignLanding({ landing }: { landing: PartnerLanding }) {
  const { program, content, gotolink } = landing;
  const headline = content?.headline ?? program.name;
  const subheadline = content?.subheadline ?? program.siteUrl ?? '';
  const ctaLabel = content?.ctaLabel ?? `Visit ${program.name}`;
  const kicker = program.categories[0]?.name ?? 'Partner offer';

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      {/* Hero */}
      <section className="text-center">
        <span className="mb-4 inline-block rounded-full bg-blue-50 px-4 py-1 text-sm font-medium text-blue-700">
          {kicker}
        </span>
        {program.image ? (
          <img
            src={program.image}
            alt={`${program.name} logo`}
            className="mx-auto mb-6 h-20 w-auto object-contain"
            fetchPriority="high"
          />
        ) : null}
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">{headline}</h1>
        {subheadline ? <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600">{subheadline}</p> : null}
        <CtaButton href={gotolink} label={ctaLabel} />
        {content?.intro ? <p className="mx-auto mt-10 max-w-2xl text-left text-gray-700">{content.intro}</p> : null}
        {!content && program.description ? (
          <div
            className="mx-auto mt-10 max-w-2xl text-left text-gray-700"
            dangerouslySetInnerHTML={{ __html: program.description }}
          />
        ) : null}
      </section>

      {/* Benefits */}
      {content?.benefits?.length ? (
        <section className="mt-16">
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">Why {program.name}?</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {content.benefits.map((b) => (
              <div key={b.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-2 font-semibold text-gray-900">{b.title}</h3>
                <p className="text-sm text-gray-600">{b.description}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* How it works */}
      {content?.howItWorks?.length ? (
        <section className="mt-16">
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">How it works</h2>
          <ol className="mx-auto max-w-2xl space-y-4">
            {content.howItWorks.map((step, i) => (
              <li key={step} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
                  {i + 1}
                </span>
                <p className="pt-1 text-gray-700">{step}</p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {/* FAQ — <details> keeps the page free of client JS */}
      {content?.faq?.length ? (
        <section className="mt-16">
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">Frequently asked questions</h2>
          <div className="mx-auto max-w-2xl space-y-3">
            {content.faq.map((f) => (
              <details key={f.question} className="group rounded-xl border border-gray-200 bg-white p-5">
                <summary className="cursor-pointer font-medium text-gray-900 marker:content-none">
                  {f.question}
                </summary>
                <p className="mt-3 text-gray-600">{f.answer}</p>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      {/* Final CTA + disclosure */}
      <section className="mt-16 text-center">
        <CtaButton href={gotolink} label={ctaLabel} />
        <p className="mx-auto mt-8 max-w-2xl text-xs text-gray-400">{DISCLOSURE}</p>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Commit** (rendering is verified in Task 8's build + example page)

```bash
git add components/landings/CampaignLanding.tsx
git commit -m "feat: CampaignLanding template component"
```

---

### Task 8: Root-level dynamic route + example page

**OUTCOME (2026-06-11):** Next 14.2 + output:'export' rejects empty generateStaticParams (build error). Fixed with a noindex placeholder slug 'partner-offers-coming-soon' emitted only when no landings exist (commit <SHA>).

**Files:**
- Create: `app/[slug]/page.tsx`
- Create: `app/partners/examples/campaign/page.tsx` (noindex visual reference, mirrors existing `examples/focus` pattern — lets us see the template even with 0 approved programs)

- [ ] **Step 1: Write the dynamic route**

```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CampaignLanding } from '@/components/landings/CampaignLanding';
import { getPartnerLandingBySlug, getPartnerLandings } from '@/lib/partnerLandings';

// Static export: only slugs from generateStaticParams are built; anything else 404s.
export const dynamicParams = false;

export function generateStaticParams() {
  return getPartnerLandings().map((e) => ({ slug: e.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const landing = getPartnerLandingBySlug(params.slug);
  if (!landing) return {};
  return {
    title: landing.content?.metaTitle ?? `${landing.program.name} — aibuzz.world`,
    description:
      landing.content?.metaDescription ?? landing.content?.subheadline ?? landing.program.name,
  };
}

export default function PartnerCampaignPage({ params }: { params: { slug: string } }) {
  const landing = getPartnerLandingBySlug(params.slug);
  if (!landing) notFound();
  return <CampaignLanding landing={landing} />;
}
```

- [ ] **Step 2: Write the example page (fixed sample data, noindex)**

```tsx
import type { Metadata } from 'next';
import { CampaignLanding } from '@/components/landings/CampaignLanding';
import type { PartnerLanding } from '@/lib/partnerLandings';

export const metadata: Metadata = {
  title: 'Landing template: Campaign',
  description: 'Full campaign landing layout (example).',
  robots: { index: false, follow: false },
};

const SAMPLE: PartnerLanding = {
  slug: 'example-campaign',
  path: '/example-campaign',
  gotolink: 'https://example.com',
  program: {
    name: 'Example AI Suite',
    description: null,
    siteUrl: 'https://example.com',
    image: null,
    categories: [{ id: 1, name: 'AI tools' }],
  },
  content: {
    headline: 'Ship work twice as fast with Example AI Suite',
    subheadline: 'One workspace for writing, research, and automation — powered by AI.',
    intro:
      'Example AI Suite bundles a writing assistant, a research copilot, and workflow automation into one subscription. This sample copy shows how generated content renders.',
    benefits: [
      { title: 'All-in-one workspace', description: 'Writing, research, and automation without switching tabs.' },
      { title: 'Team-ready', description: 'Shared prompts, templates, and usage controls for teams.' },
      { title: 'Private by default', description: 'Your data is never used to train third-party models.' },
      { title: 'Generous free tier', description: 'Try every core feature before paying anything.' },
    ],
    howItWorks: ['Create a free account', 'Connect your docs and tools', 'Automate your first workflow'],
    faq: [
      { question: 'Is there a free plan?', answer: 'Yes, the core features are free forever.' },
      { question: 'Can I cancel anytime?', answer: 'Yes, subscriptions are monthly with no lock-in.' },
      { question: 'Does it work in my language?', answer: 'It supports 30+ languages including English.' },
    ],
    ctaLabel: 'Try Example AI Suite',
    metaTitle: 'Example AI Suite review',
    metaDescription: 'Sample landing page.',
  },
};

export default function PartnersExampleCampaignPage() {
  return <CampaignLanding landing={SAMPLE} />;
}
```

- [ ] **Step 3: Build and verify**

Run: `yarn build 2>&1 | tail -20 && ls out/partners/examples/campaign/ && jq -r '.entries[] | select(.admitad.gotolink) | .slug' content/admitad-landings.json | head`
Expected: build succeeds; `index.html` exists in the example dir; for each printed slug, `out/<slug>/index.html` also exists (check with `ls out/<slug>/`). If 0 approved programs: build must still succeed with just the example page.

- [ ] **Step 4: Verify the tracking link is in the built page (only if ≥1 approved program)**

Run: `slug=$(jq -r '[.entries[] | select(.admitad.gotolink)][0].slug' content/admitad-landings.json) && grep -o 'https://ad\.admitad\.com[^"]*' "out/$slug/index.html" | head -2`
Expected: the Admitad tracking URL appears (CTA href). FAILURE = no match.

- [ ] **Step 5: Verify existing routes still build**

Run: `ls out/index.html out/tools/index.html out/blog/index.html out/about/index.html`
Expected: all four exist.

- [ ] **Step 6: Commit**

```bash
git add app/\[slug\]/page.tsx app/partners/examples/campaign/page.tsx
git commit -m "feat: root-level campaign landing route + template example page"
```

---

### Task 9: Partners index page + sitemap

**Files:**
- Create: `app/partners/page.tsx`
- Modify: `app/sitemap.ts`

- [ ] **Step 1: Write the index page**

```tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { getPartnerLandings } from '@/lib/partnerLandings';

export const metadata: Metadata = {
  title: 'Partner offers — aibuzz.world',
  description: 'Hand-picked partner deals and tools we recommend.',
};

export default function PartnersIndexPage() {
  const landings = getPartnerLandings();
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-2 text-4xl font-bold text-gray-900">Partner offers</h1>
      <p className="mb-10 text-gray-600">
        Tools and services from our partners. Pages may contain affiliate links.
      </p>
      {landings.length === 0 ? (
        <p className="text-gray-500">No partner offers are live yet — check back soon.</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2">
          {landings.map((l) => (
            <li key={l.slug} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <Link href={`/${l.slug}/`} className="block">
                {l.program.image ? (
                  <img src={l.program.image} alt="" className="mb-4 h-10 w-auto object-contain" />
                ) : null}
                <h2 className="font-semibold text-gray-900">{l.content?.headline ?? l.program.name}</h2>
                {l.content?.subheadline ? (
                  <p className="mt-1 text-sm text-gray-600">{l.content.subheadline}</p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
```

- [ ] **Step 2: Add landing pages to the sitemap**

In `app/sitemap.ts`: add the import, fetch the landings, and append their entries.

```ts
import { getPartnerLandings } from '@/lib/partnerLandings'
```

Inside `sitemap()` (after `articlePages`):

```ts
  const partnerLandings = getPartnerLandings()
  const partnerPages: MetadataRoute.Sitemap = [
    ...(partnerLandings.length > 0
      ? [{
          url: `${baseUrl}/partners`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        }]
      : []),
    ...partnerLandings.map((l) => ({
      url: `${baseUrl}/${l.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ]
```

And include `...partnerPages` in the returned array:

```ts
  return [...staticPages, ...toolPages, ...categoryPages, ...articlePages, ...partnerPages]
```

NOTE: `baseUrl` in sitemap.ts is `https://aibuzztools.com` while the worker serves `aibuzz.world`. Pre-existing, site-wide issue — do NOT change it inside this task; it is flagged to the user separately.

- [ ] **Step 3: Build and verify**

Run: `yarn build 2>&1 | tail -5 && ls out/partners/index.html && grep -c '<loc>' out/sitemap.xml`
Expected: build OK, partners index exists, sitemap `<loc>` count ≥ previous count (and includes `/<slug>` URLs when ≥1 program is approved: `grep '<slug-from-task-8>' out/sitemap.xml`).

- [ ] **Step 4: Commit**

```bash
git add app/partners/page.tsx app/sitemap.ts
git commit -m "feat: partners index page and sitemap entries for campaign landings"
```

---

### Task 10: End-to-end verification

- [ ] **Step 1: Full pipeline from scratch**

Run: `yarn partners:sync && yarn build 2>&1 | tail -5`
Expected: fetch reports the approved program count, copy reports `0 generated` (already generated, idempotency proof), build succeeds.

- [ ] **Step 2: Visual check**

Run: `yarn dev` and open `http://localhost:3003/partners/examples/campaign/` plus (if approved) `http://localhost:3003/<slug>/`.
Expected: professional-looking page — hero, benefits grid, numbered how-it-works, expandable FAQ, CTA buttons, disclosure line. Click the CTA on the real page: it must open the `ad.admitad.com` tracking URL.

- [ ] **Step 3: Confirm no regression on the existing site**

Open `http://localhost:3003/` and `http://localhost:3003/tools/`.
Expected: unchanged.

- [ ] **Step 4: Final commit & report**

```bash
git status --short   # everything intentional and committed
```

Report run results to the user, including any programs still `pending` approval. Deploy (`yarn deploy:cloudflare`) only when the user says so.
