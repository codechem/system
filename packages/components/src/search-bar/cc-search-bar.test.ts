/// <reference types="@vitest/browser-playwright" />
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import '@codechem/tokens/tokens.css';
import './cc-search-bar.js';
import type { CcSearchBar } from './cc-search-bar.js';

async function render(markup: string) {
  document.body.innerHTML = markup;
  const el = document.querySelector('cc-search-bar') as CcSearchBar;
  await el.updateComplete;
  await document.fonts.ready;
  return el;
}

const part = (el: CcSearchBar, selector: string) => el.shadowRoot!.querySelector(selector) as HTMLElement;
const field = (el: CcSearchBar) => part(el, 'input') as HTMLInputElement;
const root = (el: CcSearchBar) => part(el, '.root');
const box = (el: CcSearchBar) => part(el, '.field');

const tokenColor = (token: string) => {
  const probe = document.createElement('div');
  probe.style.color = `var(${token})`;
  document.body.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
};

afterEach(async () => {
  document.body.innerHTML = '';
  await userEvent.unhover(document.body);
});

describe('cc-search-bar', () => {
  it('is a searchbox named by its aria-label', async () => {
    await render('<cc-search-bar aria-label="Search products"></cc-search-bar>');
    await expect.element(page.getByRole('searchbox', { name: 'Search products', exact: true })).toBeVisible();
  });

  it('is named by its placeholder when it has no aria-label', async () => {
    await render('<cc-search-bar></cc-search-bar>');
    await expect.element(page.getByRole('searchbox', { name: 'Search', exact: true })).toBeVisible();
  });

  it('keeps the search icon out of the accessible name', async () => {
    const el = await render('<cc-search-bar></cc-search-bar>');
    expect(part(el, '.trailing').getAttribute('aria-hidden')).toBe('true');
    expect(part(el, '.material-icon').textContent).toBe('search');
    await expect.element(page.getByRole('searchbox', { name: 'Search', exact: true })).toBeVisible();
  });

  it('keeps a leading icon out of the accessible name and places it before the text', async () => {
    const el = await render(
      '<cc-search-bar placeholder="Find"><span slot="leading" class="material-icons-round">add_box</span></cc-search-bar>',
    );
    const leading = part(el, '.leading');
    expect(leading.getAttribute('aria-hidden')).toBe('true');
    expect(leading.compareDocumentPosition(field(el)) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    await expect.element(page.getByRole('searchbox', { name: 'Find', exact: true })).toBeVisible();
  });

  it('applies the hidden attribute', async () => {
    const el = await render('<cc-search-bar aria-label="Search" hidden></cc-search-bar>');
    expect(getComputedStyle(el).display).toBe('none');
  });


  it('shows the search icon by default and hides it with hide-trailing-icon', async () => {
    const shown = await render('<cc-search-bar aria-label="Search"></cc-search-bar>');
    expect(part(shown, '.trailing')).not.toBeNull();
    const hidden = await render('<cc-search-bar aria-label="Search" hide-trailing-icon></cc-search-bar>');
    expect(hidden.shadowRoot!.querySelector('.trailing')).toBeNull();
  });

  it('replaces the default search icon with a trailing slot', async () => {
    const el = await render(
      '<cc-search-bar aria-label="Search"><span slot="trailing" class="material-icons-round">tune</span></cc-search-bar>',
    );
    const slot = part(el, '.trailing slot') as HTMLSlotElement;
    expect(slot.assignedElements()[0].textContent).toBe('tune');
  });

  it('matches the Figma size and padding', async () => {
    const el = await render('<cc-search-bar aria-label="Search"></cc-search-bar>');
    const rect = box(el).getBoundingClientRect();
    expect(rect.width).toBeCloseTo(320, 0);
    expect(rect.height).toBeCloseTo(40, 0);
    expect(parseFloat(getComputedStyle(box(el)).paddingLeft)).toBeCloseTo(12, 0);
    expect(parseFloat(getComputedStyle(box(el)).paddingRight)).toBeCloseTo(8, 0);
    expect(part(el, '.trailing').getBoundingClientRect().width).toBeCloseTo(24, 0);
  });

  it('shows the placeholder in the low-emphasis colour', async () => {
    const el = await render('<cc-search-bar aria-label="Search"></cc-search-bar>');
    expect(field(el).placeholder).toBe('Search');
    expect(getComputedStyle(field(el), '::placeholder').color).toBe(tokenColor('--cc-text-low-emphasis'));
  });

  it('uses the surface fill and lightens it on hover', async () => {
    const el = await render('<cc-search-bar aria-label="Search"></cc-search-bar>');
    expect(getComputedStyle(box(el)).backgroundColor).toBe(tokenColor('--cc-surface-surface-2'));
    await userEvent.hover(box(el));
    expect(getComputedStyle(box(el)).backgroundColor).toBe(tokenColor('--cc-surface-surface-highlight'));
  });

  it('does not react to hover when disabled', async () => {
    const el = await render('<cc-search-bar aria-label="Search" disabled></cc-search-bar>');
    await userEvent.hover(box(el));
    expect(getComputedStyle(box(el)).backgroundColor).toBe(tokenColor('--cc-surface-surface-2'));
  });

  it('dims the whole component to 0.7 while pressed', async () => {
    const el = await render('<cc-search-bar aria-label="Search"></cc-search-bar>');
    expect(getComputedStyle(root(el)).opacity).toBe('1');
    await userEvent.pointer({ keys: '[MouseLeft>]', target: box(el) });
    expect(getComputedStyle(root(el)).opacity).toBe('0.7');
    await userEvent.pointer({ keys: '[/MouseLeft]' });
    expect(getComputedStyle(root(el)).opacity).toBe('1');
  });

  it('draws the focus stroke inside the field on focus', async () => {
    const el = await render('<cc-search-bar aria-label="Search"></cc-search-bar>');
    expect(getComputedStyle(box(el)).boxShadow).not.toContain(tokenColor('--cc-border-focus'));
    await userEvent.click(page.getByRole('searchbox', { name: 'Search', exact: true }));
    expect(getComputedStyle(box(el)).boxShadow).toContain(tokenColor('--cc-border-focus'));
    expect(getComputedStyle(box(el)).boxShadow).toContain('inset');
  });

  it('forwards focus() and click() to the inner input', async () => {
    const el = await render('<cc-search-bar aria-label="Search"></cc-search-bar>');
    el.focus();
    expect(el.shadowRoot!.activeElement).toBe(field(el));
    const onClick = vi.fn();
    field(el).addEventListener('click', onClick);
    el.click();
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('updates value and fires input while typing, change on blur', async () => {
    const el = await render('<cc-search-bar aria-label="Search"></cc-search-bar>');
    const onInput = vi.fn();
    const onChange = vi.fn();
    el.addEventListener('input', onInput);
    el.addEventListener('change', onChange);
    await userEvent.fill(page.getByRole('searchbox', { name: 'Search', exact: true }), 'John Doe');
    expect(el.value).toBe('John Doe');
    expect(onInput).toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
    await userEvent.tab();
    expect(onChange).toHaveBeenCalledOnce();
  });

  it('shows a value set from outside', async () => {
    const el = await render('<cc-search-bar aria-label="Search" value="Input text"></cc-search-bar>');
    expect(field(el).value).toBe('Input text');
    el.value = 'Changed';
    await el.updateComplete;
    expect(field(el).value).toBe('Changed');
  });

  it('is dimmed and not editable when disabled', async () => {
    const el = await render('<cc-search-bar aria-label="Search" disabled></cc-search-bar>');
    expect(getComputedStyle(root(el)).opacity).toBe('0.4');
    expect(getComputedStyle(root(el)).cursor).toBe('not-allowed');
    expect(field(el).disabled).toBe(true);
  });

  it('blocks click listeners when disabled', async () => {
    const el = await render('<cc-search-bar aria-label="Search" disabled></cc-search-bar>');
    const onClick = vi.fn();
    el.addEventListener('click', onClick);
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('blocks click listeners when a parent fieldset is disabled', async () => {
    const el = await render('<form><fieldset disabled><cc-search-bar aria-label="Search"></cc-search-bar></fieldset></form>');
    const onClick = vi.fn();
    el.addEventListener('click', onClick);
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('exposes the validity API', async () => {
    const el = await render('<form><cc-search-bar aria-label="Search"></cc-search-bar></form>');
    expect(el.checkValidity()).toBe(true);
    expect(el.form).toBe(document.querySelector('form'));
    expect(el.willValidate).toBe(true);
  });

  it('restores its value from form state', async () => {
    const el = await render('<cc-search-bar aria-label="Search"></cc-search-bar>');
    el.formStateRestoreCallback('Restored');
    await el.updateComplete;
    expect(field(el).value).toBe('Restored');
  });

  describe('in a form', () => {
    const form = (input: string) => `<form>${input}</form>`;
    const data = () => new FormData(document.querySelector('form')!);

    it('submits its value under its name', async () => {
      await render(form('<cc-search-bar name="q" aria-label="Search" value="John Doe"></cc-search-bar>'));
      expect(data().get('q')).toBe('John Doe');
    });

    it('is left out of the form data when disabled', async () => {
      await render(form('<cc-search-bar name="q" aria-label="Search" value="John Doe" disabled></cc-search-bar>'));
      expect(data().has('q')).toBe(false);
    });

    it('is disabled by a disabled fieldset', async () => {
      const el = await render(
        '<form><fieldset disabled><cc-search-bar name="q" aria-label="Search"></cc-search-bar></fieldset></form>',
      );
      expect(field(el).disabled).toBe(true);
      expect(getComputedStyle(root(el)).opacity).toBe('0.4');
    });

    it('resets to its initial value', async () => {
      const el = await render(form('<cc-search-bar name="q" aria-label="Search" value="Initial"></cc-search-bar>'));
      el.value = 'Changed';
      await el.updateComplete;
      document.querySelector('form')!.reset();
      await el.updateComplete;
      expect(el.value).toBe('Initial');
      expect(field(el).value).toBe('Initial');
    });
  });
});
