import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import '@codechem/tokens/tokens.css';
import './cc-radio-group.js';
import type { CcRadioGroup } from './cc-radio-group.js';
import type { CcRadio } from './cc-radio.js';

const options = `
  <cc-radio value="email">Email</cc-radio>
  <cc-radio value="phone">Phone</cc-radio>
  <cc-radio value="post">Post</cc-radio>`;

async function render(markup: string) {
  document.body.innerHTML = markup;
  const group = document.querySelector('cc-radio-group') as CcRadioGroup;
  await group.updateComplete;
  await Promise.all(radios().map((r) => r.updateComplete));
  await document.fonts.ready;
  return group;
}

const radios = () => [...document.querySelectorAll<CcRadio>('cc-radio')];
const radio = (value: string) => document.querySelector<CcRadio>(`cc-radio[value="${value}"]`)!;
const icon = (el: CcRadio) => el.shadowRoot!.querySelector('.material-icon')!;
const checkedValues = () => radios().filter((r) => r.checked).map((r) => r.value);

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

describe('cc-radio-group', () => {
  it('checks the radio matching its value', async () => {
    await render(`<cc-radio-group value="phone">${options}</cc-radio-group>`);
    expect(checkedValues()).toEqual(['phone']);
  });

  it('is a named radiogroup of radios named by their text', async () => {
    await render(`<cc-radio-group aria-label="Contact method" value="phone">${options}</cc-radio-group>`);
    await expect.element(page.getByRole('radiogroup', { name: 'Contact method', exact: true })).toBeVisible();
    await expect.element(page.getByRole('radio', { name: 'Phone', exact: true })).toBeChecked();
    await expect.element(page.getByRole('radio', { name: 'Email', exact: true })).not.toBeChecked();
  });

  it('selects on click and fires change once, already updated', async () => {
    const group = await render(`<cc-radio-group>${options}</cc-radio-group>`);
    const seen: string[] = [];
    const onChange = vi.fn();
    group.addEventListener('input', () => seen.push(group.value));
    group.addEventListener('change', onChange);
    radio('post').click();
    radio('post').click();
    expect(group.value).toBe('post');
    expect(checkedValues()).toEqual(['post']);
    expect(seen).toEqual(['post']);
    expect(onChange).toHaveBeenCalledOnce();
  });

  it('selects when the label text is clicked', async () => {
    await render(`<cc-radio-group>${options}</cc-radio-group>`);
    const el = radio('phone');
    await userEvent.click(el, { position: { x: el.offsetWidth - 4, y: el.offsetHeight / 2 } });
    expect(checkedValues()).toEqual(['phone']);
  });

  it('checks the new radio when value is set', async () => {
    const group = await render(`<cc-radio-group value="email">${options}</cc-radio-group>`);
    group.value = 'post';
    await group.updateComplete;
    expect(checkedValues()).toEqual(['post']);
  });

  it('is one Tab stop, on the checked radio', async () => {
    document.body.innerHTML = `<button>Before</button><cc-radio-group value="phone">${options}</cc-radio-group><button>After</button>`;
    await document.querySelector<CcRadioGroup>('cc-radio-group')!.updateComplete;
    document.querySelector('button')!.focus();
    await userEvent.tab();
    expect(document.activeElement).toBe(radio('phone'));
    await userEvent.tab();
    expect(document.activeElement!.textContent).toBe('After');
  });

  it('starts Tab on the first enabled radio when none is checked', async () => {
    await render(`<cc-radio-group><cc-radio value="a" disabled>A</cc-radio><cc-radio value="b">B</cc-radio></cc-radio-group>`);
    expect(radios().map((r) => r.tabIndex)).toEqual([-1, 0]);
  });

  it('moves and selects with arrow keys, wrapping and skipping disabled radios', async () => {
    const group = await render(
      `<cc-radio-group value="email"><cc-radio value="email">Email</cc-radio><cc-radio value="phone" disabled>Phone</cc-radio><cc-radio value="post">Post</cc-radio></cc-radio-group>`,
    );
    radio('email').focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(group.value).toBe('post');
    expect(document.activeElement).toBe(radio('post'));
    await userEvent.keyboard('{ArrowRight}');
    expect(group.value).toBe('email');
    await userEvent.keyboard('{ArrowUp}');
    expect(group.value).toBe('post');
    expect(radios().map((r) => r.tabIndex)).toEqual([-1, -1, 0]);
  });

  it('selects the focused radio with Space', async () => {
    const group = await render(`<cc-radio-group>${options}</cc-radio-group>`);
    radio('email').focus();
    await userEvent.keyboard(' ');
    expect(group.value).toBe('email');
  });

  it('picks up radios added later', async () => {
    const group = await render(`<cc-radio-group value="fax">${options}</cc-radio-group>`);
    group.insertAdjacentHTML('beforeend', '<cc-radio value="fax">Fax</cc-radio>');
    await new Promise((r) => setTimeout(r));
    expect(checkedValues()).toEqual(['fax']);
  });

  describe('a disabled radio', () => {
    it('cannot be selected and blocks click listeners', async () => {
      const group = await render(`<cc-radio-group><cc-radio value="a" disabled>A</cc-radio></cc-radio-group>`);
      const onClick = vi.fn();
      radio('a').addEventListener('click', onClick);
      radio('a').click();
      expect(group.value).toBe('');
      expect(onClick).not.toHaveBeenCalled();
    });

    it('is announced as disabled', async () => {
      await render(`<cc-radio-group><cc-radio value="a" disabled>A</cc-radio></cc-radio-group>`);
      await expect.element(page.getByRole('radio', { name: 'A', exact: true, disabled: true })).toBeVisible();
    });

    it('cannot take focus or be selected with Space', async () => {
      const group = await render(`<cc-radio-group><cc-radio value="a" disabled>A</cc-radio><cc-radio value="b">B</cc-radio></cc-radio-group>`);
      await userEvent.click(radio('a'), { force: true });
      radio('a').focus();
      expect(document.activeElement).not.toBe(radio('a'));
      radio('a').dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
      expect(group.value).toBe('');
    });

    it('leaves arrow keys harmless when every other radio is disabled', async () => {
      const group = await render(`<cc-radio-group value="a"><cc-radio value="a">A</cc-radio><cc-radio value="b" disabled>B</cc-radio></cc-radio-group>`);
      radio('a').focus();
      await userEvent.keyboard('{ArrowDown}');
      expect(group.value).toBe('a');
      expect(document.activeElement).toBe(radio('a'));
    });
  });

  it('focuses its Tab stop on focus()', async () => {
    const group = await render(`<cc-radio-group value="phone">${options}</cc-radio-group>`);
    group.focus();
    expect(document.activeElement).toBe(radio('phone'));
  });

  it('leaves the radios of a nested group alone', async () => {
    await render(
      `<cc-radio-group value="a"><cc-radio value="a">A</cc-radio><cc-radio-group value="b"><cc-radio value="b">B</cc-radio></cc-radio-group></cc-radio-group>`,
    );
    expect(checkedValues()).toEqual(['a', 'b']);
  });

  describe('in a form', () => {
    const form = (group: string) => `<form>${group}</form>`;
    const data = () => new FormData(document.querySelector('form')!);

    it('submits the selected value', async () => {
      await render(form(`<cc-radio-group name="contact">${options}</cc-radio-group>`));
      expect(data().get('contact')).toBeNull();
      radio('phone').click();
      await document.querySelector<CcRadioGroup>('cc-radio-group')!.updateComplete;
      expect(data().get('contact')).toBe('phone');
    });

    it('submits nothing when no radio matches the value', async () => {
      await render(form(`<cc-radio-group name="contact" value="fax">${options}</cc-radio-group>`));
      expect(data().get('contact')).toBeNull();
    });

    it('resets to its initial value', async () => {
      const group = await render(form(`<cc-radio-group name="contact" value="email">${options}</cc-radio-group>`));
      radio('post').click();
      document.querySelector('form')!.reset();
      await group.updateComplete;
      expect(checkedValues()).toEqual(['email']);
      expect(data().get('contact')).toBe('email');
    });
  });
});

