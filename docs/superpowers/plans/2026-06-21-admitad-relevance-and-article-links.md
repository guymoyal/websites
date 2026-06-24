# Admitad Relevance Cleanup + Article Affiliate Links — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce ~3,520 auto-generated Admitad merchant pages to a relevant, connectable set (~80–120), de-index the rest, and inject relevant in-content affiliate links into the 26 blog articles.

**Architecture:** Four idempotent Node scripts in a pipeline (classify → connect-list → prune → link), communicating via JSON files in `content/`, matching the existing `partners:*` conventions. Pure logic (keyword prefilter, merchant matching, connect-URL building, allowlist filtering) is extracted into `scripts/lib/*` modules and unit-tested with Node's built-in test runner. The Next.js `app/[slug]` build and Cloudflare worker read generated allowlist/prune files; a new server component renders the article link block.

**Tech Stack:** Node 22 (`node --test`, `node:assert`), Next.js 14 static export, Cloudflare worker (`src/worker.ts`), DeepSeek chat API (`DEEPSEEK_API_KEY`), Admitad data already in `content/admitad-landings.json`.

**Spec:** `docs/superpowers/specs/2026-06-21-admitad-relevance-and-article-links-design.md`

---

## File Structure

**New files:**
- `scripts/lib/relevance.js` — pure keyword prefilter + tier buckets
- `scripts/lib/deepseek.js` — shared DeepSeek JSON-classify helper (extracted pattern)
- `scripts/lib/matching.js` — pure article→merchant matcher
- `scripts/lib/connectUrl.js` — pure Admitad connect-URL builder
- `scripts/lib/allowlist.js` — pure filter helpers (split relevant vs pruned slugs)
- `scripts/classifyRelevantMerchants.js` — Component A
- `scripts/generateConnectList.js` — Component B
- `scripts/prunePartnerPages.js` — Component C
- `scripts/linkArticlesToMerchants.js` — Component D
- `lib/articleAffiliates.ts` — server loader for the render component
- `components/ads/ArticleAffiliatePicks.tsx` — in-content links block
- `tests/relevance.test.js`, `tests/matching.test.js`, `tests/connectUrl.test.js`, `tests/allowlist.test.js`
- Generated data: `content/relevant-merchants.json`, `content/relevant-slugs.json`, `content/connect-list.md`, `content/connect-list.csv`, `content/article-affiliates.json`, `content/.relevance-cache.json`, `src/prunedSlugs.json`

**Modified files:**
- `package.json` — add `test` + `partners:classify` / `partners:connect-list` / `partners:prune` / `partners:link-articles` scripts
- `lib/partnerLandings.ts` — intersect with `content/relevant-slugs.json` allowlist
- `scripts/generateGoRedirects.js` — respect the allowlist when present
- `src/worker.ts` — return `410 Gone` + noindex for pruned slugs
- `app/blog/[slug]/page.tsx` — render `<ArticleAffiliatePicks>` after the body

---

## Task 1: Test runner + shared DeepSeek helper

**Files:**
- Modify: `package.json` (scripts)
- Create: `scripts/lib/deepseek.js`
- Create: `tests/connectUrl.test.js` (smoke test that the runner works — replaced in Task 4)

- [ ] **Step 1: Add the test script to `package.json`**

In the `scripts` block, add:

```json
    "test": "node --test tests/",
```

- [ ] **Step 2: Verify the runner works on an empty suite**

Run: `mkdir -p tests && printf "import {test} from 'node:test';\nimport assert from 'node:assert';\ntest('runner works', () => assert.equal(1,1));\n" > tests/connectUrl.test.js && yarn test`
Expected: PASS — `1 passing` (this placeholder file is overwritten in Task 4).

- [ ] **Step 3: Create the shared DeepSeek helper**

Create `scripts/lib/deepseek.js` (extracts the call + parse pattern from `scripts/analyzeToolWithGemini.js` so A and D share one implementation):

```js
const path = require('path');
require('dotenv').config();
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env.local') });

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';

function parseJson(text) {
  const cleaned = String(text).replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const m = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (m) return JSON.parse(m[0]);
    throw new Error('Could not parse model response as JSON');
  }
}

// Calls DeepSeek with a system+user prompt, retries on failure, returns parsed JSON.
async function classifyJson(systemPrompt, userPrompt, { retries = 2 } = {}) {
  if (!DEEPSEEK_API_KEY) throw new Error('DEEPSEEK_API_KEY missing (set in .env.local)');
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${DEEPSEEK_API_KEY}` },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.2,
          max_tokens: 800,
        }),
      });
      if (!res.ok) throw new Error(`DeepSeek ${res.status}: ${(await res.text()).slice(0, 300)}`);
      const data = await res.json();
      return parseJson(data.choices?.[0]?.message?.content?.trim() || '');
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }
  }
  throw lastErr;
}

