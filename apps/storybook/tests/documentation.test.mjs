import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';

const require = createRequire(import.meta.url);

let base = process.env.STORYBOOK_URL;
let server;
before(async () => {
  if (base) return;
  const root = fileURLToPath(new URL('../storybook-static/', import.meta.url));
  await readFile(resolve(root, 'index.html')).catch(() => {
    throw new Error('Build Storybook first: npm run build-storybook');
  });
  const mime = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.mjs': 'text/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
  };
  server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      const file = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
      if (!file.startsWith(root.endsWith(sep) ? root : root + sep)) {
        response.writeHead(403).end();
        return;
      }
      const content = await readFile(file);
      response.writeHead(200, { 'Content-Type': mime[extname(file)] ?? 'application/octet-stream' }).end(content);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise((done) => server.listen(0, '127.0.0.1', done));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  if (server) await new Promise((done) => server.close(done));
});

test('documentation manager loads its branding without configuration errors', async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await page.goto(`${base}/?path=/docs/getting-started--docs`);
    await page.frameLocator('#storybook-preview-iframe').locator('#storybook-docs h1').waitFor();
    assert.deepEqual(errors, []);
    assert.ok(await page.getByRole('link', { name: 'CodeChem · Documentation', exact: true }).count());
    const contrast = await page.locator('[data-selected=true]').evaluate((element) => {
      const luminance = (color) => {
        const rgb = color
          .match(/[0-9.]+/g)
          .slice(0, 3)
          .map((value) => {
            const channel = Number(value) / 255;
            return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
          });
        return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
      };
      const style = getComputedStyle(element);
      const [light, dark] = [luminance(style.color), luminance(style.backgroundColor)].sort((a, b) => b - a);
      return (light + 0.05) / (dark + 0.05);
    });
    assert.ok(contrast >= 4.5, `Selected navigation contrast is ${contrast.toFixed(2)}:1`);
  } finally {
    await browser.close();
  }
});

test('the copied accent override resolves every token it references', async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(`${base}/iframe.html?id=guides-styling-and-theming--docs&viewMode=docs`);
    await page.locator('#storybook-docs h1').waitFor();
    const snippets = await page.locator('pre code').allTextContents();
    const css = snippets.find((text) => text.includes('.billing-workspace'));
    assert.ok(css);
    await page.addStyleTag({ content: css });
    const accent = await page.evaluate(() => {
      const element = document.createElement('div');
      element.className = 'billing-workspace';
      document.body.append(element);
      return getComputedStyle(element).getPropertyValue('--cc-accent-transparent').trim();
    });
    assert.ok(accent, 'transparent accent must not be invalid because of an unresolved token');
  } finally {
    await browser.close();
  }
});

test('the primary React example renders on the server without registering custom elements there', async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(`${base}/iframe.html?id=guides-framework-integration--docs&viewMode=docs`);
    await page.locator('#storybook-docs h1').waitFor();
    const snippets = await page.locator('pre code').allTextContents();
    const source = snippets.find((text) => text.includes('export function NotificationSetting'));
    assert.ok(source);
    const { transformSync } = require('esbuild');
    const { code } = transformSync(source, { loader: 'jsx', format: 'cjs', jsx: 'automatic' });
    const module = { exports: {} };
    const registryBeforeRender = globalThis.customElements;
    new Function('require', 'module', 'exports', code)(require, module, module.exports);
    const { createElement } = require('react');
    const { renderToString } = require('react-dom/server');
    const output = renderToString(createElement(module.exports.NotificationSetting));
    assert.ok(output.includes('Email notifications'));
    assert.ok(
      globalThis.customElements === registryBeforeRender,
      'server rendering should not register browser components',
    );
  } finally {
    await browser.close();
  }
});

