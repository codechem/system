import type { ThemeRegistration } from 'shiki';

/*
 * Shiki theme whose colours are CSS variables (--sx-*), so one build serves both
 * the light and the dark code blocks. Values live in global.css, mapped to --cc-palette-*.
 */
const v = (role: string) => `var(--sx-${role})`;

export const syntax: ThemeRegistration = {
  name: 'cc-syntax',
  type: 'dark',
  bg: v('bg'),
  fg: v('fg'),
  tokenColors: [
    { settings: { foreground: v('fg') } },
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: v('comment'), fontStyle: 'italic' } },
    { scope: ['punctuation', 'meta.brace', 'keyword.operator'], settings: { foreground: v('punct') } },
    { scope: ['keyword', 'storage', 'keyword.operator.new', 'keyword.operator.expression'], settings: { foreground: v('keyword') } },
    { scope: ['string', 'punctuation.definition.string'], settings: { foreground: v('string') } },
    {
      scope: ['constant', 'support.constant', 'keyword.other.unit', 'constant.other.color', 'variable.language'],
      settings: { foreground: v('const') },
    },
    {
      scope: ['entity.name.function', 'support.function', 'entity.name.type', 'entity.name.class', 'support.class', 'entity.name.tag.component'],
      settings: { foreground: v('fn') },
    },
    { scope: ['entity.other.attribute-name', 'support.type.property-name', 'meta.property-name'], settings: { foreground: v('attr') } },
    // Tags and custom properties are the product (<cc-*>, --cc-*), so they carry the brand green.
    {
      scope: ['entity.name.tag', 'variable.css', 'variable.argument.css', 'support.type.custom-property', 'entity.other.attribute-name.class.css'],
      settings: { foreground: v('tag') },
    },
  ],
};
