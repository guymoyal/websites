#!/usr/bin/env node
/**
 * Generate src/goLinks.json — the slug → tracking-link map the Cloudflare
 * worker uses to serve /go/<slug>/ as a server-side 302 (part 1 of the
 * ad-blocker-resistant CTA: blockers can't pattern-match a first-party URL).
 *
 * Source of truth: content/admitad-landings.json (same data the /go/ static
 * fallback pages are built from). Re-run after every partners:sync.
 */
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'content', 'admitad-landings.json');
const OUTPUT = path.join(__dirname, '..', 'src', 'goLinks.json');

const payload = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
const entries = Array.isArray(payload?.entries) ? payload.entries : [];

const map = {};
let skipped = 0;
let cpc = 0;
for (const e of entries) {
  const link = e?.admitad?.gotolink;
  if (e?.slug && typeof link === 'string' && /^https:\/\//.test(link)) {
    map[e.slug] = link;
    // Optional per-click (CPC) link variant, served at /go/<slug>~cpc/.
    const cpcLink = e.admitad.cpcGotolink;
    if (typeof cpcLink === 'string' && /^https:\/\//.test(cpcLink)) {
      map[`${e.slug}~cpc`] = cpcLink;
      cpc += 1;
    }
  } else {
    skipped += 1;
  }
}

fs.writeFileSync(OUTPUT, JSON.stringify(map));
console.log(`[go-redirects] wrote ${Object.keys(map).length} links to src/goLinks.json (${skipped} skipped, ${cpc} cpc variants)`);
