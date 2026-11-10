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
| `packages/components` | `@codechem/components` | The Lit web components: `<cc-button>`, `<cc-alert>`, `<cc-badge>`, `<cc-checkbox>`, `<cc-link>`, `<cc-radio-group>` with `<cc-radio>`, `<cc-tooltip>`, `<cc-textarea>`, `<cc-text-input>`, `<cc-number-input-stepper>`, `<cc-list-item>`, `<cc-chip>`, `<cc-pagination>`, `<cc-switch>`, `<cc-tab>`, `<cc-accordion>`, `<cc-dialog>` |
| `apps/storybook` | `@codechem/storybook` | Storybook site to browse, try and document the components |

## Prerequisites

- **Node.js 26** (current LTS) is recommended; the version is in `.nvmrc`. The minimum is 22.12, which Vite, Vitest and Style Dictionary need.
- **npm 10** or newer (comes with Node). npm 12 is recommended; it needs Node 22.22.2+, 24.15+ or 26.

Check with:

```sh
node -v
npm -v
```

## Setup

```sh
git clone https://github.com/codechem/system.git
cd system

# 0. Switch to the project's Node version from .nvmrc
mise trust && mise install   # mise: trust mise.toml once; installs Node and npm 12, then switches on cd
# or: nvm install            # nvm, fnm and others read .nvmrc too

# 1. Install dependencies for every workspace
npm install

# 2. Build the tokens and components
npm run build

# 3. Download the browser the tests run in (one time)
npx playwright install chromium
```

On npm 12 the install doesn't run dependency install scripts unless they're approved. The three packages that have one (`esbuild`, `fsevents`, `rs-module-lexer`) are denied in `allowScripts` in the root `package.json`, because they work without them.

Components load the default tokens themselves: `@codechem/tokens` is a dependency of `@codechem/components`, and importing any component adds the token stylesheet to the page once, inside `@layer cc-tokens`. Your own `:root { --cc-…: … }` or `data-theme` CSS therefore wins without `!important`. Import `@codechem/tokens/tokens.css` only if you want the variables without any component. The fonts (Kumbh Sans, Material Icons Round) are not part of the tokens: load them in your app.

`npm run build` creates `packages/tokens/dist/tokens.css` and `packages/components/dist`. The `dist` folders are gitignored, so run it again after pulling token changes.

## Run locally

### Storybook

```sh
npm run storybook
```

This builds the tokens, generates the components' Custom Elements Manifest (which drives the Storybook controls and docs), then opens Storybook at <http://localhost:6006>.

Component and story changes reload live. Restart the command after changing tokens, or after adding or renaming a property, slot or event, so the Controls and Docs tables pick it up.

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
    modes/          Other Figma modes (e.g. mobile typography), exported but not built yet
    dist/           Generated tokens.css (gitignored)
  components/
    src/
      button/       cc-button.ts, .stories.ts, .test.ts
      alert/
      badge/
      checkbox/
      link/
      radio/        cc-radio-group.ts and cc-radio.ts
      tooltip/
      textarea/
      text-input/
      number-input-stepper/
      list-item/
      chip/
      pagination/
      switch/
      tab/
      accordion/
      dialog/
      index.ts      Exports every component
apps/
  storybook/
    .storybook/     Storybook config: loads tokens.css, the Kumbh Sans and Material Icons Round fonts and the manifest
```

## Adding a component

With Claude Code, run `/create-cc-component <figma-url>`. It reads the component set from Figma, then writes the component, stories and tests. It registers the component, verifies it, and writes a reviewed write-up in `docs/superpowers/`. It never commits. The steps it follows are in `.claude/skills/create-cc-component/SKILL.md`.

To do it by hand: each component lives in its own folder under `packages/components/src/<name>/` with three files:

1. `cc-<name>.ts`: the Lit element. Use the `--cc-*` tokens for every colour, spacing and font value.
2. `cc-<name>.stories.ts`: picked up by Storybook automatically.
3. `cc-<name>.test.ts`: picked up by `npm test` automatically.

Then register it in two places:

- `packages/components/src/index.ts`: `export { CcName } from './<name>/cc-<name>.js';`
- `packages/components/package.json` → `exports`: add a `"./<name>.js"` entry so apps can import it on its own.

## Updating tokens

Token values come from Figma Variables. To update them, replace the JSON in `packages/tokens/src` with the new export, then:

```sh
npm run build -w @codechem/tokens
```

Search for a token name in `packages/tokens/dist/tokens.css` to see its final value. VS Code search skips this file because it's gitignored.

## Using the components in an app

> The packages aren't published to npm yet. Until they are, use them inside this repo or install a local tarball made with `npm pack`.

The components read their styles from the token CSS variables and draw their icons with the [Material Icons Round](https://fonts.google.com/icons?icon.set=Material+Icons&icon.style=Rounded) font. An app loads the tokens and both fonts once, then imports the components:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Kumbh+Sans:YOPQ,wght@40..300,100..900&display=swap" />
<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" />
```

Without the icon font, icons show up as their names (e.g. "check_box"). The same font gives you every other Material icon for slots, such as a button icon: `<span slot="leading" class="material-icons-round" aria-hidden="true">add</span>`. Keep `aria-hidden` so screen readers don't read the icon name as part of the label.

```js
import '@codechem/tokens/tokens.css';
import '@codechem/components';           // every component
// or only what you need:
import '@codechem/components/badge.js';
```

This needs a bundler such as Vite or webpack, which every React, Vue or Angular setup already has. Once imported, the tags work the same in any framework.

## Editor support (VS Code)

`npm run analyze -w @codechem/components` (also part of `npm run build`) generates `packages/components/vscode.html-custom-data.json`. To get autocomplete and hover docs for `<cc-*>` tags and their attributes in HTML files, add it to your workspace `.vscode/settings.json`. That file is gitignored, so it stays on your machine:

```json
"html.customData": ["./packages/components/vscode.html-custom-data.json"]
```
