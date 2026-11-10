/// <reference types="@vitest/browser-playwright" />
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cdp, page, userEvent } from 'vitest/browser';
import '@codechem/tokens/tokens.css';
import './cc-number-input-stepper.js';
import type { CcNumberInputStepper } from './cc-number-input-stepper.js';

async function render(markup: string) {
  document.body.innerHTML = markup;
  const el = document.querySelector('cc-number-input-stepper') as CcNumberInputStepper;
  await el.updateComplete;
  await document.fonts.ready;
  return el;
}

const settle = async (el: CcNumberInputStepper) => {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await el.updateComplete;
};

const part = (el: CcNumberInputStepper, selector: string) => el.shadowRoot!.querySelector(selector) as HTMLElement;
const field = (el: CcNumberInputStepper) => part(el, 'input') as HTMLInputElement;
const stepper = (el: CcNumberInputStepper) => part(el, '.stepper');
const up = (el: CcNumberInputStepper) => part(el, 'button[part="increase"]') as HTMLButtonElement;
const down = (el: CcNumberInputStepper) => part(el, 'button[part="decrease"]') as HTMLButtonElement;

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

describe('cc-number-input-stepper', () => {
  it('is a spinbutton named by aria-label', async () => {
    await render('<cc-number-input-stepper aria-label="Quantity"></cc-number-input-stepper>');
    await expect.element(page.getByRole('spinbutton', { name: 'Quantity', exact: true })).toBeVisible();
  });

  it('is named and focused through an external <label for>', async () => {
    const el = await render('<label for="qty">Quantity</label><cc-number-input-stepper id="qty"></cc-number-input-stepper>');
    const { frameTree } = (await cdp().send('Page.getFrameTree')) as { frameTree: { childFrames: { frame: { id: string } }[] } };
    const { nodes } = (await cdp().send('Accessibility.getFullAXTree', { frameId: frameTree.childFrames[0].frame.id })) as {
      nodes: { role?: { value: string }; name?: { value: string } }[];
    };
    expect(nodes.some((n) => n.role?.value === 'spinbutton' && n.name?.value === 'Quantity')).toBe(true);
    await userEvent.click(page.getByText('Quantity'));
    expect(el.shadowRoot!.activeElement).toBe(field(el));
  });

  it('names the arrow buttons Increase and Decrease', async () => {
    await render('<cc-number-input-stepper aria-label="Quantity"></cc-number-input-stepper>');
    await expect.element(page.getByRole('button', { name: 'Increase', exact: true })).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Decrease', exact: true })).toBeVisible();
  });

  it('hides the leading icon and the arrow glyphs from assistive technology', async () => {
    const el = await render(
      '<cc-number-input-stepper aria-label="Quantity"><span slot="leading" class="material-icons-round" aria-hidden="true">add_box</span></cc-number-input-stepper>',
    );
    expect(part(el, '.leading').getAttribute('aria-hidden')).toBe('true');
    const glyphs = el.shadowRoot!.querySelectorAll('.material-icon');
    expect(glyphs.length).toBe(2);
    glyphs.forEach((glyph) => expect(glyph.getAttribute('aria-hidden')).toBe('true'));
    await expect.element(page.getByRole('spinbutton', { name: 'Quantity', exact: true })).toBeVisible();
  });

  it('keeps focus in the field when an arrow button is clicked', async () => {
    const el = await render('<cc-number-input-stepper aria-label="Quantity" value="3"></cc-number-input-stepper>');
    field(el).focus();
    await userEvent.click(up(el));
    expect(el.shadowRoot!.activeElement).toBe(field(el));
    await userEvent.keyboard('{ArrowUp}');
    expect(el.value).toBe('5');
  });

  it('steps up and down with the arrow buttons and fires input and change', async () => {
    const el = await render('<cc-number-input-stepper aria-label="Quantity" value="3"></cc-number-input-stepper>');
    const onInput = vi.fn();
    const onChange = vi.fn();
    el.addEventListener('input', onInput);
    el.addEventListener('change', onChange);

    await userEvent.click(up(el));
    expect(el.value).toBe('4');
    expect(field(el).value).toBe('4');
    expect(onInput).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledTimes(1);

    await userEvent.click(down(el));
    expect(el.value).toBe('3');
  });

  it('stops stepping at min and max', async () => {
    const low = await render('<cc-number-input-stepper aria-label="Q" min="0" value="0"></cc-number-input-stepper>');
    await userEvent.click(down(low));
    expect(low.value).toBe('0');

    const high = await render('<cc-number-input-stepper aria-label="Q" max="2" value="2"></cc-number-input-stepper>');
    await userEvent.click(up(high));
    expect(high.value).toBe('2');
  });

  it('steps with the keyboard arrow keys inside the field', async () => {
    const el = await render('<cc-number-input-stepper aria-label="Quantity" value="5"></cc-number-input-stepper>');
    const onInput = vi.fn();
    el.addEventListener('input', onInput);
    field(el).focus();
    await userEvent.keyboard('{ArrowUp}');
    expect(el.value).toBe('6');
    expect(onInput).toHaveBeenCalled();
  });

  it('keeps the arrow buttons out of the tab order', async () => {
    const el = await render('<cc-number-input-stepper aria-label="Quantity"></cc-number-input-stepper>');
    expect(up(el).tabIndex).toBe(-1);
    expect(down(el).tabIndex).toBe(-1);
  });

  it('blocks clicks and stepping when disabled', async () => {
    const el = await render('<cc-number-input-stepper aria-label="Quantity" value="3" disabled></cc-number-input-stepper>');
    const spy = vi.fn();
    el.addEventListener('click', spy);
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true, cancelable: true }));
    expect(spy).not.toHaveBeenCalled();
    expect(up(el).disabled).toBe(true);
    expect(down(el).disabled).toBe(true);
    expect(field(el).disabled).toBe(true);
    expect(el.value).toBe('3');
  });

  it('submits its value under name and follows stepping', async () => {
    await render('<form><cc-number-input-stepper name="qty" aria-label="Quantity" value="4"></cc-number-input-stepper></form>');
    const el = document.querySelector('cc-number-input-stepper') as CcNumberInputStepper;
    const form = document.querySelector('form')!;
    expect(new FormData(form).get('qty')).toBe('4');
    await userEvent.click(up(el));
    await settle(el);
    expect(new FormData(form).get('qty')).toBe('5');
  });

  it('is invalid while required and empty, and valid once it has a value', async () => {
    const el = await render('<cc-number-input-stepper aria-label="Quantity" required></cc-number-input-stepper>');
    expect(el.checkValidity()).toBe(false);
    el.value = '1';
    await el.updateComplete;
    expect(el.checkValidity()).toBe(true);
  });

  it('is invalid when the value is outside min and max', async () => {
    const el = await render('<cc-number-input-stepper aria-label="Quantity" min="1" max="3" value="7"></cc-number-input-stepper>');
    expect(el.checkValidity()).toBe(false);
    expect(el.validity.rangeOverflow).toBe(true);
  });

  it('resets to its value attribute with the form', async () => {
    await render('<form><cc-number-input-stepper name="qty" aria-label="Quantity" value="2"></cc-number-input-stepper></form>');
    const el = document.querySelector('cc-number-input-stepper') as CcNumberInputStepper;
    await userEvent.click(up(el));
    await settle(el);
    expect(el.value).toBe('3');
    document.querySelector('form')!.reset();
    await settle(el);
    expect(el.value).toBe('2');
  });

  it('forwards focus() to the inner field', async () => {
    const el = await render('<cc-number-input-stepper aria-label="Quantity"></cc-number-input-stepper>');
    el.focus();
    expect(el.shadowRoot!.activeElement).toBe(field(el));
  });

  it('forwards click() to the inner field', async () => {
    const el = await render('<cc-number-input-stepper aria-label="Quantity"></cc-number-input-stepper>');
    const spy = vi.fn();
    field(el).addEventListener('click', spy);
    el.click();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('draws the enabled stepper in surface-2 and the hovered stepper in surface-highlight', async () => {
    const el = await render('<cc-number-input-stepper aria-label="Quantity"></cc-number-input-stepper>');
    expect(getComputedStyle(stepper(el)).backgroundColor).toBe(tokenColor('--cc-surface-surface-2'));
    await userEvent.hover(el);
    await settle(el);
    expect(getComputedStyle(stepper(el)).backgroundColor).toBe(tokenColor('--cc-surface-surface-highlight'));
  });

  it('does not highlight the stepper on hover when disabled', async () => {
    const el = await render('<cc-number-input-stepper aria-label="Quantity" disabled></cc-number-input-stepper>');
    await userEvent.hover(el);
    await settle(el);
    expect(getComputedStyle(stepper(el)).backgroundColor).toBe(tokenColor('--cc-surface-surface-2'));
  });

  it('draws the focus stroke on the stepper when the field has focus', async () => {
    const el = await render('<cc-number-input-stepper aria-label="Quantity"></cc-number-input-stepper>');
    expect(getComputedStyle(stepper(el)).boxShadow).not.toContain(tokenColor('--cc-border-focus'));
    field(el).focus();
    await settle(el);
    expect(getComputedStyle(stepper(el)).boxShadow).toContain(tokenColor('--cc-border-focus'));
    expect(getComputedStyle(part(el, '.field')).boxShadow).toContain(tokenColor('--cc-border-focus'));
  });

  it('is 352px by 40px as a whole control', async () => {
    const el = await render('<cc-number-input-stepper aria-label="Quantity"></cc-number-input-stepper>');
    await settle(el);
    const rect = el.shadowRoot!.querySelector('.root')!.getBoundingClientRect();
    expect(rect.width).toBeCloseTo(352, 1);
    expect(rect.height).toBeCloseTo(40, 1);
  });

  it.each([
    ['stepper column', '.stepper', 32, 40],
    ['arrow button', 'button[part="increase"]', 32, 20],
  ])('sizes the %s to %ipx by %ipx', async (_name, selector, width, height) => {
    const el = await render('<cc-number-input-stepper aria-label="Quantity"></cc-number-input-stepper>');
    await settle(el);
    const rect = part(el, selector).getBoundingClientRect();
    expect(rect.width).toBeCloseTo(width, 1);
    expect(rect.height).toBeCloseTo(height, 1);
  });

  it('places the leading icon before the number at 24px', async () => {
    const el = await render(
      '<cc-number-input-stepper aria-label="Quantity"><span slot="leading" class="material-icons-round" aria-hidden="true">add_box</span></cc-number-input-stepper>',
    );
    await settle(el);
    const icon = el.querySelector('[slot="leading"]')!.getBoundingClientRect();
    expect(icon.right).toBeLessThanOrEqual(field(el).getBoundingClientRect().left);
    expect(icon.width).toBe(24);
  });
});