test('the copied drawer handler leaves link routing to the browser', async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(`${base}/iframe.html?id=components-navigation-drawer--docs&viewMode=docs`);
    await page.locator('.cc-example cc-navigation-drawer').waitFor();
    const snippets = await page.locator('pre code').allTextContents();
    const script = snippets.find((text) => text.includes("drawer.addEventListener('select'"));
    assert.ok(script);
    const messages = [];
    page.on('console', (message) => {
      if (message.type() === 'log') messages.push(message.text());
    });
    await page.addScriptTag({ content: script });
    await page.locator('cc-navigation-drawer').evaluate(async (drawer) => {
      drawer.items = [
        { label: 'Native destination', icon: 'link', href: '#usage' },
        { label: 'Button destination', icon: 'folder' },
      ];
      await drawer.updateComplete;
    });
    await page.getByRole('link', { name: 'Native destination', exact: true }).click();
    await page.getByRole('button', { name: 'Button destination', exact: true }).click();
    assert.ok(messages.some((message) => message.includes('Button destination')));
    assert.ok(messages.every((message) => !message.includes('Native destination')));
  } finally {
    await browser.close();
  }
});

test('every component has consumer guidance, an import example and a public API reference', async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const index = await (await fetch(`${base}/index.json`)).json();
    const entries = Object.values(index.entries).filter(
      (entry) => entry.type === 'docs' && entry.title.startsWith('Components/'),
    );
    assert.equal(entries.length, 21);
    for (const entry of entries) {
      await page.goto(`${base}/iframe.html?id=${entry.id}&viewMode=docs`);
      await page.locator('#storybook-docs h1').waitFor();
      const text = await page.locator('#storybook-docs').innerText();
      for (const heading of ['Usage', 'Accessibility', 'API reference'])
        assert.ok(text.includes(heading), `${entry.title} needs ${heading}`);
      assert.ok(text.includes('@codechem/components/'), `${entry.title} needs a package import`);
      const snippets = await page.locator('#storybook-docs pre code').allTextContents();
      for (const snippet of snippets) {
        for (const [, specifier] of snippet.matchAll(/import\s+['"](@codechem\/components\/[^'"]+)['"]/g)) {
          assert.doesNotThrow(
            () => require.resolve(specifier),
            `${entry.title} imports an unavailable package export: ${specifier}`,
          );
        }
      }
      for (const internal of ['hasLeading', 'hasDescription', 'formDisabled', 'focusDate', 'openGroups']) {
        assert.equal(
          await page
            .locator('td')
            .filter({ hasText: new RegExp(`^${internal}$`) })
            .count(),
          0,
          `${entry.title} exposes internal state ${internal}`,
        );
      }
    }
  } finally {
    await browser.close();
  }
});

test('installation snippets render as readable code instead of empty blocks', async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(`${base}/iframe.html?id=getting-started--docs&viewMode=docs`);
    await page.locator('#storybook-docs h1').waitFor();
    const code = await page.locator('#storybook-docs pre').allTextContents();
    assert.ok(
      code.some((text) => text.includes('npm install @codechem/components')),
      'the installation command must be visible',
    );
    assert.ok(
      code.every((text) => text.trim()),
      'no fenced block should be empty',
    );
  } finally {
    await browser.close();
  }
});

test('package comparison renders as a semantic table, not raw Markdown', async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(`${base}/iframe.html?id=getting-started--docs&viewMode=docs`);
    await page.locator('#storybook-docs h1').waitFor();
    assert.ok(
      (await page.locator('#storybook-docs table tbody tr').count()) >= 2,
      'package rows must be actual table rows',
    );
    assert.ok(!(await page.locator('#storybook-docs').innerText()).includes('|---|'));
  } finally {
    await browser.close();
  }
});

