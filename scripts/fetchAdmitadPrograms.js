#!/usr/bin/env node
/**
 * Fetch Admitad programs for landing-page JSON (paths + tracking links + metadata).
 *
 * Modes (ADMIT_FETCH_MODE):
 * - connected (default): each ad space → GET /advcampaigns/website/{w_id}/ (programs tied to that space; usually has gotolink when active).
 * - catalog: GET /advcampaigns/?website={id} — same catalog as the store “public programs” list for that ad space (needs scope `advcampaigns`).
 *   Your store URL …/websites/2951457/… → set ADMIT_WEBSITE_ID=2951457
 *
 * Docs: https://developers.mitgo.com/hc/en-us/articles/34481349447058-Affiliate-programs
 *
 * Usage:
 *   yarn fetch:admitad
 *   ADMIT_FETCH_MODE=catalog ADMIT_WEBSITE_ID=2951457 yarn fetch:admitad
 *
 * Env:
 *   ADMIT_CLIENT_ID, ADMIT_CLIENT_SECRET | ADMIT_BASE64_HEADER
 *   ADMIT_SCOPE — optional override (must include scopes your app has).
 *   ADMIT_FETCH_MODE — connected | catalog
 *   ADMIT_WEBSITE_ID — required for catalog; optional filter for connected mode
 *   ADMIT_CATALOG_RESOLVE_LINKS — true: per program GET /advcampaigns/{id}/website/{w_id}/ to fill missing gotolink (slow; rate limits)
 *   ADMIT_ENRICH_GOTOLINK — default on (connected mode): same detail GET when list row has no gotolink; set "false" to disable.
 *   ADMIT_INCLUDE_PROGRAMS_WITHOUT_LINK — true: catalog rows even when gotolink is still null (for stubs / join later)
 *   ADMIT_DETAIL_DELAY_MS — ms between detail calls when resolving (default 200)
 *   ADMIT_SKIP_CONNECTION_FILTER, ADMIT_DEBUG, ADMIT_API_BASE, ADMIT_LANDING_PATH_PREFIX, ADMIT_LANGUAGE, ADMIT_PAGE_LIMIT
 */
const fs = require('fs');
const path = require('path');
const slugify = require('slugify');

require('dotenv').config();
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const ADMIT_API_BASE = (process.env.ADMIT_API_BASE || 'https://api.admitad.com').replace(/\/$/, '');
const PATH_PREFIX = (process.env.ADMIT_LANDING_PATH_PREFIX !== undefined
  ? process.env.ADMIT_LANDING_PATH_PREFIX
  : '/partners'
).replace(/\/$/, '');
const OUTPUT = path.join(__dirname, '..', 'content', 'admitad-landings.json');

function getTokenScopes() {
  if (process.env.ADMIT_SCOPE) return process.env.ADMIT_SCOPE;
  const mode = (process.env.ADMIT_FETCH_MODE || 'connected').toLowerCase();
  if (mode === 'catalog') return 'websites advcampaigns advcampaigns_for_website';
  return 'websites advcampaigns_for_website';
}

function debugLog(...args) {
  if (process.env.ADMIT_DEBUG === '1' || process.env.ADMIT_DEBUG === 'true') {
    console.log('[admitad]', ...args);
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function getBasicAuthHeader() {
  const id = process.env.ADMIT_CLIENT_ID;
  const secret = process.env.ADMIT_CLIENT_SECRET;
  const precomputed = process.env.ADMIT_BASE64_HEADER;

  if (id && secret) {
    return `Basic ${Buffer.from(`${id}:${secret}`, 'utf8').toString('base64')}`;
  }
  if (id && precomputed) {
    const token = String(precomputed).replace(/^Basic\s+/i, '').trim();
    return `Basic ${token}`;
  }
  return null;
}

async function fetchToken() {
  const clientId = process.env.ADMIT_CLIENT_ID;
  if (!clientId) {
    throw new Error(
      'Missing ADMIT_CLIENT_ID. Set ADMIT_CLIENT_ID and ADMIT_CLIENT_SECRET (or ADMIT_BASE64_HEADER).'
    );
  }

  const authHeader = getBasicAuthHeader();
  if (!authHeader) {
    throw new Error(
      'Need either (ADMIT_CLIENT_ID + ADMIT_CLIENT_SECRET) or (ADMIT_CLIENT_ID + ADMIT_BASE64_HEADER) for token request.'
    );
  }

  const scope = getTokenScopes();
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    scope,
  });

  const res = await fetch(`${ADMIT_API_BASE}/token/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: authHeader,
    },
    body: body.toString(),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Admitad token ${res.status}: ${text.slice(0, 500)}`);
  }
  const data = JSON.parse(text);
  if (!data.access_token) {
    throw new Error(`Admitad token response missing access_token: ${text.slice(0, 300)}`);
  }
  return data.access_token;
}

