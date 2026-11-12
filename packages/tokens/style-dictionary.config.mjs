import { readdirSync } from 'node:fs';

const resolveFigma = (node, path = []) => {
  if (node && typeof node === 'object' && '$value' in node) {
    const alias = node.$extensions?.['com.figma.aliasData']?.targetVariableName;
    if (alias) node.$value = `{${alias.split('/').join('.')}}`;
    else if (node.$value?.hex) {
      const { components, alpha, hex } = node.$value;
      node.$value = alpha < 1
        ? `rgba(${components.map((c) => Math.round(c * 255)).join(', ')}, ${+alpha.toFixed(2)})`
        : hex.toLowerCase();
    }
    if (node.$type === 'number' && !path.includes('Font Weight')) {
      node.$type = 'dimension';
      if (typeof node.$value === 'number') node.$value = `${node.$value}px`;
    }
    if (path[0] === 'Typeface') node.$value = `'${node.$value}', sans-serif`;
    return;
  }
  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith('$')) delete node[key];
    else resolveFigma(child, [...path, key]);
  }
};

export default {
  source: readdirSync('src')
    .filter((f) => f.endsWith('.tokens.json') && f !== 'typography-mobile.tokens.json')
    .map((f) => `src/${f}`),
  hooks: {
    preprocessors: {
      'figma-export': (dictionary) => {
        resolveFigma(dictionary);
        return dictionary;
      },
    },
  },
  preprocessors: ['figma-export'],
  platforms: {
    css: {
      transformGroup: 'css',
      prefix: 'cc',
      buildPath: 'dist/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables',
          options: { outputReferences: true },
        },
      ],
    },
  },
};