test('all documentation routes render without errors or page overflow on desktop and phone', async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    const index = await (await fetch(`${base}/index.json`)).json();
    const entries = Object.values(index.entries).filter((entry) => entry.type === 'docs');
    const ids = new Set(Object.keys(index.entries));
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      for (const entry of entries) {
        await page.goto(`${base}/iframe.html?id=${entry.id}&viewMode=docs`);
        await page.locator('#storybook-docs h1').waitFor();
        assert.deepEqual(errors, [], entry.title);
        const dimensions = await page.evaluate(() => ({
          scroll: document.documentElement.scrollWidth,
          client: document.documentElement.clientWidth,
        }));
        assert.ok(
          dimensions.scroll <= dimensions.client + 1,
          `${entry.title} overflows at ${width}px: ${JSON.stringify(dimensions)}`,
        );
        const snippets = await page.locator('#storybook-docs pre').allTextContents();
        assert.ok(
          snippets.every((text) => text.trim()),
          `${entry.title} has an empty code block`,
        );
        const links = await page
          .locator('#storybook-docs a[href*="path=/docs/"], #storybook-docs a[href*="path=/story/"]')
          .evaluateAll((elements) => elements.map((element) => element.getAttribute('href')));
        for (const href of links) {
          const path = new URL(href, base).searchParams.get('path');
          assert.ok(ids.has(path.split('/').at(-1)), `${entry.title} has a broken link: ${href}`);
        }
      }
    }
  } finally {
    await browser.close();
  }
});

test('copy buttons put the visible snippet on the clipboard', async () => {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
    const page = await context.newPage();
    await page.goto(`${base}/iframe.html?id=components-button--docs&viewMode=docs`);
    await page.locator('.cc-code').first().waitFor();
    await page.locator('.cc-code').first().getByRole('button', { name: 'Copy', exact: true }).click();
    await page.getByRole('button', { name: 'Copied', exact: true }).waitFor();
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), "import '@codechem/components/button.js';");
  } finally {
    await browser.close();
  }
});

test('documented dialog and chip examples respond to their actions', async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(`${base}/iframe.html?id=components-dialog--docs&viewMode=docs`);
    await page.getByRole('button', { name: 'Review changes', exact: true }).click();
    await page.getByRole('dialog', { name: 'Ready to publish?' }).waitFor();
    await page.keyboard.press('Escape');
    await page.getByRole('dialog', { name: 'Ready to publish?' }).waitFor({ state: 'hidden' });
    await page.locator('.cc-example-output').filter({ hasText: 'close' }).waitFor();
    assert.match(await page.locator('.cc-example-output').innerText(), /close/);
    await page.goto(`${base}/iframe.html?id=components-chip--docs&viewMode=docs`);
    await page.locator('cc-chip[type="input"]').waitFor();
    await page
      .locator('cc-chip[type="input"]')
      .getByRole('button', { name: /remove/i })
      .click();
    assert.equal(await page.locator('.cc-example cc-chip[type="input"]').count(), 0);
  } finally {
    await browser.close();
  }
});

test('numeric controls document their callable validation API', async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(`${base}/iframe.html?id=components-number-input-stepper--docs&viewMode=docs`);
    await page.locator('#storybook-docs h1').waitFor();
    const api = await page.locator('.cc-api').innerText();
    assert.ok(api.includes('checkValidity()'));
    assert.ok(api.includes('reportValidity()'));
  } finally {
    await browser.close();
  }
});

test('the copied getting-started form submits real custom-element values', async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(`${base}/iframe.html?id=getting-started--docs&viewMode=docs`);
    await page.locator('#storybook-docs h1').waitFor();
    const snippets = await page.locator('#storybook-docs pre code').allTextContents();
    const markup = snippets.find((text) => text.includes('<form id="project-form">'));
    const script = snippets.find((text) => text.includes("const form = document.querySelector('#project-form')"));
    assert.ok(markup && script);
    await page.evaluate((markup) => {
      const fixture = document.createElement('section');
      fixture.innerHTML = markup;
      document.body.append(fixture);
    }, markup);
    await page.addScriptTag({ content: script });
    await page.getByRole('textbox', { name: 'Project name' }).fill('Documentation refresh');
    await page.getByRole('button', { name: 'Create project', exact: true }).click();
    assert.equal(await page.locator('#project-result').innerText(), 'Created project: Documentation refresh');
  } finally {
    await browser.close();
  }
});
