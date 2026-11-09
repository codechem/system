import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import '@codechem/tokens/tokens.css';
import './cc-checkbox.js';
import type { CcCheckbox } from './cc-checkbox.js';

async function render(markup: string) {
  document.body.innerHTML = markup;
  const el = document.querySelector('cc-checkbox') as CcCheckbox;
  await el.updateComplete;
  return el;
}

const input = (el: CcCheckbox) => el.shadowRoot!.querySelector('input')!;
const icon = (el: CcCheckbox) => el.shadowRoot!.querySelector('.material-icon')!;

const clickLabelText = (el: CcCheckbox, options = {}) =>
  userEvent.click(el, { position: { x: el.offsetWidth - 4, y: el.offsetHeight / 2 }, ...options });

const tokenColor = (token: string) => {
  const probe = document.createElement('div');
  probe.style.color = `var(${token})`;
  document.body.append(probe);
  return getComputedStyle(probe).color;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('cc-checkbox', () => {
  it('defaults to an unchecked medium checkbox', async () => {
    const el = await render('<cc-checkbox>Remember me</cc-checkbox>');
    expect(el.checked).toBe(false);
    expect(el.getAttribute('size')).toBe('medium');
    expect(input(el).checked).toBe(false);
  });

  it('toggles on click and fires change', async () => {
    const el = await render('<cc-checkbox>Remember me</cc-checkbox>');
    const onChange = vi.fn();
    el.addEventListener('change', onChange);
    el.click();
    await el.updateComplete;
    expect(el.checked).toBe(true);
    expect(onChange).toHaveBeenCalledOnce();
  });

  it('toggles when the label text is clicked', async () => {
    const el = await render('<cc-checkbox>Remember me</cc-checkbox>');
    await clickLabelText(el);
    expect(el.checked).toBe(true);
  });

  it('is already updated when input fires', async () => {
    const el = await render('<cc-checkbox>Remember me</cc-checkbox>');
    const seen: boolean[] = [];
    el.addEventListener('input', () => seen.push(el.checked));
    el.click();
    expect(seen).toEqual([true]);
  });

  it('keeps the inner input in sync when a listener reverts the change', async () => {
    const el = await render('<cc-checkbox checked>Remember me</cc-checkbox>');
    el.addEventListener('change', () => (el.checked = true));
    el.click();
    await el.updateComplete;
    expect(el.checked).toBe(true);
    expect(input(el).checked).toBe(true);
  });

  it('toggles with the keyboard', async () => {
    const el = await render('<cc-checkbox>Remember me</cc-checkbox>');
    el.focus();
    await userEvent.keyboard(' ');
    expect(el.checked).toBe(true);
  });

  it('does not toggle when disabled', async () => {
    const el = await render('<cc-checkbox disabled>Remember me</cc-checkbox>');
    el.click();
    await clickLabelText(el, { force: true });
    await el.updateComplete;
    expect(el.checked).toBe(false);
  });

  it('is a checkbox named by its slotted text', async () => {
    await render('<cc-checkbox>Remember me</cc-checkbox>');
    await expect.element(page.getByRole('checkbox', { name: 'Remember me', exact: true })).toBeVisible();
  });

  it('is named by aria-label when it has no text', async () => {
    await render('<cc-checkbox aria-label="Select row"></cc-checkbox>');
    await expect.element(page.getByRole('checkbox', { name: 'Select row', exact: true })).toBeVisible();
  });

  it('uses the Figma colours', async () => {
    const el = await render('<cc-checkbox>Remember me</cc-checkbox>');
    expect(getComputedStyle(icon(el)).color).toBe(tokenColor('--cc-border-medium-contrast'));
    el.checked = true;
    await el.updateComplete;
    expect(getComputedStyle(icon(el)).color).toBe(tokenColor('--cc-accent-light'));
  });

  it.each([
    ['medium', 32, 20],
    ['large', 40, 24],
  ])('size=%s is a %ipx box with a %ipx icon, like Figma', async (size, box, iconSize) => {
    const el = await render(`<cc-checkbox size="${size}"></cc-checkbox>`);
    const rect = el.shadowRoot!.querySelector('.box')!.getBoundingClientRect();
    expect([rect.width, rect.height]).toEqual([box, box]);
    expect(icon(el).getBoundingClientRect().width).toBe(iconSize);
  });

  describe('in a form', () => {
    const form = (checkbox: string) => `<form>${checkbox}</form>`;
    const data = () => new FormData(document.querySelector('form')!);

    it('submits its value only when checked', async () => {
      const el = await render(form('<cc-checkbox name="terms" value="yes">I agree</cc-checkbox>'));
      expect(data().get('terms')).toBeNull();
      el.click();
      await el.updateComplete;
      expect(data().get('terms')).toBe('yes');
    });

    it('is left out of the form data when disabled', async () => {
      await render(form('<cc-checkbox name="terms" checked disabled>I agree</cc-checkbox>'));
      expect(data().get('terms')).toBeNull();
    });

    it('resets to its initial state', async () => {
      const el = await render(form('<cc-checkbox name="terms" checked>I agree</cc-checkbox>'));
      el.click();
      await el.updateComplete;
      expect(el.checked).toBe(false);
      document.querySelector('form')!.reset();
      await el.updateComplete;
      expect(el.checked).toBe(true);
      expect(data().get('terms')).toBe('on');
    });
  });
});
