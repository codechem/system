import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export const tokenNames = (css) => new Set(css.match(/--[\w-]+(?=\s*:)/g));

export function removedTokens(oldCss, newCss) {
  const next = tokenNames(newCss);
  return [...tokenNames(oldCss)].filter((name) => !next.has(name));
}

// Below 1.0.0 a breaking change bumps the minor version.
export function isBreakingBump(previous, next) {
  const [pa, pb] = previous.split(/[-+]/)[0].split('.').map(Number);
  const [na, nb] = next.split(/[-+]/)[0].split('.').map(Number);
  return pa > 0 ? na > pa : na > pa || nb > pb;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const run = (cmd, ...args) => execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
    const next = JSON.parse(readFileSync('packages/tokens/package.json', 'utf8')).version;
    let previous;
    try {
      previous = run('npm', 'view', '@codechem/tokens', 'version');
    } catch (error) {
      if (!/E404/.test(error.stderr)) throw error;
    }
    if (!previous) console.log('No published tokens yet; nothing to compare.');
    else {
      const dir = mkdtempSync(join(tmpdir(), 'tokens-'));
      const file = join(dir, run('npm', 'pack', `@codechem/tokens@${previous}`, '--pack-destination', dir).split('\n').at(-1));
      const removed = removedTokens(run('tar', '-xzOf', file, 'package/dist/tokens.css'), readFileSync('packages/tokens/dist/tokens.css', 'utf8'));
      if (removed.length && !isBreakingBump(previous, next)) {
        throw new Error(`Tokens removed or renamed since ${previous}, so ${next} must be a breaking bump:\n${removed.join('\n')}`);
      }
      console.log(`${removed.length} token(s) removed since ${previous}; ${next} is allowed.`);
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
