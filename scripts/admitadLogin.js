#!/usr/bin/env node
/**
 * One-time (per session expiry) Admitad dashboard login for the partner-network harvester.
 *
 * Opens a visible browser at the partner-programs catalog. Log in there; the script
 * detects when you reach the webmaster area, then reloads the catalog while recording
 * the dashboard's internal JSON API traffic to .admitad-network-log.json for the
 * harvester. The session persists in .admitad-profile/ (gitignored — stays local).
 *
 * Uses the installed Google Chrome with automation fingerprints disabled, otherwise
 * Google SSO refuses to sign in ("This browser or app may not be secure").
 *
 * Usage: node scripts/admitadLogin.js
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const WEBSITE_ID = process.env.ADMIT_WEBSITE_ID || '2945005';
const CATALOG_URL = `https://store.admitad.com/en/webmaster/websites/${WEBSITE_ID}/catalog/partners_programs/`;
const PROFILE_DIR = path.join(__dirname, '..', '.admitad-profile');
const NETLOG_FILE = path.join(__dirname, '..', '.admitad-network-log.json');

(async () => {
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    channel: 'chrome',
    args: ['--disable-blink-features=AutomationControlled'],
    ignoreDefaultArgs: ['--enable-automation'],
    viewport: null,
  });
  const page = context.pages()[0] || (await context.newPage());

  const netlog = [];
  context.on('response', async (res) => {
    try {
      const url = res.url();
      const type = res.headers()['content-type'] || '';
      if (!type.includes('json')) return;
      if (!/admitad|tatrck|takefluence/i.test(url)) return;
      const body = await res.text();
      netlog.push({
        url,
        status: res.status(),
        method: res.request().method(),
        sample: body.slice(0, 4000),
        size: body.length,
      });
    } catch (_) {
      /* response body may be unavailable after navigation */
    }
  });

  console.log('Opening Admitad… log in in the browser window (this script waits).');
  await page.goto(CATALOG_URL, { waitUntil: 'domcontentloaded' });

  // Unauthenticated visits get redirected away from /webmaster/. Wait until the
  // user finishes logging in and lands back in the webmaster area.
  await page.waitForURL(/store\.admitad\.com\/.*webmaster/, { timeout: 0 });
  console.log('Logged in — capturing catalog API traffic…');

  // Fresh load of the catalog with the logged-in session so its XHR calls get recorded.
  await page.goto(CATALOG_URL, { waitUntil: 'networkidle' }).catch(() => {});
  await page.waitForTimeout(5000);

  fs.writeFileSync(NETLOG_FILE, `${JSON.stringify(netlog, null, 2)}\n`, 'utf8');
  console.log(`Session saved in .admitad-profile/; ${netlog.length} JSON responses logged.`);

  await context.close();
  process.exit(0);
})().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
