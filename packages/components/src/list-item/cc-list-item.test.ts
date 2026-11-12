/// <reference types="@vitest/browser-playwright" />
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cdp, page, userEvent } from 'vitest/browser';
import '@codechem/tokens/tokens.css';
import './cc-list-item.js';
import type { CcListItem } from './cc-list-item.js';

async function render(markup: string) {
  document.body.innerHTML = `<div role="list" style="width: 260px">${markup}</div>`;
  const el = document.querySelector('cc-list-item') as CcListItem;
  await el.updateComplete;
  await document.fonts.ready;
  return el;
}

const part = (el: CcListItem, selector: string) => el.shadowRoot!.querySelector(selector) as HTMLElement;
const checkbox = (el: CcListItem) => part(el, 'cc-checkbox') as HTMLElement & { checked: boolean };

const tokenColor = (token: string) => {
  const probe = document.createElement('div');
  probe.style.color = `var(${token})`;
  document.body.append(probe);
  return getComputedStyle(probe).color;
};

async function press(target: HTMLElement, action: 'mousePressed' | 'mouseReleased') {
  const frame = window.frameElement!.getBoundingClientRect();
  const rect = target.getBoundingClientRect();
  await cdp().send('Input.dispatchMouseEvent', {
    type: action,
    x: frame.left + rect.left + 100,
    y: frame.top + rect.top + rect.height / 2,
    button: 'left',
    clickCount: 1,
  });
}

afterEach(async () => {
  document.body.innerHTML = '';
  await userEvent.unhover(document.body);
});

