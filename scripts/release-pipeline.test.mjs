import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseReleaseTarget } from './release-target.mjs';
import { removedTokens, isBreakingBump } from './check-token-breaking.mjs';

test('release tag selects package, version and dist-tag', () => {
  assert.deepEqual(parseReleaseTarget('tokens-v1.2.3'), { pkg: 'tokens', version: '1.2.3', distTag: 'latest' });
  assert.deepEqual(parseReleaseTarget('components-v0.1.0-beta.1'), { pkg: 'components', version: '0.1.0-beta.1', distTag: 'next' });
  for (const tag of ['v1.2.3', 'site-v1.2.3', 'tokens-v1.2', 'tokens-v1.2.3\n', undefined]) assert.throws(() => parseReleaseTarget(tag));
});

test('only removed token declarations are reported, not usages or additions', () => {
  const old = ':root{--cc-a: 1; --cc-b: 2; --cc-c: var(--cc-a);}';
  assert.deepEqual(removedTokens(old, ':root{--cc-a: 1; --cc-c: var(--cc-a); --cc-new: 3;}'), ['--cc-b']);
  assert.deepEqual(removedTokens(old, old), []);
});

test('breaking bumps: minor before 1.0.0, major after', () => {
  assert.equal(isBreakingBump('0.3.1', '0.4.0'), true);
  assert.equal(isBreakingBump('0.3.1', '0.3.2'), false);
  assert.equal(isBreakingBump('1.4.0', '1.5.0'), false);
  assert.equal(isBreakingBump('1.4.0', '2.0.0'), true);
});
