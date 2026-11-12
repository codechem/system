import { create } from 'storybook/theming';
import colors from '../../../packages/tokens/src/color.tokens.json';

type TokenTree = { [key: string]: TokenTree | { hex: string } };
const value = (path: string): string => {
  let node = colors as unknown as TokenTree;
  for (const segment of path.split('.')) node = node[segment] as TokenTree;
  return (node.$value as unknown as { hex: string }).hex.toLowerCase();
};

// Resolve source tokens, not a Vite ?raw import: the manager uses esbuild.
export const documentationTheme = create({
  base: 'dark',
  brandTitle: 'CodeChem · Documentation',
  brandUrl: '?path=/docs/getting-started--docs',
  brandTarget: '_self',
  colorPrimary: value('Accent.main'),
  colorSecondary: value('Accent.main'),
  appBg: value('background'),
  appContentBg: value('background'),
  appPreviewBg: value('background'),
  appBorderColor: value('Border.low-contrast'),
  textColor: value('Text.high-emphasis'),
  textMutedColor: value('Text.medium-emphasis'),
  barBg: value('Surface.surface-1'),
  barTextColor: value('Text.medium-emphasis'),
  barSelectedColor: value('Accent.light'),
  inputBg: value('Surface.surface-1'),
  inputTextColor: value('Text.high-emphasis'),
  inputBorder: value('Border.medium-contrast'),
  fontBase: 'system-ui, sans-serif',
  fontCode: 'ui-monospace, monospace',
});