module.exports = { classifyJson, parseJson };
```

- [ ] **Step 4: Commit**

```bash
git add package.json scripts/lib/deepseek.js tests/connectUrl.test.js
git commit -m "Add node test runner + shared DeepSeek classify helper"
```

---

## Task 2: Keyword prefilter (pure, TDD)

**Files:**
- Create: `scripts/lib/relevance.js`
- Test: `tests/relevance.test.js`

- [ ] **Step 1: Write the failing test**

Create `tests/relevance.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { merchantText, isRelevant, prefilter } = require('../scripts/lib/relevance.js');

const e = (name, description = '') => ({ slug: name.toLowerCase().replace(/\s+/g, '-'), program: { name, description } });

test('merchantText lowercases name + description', () => {
  assert.equal(merchantText(e('Fiverr', 'Hire FREELANCERS')), 'fiverr hire freelancers');
});

test('isRelevant keeps AI/software at strict tier', () => {
  assert.equal(isRelevant(e('fireflies.ai', 'AI meeting notes'), 'strict'), true);
  assert.equal(isRelevant(e('Alamo US', 'Car rental'), 'strict'), false);
});

test('moderate tier adds hosting/vpn', () => {
  assert.equal(isRelevant(e('Bluehost', 'web hosting and domains'), 'strict'), false);
  assert.equal(isRelevant(e('Bluehost', 'web hosting and domains'), 'moderate'), true);
});

test('broad tier adds electronics/marketplace', () => {
  assert.equal(isRelevant(e('AliExpress WW', 'global marketplace electronics'), 'moderate'), false);
  assert.equal(isRelevant(e('AliExpress WW', 'global marketplace electronics'), 'broad'), true);
});

test('prefilter returns only matching entries for the tier', () => {
  const out = prefilter([e('fireflies.ai', 'AI notes'), e('Alamo US', 'car rental')], 'strict');
  assert.deepEqual(out.map((x) => x.slug), ['fireflies.ai']);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test`
Expected: FAIL — `Cannot find module '../scripts/lib/relevance.js'`

- [ ] **Step 3: Write the implementation**

Create `scripts/lib/relevance.js`:

```js
const CORE = ['ai ', 'a.i', 'artificial intelligence', 'machine learning', 'saas', 'software',
  'app ', ' api', 'automation', 'chatbot', 'gpt', 'no-code', 'no code'];
const ADJ = ['hosting', 'domain', 'vpn', 'cloud', 'website builder', 'wordpress', 'server',
  'cyber', 'security', 'course', 'learning', 'education', 'ebook', 'freelanc', 'design',
  'template', 'stock photo', 'marketing', 'seo', 'email', 'crm', 'analytics'];
const GADGET = ['electronics', 'gadget', 'laptop', 'computer', 'tech', 'marketplace',
  'aliexpress', 'amazon', 'gearbest', 'banggood'];

const TIERS = { strict: CORE, moderate: [...CORE, ...ADJ], broad: [...CORE, ...ADJ, ...GADGET] };

function merchantText(entry) {
  return `${entry?.program?.name || ''} ${entry?.program?.description || ''}`.toLowerCase().trim();
}

function isRelevant(entry, tier = 'broad') {
  const keys = TIERS[tier] || TIERS.broad;
  const text = merchantText(entry);
  return keys.some((k) => text.includes(k));
}

function prefilter(entries, tier = 'broad') {
  return entries.filter((e) => isRelevant(e, tier));
}

module.exports = { merchantText, isRelevant, prefilter, TIERS };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn test`
Expected: PASS — all 5 `relevance` tests green.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/relevance.js tests/relevance.test.js
git commit -m "Add keyword relevance prefilter with tiers"
```

---

## Task 3: Relevance classifier script (Component A)

**Files:**
- Create: `scripts/classifyRelevantMerchants.js`
- Modify: `package.json` (add `partners:classify`)

- [ ] **Step 1: Add the package script**

In `package.json` scripts, add:

```json
    "partners:classify": "node scripts/classifyRelevantMerchants.js",
```

- [ ] **Step 2: Write the classifier**

Create `scripts/classifyRelevantMerchants.js`. It prefilters to the Broad tier, LLM-verifies each candidate (cached by slug), and writes `content/relevant-merchants.json`. Supports `--dry` (prefilter only, no LLM) and `--tier=broad|moderate|strict`.

```js
const fs = require('fs');
const path = require('path');
const { prefilter } = require('./lib/relevance.js');
const { classifyJson } = require('./lib/deepseek.js');

const ROOT = path.join(__dirname, '..');
const LANDINGS = path.join(ROOT, 'content', 'admitad-landings.json');
const OUT = path.join(ROOT, 'content', 'relevant-merchants.json');
const CACHE = path.join(ROOT, 'content', '.relevance-cache.json');

const CATEGORIES = ['Writing & Content', 'Design & Creative', 'Productivity', 'Development',
  'Marketing', 'Business', 'Education', 'Audio & Video', 'General'];

const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const tier = (args.find((a) => a.startsWith('--tier=')) || '--tier=broad').split('=')[1];

const SYSTEM = 'You classify affiliate merchants for an AI-tools blog. Reply with valid JSON only, no markdown.';
const prompt = (name, desc) =>
  `Merchant: "${name}". Description: "${desc || 'n/a'}".\n` +
  `Is this genuinely relevant to an audience reading about AI tools, software, and productivity? ` +
  `Reply JSON: {"relevant": boolean, "category": one of ${JSON.stringify(CATEGORIES)}, ` +
  `"anchorIdeas": string[2-3], "reason": string}.`;

function readJson(p, fallback) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return fallback; }
}
function writeAtomic(p, data) {
  const tmp = `${p}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, p);
}