/**
 * Admitad mixes response shapes: some endpoints return `{ results, _meta }`,
 * others (e.g. websites v2) return a bare JSON array.
 */
function extractBatch(data) {
  if (Array.isArray(data)) {
    return { batch: data, total: data.length, bareArray: true };
  }
  const batch = Array.isArray(data?.results) ? data.results : [];
  const meta = data?._meta || {};
  const total = typeof meta.count === 'number' ? meta.count : batch.length;
  return { batch, total, bareArray: false };
}

async function fetchPaged(accessToken, urlPath, searchParams = {}) {
  const limit = Number(process.env.ADMIT_PAGE_LIMIT) || 200;
  const all = [];
  let offset = 0;
  let total = Infinity;
  let bareArrayDone = false;

  while (offset < total && !bareArrayDone) {
    const params = new URLSearchParams({ ...searchParams, limit: String(limit), offset: String(offset) });
    const url = `${ADMIT_API_BASE}${urlPath}?${params}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`Admitad GET ${urlPath} ${res.status}: ${text.slice(0, 500)}`);
    }
    const data = JSON.parse(text);
    const { batch, total: reportedTotal, bareArray } = extractBatch(data);
    if (bareArray) {
      all.push(...batch);
      bareArrayDone = true;
      break;
    }
    all.push(...batch);
    total = reportedTotal;
    offset += batch.length;
    if (batch.length === 0) break;
  }
  return all;
}

async function fetchJson(accessToken, urlPath) {
  const url = `${ADMIT_API_BASE}${urlPath}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Admitad GET ${urlPath} ${res.status}: ${text.slice(0, 400)}`);
  }
  return JSON.parse(text);
}

function normalizeUrl(u) {
  if (!u || typeof u !== 'string') return null;
  if (u.startsWith('//')) return `https:${u}`;
  return u;
}

function makeSlug(name, campaignId, websiteId) {
  const base = slugify(String(name || 'program'), { lower: true, strict: true, trim: true }).slice(0, 72);
  const tail = `c${campaignId}-w${websiteId}`;
  const combined = base ? `${base}-${tail}` : tail;
  return combined;
}

function uniqueSlug(desired, used) {
  let s = desired;
  let n = 2;
  while (used.has(s)) {
    s = `${desired}-${n}`;
    n += 1;
  }
  used.add(s);
  return s;
}

function pickGotolink(c) {
  const raw =
    c.gotolink ||
    c.goto_link ||
    c.gotoLink ||
    c.affiliate_link ||
    c.affiliateLink ||
    c.ref_link ||
    c.refLink ||
    c.link;
  return raw ? String(raw).trim() : '';
}

function buildEntry({
  usedSlugs,
  websiteId,
  websiteName,
  websiteSiteUrl,
  c,
  gotolink,
  fetchMode,
  catalogConnected,
}) {
  const campaignId = c.id;
  const rawSlug = makeSlug(c.name, campaignId, websiteId);
  const slug = uniqueSlug(rawSlug, usedSlugs);
  const pagePath = `${PATH_PREFIX}/${slug}`;

  return {
    path: pagePath,
    slug,
    fetchMode,
    admitad: {
      websiteId,
      campaignId,
      gotolink: gotolink || null,
      connectionStatus: c.connection_status != null ? c.connection_status : null,
      programStatus: c.status || null,
      catalogConnected: typeof catalogConnected === 'boolean' ? catalogConnected : null,
    },
    website: {
      id: websiteId,
      name: websiteName,
      siteUrl: websiteSiteUrl || null,
    },
    program: {
      name: c.name || null,
      description: c.description || null,
      siteUrl: c.site_url || null,
      image: normalizeUrl(c.image),
      currency: c.currency || null,
      allowDeeplink: c.allow_deeplink === true,
      categories: Array.isArray(c.categories)
        ? c.categories.map((x) => ({ id: x.id, name: x.name, language: x.language }))
        : [],
    },
    content: null,
  };
}

async function tryFetchWebsiteById(accessToken, websiteIdStr) {
  const paths = [`/websites/v2/${websiteIdStr}/`, `/websites/v2/${websiteIdStr}`, `/websites/${websiteIdStr}/`];
  for (const p of paths) {
    try {
      const data = await fetchJson(accessToken, p);
      if (data && data.id != null) return data;
    } catch (_) {
      /* try next */
    }
  }
  return null;
}

async function listAdSpaces(accessToken) {
  let websites = await fetchPaged(accessToken, '/websites/');
  if (websites.length === 0) {
    debugLog('GET /websites/ returned 0 items; trying /websites/v2/');
    websites = await fetchPaged(accessToken, '/websites/v2/');
  }
  return websites;
}

/**
 * Fetch programs for one ad space and append entries (connected mode).
 * @returns {{ raw: number, kept: number, skippedNoLink: number, skippedConnection: number }}
 */
async function fetchConnectedProgramsForSite(accessToken, usedSlugs, entries, site, websiteIdForPath) {
  const websiteId = site.id ?? site.site_id ?? websiteIdForPath;
  const websiteName = site.name || site.site_url || `website-${websiteId}`;
  const websiteIdStr = String(websiteIdForPath != null ? websiteIdForPath : websiteId);

  const lang = process.env.ADMIT_LANGUAGE ? { language: process.env.ADMIT_LANGUAGE } : {};
  const campaigns = await fetchPaged(accessToken, `/advcampaigns/website/${websiteIdStr}/`, lang);
  debugLog(`website ${websiteIdStr}: raw programs`, campaigns.length);

  const skipConnection =
    process.env.ADMIT_SKIP_CONNECTION_FILTER === '1' ||
    process.env.ADMIT_SKIP_CONNECTION_FILTER === 'true';

  const includeWithoutLink =
    process.env.ADMIT_INCLUDE_PROGRAMS_WITHOUT_LINK === '1' ||
    process.env.ADMIT_INCLUDE_PROGRAMS_WITHOUT_LINK === 'true';

  let skippedNoLink = 0;
  let skippedConnection = 0;
  let enriched = 0;
  const entriesBefore = entries.length;

  const enrichGotolink =
    process.env.ADMIT_ENRICH_GOTOLINK !== 'false' && process.env.ADMIT_ENRICH_GOTOLINK !== '0';
  const detailDelayMs = Number(process.env.ADMIT_DETAIL_DELAY_MS) || 150;

  for (const c of campaigns) {
    let gotolink = pickGotolink(c);
    if (!gotolink && enrichGotolink) {
      try {
        const detail = await fetchJson(
          accessToken,
          `/advcampaigns/${c.id}/website/${websiteIdStr}/`
        );
        Object.assign(c, detail);
        gotolink = pickGotolink(c);
        if (gotolink) enriched += 1;
      } catch (err) {
        debugLog(`enrich /advcampaigns/${c.id}/website/${websiteIdStr}/`, err.message);
      }
      await sleep(detailDelayMs);
    }

    if (!gotolink && !includeWithoutLink) {
      skippedNoLink += 1;
      continue;
    }

    const conn = c.connection_status != null ? String(c.connection_status).toLowerCase() : '';
    if (!skipConnection && conn && conn !== 'active') {
      skippedConnection += 1;
      continue;
    }

    entries.push(
      buildEntry({
        usedSlugs,
        websiteId,
        websiteName,
        websiteSiteUrl: site.site_url,
        c,
        gotolink,
        fetchMode: 'connected',
      })
    );
  }

  const added = entries.length - entriesBefore;
  console.log(
    `[admitad] ad space ${websiteIdStr}: programs from API: ${campaigns.length}; rows added: ${added} (gotolink filled via detail: ${enriched}; skipped no URL: ${skippedNoLink}; skipped connection: ${skippedConnection})`
  );

  return {
    raw: campaigns.length,
    added,
    skippedNoLink,
    skippedConnection,
  };
}

async function runConnected(accessToken, usedSlugs, entries) {
  const websiteFilter = process.env.ADMIT_WEBSITE_ID && String(process.env.ADMIT_WEBSITE_ID).trim();

  if (websiteFilter) {
    let site = (await listAdSpaces(accessToken)).find((w) => String(w.id) === websiteFilter);
    if (!site) site = await tryFetchWebsiteById(accessToken, websiteFilter);
    if (!site) {
      site = {
        id: websiteFilter,
        name: process.env.ADMIT_WEBSITE_NAME || `ad-space-${websiteFilter}`,
        site_url: null,
      };
      console.log(
        `[admitad] Ad space ${websiteFilter} not in GET /websites/ — calling /advcampaigns/website/${websiteFilter}/ directly (same id as in the store URL).`
      );
    }
    await fetchConnectedProgramsForSite(accessToken, usedSlugs, entries, site, websiteFilter);
    return;
  }

  const websites = await listAdSpaces(accessToken);
  debugLog('ad spaces (websites):', websites.length, websites[0]?.id ?? '');

  if (websites.length === 0) {
    console.error(
      '[admitad] API returned zero ad spaces. Set ADMIT_WEBSITE_ID=2913701 (from your store URL) to fetch programs for that space anyway, or fix scopes on your Admitad API app (websites + advcampaigns_for_website).'
    );
    return;
  }

  for (const site of websites) {
    await fetchConnectedProgramsForSite(accessToken, usedSlugs, entries, site, null);
  }
}

async function runCatalog(accessToken, usedSlugs, entries) {
  const websiteIdStr = process.env.ADMIT_WEBSITE_ID && String(process.env.ADMIT_WEBSITE_ID).trim();
  if (!websiteIdStr) {
    throw new Error(
      'ADMIT_FETCH_MODE=catalog requires ADMIT_WEBSITE_ID (digits from the store URL, e.g. …/websites/2951457/… → 2951457).'
    );
  }

  const resolveLinks =
    process.env.ADMIT_CATALOG_RESOLVE_LINKS === '1' || process.env.ADMIT_CATALOG_RESOLVE_LINKS === 'true';
  const includeWithoutLink =
    process.env.ADMIT_INCLUDE_PROGRAMS_WITHOUT_LINK === '1' ||
    process.env.ADMIT_INCLUDE_PROGRAMS_WITHOUT_LINK === 'true';
  const detailDelay = Number(process.env.ADMIT_DETAIL_DELAY_MS) || 200;

  let websites = await fetchPaged(accessToken, '/websites/');
  if (websites.length === 0) {
    websites = await fetchPaged(accessToken, '/websites/v2/');
  }
  const site =
    websites.find((w) => String(w.id) === websiteIdStr) || {
      id: websiteIdStr,
      name: process.env.ADMIT_WEBSITE_NAME || `website-${websiteIdStr}`,
      site_url: null,
    };
  const websiteId = site.id;
  const websiteName = site.name || site.site_url || `website-${websiteIdStr}`;
  const websiteSiteUrl = site.site_url;

  const params = { website: websiteIdStr };
  if (process.env.ADMIT_LANGUAGE) params.language = process.env.ADMIT_LANGUAGE;

  const campaigns = await fetchPaged(accessToken, '/advcampaigns/', params);
  debugLog('catalog programs (total rows):', campaigns.length);

  let skippedNoLink = 0;
  let resolved = 0;

  for (const c of campaigns) {
    let merged = { ...c };
    let gotolink = pickGotolink(merged);

    if (!gotolink && resolveLinks) {
      try {
        const detail = await fetchJson(
          accessToken,
          `/advcampaigns/${c.id}/website/${websiteIdStr}/`
        );
        merged = { ...c, ...detail };
        gotolink = pickGotolink(merged);
        if (gotolink) resolved += 1;
      } catch (err) {
        debugLog(`detail ${c.id}:`, err.message);
      }
      await sleep(detailDelay);
    }

    if (!gotolink && !includeWithoutLink) {
      skippedNoLink += 1;
      continue;
    }

    const catalogConnected = merged.connected === true;

    entries.push(
      buildEntry({
        usedSlugs,
        websiteId,
        websiteName,
        websiteSiteUrl,
        c: merged,
        gotolink,
        fetchMode: 'catalog',
        catalogConnected,
      })
    );
  }

  if (process.env.ADMIT_DEBUG === '1' || process.env.ADMIT_DEBUG === 'true') {
    console.log(
      `[admitad] catalog: wrote ${entries.length} entries (skipped no link: ${skippedNoLink}, resolved via detail: ${resolved})`
    );
  } else {
    console.log(
      `[admitad] catalog: programs from API: ${campaigns.length}; rows added: ${entries.length} (skipped no URL: ${skippedNoLink}; detail resolves: ${resolved}). If API count is 0, add scope "advcampaigns" to your Admitad app or check ADMIT_WEBSITE_ID.`
    );
  }
}

async function main() {
  const accessToken = await fetchToken();
  const usedSlugs = new Set();
  const entries = [];
  const mode = (process.env.ADMIT_FETCH_MODE || 'connected').toLowerCase();

  if (mode === 'catalog') {
    await runCatalog(accessToken, usedSlugs, entries);
  } else if (mode === 'connected') {
    await runConnected(accessToken, usedSlugs, entries);
  } else {
    throw new Error(`Unknown ADMIT_FETCH_MODE="${mode}". Use connected or catalog.`);
  }

  // Preserve AI-generated copy from the previous run (fetch must never erase it).
  let allPrevious = [];
  try {
    allPrevious = JSON.parse(fs.readFileSync(OUTPUT, 'utf8')).entries || [];
  } catch (_) {
    /* first run or unreadable file */
  }
  // Manual partner-network entries (scripts/mergePartnerPrograms.js) are not API-sourced:
  // pass them through untouched — their campaignId/websiteId are null and would collide
  // in the keyed merge below.
  const manualEntries = allPrevious.filter((e) => e.fetchMode === 'manual');
  const previous = allPrevious.filter((e) => e.fetchMode !== 'manual');
  const prevContent = new Map(
    previous
      .filter((e) => e.content && e.admitad)
      .map((e) => [`${e.admitad.campaignId}:${e.admitad.websiteId}`, e.content])
  );
  for (const e of entries) {
    const key = `${e.admitad.campaignId}:${e.admitad.websiteId}`;
    if (prevContent.has(key)) e.content = prevContent.get(key);
  }

  // Retain entries for disconnected/declined programs that already have generated copy,
  // so a re-approval doesn't lose the copy. Set gotolink to null so the loader excludes
  // the page from the build and the copy generator skips it (content is already set).
  const freshKeys = new Set(entries.map((e) => `${e.admitad.campaignId}:${e.admitad.websiteId}`));
  const disconnected = previous.filter(
    (e) => e.content && e.admitad && !freshKeys.has(`${e.admitad.campaignId}:${e.admitad.websiteId}`)
  );
  for (const e of disconnected) {
    entries.push({ ...e, admitad: { ...e.admitad, gotolink: null } });
  }
  if (disconnected.length > 0) {
    console.log(`[admitad] retained ${disconnected.length} disconnected entries with generated copy`);
  }

  entries.push(...manualEntries);
  if (manualEntries.length > 0) {
    console.log(`[admitad] kept ${manualEntries.length} manual partner-network entries`);
  }

  const payload = {
    fetchedAt: new Date().toISOString(),
    source: 'admitad',
    fetchMode: mode,
    apiBase: ADMIT_API_BASE,
    pathPrefix: PATH_PREFIX,
    count: entries.length,
    entries,
  };

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${entries.length} entries to ${path.relative(process.cwd(), OUTPUT)}`);
  if (entries.length === 0) {
    const lines = [
      'No rows written. Check the [admitad] line above (programs from API / skipped counts).',
      '- Set ADMIT_WEBSITE_ID=2913701 (your store URL …/websites/2913701/…) — the script now fetches /advcampaigns/website/{id}/ even if GET /websites/ is empty.',
      '- List endpoint often omits gotolink: the script now enriches from GET /advcampaigns/{id}/website/{id}/ by default (see ADMIT_ENRICH_GOTOLINK).',
      '- connection_status pending/declined: ADMIT_SKIP_CONNECTION_FILTER=true',
      '- Store-wide catalog: ADMIT_FETCH_MODE=catalog ADMIT_WEBSITE_ID=2913701 (needs advcampaigns scope).',
      'Tip: ADMIT_DEBUG=1',
    ];
    console.log(lines.join('\n'));
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
