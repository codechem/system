# Maintaining CodeChem Design System

Release and deployment instructions for maintainers. For local setup and component development, see [Contributing](CONTRIBUTING.md).

All commands run from the repository root.

## Releasing to npm

Each package is released on its own, with its own version. The tag name says which one:

```sh
git tag tokens-v0.2.0 && git push origin tokens-v0.2.0
git tag components-v0.3.1 && git push origin components-v0.3.1
```

The `publish` job in `.github/workflows/release.yml` runs after the tests pass and publishes only the package named in the tag, with provenance. Stable versions publish with `--tag latest`; prereleases such as `tokens-v1.0.0-beta.1` publish with `--tag next`. To find the next version, look at the last tag (`git describe --tags --match 'tokens-v*'`) and what changed since (`git diff --stat <tag> HEAD -- packages/tokens`).

Choose the version using these rules. Below 1.0.0, a breaking change bumps the minor instead of the major.

| Change | Bump |
|---|---|
| Token renamed or removed; component attribute, slot, event or part removed or renamed | major |
| New token or component; new option on a component | minor |
| Token value tweak, bugfix | patch |

Rules the pipeline enforces:

- A tokens release fails if a `--cc-*` token disappeared from the last published version without a breaking bump.
- Components publishes with `@codechem/tokens` pinned to `^<latest published tokens>` (the repo keeps `*` for workspace linking), and fails if `packages/tokens` changed since the last `tokens-v*` tag. Release tokens first, then components.
- After a release, `.github/workflows/bump-site.yml` pins both packages in `apps/site/package.json` to the latest published versions (together, to avoid two copies of tokens), checks the site builds, then either commits patch bumps to `main` and triggers the site deploy, or opens a pull request for a reviewer to merge when the minor or major version changed. It can also be run by hand from the Actions tab.

The full setup is in [CI/CD](superpowers/2026-11-09-ci-cd.md); the per-package design is in [Independent package releases](superpowers/2026-11-12-independent-package-releases.md).

### Automatic GitHub release notes

After npm publication succeeds, the `release` job creates a GitHub Release for the stable `tokens-vMAJOR.MINOR.PATCH` or `components-vMAJOR.MINOR.PATCH` tag. It uses the workflow's built-in `GITHUB_TOKEN` (passed to GitHub CLI as `GH_TOKEN`), so no additional secret is needed.

Notes cover all reachable commits touching `packages/<package>` since the preceding stable tag for that package. Legacy unprefixed stable `v*` tags also count as baselines. Tags on unrelated branches, prerelease tags, and aliases at the release commit are not baselines. The first release includes all reachable package history.

Use descriptive conventional commit messages to make the notes useful:

```text
feat(button): add a compact size (#123)
fix(dialog): restore focus when dismissed
docs: explain theme overrides
feat(tokens)!: rename the primary color tokens

BREAKING CHANGE: Replace --cc-old-primary with --cc-primary.
```

- `feat:` → **Features**; `fix:` → **Fixes**; `docs:` → **Documentation**.
- `build:`, `ci:`, `chore:`, `refactor:`, `perf:`, `style:`, and `test:` → **Maintenance**.
- A `!` marker or `BREAKING CHANGE:` / `BREAKING-CHANGE:` footer → **Breaking changes**.
- Other subjects → **Other changes**. Empty sections are omitted.

Each entry links to its commit and includes any commit-body details. Recognizable PR references in subjects (a trailing `(#123)` or `Merge pull request #123`) link to their PRs; other numeric references are left as text. Notes include a commit count, unique Git author names as contributor credits (not guessed GitHub usernames), and a comparison link, or a history link for the first release. Upgrade instructions must be supplied in commit messages; the generator does not invent them. Non-stable tags skip GitHub Release creation without changing npm publication behavior.

Existing GitHub Releases are left unchanged on reruns, preserving manual edits. If npm publishing succeeds but release creation fails, use **Re-run failed jobs** in Actions to retry the release job without publishing again. No historical releases are automatically backfilled.

Test the automation without publishing anything:

```sh
node --test scripts/*.test.mjs
```

## Repository checks

CI runs component coverage and uploads the `component-coverage` artifact even when coverage fails; failed coverage blocks publishing. To block PR merges as well, configure branch protection or a repository ruleset to require the CI workflow's `test` status check.

Add **Semantic PR title** to the ruleset's required checks after the workflow has run. Allow only squash merges and select **Pull request title** as the default squash commit title in repository settings so release notes receive the validated title.

## Deploying Storybook

Storybook is hosted on [Dokploy](https://dokploy.com), which builds it with:

```sh
npm ci && npm run build-storybook   # output: apps/storybook/storybook-static
```

After CI passes on `main`, `.github/workflows/deploy-storybook.yml` calls Dokploy's deploy webhook. You can also run it by hand from the Actions tab. To set it up:

1. In Dokploy, turn on **Auto Deploy** for the app and copy its **webhook URL** from the Deployments tab.
2. In GitHub, add it as a secret named `DOKPLOY_WEBHOOK_URL`, either on the `storybook` environment (Settings → Environments) or on the repository.

The workflow fails if the secret is missing or Dokploy doesn't start a deploy, and prints Dokploy's reply, such as "Branch Not Match".

## Deploying the front page

The Astro front page in `apps/site` uses a separate Dokploy application. After CI passes for a push to `main`, `.github/workflows/deploy-site.yml` calls that application's deploy webhook. You can also run **Deploy site** manually from the Actions tab.

1. Configure the Dokploy application to build the `main` branch using **Dockerfile** `apps/site/Dockerfile`, with the **repository root** as its build context. Route the domain to container port **8080**.
2. Optionally set the `PUBLIC_STORYBOOK_URL` build argument to your public Storybook URL; it is embedded when the site is built.
3. Turn on **Auto Deploy** and copy the application's webhook URL from the Deployments tab.
4. In GitHub, create the `site` environment (Settings → Environments) and add its webhook URL as the environment secret `DOKPLOY_WEBHOOK_URL`.

Use the front-page application's webhook, not Storybook's. The `site` environment secret overrides any repository-level `DOKPLOY_WEBHOOK_URL`; without it, the workflow could call the existing Storybook webhook instead. Storybook continues to use its own workflow and environment independently.

Dokploy runs the build defined in `apps/site/Dockerfile`: `npm run build` followed by `npm run build -w @codechem/site`, then serves `apps/site/dist` with nginx. The workflow fails if the webhook secret is missing or Dokploy returns anything other than HTTP 200.
