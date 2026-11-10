/// <reference types="@vitest/browser-playwright" />
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cdp, page, userEvent } from 'vitest/browser';
import '@codechem/tokens/tokens.css';
import './cc-textarea.js';
import type { CcTextarea } from './cc-textarea.js';

async function render(markup: string) {
  document.body.innerHTML = markup;
  const el = document.querySelector('cc-textarea') as CcTextarea;
  await el.updateComplete;
  await document.fonts.ready;
  return el;
}

const part = (el: CcTextarea, selector: string) => el.shadowRoot!.querySelector(selector) as HTMLElement;
const field = (el: CcTextarea) => part(el, 'textarea') as HTMLTextAreaElement;

const tokenColor = (token: string) => {
  const probe = document.createElement('div');
  probe.style.color = `var(${token})`;
  document.body.append(probe);
  return getComputedStyle(probe).color;
};

afterEach(async () => {
  document.body.innerHTML = '';
  await userEvent.unhover(document.body);
});

describe('cc-textarea', () => {
  it('is a textbox named by its label', async () => {
    await render('<cc-textarea label="Message" required></cc-textarea>');
    await expect.element(page.getByRole('textbox', { name: 'Message', exact: true })).toBeVisible();
  });

  it('does not leak the asterisk or the info icon into the name', async () => {
    const el = await render('<cc-textarea label="Message" required></cc-textarea>');
    expect(part(el, '.asterisk').textContent).toBe('*');
    expect(part(el, '.info').textContent).toBe('info');
    await expect.element(page.getByRole('textbox', { name: 'Message', exact: true })).toBeVisible();
  });

  it('is named by aria-label when it has no label', async () => {
    await render('<cc-textarea aria-label="Comment"></cc-textarea>');
    await expect.element(page.getByRole('textbox', { name: 'Comment', exact: true })).toBeVisible();
  });

  it('shows the asterisk only when required', async () => {
    const el = await render('<cc-textarea label="Message"></cc-textarea>');
    expect(el.shadowRoot!.querySelector('.asterisk')).toBeNull();
    el.required = true;
    await el.updateComplete;
    expect(getComputedStyle(part(el, '.asterisk')).color).toBe(tokenColor('--cc-alert-error-main'));
    expect(field(el).required).toBe(true);
  });

  it('hides the info icon with hide-info-icon', async () => {
    const el = await render('<cc-textarea label="Message" hide-info-icon></cc-textarea>');
    expect(el.shadowRoot!.querySelector('.info')).toBeNull();
  });

  it('describes the field with the supporting text', async () => {
    const el = await render('<cc-textarea label="Message" supporting-text="Max 200 characters"></cc-textarea>');
    expect(part(el, '.supporting').textContent).toBe('Max 200 characters');
    expect(field(el).getAttribute('aria-describedby')).toBe('supporting');
  });

  it('shows the placeholder in the low-emphasis colour', async () => {
    const el = await render('<cc-textarea label="Message" placeholder="Placeholder text"></cc-textarea>');
    expect(field(el).placeholder).toBe('Placeholder text');
    expect(getComputedStyle(field(el), '::placeholder').color).toBe(tokenColor('--cc-text-low-emphasis'));
  });

  it('matches the Figma layout', async () => {
    const el = await render('<cc-textarea label="Label" supporting-text="Below"></cc-textarea>');
    const rect = (s: string) => part(el, s).getBoundingClientRect();
    expect(rect('.field').width).toBe(320);
    expect(rect('.field').height).toBe(96);
    expect(rect('.label').height).toBe(24);
    expect(rect('.field').top - rect('.label').bottom).toBe(8);
    expect(rect('.supporting').height).toBe(16);
    const style = getComputedStyle(part(el, '.field'));
    expect([style.paddingTop, style.paddingRight, style.borderTopLeftRadius]).toEqual(['8px', '12px', '4px']);
    expect(style.backgroundColor).toBe(tokenColor('--cc-surface-surface-2'));
    const iconRect = rect('.info');
    expect([iconRect.width, iconRect.height]).toEqual([16, 16]);
  });

  it('uses the Figma text colours', async () => {
    const el = await render('<cc-textarea label="Label" value="Input text"></cc-textarea>');
    expect(getComputedStyle(part(el, '.label')).color).toBe(tokenColor('--cc-text-high-emphasis'));
    expect(getComputedStyle(field(el)).color).toBe(tokenColor('--cc-text-high-emphasis'));
    expect(getComputedStyle(part(el, '.info')).color).toBe(tokenColor('--cc-text-low-emphasis'));
  });

  it('lightens the field on hover', async () => {
    const el = await render('<cc-textarea label="Label"></cc-textarea>');
    const before = getComputedStyle(part(el, '.field')).backgroundImage;
    await userEvent.hover(part(el, '.field'));
    expect(getComputedStyle(part(el, '.field')).backgroundImage).not.toBe(before);
  });

  it('does not react to hover when disabled', async () => {
    const el = await render('<cc-textarea label="Label" disabled></cc-textarea>');
    const before = getComputedStyle(part(el, '.field')).backgroundImage;
    await userEvent.hover(part(el, '.field'), { force: true });
    expect(getComputedStyle(part(el, '.field')).backgroundImage).toBe(before);
  });

  it('draws the focus stroke inside the field on focus', async () => {
    const el = await render('<cc-textarea label="Label"></cc-textarea>');
    expect(getComputedStyle(part(el, '.field')).boxShadow).not.toContain(tokenColor('--cc-border-focus'));
    el.focus();
    expect(getComputedStyle(part(el, '.field')).boxShadow).toContain(tokenColor('--cc-border-focus'));
    expect(getComputedStyle(part(el, '.field')).boxShadow).toContain('inset');
  });

  it('forwards focus() and click() to the inner textarea', async () => {
    const el = await render('<cc-textarea label="Label"></cc-textarea>');
    el.focus();
    expect(el.shadowRoot!.activeElement).toBe(field(el));
    const onClick = vi.fn();
    field(el).addEventListener('click', onClick);
    el.click();
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('updates value and fires input while typing, change on blur', async () => {
    const el = await render('<cc-textarea label="Message"></cc-textarea>');
    const onInput = vi.fn();
    const onChange = vi.fn();
    el.addEventListener('input', onInput);
    el.addEventListener('change', onChange);
    await userEvent.fill(page.getByRole('textbox', { name: 'Message', exact: true }), 'Hello');
    expect(el.value).toBe('Hello');
    expect(onInput).toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
    await userEvent.tab();
    expect(onChange).toHaveBeenCalledOnce();
  });

  it('shows a value set from outside', async () => {
    const el = await render('<cc-textarea label="Message" value="Input text"></cc-textarea>');
    expect(field(el).value).toBe('Input text');
    el.value = 'Changed';
    await el.updateComplete;
    expect(field(el).value).toBe('Changed');
  });

  it('is dimmed and not editable when disabled', async () => {
    const el = await render('<cc-textarea label="Label" disabled></cc-textarea>');
    expect(getComputedStyle(part(el, '.root')).opacity).toBe('0.4');
    expect(getComputedStyle(part(el, '.root')).cursor).toBe('not-allowed');
    expect(field(el).disabled).toBe(true);
  });

  it('blocks click listeners when disabled', async () => {
    const el = await render('<cc-textarea label="Label" disabled></cc-textarea>');
    const onClick = vi.fn();
    el.addEventListener('click', onClick);
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('shows the info icon by default and the field is 96px tall without label', async () => {
    const el = await render('<cc-textarea label="Label"></cc-textarea>');
    expect(part(el, '.info').getBoundingClientRect().width).toBe(16);
    const bare = await render('<cc-textarea aria-label="Comment"></cc-textarea>');
    expect(part(bare, '.field').getBoundingClientRect().height).toBe(96);
  });

  it('is named and focused through an external <label for>', async () => {
    const el = await render('<label for="ext">External</label><cc-textarea id="ext"></cc-textarea>');
    const { frameTree } = (await cdp().send('Page.getFrameTree')) as { frameTree: { childFrames: { frame: { id: string } }[] } };
    const { nodes } = (await cdp().send('Accessibility.getFullAXTree', { frameId: frameTree.childFrames[0].frame.id })) as {
      nodes: { role?: { value: string }; name?: { value: string } }[];
    };
    expect(nodes.some((n) => n.role?.value === 'textbox' && n.name?.value === 'External')).toBe(true);
    await userEvent.click(page.getByText('External'));
    expect(el.shadowRoot!.activeElement).toBe(field(el));
  });

  it('exposes the validity API', async () => {
    const el = await render('<form><cc-textarea label="Message" required></cc-textarea></form>');
    expect(el.checkValidity()).toBe(false);
    expect(el.validity.valueMissing).toBe(true);
    expect(el.form).toBe(document.querySelector('form'));
    el.value = 'Hello';
    await el.updateComplete;
    expect(el.checkValidity()).toBe(true);
    el.required = false;
    el.value = '';
    await el.updateComplete;
    expect(el.validationMessage).toBe('');
  });

  it('restores its value from form state', async () => {
    const el = await render('<cc-textarea label="Message"></cc-textarea>');
    el.formStateRestoreCallback('Restored');
    await el.updateComplete;
    expect(field(el).value).toBe('Restored');
  });

  describe('in a form', () => {
    it('is disabled by a disabled fieldset', async () => {
      const el = await render('<fieldset disabled><cc-textarea name="m" label="Message" required></cc-textarea></fieldset>');
      await el.updateComplete;
      expect(field(el).disabled).toBe(true);
      expect(getComputedStyle(part(el, '.root')).opacity).toBe('0.4');
      expect(el.willValidate).toBe(false);
    });

    const form = (textarea: string) => `<form>${textarea}</form>`;
    const data = () => new FormData(document.querySelector('form')!);

    it('submits its value under its name', async () => {
      await render(form('<cc-textarea name="message" label="Message"></cc-textarea>'));
      await userEvent.fill(page.getByRole('textbox', { name: 'Message', exact: true }), 'Hello');
      expect(data().get('message')).toBe('Hello');
    });

    it('is left out of the form data when disabled', async () => {
      await render(form('<cc-textarea name="message" value="Hello" disabled></cc-textarea>'));
      expect(data().get('message')).toBeNull();
    });

    it('is invalid while required and empty', async () => {
      const el = await render(form('<cc-textarea name="message" label="Message" required></cc-textarea>'));
      const formEl = document.querySelector('form')!;
      expect(formEl.checkValidity()).toBe(false);
      expect(el.matches(':invalid')).toBe(true);
      await userEvent.fill(page.getByRole('textbox', { name: 'Message', exact: true }), 'Hello');
      expect(formEl.checkValidity()).toBe(true);
    });

    it('resets to its initial value', async () => {
      const el = await render(form('<cc-textarea name="message" label="Message" value="Initial"></cc-textarea>'));
      await userEvent.fill(page.getByRole('textbox', { name: 'Message', exact: true }), 'Changed');
      expect(data().get('message')).toBe('Changed');
      document.querySelector('form')!.reset();
      await el.updateComplete;
      expect(el.value).toBe('Initial');
      expect(field(el).value).toBe('Initial');
      expect(data().get('message')).toBe('Initial');
    });
  });
});
