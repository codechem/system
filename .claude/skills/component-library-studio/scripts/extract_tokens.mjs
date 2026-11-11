#!/usr/bin/env node
// Usage: node extract_tokens.mjs <css file or dir> [...more] [--json]
// Prints the project's CSS custom properties grouped by design role, with var() chains resolved,
// and a guess at whether the default theme is light or dark.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const inputs = args.filter((a) => a !== '--json');
if (!inputs.length) {
  console.error('Usage: node extract_tokens.mjs <css file or dir> [...] [--json]');
  process.exit(1);
}

const files = [];
const walk = (p) => {
  const s = statSync(p);
  if (s.isDirectory()) {
    for (const f of readdirSync(p)) if (f !== 'node_modules' && !f.startsWith('.')) walk(join(p, f));
  } else if (extname(p) === '.css') files.push(p);
};
inputs.forEach(walk);

const tokens = new Map();
const contexts = new Set();
for (const file of files) {
  const css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const blockRe = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = blockRe.exec(css))) {
    const selector = m[1].trim().split('\n').pop().trim();
    const declRe = /(--[\w-]+)\s*:\s*([^;]+);/g;
    let d;
    while ((d = declRe.exec(m[2]))) {
      const [, name, value] = d;
      contexts.add(selector);
      if (!tokens.has(name)) tokens.set(name, { name, value: value.trim(), selector, file, modes: {} });
      else tokens.get(name).modes[selector] = value.trim();
    }
  }
}

const resolve = (value, seen = new Set()) =>
  value.replace(/var\((--[\w-]+)(?:\s*,\s*([^)]+))?\)/g, (all, ref, fallback) => {
    if (seen.has(ref)) return all;
    const t = tokens.get(ref);
    if (!t) return fallback ? resolve(fallback, seen) : all;
    return resolve(t.value, new Set([...seen, ref]));
  });

const groups = [
  ['status', /(success|error|danger|warning|info|alert|status|positive|negative|critical)/],
  ['background & surface', /(^|-)(bg|background|surface|canvas|base|layer|elevation-\d|card|popover)(-|$)/],
  ['text', /(^|-)(text|fg|foreground|ink|on-)(?!-size)/],
  ['accent & brand', /(accent|primary|brand|secondary|highlight|ring)/],
  ['border', /(border|divider|outline|stroke|line)/],
  ['palette (raw scales)', /(palette|-\d{2,3}$|gray|grey|slate|neutral)/],
  ['radius', /(radius|rounded|corner|(^|-)round$)/],
  ['spacing', /(space|spacing|gap|padding|margin|inset|unit|size-\d)/],
  ['typography', /(font|typeface|text-size|line-height|leading|tracking|weight|type-)/],
  ['shadow', /(shadow|elevation)/],
  ['motion', /(duration|ease|easing|transition|motion)/],
  ['z-index', /(^|-)z(-|index)/],
];

const grouped = {};
for (const t of tokens.values()) {
  const bare = t.name.replace(/^--/, '');
  const g = groups.find(([, re]) => re.test(bare))?.[0] ?? 'other';
  (grouped[g] ??= []).push({ ...t, resolved: resolve(t.value) });
}

const toRgb = (v) => {
  const hex = v.match(/#([0-9a-f]{3,8})\b/i)?.[1];
  if (hex) {
    const h = hex.length <= 4 ? [...hex.slice(0, 3)].map((c) => c + c).join('') : hex.slice(0, 6);
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  }
  const rgb = v.match(/rgba?\(([^)]+)\)/)?.[1];
  if (rgb) {
    const parts = rgb.split(/[ ,/]+/).map(Number);
    if (parts.length > 3 && parts[3] < 1) return null;
    return parts.slice(0, 3);
  }
  return null;
};
const luminance = ([r, g, b]) => {
  const c = [r, g, b].map((x) => {
    x /= 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};

const surfaces = grouped['background & surface'] ?? [];
const named = surfaces.find((t) => /(^--|-)(background|bg|canvas)$/.test(t.name) && toRgb(t.resolved));
const samples = (named ? [named] : surfaces)
  .filter((t) => !/transparent|alpha|opacity/.test(t.name))
  .map((t) => toRgb(t.resolved))
  .filter(Boolean)
  .map(luminance)
  .sort((a, b) => a - b);
const medianL = samples.length ? samples[Math.floor(samples.length / 2)] : null;
const theme = medianL == null ? 'unknown' : medianL < 0.2 ? 'dark' : 'light';
const modeSelectors = [...contexts].filter((s) => /dark|light|theme|prefers-color-scheme/.test(s));

if (asJson) {
  console.log(JSON.stringify({ files, theme, modeSelectors, groups: grouped }, null, 2));
  process.exit(0);
}

console.log(`# Token map\n`);
console.log(`Files: ${files.join(', ') || 'none found'}`);
console.log(`Tokens: ${tokens.size}`);
console.log(`Default theme (from surface luminance): **${theme}**`);
console.log(
  modeSelectors.length
    ? `Theme modes found: ${modeSelectors.join(', ')}`
    : 'Theme modes found: none (single theme; do not invent a light/dark toggle)',
);
const order = [...groups.map(([g]) => g), 'other'];
for (const g of order) {
  const list = grouped[g];
  if (!list?.length) continue;
  const shown = g === 'palette (raw scales)' ? list.slice(0, 24) : list;
  console.log(`\n## ${g} (${list.length})\n`);
  for (const t of shown) {
    const res = t.resolved !== t.value ? `  →  ${t.resolved}` : '';
    console.log(`- \`${t.name}\`: ${t.value}${res}`);
  }
  if (shown.length < list.length) console.log(`- … ${list.length - shown.length} more`);
}
