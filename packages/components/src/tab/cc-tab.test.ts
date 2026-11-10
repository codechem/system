import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import '@codechem/tokens/tokens.css';
import './cc-tab.js';
import type { CcTab } from './cc-tab.js';

async function render(markup: string) {
  document.body.innerHTML = markup;
  const el = document.querySelector('cc-tab') as CcTab;
  await el.updateComplete;
  await document.fonts.ready;
  return el;
}

const button = (el: CcTab) => el.shadowRoot!.querySelector('button')!;

const tokenColor = (token: string) => {
  const probe = document.createElement('div');
  probe.style.color = `var(${token})`;
  document.body.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('cc-tab', () => {
  it('defaults to an unselected enclosed tab', async () => {
    const el = await render('<cc-tab>Overview</cc-tab>');
    expect(el.type).toBe('enclosed');
    expect(el.selected).toBe(false);
    expect(el.disabled).toBe(false);
    expect(button(el).getAttribute('aria-selected')).toBe('false');
  });

  it('exposes a tab role named by its label', async () => {
    await render('<cc-tab>Overview</cc-tab>');
    await expect.element(page.getByRole('tab', { name: 'Overview', exact: true })).toBeInTheDocument();
  });

  it('reflects selected into aria-selected', async () => {
    const el = await render('<cc-tab selected>Overview</cc-tab>');
    expect(button(el).getAttribute('aria-selected')).toBe('true');
    el.selected = false;
    await el.updateComplete;
    expect(button(el).getAttribute('aria-selected')).toBe('false');
  });

  it('forwards aria-label to the inner button', async () => {
    const el = await render('<cc-tab aria-label="Overview tab">Overview</cc-tab>');
    expect(button(el).getAttribute('aria-label')).toBe('Overview tab');
    await expect.element(page.getByRole('tab', { name: 'Overview tab', exact: true })).toBeInTheDocument();
  });

  it('fires click when the label is clicked', async () => {
    const el = await render('<cc-tab>Overview</cc-tab>');
    const onClick = vi.fn();
    el.addEventListener('click', onClick);
    await userEvent.click(el);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('forwards click() to the inner button', async () => {
    const el = await render('<cc-tab>Overview</cc-tab>');
    const onClick = vi.fn();
    button(el).addEventListener('click', onClick);
    el.click();
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('activates with the keyboard', async () => {
    const el = await render('<cc-tab>Overview</cc-tab>');
    const onClick = vi.fn();
    el.addEventListener('click', onClick);
    el.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('does not fire click when disabled', async () => {
    const el = await render('<cc-tab disabled>Overview</cc-tab>');
    const onClick = vi.fn();
    el.addEventListener('click', onClick);
    el.click();
    await userEvent.click(el);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('blocks click listeners on a disabled host', async () => {
    const el = await render('<cc-tab disabled>Overview</cc-tab>');
    const onClick = vi.fn();
    el.addEventListener('click', onClick);
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('disables the inner button', async () => {
    const el = await render('<cc-tab disabled>Overview</cc-tab>');
    expect(button(el).disabled).toBe(true);
    expect(getComputedStyle(button(el)).opacity).toBe('0.4');
    expect(getComputedStyle(button(el)).cursor).toBe('not-allowed');
  });

  it('colours the label accent when selected and low emphasis otherwise', async () => {
    const selected = await render('<cc-tab selected>Overview</cc-tab>');
    expect(getComputedStyle(button(selected)).color).toBe(tokenColor('--cc-accent-light'));
    const unselected = await render('<cc-tab>Overview</cc-tab>');
    expect(getComputedStyle(button(unselected)).color).toBe(tokenColor('--cc-text-low-emphasis'));
  });

  it('draws selected enclosed edges on top, left and right, never on the bottom', async () => {
    const el = await render('<cc-tab type="enclosed" selected>Overview</cc-tab>');
    const low = tokenColor('--cc-border-low-contrast');
    const shadow = getComputedStyle(button(el)).boxShadow;
    expect(shadow).toContain(`${low} 2px 0px 0px 0px inset`);
    expect(shadow).toContain(`${low} -2px 0px 0px 0px inset`);
    expect(shadow).toContain(`${low} 0px 2px 0px 0px inset`);
    expect(shadow).not.toContain('0px -2px 0px 0px inset');
  });

  it('draws the selected line underline as 3px accent', async () => {
    const el = await render('<cc-tab type="line" selected>Overview</cc-tab>');
    const accent = tokenColor('--cc-accent-light');
    expect(getComputedStyle(button(el)).boxShadow).toBe(`${accent} 0px -3px 0px 0px inset`);
  });

  it.each(['enclosed', 'line'])('draws the unselected %s underline as 2px low-contrast', async (type) => {
    const el = await render(`<cc-tab type="${type}">Overview</cc-tab>`);
    const low = tokenColor('--cc-border-low-contrast');
    expect(getComputedStyle(button(el)).boxShadow).toBe(`${low} 0px -2px 0px 0px inset`);
  });

  it('fills the background on hover, but not when disabled', async () => {
    const el = await render('<cc-tab>Overview</cc-tab>');
    await userEvent.hover(el);
    expect(getComputedStyle(button(el)).backgroundColor).toBe(tokenColor('--cc-surface-surface-2'));
    await userEvent.unhover(document.body);

    const disabled = await render('<cc-tab disabled>Overview</cc-tab>');
    await userEvent.hover(disabled);
    expect(getComputedStyle(button(disabled)).backgroundColor).toBe('rgba(0, 0, 0, 0)');
    await userEvent.unhover(document.body);
  });

  it('dims to 0.7 opacity while pressed', async () => {
    const el = await render('<cc-tab>Overview</cc-tab>');
    await userEvent.pointer([{ keys: '[MouseLeft>]', target: el }]);
    expect(getComputedStyle(button(el)).opacity).toBe('0.7');
    await userEvent.pointer([{ keys: '[/MouseLeft]' }]);
  });

  it('hides the host with the hidden attribute', async () => {
    const el = await render('<cc-tab hidden>Overview</cc-tab>');
    expect(getComputedStyle(el).display).toBe('none');
  });

  it.each([
    ['enclosed', 'selected'],
    ['line', 'selected'],
    ['enclosed', 'unselected'],
  ])('keeps the %s %s box at the Figma height of 44px', async (type, state) => {
    const el = await render(`<cc-tab type="${type}" ${state === 'selected' ? 'selected' : ''}>Label</cc-tab>`);
    expect(button(el).getBoundingClientRect().height).toBeCloseTo(44, 0);
  });

  it('hugs its label with 24px side padding and 16px medium text', async () => {
    const el = await render('<cc-tab>Label</cc-tab>');
    const style = getComputedStyle(button(el));
    expect(style.paddingLeft).toBe('24px');
    expect(style.paddingRight).toBe('24px');
    expect(style.fontSize).toBe('16px');
    expect(style.fontWeight).toBe('500');
  });

  it('shows the Figma focus ring when focused from the keyboard', async () => {
    const el = await render('<cc-tab>Overview</cc-tab>');
    await userEvent.tab();
    expect(document.activeElement).toBe(el);
    const style = getComputedStyle(button(el));
    expect(style.outlineStyle).toBe('solid');
    expect(style.outlineWidth).toBe('2px');
    expect(style.outlineOffset).toBe('4px');
  });
});
