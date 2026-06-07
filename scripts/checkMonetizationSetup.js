#!/usr/bin/env node
/**
 * PM growth checklist — verify monetization env before deploy.
 * Usage: pnpm monetization:check
 */
const fs = require('fs');
const path = require('path');

require('dotenv').config();
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const EZOIC_ZONES = [
  'homeTop',
  'homeBottom',
  'sitewideFooter',
  'toolsTop',
  'toolsBottom',
  'articleTop',
  'articleBottom',
  'toolTop',
  'toolSidebar',
];

function loadEzoicPlacements() {
  const raw = process.env.NEXT_PUBLIC_EZOIC_PLACEMENTS_JSON?.trim() || '';
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function gaId() {
  const id =
    process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID?.trim() ||
    process.env.GOOGLE_ANALYTICS_ID?.trim() ||
    '';
  if (!id || /your-analytics/i.test(id)) return null;
  if (!/^G-[A-Z0-9]+$/i.test(id)) return null;
  return id;
}

function main() {
  let ok = true;
  const lines = ['\n📊 Monetization setup check (PM growth bundle)\n'];

  const ga = gaId();
  if (ga) {
    lines.push(`✅ GA4: ${ga}`);
  } else {
    lines.push('⚠️  GA4: set NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX in .env.local');
    ok = false;
  }

  const ezoicDisabled =
    process.env.NEXT_PUBLIC_EZOIC_DISABLED?.trim().toLowerCase() === 'true';
  const placements = loadEzoicPlacements();
  if (placements === null) {
    lines.push('❌ Ezoic: NEXT_PUBLIC_EZOIC_PLACEMENTS_JSON is not valid JSON');
    ok = false;
  } else if (ezoicDisabled) {
    lines.push('⚠️  Ezoic: disabled via NEXT_PUBLIC_EZOIC_DISABLED=true');
  } else if (Object.keys(placements).length === 0) {
    lines.push('⚠️  Ezoic: no placement IDs — add NEXT_PUBLIC_EZOIC_PLACEMENTS_JSON (see docs/MONETIZATION_QUICKSTART.md)');
    ok = false;
  } else {
    const missing = EZOIC_ZONES.filter((z) => !placements[z]);
    lines.push(`✅ Ezoic: ${Object.keys(placements).length} placement(s) configured`);
    if (missing.length) {
      lines.push(`   Optional zones not set: ${missing.join(', ')}`);
    }
  }

  const sponsor =
    process.env.NEXT_PUBLIC_SPONSOR_IMAGE_URL && process.env.NEXT_PUBLIC_SPONSOR_LINK;
  if (sponsor) {
    lines.push('✅ Sponsor banner: configured');
  } else {
    lines.push('ℹ️  Sponsor: not set (optional)');
  }

  const affiliatesPath = path.join(__dirname, '..', 'content', 'affiliate-picks.json');
  const affiliatesEnv = process.env.NEXT_PUBLIC_AFFILIATES_JSON?.trim();
  if (affiliatesEnv) {
    lines.push('✅ Affiliates: NEXT_PUBLIC_AFFILIATES_JSON');
  } else if (fs.existsSync(affiliatesPath)) {
    lines.push('✅ Affiliates: content/affiliate-picks.json (default picks)');
  } else {
    lines.push('⚠️  Affiliates: add content/affiliate-picks.json or NEXT_PUBLIC_AFFILIATES_JSON');
  }

  const deepseek = process.env.DEEPSEEK_API_KEY?.trim();
  if (deepseek && !deepseek.includes('your-')) {
    lines.push('✅ DeepSeek: key present (content generation ready)');
  } else {
    lines.push('⚠️  DeepSeek: set DEEPSEEK_API_KEY for pnpm generate:content');
  }

  lines.push('\nNext: pnpm build && deploy. Ezoic A/B tests → Ezoic dashboard.\n');
  console.log(lines.join('\n'));
  process.exit(ok ? 0 : 1);
}

main();
