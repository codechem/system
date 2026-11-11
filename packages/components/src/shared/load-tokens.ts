import { css } from '@codechem/tokens/sheet.js';
import './load-fonts.js';

const key = Symbol.for('@codechem/tokens/loaded');
const global = globalThis as unknown as Record<symbol, boolean>;

if (typeof document !== 'undefined' && !global[key]) {
  global[key] = true;
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(css);
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
}