describe('cc-list-item', () => {
  it('exposes the listitem role', async () => {
    await render('<cc-list-item label="List item"></cc-list-item>');
    const { frameTree } = (await cdp().send('Page.getFrameTree')) as { frameTree: { childFrames: { frame: { id: string } }[] } };
    const { nodes } = (await cdp().send('Accessibility.getFullAXTree', { frameId: frameTree.childFrames[0].frame.id })) as {
      nodes: { role?: { value: string } }[];
    };
    expect(nodes.some((n) => n.role?.value === 'listitem')).toBe(true);
  });

  it('shows the label and the supporting text only when set', async () => {
    const el = await render('<cc-list-item label="List item"></cc-list-item>');
    expect(part(el, '.label').textContent).toBe('List item');
    expect(el.shadowRoot!.querySelector('.supporting')).toBeNull();
    el.supportingText = 'Smaller text';
    await el.updateComplete;
    expect(part(el, '.supporting').textContent).toBe('Smaller text');
  });

  it.each([
    ['checkbox', 40, 4, 4],
    ['icon', 44, 8, 8],
    ['none', 36, 4, 12],
  ])('matches the Figma size and padding with leading=%s', async (leading, height, padding, paddingLeft) => {
    const el = await render(`<cc-list-item label="List item" leading="${leading}"></cc-list-item>`);
    const row = part(el, '.row');
    expect(row.getBoundingClientRect().width).toBe(260);
    expect(row.getBoundingClientRect().height).toBe(height);
    const style = getComputedStyle(row);
    expect([style.paddingTop, style.paddingRight, style.paddingLeft, style.borderTopLeftRadius]).toEqual([
      `${padding}px`,
      '4px',
      `${paddingLeft}px`,
      '4px',
    ]);
    expect(part(el, '.content').getBoundingClientRect().height).toBe(28);
  });

  it.each([
    ['checkbox', 2, 32],
    ['icon', 8, 20],
    ['none', 4, 0],
  ])('spaces the leading element from the text with leading=%s', async (leading, gap, width) => {
    const el = await render(`<cc-list-item label="List item" leading="${leading}"></cc-list-item>`);
    expect(getComputedStyle(part(el, '.row')).columnGap).toBe(`${gap}px`);
    const lead = leading === 'checkbox' ? checkbox(el) : leading === 'icon' ? part(el, '.leading') : null;
    expect(lead ? lead.getBoundingClientRect().width : 0).toBe(width);
  });

  it('uses the Figma text styles', async () => {
    const el = await render('<cc-list-item label="List item" supporting-text="Smaller text"></cc-list-item>');
    const label = getComputedStyle(part(el, '.label'));
    const supporting = getComputedStyle(part(el, '.supporting'));
    expect([label.fontSize, label.lineHeight, label.fontWeight]).toEqual(['14px', '20px', '400']);
    expect([supporting.fontSize, supporting.lineHeight, supporting.fontWeight]).toEqual(['12px', '16px', '400']);
    expect(label.color).toBe(tokenColor('--cc-text-high-emphasis'));
    expect(supporting.color).toBe(tokenColor('--cc-text-low-emphasis'));
  });

  it('uses the Figma icon colours and sizes', async () => {
    const el = await render('<cc-list-item label="List item" leading="icon"></cc-list-item>');
    const lead = part(el, '.leading');
    const close = part(el, '.remove .material-icon');
    expect(lead.textContent).toBe('person_2');
    expect(lead.getBoundingClientRect().width).toBe(20);
    expect(getComputedStyle(lead).color).toBe(tokenColor('--cc-text-medium-emphasis'));
    expect(close.getBoundingClientRect().width).toBe(20);
    expect(getComputedStyle(close).color).toBe(tokenColor('--cc-text-low-emphasis'));
    expect(part(el, '.remove').getBoundingClientRect().width).toBe(28);
  });

  it('highlights the row on hover', async () => {
    const el = await render('<cc-list-item label="List item"></cc-list-item>');
    expect(getComputedStyle(part(el, '.row')).backgroundColor).toBe('rgba(0, 0, 0, 0)');
    await userEvent.hover(part(el, '.row'));
    expect(getComputedStyle(part(el, '.row')).backgroundColor).toBe(tokenColor('--cc-surface-surface-highlight-transparent'));
  });

  it('dims the row to 0.7 while pressed, but not while pressing the remove button', async () => {
    const el = await render('<cc-list-item label="List item"></cc-list-item>');
    const row = part(el, '.row');
    await userEvent.hover(row);
    await press(row, 'mousePressed');
    expect(getComputedStyle(row).opacity).toBe('0.7');
    await press(row, 'mouseReleased');
    expect(getComputedStyle(row).opacity).toBe('1');
    const remove = part(el, '.remove');
    await userEvent.hover(remove);
    const frame = window.frameElement!.getBoundingClientRect();
    const rect = remove.getBoundingClientRect();
    await cdp().send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x: frame.left + rect.left + rect.width / 2,
      y: frame.top + rect.top + rect.height / 2,
      button: 'left',
      clickCount: 1,
    });
    expect(getComputedStyle(row).opacity).toBe('1');
    await cdp().send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x: frame.left + rect.left + rect.width / 2,
      y: frame.top + rect.top + rect.height / 2,
      button: 'left',
      clickCount: 1,
    });
  });

  describe('remove button', () => {
    it('is a button named after the item', async () => {
      await render('<cc-list-item label="List item"></cc-list-item>');
      await expect.element(page.getByRole('button', { name: 'Remove List item', exact: true })).toBeVisible();
    });

    it('hides the icons from assistive technology', async () => {
      const el = await render('<cc-list-item label="List item" leading="icon"></cc-list-item>');
      expect(part(el, '.leading').getAttribute('aria-hidden')).toBe('true');
      expect(part(el, '.remove .material-icon').getAttribute('aria-hidden')).toBe('true');
    });

    it('fires a bubbling remove event on click', async () => {
      const el = await render('<cc-list-item label="List item"></cc-list-item>');
      const onRemove = vi.fn();
      document.body.addEventListener('remove', onRemove);
      await userEvent.click(page.getByRole('button', { name: 'Remove List item', exact: true }));
      expect(onRemove).toHaveBeenCalledOnce();
      expect(onRemove.mock.calls[0][0].target).toBe(el);
    });

    it('removes the item from the DOM, unless the remove event is cancelled', async () => {
      const el = await render('<cc-list-item label="List item"></cc-list-item>');
      el.addEventListener('remove', (e) => e.preventDefault(), { once: true });
      await userEvent.click(page.getByRole('button', { name: 'Remove List item', exact: true }));
      expect(el.isConnected).toBe(true);
      await userEvent.click(page.getByRole('button', { name: 'Remove List item', exact: true }));
      expect(el.isConnected).toBe(false);
    });

    it.each(['Enter', ' '])('fires remove from the keyboard with %j', async (key) => {
      const el = await render('<cc-list-item label="List item" leading="checkbox"></cc-list-item>');
      const onRemove = vi.fn();
      el.addEventListener('remove', onRemove);
      part(el, '.remove').shadowRoot!.querySelector('button')!.focus();
      await userEvent.keyboard(key === ' ' ? ' ' : '{Enter}');
      expect(onRemove).toHaveBeenCalledOnce();
      expect(el.selected).toBe(false);
    });

    it('is gone with hide-remove-button', async () => {
      const el = await render('<cc-list-item label="List item" hide-remove-button></cc-list-item>');
      expect(el.shadowRoot!.querySelector('.remove')).toBeNull();
    });

    it('does not toggle the checkbox', async () => {
      const el = await render('<cc-list-item label="List item" leading="checkbox"></cc-list-item>');
      await userEvent.click(page.getByRole('button', { name: 'Remove List item', exact: true }));
      expect(el.selected).toBe(false);
    });
  });

  describe('with a checkbox', () => {
    it('names the checkbox after the label', async () => {
      await render('<cc-list-item label="List item" leading="checkbox"></cc-list-item>');
      await expect.element(page.getByRole('checkbox', { name: 'List item', exact: true })).toBeVisible();
    });

    it('shows the selected state', async () => {
      const el = await render('<cc-list-item label="List item" leading="checkbox" selected></cc-list-item>');
      await expect.element(page.getByRole('checkbox', { name: 'List item', exact: true })).toBeChecked();
      expect(checkbox(el).checked).toBe(true);
    });

    it('toggles when the checkbox is clicked', async () => {
      const el = await render('<cc-list-item label="List item" leading="checkbox"></cc-list-item>');
      const onChange = vi.fn();
      el.addEventListener('change', onChange);
      await userEvent.click(checkbox(el));
      expect(el.selected).toBe(true);
      expect(el.hasAttribute('selected')).toBe(true);
      expect(onChange).toHaveBeenCalledOnce();
    });

    it('toggles once when the row is clicked', async () => {
      const el = await render('<cc-list-item label="List item" leading="checkbox"></cc-list-item>');
      const onChange = vi.fn();
      el.addEventListener('change', onChange);
      await userEvent.click(part(el, '.label'));
      expect(el.selected).toBe(true);
      expect(onChange).toHaveBeenCalledOnce();
      await userEvent.click(part(el, '.label'));
      expect(el.selected).toBe(false);
      expect(onChange).toHaveBeenCalledTimes(2);
    });

    it('toggles with the keyboard', async () => {
      const el = await render('<cc-list-item label="List item" leading="checkbox"></cc-list-item>');
      await userEvent.tab();
      await userEvent.keyboard(' ');
      expect(el.selected).toBe(true);
    });

    it('follows a selected value set from outside', async () => {
      const el = await render('<cc-list-item label="List item" leading="checkbox"></cc-list-item>');
      el.selected = true;
      await el.updateComplete;
      expect(checkbox(el).checked).toBe(true);
    });
  });

  it('shows a pointer over the row only when the row toggles a checkbox', async () => {
    const el = await render('<cc-list-item label="List item" leading="checkbox"></cc-list-item>');
    expect(getComputedStyle(part(el, '.row')).cursor).toBe('pointer');
    el.leading = 'none';
    await el.updateComplete;
    expect(getComputedStyle(part(el, '.row')).cursor).toBe('auto');
  });

  it.each(['icon', 'none'])('does nothing on a row click with leading=%s', async (leading) => {
    const el = await render(`<cc-list-item label="List item" leading="${leading}"></cc-list-item>`);
    const onChange = vi.fn();
    el.addEventListener('change', onChange);
    await userEvent.click(part(el, '.label'));
    expect(el.selected).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
    expect(el.shadowRoot!.querySelector('cc-checkbox')).toBeNull();
  });

  it('shows the icon given by icon only with leading=icon', async () => {
    const el = await render('<cc-list-item label="List item" leading="icon" icon="home"></cc-list-item>');
    expect(part(el, '.leading').textContent).toBe('home');
    el.leading = 'none';
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.leading')).toBeNull();
  });
});
