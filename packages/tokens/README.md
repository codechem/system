# @codechem/tokens

Design tokens for the CodeChem design system, as CSS custom properties: colours, typography, spacing, radius and icon sizes. They are exported from the CodeChem Figma Variables and built with [Style Dictionary](https://styledictionary.com).

If you use [`@codechem/components`](https://www.npmjs.com/package/@codechem/components), you already have these: the components install and load them. Install this package on its own to use the tokens without the components.

## Install

```sh
npm install @codechem/tokens
```

## Use

Import the stylesheet once. It defines every token on `:root`:

```js
import '@codechem/tokens/tokens.css';
```

Then use the tokens in your CSS:

```css
.card {
  background: var(--cc-surface-surface-1);
  color: var(--cc-text-high-emphasis);
  padding: var(--cc-padding-padding-3);
  border-radius: var(--cc-radius);
  font-family: var(--cc-typeface-typeface);
}
```

The typeface token names **Kumbh Sans**. `@codechem/components` bundles it; if you use the tokens without the components, load Kumbh Sans yourself, for example from Google Fonts.

### As a constructable stylesheet

`@codechem/tokens/sheet.js` exports the same CSS as a string, wrapped in `@layer cc-tokens`, for adding to `document.adoptedStyleSheets` or a shadow root:

```js
import { css } from '@codechem/tokens/sheet.js';

const sheet = new CSSStyleSheet();
sheet.replaceSync(css);
document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
```

Because of the layer, any unlayered CSS of yours overrides these values without `!important`.

## What's inside

| Group | Examples |
|---|---|
| Surface and background | `--cc-background`, `--cc-surface-surface-0` … `--cc-surface-surface-2` |
| Text | `--cc-text-high-emphasis`, `--cc-text-medium-emphasis`, `--cc-text-disabled` |
| Border and divider | `--cc-border-medium-contrast`, `--cc-border-focus`, `--cc-divider-low-contrast` |
| Accent | `--cc-accent-main`, `--cc-accent-light`, `--cc-accent-contrast` |
| Alert and status | `--cc-alert-error-main`, `--cc-status-blue-light` |
| Palette | `--cc-palette-gray-800`, `--cc-palette-green-600` |
| Typography | `--cc-text-size-body-md`, `--cc-line-height-body-md`, `--cc-font-weight-semi-bold` |
| Spacing | `--cc-padding-padding-3`, `--cc-gap-gap-2`, `--cc-margin-margin-1` (on an 8px unit) |
| Radius | `--cc-radius`, `--cc-round` |
| Icon sizes | `--cc-icon-sm`, `--cc-icon-md` |

Prefer the semantic tokens (surface, text, border, accent, …) over the palette. The full list is in `dist/tokens.css`.

## Links

- [Source](https://github.com/codechem/system/tree/main/packages/tokens)
- [Issues](https://github.com/codechem/system/issues)

## License

MIT
