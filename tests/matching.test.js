import { test } from 'node:test';
import assert from 'node:assert';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { scoreMerchant, matchMerchants } = require('../scripts/lib/matching.js');

const article = { category: 'Design & Creative', keywords: ['ai logo design', 'design tools'] };
const m = (name, category, anchorIdeas = [], connectionStatus = 'active') =>
  ({ slug: name, name, category, anchorIdeas, connectionStatus });

test('same category scores higher than keyword-only match', () => {
  const same = scoreMerchant(article, m('Canva', 'Design & Creative', ['design templates']));
  const kw = scoreMerchant(article, m('Fiverr', 'Business', ['logo design gigs']));
  assert.ok(same > kw);
});

test('matchMerchants returns at most `limit`, only active merchants', () => {
  const merchants = [
    m('Canva', 'Design & Creative'),
    m('Picsart', 'Design & Creative'),
    m('Fiverr', 'Design & Creative'),
    m('Pending', 'Design & Creative', [], 'pending'),
  ];
  const out = matchMerchants(article, merchants, 3);
  assert.equal(out.length, 3);
  assert.ok(!out.find((x) => x.slug === 'Pending'));
});

test('returns empty when no merchant is relevant', () => {
  const out = matchMerchants(article, [m('CarRental', 'General', [], 'active')], 3);
  assert.deepEqual(out, []);
});
