#!/usr/bin/env node
/**
 * Merge manually-pasted partner-network programs (content/partner-programs.json)
 * into content/admitad-landings.json as landing entries (fetchMode: "manual").
 *
 * Why manual: Admitad's "Affiliate programs from partners" tab (tatrck.com links,
 * no advertiser approval needed) is not exposed by the publisher API, so the user
 * copies links from the dashboard into partner-programs.json and this script does
 * the rest. Copy generation and page rendering treat these entries like API ones.
 *
 * Idempotent: preserves previously generated `content` (keyed by slug); entries
 * removed from the source file keep their copy with gotolink null (page excluded),
 * matching the fetch script's retention behavior.
 *
 * Usage: yarn partners:manual  (also part of yarn partners:sync)
 */
const fs = require('fs');
const path = require('path');
const slugify = require('slugify');

const SOURCE = path.join(__dirname, '..', 'content', 'partner-programs.json');
const OUTPUT = path.join(__dirname, '..', 'content', 'admitad-landings.json');
const APP_DIR = path.join(__dirname, '..', 'app');

function loadJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (_) {
    return fallback;
  }
}

/** Top-level app/ route segments — a manual slug must not shadow a real page. */
function reservedRouteSegments() {
  const reserved = new Set();
  for (const name of fs.readdirSync(APP_DIR)) {
    if (name.startsWith('[') || name.startsWith('(') || name.includes('.')) continue;
    reserved.add(name.toLowerCase());
  }
  return reserved;
}

function validateProgram(p, i) {
  if (!p || typeof p !== 'object') return `programs[${i}] is not an object`;
  if (!p.name || typeof p.name !== 'string' || !p.name.trim()) return `programs[${i}] missing "name"`;
  if (!p.link || !/^https?:\/\//.test(String(p.link))) {
    return `programs[${i}] ("${p.name}") missing a valid http(s) "link"`;
  }
  return null;
}

function main() {
  const source = loadJson(SOURCE, null);
  if (!source || !Array.isArray(source.programs)) {
    throw new Error(`${path.relative(process.cwd(), SOURCE)} missing or has no "programs" array.`);
  }
  for (let i = 0; i < source.programs.length; i += 1) {
    const problem = validateProgram(source.programs[i], i);
    if (problem) throw new Error(problem);
  }

  const payload = loadJson(OUTPUT, { entries: [] });
  const previous = Array.isArray(payload.entries) ? payload.entries : [];
  const apiEntries = previous.filter((e) => e.fetchMode !== 'manual');
  const prevManualBySlug = new Map(
    previous.filter((e) => e.fetchMode === 'manual').map((e) => [e.slug, e])
  );

  const reserved = reservedRouteSegments();
  const usedSlugs = new Set(apiEntries.map((e) => e.slug));
  const manualEntries = [];

  for (const p of source.programs) {
    let slug = slugify(String(p.name), { lower: true, strict: true, trim: true }).slice(0, 72);
    if (!slug) slug = 'partner-program';
    if (reserved.has(slug)) slug = `${slug}-offer`;
    let unique = slug;
    let n = 2;
    while (usedSlugs.has(unique)) {
      unique = `${slug}-${n}`;
      n += 1;
    }
    usedSlugs.add(unique);

    const prev = prevManualBySlug.get(unique);
    manualEntries.push({
      path: `/${unique}`,
      slug: unique,
      fetchMode: 'manual',
      admitad: {
        websiteId: null,
        campaignId: null,
        gotolink: String(p.link).trim(),
        connectionStatus: 'partner-network',
        programStatus: 'active',
        catalogConnected: null,
      },
      website: { id: null, name: 'partner-network', siteUrl: null },
      program: {
        name: p.name.trim(),
        description: p.description || null,
        siteUrl: p.siteUrl || null,
        image: p.image || null,
        currency: null,
        allowDeeplink: false,
        categories: Array.isArray(p.categories)
          ? p.categories.map((name) => ({ id: null, name: String(name), language: null }))
          : [],
      },
      content: prev?.content ?? null,
    });
    prevManualBySlug.delete(unique);
  }

  // Source-removed manual entries: keep paid-for copy, drop the page (gotolink null).
  let retained = 0;
  for (const e of prevManualBySlug.values()) {
    if (e.content) {
      manualEntries.push({ ...e, admitad: { ...e.admitad, gotolink: null } });
      retained += 1;
    }
  }

  const entries = [...apiEntries, ...manualEntries];
  const next = {
    ...payload,
    fetchedAt: payload.fetchedAt || new Date().toISOString(),
    count: entries.length,
    entries,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(next, null, 2)}\n`, 'utf8');

  const live = manualEntries.filter((e) => e.admitad.gotolink).length;
  console.log(
    `[manual] partner-network programs: ${live} live (${retained} retained without link); total entries: ${entries.length}`
  );
}

try {
  main();
} catch (err) {
  console.error(err.message || err);
  process.exit(1);
}
