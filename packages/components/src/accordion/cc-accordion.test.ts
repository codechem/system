import { afterEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import '@codechem/tokens/tokens.css';
import './cc-accordion.js';
import type { CcAccordion } from './cc-accordion.js';

async function render(markup: string) {
  document.body.innerHTML = markup;
  const el = document.querySelector('cc-accordion') as CcAccordion;
  await el.updateComplete;
  await document.fonts.ready;
  return el;
}

const details = (el: CcAccordion) => el.shadowRoot!.querySelector('details')!;
const summary = (el: CcAccordion) => el.shadowRoot!.querySelector('summary')!;
const heading = (el: CcAccordion) => el.shadowRoot!.querySelector('.heading')!;
const chevron = (el: CcAccordion) => el.shadowRoot!.querySelector('.chevron')!;
const title = (el: CcAccordion) => el.shadowRoot!.querySelector('.title')!;
const subtitle = (el: CcAccordion) => el.shadowRoot!.querySelector('.subtitle');

const tokenColor = (token: string) => {
  const probe = document.createElement('div');
  probe.style.color = `var(${token})`;
  document.body.append(probe);
  return getComputedStyle(probe).color;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('cc-accordion', () => {
  it('defaults to a closed medium accordion', async () => {
    const el = await render('<cc-accordion heading="Title">Body</cc-accordion>');
    expect(el.getAttribute('size')).toBe('medium');
    expect(el.hasAttribute('open')).toBe(false);
    expect(details(el).open).toBe(false);
  });

  it('shows the heading and subtitle in the header', async () => {
    const el = await render('<cc-accordion heading="Title" subtitle="Subtitle">Body</cc-accordion>');
    expect(heading(el).textContent!.replace(/\s+/g, '')).toBe('TitleSubtitle');
    await expect.element(page.getByText('Subtitle', { exact: true })).toBeVisible();
  });

  it('shows only the heading when subtitle is hidden', async () => {
    const el = await render('<cc-accordion heading="Title" subtitle="Subtitle" hide-subtitle>Body</cc-accordion>');
    expect(subtitle(el)).toBeNull();
    expect(heading(el).textContent!.trim()).toBe('Title');
  });

  it('forwards aria-label to the summary', async () => {
    const el = await render('<cc-accordion heading="Title" aria-label="Billing details">Body</cc-accordion>');
    expect(summary(el).getAttribute('aria-label')).toBe('Billing details');
  });

  it('hides the chevron from assistive tech', async () => {
    const el = await render('<cc-accordion heading="Title">Body</cc-accordion>');
    expect(chevron(el).getAttribute('aria-hidden')).toBe('true');
  });

  it('is not rendered with the hidden attribute', async () => {
    const el = await render('<cc-accordion heading="Title" hidden>Body</cc-accordion>');
    expect(getComputedStyle(el).display).toBe('none');
  });

  it('uses the Figma colours', async () => {
    const el = await render('<cc-accordion heading="Title" subtitle="Subtitle">Body</cc-accordion>');
    expect(getComputedStyle(summary(el)).backgroundColor).toBe(tokenColor('--cc-surface-surface-2'));
    expect(getComputedStyle(title(el)).color).toBe(tokenColor('--cc-text-high-emphasis'));
    expect(getComputedStyle(subtitle(el)!).color).toBe(tokenColor('--cc-text-medium-emphasis'));
  });

  it('shows the content only when open', async () => {
    const el = await render('<cc-accordion heading="Title">Body</cc-accordion>');
    const closedHeight = el.offsetHeight;
    expect(closedHeight).toBe(summary(el).offsetHeight);
    el.setAttribute('open', '');
    await el.updateComplete;
    expect(details(el).open).toBe(true);
    expect(el.offsetHeight).toBeGreaterThan(closedHeight);
  });

  it('turns the chevron when open', async () => {
    const el = await render('<cc-accordion heading="Title">Body</cc-accordion>');
    expect(getComputedStyle(chevron(el)).transform).toBe('none');
    el.setAttribute('open', '');
    await el.updateComplete;
    expect(getComputedStyle(chevron(el)).transform).not.toBe('none');
  });

  it('toggles with a click on the summary and syncs open', async () => {
    const el = await render('<cc-accordion heading="Title">Body</cc-accordion>');
    await userEvent.click(summary(el));
    expect(el.open).toBe(true);
    expect(el.hasAttribute('open')).toBe(true);
    await userEvent.click(summary(el));
    expect(el.open).toBe(false);
  });

  it('toggles with the keyboard', async () => {
    const el = await render('<cc-accordion heading="Title">Body</cc-accordion>');
    el.focus();
    expect(el.shadowRoot!.activeElement).toBe(summary(el));
    await userEvent.keyboard('{Enter}');
    expect(el.open).toBe(true);
    await userEvent.keyboard(' ');
    expect(el.open).toBe(false);
  });

  it('forwards click() to the summary', async () => {
    const el = await render('<cc-accordion heading="Title">Body</cc-accordion>');
    const toggled = new Promise((resolve) => details(el).addEventListener('toggle', resolve, { once: true }));
    el.click();
    await toggled;
    expect(el.open).toBe(true);
  });

  it('shows the focus ring on keyboard focus', async () => {
    const el = await render('<cc-accordion heading="Title">Body</cc-accordion>');
    await userEvent.tab();
    expect(el.shadowRoot!.activeElement).toBe(summary(el));
    const style = getComputedStyle(summary(el));
    expect(style.outlineStyle).toBe('solid');
    expect(style.outlineColor).toBe(tokenColor('--cc-border-focus'));
  });

  describe('sizes', () => {
    it.each([
      ['large', 48, 20, 24],
      ['medium', 40, 16, 24],
      ['small', 32, 16, 20],
    ])('size=%s header is %ipx tall with a %ipx title and %ipx chevron', async (size, height, titleSize, iconSize) => {
      const el = await render(`<cc-accordion heading="Title" subtitle="Subtitle" size="${size}">Body</cc-accordion>`);
      expect(summary(el).getBoundingClientRect().height).toBeCloseTo(height, 0);
      expect(parseFloat(getComputedStyle(title(el)).fontSize)).toBeCloseTo(titleSize, 0);
      expect(chevron(el).getBoundingClientRect().width).toBeCloseTo(iconSize, 0);
    });
  });
});
