import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import '@codechem/tokens/tokens.css';
import './cc-pagination.js';
import type { CcPagination } from './cc-pagination.js';

async function render(markup: string) {
  document.body.innerHTML = markup;
  const el = document.querySelector('cc-pagination') as CcPagination;
  await el.updateComplete;
  await document.fonts.ready;
  return el;
}

const buttons = (el: CcPagination) => Array.from(el.shadowRoot!.querySelectorAll('button'));
const prev = (el: CcPagination) => el.shadowRoot!.querySelector<HTMLButtonElement>('button[aria-label="Previous page"]')!;
const next = (el: CcPagination) => el.shadowRoot!.querySelector<HTMLButtonElement>('button[aria-label="Next page"]')!;
const pageButton = (el: CcPagination, n: number) =>
  el.shadowRoot!.querySelector<HTMLButtonElement>(`button[aria-label="Page ${n}"]`)!;
const range = (el: CcPagination) => el.shadowRoot!.querySelector('.range')?.textContent?.trim();
const numberLabels = (el: CcPagination) =>
  Array.from(el.shadowRoot!.querySelectorAll('.numbers button')).map((b) => b.textContent!.trim());

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

describe('cc-pagination', () => {
  it('defaults to the pages type on page 1', async () => {
    const el = await render('<cc-pagination total="30"></cc-pagination>');
    expect(el.type).toBe('pages');
    expect(el.page).toBe(1);
    expect(el.pageSize).toBe(10);
    expect(range(el)).toBe('1-10 of 30');
  });

  it('is a navigation landmark named Pagination by default', async () => {
    await render('<cc-pagination total="30"></cc-pagination>');
    await expect.element(page.getByRole('navigation', { name: 'Pagination', exact: true })).toBeVisible();
  });

  it('forwards aria-label to the nav landmark', async () => {
    await render('<cc-pagination total="30" aria-label="Results pages"></cc-pagination>');
    await expect.element(page.getByRole('navigation', { name: 'Results pages', exact: true })).toBeVisible();
  });

  it('names the arrows and hides their icon glyphs from assistive tech', async () => {
    const el = await render('<cc-pagination total="30"></cc-pagination>');
    await expect.element(page.getByRole('button', { name: 'Previous page', exact: true })).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Next page', exact: true })).toBeVisible();
    expect(next(el).querySelector('.material-icon')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('brings an out-of-range page back into range', async () => {
    const el = await render('<cc-pagination total="30" page="99"></cc-pagination>');
    expect(el.page).toBe(3);
    expect(range(el)).toBe('21-30 of 30');
  });

  it('shows a partial last page with its real range', async () => {
    const el = await render('<cc-pagination total="25" page="3"></cc-pagination>');
    expect(range(el)).toBe('21-25 of 25');
  });

  it('shows no page numbers in the pages type and no range in the numbers type', async () => {
    const pages = await render('<cc-pagination total="30"></cc-pagination>');
    expect(pages.shadowRoot!.querySelector('.numbers')).toBeNull();
    const numbers = await render('<cc-pagination type="numbers" total="30"></cc-pagination>');
    expect(numbers.shadowRoot!.querySelector('.range')).toBeNull();
  });

  it('clamps the page when the page size makes it out of range', async () => {
    const el = await render('<cc-pagination total="30" page="3"></cc-pagination>');
    el.pageSize = 100;
    await el.updateComplete;
    expect(el.page).toBe(1);
    expect(range(el)).toBe('1-30 of 30');
  });

  it('disables the previous arrow on the first page and the next arrow on the last', async () => {
    const first = await render('<cc-pagination total="30"></cc-pagination>');
    expect(prev(first).disabled).toBe(true);
    expect(next(first).disabled).toBe(false);

    const last = await render('<cc-pagination total="30" page="3"></cc-pagination>');
    expect(range(last)).toBe('21-30 of 30');
    expect(prev(last).disabled).toBe(false);
    expect(next(last).disabled).toBe(true);
  });

  it('moves to the next and previous page on arrow click', async () => {
    const el = await render('<cc-pagination total="30" page="2"></cc-pagination>');
    await userEvent.click(next(el));
    expect(el.page).toBe(3);
    expect(range(el)).toBe('21-30 of 30');
    await userEvent.click(prev(el));
    expect(el.page).toBe(2);
    expect(range(el)).toBe('11-20 of 30');
  });

  it('dispatches a bubbling change event when the page changes', async () => {
    const el = await render('<cc-pagination total="30"></cc-pagination>');
    const onChange = vi.fn();
    document.body.addEventListener('change', onChange);
    await userEvent.click(next(el));
    expect(onChange).toHaveBeenCalledTimes(1);
    document.body.removeEventListener('change', onChange);
  });

  it('does not dispatch change when the current page is chosen again', async () => {
    const el = await render('<cc-pagination type="numbers" total="30"></cc-pagination>');
    const onChange = vi.fn();
    el.addEventListener('change', onChange);
    await userEvent.click(pageButton(el, 1));
    expect(onChange).not.toHaveBeenCalled();
    expect(el.page).toBe(1);
  });

  it('shows the empty range when there are no items', async () => {
    const el = await render('<cc-pagination total="0"></cc-pagination>');
    expect(range(el)).toBe('0-0 of 0');
    expect(next(el).disabled).toBe(true);
  });

  it('shows page numbers with the current one marked', async () => {
    const el = await render('<cc-pagination type="numbers" total="30"></cc-pagination>');
    expect(numberLabels(el)).toEqual(['1', '2', '3']);
    expect(pageButton(el, 1).getAttribute('aria-current')).toBe('page');
    expect(pageButton(el, 2).hasAttribute('aria-current')).toBe(false);
  });

  it('shows at most five page numbers centred on the current page', async () => {
    const el = await render('<cc-pagination type="numbers" total="300" page="15"></cc-pagination>');
    expect(numberLabels(el)).toEqual(['13', '14', '15', '16', '17']);
    el.page = 30;
    await el.updateComplete;
    expect(numberLabels(el)).toEqual(['26', '27', '28', '29', '30']);
  });

  it('goes to a page when its number is clicked', async () => {
    const el = await render('<cc-pagination type="numbers" total="50"></cc-pagination>');
    await userEvent.click(pageButton(el, 4));
    expect(el.page).toBe(4);
    expect(pageButton(el, 4).getAttribute('aria-current')).toBe('page');
  });

  it('names page buttons by their number', async () => {
    await render('<cc-pagination type="numbers" total="30"></cc-pagination>');
    await expect.element(page.getByRole('button', { name: 'Page 2', exact: true })).toBeVisible();
  });

  it('activates a focused arrow with Enter or Space', async () => {
    const el = await render('<cc-pagination total="30"></cc-pagination>');
    next(el).focus();
    await userEvent.keyboard('{Enter}');
    expect(el.page).toBe(2);
    next(el).focus();
    await userEvent.keyboard(' ');
    expect(el.page).toBe(3);
  });

  it('keeps the arrows 28px square', async () => {
    const el = await render('<cc-pagination type="numbers" total="30"></cc-pagination>');
    for (const button of buttons(el)) {
      const box = button.getBoundingClientRect();
      expect(box.width).toBeCloseTo(28, 0);
      expect(box.height).toBeCloseTo(28, 0);
    }
  });

  it('uses the low-emphasis colour for the range text', async () => {
    const el = await render('<cc-pagination total="30"></cc-pagination>');
    expect(getComputedStyle(el.shadowRoot!.querySelector('.range')!).color).toBe(tokenColor('--cc-text-low-emphasis'));
  });

  it('fills the current page with the highlight surface colour', async () => {
    const el = await render('<cc-pagination type="numbers" total="30"></cc-pagination>');
    expect(getComputedStyle(pageButton(el, 1)).backgroundColor).toBe(tokenColor('--cc-surface-surface-highlight'));
  });

  it('hides itself with the hidden attribute', async () => {
    const el = await render('<cc-pagination total="30" hidden></cc-pagination>');
    expect(getComputedStyle(el).display).toBe('none');
  });
});
