import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import '@codechem/tokens/tokens.css';
import './cc-calendar.js';
import type { CcCalendar } from './cc-calendar.js';

async function render(markup: string) {
  document.body.innerHTML = markup;
  await document.fonts.ready;
  const el = document.querySelector('cc-calendar') as CcCalendar;
  await el.updateComplete;
  return el;
}

const dayButton = (el: CcCalendar, iso: string) =>
  el.shadowRoot!.querySelector<HTMLButtonElement>(`button[data-date="${iso}"]`)!;
const title = (el: CcCalendar) => el.shadowRoot!.querySelector('#title')!.textContent!.trim();
const weekdays = (el: CcCalendar) =>
  [...el.shadowRoot!.querySelectorAll('[role="columnheader"]')].map((h) => h.textContent!.trim());
const rowCount = (el: CcCalendar) => el.shadowRoot!.querySelectorAll('[role="row"]').length - 1;
const footerButton = (el: CcCalendar, variant: 'text' | 'filled') =>
  el.shadowRoot!.querySelector<HTMLElement>(`cc-button[variant="${variant}"]`)!;
const navButton = (el: CcCalendar, label: string) =>
  el.shadowRoot!.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!;

const tokenColor = (token: string) => {
  const probe = document.createElement('div');
  probe.style.color = `var(${token})`;
  document.body.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
};

