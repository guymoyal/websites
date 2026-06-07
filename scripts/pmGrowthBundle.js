#!/usr/bin/env node
/**
 * PM growth bundle: check monetization env, generate a few articles, refresh dates, copy to public.
 * Usage: pnpm pm:growth
 */
const { spawnSync } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');

function run(label, cmd, args, extraEnv = {}) {
  console.log(`\n—— ${label} ——\n`);
  const result = spawnSync(cmd, args, {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, ...extraEnv },
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

require('dotenv').config();
require('dotenv').config({ path: path.join(root, '.env.local') });

const articles = process.env.ARTICLES_TO_GENERATE || '3';

{
  console.log('\n—— Monetization check ——\n');
  const check = spawnSync('node', ['scripts/checkMonetizationSetup.js'], {
    cwd: root,
    stdio: 'inherit',
    env: process.env,
  });
  if (check.status !== 0) {
    console.log('\nℹ️  Monetization check reported gaps — continuing content steps.\n');
  }
}

if (!process.env.DEEPSEEK_API_KEY?.trim()) {
  console.log('\n⏭️  Skipping content generation — set DEEPSEEK_API_KEY in .env.local\n');
} else {
  run(`Generate ${articles} article(s)`, 'node', ['scripts/generateContent.js'], {
    ARTICLES_TO_GENERATE: articles,
  });
}

run('Refresh content dates', 'node', ['scripts/updateContentDates.js']);
run('Copy content to public', 'node', ['scripts/copyContentToPublic.js']);

console.log('\n✅ PM growth bundle complete. Run pnpm build && deploy when Ezoic/GA4 env is set.\n');
