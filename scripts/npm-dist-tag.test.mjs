import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
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

function fixture(t, tokens, components) {
  const cwd = mkdtempSync(join(tmpdir(), 'npm-dist-tag-'));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  for (const [name, version] of [['tokens', tokens], ['components', components]]) {
    mkdirSync(join(cwd, 'packages', name), { recursive: true });
    writeFileSync(join(cwd, 'packages', name, 'package.json'), JSON.stringify({ version }));
  }
  return spawnSync(process.execPath, [new URL('./npm-dist-tag.mjs', import.meta.url).pathname], { cwd, encoding: 'utf8' });
}

test('CLI selects next from the versioned packages used by the workflow', (t) => {
  const result = fixture(t, '0.0.7-beta.1', '0.0.7-beta.1');
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, 'next\n');
});

test('CLI selects latest for stable packages', (t) => {
  const result = fixture(t, '0.0.7', '0.0.7');
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, 'latest\n');
});

test('CLI refuses to publish mismatched workspace versions', (t) => {
  const result = fixture(t, '0.0.7', '0.0.8-beta.1');
  assert.equal(result.status, 1);
  assert.equal(result.stdout, '');
  assert.match(result.stderr, /same version/i);
});