async function main() {
  const payload = readJson(LANDINGS, null);
  const entries = Array.isArray(payload?.entries) ? payload.entries : [];
  if (!entries.length) throw new Error(`No entries in ${LANDINGS}`);

  const candidates = prefilter(entries, tier).filter((e) => e?.admitad?.gotolink && e?.slug);
  console.log(`[classify] tier=${tier} candidates=${candidates.length} of ${entries.length}`);

  if (DRY) {
    candidates.forEach((e) => console.log('  -', e.program?.name));
    console.log('[classify] dry run — no LLM calls, no file written');
    return;
  }

  const cache = readJson(CACHE, {});
  const relevant = [];
  for (const e of candidates) {
    let verdict = cache[e.slug];
    if (!verdict) {
      try {
        verdict = await classifyJson(SYSTEM, prompt(e.program?.name, e.program?.description));
      } catch (err) {
        console.warn(`  ! ${e.slug}: ${err.message} (skipped)`);
        verdict = { relevant: null };
      }
      cache[e.slug] = verdict;
      writeAtomic(CACHE, cache); // persist incrementally so reruns resume
    }
    if (verdict.relevant === true) {
      relevant.push({
        slug: e.slug,
        name: e.program?.name ?? e.slug,
        gotolink: e.admitad.gotolink,
        connectionStatus: e.admitad.connectionStatus ?? null,
        campaignId: e.admitad.campaignId ?? null,
        websiteId: e.admitad.websiteId ?? null,
        category: verdict.category ?? 'General',
        anchorIdeas: verdict.anchorIdeas ?? [],
      });
    }
  }
  relevant.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  writeAtomic(OUT, relevant);
  console.log(`[classify] wrote ${relevant.length} relevant merchants to ${OUT}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 3: Verify dry run (no API spend)**

Run: `yarn partners:classify --dry --tier=strict`
Expected: prints `candidates=~32 of 3520` and a merchant list; no file written.

- [ ] **Step 4: Run the real classification**

Run: `yarn partners:classify --tier=broad`
Expected: progress log, `content/relevant-merchants.json` written with ~80–120 entries, `content/.relevance-cache.json` created. (Requires `DEEPSEEK_API_KEY` in `.env.local`.)

- [ ] **Step 5: Commit (code + cache, not the generated data yet)**

```bash
echo "content/.relevance-cache.json" >> .gitignore
git add package.json scripts/classifyRelevantMerchants.js content/relevant-merchants.json .gitignore
git commit -m "Add relevance classifier (Component A)"
```

---

## Task 4: Connect-URL builder + connect-list generator (Component B)

**Files:**
- Create: `scripts/lib/connectUrl.js`
- Test: `tests/connectUrl.test.js` (overwrites the Task 1 placeholder)
- Create: `scripts/generateConnectList.js`
- Modify: `package.json` (add `partners:connect-list`)

- [ ] **Step 1: Write the failing test**

Overwrite `tests/connectUrl.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { connectUrl } = require('../scripts/lib/connectUrl.js');

test('builds store connect URL from campaign + website id', () => {
  assert.equal(
    connectUrl({ campaignId: 6115, websiteId: 2951457 }),
    'https://store.admitad.com/en/webmaster/websites/2951457/ad/6115/'
  );
});

test('falls back to ids parsed from slug when fields missing', () => {
  assert.equal(
    connectUrl({ slug: 'aliexpress-ww-c6115-w2951457' }),
    'https://store.admitad.com/en/webmaster/websites/2951457/ad/6115/'
  );
});

test('returns null when ids cannot be determined', () => {
  assert.equal(connectUrl({ slug: 'no-ids-here' }), null);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test`
Expected: FAIL — `Cannot find module '../scripts/lib/connectUrl.js'`

- [ ] **Step 3: Write the implementation**

Create `scripts/lib/connectUrl.js`:

```js
// Builds the Admitad store page where the publisher joins a program.
// Prefers explicit campaign/website ids; falls back to the slug suffix `cNNNN-wNNNN`.
function connectUrl(merchant) {
  let campaignId = merchant.campaignId;
  let websiteId = merchant.websiteId;
  if (!campaignId || !websiteId) {
    const m = String(merchant.slug || '').match(/c(\d+)-w(\d+)/);
    if (m) { campaignId = campaignId || Number(m[1]); websiteId = websiteId || Number(m[2]); }
  }
  if (!campaignId || !websiteId) return null;
  return `https://store.admitad.com/en/webmaster/websites/${websiteId}/ad/${campaignId}/`;
}

module.exports = { connectUrl };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn test`
Expected: PASS — `connectUrl` tests green.

- [ ] **Step 5: Add the package script + write the generator**

In `package.json` add:

```json
    "partners:connect-list": "node scripts/generateConnectList.js",
```

Create `scripts/generateConnectList.js`:

```js
const fs = require('fs');
const path = require('path');
const { connectUrl } = require('./lib/connectUrl.js');

const ROOT = path.join(__dirname, '..');
const IN = path.join(ROOT, 'content', 'relevant-merchants.json');
const MD = path.join(ROOT, 'content', 'connect-list.md');
const CSV = path.join(ROOT, 'content', 'connect-list.csv');

const merchants = JSON.parse(fs.readFileSync(IN, 'utf8'));
const pending = merchants.filter((m) => m.connectionStatus !== 'active');

let md = `# Admitad connect-list (${pending.length} programs to join)\n\n` +
  `Connect these in the Admitad store, then run \`yarn partners:fetch\` to refresh status.\n\n`;
let csv = 'category,name,status,connectUrl\n';
let lastCat = '';
for (const m of merchants.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name))) {
  if (m.category !== lastCat) { md += `\n## ${m.category}\n\n`; lastCat = m.category; }
  const url = connectUrl(m) || '(id unknown — search in store)';
  const status = m.connectionStatus === 'active' ? '✅ connected' : '⬜ join';
  md += `- ${status} **${m.name}** — ${url}\n`;
  csv += `${JSON.stringify(m.category)},${JSON.stringify(m.name)},${m.connectionStatus || 'none'},${JSON.stringify(url)}\n`;
}
fs.writeFileSync(MD, md);
fs.writeFileSync(CSV, csv);
console.log(`[connect-list] wrote ${merchants.length} merchants (${pending.length} pending) to connect-list.md/.csv`);
```

- [ ] **Step 6: Run it**

Run: `yarn partners:connect-list`
Expected: `content/connect-list.md` + `.csv` written, grouped by category. Open `connect-list.md` and confirm the connect URLs resolve to real Admitad store pages.

- [ ] **Step 7: Commit**

```bash
git add scripts/lib/connectUrl.js tests/connectUrl.test.js scripts/generateConnectList.js package.json content/connect-list.md content/connect-list.csv
git commit -m "Add connect-list generator (Component B)"
```

---

## Task 5: Allowlist filter (pure, TDD)

**Files:**
- Create: `scripts/lib/allowlist.js`
- Test: `tests/allowlist.test.js`

- [ ] **Step 1: Write the failing test**

Create `tests/allowlist.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { splitSlugs } = require('../scripts/lib/allowlist.js');

test('splits entry slugs into kept (relevant) and pruned', () => {
  const entries = [{ slug: 'a' }, { slug: 'b' }, { slug: 'c' }];
  const { keep, prune } = splitSlugs(entries, ['a', 'c']);
  assert.deepEqual(keep, ['a', 'c']);
  assert.deepEqual(prune, ['b']);
});

test('relevant slug not present in entries is ignored, not kept', () => {
  const { keep, prune } = splitSlugs([{ slug: 'a' }], ['a', 'zzz']);
  assert.deepEqual(keep, ['a']);
  assert.deepEqual(prune, []);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test`
Expected: FAIL — `Cannot find module '../scripts/lib/allowlist.js'`

- [ ] **Step 3: Write the implementation**

Create `scripts/lib/allowlist.js`:

```js
// Given all landing entries and the set of relevant slugs, return which slugs to
// keep (intersection) and which to prune (everything else).
function splitSlugs(entries, relevantSlugs) {
  const relevant = new Set(relevantSlugs);
  const keep = [];
  const prune = [];
  for (const e of entries) {
    if (!e?.slug) continue;
    if (relevant.has(e.slug)) keep.push(e.slug);
    else prune.push(e.slug);
  }
  return { keep, prune };
}

module.exports = { splitSlugs };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn test`
Expected: PASS — `allowlist` tests green.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/allowlist.js tests/allowlist.test.js
git commit -m "Add allowlist split helper"
```

---

## Task 6: Pruner script + allowlist wiring (Component C)

**Files:**
- Create: `scripts/prunePartnerPages.js`
- Modify: `package.json` (add `partners:prune`)
- Modify: `lib/partnerLandings.ts`
- Modify: `scripts/generateGoRedirects.js`

- [ ] **Step 1: Add the package script + write the pruner**

In `package.json` add:

```json
    "partners:prune": "node scripts/prunePartnerPages.js",
```

Create `scripts/prunePartnerPages.js`:

```js
const fs = require('fs');
const path = require('path');
const { splitSlugs } = require('./lib/allowlist.js');

const ROOT = path.join(__dirname, '..');
const LANDINGS = path.join(ROOT, 'content', 'admitad-landings.json');
const RELEVANT = path.join(ROOT, 'content', 'relevant-merchants.json');
const ALLOWLIST = path.join(ROOT, 'content', 'relevant-slugs.json');
const PRUNED = path.join(ROOT, 'src', 'prunedSlugs.json');

function writeAtomic(p, data) {
  const tmp = `${p}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data));
  fs.renameSync(tmp, p);
}

const payload = JSON.parse(fs.readFileSync(LANDINGS, 'utf8'));
const entries = Array.isArray(payload?.entries) ? payload.entries : [];
const relevant = JSON.parse(fs.readFileSync(RELEVANT, 'utf8'));
if (!relevant.length) throw new Error('relevant-merchants.json is empty — refusing to prune every page');

const { keep, prune } = splitSlugs(entries, relevant.map((m) => m.slug));
writeAtomic(ALLOWLIST, keep);
writeAtomic(PRUNED, prune);
console.log(`[prune] keep=${keep.length} prune=${prune.length}`);
console.log('[prune] now run: yarn partners:redirects && yarn build');
```

- [ ] **Step 2: Run the pruner**

Run: `yarn partners:prune`
Expected: writes `content/relevant-slugs.json` (~80–120 slugs) and `src/prunedSlugs.json` (~3,400 slugs); logs counts.

- [ ] **Step 3: Wire the allowlist into `lib/partnerLandings.ts`**

In `lib/partnerLandings.ts`, after the `DATA_FILE` constant (line ~34), add the allowlist loader and apply it inside `getPartnerLandings()`. Replace the existing `getPartnerLandings` filter so it also intersects the allowlist when the file exists:

```ts
const ALLOWLIST_FILE = path.join(process.cwd(), 'content', 'relevant-slugs.json');

function loadAllowlist(): Set<string> | null {
  try {
    const slugs = JSON.parse(fs.readFileSync(ALLOWLIST_FILE, 'utf8')) as string[];
    return Array.isArray(slugs) && slugs.length ? new Set(slugs) : null;
  } catch {
    return null; // no allowlist yet → behave as before (all entries)
  }
}
```

Then in `getPartnerLandings()`, change the `.filter(...)` line to:

```ts
  const allow = loadAllowlist();
  return entries
    .filter((e) => e?.admitad?.gotolink && e?.slug && (!allow || allow.has(e.slug)))
```

(Leave the rest of the `.map(...).sort(...)` chain unchanged.)

- [ ] **Step 4: Wire the allowlist into `scripts/generateGoRedirects.js`**

In `scripts/generateGoRedirects.js`, after `const entries = ...` (line ~17), add:

```js
let allow = null;
try {
  const slugs = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'content', 'relevant-slugs.json'), 'utf8'));
  if (Array.isArray(slugs) && slugs.length) allow = new Set(slugs);
} catch { /* no allowlist → emit all, unchanged behavior */ }
```

Then inside the `for (const e of entries)` loop, at the top, add:

```js
  if (allow && !allow.has(e.slug)) { skipped++; continue; }
