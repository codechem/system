import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const run = (cmd, ...args) => execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

try {
  const published = run('npm', 'view', '@codechem/tokens', 'version');
  let lastTag;
  try {
    lastTag = run('git', 'describe', '--tags', '--abbrev=0', '--match', 'tokens-v*');
  } catch {
  }
  if (lastTag) {
    try {
      run('git', 'diff', '--quiet', lastTag, 'HEAD', '--', 'packages/tokens');
    } catch {
      throw new Error(`packages/tokens changed since ${lastTag}; release tokens first.`);
    }
  }
  const file = 'packages/components/package.json';
  const pkg = JSON.parse(readFileSync(file, 'utf8'));
  pkg.dependencies['@codechem/tokens'] = `^${published}`;
  writeFileSync(file, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log(`@codechem/tokens pinned to ^${published}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
