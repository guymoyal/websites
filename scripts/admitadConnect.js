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
    await sleep(4000);
    if (!(await isLoggedIn(page))) { console.log('[connect] NOT logged in — run MODE=login first'); await ctx.close(); process.exit(3); }
    const DRY = process.env.DRY === '1';
    const targets = JSON.parse(process.env.TARGETS || '[]');
    const results = [];
    const search = page.locator('input[type="search"]').first();

    for (const name of targets) {
      const r = { name, status: 'unknown' };
      try {
        await search.click();
        await search.fill('');
        await sleep(400);
        await search.pressSequentially(name, { delay: 70 });
        await sleep(2800);
        // click the autocomplete option that starts with the target name
        const opt = page.locator('li').filter({ hasText: new RegExp('^' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }).first();
        if (await opt.count()) {
          await opt.click();
          await sleep(3500);
        } else {
          r.status = 'no-autocomplete-match';
          results.push(r); console.log(`  ✗ ${name}: no autocomplete match`); continue;
        }
        // find the green Join button on the filtered card
        const join = page.getByRole('button', { name: 'Join', exact: true }).first();
        const joinLink = page.locator('a').filter({ hasText: /^Join$/ }).first();
        const target = (await join.count()) ? join : (await joinLink.count() ? joinLink : null);
        if (!target) {
          // maybe already joined?
          const joined = await page.getByText(/joined|pending|in progress|на модерации/i).first().count().catch(() => 0);
          r.status = joined ? 'already-joined-or-pending' : 'no-join-button';
          results.push(r); console.log(`  ${joined ? '•' : '✗'} ${name}: ${r.status}`); continue;
        }
        if (DRY) {
          r.status = 'would-join';
          results.push(r); console.log(`  → ${name}: Join button found (DRY, not clicked)`); continue;
        }
        await target.click();
        await sleep(2500);
        // handle a possible confirmation modal
        const confirm = page.getByRole('button', { name: /^(Join|Confirm|Yes|Connect|Apply)$/i }).last();
        if (await confirm.count()) { await confirm.click().catch(() => {}); await sleep(2000); }
        r.status = 'joined';
        results.push(r); console.log(`  ✓ ${name}: joined`);
      } catch (e) {
        r.status = 'error: ' + e.message.slice(0, 80);
        results.push(r); console.log(`  ✗ ${name}: ${r.status}`);
      }
    }
    fs.writeFileSync(`${OUT}/connect-results.json`, JSON.stringify(results, null, 2));
    await page.screenshot({ path: `${OUT}/connect-final.png`, fullPage: true }).catch(() => {});
    console.log('[connect] done:', JSON.stringify(results.map((r) => r.name + '=' + r.status)));
    await ctx.close();
    return;
  }
})().catch((e) => { console.error('ERR', e.message); process.exit(1); });
