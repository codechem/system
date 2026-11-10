/// <reference types="@vitest/browser-playwright" />
import { afterEach, describe, expect, it } from 'vitest';
import { cdp, userEvent } from 'vitest/browser';
import '@codechem/tokens/tokens.css';
import '../button/cc-button.js';
import './cc-tooltip.js';
import type { CcTooltip } from './cc-tooltip.js';

async function render(markup: string) {
  document.body.innerHTML = `<div style="padding: 80px 160px">${markup}</div>`;
  const el = document.querySelector('cc-tooltip') as CcTooltip;
  await el.updateComplete;
  await document.querySelector<HTMLElement & { updateComplete?: Promise<unknown> }>('cc-button')?.updateComplete;
  await new Promise((r) => setTimeout(r));
  await document.fonts.ready;
  return el;
}

const anchor = () => document.getElementById('save')!;
const bubble = (el: CcTooltip) => el.shadowRoot!.querySelector<HTMLElement>('.bubble')!;
const isOpen = (el: CcTooltip) => el.matches(':popover-open');
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

type AXNode = { role?: { value: string }; name?: { value: string }; description?: { value: string } };
const axDescription = async (role: string, name: string) => {
  const { frameTree } = (await cdp().send('Page.getFrameTree')) as { frameTree: { childFrames: { frame: { id: string } }[] } };
  const frameId = frameTree.childFrames[0].frame.id;
  const { nodes } = (await cdp().send('Accessibility.getFullAXTree', { frameId })) as { nodes: AXNode[] };
  return nodes.find((n) => n.role?.value === role && n.name?.value === name)?.description?.value;
};

const tokenColor = (prop: 'color' | 'backgroundColor', value: string) => {
  const probe = document.createElement('div');
  probe.style[prop] = value;
  document.body.append(probe);
  return getComputedStyle(probe)[prop];
};

afterEach(async () => {
  await userEvent.unhover(document.body);
  document.body.innerHTML = '';
});

