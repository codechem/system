import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';
import { validateReleaseInput } from './release-notes.mjs';

export function createRelease({ tag, repository, notesFile, run = (args) => spawnSync('gh', args, { encoding: 'utf8' }) }) {
  validateReleaseInput(tag, repository);
  if (!notesFile) throw new Error('Missing --notes-file path');
  const check = run(['api', `repos/${repository}/releases/tags/${tag}`, '--include']);
  const statuses = [...(check.stdout ?? '').matchAll(/^HTTP\/\S+\s+(\d{3})\b/gm)];
  const status = Number(statuses.at(-1)?.[1]);
  if (status === 200 && check.status === 0) return 'exists';
  // Do not turn authentication, network, or service failures into creation attempts.
  if (status !== 404) throw new Error(`Cannot check existing release (HTTP ${status || 'unknown'}, exit ${check.status ?? 'unknown'})`);
  const created = run(['release', 'create', tag, '--repo', repository, '--verify-tag', '--title', tag, '--notes-file', notesFile]);
  if (created.status !== 0) throw new Error(`Cannot create GitHub release (exit ${created.status ?? 'unknown'}); check repository permissions and tag availability`);
  return 'created';
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const { values } = parseArgs({ options: { tag: { type: 'string' }, repository: { type: 'string' }, 'notes-file': { type: 'string' } } });
    const result = createRelease({ tag: values.tag, repository: values.repository, notesFile: values['notes-file'] });
    console.log(result === 'exists' ? 'Release already exists; leaving it unchanged.' : 'GitHub release created.');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
