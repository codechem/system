import { afterEach, describe, expect, it } from 'vitest';
import '@codechem/tokens/tokens.css';
import './cc-alert.js';
import type { CcAlert } from './cc-alert.js';

async function render(markup: string) {
  document.body.innerHTML = markup;
  const el = document.querySelector('cc-alert') as CcAlert;
  await el.updateComplete;
  return el;
}

const $ = (el: CcAlert, sel: string) => el.shadowRoot!.querySelector<HTMLElement>(sel);

afterEach(() => {
  document.body.innerHTML = '';
});

describe('cc-alert', () => {
  it('defaults to subtle info, not dismissible', async () => {
    const el = await render('<cc-alert>Saved</cc-alert>');
    expect(el.getAttribute('status')).toBe('info');
    expect(el.getAttribute('variant')).toBe('subtle');
    expect($(el, '.close')).toBeNull();
  });

  it.each([
    ['error', 'alert'],
    ['warning', 'alert'],
    ['info', 'status'],
    ['success', 'status'],
  ])('status=%s uses role=%s', async (status, role) => {
    const el = await render(`<cc-alert status="${status}">Text</cc-alert>`);
    expect($(el, '.base')!.getAttribute('role')).toBe(role);
  });

  it('close button hides the alert and fires cc-close', async () => {
    const el = await render('<cc-alert dismissible>Text</cc-alert>');
    let fired = false;
    el.addEventListener('cc-close', () => (fired = true));
    $(el, '.close')!.click();
    expect(fired).toBe(true);
    expect(el.hidden).toBe(true);
    expect(getComputedStyle(el).display).toBe('none');
  });

  it('preventDefault on cc-close keeps the alert visible', async () => {
    const el = await render('<cc-alert dismissible>Text</cc-alert>');
    el.addEventListener('cc-close', (e) => e.preventDefault());
    $(el, '.close')!.click();
    expect(el.hidden).toBe(false);
  });

  it('close button has an accessible name', async () => {
    const el = await render('<cc-alert dismissible close-label="Dismiss alert">Text</cc-alert>');
    expect($(el, '.close')!.getAttribute('aria-label')).toBe('Dismiss alert');
  });

  it('hides the description row when empty', async () => {
    const el = await render('<cc-alert><span slot="title">Only title</span></cc-alert>');
    expect($(el, '.description')!.hidden).toBe(true);
  });

  it('is 92px tall with title, action, close and description, like Figma', async () => {
    const el = await render(`<cc-alert status="error" dismissible style="width: 400px">
      <span slot="title">Title</span><button slot="action">ACTION</button>Alert description goes here.
    </cc-alert>`);
    await document.fonts.ready;
    expect(el.getBoundingClientRect().height).toBe(92);
  });
});
