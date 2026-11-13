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
- Compares `major.minor` of each package with what the site pins. Patch only: build check, then commit to `main` and dispatch `deploy-site.yml`. Minor or major change: push the branch `chore/bump-site-packages` and open (or update) a pull request. The workflow never merges or closes it; a reviewer merges it, which pushes to `main` and deploys through the normal CI plus Dokploy path. Closing it without merging drops the bump.
- For the PR path the site build is `continue-on-error`; the PR description states whether it passed.
- Pushes and PRs made with `GITHUB_TOKEN` do not start CI, so the patch path dispatches the deploy explicitly and the PR has no CI run; the in-workflow site build is the check.
- `concurrency` serializes runs when tokens and components are tagged close together.

## Caveats

- Not run on GitHub yet; first test with Actions, Bump site packages, Run workflow.
- Needs `main` to accept pushes from `github-actions[bot]`, and the setting Actions, General, Workflow permissions, "Allow GitHub Actions to create and approve pull requests" for the PR path. Repository settings were not checked.
- "Breaking" is approximated as any minor or major bump. Below 1.0.0 that matches the versioning rules; after 1.0.0 it also holds back new-feature minors.
