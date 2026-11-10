import { readFileSync, writeFileSync } from 'node:fs';

const css = readFileSync('dist/tokens.css', 'utf8');
writeFileSync('dist/tokens-sheet.js', `export const css = ${JSON.stringify(`@layer cc-tokens {\n${css}\n}`)};\n`);
writeFileSync('dist/tokens-sheet.d.ts', 'export declare const css: string;\n');
