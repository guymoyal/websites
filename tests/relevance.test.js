import { test } from 'node:test';
import assert from 'node:assert';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { merchantText, isRelevant, prefilter } = require('../scripts/lib/relevance.js');

const e = (name, description = '') => ({ slug: name.toLowerCase().replace(/\s+/g, '-'), program: { name, description } });

test('merchantText lowercases name + description', () => {
  assert.equal(merchantText(e('Fiverr', 'Hire FREELANCERS')), 'fiverr hire freelancers');
});

test('isRelevant keeps AI/software at strict tier', () => {
  assert.equal(isRelevant(e('fireflies.ai', 'AI meeting notes'), 'strict'), true);
  assert.equal(isRelevant(e('Alamo US', 'Car rental'), 'strict'), false);
});

test('moderate tier adds hosting/vpn', () => {
  assert.equal(isRelevant(e('Bluehost', 'web hosting and domains'), 'strict'), false);
  assert.equal(isRelevant(e('Bluehost', 'web hosting and domains'), 'moderate'), true);
});

test('broad tier adds electronics/marketplace', () => {
  assert.equal(isRelevant(e('AliExpress WW', 'global marketplace electronics'), 'moderate'), false);
  assert.equal(isRelevant(e('AliExpress WW', 'global marketplace electronics'), 'broad'), true);
});

test('prefilter returns only matching entries for the tier', () => {
  const out = prefilter([e('fireflies.ai', 'AI notes'), e('Alamo US', 'car rental')], 'strict');
  assert.deepEqual(out.map((x) => x.slug), ['fireflies.ai']);
});
