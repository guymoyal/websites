import { test } from 'node:test';
import assert from 'node:assert';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { splitSlugs } = require('../scripts/lib/allowlist.js');

test('splits entry slugs into kept (relevant) and pruned', () => {
  const entries = [{ slug: 'a' }, { slug: 'b' }, { slug: 'c' }];
  const { keep, prune } = splitSlugs(entries, ['a', 'c']);
  assert.deepEqual(keep, ['a', 'c']);
  assert.deepEqual(prune, ['b']);
});

test('relevant slug not present in entries is ignored, not kept', () => {
  const { keep, prune } = splitSlugs([{ slug: 'a' }], ['a', 'zzz']);
  assert.deepEqual(keep, ['a']);
  assert.deepEqual(prune, []);
});