```

- [ ] **Step 5: Regenerate redirects and verify counts**

Run: `yarn partners:redirects && node -e "console.log('goLinks slugs:', Object.keys(require('./src/goLinks.json')).length)"`
Expected: `goLinks slugs:` now ~80–120 (down from 3,520), confirming the allowlist applies.

- [ ] **Step 6: Commit**

```bash
git add scripts/prunePartnerPages.js package.json lib/partnerLandings.ts scripts/generateGoRedirects.js content/relevant-slugs.json src/prunedSlugs.json src/goLinks.json
git commit -m "Prune partner pages to relevant allowlist (Component C)"
```

---

## Task 7: Worker returns 410 for pruned slugs

**Files:**
- Modify: `src/worker.ts`

- [ ] **Step 1: Import the pruned-slug list and add 410 handling**

In `src/worker.ts`, add the import at the top (next to `import goLinks`):

```ts
import prunedSlugs from './prunedSlugs.json';

const prunedSet = new Set(prunedSlugs as string[]);
```

Then, after the `/go/` block and before the `/api/` block, add:

```ts
    // De-indexed merchant pages: return 410 Gone (not soft-404) so search engines
    // drop the ~3,400 pruned partner landing pages cleanly.
    const slugMatch = url.pathname.match(/^\/([^/]+)\/?$/);
    if (slugMatch && prunedSet.has(decodeURIComponent(slugMatch[1]))) {
      return new Response('Gone', {
        status: 410,
        headers: { 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store' },
      });
    }
```

- [ ] **Step 2: Type-check the worker**

Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | head -20 || true`
Expected: no new errors referencing `worker.ts` or `prunedSlugs.json`. (If `resolveJsonModule` is needed, it is already used for `goLinks.json`, so the import resolves.)

- [ ] **Step 3: Verify behavior locally**

Run: `yarn cf:dev` in one terminal, then in another: `curl -sI http://localhost:8787/alamo-us-2 | head -3 && curl -sI http://localhost:8787/go/aliexpress-ww-c6115-w2951457/ | head -3`
Expected: the pruned slug returns `HTTP/1.1 410`; the `/go/` slug returns `HTTP/1.1 302`. Stop the dev server after.

- [ ] **Step 4: Commit**

```bash
git add src/worker.ts
git commit -m "Worker returns 410 Gone for pruned partner slugs"
```

---

## Task 8: Article→merchant matcher (pure, TDD)

**Files:**
- Create: `scripts/lib/matching.js`
- Test: `tests/matching.test.js`

- [ ] **Step 1: Write the failing test**

Create `tests/matching.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { scoreMerchant, matchMerchants } = require('../scripts/lib/matching.js');

const article = { category: 'Design & Creative', keywords: ['ai logo design', 'design tools'] };
const m = (name, category, anchorIdeas = [], connectionStatus = 'active') =>
  ({ slug: name, name, category, anchorIdeas, connectionStatus });

test('same category scores higher than keyword-only match', () => {
  const same = scoreMerchant(article, m('Canva', 'Design & Creative', ['design templates']));
  const kw = scoreMerchant(article, m('Fiverr', 'Business', ['logo design gigs']));
  assert.ok(same > kw);
});

test('matchMerchants returns at most `limit`, only active merchants', () => {
  const merchants = [
    m('Canva', 'Design & Creative'),
    m('Picsart', 'Design & Creative'),
    m('Fiverr', 'Design & Creative'),
    m('Pending', 'Design & Creative', [], 'pending'),
  ];
  const out = matchMerchants(article, merchants, 3);
  assert.equal(out.length, 3);
  assert.ok(!out.find((x) => x.slug === 'Pending'));
});

test('returns empty when no merchant is relevant', () => {
  const out = matchMerchants(article, [m('CarRental', 'General', [], 'active')], 3);
  assert.deepEqual(out, []);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test`
Expected: FAIL — `Cannot find module '../scripts/lib/matching.js'`

- [ ] **Step 3: Write the implementation**

Create `scripts/lib/matching.js`:

```js
function tokens(s) {
  return String(s || '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

// Higher = better fit. Category match is worth more than keyword overlap.
function scoreMerchant(article, merchant) {
  let score = 0;
  if (merchant.category && merchant.category === article.category) score += 10;
  const haystack = new Set([
    ...tokens(merchant.name),
    ...(merchant.anchorIdeas || []).flatMap(tokens),
    ...tokens(merchant.category),
  ]);
  for (const kw of article.keywords || []) {
    for (const t of tokens(kw)) if (haystack.has(t)) score += 1;
  }
  return score;
}

// Returns up to `limit` active merchants with score > 0, best first.
function matchMerchants(article, merchants, limit = 3) {
  return merchants
    .filter((m) => m.connectionStatus === 'active')
    .map((m) => ({ m, score: scoreMerchant(article, m) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.m);
}

module.exports = { scoreMerchant, matchMerchants, tokens };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn test`
Expected: PASS — `matching` tests green.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/matching.js tests/matching.test.js
git commit -m "Add article-to-merchant matcher (pure)"
```

---

## Task 9: Article linker script (Component D)

**Files:**
- Create: `scripts/linkArticlesToMerchants.js`
- Modify: `package.json` (add `partners:link-articles`)

- [ ] **Step 1: Add the package script + write the linker**

In `package.json` add:

```json
    "partners:link-articles": "node scripts/linkArticlesToMerchants.js",
```

Create `scripts/linkArticlesToMerchants.js`. It matches each published article to ≤3 active relevant merchants, asks the LLM for natural anchor text + a one-line blurb per pick (cached), and writes `content/article-affiliates.json`. Supports `--dry`.

```js
const fs = require('fs');
const path = require('path');
const { matchMerchants } = require('./lib/matching.js');
const { classifyJson } = require('./lib/deepseek.js');

const ROOT = path.join(__dirname, '..');
const ARTICLES = path.join(ROOT, 'content', 'articles.json');
const RELEVANT = path.join(ROOT, 'content', 'relevant-merchants.json');
const OUT = path.join(ROOT, 'content', 'article-affiliates.json');

const DRY = process.argv.slice(2).includes('--dry');
const SYSTEM = 'You write concise, honest affiliate CTA copy. Reply with valid JSON only.';

function writeAtomic(p, data) {
  const tmp = `${p}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, p);
}

async function copyFor(article, merchant) {
  if (DRY) return { anchorText: merchant.name, blurb: '' };
  try {
    const v = await classifyJson(
      SYSTEM,
      `Article: "${article.title}" (about ${article.category}). Merchant: "${merchant.name}" ` +
      `(${(merchant.anchorIdeas || []).join(', ') || 'n/a'}). Write JSON ` +
      `{"anchorText": <=6 words, "blurb": one sentence <=18 words} recommending this merchant to the reader.`
    );
    return { anchorText: v.anchorText || merchant.name, blurb: v.blurb || '' };
  } catch {
    return { anchorText: merchant.name, blurb: '' };
  }
}

async function main() {
  const articles = JSON.parse(fs.readFileSync(ARTICLES, 'utf8')).filter((a) => a.status === 'published');
  const merchants = JSON.parse(fs.readFileSync(RELEVANT, 'utf8'));
  const activeCount = merchants.filter((m) => m.connectionStatus === 'active').length;
  console.log(`[link] ${articles.length} articles, ${activeCount} active merchants`);
  if (!activeCount) console.warn('[link] WARNING: 0 active merchants — connect programs first or output will be empty');

  const map = {};
  for (const a of articles) {
    const picks = matchMerchants(a, merchants, 3);
    if (!picks.length) continue;
    map[a.slug] = [];
    for (const m of picks) {
      const copy = await copyFor(a, m);
      map[a.slug].push({ slug: m.slug, name: m.name, anchorText: copy.anchorText, blurb: copy.blurb });
    }
    console.log(`  ${a.slug}: ${picks.map((p) => p.name).join(', ')}`);
  }
  writeAtomic(OUT, map);
  console.log(`[link] wrote ${Object.keys(map).length} article→merchant maps to ${OUT}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 2: Dry run (no API spend, shows matches)**

Run: `yarn partners:link-articles --dry`
Expected: prints each article and its matched merchant names; writes `article-affiliates.json` with merchant names as anchor text. (If 0 active merchants, the map is empty — expected until programs are connected.)

- [ ] **Step 3: Real run (after merchants are connected)**

Run: `yarn partners:link-articles`
Expected: `content/article-affiliates.json` with LLM anchor text + blurbs for articles that matched.

- [ ] **Step 4: Commit**

```bash
git add scripts/linkArticlesToMerchants.js package.json content/article-affiliates.json
git commit -m "Add article-to-merchant linker (Component D)"
```

---

## Task 10: Render the in-content links block

**Files:**
- Create: `lib/articleAffiliates.ts`
- Create: `components/ads/ArticleAffiliatePicks.tsx`
- Modify: `app/blog/[slug]/page.tsx`

- [ ] **Step 1: Write the server loader**

Create `lib/articleAffiliates.ts`:

```ts
import fs from 'fs';
import path from 'path';

export interface ArticleAffiliate {
  slug: string;
  name: string;
  anchorText: string;
  blurb: string;
}

const DATA_FILE = path.join(process.cwd(), 'content', 'article-affiliates.json');

export function getArticleAffiliates(articleSlug: string): ArticleAffiliate[] {
  try {
    const map = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) as Record<string, ArticleAffiliate[]>;
    return Array.isArray(map[articleSlug]) ? map[articleSlug] : [];
  } catch {
    return [];
  }
}
```

- [ ] **Step 2: Write the component**

Create `components/ads/ArticleAffiliatePicks.tsx`:

```tsx
import { getArticleAffiliates } from '@/lib/articleAffiliates';

export default function ArticleAffiliatePicks({ articleSlug }: { articleSlug: string }) {
  const picks = getArticleAffiliates(articleSlug);
  if (!picks.length) return null;
  return (
    <aside aria-label="Recommended tools" style={{ margin: '2rem 0', padding: '1rem 1.25rem', border: '1px solid #eee', borderRadius: 12 }}>
      <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.6, margin: '0 0 .75rem' }}>
        Recommended tools · affiliate
      </p>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '.75rem' }}>
        {picks.map((p) => (
          <li key={p.slug}>
            <a href={`/go/${p.slug}/`} rel="sponsored nofollow" style={{ fontWeight: 600 }}>
              {p.anchorText}
            </a>
            {p.blurb ? <span style={{ opacity: 0.75 }}> — {p.blurb}</span> : null}
          </li>
        ))}
      </ul>
    </aside>
  );
}
```

- [ ] **Step 3: Wire it into the article page**

In `app/blog/[slug]/page.tsx`, add the import near the other ad imports (line ~7):

```tsx
import ArticleAffiliatePicks from '@/components/ads/ArticleAffiliatePicks';
```

Then, immediately after the article body `<div dangerouslySetInnerHTML={{ __html: htmlContent }} />` (around line 211) and before the trailing `<ResidualDisplayAd>` (line ~215), add:

```tsx
        <ArticleAffiliatePicks articleSlug={article.slug} />
```

- [ ] **Step 4: Type-check + build**

Run: `yarn build 2>&1 | tail -25`
Expected: build succeeds; page count drops sharply. Then:
Run: `find out -name '*.html' | wc -l`
Expected: roughly `(~80–120 partner) + 26 articles + ~75 other ≈ ~200` HTML files (down from ~3,623).

- [ ] **Step 5: Visual check**

Run: `yarn dev` then open an article that has matches (e.g. one printed by Task 9). Confirm the "Recommended tools · affiliate" block renders with working `/go/<slug>/` links. Stop the dev server.

- [ ] **Step 6: Commit**

```bash
git add lib/articleAffiliates.ts components/ads/ArticleAffiliatePicks.tsx app/blog/[slug]/page.tsx
git commit -m "Render in-content affiliate links on articles (Component D render)"
```

---

## Task 11: Final verification

- [ ] **Step 1: Run the full test suite**

Run: `yarn test`
Expected: all suites pass (`relevance`, `connectUrl`, `allowlist`, `matching`).

- [ ] **Step 2: Confirm the end-to-end page-count reduction**

Run: `find out -name '*.html' | wc -l`
Expected: ~200 (not ~3,623).

- [ ] **Step 3: Confirm goLinks + sitemap shrank**

Run: `node -e "console.log('go:', Object.keys(require('./src/goLinks.json')).length)"` and check the built sitemap has only relevant partner URLs.
Expected: `go:` ~80–120.

- [ ] **Step 4: Spot-check a 410**

Run: `grep -c '"' src/prunedSlugs.json` (rough count) and confirm a known irrelevant slug (e.g. `alamo-us-2`) is present in `src/prunedSlugs.json`.
Expected: present → worker will 410 it.

---

## Operational runbook (order to actually run, post-implementation)

1. `yarn partners:classify --dry --tier=broad` → sanity-check candidates
2. `yarn partners:classify --tier=broad` → `relevant-merchants.json`
3. `yarn partners:connect-list` → join the programs in the Admitad store
4. `yarn partners:fetch` → refresh `connectionStatus: active`
5. `yarn partners:prune && yarn partners:redirects` → allowlist + goLinks + pruned-slugs
6. `yarn partners:link-articles` → `article-affiliates.json`
7. `yarn build` → verify ~200 pages → deploy (`wrangler deploy`)

Re-run 2→7 whenever you connect more programs or add articles.

---

## Notes on testing scope

There is no pre-existing test framework. This plan uses Node's built-in `node --test`
(no new dependencies) and applies TDD to the **pure, high-risk logic**: keyword
relevance, connect-URL building, allowlist splitting, and article→merchant matching.
Network/LLM scripts (A, D) are thin orchestration over those tested helpers and are
verified via `--dry` runs. The Next.js render and Cloudflare worker are verified by
`yarn build`, `yarn cf:dev` + `curl`, and a visual dev check, since the repo has no
component/worker test harness and adding one is out of scope for this work.
