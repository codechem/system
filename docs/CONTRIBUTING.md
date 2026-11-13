# Contributing

Thanks for helping improve CodeChem Design System. [Open an issue](https://github.com/codechem/system/issues) to report a bug or discuss a change, or submit a pull request with a focused change and tests.

Looking to use the components in an app? Start with the [README](../README.md) and [documentation](https://system.codechem.dev/getting-started/). Release and deployment instructions live in the [maintainer guide](MAINTAINING.md).

## Local setup

Use the Node version in `.nvmrc` (Node 26). The supported Node ranges are `^22.12.0 || ^24.0.0 || >=26.0.0`. Use npm 10 or newer; npm 12 is recommended and requires Node 22.22.2+, 24.15+ or 26.

```sh
git clone https://github.com/codechem/system.git
cd system

# Use the project's toolchain with mise, or run nvm install.
mise trust && mise install

npm install
npm run build
npx playwright install chromium
```

On npm 12, dependency install scripts require approval. The root `allowScripts` configuration denies `esbuild`, `fsevents`, and `rs-module-lexer` because they work without those scripts.

`npm run build` creates `packages/tokens/dist/tokens.css` and `packages/components/dist`. These directories are gitignored; rebuild after pulling token changes. Component imports load the tokens and bundled Kumbh Sans and Material Icons Round fonts automatically. Tokens are loaded inside `@layer cc-tokens`, so application CSS can override them without `!important`. Import `@codechem/tokens/tokens.css` directly only when using tokens without components; the tokens package alone does not load fonts.

## Project layout

This is an npm workspaces monorepo:

| Path | Purpose |
|---|---|
| `packages/components` | Published `@codechem/components`: Lit components, colocated stories and browser tests |
| `packages/tokens` | Published `@codechem/tokens`: Figma Variables JSON compiled with Style Dictionary |
| `apps/storybook` | Usage guides, API references and interactive component stories |
| `apps/site` | Astro public site; uses pinned published packages, not workspace sources |

Each published package has its own README for npm. Token sources live in `packages/tokens/src/*.tokens.json`; aliases are restored at build time. `typography-mobile.tokens.json` is exported but not built yet.

## Storybook and documentation

```sh
npm run storybook
```

This builds tokens, components and the Custom Elements Manifest, then starts Storybook at <http://localhost:6006>. The compiled package is required by the documentation examples; generating the manifest alone is not sufficient.

Component and story changes reload live. Restart after changing tokens or adding or renaming a property, slot or event so Controls and Docs tables refresh.

Guides live in `apps/storybook/src/docs/`. Component Docs pages share `ComponentDocs.tsx` and reviewed consumer guidance in `component-guides.ts`; API references read the manifest and exclude internal Lit state. Add a guide entry when introducing a component. Examples must use public package exports and explain application-managed state. The Tokens page reads built `tokens.css` through `apps/storybook/src/tokens.ts`.

Check every documentation route at desktop and phone widths:

```sh
npm run build-storybook
npm run test:docs -w @codechem/storybook
```

The browser suite serves the production build on an ephemeral localhost port and shuts it down afterward. It checks Markdown rendering, copy buttons, documentation links, package imports, API filtering, live examples, native form submission, theme tokens, navigation contrast and page overflow. It also server-renders the copied React example without browser registration. To check a running development server, set `STORYBOOK_URL=http://localhost:6006` on the test command. Fenced Markdown uses a shared copyable renderer; GFM tables are enabled in `.storybook/main.ts`.

## Tests and coverage

After building and installing Chromium:

```sh
npm test
npm run test:coverage
```

Tests use Vitest browser mode in real headless Chromium, including Shadow DOM, layout and focus. Tests live beside each component, for example `packages/components/src/badge/cc-badge.test.ts`.

Coverage includes all production TypeScript in `packages/components/src`, including untested files, but excludes tests, stories and declarations. Overall statements, branches, functions and lines must each reach **85%**. Applications, release scripts and token generation are outside this scope. The HTML report is at `packages/components/coverage/index.html`; LCOV data is at `packages/components/coverage/lcov.info`. CI uploads the `component-coverage` artifact even when coverage fails; failed coverage blocks publishing.

Watch tests while developing:

```sh
npm exec -w @codechem/components -- vitest
```

## Adding a component

Each component lives in `packages/components/src/<name>/` with three files:

1. `cc-<name>.ts`: the Lit element. Use `--cc-*` tokens for colours, spacing and font values.
2. `cc-<name>.stories.ts`: discovered by Storybook automatically.
3. `cc-<name>.test.ts`: discovered by `npm test` automatically.

Register it in two places:

- `packages/components/src/index.ts`: `export { CcName } from './<name>/cc-<name>.js';`
- `packages/components/package.json` → `exports`: add a `"./<name>.js"` entry for individual imports.

With Claude Code, `/create-cc-component <figma-url>` reads the Figma component set and creates the component, stories, tests, registration and a reviewed write-up in `docs/superpowers/`. It never commits. Its workflow is in [the component skill](../.claude/skills/create-cc-component/SKILL.md).

## Updating tokens

Replace the Figma Variables JSON exports in `packages/tokens/src`, then run:

```sh
npm run build -w @codechem/tokens
```

Search `packages/tokens/dist/tokens.css` to see final token values. VS Code search skips that file by default because it is gitignored.

## Pull requests

Use a Conventional Commit title, such as `feat: add calendar`, `fix(button): preserve focus`, or `feat!: remove deprecated API`. Allowed types are `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, and `revert`; scopes are optional.

## Command reference

Run commands from the repository root:

| Command | Purpose |
|---|---|
| `npm install` | Install dependencies and link workspaces |
| `npm run build` | Build tokens and components |
| `npm test` | Run component browser tests |
| `npm run test:coverage` | Run component tests with the coverage gate |
| `npm run storybook` | Build packages and start Storybook on port 6006 |
| `npm run build -w @codechem/tokens` | Rebuild tokens only |
| `npm run analyze -w @codechem/components` | Regenerate the manifest and VS Code HTML data |
| `npm run build-storybook` | Build packages and static Storybook into `apps/storybook/storybook-static` |
| `npm run dev -w @codechem/site` | Start the Astro site locally |

## Editor support

`npm run analyze -w @codechem/components` (also part of the build) generates `packages/components/vscode.html-custom-data.json`. For HTML autocomplete and hover documentation, add the following to your local `.vscode/settings.json`, which is gitignored:

```json
{
  "html.customData": ["./packages/components/vscode.html-custom-data.json"]
}
```
