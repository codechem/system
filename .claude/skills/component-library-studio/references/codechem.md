# CodeChem design system (`@codechem/components`, `--cc-*`)

Notes from building `apps/site` in this repo. Re-check versions, because the published package can trail the repo.

## Install and load

- `npm i @codechem/components` brings `@codechem/tokens` and `lit` with it. A bundler is required (bare imports).
- `import '@codechem/components'` registers everything, and per-component entries exist (`@codechem/components/button.js`). Check `node_modules/@codechem/components/package.json` → `exports` for what the installed version really has. **0.0.4 does not ship `cc-navigation-drawer`**, even though the repo has it.
- Importing any component injects the tokens into `:root` inside `@layer cc-tokens`, so a plain `:root { --cc-accent-main: … }` overrides them without `!important`.
- Fonts: Kumbh Sans (text) and Material Icons Round (icon ligatures). Check whether the installed version bundles them. Older versions need Google Fonts `<link>` tags.
- **Astro:** a boolean prop on a custom element renders as a string, so `checked={false}` becomes `checked="false"`, which still counts as checked. Write `checked={on || undefined}`. To avoid a flash of unstyled chrome before the JS adds the tokens, also `@import '@codechem/tokens/tokens.css' layer(cc-tokens);` in the page CSS.
- In a monorepo, an app inside the npm workspaces can silently symlink the local packages instead of using npm. Pin exact versions (`"@codechem/components": "0.0.4"`, plus `@codechem/tokens` too, because components declare `"@codechem/tokens": "*"`), then confirm `apps/<app>/node_modules/@codechem/*` are real folders, not symlinks.

## Tokens

- **Dark-only.** `--cc-background` and `--cc-surface-surface-0` are gray-800 (#1a202c), and the text tokens are white or light grey. There are no light mode and no `data-theme`.
- **Surfaces:** `surface-shade` < `surface-0` < `surface-1` < `surface-2` < `surface-highlight`, plus `*-transparent` variants. Use `surface-highlight` for hairlines.
- **Text:** `--cc-text-high-emphasis`, `-medium-emphasis`, `-low-emphasis` and `-disabled`.
- **Accent:** `--cc-accent-light/main/dark/shade/contrast/transparent`, backed by `--cc-palette-green-300/600/800/900`, white, and `green-opacity`. CC green is `#008854` (green-600).
- **Palettes** for re-theming: gray, red, orange, yellow, green, teal, cyan, blue, purple and pink, in steps 50–900 plus `-opacity`.
- **Status:** `--cc-alert-{error,warning,info,success}-{lightest,light,main,dark,transparent,contrast}` and `--cc-status-<hue>-{light,main,dark,contrast,transparent}`. In tokens 0.0.x, every `--cc-status-*-transparent` resolves to `#ffffff`, which looks like a Figma export bug. Don't use them.
- **Shape:** `--cc-radius` (4px by default) and `--cc-round` (999px). Most components read `--cc-radius`. Typeface is `--cc-typeface-typeface`.

## Component API traps

- `cc-tab` does not manage selection. Put the tabs inside `role="tablist"`, and on click toggle `selected` on the clicked tab yourself.
- `cc-pagination` needs `page`, `total` and `pageSize` set as **properties** from JS. Attributes alone render nothing useful.
- `cc-dialog` opens with the `open` attribute. Add a click handler on a trigger, and close it by removing `open`. Buttons go in `slot="actions"`.
- `cc-list-item` shows a remove button unless `hide-remove-button` is set. Its leading icon comes from `leading="icon" icon="<ligature>"`. Put the items inside `role="list"`.
- `cc-tooltip` uses `for="<id>"` and anchor positioning, so the trigger needs an `id`.
- `cc-badge`: `color` takes one of the 10 hues, `variant` is solid/subtle/outline, and `type` is text/number/dot.
- `cc-button`: `variant` is filled/outlined/text/accent and `color` is primary/secondary/destructive. A `<cc-button>` is a button, so use a real `<a>` styled with tokens for navigation.
- `cc-calendar` needs about 20rem of width. Give its container `min-width: 20rem` or let it span.
- Icons: `<span slot="leading" class="material-icons-round" aria-hidden="true">add</span>`.

## Existing products: don't clone them

**C3RM (also shown as "3RM" in Figma)** is an existing CodeChem product built on these tokens. Its layout identity is a dark left sidebar with a green active item, a page title with a back arrow, and a stack or grid of bordered slate cards. Alerts float as solid colour blocks. New screens, even HR or recruiting screens "for the same app", must **not** reproduce that composition unless the user explicitly asks for the C3RM layout. Diverge on navigation (top bar, section rail, list–detail), surfaces (flat hairline sections, an open canvas) and accent placement (a headline band, selection state). See SKILL.md step 1b.

## Brand cues

- The brand is the **green, the hexagon mark and Kumbh Sans**, not any product's layout.
- Logo: use the real artwork from Figma (file `K7Z7bb2IjqiyDjik5qjEoN`, frame "Logo" `373:15603`), never a hand-drawn approximation. It is a rounded hexagon in `#00B871` (a logo-only green, not a token) with a solid dark "C" shape in `#1A202C` (`--cc-palette-gray-800`), on a 42×48 viewBox. `apps/site/src/components/Logo.astro` holds the paths.
- Personality (from `apps/site/PRODUCT.md`): precise, calm and crafted, for public showcase and hiring. Avoid neon/glass dev-tool looks and generic SaaS landing pages.
