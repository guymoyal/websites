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
