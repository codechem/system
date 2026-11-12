# Independent package releases

**Date:** 2026-11-12

## Problem

One `vX.Y.Z` tag published both packages with the same version, even when only one changed.

## Decision

The tag names the package: `tokens-vX.Y.Z` or `components-vX.Y.Z`. The workflow publishes only that package. No diff is used to trigger a publish. A diff cannot say whether a change is major, minor or patch, and a person still picks the version.

## Changes

- `release.yml`: triggers on `tokens-v*` / `components-v*`. `scripts/release-target.mjs` reads package, version and dist-tag from the tag. Only `-w @codechem/<pkg>` is versioned and published.
- `scripts/pin-tokens.mjs` (components only): rewrites the `@codechem/tokens` dependency from `*` to `^<latest published tokens>` on the runner, and fails if `packages/tokens` changed since the last `tokens-v*` tag. The repo keeps `*` so workspace linking still works. Ceiling: with no `tokens-v*` tag yet (only legacy `v*`), the unreleased-changes guard is skipped.
- `scripts/check-token-breaking.mjs` (tokens only): compares the `--cc-*` declarations in the built `tokens.css` with the last published tarball. A removed or renamed token requires a breaking bump (minor below 1.0.0, major after). Usages (`var(--x)`) are not counted.
- `release-notes.mjs`: the baseline is the nearest tag of the same package (legacy unprefixed `v*` tags count for both), and commits are limited to `packages/<pkg>`.
- `npm-dist-tag.mjs`: dropped the CLI and its "both packages must match" check. `npmDistTag` is still used.
- README, CLAUDE.md and the demo walkthrough describe the new flow and the version table.

## Versioning rules

| Change | Bump |
|---|---|
| Token renamed or removed; component attribute, slot, event or part removed or renamed | major |
| New token or component; new option | minor |
| Token value tweak, bugfix | patch |

Below 1.0.0 a breaking change bumps the minor.

## Release order and the site

- Tokens first, then components, if both changed.
- `apps/site` pins exact versions of both packages. Bump both together after a release, or a second copy of tokens gets installed. `load-tokens.ts` injects only the first copy loaded, so the site's token values would depend on import order. Not automated.

## Not done / caveats

- Not run on GitHub yet; only the script tests (`node --test scripts/`, 32 passing) were run.
- For 0.0.x versions, `^0.0.7` means exactly `0.0.7`, so tokens patches are not picked up by components until it is re-released.
- The first `tokens-v*` and `components-v*` tags should be higher than the last lock-step version (0.0.6) because the npm versions already exist.
- No code review was run on this change.
