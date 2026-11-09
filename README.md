# CodeChem Design System

Framework-agnostic web components built with [Lit](https://lit.dev), styled with design tokens exported from the CodeChem Figma design system.

```html
<cc-button variant="filled">Save</cc-button>
<cc-alert status="success" dismissible><span slot="title">Saved</span>Your changes are live.</cc-alert>
<cc-badge color="purple" variant="subtle">Beta</cc-badge>
```

## What's inside

This is an npm workspaces monorepo:

| Path | Package | What it is |
|---|---|---|
| `packages/tokens` | `@codechem/tokens` | Figma Variables as JSON, compiled to CSS custom properties (`--cc-*`) with Style Dictionary |
| `packages/components` | `@codechem/components` | The Lit web components: `<cc-button>`, `<cc-alert>`, `<cc-badge>` |
| `apps/storybook` | `@codechem/storybook` | Storybook site to browse, try and document the components |

## Prerequisites

- **Node.js 22** or newer (developed on Node 24)
- **npm 10** or newer (comes with Node)

Check with:

```sh
node -v
npm -v
```

## Setup

```sh
git clone <repo-url>
cd web_component_library

# 1. Install dependencies for every workspace
npm install

# 2. Build the tokens and components
npm run build

# 3. Download the browser the tests run in (one time)
npx playwright install chromium
```

`npm run build` creates `packages/tokens/dist/tokens.css` and `packages/components/dist`. The `dist` folders are gitignored, so run it again after pulling token changes.

## Run locally

### Storybook

```sh
npm run storybook
```

This builds the tokens, generates the components' Custom Elements Manifest (which drives the Storybook controls and docs), then opens Storybook at <http://localhost:6006>.

Component changes reload live. Token changes need a restart of the command.

### Tests

```sh
npm test
```

Tests use Vitest in **browser mode**: they run in a real headless Chromium, so Shadow DOM, layout and focus behave exactly like in an app. Each component has its tests next to it, e.g. `packages/components/src/badge/cc-badge.test.ts`.

To re-run tests on every save while you work:

```sh
npm exec -w @codechem/components -- vitest
```

## Common commands

Run from the repo root:

| Command | What it does |
|---|---|
| `npm install` | Installs dependencies and links the workspaces together |
| `npm run build` | Builds tokens and components into their `dist` folders |
| `npm test` | Runs all component tests in headless Chromium |
| `npm run storybook` | Starts Storybook on port 6006 |
| `npm run build -w @codechem/tokens` | Rebuilds only the tokens |
| `npm run analyze -w @codechem/components` | Regenerates `custom-elements.json` and the VS Code HTML data |
| `npm run build-storybook -w @codechem/storybook` | Builds a static Storybook into `apps/storybook/storybook-static` |

## Project layout

```
packages/
  tokens/
    src/            Token JSON exported from Figma Variables
    modes/          Overrides for other modes (e.g. mobile typography)
    dist/           Generated tokens.css (gitignored)
  components/
    src/
      button/       cc-button.ts, .stories.ts, .test.ts
      alert/
      badge/
      index.ts      Exports every component
apps/
  storybook/
    .storybook/     Storybook config: loads tokens.css, the Kumbh Sans font and the manifest
```

## Adding a component

Each component lives in its own folder under `packages/components/src/<name>/` with three files:

1. `cc-<name>.ts`: the Lit element. Use the `--cc-*` tokens for every colour, spacing and font value.
2. `cc-<name>.stories.ts`: picked up by Storybook automatically.
3. `cc-<name>.test.ts`: picked up by `npm test` automatically.

Then register it in two places:

- `packages/components/src/index.ts`: `export { CcName } from './<name>/cc-<name>.js';`
- `packages/components/package.json` → `exports`: add a `"./<name>.js"` entry so apps can import it on its own.

## Updating tokens

Token values come from Figma Variables. To update them, replace the JSON in `packages/tokens/src` (or `modes/`) with the new export, then:

```sh
npm run build -w @codechem/tokens
```

Search for a token name in `packages/tokens/dist/tokens.css` to see its final value. VS Code search skips this file because it's gitignored.

## Using the components in an app

The components read their styles from the token CSS variables, so an app loads the tokens and the font once, then imports the components:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Kumbh+Sans:YOPQ,wght@40..300,100..900&display=swap" />
```

```js
import '@codechem/tokens/tokens.css';
import '@codechem/components';           // every component
// or only what you need:
import '@codechem/components/badge.js';
```

This works the same in plain HTML, React, Vue, Angular or any other framework.

## Editor support (VS Code)

`npm run analyze -w @codechem/components` generates `packages/components/vscode.html-custom-data.json`. To get autocomplete and hover docs for `<cc-*>` tags and their attributes in HTML files, add it to your own VS Code settings:

```json
"html.customData": ["./packages/components/vscode.html-custom-data.json"]
```
