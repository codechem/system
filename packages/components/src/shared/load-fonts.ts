const key = Symbol.for('@codechem/fonts/loaded');
const global = globalThis as unknown as Record<symbol, boolean>;

if (typeof document !== 'undefined' && !global[key]) {
  global[key] = true;
  const fontUrl = (file: string) => new URL(`../fonts/${file}`, import.meta.url).href;
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(`
    @font-face {
      font-family: 'Kumbh Sans';
      font-style: normal;
      font-weight: 100 900;
      font-display: swap;
      src: url('${fontUrl('kumbh-sans.woff2')}') format('woff2');
    }
    @font-face {
      font-family: 'Material Icons Round';
      font-style: normal;
      font-weight: 400;
      font-display: block;
      src: url('${fontUrl('material-icons-round.woff2')}') format('woff2');
    }
  `);
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
}
