# Dependabot bumps for the site

**Date:** 2026-11-12

## Goal

After a package release, the site's pinned `@codechem/*` versions are bumped, merged and redeployed without manual steps.

## Design

- `.github/dependabot.yml`: npm, repo root (the lockfile lives there), only `@codechem/*`, one grouped PR so tokens and components move together.
- `.github/workflows/dependabot-automerge.yml`: runs after CI completes. For a successful `pull_request` run by `dependabot[bot]`, it finds the PR, refuses if it touches anything but `apps/site/package.json` and `package-lock.json`, squash-merges it, then dispatches `deploy-site.yml`.
- The deploy is dispatched explicitly because a merge made with `GITHUB_TOKEN` does not trigger the push-based CI and `workflow_run` deploy.

## Caveats

- Not run on GitHub yet.
- Merging needs no required reviews on `main`; with a required-approval rule the merge step fails. Repository settings were not checked.
- CI does not run again on `main` after these merges; the PR's CI run is the gate.
- Dependabot's handling of npm workspaces was not verified; check the first run in Insights, Dependency graph, Dependabot.
