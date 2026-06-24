/**
 * Drives the Admitad store dashboard in a real Chrome window to connect the
 * curated programs. The user logs in manually (handles 2FA); the script detects
 * login, then (in connect mode) clicks Connect for each target program.
 *
 * Persistent profile keeps the login across runs (.admitad-profile/).
 *
 * MODE=login   : open catalog, wait for manual login, screenshot + dump, exit.
 * MODE=inspect : relaunch (logged in), screenshot the catalog DOM for selector work.
 * MODE=connect : relaunch, iterate curated programs, click Connect. (built after inspect)
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const PROFILE = path.join(__dirname, '..', '.admitad-profile');
const WID = '2951457';
const CATALOG = `https://store.admitad.com/en/webmaster/websites/${WID}/catalog/`;
const MODE = process.env.MODE || 'login';
const OUT = '/tmp/admitad';
fs.mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function isLoggedIn(page) {
  const url = page.url();
  if (/\/login|\/auth|signin|account\.|id\./i.test(url)) return false;
  const hasPw = await page.locator('input[type="password"]').count().catch(() => 0);
  if (hasPw > 0) return false;
  return /\/webmaster\//.test(url);
}

async function dump(page, tag) {
  await page.screenshot({ path: `${OUT}/${tag}.png`, fullPage: true }).catch(() => {});
  const info = {
    url: page.url(),
    title: await page.title().catch(() => ''),
    buttons: await page.locator('button, a[role="button"], [class*="connect" i]')
      .evaluateAll((els) => els.slice(0, 40).map((e) => (e.textContent || '').trim()).filter(Boolean))
      .catch(() => []),
  };
  fs.writeFileSync(`${OUT}/${tag}.json`, JSON.stringify(info, null, 2));
  console.log(`[dump:${tag}] url=${info.url}`);
  console.log(`[dump:${tag}] buttons:`, info.buttons.slice(0, 20).join(' | '));
}

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE, {
    headless: false,
    viewport: { width: 1400, height: 900 },
    args: ['--no-first-run', '--no-default-browser-check'],
  });
  const page = ctx.pages()[0] || (await ctx.newPage());

  await page.goto(CATALOG, { waitUntil: 'domcontentloaded' }).catch(() => {});

  if (MODE === 'login') {
    console.log('[login] Browser open. Please log in to Admitad in the window…');
    const deadline = Date.now() + 300000; // 5 min
    let ok = false;
    while (Date.now() < deadline) {
      if (await isLoggedIn(page)) { ok = true; break; }
      await sleep(3000);
    }
    if (!ok) { console.log('[login] timed out waiting for login'); await ctx.close(); process.exit(2); }
    console.log('[login] detected logged-in. Navigating to catalog…');
    await page.goto(CATALOG, { waitUntil: 'domcontentloaded' }).catch(() => {});
    await sleep(4000);
    await dump(page, 'catalog');
    console.log('[login] done — profile saved. You can close the window.');
    await ctx.close();
    return;
  }

  if (MODE === 'inspect') {
    await sleep(4000);
    if (!(await isLoggedIn(page))) { console.log('[inspect] NOT logged in — run MODE=login first'); await ctx.close(); process.exit(3); }
    await dump(page, 'inspect');
    await ctx.close();
    return;
  }

  if (MODE === 'probe') {
    await sleep(4000);
    // list all inputs (to find the search box)
    const inputs = await page.locator('input').evaluateAll((els) =>
      els.map((e) => ({ ph: e.placeholder || '', name: e.name || '', type: e.type || '' }))).catch(() => []);
    fs.writeFileSync(`${OUT}/inputs.json`, JSON.stringify(inputs, null, 2));
    console.log('[probe] inputs:', JSON.stringify(inputs.slice(0, 12)));

    // try to type a known program into a likely search box
    const term = 'NordVPN';
    const search = page.locator('input[type="search"]').first();
    if (await search.count()) {
      await search.click();
      await search.pressSequentially(term, { delay: 80 });
      await sleep(3500);
      console.log('[probe] typed', term);
      // capture autocomplete dropdown options
      const opts = await page.evaluate(() => {
        const nodes = Array.from(document.querySelectorAll('[role="option"], [class*="dropdown" i] *, [class*="suggest" i] *, [class*="autocomplete" i] *'));
        const seen = new Set(); const out = [];
        for (const n of nodes) {
          const t = (n.textContent || '').replace(/\s+/g, ' ').trim();
          if (t && t.length < 60 && !seen.has(t)) { seen.add(t); out.push({ tag: n.tagName, cls: (n.className||'').toString().slice(0,40), text: t }); }
        }
        return out.slice(0, 20);
      });
      fs.writeFileSync(`${OUT}/options.json`, JSON.stringify(opts, null, 2));
      console.log('[probe] dropdown options:', opts.length);
      opts.slice(0, 12).forEach((o) => console.log('   <'+o.tag+'>', JSON.stringify(o.text)));
    } else {
      console.log('[probe] no search input found');
    }
    // dump candidate program cards: any element whose text has the term, plus nearby buttons
    const cards = await page.evaluate(() => {
      const out = [];
      const btns = Array.from(document.querySelectorAll('button, a'));
      for (const b of btns) {
        const t = (b.textContent || '').trim();
        if (/^join$|^joined$|^connect$|pending|moderation/i.test(t)) {
          const card = b.closest('[class*="card" i],[class*="program" i],li,article,tr') || b.parentElement;
          out.push({ btn: t, btnClass: b.className, cardText: (card?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120) });
        }
      }
      return out.slice(0, 25);
    });
    fs.writeFileSync(`${OUT}/cards.json`, JSON.stringify(cards, null, 2));
    console.log('[probe] join-like buttons found:', cards.length);
    cards.slice(0, 10).forEach((c) => console.log('  ['+c.btn+']', c.cardText.slice(0, 70)));
    await page.screenshot({ path: `${OUT}/probe.png`, fullPage: true }).catch(() => {});
    await ctx.close();
    return;
  }

  if (MODE === 'connect') {
    page.setDefaultTimeout(12000);
    await sleep(4000);
    if (!(await isLoggedIn(page))) { console.log('[connect] NOT logged in — run MODE=login first'); await ctx.close(); process.exit(3); }
    const DRY = process.env.DRY === '1';
    const targets = JSON.parse(process.env.TARGETS || '[]');
    const results = [];
    const search = page.locator('input[type="search"]').first();
    const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    for (const name of targets) {
      const r = { name, status: 'unknown' };
      try {
        // reset to catalog each iteration (clicking a suggestion navigates away)
        await page.goto(CATALOG, { waitUntil: 'domcontentloaded' });
        await sleep(2500);
        const box = page.locator('input[type="search"]').first();
        await box.click();
        await box.fill('');
        await sleep(500);
        await box.pressSequentially(name, { delay: 60 });
        // wait for autocomplete options to render
        await page.waitForSelector('li', { timeout: 6000 }).catch(() => {});
        await sleep(1800);
        const opt = page.locator('li', { hasText: new RegExp('^\\s*' + esc(name), 'i') })
          .filter({ has: page.locator('*') }).first();
        const optVisible = await opt.isVisible().catch(() => false);
        if (!optVisible) {
          // fallback: press Enter to run the search, then look at the grid
          await page.keyboard.press('Enter').catch(() => {});
          await sleep(2500);
        } else {
          await opt.click({ timeout: 6000 }).catch(() => {});
          await sleep(3000);
        }
        // locate a Join button (green). Exact text avoids tooltip "Join the promotion".
        const join = page.getByRole('button', { name: 'Join', exact: true }).first();
        let hasJoin = await join.isVisible().catch(() => false);
        if (!hasJoin) {
          const joined = await page.getByText(/joined|pending|moderation|in progress/i).first().isVisible().catch(() => false);
          r.status = joined ? 'already-joined-or-pending' : 'no-join-button';
          results.push(r); console.log(`  ${joined ? '•' : '✗'} ${name}: ${r.status}`); continue;
        }
        if (DRY) { r.status = 'would-join'; results.push(r); console.log(`  → ${name}: Join found (DRY)`); continue; }
        await join.click({ timeout: 8000 });
        await sleep(2500);
        // confirmation modal, if any
        const confirm = page.getByRole('button', { name: /^(Join|Confirm|Yes|Connect|Apply|Add)$/i }).last();
        if (await confirm.isVisible().catch(() => false)) { await confirm.click().catch(() => {}); await sleep(2000); }
        await page.screenshot({ path: `${OUT}/joined-${name.replace(/[^a-z0-9]+/gi, '_')}.png` }).catch(() => {});
        r.status = 'joined';
        results.push(r); console.log(`  ✓ ${name}: joined`);
      } catch (e) {
        r.status = 'error: ' + e.message.split('\n')[0].slice(0, 70);
        results.push(r); console.log(`  ✗ ${name}: ${r.status}`);
      }
    }
    fs.writeFileSync(`${OUT}/connect-results.json`, JSON.stringify(results, null, 2));
    console.log('[connect] SUMMARY:', JSON.stringify(results.map((r) => r.name + '=' + r.status)));
    await ctx.close();
    return;
  }
})().catch((e) => { console.error('ERR', e.message); process.exit(1); });
