import { appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { npmDistTag } from './npm-dist-tag.mjs';

export function parseReleaseTarget(tag) {
  const match = /^(tokens|components)-v(.+)$/.exec(tag ?? '');
  if (!match) throw new Error('Expected a tag like tokens-vX.Y.Z or components-vX.Y.Z');
  return { pkg: match[1], version: match[2], distTag: npmDistTag(match[2]) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const { pkg, version, distTag } = parseReleaseTarget(process.env.RELEASE_TAG);
    appendFileSync(process.env.GITHUB_OUTPUT, `pkg=${pkg}\nversion=${version}\ndist_tag=${distTag}\n`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
