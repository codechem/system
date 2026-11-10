/// <reference types="@vitest/browser-playwright" />
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cdp, page, userEvent } from 'vitest/browser';
import '@codechem/tokens/tokens.css';
import './cc-text-input.js';
import type { CcTextInput } from './cc-text-input.js';

async function render(markup: string) {
  document.body.innerHTML = markup;
  const el = document.querySelector('cc-text-input') as CcTextInput;
  await el.updateComplete;
  await document.fonts.ready;
  return el;
}

const settle = async (el: CcTextInput) => {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await el.updateComplete;
};

const part = (el: CcTextInput, selector: string) => el.shadowRoot!.querySelector(selector) as HTMLElement;
const field = (el: CcTextInput) => part(el, 'input') as HTMLInputElement;
const root = (el: CcTextInput) => part(el, '.root');
const box = (el: CcTextInput) => part(el, '.field');

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

describe('cc-text-input', () => {
  it('is a textbox named by its label', async () => {
    await render('<cc-text-input label="Name"></cc-text-input>');
    await expect.element(page.getByRole('textbox', { name: 'Name', exact: true })).toBeVisible();
  });

  it('does not leak the asterisk or the info icon into the name', async () => {
    const el = await render('<cc-text-input label="Name" required show-info-icon></cc-text-input>');
    expect(part(el, '.asterisk').textContent).toBe('*');
    expect(part(el, '.info').textContent).toBe('info');
    await expect.element(page.getByRole('textbox', { name: 'Name', exact: true })).toBeVisible();
  });

  it('is named by aria-label when it has no label', async () => {
    await render('<cc-text-input aria-label="Search"></cc-text-input>');
    await expect.element(page.getByRole('textbox', { name: 'Search', exact: true })).toBeVisible();
  });

  it('shows the asterisk only when required', async () => {
    const el = await render('<cc-text-input label="Name"></cc-text-input>');
    expect(el.shadowRoot!.querySelector('.asterisk')).toBeNull();
    el.required = true;
    await el.updateComplete;
    expect(getComputedStyle(part(el, '.asterisk')).color).toBe(tokenColor('--cc-alert-error-main'));
    expect(field(el).required).toBe(true);
  });

  it('shows "(optional)" in the name only with the optional attribute', async () => {
    await render('<cc-text-input label="Nickname" optional></cc-text-input>');
    await expect.element(page.getByRole('textbox', { name: 'Nickname (optional)', exact: true })).toBeVisible();
  });

  it('shows the info icon only with show-info-icon', async () => {
    const hidden = await render('<cc-text-input label="Name"></cc-text-input>');
    expect(hidden.shadowRoot!.querySelector('.info')).toBeNull();
    const shown = await render('<cc-text-input label="Name" show-info-icon></cc-text-input>');
    expect(part(shown, '.info').getBoundingClientRect().width).toBe(16);
  });

  it('shows the trailing chevron unless hide-trailing-icon is set', async () => {
    const el = await render('<cc-text-input label="Name"></cc-text-input>');
    expect(part(el, '.trailing').textContent).toBe('chevron_right');
    const hidden = await render('<cc-text-input label="Name" hide-trailing-icon></cc-text-input>');
    expect(hidden.shadowRoot!.querySelector('.trailing')).toBeNull();
  });

  it('places the leading slot before the text, inside the field', async () => {
    const el = await render(
      '<cc-text-input label="Name"><span slot="leading" class="material-icons-round" aria-hidden="true">add_box</span></cc-text-input>',
    );
    await settle(el);
    const icon = el.querySelector('[slot="leading"]')!.getBoundingClientRect();
    const input = field(el).getBoundingClientRect();
    expect(icon.right).toBeLessThanOrEqual(input.left);
    expect(icon.width).toBe(24);
    expect(box(el).classList.contains('has-leading')).toBe(true);
  });

  it('keeps the leading icon out of the accessible name', async () => {
    await render(
      '<cc-text-input label="Name"><span slot="leading" class="material-icons-round" aria-hidden="true">add_box</span></cc-text-input>',
    );
    await expect.element(page.getByRole('textbox', { name: 'Name', exact: true })).toBeVisible();
  });

  it('places chips before the text and drops the leading padding for them', async () => {
    const el = await render('<cc-text-input label="Tags"><span slot="chips">Alpha</span></cc-text-input>');
    await settle(el);
    const chip = el.querySelector('[slot="chips"]')!.getBoundingClientRect();
    expect(chip.right).toBeLessThanOrEqual(field(el).getBoundingClientRect().left);
    expect(box(el).classList.contains('has-chips')).toBe(true);
    expect(getComputedStyle(box(el)).paddingLeft).toBe('4px');
  });

  it('keeps chips in the accessibility tree', async () => {
    const el = await render('<cc-text-input label="Tags"><span slot="chips">Alpha</span></cc-text-input>');
    await settle(el);
    expect(el.querySelector('[slot="chips"]')!.getAttribute('aria-hidden')).toBeNull();
    const chipsWrapper = part(el, '.chips');
    expect(chipsWrapper.getAttribute('aria-hidden')).toBeNull();
  });

  it('matches the Figma layout', async () => {
    const el = await render('<cc-text-input label="Label" supporting-text="Below"></cc-text-input>');
    const rect = (s: string) => part(el, s).getBoundingClientRect();
    expect(rect('.field').width).toBe(320);
    expect(rect('.field').height).toBe(40);
    expect(rect('.label').height).toBe(24);
    expect(rect('.supporting').top - rect('.label').bottom).toBe(2);
    expect(rect('.field').top - rect('.supporting').bottom).toBe(8);
    const style = getComputedStyle(box(el));
    expect([style.paddingTop, style.paddingRight, style.paddingLeft, style.borderTopLeftRadius]).toEqual([
      '8px',
      '8px',
      '12px',
      '4px',
    ]);
    expect(style.backgroundColor).toBe(tokenColor('--cc-surface-surface-2'));
    expect(rect('.supporting').height).toBe(16);
  });

  it('shows the error text 8px under the field, in 16px rows', async () => {
    const el = await render('<cc-text-input label="Name" error="Error text goes here"></cc-text-input>');
    const rect = (s: string) => part(el, s).getBoundingClientRect();
    expect(rect('.error').height).toBe(16);
    expect(rect('.error').top - rect('.field').bottom).toBe(8);
    expect(getComputedStyle(part(el, '.error')).color).toBe(tokenColor('--cc-alert-error-light'));
  });

  it('uses the Figma text colours', async () => {
    const el = await render('<cc-text-input label="Label" value="Input text" supporting-text="Below"></cc-text-input>');
    expect(getComputedStyle(part(el, '.label')).color).toBe(tokenColor('--cc-text-high-emphasis'));
    expect(getComputedStyle(field(el)).color).toBe(tokenColor('--cc-text-high-emphasis'));
    expect(getComputedStyle(part(el, '.supporting')).color).toBe(tokenColor('--cc-text-low-emphasis'));
  });

  it('shows the placeholder in the low-emphasis colour', async () => {
    const el = await render('<cc-text-input label="Name" placeholder="Placeholder text"></cc-text-input>');
    expect(field(el).placeholder).toBe('Placeholder text');
    expect(getComputedStyle(field(el), '::placeholder').color).toBe(tokenColor('--cc-text-low-emphasis'));
  });

  it('lightens the field on hover', async () => {
    const el = await render('<cc-text-input label="Name"></cc-text-input>');
    const before = getComputedStyle(box(el)).backgroundImage;
    await userEvent.hover(box(el));
    expect(getComputedStyle(box(el)).backgroundImage).not.toBe(before);
  });

  it('does not react to hover when disabled', async () => {
    const el = await render('<cc-text-input label="Name" disabled></cc-text-input>');
    const before = getComputedStyle(box(el)).backgroundImage;
    await userEvent.hover(box(el), { force: true });
    expect(getComputedStyle(box(el)).backgroundImage).toBe(before);
  });

  it('dims the whole component to 0.7 while pressed', async () => {
    const el = await render('<cc-text-input label="Name"></cc-text-input>');
    expect(getComputedStyle(root(el)).opacity).toBe('1');
    await userEvent.pointer({ keys: '[MouseLeft>]', target: box(el) });
    expect(getComputedStyle(root(el)).opacity).toBe('0.7');
    await userEvent.pointer({ keys: '[/MouseLeft]' });
    expect(getComputedStyle(root(el)).opacity).toBe('1');
  });

  it('draws the focus stroke inside the field on focus', async () => {
    const el = await render('<cc-text-input label="Name"></cc-text-input>');
    expect(getComputedStyle(box(el)).boxShadow).not.toContain(tokenColor('--cc-border-focus'));
    el.focus();
    expect(getComputedStyle(box(el)).boxShadow).toContain(tokenColor('--cc-border-focus'));
    expect(getComputedStyle(box(el)).boxShadow).toContain('inset');
  });

  it('draws the error stroke on an invalid field and keeps the focus stroke on focus', async () => {
    const el = await render('<cc-text-input label="Name" error="Error text goes here"></cc-text-input>');
    expect(getComputedStyle(box(el)).boxShadow).toContain(tokenColor('--cc-alert-error-main'));
    expect(field(el).getAttribute('aria-invalid')).toBe('true');
    el.focus();
    expect(getComputedStyle(box(el)).boxShadow).toContain(tokenColor('--cc-border-focus'));
  });

  it('describes the field with the supporting and error text', async () => {
    const el = await render(
      '<cc-text-input label="Name" supporting-text="Help" error="Error text goes here"></cc-text-input>',
    );
    expect(field(el).getAttribute('aria-describedby')).toBe('supporting error');
    await expect.element(page.getByRole('textbox', { name: 'Name', exact: true })).toHaveAccessibleDescription('Help Error text goes here');
  });

  it('forwards focus() and click() to the inner input', async () => {
    const el = await render('<cc-text-input label="Name"></cc-text-input>');
    el.focus();
    expect(el.shadowRoot!.activeElement).toBe(field(el));
    const onClick = vi.fn();
    field(el).addEventListener('click', onClick);
    el.click();
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('updates value and fires input while typing, change on blur', async () => {
    const el = await render('<cc-text-input label="Name"></cc-text-input>');
    const onInput = vi.fn();
    const onChange = vi.fn();
    el.addEventListener('input', onInput);
    el.addEventListener('change', onChange);
    await userEvent.fill(page.getByRole('textbox', { name: 'Name', exact: true }), 'John Doe');
    expect(el.value).toBe('John Doe');
    expect(onInput).toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
    await userEvent.tab();
    expect(onChange).toHaveBeenCalledOnce();
  });

  it('shows a value set from outside', async () => {
    const el = await render('<cc-text-input label="Name" value="Input text"></cc-text-input>');
    expect(field(el).value).toBe('Input text');
    el.value = 'Changed';
    await el.updateComplete;
    expect(field(el).value).toBe('Changed');
  });

  it('is dimmed and not editable when disabled', async () => {
    const el = await render('<cc-text-input label="Name" disabled></cc-text-input>');
    expect(getComputedStyle(root(el)).opacity).toBe('0.4');
    expect(getComputedStyle(root(el)).cursor).toBe('not-allowed');
    expect(field(el).disabled).toBe(true);
  });

  it('blocks click listeners when disabled', async () => {
    const el = await render('<cc-text-input label="Name" disabled></cc-text-input>');
    const onClick = vi.fn();
    el.addEventListener('click', onClick);
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('is named and focused through an external <label for>', async () => {
    const el = await render('<label for="ext">External</label><cc-text-input id="ext"></cc-text-input>');
    const { frameTree } = (await cdp().send('Page.getFrameTree')) as { frameTree: { childFrames: { frame: { id: string } }[] } };
    const { nodes } = (await cdp().send('Accessibility.getFullAXTree', { frameId: frameTree.childFrames[0].frame.id })) as {
      nodes: { role?: { value: string }; name?: { value: string } }[];
    };
    expect(nodes.some((n) => n.role?.value === 'textbox' && n.name?.value === 'External')).toBe(true);
    await userEvent.click(page.getByText('External'));
    expect(el.shadowRoot!.activeElement).toBe(field(el));
  });

  it('exposes the validity API', async () => {
    const el = await render('<form><cc-text-input label="Name" required></cc-text-input></form>');
    expect(el.checkValidity()).toBe(false);
    expect(el.validity.valueMissing).toBe(true);
    expect(el.form).toBe(document.querySelector('form'));
    el.value = 'John Doe';
    await el.updateComplete;
    expect(el.checkValidity()).toBe(true);
    el.required = false;
    el.value = '';
    await el.updateComplete;
    expect(el.validationMessage).toBe('');
  });

  it('is invalid with the error text as its validation message', async () => {
    const el = await render('<form><cc-text-input name="name" label="Name" error="Error text goes here"></cc-text-input></form>');
    expect(el.checkValidity()).toBe(false);
    expect(el.validity.customError).toBe(true);
    expect(el.validationMessage).toBe('Error text goes here');
    el.error = '';
    await el.updateComplete;
    expect(el.checkValidity()).toBe(true);
  });

  it('uses the error text, not the native message, when required and empty with an error', async () => {
    const el = await render(
      '<form><cc-text-input label="Name" required error="Error text goes here"></cc-text-input></form>',
    );
    expect(el.validity.customError).toBe(true);
    expect(el.validity.valueMissing).toBe(false);
    expect(el.validationMessage).toBe('Error text goes here');
  });

  it('is valid while disabled, even with an error', async () => {
    const el = await render('<form><cc-text-input label="Name" error="Error text goes here" disabled></cc-text-input></form>');
    expect(el.checkValidity()).toBe(true);
  });

  it('restores its value from form state', async () => {
    const el = await render('<cc-text-input label="Name"></cc-text-input>');
    el.formStateRestoreCallback('Restored');
    await el.updateComplete;
    expect(field(el).value).toBe('Restored');
  });

  describe('in a form', () => {
    it('is disabled by a disabled fieldset', async () => {
      const el = await render('<fieldset disabled><cc-text-input name="n" label="Name" required></cc-text-input></fieldset>');
      await el.updateComplete;
      expect(field(el).disabled).toBe(true);
      expect(getComputedStyle(root(el)).opacity).toBe('0.4');
      expect(el.willValidate).toBe(false);
    });

    const form = (input: string) => `<form>${input}</form>`;
    const data = () => new FormData(document.querySelector('form')!);

    it('submits its value under its name', async () => {
      await render(form('<cc-text-input name="name" label="Name"></cc-text-input>'));
      await userEvent.fill(page.getByRole('textbox', { name: 'Name', exact: true }), 'John Doe');
      expect(data().get('name')).toBe('John Doe');
    });

    it('is left out of the form data when disabled', async () => {
      await render(form('<cc-text-input name="name" value="John Doe" disabled></cc-text-input>'));
      expect(data().get('name')).toBeNull();
    });

    it('is invalid while required and empty', async () => {
      const el = await render(form('<cc-text-input name="name" label="Name" required></cc-text-input>'));
      const formEl = document.querySelector('form')!;
      expect(formEl.checkValidity()).toBe(false);
      expect(el.matches(':invalid')).toBe(true);
      await userEvent.fill(page.getByRole('textbox', { name: 'Name', exact: true }), 'John Doe');
      expect(formEl.checkValidity()).toBe(true);
    });

    it('resets to its initial value', async () => {
      const el = await render(form('<cc-text-input name="name" label="Name" value="Initial"></cc-text-input>'));
      await userEvent.fill(page.getByRole('textbox', { name: 'Name', exact: true }), 'Changed');
      expect(data().get('name')).toBe('Changed');
      document.querySelector('form')!.reset();
      await el.updateComplete;
      expect(el.value).toBe('Initial');
      expect(field(el).value).toBe('Initial');
      expect(data().get('name')).toBe('Initial');
    });
  });
});
