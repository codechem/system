import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import '@codechem/tokens/tokens.css';
import './cc-link.js';
import type { CcLink } from './cc-link.js';

async function render(markup: string) {
  document.body.innerHTML = markup;
  const el = document.querySelector('cc-link') as CcLink;
  await el.updateComplete;
  await document.fonts.ready;
  return el;
}

const anchor = (el: CcLink) => el.shadowRoot!.querySelector('a')!;
const label = (el: CcLink) => el.shadowRoot!.querySelector('.label')!;
const icon = (el: CcLink) => el.shadowRoot!.querySelector('.icon');
const underline = (el: CcLink) => getComputedStyle(label(el), '::after');

const tokenColor = (token: string) => {
  const probe = document.createElement('div');
  probe.style.color = `var(${token})`;
  document.body.append(probe);
  return getComputedStyle(probe).color;
};

afterEach(async () => {
  document.body.innerHTML = '';
  await userEvent.unhover(document.body);
});

describe('cc-link', () => {
  it('defaults to a medium link with the link icon', async () => {
    const el = await render('<cc-link href="/docs">Docs</cc-link>');
    expect(el.getAttribute('size')).toBe('medium');
    expect(anchor(el).getAttribute('href')).toBe('/docs');
    expect(icon(el)?.textContent).toBe('link');
  });

  it('is a link named by its text only', async () => {
    await render('<cc-link href="/docs">Docs</cc-link>');
    await expect.element(page.getByRole('link', { name: 'Docs', exact: true })).toBeVisible();
  });

  it('passes target and rel to the anchor', async () => {
    const el = await render('<cc-link href="https://example.com" target="_blank" rel="noopener">Site</cc-link>');
    expect(anchor(el).target).toBe('_blank');
    expect(anchor(el).rel).toBe('noopener');
  });

  it('hides the link icon with hide-icon', async () => {
    const el = await render('<cc-link href="/docs" hide-icon>Docs</cc-link>');
    expect(icon(el)).toBeNull();
  });

  it('uses the Figma colour', async () => {
    const el = await render('<cc-link href="/docs">Docs</cc-link>');
    expect(getComputedStyle(anchor(el)).color).toBe(tokenColor('--cc-accent-light'));
  });

  it('shows the underline only on hover', async () => {
    const el = await render('<cc-link href="/docs">Docs</cc-link>');
    expect(underline(el).display).toBe('none');
    await userEvent.hover(el);
    expect(underline(el).display).toBe('block');
    expect(parseFloat(underline(el).height)).toBeCloseTo(1.2, 1);
  });

  it.each([
    ['extra-large', 32, 32],
    ['large', 24, 24],
    ['medium', 24, 24],
    ['small', 20, 20],
  ])('size=%s is %ipx tall with a %ipx icon, like Figma', async (size, height, iconSize) => {
    const el = await render(`<cc-link href="/docs" size="${size}">Docs</cc-link>`);
    expect(anchor(el).getBoundingClientRect().height).toBe(height);
    expect(icon(el)!.getBoundingClientRect().width).toBe(iconSize);
  });

  it('sizes a leading icon at 20px', async () => {
    const el = await render(
      '<cc-link href="/docs" size="extra-large"><span slot="leading" class="material-icons-round">add</span>Docs</cc-link>',
    );
    expect(el.querySelector('[slot="leading"]')!.getBoundingClientRect().width).toBe(20);
    await expect.element(page.getByRole('link', { name: 'Docs', exact: true })).toBeVisible();
  });

  it('forwards aria-label to the anchor', async () => {
    await render('<cc-link href="/docs" aria-label="Read the docs">More</cc-link>');
    await expect.element(page.getByRole('link', { name: 'Read the docs', exact: true })).toBeVisible();
  });

  it('focuses the anchor and follows it on click()', async () => {
    const el = await render('<cc-link href="#followed">Docs</cc-link>');
    el.focus();
    expect(el.shadowRoot!.activeElement).toBe(anchor(el));
    el.click();
    expect(location.hash).toBe('#followed');
    history.replaceState(null, '', location.pathname + location.search);
  });

  describe('when disabled', () => {
    it('has no href and is announced as disabled', async () => {
      const el = await render('<cc-link href="/docs" disabled>Docs</cc-link>');
      expect(anchor(el).hasAttribute('href')).toBe(false);
      await expect.element(page.getByRole('link', { name: 'Docs', exact: true })).toHaveAttribute('aria-disabled', 'true');
    });

    it('is skipped by keyboard focus', async () => {
      document.body.innerHTML = '<button>Before</button><cc-link href="/docs" disabled>Docs</cc-link><button>After</button>';
      await document.querySelector('cc-link')!.updateComplete;
      document.querySelector('button')!.focus();
      await userEvent.tab();
      expect(document.activeElement!.textContent).toBe('After');
    });

    it('does not reach click listeners', async () => {
      const el = await render('<cc-link href="#disabled" disabled>Docs</cc-link>');
      const onClick = vi.fn();
      el.addEventListener('click', onClick);
      el.click();
      anchor(el).click();
      expect(onClick).not.toHaveBeenCalled();
      expect(location.hash).not.toBe('#disabled');
    });

    it('shows no underline on hover', async () => {
      const el = await render('<cc-link href="/docs" disabled>Docs</cc-link>');
      await userEvent.hover(el);
      expect(underline(el).display).toBe('none');
    });
  });
});
