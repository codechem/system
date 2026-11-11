import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const number = '(?:0|[1-9]\\d*)';
const prerelease = '(?:0|[1-9]\\d*|\\d*[A-Za-z-][0-9A-Za-z-]*)';
const versionPattern = new RegExp(`^${number}\\.${number}\\.${number}(?:-(${prerelease}(?:\\.${prerelease})*))?(?:\\+[0-9A-Za-z-]+(?:\\.[0-9A-Za-z-]+)*)?$`);

export function npmDistTag(version) {
  const match = typeof version === 'string' && version.trim() === version && versionPattern.exec(version);
  if (!match) throw new Error('Expected a valid package version');
  return match[1] ? 'next' : 'latest';
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const { version: tokens } = JSON.parse(readFileSync('packages/tokens/package.json', 'utf8'));
    const { version: components } = JSON.parse(readFileSync('packages/components/package.json', 'utf8'));
    if (tokens !== components) throw new Error('Both packages must have the same version before publishing');
    console.log(npmDistTag(components));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