describe('cc-tooltip', () => {
  it('is a hidden tooltip popover by default', async () => {
    const el = await render('<button id="save">Save</button><cc-tooltip for="save">Save the draft</cc-tooltip>');
    expect(el.getAttribute('role')).toBe('tooltip');
    expect(el.getAttribute('placement')).toBe('top');
    expect(isOpen(el)).toBe(false);
  });

  it('shows on hover and hides when the pointer leaves', async () => {
    const el = await render('<button id="save">Save</button><cc-tooltip for="save">Save the draft</cc-tooltip>');
    await userEvent.hover(anchor());
    expect(isOpen(el)).toBe(true);
    await userEvent.unhover(anchor());
    await wait(150);
    expect(isOpen(el)).toBe(false);
  });

  it('stays open while the pointer moves onto it', async () => {
    const el = await render('<button id="save">Save</button><cc-tooltip for="save">Save the draft</cc-tooltip>');
    await userEvent.hover(anchor());
    await userEvent.hover(bubble(el));
    await wait(150);
    expect(isOpen(el)).toBe(true);
  });

  it('shows on keyboard focus, hides on blur and on Escape', async () => {
    const el = await render('<button id="save">Save</button><cc-tooltip for="save">Save the draft</cc-tooltip>');
    await userEvent.tab();
    expect(isOpen(el)).toBe(true);
    await userEvent.keyboard('{Escape}');
    expect(isOpen(el)).toBe(false);
    anchor().blur();
    anchor().focus();
    expect(isOpen(el)).toBe(true);
    anchor().blur();
    expect(isOpen(el)).toBe(false);
  });

  it('describes a native trigger', async () => {
    await render('<button id="save">Save</button><cc-tooltip for="save">Save the draft</cc-tooltip>');
    expect(await axDescription('button', 'Save')).toBe('Save the draft');
  });

  it('describes the inner button of a cc-button', async () => {
    const el = await render('<cc-button id="save">Save</cc-button><cc-tooltip for="save">Save the draft</cc-tooltip>');
    expect(await axDescription('button', 'Save')).toBe('Save the draft');
    await userEvent.tab();
    expect(isOpen(el)).toBe(true);
  });

  it('moves to a new trigger when for changes', async () => {
    const el = await render('<button id="save">Save</button><button id="undo">Undo</button><cc-tooltip for="save">Tip</cc-tooltip>');
    el.for = 'undo';
    await el.updateComplete;
    await wait(0);
    expect(anchor().ariaDescribedByElements ?? []).toEqual([]);
    expect(anchor().style.getPropertyValue('anchor-name')).toBe('');
    await userEvent.hover(document.getElementById('undo')!);
    expect(isOpen(el)).toBe(true);
  });

  it('uses the Figma colours, text style and padding', async () => {
    const el = await render('<button id="save">Save</button><cc-tooltip for="save">Save the draft</cc-tooltip>');
    el.show();
    const style = getComputedStyle(bubble(el));
    expect(style.backgroundColor).toBe(tokenColor('backgroundColor', 'var(--cc-palette-black)'));
    expect(style.color).toBe(tokenColor('color', 'var(--cc-text-high-emphasis)'));
    expect(style.fontSize).toBe('14px');
    expect(style.padding).toBe('4px 8px');
    expect(bubble(el).getBoundingClientRect().height).toBe(28);
  });

  it.each([
    ['top', (t: DOMRect, a: DOMRect) => a.top - t.bottom],
    ['bottom', (t: DOMRect, a: DOMRect) => t.top - a.bottom],
    ['left', (t: DOMRect, a: DOMRect) => a.left - t.right],
    ['right', (t: DOMRect, a: DOMRect) => t.left - a.right],
  ] as const)('placement=%s sits 8px from the trigger, centred, with the arrow pointing at it', async (placement, gap) => {
    const el = await render(`<button id="save">Save</button><cc-tooltip for="save" placement="${placement}">Save the draft</cc-tooltip>`);
    el.show();
    const t = bubble(el).getBoundingClientRect();
    const a = anchor().getBoundingClientRect();
    expect(gap(t, a)).toBeCloseTo(8, 0);
    const vertical = placement === 'top' || placement === 'bottom';
    const centre = (r: DOMRect) => (vertical ? r.left + r.width / 2 : r.top + r.height / 2);
    expect(centre(t)).toBeCloseTo(centre(a), 0);

    const arrow = getComputedStyle(bubble(el), '::after');
    const side = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' }[placement];
    expect(arrow.getPropertyValue(side)).toBe('-6px');
  });

  it('keeps working after it is moved in the DOM', async () => {
    const el = await render('<button id="save">Save</button><cc-tooltip for="save">Save the draft</cc-tooltip><div id="box"></div>');
    document.getElementById('box')!.append(el);
    await wait(0);
    await userEvent.hover(anchor());
    expect(isOpen(el)).toBe(true);
    expect(await axDescription('button', 'Save')).toBe('Save the draft');
  });

  it('picks up a trigger rendered after it', async () => {
    const el = await render('<cc-tooltip for="save">Save the draft</cc-tooltip>');
    el.insertAdjacentHTML('beforebegin', '<button id="save">Save</button>');
    await userEvent.hover(anchor());
    expect(isOpen(el)).toBe(true);
  });

  it('describes a trigger whose element is defined after the tooltip', async () => {
    await render('<cc-late-button id="save"></cc-late-button><cc-tooltip for="save">Save the draft</cc-tooltip>');
    customElements.define(
      'cc-late-button',
      class extends HTMLElement {
        constructor() {
          super();
          this.attachShadow({ mode: 'open' }).innerHTML = '<button>Save</button>';
        }
      },
    );
    await wait(0);
    expect(await axDescription('button', 'Save')).toBe('Save the draft');
  });

  it('cleans up the last trigger after a quick for change and removal', async () => {
    const el = await render('<button id="save">Save</button><button id="undo">Undo</button><cc-tooltip for="save">Tip</cc-tooltip>');
    el.for = 'undo';
    await el.updateComplete;
    el.remove();
    await wait(0);
    for (const id of ['save', 'undo']) expect(document.getElementById(id)!.style.getPropertyValue('anchor-name')).toBe('');
  });

  it('survives being added and removed in the same tick', async () => {
    const errors: unknown[] = [];
    const onError = (e: ErrorEvent) => errors.push(e.error);
    window.addEventListener('error', onError);
    const el = document.createElement('cc-tooltip');
    el.for = 'nothing';
    document.body.append(el);
    el.remove();
    await wait(0);
    window.removeEventListener('error', onError);
    expect(errors).toEqual([]);
  });

  it('keeps the author anchor-name and shares a trigger with another tooltip', async () => {
    await render(
      '<button id="save" style="anchor-name: --mine">Save</button><cc-tooltip for="save">One</cc-tooltip><cc-tooltip for="save" placement="bottom">Two</cc-tooltip>',
    );
    const [one, two] = document.querySelectorAll('cc-tooltip');
    expect(anchor().style.getPropertyValue('anchor-name').split(', ')).toHaveLength(3);
    two.remove();
    await wait(0);
    expect(anchor().style.getPropertyValue('anchor-name').startsWith('--mine, ')).toBe(true);
    one.show();
    expect(bubble(one).getBoundingClientRect().bottom).toBeLessThan(anchor().getBoundingClientRect().top);
  });

  it('closes only itself on Escape inside a dialog', async () => {
    document.body.innerHTML = '<dialog><button id="save">Save</button><cc-tooltip for="save">Tip</cc-tooltip></dialog>';
    const dialog = document.querySelector('dialog')!;
    const el = document.querySelector('cc-tooltip')!;
    await el.updateComplete;
    dialog.showModal();
    anchor().focus();
    await wait(20);
    expect(isOpen(el)).toBe(true);
    await userEvent.keyboard('{Escape}');
    expect(isOpen(el)).toBe(false);
    expect(dialog.open).toBe(true);
    await userEvent.keyboard('{Escape}');
    expect(dialog.open).toBe(false);
  });

  it('stays open while the trigger is focused, even when the pointer leaves', async () => {
    const el = await render('<button id="save">Save</button><cc-tooltip for="save">Tip</cc-tooltip>');
    await userEvent.hover(anchor());
    anchor().focus();
    await userEvent.unhover(anchor());
    await wait(150);
    expect(isOpen(el)).toBe(true);
  });

  it('reacts only to the element its id resolves to, like label for', async () => {
    const el = await render('<button id="save">First</button> <button id="save">Second</button><cc-tooltip for="save">Tip</cc-tooltip>');
    await userEvent.hover(document.querySelectorAll('button')[1]);
    expect(isOpen(el)).toBe(false);
    await userEvent.hover(document.querySelectorAll('button')[0]);
    expect(isOpen(el)).toBe(true);
  });

  it('stops listening when removed', async () => {
    const el = await render('<button id="save">Save</button><cc-tooltip for="save">Tip</cc-tooltip>');
    el.remove();
    await wait(0);
    expect(anchor().ariaDescribedByElements ?? []).toEqual([]);
    await userEvent.hover(anchor());
    expect(isOpen(el)).toBe(false);
  });
});
