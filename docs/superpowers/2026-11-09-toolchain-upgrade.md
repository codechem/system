# Toolchain upgrade: Node 26, npm 12, Vitest 5, mise

**Date:** 2026-11-09
**Base:** `201a2eb`. Changes are uncommitted in the working tree.

## Goal

Move the project and the local machine to the latest versions of Node and the tooling, and let mise pick the project's Node version.

## Requirements

- Node on the **current LTS** (26.x, LTS since 2026-10-28). Node 24 entered maintenance on 2026-10-20.
- All direct dependencies on their latest versions (`npm outdated` empty).
- The project declares its Node version in a way nvm, fnm and mise users all pick up, with one source of truth.
- Everything keeps working: tests, `npm run build`, the analyzer and the Storybook build.
- The README reflects the new setup.

## Starting point

| | Version | Latest |
|---|---|---|
| Node (local, via mise) | 24.22.1 | 26.13.0 LTS |
| npm | 11.19.1 | 12.2.2 |
| vitest, @vitest/browser-playwright | 4.1.12 | 5.1.0 |
| vite | 8.3.6 | 8.3.7 |

Everything else (lit, storybook, style-dictionary, typescript, the cem analyzer, playwright) was already on its latest version.

## Steps taken

1. **Local Node.** Found Node managed by mise (Homebrew), with `eval "$(mise activate zsh)"` in `~/.zshrc` after an older nvm setup. Ran `mise use -g node@26.13.0`, which rewrote `~/.config/mise/config.toml`. Node 24 stays installed.
2. **Local npm.** Node 26 ships npm 11.20.0. Checked that npm 12.2.2 supports Node 26 (`^22.22.2 || ^24.15.0 || >=26.0.0`) and installed it globally there. No other global packages needed moving.
3. **Vitest 5 migration review.** Requires Node `>=22.12.0` and Vite `>=6.4.0`, with Vite now a peer dependency (already a devDependency). Breaking changes that don't affect us:
   - `clearMocks` now defaults to `true`, but our spies are created inside each test.
   - `it.each` title formatting changed, which is cosmetic.
   - No `vi.mock`, `toHaveTextContent` or `sequential` in our code.
   - Artifacts moved from `.vitest-attachments/` to `.vitest/`.
4. **Upgraded dependencies** in `@codechem/components`: `vitest@^5.1.0`, `@vitest/browser-playwright@^5.1.0`, `vite@^8.3.7`.
5. **npm 12 install scripts.** npm 12 no longer runs dependency install scripts unless they're approved. Three were blocked: `esbuild`, `fsevents` and `rs-module-lexer`. Tests, the build, the analyzer and the Storybook build all pass without them, so they are recorded as denied in root `package.json` → `allowScripts`. That stops the warning on every install.
6. **Node version for the project:**
   - `.nvmrc` → `26`, read by nvm and fnm.
   - root `package.json` → `"engines": { "node": "^22.12.0 || ^24.0.0 || >=26.0.0" }`, the same range Vitest 5 accepts. It skips the end-of-life odd releases 23 and 25.
   - `mise.toml` with `idiomatic_version_file_enable_tools = ["node"]`, so mise reads `.nvmrc` instead of a second copy of the version. Verified that changing `.nvmrc` to `24` switches mise to 24.22.1 inside the repo, and back.
7. **`.gitignore`:** `.vitest-attachments/` → `.vitest/`.
8. **README:**
   - Prerequisites: Node 26 recommended, 22.12 minimum; npm 11+, 12 recommended.
   - Setup step 0: `mise trust && mise install`, or `nvm use`.
   - A note on `allowScripts`.

## Verification (Node 26.13.0, npm 12.2.2)

- `npm test`: 31/31 pass.
- `npm run build`: tokens and components build, and the manifest is generated.
- `npm run build-storybook -w @codechem/storybook`: succeeds.
- `npm outdated` for all workspaces: empty.

## Left as is

- `npm audit` reports 6 low or moderate issues, all inside `style-dictionary` and present before this change. The suggested `--force` fix would downgrade it from v5 to v3, so it wasn't applied. They only affect the token build, not shipped code.
- nvm is still loaded in `~/.zshrc` alongside mise. mise takes priority, and removing nvm is the user's call.
- mise itself has an update (2026.11.4) available through Homebrew.

## Review

Reviewed with `superpowers:requesting-code-review` by a separate reviewer agent. It checked every claim by running it, including a clean `npm ci` on npm 12 and on npm 11 in a fresh copy. The verdict was "ready with fixes", with no critical or important issues.

Confirmed by the reviewer:
- the Vitest 5 config;
- the `allowScripts: false` semantics, and that denying is safe on macOS, Linux and Windows (prebuilt platform packages are in the lockfile);
- the mise settings in the project file, and that `mise trust` is needed;
- that `.vitest/` is the new output folder;
- that the lockfile only changed as the upgrade implies.

| Finding | Fix |
|---|---|
| Lockfile root entry was missing the new `engines` | `npm install --package-lock-only` |
| README "npm 11 or newer" was wrong for Node 22, which ships npm 10.9 | Back to npm 10+; noted npm 12's Node requirement |
| `engines` `>=22.12` allowed Node 23 and 25, which Vitest 5 excludes | `^22.12.0 \|\| ^24.0.0 \|\| >=26.0.0` |
| `nvm use` fails when Node 26 isn't installed yet | `nvm install` |
| `mise trust` purpose unclear | Comment says it trusts `mise.toml` once, then switches on `cd` |

After the fixes: `npm test` passes 31/31.

## Follow-up: npm pinned through mise

`mise.toml` now also has `[tools] npm = "12"`. Without it, someone on Node 26 who never upgraded npm would get npm 11.20, which ignores `allowScripts`. `mise which npm` resolves to mise's own npm 12.2.2 install rather than the npm bundled with Node. `npm test` (31/31) and `npm install` work through it, and the lockfile is unchanged. nvm and fnm users still upgrade npm themselves.
