import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const base = process.env.PUBLIC_STORYBOOK_URL || 'https://storybook.system.codechem.dev/';
const home = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const components = readFileSync(new URL('../dist/components/index.html', import.meta.url), 'utf8');

test('the homepage opens the configured Storybook site', () => {
  const link = home.match(/<a\b[^>]*href="([^"]*)"[^>]*>Open Storybook<\/a>/);
  assert.ok(link, 'Open Storybook link is rendered');
  assert.equal(link[1], base);
});

test('each component opens its own Storybook Docs page', () => {
  const docs = {
    button: 'components-button--docs',
    link: 'components-link--docs',
    chip: 'components-chip--docs',
    'text-input': 'components-text-input--docs',
    textarea: 'components-text-area--docs',
    'search-bar': 'components-search-bar--docs',
    'number-input-stepper': 'components-number-input-stepper--docs',
    checkbox: 'components-checkbox--docs',
    radio: 'components-radio--docs',
    switch: 'components-switch--docs',
    calendar: 'components-calendar--docs',
    alert: 'components-alert--docs',
    badge: 'components-badge--docs',
    tooltip: 'components-tooltip--docs',
    tab: 'components-tab--docs',
    pagination: 'components-pagination--docs',
    accordion: 'components-accordion--docs',
    'list-item': 'components-list-item--docs',
    dialog: 'components-dialog--docs',
  };
  const articles = [...components.matchAll(/<article\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/article>/g)];
  assert.equal(articles.length, Object.keys(docs).length);
  for (const [, slug, content] of articles) {
    const link = content.match(/<a\b[^>]*href="([^"]*)"[^>]*>Props and examples in Storybook<\/a>/);
    assert.ok(link, `${slug} has a Storybook link`);
    const url = new URL(link[1]);
    assert.equal(url.searchParams.get('path'), `/docs/${docs[slug]}`, slug);
    url.search = '';
    assert.equal(url.href, new URL(base).href, slug);
  }
});
