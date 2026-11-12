# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

CodeChem design system: framework-agnostic Lit web components (`<cc-*>`) styled by `--cc-*` CSS custom properties exported from Figma Variables. npm workspaces monorepo (Node ^22.12 / 24 / 26, see `.nvmrc`). The two published packages are versioned and released independently.

- `packages/tokens` (`@codechem/tokens`): Figma Variables JSON in `src/` → Style Dictionary → `dist/tokens.css` + `dist/tokens-sheet.js` (the CSS wrapped in `@layer cc-tokens`, as a string).
- `packages/components` (`@codechem/components`): the Lit components.
- `apps/storybook` (`@codechem/storybook`): Storybook + MDX docs (Getting started, Tokens, Icons).
- `apps/site` (`@codechem/site`): Astro public frontpage/docs (system.codechem.dev). It depends on the **published** npm versions of the packages (pinned, e.g. `0.0.5`), not the workspace sources. Design intent lives in `apps/site/PRODUCT.md`.

## Commands

Run from the repo root unless noted.

```sh
npm install
npm run build                                   # tokens, then components (dist/ is gitignored; rebuild after token changes)
npm test                                        # Vitest browser mode (real headless Chromium) across workspaces
npx playwright install chromium                 # one-time, needed for tests
npm exec -w @codechem/components -- vitest      # watch mode
npm exec -w @codechem/components -- vitest run src/button/cc-button.test.ts   # single test file
npm run storybook                               # builds tokens + manifest, serves :6006
npm run build -w @codechem/tokens               # tokens only
npm run analyze -w @codechem/components         # regenerate custom-elements.json + VS Code HTML data
npm run dev -w @codechem/site                   # Astro dev server (apps/site)
node --test scripts/                            # releagstse-script tests (create-release, release-notes)
```

Restart Storybook after adding/renaming a property, slot or event so the manifest-driven Controls/Docs refresh. There is no lint script.

## Component architecture

Each component lives in `packages/components/src/<name>/` as `cc-<name>.ts`, `cc-<name>.stories.ts`, `cc-<name>.test.ts`. Conventions seen across components:

- Plain Lit `LitElement` with `static properties` and `declare` fields (no decorators); defaults set in the constructor; attributes reflect.
- Every component imports `../shared/load-tokens.js`, which injects the token stylesheet once into the page (inside `@layer cc-tokens`, so consumer overrides win without `!important`). `shared/load-fonts.ts` and `icon-styles.ts` handle the bundled Kumbh Sans / Material Icons Round fonts (copied into `dist` by `scripts/copy-fonts.mjs`).
- Use `--cc-*` tokens for all colour, spacing and font values.
- JSDoc tags (`@slot`, `@csspart`, `@internal`, etc.) are read by the Custom Elements Manifest analyzer, which drives Storybook controls and VS Code data. Keep them; they are not just comments.

**Registering a new component requires two edits** besides its folder: an `export` in `packages/components/src/index.ts` and a `"./<name>.js"` entry in `packages/components/package.json` `exports`. The `/create-cc-component <figma-url>` skill (`.claude/skills/create-cc-component`) automates the whole flow and never commits.

## Release & CI

- Push `tokens-vX.Y.Z` or `components-vX.Y.Z` → `.github/workflows/release.yml` runs tests, sets only that package's version, publishes it to npm with provenance, then creates a GitHub Release (`scripts/release-notes.mjs`, `create-release.mjs`). Prerelease versions publish under the `next` dist-tag. Release tokens before components; components is published with the tokens dependency pinned to `^<latest published tokens>`, and a tokens release fails if `--cc-*` tokens were removed without a breaking bump (see README).
- `deploy-site.yml` triggers a Dokploy webhook after CI passes on `main`; `deploy-storybook.yml` publishes Storybook. Because the site pins published package versions, site changes that need new component code require a release plus a version bump in `apps/site/package.json`.

## Project conventions

- Write/update `docs/superpowers/<date>-<topic>.md` for every important change, including review results.
- All code, tests and sample strings in English; use "John Doe" for sample names.
- Keep code comments minimal; no `.vscode`/editor settings committed.
- New `cc-*` screens must not clone C3RM's sidebar + card layout.
