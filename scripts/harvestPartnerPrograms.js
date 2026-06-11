#!/usr/bin/env node
/**
 * Harvest Admitad partner-network programs (no advertiser approval needed) into
 * content/partner-programs.json — fully automated replacement for copy-pasting
 * links from the dashboard's "Affiliate programs from partners" tab.
 *
 * Uses the logged-in browser session saved by scripts/admitadLogin.js
 * (.admitad-profile/, created once via `node scripts/admitadLogin.js`).
 * The dashboard's internal catalog API is paged for all programs, then a
 * tracking link is generated per program:
 *   POST catalog.store.admitad.com/en/catalog/api/v1/website/{w}/offers/{id}/goto_link/generate_partners_programs/
 *
 * The ad space must already be connected to the partner catalog (Takeads),
 * otherwise link generation fails — the script detects this and says so.
 *
 * Usage: yarn partners:harvest   (then yarn partners:sync && yarn build)
 * Env:
 *   HARVEST_WEBSITE_ID — ad space id (default 2913701, the catalog-connected one)
 *   HARVEST_LIMIT — stop after N programs (default 0 = all)
 *   HARVEST_DELAY_MS — delay between link generations (default 300)
 *   HARVEST_KEYWORDS — optional case-insensitive regex filter on program name
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const WEBSITE_ID = process.env.HARVEST_WEBSITE_ID || '2913701';
const LIMIT = Number(process.env.HARVEST_LIMIT) || 0;
const DELAY_MS = Number(process.env.HARVEST_DELAY_MS) || 300;
const KEYWORDS = process.env.HARVEST_KEYWORDS ? new RegExp(process.env.HARVEST_KEYWORDS, 'i') : null;

const PROFILE_DIR = path.join(__dirname, '..', '.admitad-profile');
const OUTPUT = path.join(__dirname, '..', 'content', 'partner-programs.json');
const CATALOG_URL = `https://store.admitad.com/en/webmaster/websites/${WEBSITE_ID}/catalog/partners_programs/`;
const API_BASE = `https://catalog.store.admitad.com/en/catalog/api/v1/website/${WEBSITE_ID}/offers`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  if (!fs.existsSync(PROFILE_DIR)) {
    throw new Error('No saved Admitad session. Run first: node scripts/admitadLogin.js');
  }
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    channel: 'chrome',
    args: ['--disable-blink-features=AutomationControlled'],
    ignoreDefaultArgs: ['--enable-automation'],
  });
  const page = context.pages()[0] || (await context.newPage());
  await page.goto(CATALOG_URL, { waitUntil: 'domcontentloaded' }).catch(() => {});
  await page.waitForTimeout(2500);
  if (!/webmaster/.test(page.url())) {
    await context.close();
    throw new Error('Admitad session expired. Run again: node scripts/admitadLogin.js');
  }

  const apiGet = (url) =>
    page.evaluate(async (u) => {
      const r = await fetch(u, { credentials: 'include' });
      return { status: r.status, body: await r.text() };
    }, url);

  const apiPost = (url) =>
    page.evaluate(async (u) => {
      const csrf = (document.cookie.match(/csrftoken=([^;]+)/) || [])[1] || '';
      const r = await fetch(u, {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-CSRFToken': csrf, 'Content-Type': 'application/json' },
      });
      return { status: r.status, body: await r.text() };
    }, url);

  // 1. Page through the full catalog (metadata only — fast).
  const offers = [];
  const pageSize = 100;
  let offset = 0;
  let total = Infinity;
  while (offset < total && (!LIMIT || offers.length < LIMIT)) {
    const res = await apiGet(`${API_BASE}/all_partners_programs/?limit=${pageSize}&offset=${offset}`);
    if (res.status !== 200) {
      throw new Error(`catalog page failed (${res.status}): ${res.body.slice(0, 200)}`);
    }
    const data = JSON.parse(res.body);
    total = data._meta?.count ?? 0;
    const batch = data.results || [];
    if (batch.length === 0) break;
    offers.push(...batch);
    offset += batch.length;
    console.log(`[harvest] catalog: ${Math.min(offers.length, total)}/${total}`);
  }

  let targets = offers;
  if (KEYWORDS) targets = targets.filter((o) => KEYWORDS.test(o.advcampaign?.name || ''));
  if (LIMIT) targets = targets.slice(0, LIMIT);
  console.log(`[harvest] programs to link: ${targets.length} (catalog total: ${total})`);

  // 2. Generate a tracking link per program.
  const programs = [];
  let failed = 0;
  for (let i = 0; i < targets.length; i += 1) {
    const o = targets[i];
    const adv = o.advcampaign || {};
    const res = await apiPost(`${API_BASE}/${adv.id}/goto_link/generate_partners_programs/`);
    let link = null;
    try {
      link = JSON.parse(res.body).goto_link || null;
    } catch (_) {}
    if (res.status === 200 && link) {
      programs.push({
        name: adv.name,
        link,
        siteUrl: adv.site_url || null,
        image: adv.logo || null,
        categories: [],
        description: Array.isArray(o.regions) && o.regions.length
          ? `Available regions: ${o.regions.map((r) => r.full_region_name).join(', ')}`
          : null,
      });
    } else {
      failed += 1;
      if (failed <= 5) console.log(`[harvest] ✗ ${adv.name}: ${res.status} ${res.body.slice(0, 120)}`);
      if (failed === 1 && /connect|not.*allowed|forbidden/i.test(res.body)) {
        console.log('[harvest] hint: this ad space may not be connected to the partner catalog.');
      }
    }
    if ((i + 1) % 25 === 0 || i === targets.length - 1) {
      console.log(`[harvest] links: ${programs.length} ok / ${failed} failed / ${i + 1} of ${targets.length}`);
    }
    await sleep(DELAY_MS);
  }

  await context.close();

  // 3. Write the manual-programs file (harvester owns it).
  const payload = {
    _help: 'Generated by yarn partners:harvest — do not edit by hand; re-run the harvester instead.',
    harvestedAt: new Date().toISOString(),
    websiteId: WEBSITE_ID,
    programs,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`[harvest] wrote ${programs.length} programs to ${path.relative(process.cwd(), OUTPUT)} (${failed} failed)`);
  console.log('[harvest] next: yarn partners:sync && yarn build');
})().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