const november = '<cc-calendar locale="en-US" value="2024-11-14"></cc-calendar>';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('cc-calendar', () => {
  it('renders the Figma frame size: 308px wide with 36px day cells', async () => {
    const el = await render(november);
    const frame = el.shadowRoot!.querySelector('.calendar')!.getBoundingClientRect();
    expect(frame.width).toBeCloseTo(308, 0);
    expect(dayButton(el, '2024-11-14').getBoundingClientRect().width).toBeCloseTo(36, 0);
    expect(dayButton(el, '2024-11-14').getBoundingClientRect().height).toBeCloseTo(36, 0);
  });

  it('shows the month title and Sunday-first weekday headers in the locale', async () => {
    const el = await render(november);
    expect(title(el)).toBe('November 2024');
    expect(weekdays(el)).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
  });

  it('uses 5 week rows for November 2024 and 6 when a month needs them', async () => {
    const el = await render(november);
    expect(rowCount(el)).toBe(5);
    el.value = '2024-03-10';
    await el.updateComplete;
    expect(rowCount(el)).toBe(6);
  });

  it('names each day with its full date and marks the value as selected', async () => {
    const el = await render(november);
    expect(dayButton(el, '2024-11-14').getAttribute('aria-label')).toBe('Thursday, November 14, 2024');
    expect(dayButton(el, '2024-11-14').closest('[role="gridcell"]')!.getAttribute('aria-selected')).toBe('true');
    expect(dayButton(el, '2024-11-15').closest('[role="gridcell"]')!.getAttribute('aria-selected')).toBe('false');
  });

  it('colours the selected day with the accent token', async () => {
    const el = await render(november);
    const selected = getComputedStyle(dayButton(el, '2024-11-14')).backgroundColor;
    expect(selected).toBe(tokenColor('--cc-accent-main'));
  });

  it('navigates months with the previous and next buttons', async () => {
    const el = await render(november);
    navButton(el, 'Next month').click();
    await el.updateComplete;
    expect(title(el)).toBe('December 2024');
    navButton(el, 'Previous month').click();
    navButton(el, 'Previous month').click();
    await el.updateComplete;
    expect(title(el)).toBe('October 2024');
  });

  it('picks a date on click, fires input, and commits only on Done', async () => {
    const el = await render(november);
    const onInput = vi.fn();
    const onChange = vi.fn();
    el.addEventListener('input', onInput);
    el.addEventListener('change', onChange);

    await userEvent.click(dayButton(el, '2024-11-18'));
    await el.updateComplete;
    expect(onInput).toHaveBeenCalledOnce();
    expect(onChange).not.toHaveBeenCalled();
    expect(el.value).toBe('2024-11-14');

    footerButton(el, 'filled').click();
    await el.updateComplete;
    expect(onChange).toHaveBeenCalledOnce();
    expect(el.value).toBe('2024-11-18');
  });

  it('Cancel drops the pending pick and keeps the committed value', async () => {
    const el = await render(november);
    await userEvent.click(dayButton(el, '2024-11-20'));
    await el.updateComplete;
    footerButton(el, 'text').click();
    await el.updateComplete;
    expect(el.value).toBe('2024-11-14');
    expect(el.shadowRoot!.querySelector('[aria-selected="true"] button')!.getAttribute('data-date')).toBe('2024-11-14');
  });

  it('moves focus with the arrow keys and selects with Enter', async () => {
    const el = await render(november);
    dayButton(el, '2024-11-14').focus();
    await userEvent.keyboard('{ArrowRight}');
    await el.updateComplete;
    expect(el.shadowRoot!.activeElement).toBe(dayButton(el, '2024-11-15'));

    await userEvent.keyboard('{ArrowDown}');
    await el.updateComplete;
    expect(el.shadowRoot!.activeElement).toBe(dayButton(el, '2024-11-22'));

    await userEvent.keyboard('{Enter}');
    await el.updateComplete;
    expect(el.draft).toBe('2024-11-22');
  });

  it('moves by month with PageDown and Home/End jump to the week edges', async () => {
    const el = await render(november);
    dayButton(el, '2024-11-14').focus();
    await userEvent.keyboard('{PageDown}');
    await el.updateComplete;
    expect(title(el)).toBe('December 2024');
    expect(el.shadowRoot!.activeElement).toBe(dayButton(el, '2024-12-14'));

    await userEvent.keyboard('{Home}');
    await el.updateComplete;
    expect(el.shadowRoot!.activeElement).toBe(dayButton(el, '2024-12-08'));

    await userEvent.keyboard('{End}');
    await el.updateComplete;
    expect(el.shadowRoot!.activeElement).toBe(dayButton(el, '2024-12-14'));
  });

  it('marks days outside min and max as disabled and ignores clicks on them', async () => {
    const el = await render('<cc-calendar locale="en-US" value="2024-11-14" min="2024-11-05" max="2024-11-22"></cc-calendar>');
    expect(dayButton(el, '2024-11-04').getAttribute('aria-disabled')).toBe('true');
    expect(dayButton(el, '2024-11-23').getAttribute('aria-disabled')).toBe('true');
    expect(dayButton(el, '2024-11-05').getAttribute('aria-disabled')).toBe('false');

    const onInput = vi.fn();
    el.addEventListener('input', onInput);
    dayButton(el, '2024-11-23').click();
    expect(onInput).not.toHaveBeenCalled();
    expect(el.draft).toBe('2024-11-14');
  });

  it('blocks clicks, pickers and footer actions when disabled', async () => {
    const el = await render('<cc-calendar locale="en-US" value="2024-11-14" disabled></cc-calendar>');
    const onInput = vi.fn();
    const onChange = vi.fn();
    el.addEventListener('input', onInput);
    el.addEventListener('change', onChange);

    dayButton(el, '2024-11-18').click();
    footerButton(el, 'filled').click();
    await el.updateComplete;
    expect(onInput).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
    expect(el.value).toBe('2024-11-14');
    expect(navButton(el, 'Next month').disabled).toBe(true);
    expect(dayButton(el, '2024-11-14').disabled).toBe(true);
  });

  it('blocks host-level clicks when disabled', async () => {
    const el = await render('<cc-calendar locale="en-US" value="2024-11-14" disabled></cc-calendar>');
    const onHostClick = vi.fn();
    el.addEventListener('click', onHostClick);
    el.click();
    expect(onHostClick).not.toHaveBeenCalled();
  });

  it('shows a visible focus ring on the focused day', async () => {
    const el = await render(november);
    dayButton(el, '2024-11-14').focus();
    await userEvent.keyboard('{ArrowRight}');
    await el.updateComplete;
    const focused = el.shadowRoot!.activeElement as HTMLElement;
    expect(focused).toBe(dayButton(el, '2024-11-15'));
    const style = getComputedStyle(focused);
    expect(style.outlineStyle).toBe('solid');
    expect(style.outlineWidth).toBe('2px');
    expect(style.outlineColor).toBe(tokenColor('--cc-border-focus'));
  });

  it('keeps focus on the picked day after an outside day switches the month', async () => {
    const el = await render(november);
    await userEvent.click(dayButton(el, '2024-10-27'));
    await el.updateComplete;
    expect(title(el)).toBe('October 2024');
    expect(el.shadowRoot!.activeElement).toBe(dayButton(el, '2024-10-27'));
    await userEvent.keyboard('{ArrowRight}');
    await el.updateComplete;
    expect(el.shadowRoot!.activeElement).toBe(dayButton(el, '2024-10-28'));
  });

  it('clears a pending pick on form reset', async () => {
    document.body.innerHTML = `<form><cc-calendar name="when" locale="en-US" value="2024-11-14"></cc-calendar></form>`;
    const el = document.querySelector('cc-calendar') as CcCalendar;
    const form = document.querySelector('form')!;
    await el.updateComplete;
    await userEvent.click(dayButton(el, '2024-11-18'));
    await el.updateComplete;
    form.reset();
    await el.updateComplete;
    expect(el.draft).toBe('');
    footerButton(el, 'filled').click();
    await el.updateComplete;
    expect(el.value).toBe('');
    expect(new FormData(form).get('when')).toBeNull();
  });

  it('is invalid when required and empty, and when a value is outside min and max', async () => {
    document.body.innerHTML = `<form>
      <cc-calendar name="empty" locale="en-US" required></cc-calendar>
      <cc-calendar name="early" locale="en-US" value="2024-11-01" min="2024-11-05" max="2024-11-22"></cc-calendar>
      <cc-calendar name="valid" locale="en-US" value="2024-11-14" required min="2024-11-05" max="2024-11-22"></cc-calendar>
    </form>`;
    const [empty, early, valid] = [...document.querySelectorAll<CcCalendar>('cc-calendar')];
    await Promise.all([empty.updateComplete, early.updateComplete, valid.updateComplete]);
    expect(empty.matches(':invalid')).toBe(true);
    expect(early.matches(':invalid')).toBe(true);
    expect(valid.matches(':valid')).toBe(true);
    expect(document.querySelector('form')!.checkValidity()).toBe(false);
  });

  it('submits the committed date with a form and clears it on reset', async () => {
    document.body.innerHTML = `<form><cc-calendar name="when" locale="en-US" value="2024-11-14"></cc-calendar></form>`;
    const el = document.querySelector('cc-calendar') as CcCalendar;
    const form = document.querySelector('form')!;
    await el.updateComplete;

    expect(new FormData(form).get('when')).toBe('2024-11-14');
    await userEvent.click(dayButton(el, '2024-11-18'));
    footerButton(el, 'filled').click();
    await el.updateComplete;
    expect(new FormData(form).get('when')).toBe('2024-11-18');

    form.reset();
    await el.updateComplete;
    expect(el.value).toBe('');
    expect(new FormData(form).get('when')).toBeNull();
  });

  it('exposes the grid, the day names and the nav buttons by accessible name', async () => {
    const el = await render(november);
    const grid = el.shadowRoot!.querySelector('[role="grid"]')!;
    expect(grid.getAttribute('aria-labelledby')).toBe('title');
    await expect.element(page.getByRole('button', { name: 'Previous month', exact: true })).toBeInTheDocument();
    await expect.element(page.getByRole('button', { name: 'Done', exact: true })).toBeInTheDocument();
    await expect.element(page.getByRole('button', { name: 'Cancel', exact: true })).toBeInTheDocument();
  });
});
