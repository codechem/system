import { afterEach, describe, expect, it } from 'vitest';
import '@codechem/tokens/tokens.css';
import './cc-badge.js';
import type { CcBadge } from './cc-badge.js';

async function render(markup: string) {
  document.body.innerHTML = markup;
  const el = document.querySelector('cc-badge') as CcBadge;
  await el.updateComplete;
  await document.fonts.ready;
  return el;
}

const size = (el: Element) => {
  const { width, height } = el.getBoundingClientRect();
  return [width, height];
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('cc-badge', () => {
  it('defaults to a solid gray medium text badge', async () => {
    const el = await render('<cc-badge>Badge</cc-badge>');
    expect(el.getAttribute('variant')).toBe('solid');
    expect(el.getAttribute('color')).toBe('gray');
    expect(el.getAttribute('type')).toBe('text');
    expect(el.getAttribute('size')).toBe('medium');
    expect(el.getBoundingClientRect().height).toBe(20);
  });

  it.each([
    ['solid', '--cc-status-purple-main', '--cc-status-purple-contrast'],
    ['subtle', '--cc-status-purple-light', '--cc-status-purple-dark'],
  ])('variant=%s uses the Figma colours', async (variant, bg, fg) => {
    const el = await render(`<cc-badge color="purple" variant="${variant}">Badge</cc-badge>`);
    const probe = document.createElement('div');
    probe.style.cssText = `background: var(${bg}); color: var(${fg})`;
    document.body.append(probe);
    expect(getComputedStyle(el).backgroundColor).toBe(getComputedStyle(probe).backgroundColor);
    expect(getComputedStyle(el).color).toBe(getComputedStyle(probe).color);
  });

  it('outline keeps the same size as solid', async () => {
    const el = await render('<cc-badge variant="outline">Badge</cc-badge><cc-badge>Badge</cc-badge>');
    const [outline, solid] = document.querySelectorAll('cc-badge');
    expect(size(outline)).toEqual(size(solid));
    const probe = document.createElement('div');
    probe.style.color = 'var(--cc-status-gray-light)';
    document.body.append(probe);
    const light = getComputedStyle(probe).color;
    expect(getComputedStyle(el).color).toBe(light);
    expect(getComputedStyle(el).boxShadow).toBe(`${light} 0px 0px 0px 1px inset`);
  });

  it.each([
    ['number', 'medium', '1', [20, 20]],
    ['number', 'small', '1', [16, 16]],
    ['dot', 'medium', 'Online', [14, 14]],
    ['dot', 'small', 'Online', [6, 6]],
  ])('type=%s size=%s is %o px, like Figma', async (type, s, label, expected) => {
    const el = await render(`<cc-badge type="${type}" size="${s}">${label}</cc-badge>`);
    expect(size(el)).toEqual(expected);
  });

  it('number grows for multiple digits', async () => {
    const el = await render('<cc-badge type="number">128</cc-badge>');
    expect(el.getBoundingClientRect().width).toBeGreaterThan(20);
  });

  it('dot keeps its label for screen readers', async () => {
    const el = await render('<cc-badge type="dot">Online</cc-badge>');
    expect(el.textContent).toBe('Online');
    expect(el.shadowRoot!.querySelector('.label')!.getBoundingClientRect().width).toBe(1);
  });
});
