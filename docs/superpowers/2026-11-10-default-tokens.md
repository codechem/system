# Default tokens loaded by the components

**Date:** 2026-11-10
**Changes:** uncommitted in the working tree.

## Goal

A consumer who installs only `@codechem/components` gets styled components. Before, `@codechem/tokens` was a devDependency, nothing imported `tokens.css`, and every `var(--cc-*)` was unset, so the components rendered unstyled and silently.

## Decisions

- **`@codechem/tokens` is a normal `dependency`** of `@codechem/components` (not a peer): one install brings both, with no peer error. Tokens stays its own package for the Figma pipeline and for people who want only the CSS.
- **The components inject the tokens** through `src/shared/load-tokens.ts`, imported by every component. It adopts one `CSSStyleSheet` into `document.adoptedStyleSheets`, guarded by a `Symbol.for` flag on `globalThis` so many components, or two copies of the package, add it once. It needs no bundler CSS handling, so it works from a plain `<script type="module">`.
- **The sheet sits in `@layer cc-tokens`.** Unlayered app CSS (`:root { --cc-…: … }`, `[data-theme]`) beats it without `!important`.
- **Tokens exports `./sheet.js`:** `scripts/build-sheet.mjs` runs after Style Dictionary and writes `dist/tokens-sheet.js` and `.d.ts` (the CSS string wrapped in the layer). `tokens.css` is unchanged.
- **Root `build`** now builds tokens first, then components (the workspaces order was alphabetical, and components now needs tokens' `dist` types).

## Verification

- `src/shared/load-tokens.test.ts`: tokens exist after importing only a component (no `tokens.css`); the sheet is added once; an app override wins. The first test fails when the loader import is removed from the component.
- `tsc` clean, `vitest` 139/139, `npm run build` succeeds.

## Left out

- **Fonts:** Kumbh Sans and Material Icons Round are still loaded by the app (Storybook does it). Without them the components fall back to system fonts and icon names show as text. Same "silent" problem; needs its own decision.
- **Size:** every consumer gets the full token set (~16 KB of CSS, not minified). Not measured against a real bundle.
- **Dark/other themes:** the sheet holds only what `tokens.css` holds today (`:root`).
- **Shadow-root-only hosts:** the sheet is adopted by the main document. A component used only inside another shadow root still inherits nothing from there unless the app loads the tokens in that root too.
- **Version pin:** the dependency is `"*"` like the dev one before it; give it a real range when publishing.