describe('cc-radio', () => {
  it('uses the Figma colours', async () => {
    await render(`<cc-radio-group value="email">${options}</cc-radio-group>`);
    expect(getComputedStyle(icon(radio('phone'))).color).toBe(tokenColor('--cc-border-medium-contrast'));
    expect(getComputedStyle(icon(radio('email'))).color).toBe(tokenColor('--cc-accent-light'));
    await userEvent.hover(radio('email'));
    expect(getComputedStyle(icon(radio('email'))).color).toBe(tokenColor('--cc-accent-main'));
    await userEvent.hover(radio('phone'));
    expect(getComputedStyle(icon(radio('phone'))).color).toBe(tokenColor('--cc-border-low-contrast'));
  });

  it('turns grey when disabled and selected, like Figma', async () => {
    await render(`<cc-radio-group value="a"><cc-radio value="a" disabled>A</cc-radio></cc-radio-group>`);
    expect(getComputedStyle(icon(radio('a'))).color).toBe(tokenColor('--cc-border-medium-contrast'));
    expect(getComputedStyle(radio('a')).opacity).toBe('0.4');
  });

  it('is a 40px box with a 24px icon, like Figma', async () => {
    const el = (await render(`<cc-radio-group>${options}</cc-radio-group>`)) && radio('email');
    const rect = el.shadowRoot!.querySelector('.box')!.getBoundingClientRect();
    expect([rect.width, rect.height]).toEqual([40, 40]);
    expect(icon(el).getBoundingClientRect().width).toBe(24);
  });

  it('keeps the icon ligature out of the name and is named by aria-label without text', async () => {
    await render(`<cc-radio-group><cc-radio value="a" aria-label="Option A"></cc-radio></cc-radio-group>`);
    await expect.element(page.getByRole('radio', { name: 'Option A', exact: true })).toBeVisible();
    expect(icon(radio('a')).getAttribute('aria-hidden')).toBe('true');
  });

  it('shows a focus ring on keyboard focus', async () => {
    document.body.innerHTML = `<button>Before</button><cc-radio-group>${options}</cc-radio-group>`;
    await document.querySelector<CcRadioGroup>('cc-radio-group')!.updateComplete;
    document.querySelector('button')!.focus();
    await userEvent.tab();
    const ring = getComputedStyle(icon(radio('email')), '::after');
    expect(ring.outlineStyle).toBe('solid');
    expect(ring.outlineColor).toBe(tokenColor('--cc-border-focus'));
  });
});
