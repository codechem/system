import { test } from 'node:test';
import assert from 'node:assert/strict';
import { npmDistTag } from './npm-dist-tag.mjs';

test('stable versions publish to latest, including metadata with hyphens', () => {
  for (const version of ['0.0.0', '1.2.3', '1.2.3+build-5']) assert.equal(npmDistTag(version), 'latest');
});

test('prereleases publish to next instead of replacing latest', () => {
  for (const version of ['0.0.7-beta.1', '1.2.3-alpha', '1.2.3-rc.0', '2.0.0-0', '1.2.3-beta.1+build-5']) {
    assert.equal(npmDistTag(version), 'next');
  }
});

test('malformed versions do not produce a publish tag', () => {
  for (const version of [undefined, '', 'v1.2.3', '1.2', '01.2.3', '1.2.3-01', '1.2.3-beta..1', '1.2.3\n']) {
    assert.throws(() => npmDistTag(version), /version/i);
  }
});
