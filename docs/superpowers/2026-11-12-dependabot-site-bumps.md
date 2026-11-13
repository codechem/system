# Site package bumps after a release

**Date:** 2026-11-12 (updated 2026-11-13)

## Goal

After a package release, the site's pinned `@codechem/*` versions are bumped and redeployed without manual steps.

## What was tried: Dependabot (removed)

- The first run found no update. The log said `Filtered out 4 versions due to cooldown`: Dependabot applies a default 3-day cooldown, and 0.0.4 to 0.0.7 were newer than that. `cooldown: default-days: 0` fixed this.
- The second run found `Latest version is 0.0.7` but ended with `No update possible`. The equivalent `npm install ... -w @codechem/site --save-exact --package-lock-only` worked locally, so the limit was in Dependabot. Likely cause (not confirmed): the repo has workspace packages with the same names as the site's dependencies.
- `dependabot.yml` and `dependabot-automerge.yml` were removed.

## Current design: `.github/workflows/bump-site.yml`

- Triggers after `CI` completes successfully for a push of a `tokens-v*` or `components-v*` tag (publish is part of that run), or manually (`workflow_dispatch`).
- Reads the latest published versions with `npm view`, pins both in `apps/site/package.json` and the lockfile (`--save-exact --package-lock-only`), and stops if nothing changed.
- Runs `npm ci`, the root build and the site build as the check, then commits to `main` and dispatches `deploy-site.yml`.
- Pushes made with `GITHUB_TOKEN` do not start CI or the `workflow_run` deploy, so the deploy is dispatched explicitly. CI does not run on `main` for these commits; the in-workflow site build is the gate.
- A direct commit instead of a PR: creating PRs from Actions needs a repository setting that may be off, and a PR opened with `GITHUB_TOKEN` would not get a CI run anyway.
- `concurrency` serializes the two runs when tokens and components are tagged close together; the second run sees both versions already pinned.

## Caveats

- Not run on GitHub yet; first test with Actions, Bump site packages, Run workflow.
- Requires that `main` accepts pushes from `github-actions[bot]` (no branch protection blocking it). Repository settings were not checked.
