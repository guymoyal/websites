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
