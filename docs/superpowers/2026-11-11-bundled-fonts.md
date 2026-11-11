# Bundled fonts in @codechem/components

## Goal

Install `@codechem/components` and get working text and icons with no extra setup. Before this change, the components drew icons with Material Icons Round and text with Kumbh Sans, both loaded from Google Fonts, so an app had to add two `<link>` tags. Without them, icons silently disappeared.

## Decision

This departs from the plan's split into separate packages. Kumbh Sans is the only text font, with several weights and sizes, and the icon font is the one icon set. They are small enough to ship inside the components package (about 220 KB total), so they are bundled there.

## What changed

- `packages/components/src/fonts/`: `kumbh-sans.woff2` (Latin subset, variable, weight 100–900, with the YOPQ axis), `material-icons-round.woff2` (full set), and the licence texts (SIL OFL 1.1 for Kumbh Sans, Apache 2.0 for Material Icons).
- `src/shared/load-fonts.ts`: registers both `@font-face` rules once, from URLs relative to the module. It is imported by `load-tokens.ts`, so every component gets the fonts without any change to the components.
- `scripts/copy-fonts.mjs`, run by `npm run build`: copies the font folder into `dist/fonts`, which the published package contains.
- Removed the Google Fonts links from the root and components READMEs, the Getting started, Icons and Tokens Storybook pages, the Storybook head, and `apps/site/index.html`.

## Verification

- The font faces load from the package (checked against the browser's resource list), with no Google requests.
- Icon names draw as glyphs: `menu` at 24px measures 24px wide.
- Full suite: 22 files, 467 tests, all passing. Build passes.
- `npm pack --dry-run` lists the fonts and licences.

## Left out

- Other Material Icons weights and styles (Outlined, Sharp). Only Round is bundled, as the designs use only Round.
- Kumbh Sans subsets other than Latin. Extra subsets can be added if a consumer needs them.
- Browser support is limited to WOFF2, which all evergreen browsers support.
