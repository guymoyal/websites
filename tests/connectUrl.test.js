import { test } from 'node:test';
import assert from 'node:assert';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { connectUrl } = require('../scripts/lib/connectUrl.js');

test('builds store connect URL from campaign + website id', () => {
  assert.equal(
    connectUrl({ campaignId: 6115, websiteId: 2951457 }),
    'https://store.admitad.com/en/webmaster/websites/2951457/ad/6115/'
  );
});

test('falls back to ids parsed from slug when fields missing', () => {
  assert.equal(
    connectUrl({ slug: 'aliexpress-ww-c6115-w2951457' }),
    'https://store.admitad.com/en/webmaster/websites/2951457/ad/6115/'
  );
});

test('returns null when ids cannot be determined', () => {
  assert.equal(connectUrl({ slug: 'no-ids-here' }), null);
});
