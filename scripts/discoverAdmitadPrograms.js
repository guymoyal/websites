#!/usr/bin/env node
/**
 * Discover Admitad programs for an ad space — read-only advisory tool.
 *
 * Admitad retired the program attach API (POST /advcampaigns/{id}/attach/{w_id}/)
 * on or before 2026-06-11; it now returns 410 Gone with no replacement endpoint.
 * Publishers must join programs manually in the Admitad dashboard.
 * This script is therefore discovery-only: it prints a candidate table but never
 * attempts to attach anything.
 *
 * Usage:
 *   yarn partners:discover
 *
 * Env:
 *   ADMIT_WEBSITE_ID   — ad space (default 2951457 = aibuzz.world)
 *   ADMIT_CATEGORIES   — comma-separated category names (default below)
 *   ADMIT_KEYWORDS     — optional case-insensitive regex over name+description
 */
const { fetchToken, apiGetPaged } = require('./lib/admitadApi');

const WEBSITE_ID = String(process.env.ADMIT_WEBSITE_ID || '2951457');
const DEFAULT_CATEGORIES = [
  'Программы и IT-сервисы',
  'Интернет-услуги',
  'Онлайн-образование',
  'June AI Fest',
];

function parseArgs(argv) {
  for (let i = 2; i < argv.length; i += 1) {
    if (argv[i].startsWith('--')) {
      console.warn(`[discover] Unknown flag "${argv[i]}" — ignored.`);
    }
  }
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

async function main() {
  parseArgs(process.argv);
  const categories = process.env.ADMIT_CATEGORIES
    ? process.env.ADMIT_CATEGORIES.split(',').map((s) => s.trim()).filter(Boolean)
    : DEFAULT_CATEGORIES;
  const keywordRe = process.env.ADMIT_KEYWORDS ? new RegExp(process.env.ADMIT_KEYWORDS, 'i') : null;

  const token = await fetchToken('advcampaigns');

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

  console.log(
    `\nAdmitad retired the attach API — join programs manually in your dashboard:` +
    `\n  https://store.admitad.com/en/webmaster/websites/${WEBSITE_ID}/programs/` +
    `\nThen run: yarn partners:fetch`
  );
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
