import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';

const stableTag = /^(?:(tokens|components)-)?v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const categories = ['Breaking changes', 'Features', 'Fixes', 'Documentation', 'Maintenance', 'Other changes'];

export function isStableReleaseTag(tag) {
  return typeof tag === 'string' && stableTag.test(tag) && !/[\r\n]/.test(tag);
}

export function packageOf(tag) {
  return stableTag.exec(tag)?.[1];
}

export function validateReleaseInput(tag, repository) {
  if (!isStableReleaseTag(tag)) throw new Error('Expected a stable version tag: vMAJOR.MINOR.PATCH');
  if (!/^[A-Za-z0-9][A-Za-z0-9-]*\/[A-Za-z0-9_.-]+$/.test(repository ?? '') || repository.split('/')[1] === '..') {
    throw new Error('Expected a GitHub repository: owner/repo');
  }
}

// Metadata is rendered as text, never as HTML, executable code, or mentions.
function escapeMarkdown(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/@/g, '&#64;').replace(/[\\`*_{}\[\]()!|]/g, '\\$&');
}

export function generateNotes({ cwd, tag, repository }) {
  validateReleaseInput(tag, repository);
  const git = (...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: 'pipe', maxBuffer: 32 * 1024 * 1024 }).trimEnd();
  const target = git('rev-parse', '--verify', `refs/tags/${tag}^{commit}`);
  const parents = new Map(git('rev-list', '--parents', target).split('\n').map((line) => {
    const [sha, ...ancestors] = line.split(' ');
    return [sha, ancestors];
  }));
  // Breadth-first traversal measures parent edges, not commits unique to a branch.
  const distances = new Map([[target, 0]]);
  const queue = [target];
  for (let index = 0; index < queue.length; index++) {
    const sha = queue[index];
    for (const parent of parents.get(sha) ?? []) {
      if (!distances.has(parent)) {
        distances.set(parent, distances.get(sha) + 1);
        queue.push(parent);
      }
    }
  }
  const pkg = packageOf(tag);
  const candidates = [];
  for (const name of git('tag', '--merged', target).split('\n').filter(isStableReleaseTag)) {
    if (packageOf(name) && packageOf(name) !== pkg) continue;
    const sha = git('rev-parse', '--verify', `refs/tags/${name}^{commit}`);
    if (sha === target) continue;
    candidates.push({ name, distance: distances.get(sha) });
  }
  candidates.sort((a, b) => a.distance - b.distance || a.name.localeCompare(b.name, 'en'));
  const previous = candidates[0]?.name;
  const range = previous ? `refs/tags/${previous}..${target}` : target;
  const shas = git('rev-list', '--reverse', range, ...(pkg ? ['--', `packages/${pkg}`] : [])).split('\n').filter(Boolean);
  const url = `https://github.com/${repository}`;
  const sections = new Map(categories.map((category) => [category, []]));
  const authors = new Set();

  for (const sha of shas) {
    // NUL separates fields; Git commit messages and author names cannot contain it.
    const [author, subject, body = ''] = git('show', '-s', '--format=%an%x00%s%x00%b', sha).split('\0');
    authors.add(author);
    const conventional = /^(\w+)(?:\(([^)]+)\))?(!)?:\s+(.+)$/.exec(subject);
    const [, type, scope, breaking, description] = conventional ?? [];
    const category = breaking || /^BREAKING[ -]CHANGE:\s*/m.test(body) ? 'Breaking changes'
      : type === 'feat' ? 'Features' : type === 'fix' ? 'Fixes' : type === 'docs' ? 'Documentation'
        : /^(build|ci|chore|refactor|perf|style|test)$/.test(type) ? 'Maintenance' : 'Other changes';
    const title = escapeMarkdown(description ?? subject).replace(/\\\(#(\d+)\\\)$|\bpull request #(\d+)\b/gi, (match, squash, merge) => {
      const number = squash ?? merge;
      const link = `[#${number}](${url}/pull/${number})`;
      return squash ? `\\(${link}\\)` : match.replace(`#${number}`, link);
    });
    const prefix = scope ? `**${escapeMarkdown(scope)}:** ` : '';
    let entry = `- ${prefix}${title} ([${sha.slice(0, 7)}](${url}/commit/${sha}))`;
    if (body.trim()) entry += `\n\n${body.trim().split('\n').map((line) => `  > ${escapeMarkdown(line)}`).join('\n')}`;
    sections.get(category).push(entry);
  }

  const lines = [`## What's changed`, '', `${shas.length} commit${shas.length === 1 ? '' : 's'} ${previous ? `since ${previous}` : 'in this first release'}.`];
  for (const [category, entries] of sections) {
    if (entries.length) lines.push('', `### ${category}`, '', entries.join('\n'));
  }
  if (authors.size) lines.push('', '### Contributors', '', [...authors].sort().map((author) => `- ${escapeMarkdown(author)}`).join('\n'));
  lines.push('', previous ? `**Full changelog:** ${url}/compare/${previous}...${tag}` : `**Full history:** ${url}/commits/${tag}`, '');
  return lines.join('\n');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const { values } = parseArgs({ options: { tag: { type: 'string' }, repository: { type: 'string' }, output: { type: 'string' } } });
    if (!values.output) throw new Error('Missing --output path');
    writeFileSync(values.output, generateNotes({ cwd: process.cwd(), tag: values.tag, repository: values.repository }));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
