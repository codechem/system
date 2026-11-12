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
    .material-icons-round {
      display: inline-block;
      font-family: 'Material Icons Round';
      font-weight: normal;
      font-style: normal;
      font-size: 24px;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      white-space: nowrap;
      direction: ltr;
      font-feature-settings: 'liga';
      -webkit-font-smoothing: antialiased;
    }
  `);
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
}
