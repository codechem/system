// Reads the built tokens.css so the Tokens page always matches what ships.
import raw from '@codechem/tokens/tokens.css?raw';

export type Token = {
  /** CSS custom property, e.g. `--cc-accent-main` */
  name: string;
  /** Value as written in tokens.css, e.g. `var(--cc-palette-green-600)` */
  value: string;
  /** Final value after following every `var()` reference, e.g. `#008854` */
  resolved: string;
  /** Token this one points at, if it is an alias */
  alias?: string;
};

const declared = new Map<string, string>();
for (const [, name, value] of raw.matchAll(/^\s*(--cc-[\w-]+):\s*(.+?);\s*$/gm)) declared.set(name, value);

const resolve = (value: string, seen = new Set<string>()): string =>
  value.replace(/var\((--cc-[\w-]+)\)/g, (match, name: string) => {
    const next = declared.get(name);
    if (next === undefined || seen.has(name)) return match;
    return resolve(next, new Set(seen).add(name));
  });

export const tokens: Token[] = [...declared].map(([name, value]) => ({
  name,
  value,
  resolved: resolve(value),
  alias: /^var\((--cc-[\w-]+)\)$/.exec(value)?.[1],
}));

const byName = new Map(tokens.map((t) => [t.name, t]));

export const token = (name: string) => byName.get(name);

/** Tokens named `--cc-<prefix>` or `--cc-<prefix>-…`, in tokens.css order. */
export const group = (prefix: string) =>
  tokens.filter((t) => t.name === `--cc-${prefix}` || t.name.startsWith(`--cc-${prefix}-`));

/** Colour tokens only: `text-size-*` shares the `text` prefix with text colours. */
const isColor = (t: Token) => /^(#|rgba?\()/.test(t.resolved);

/**
 * Colours for Storybook's ColorItem: `{ label: resolved value }`, where the
 * label is the token name without its `--cc-<prefix>-` start.
 */
export const swatches = (prefix: string) =>
  Object.fromEntries(
    group(prefix)
      .filter(isColor)
      .map((t) => [t.name.slice(`--cc-${prefix}-`.length) || prefix, t.resolved]),
  );

export type ColorGroup = { title: string; subtitle: string; colors: Record<string, string> };

const colorGroup = (title: string, prefix: string): ColorGroup => ({
  title,
  subtitle: `--cc-${prefix}-*`,
  colors: swatches(prefix),
});

const hues = ['gray', 'red', 'orange', 'yellow', 'green', 'teal', 'cyan', 'blue', 'purple', 'pink'];

export const semanticColors: ColorGroup[] = [
  { title: 'Background', subtitle: '--cc-background', colors: { background: token('--cc-background')!.resolved } },
  colorGroup('Surface', 'surface-surface'),
  colorGroup('Surface, transparent', 'surface-transparent'),
  colorGroup('Text', 'text'),
  colorGroup('Border', 'border'),
  colorGroup('Divider', 'divider'),
  colorGroup('Accent', 'accent'),
  colorGroup('Scrim', 'scrim'),
];

export const alertColors = ['error', 'warning', 'info', 'success'].map((s) => colorGroup(s, `alert-${s}`));
export const statusColors = hues.map((h) => colorGroup(h, `status-${h}`));
export const paletteColors: ColorGroup[] = [
  {
    title: 'black / white',
    subtitle: '--cc-palette-black, --cc-palette-white',
    colors: { black: token('--cc-palette-black')!.resolved, white: token('--cc-palette-white')!.resolved },
  },
  colorGroup('white alpha', 'palette-white-alpha'),
  colorGroup('black alpha', 'palette-black-alpha'),
  ...hues.map((h) => colorGroup(h, `palette-${h}`)),
];

export type TextStyle = { name: string; size: Token; lineHeight?: Token };

/** Every `--cc-text-size-*` with its matching `--cc-line-height-*`. */
export const textStyles: TextStyle[] = group('text-size').map((size) => {
  const name = size.name.slice('--cc-text-size-'.length);
  return { name, size, lineHeight: byName.get(`--cc-line-height-${name}`) };
});

/** Line heights without a text size of the same name, such as `body-md-tight`. */
export const extraLineHeights = group('line-height').filter((lh) => !byName.has(lh.name.replace('line-height', 'text-size')));

export type SpacingStep = { step: string; value: string; padding?: string; gap?: string; margin?: string };

/** One row per spacing step, with the padding, gap and margin tokens that use it. */
export const spacing: SpacingStep[] = (() => {
  const steps = new Map<string, SpacingStep>();
  for (const kind of ['padding', 'gap', 'margin'] as const) {
    for (const t of group(`${kind}-${kind}`)) {
      const step = t.name.slice(`--cc-${kind}-${kind}-`.length);
      const row = steps.get(step) ?? { step, value: t.resolved };
      row[kind] = t.name;
      steps.set(step, row);
    }
  }
  return [...steps.values()].sort((a, b) => parseFloat(a.value) - parseFloat(b.value));
})();
