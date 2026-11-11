import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { generateNotes } from './release-notes.mjs';

function fixture(t) {
  const cwd = mkdtempSync(join(tmpdir(), 'release-notes-'));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  const git = (...args) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
  git('init', '-q', '-b', 'main');
  git('config', 'user.name', 'Test Author');
  git('config', 'user.email', 'test@example.invalid');
  git('config', 'commit.gpgsign', 'false');
  const commit = (message) => {
    git('commit', '--allow-empty', '-q', '-m', message);
    return git('rev-parse', 'HEAD');
  };
  const notes = (tag = 'v1.1.0') => generateNotes({ cwd, tag, repository: 'codechem/system' });
  return { cwd, git, commit, notes };
}

test('categorizes all commits and links commits, PRs, and comparison', (t) => {
  const { git, commit, notes } = fixture(t);
  commit('old history');
  git('tag', 'v1.0.0');
  const sha = commit('feat(button): add size (#12)');
  commit('fix: keep focus');
  commit('docs: explain themes');
  for (const type of ['build', 'ci', 'chore', 'refactor', 'perf', 'style', 'test']) commit(`${type}: upkeep`);
  commit('plain commit');
  git('tag', 'v1.1.0');
  const result = notes();
  assert.match(result, /11 commits/);
  assert.match(result, /### Features\n\n- \*\*button:\*\* add size/);
  assert.ok(result.includes('[#12](https://github.com/codechem/system/pull/12)'));
  assert.ok(result.includes(`[${sha.slice(0, 7)}](https://github.com/codechem/system/commit/${sha})`));
  assert.match(result, /### Fixes\n\n- keep focus/);
  assert.match(result, /### Documentation\n\n- explain themes/);
  assert.equal((result.match(/- upkeep/g) ?? []).length, 7);
  assert.match(result, /### Maintenance/);
  assert.match(result, /### Other changes\n\n- plain commit/);
  assert.ok(!result.includes('old history'));
  assert.ok(result.includes('/compare/v1.0.0...v1.1.0'));
  assert.equal((result.match(/Test Author/g) ?? []).length, 1);
});

test('includes breaking markers and multiline explanations without empty sections', (t) => {
  const { git, commit, notes } = fixture(t);
  commit('feat(api)!: rename value\n\nUse selectedValue instead.\n\nBREAKING CHANGE: value was removed\nSet selectedValue on upgrade.');
  commit('fix: change event\n\nBREAKING-CHANGE: event now bubbles');
  git('tag', 'v1.1.0');
  const result = notes();
  assert.match(result, /### Breaking changes/);
  assert.match(result, /value was removed/);
  assert.match(result, /Set selectedValue on upgrade/);
  assert.match(result, /event now bubbles/);
  assert.ok(!result.includes('### Features'));
  assert.ok(!result.includes('### Maintenance'));
});

test('first release includes root history and history link', (t) => {
  const { git, commit, notes } = fixture(t);
  commit('initial work');
  git('tag', 'v1.1.0');
  const result = notes();
  assert.match(result, /1 commit\b/);
  assert.ok(result.includes('initial work'));
  assert.ok(result.includes('/commits/v1.1.0'));
  assert.ok(!result.includes('/compare/'));
});

test('uses annotated stable ancestors, ignoring prerelease, unprefixed and same-commit tags', (t) => {
  const { git, commit, notes } = fixture(t);
  commit('baseline');
  git('tag', '-a', 'v1.0.0', '-m', 'release');
  commit('feat: included');
  git('tag', 'v1.1.0-beta.1');
  git('tag', '1.0.1');
  commit('fix: included too');
  git('tag', 'v1.0.9');
  git('tag', '-a', 'v1.1.0', '-m', 'release');
  const result = notes();
  assert.match(result, /2 commits/);
  assert.ok(result.includes('/compare/v1.0.0...v1.1.0'));
});

test('ignores unrelated tags and selects the nearest ancestor deterministically', (t) => {
  const { git, commit, notes } = fixture(t);
  commit('baseline');
  git('tag', 'v1.0.0');
  git('checkout', '-q', '-b', 'unrelated');
  commit('not reachable');
  git('tag', 'v9.0.0');
  git('checkout', '-q', 'main');
  commit('nearer baseline');
  git('tag', 'v1.0.1');
  git('tag', 'v1.0.2');
  commit('feat: new work');
  git('tag', 'v1.1.0');
  const result = notes();
  assert.match(result, /1 commit\b/);
  assert.ok(result.includes('/compare/v1.0.1...v1.1.0'));
  assert.ok(!result.includes('not reachable'));
});

test('renders unusual metadata literally and safely', (t) => {
  const { git, commit, notes } = fixture(t);
  git('config', 'user.name', 'A [name] *bold* @everyone');
  commit('feat: `<script>` [link](bad) $(touch nope) "quoted"\n\nDetails with *stars*\nand #42.');
  git('tag', 'v1.1.0');
  const result = notes();
  assert.ok(result.includes('&lt;script&gt;'));
  assert.ok(result.includes('\\[link\\]\\(bad\\)'));
  assert.ok(result.includes('&#64;everyone'));
  assert.ok(result.includes('> Details with \\*stars\\*'));
  assert.ok(result.includes('> and #42.'));
  assert.ok(result.includes('"quoted"'));
});

test('rejects invalid or missing target tags and repository identifiers', (t) => {
  const { cwd, commit, notes } = fixture(t);
  commit('initial');
  for (const tag of ['--all', 'v01.0.0', 'v1.0', 'v1.0.0-beta.1']) assert.throws(() => notes(tag), /tag/i);
  assert.throws(() => notes('v1.1.0'), /tag|revision/i);
  assert.throws(() => generateNotes({ cwd, tag: 'v1.1.0', repository: '../bad/repo' }), /repository/i);
});

test('CLI writes notes to the requested output and fails for missing arguments', (t) => {
  const { cwd, git, commit } = fixture(t);
  commit('feat: CLI works');
  git('tag', 'v1.1.0');
  const script = new URL('./release-notes.mjs', import.meta.url).pathname;
  const output = join(cwd, 'notes.md');
  const result = spawnSync(process.execPath, [script, '--tag', 'v1.1.0', '--repository', 'codechem/system', '--output', output], { cwd });
  assert.equal(result.status, 0, result.stderr.toString());
  assert.match(readFileSync(output, 'utf8'), /CLI works/);
  assert.notEqual(spawnSync(process.execPath, [script], { cwd }).status, 0);
});

test('release tag gate skips prereleases and malformed tags without failing publication', (t) => {
  const { cwd } = fixture(t);
  const script = new URL('./check-release-tag.mjs', import.meta.url).pathname;
  const output = join(cwd, 'outputs');
  for (const [tag, expected] of [['v1.2.3', 'true'], ['v0.0.0', 'true'], ['v1.2.3-beta.1', 'false'], ['v1.2.3+build', 'false'], ['v01.2.3', 'false'], ['v1.2.3\n', 'false']]) {
    writeFileSync(output, '');
    const result = spawnSync(process.execPath, [script], { env: { ...process.env, RELEASE_TAG: tag, GITHUB_OUTPUT: output }, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(readFileSync(output, 'utf8'), `stable=${expected}\n`);
  }
});

test('nearest baseline follows shortest parent path in merged history', (t) => {
  const { git, commit, notes } = fixture(t);
  commit('root');
  git('checkout', '-q', '-b', 'side');
  commit('side baseline');
  git('tag', 'v1.0.0');
  commit('side second');
  commit('side third');
  git('checkout', '-q', 'main');
  commit('main baseline');
  git('tag', 'v1.0.1');
  git('merge', '--no-ff', '-m', 'merge side', 'side');
  git('tag', 'v1.1.0');
  const result = notes();
  assert.ok(result.includes('/compare/v1.0.1...v1.1.0'));
  assert.ok(result.includes('side baseline'));
  assert.ok(!result.includes('- main baseline'));
});

test('links recognizable PR references without converting issues or code numbers into PRs', (t) => {
  const { git, commit, notes } = fixture(t);
  commit('fix: resolve issue #123 and color #456');
  commit('Merge pull request #789 from example/branch');
  git('tag', 'v1.1.0');
  const result = notes();
  assert.ok(!result.includes('/pull/123'));
  assert.ok(!result.includes('/pull/456'));
  assert.ok(result.includes('[#789](https://github.com/codechem/system/pull/789)'));
});
