import { customElementVsCodePlugin } from 'custom-element-vs-code-integration';

export default {
  globs: ['src/**/*.ts'],
  exclude: ['src/**/*.test.ts', 'src/**/*.stories.ts'],
  litelement: true,
  plugins: [customElementVsCodePlugin({ outdir: '.', htmlFileName: 'vscode.html-custom-data.json', cssFileName: null })],
};
