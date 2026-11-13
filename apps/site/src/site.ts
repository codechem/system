import { readFileSync } from 'node:fs';

export const version: string = JSON.parse(
  readFileSync('node_modules/@codechem/components/package.json', 'utf8'),
).version;

export const storybook: string =
  import.meta.env.PUBLIC_STORYBOOK_URL || 'https://storybook.system.codechem.dev/';

export const pages = [
  { label: 'Getting started', href: '/getting-started/' },
  { label: 'Components', href: '/components/' },
  { label: 'Theming', href: '/theming/' },
];

export const external = [
  ...(storybook ? [{ label: 'Storybook', href: storybook }] : []),
  { label: 'GitHub', href: 'https://github.com/codechem/system' },
  { label: 'npm', href: 'https://www.npmjs.com/package/@codechem/components' },
];

export const palettes = ['green', 'teal', 'cyan', 'blue', 'purple', 'pink', 'red', 'orange', 'yellow'];
