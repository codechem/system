# CodeChem Design System

[![npm version](https://img.shields.io/npm/v/%40codechem%2Fcomponents?style=flat-square&label=npm&color=7753cd)](https://www.npmjs.com/package/@codechem/components)
[![License: MIT](https://img.shields.io/badge/license-MIT-33846a?style=flat-square)](LICENSE)
[![Web Components](https://img.shields.io/badge/Web_Components-29abe2?style=flat-square&logo=webcomponents.org&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Web_components)
[![Built with Lit](https://img.shields.io/badge/built_with-Lit-324fff?style=flat-square&logo=lit&logoColor=white)](https://lit.dev)

UI components built with [Lit](https://lit.dev), styled with shared design tokens, and delivered as standard web components. Use them in your existing app without adopting another UI framework.

[Website](https://system.codechem.dev) · [Storybook](https://storybook.system.dokploy.codechem.dev/) · [npm](https://www.npmjs.com/package/@codechem/components) · [Report an issue](https://github.com/codechem/system/issues)

[![Preview of CodeChem UI components](apps/site/public/social-preview.png)](https://system.codechem.dev)

## Get started

Install the components in an app with a JavaScript bundler, such as Vite:

```sh
npm install @codechem/components
```

Import the components you need in your app's JavaScript entry point:

```js
import '@codechem/components/text-input.js';
import '@codechem/components/button.js';
```

Then use their tags in your markup:

```html
<cc-text-input label="Project name" placeholder="My project"></cc-text-input>
<cc-button variant="filled">Create project</cc-button>
```

Prefer to register everything? Use `import '@codechem/components'` instead.

Component imports load the design tokens and bundled **Kumbh Sans** and **Material Icons Round** fonts automatically—no separate stylesheet or font setup needed.

For framework setup, forms, events and component APIs, see the [getting started guide](https://system.codechem.dev/getting-started/) and [Storybook](https://storybook.system.dokploy.codechem.dev/).

## Make it yours

Components use `--cc-*` CSS custom properties for styling. Override tokens in your app's CSS to change the theme:

```css
:root {
  --cc-accent-main: #7753cd;
}
```

Defaults are loaded inside `@layer cc-tokens`, so your overrides work without `!important`. See the [theming guide](https://system.codechem.dev/theming/) for more.

Only need the design tokens? Install [`@codechem/tokens`](https://www.npmjs.com/package/@codechem/tokens) and import `@codechem/tokens/tokens.css` independently of the components.

## Contributing

Bug reports, component improvements and documentation fixes are welcome. [Open an issue](https://github.com/codechem/system/issues) or read the [contribution guide](docs/CONTRIBUTING.md) for local setup, Storybook and tests.

Release and deployment instructions are in the [maintainer guide](docs/MAINTAINING.md).

## License

[MIT](LICENSE) · Made by [CodeChem](https://codechem.com).
