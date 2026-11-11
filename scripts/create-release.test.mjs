import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createRelease } from './create-release.mjs';

const input = { tag: 'v1.2.3', repository: 'codechem/system', notesFile: '/tmp/notes with "quotes" $(echo nope).md' };
const response = (code, status = code === 200 ? 0 : 1) => ({ status, stdout: `HTTP/2.0 ${code} Status\r\nContent-Type: application/json\r\n\r\n{"message":"test"}`, stderr: '' });

test('existing releases are preserved without a create or edit call', () => {
  const calls = [];
  const result = createRelease({ ...input, run: (args) => { calls.push(args); return response(200); } });
  assert.equal(result, 'exists');
  assert.deepEqual(calls, [['api', 'repos/codechem/system/releases/tags/v1.2.3', '--include']]);
});

test('only a confirmed 404 creates the tag release with a separate notes-file argument', () => {
  const calls = [];
  const result = createRelease({ ...input, run: (args) => {
    calls.push(args);
    return calls.length === 1 ? response(404) : { status: 0, stdout: 'https://github.com/codechem/system/releases/tag/v1.2.3', stderr: '' };
  } });
  assert.equal(result, 'created');
  assert.deepEqual(calls[1], ['release', 'create', 'v1.2.3', '--repo', 'codechem/system', '--verify-tag', '--title', 'v1.2.3', '--notes-file', input.notesFile]);
  assert.equal(calls.length, 2);
});

for (const [name, result] of [
  ['unauthorized', response(401)], ['forbidden/rate-limited', response(403)],
  ['rate-limited', response(429)], ['server failure', response(500)],
  ['unexpected success', response(201, 0)],
  ['network failure', { status: 1, stdout: '', stderr: 'connection refused' }],
  ['failed command with success headers', response(200, 1)],
  ['unstructured error mentioning 404', { status: 1, stdout: '{"message":"404"}', stderr: 'not found' }],
]) {
  test(`${name} fails closed rather than attempting creation`, () => {
    let count = 0;
    assert.throws(() => createRelease({ ...input, run: () => { count++; return result; } }), /check.*release/i);
    assert.equal(count, 1);
  });
}

test('uses final HTTP response, not a preceding proxy status', () => {
  assert.throws(() => createRelease({ ...input, run: () => ({ ...response(403), stdout: 'HTTP/1.1 200 Connection established\r\n\r\n' + response(403).stdout }) }), /check.*release/i);
});

test('create failure is reported and not silently treated as success', () => {
  let count = 0;
  assert.throws(() => createRelease({ ...input, run: () => ++count === 1 ? response(404) : { status: 1, stdout: '', stderr: 'permission denied' } }), /create.*release/i);
  assert.equal(count, 2);
});

test('rejects missing notes files and malformed repository or tag before invoking gh', () => {
  for (const overrides of [{ tag: '--help' }, { repository: 'bad/../../repo' }, { notesFile: '' }]) {
    let count = 0;
    assert.throws(() => createRelease({ ...input, ...overrides, run: () => { count++; return response(200); } }));
    assert.equal(count, 0);
  }
});

test('CLI fails clearly for missing arguments without reaching GitHub', () => {
  const script = new URL('./create-release.mjs', import.meta.url).pathname;
  const result = spawnSync(process.execPath, [script], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /tag|notes/i);
});
