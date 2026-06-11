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
