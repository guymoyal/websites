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
