#!/usr/bin/env node
/**
 * One command: refresh content timestamps → copy to public → production build → Cloudflare deploy.
 *
 * Usage:
 *   yarn site:publish
 *
 * Requires: CLOUDFLARE_API_TOKEN in env (or wrangler already logged in).
 * Optional: FULL_CONTENT_REFRESH=true runs weekly news + refresh (no LLM). For new articles use: yarn generate:content (DeepSeek).
 */
const { execSync } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');

function run(cmd) {
  console.log(`\n▶ ${cmd}\n`);
  execSync(cmd, { stdio: 'inherit', cwd: root, env: process.env });
}

try {
  if (process.env.FULL_CONTENT_REFRESH === 'true') {
    console.log('📰 Full content refresh (weekly roundup + date stamps on old posts)…');
    run('node scripts/generateWeeklyNews.js');
    run('node scripts/refreshOldContent.js');
  }

  run('node scripts/updateContentDates.js');
  run('yarn build');

  const skipDeploy = process.env.SKIP_DEPLOY === 'true';
  if (skipDeploy) {
    console.log('\n✅ Build done (SKIP_DEPLOY=true — not deploying).\n');
    process.exit(0);
  }

  run('npx wrangler deploy');
  console.log('\n✅ Site published to Cloudflare.\n');
} catch (e) {
  console.error('\n❌ sitePublish failed:', e.message);
  process.exit(1);
}
