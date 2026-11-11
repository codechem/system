# @codechem/components

Web components for the CodeChem design system, built with [Lit](https://lit.dev). They are standard custom elements, so they work in plain HTML and in any framework.

```html
<cc-text-input label="Project name" required></cc-text-input>
<cc-checkbox checked>Notify the team</cc-checkbox>
<cc-button variant="filled">Save</cc-button>
```

## Install

```sh
npm install @codechem/components
```

This also installs [`@codechem/tokens`](https://www.npmjs.com/package/@codechem/tokens), the design tokens the components are styled with, and `lit`.

## Fonts

The components bundle **Kumbh Sans** for text and **Material Icons Round** for icons. They register both fonts when you import a component, so no `<link>` tags are needed. The font files are licensed under the SIL Open Font License (Kumbh Sans) and the Apache License 2.0 (Material Icons); the licence texts are in `dist/fonts/`.

## Import

```js
// Every component
import '@codechem/components';

// Or only the ones you use
import '@codechem/components/button.js';
```

Importing a component registers its tag and adds the token stylesheet to the page once. This needs a bundler such as Vite or webpack.

| Import | Tags |
|---|---|
| `@codechem/components/accordion.js` | `<cc-accordion>` |
| `@codechem/components/alert.js` | `<cc-alert>` |
| `@codechem/components/badge.js` | `<cc-badge>` |
| `@codechem/components/button.js` | `<cc-button>` |
| `@codechem/components/checkbox.js` | `<cc-checkbox>` |
| `@codechem/components/chip.js` | `<cc-chip>` |
| `@codechem/components/dialog.js` | `<cc-dialog>` |
| `@codechem/components/link.js` | `<cc-link>` |
| `@codechem/components/list-item.js` | `<cc-list-item>` |
| `@codechem/components/number-input-stepper.js` | `<cc-number-input-stepper>` |
| `@codechem/components/pagination.js` | `<cc-pagination>` |
| `@codechem/components/radio.js` | `<cc-radio-group>`, `<cc-radio>` |
| `@codechem/components/switch.js` | `<cc-switch>` |
| `@codechem/components/tab.js` | `<cc-tab>` |
| `@codechem/components/text-input.js` | `<cc-text-input>` |
| `@codechem/components/textarea.js` | `<cc-textarea>` |
| `@codechem/components/tooltip.js` | `<cc-tooltip>` |

## Icons

Put an icon in a component's icon slot as a Material Icons Round ligature. Keep `aria-hidden` so screen readers don't read the icon's name:

```html
<cc-button>
  <span slot="leading" class="material-icons-round" aria-hidden="true">add</span>
  New project
</cc-button>
```

## Events

Components send standard DOM events, such as `change` and `input`:

```js
document.querySelector('cc-checkbox').addEventListener('change', (event) => {
  console.log(event.target.checked);
});
```

## Frameworks

- **React 19+**: no setup.
- **Vue**: set `isCustomElement: (tag) => tag.startsWith('cc-')` in the Vue compiler options.
- **Angular**: add `CUSTOM_ELEMENTS_SCHEMA` to the `schemas` of the components that use them.

## Theming

All colours, sizes and spacing come from `--cc-*` CSS custom properties. The components load them inside `@layer cc-tokens`, so your own CSS overrides them without `!important`:

```css
:root {
  --cc-accent-main: #7753cd;
}
```

## Editor support

The package ships a [Custom Elements Manifest](https://github.com/webcomponents/custom-elements-manifest) (`custom-elements.json`) and VS Code HTML data. For autocomplete and hover docs on `<cc-*>` tags in VS Code, add this to `.vscode/settings.json`:

```json
{
  "html.customData": ["./node_modules/@codechem/components/vscode.html-custom-data.json"]
}
```

## Links

- [Source and contribution guide](https://github.com/codechem/system)
- [Issues](https://github.com/codechem/system/issues)

## License

MIT
