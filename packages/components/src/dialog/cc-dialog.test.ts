import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import '@codechem/tokens/tokens.css';
import '../button/cc-button.js';
import './cc-dialog.js';
import type { CcDialog } from './cc-dialog.js';

async function render(markup: string) {
  document.body.innerHTML = markup;
  const el = document.querySelector('cc-dialog') as CcDialog;
  await settle(el);
  await document.fonts.ready;
  return el;
}

async function settle(el: CcDialog) {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await el.updateComplete;
}

const dialogEl = (el: CcDialog) => el.shadowRoot!.querySelector('dialog')!;
const title = (el: CcDialog) => el.shadowRoot!.querySelector('.title');
const description = (el: CcDialog) => el.shadowRoot!.querySelector('.description');
const header = (el: CcDialog) => el.shadowRoot!.querySelector('.header');
const body = (el: CcDialog) => el.shadowRoot!.querySelector('.body') as HTMLElement;
const actions = (el: CcDialog) => el.shadowRoot!.querySelector('.actions') as HTMLElement;
const content = (el: CcDialog) => el.shadowRoot!.querySelector('.content') as HTMLElement;

const tokenColor = (token: string) => {
  const probe = document.createElement('div');
  probe.style.color = `var(${token})`;
  document.body.append(probe);
  return getComputedStyle(probe).color;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('cc-dialog', () => {
  it('stays closed by default', async () => {
    const el = await render('<cc-dialog heading="Title">Body</cc-dialog>');
    expect(el.open).toBe(false);
    expect(dialogEl(el).open).toBe(false);
  });

  it('opens as a modal when open is set', async () => {
    const el = await render('<cc-dialog heading="Title" open>Body</cc-dialog>');
    expect(dialogEl(el).matches(':modal')).toBe(true);
  });

  it('is not rendered with the hidden attribute', async () => {
    const el = await render('<cc-dialog heading="Title" open hidden>Body</cc-dialog>');
    expect(getComputedStyle(el).display).toBe('none');
  });

  it('closes when open is removed and fires close', async () => {
    const el = await render('<cc-dialog heading="Title" open>Body</cc-dialog>');
    const closed = new Promise((resolve) => el.addEventListener('close', resolve, { once: true }));
    el.open = false;
    await el.updateComplete;
    await closed;
    expect(dialogEl(el).open).toBe(false);
  });

  it('closes with Escape, syncs open and fires close', async () => {
    const el = await render('<cc-dialog heading="Title" open><button>Inside</button></cc-dialog>');
    const closed = new Promise((resolve) => el.addEventListener('close', resolve, { once: true }));
    await userEvent.keyboard('{Escape}');
    await closed;
    expect(el.open).toBe(false);
    expect(el.hasAttribute('open')).toBe(false);
  });

  it('is named by its heading', async () => {
    await render('<cc-dialog heading="Dialog title" open>Body</cc-dialog>');
    await expect.element(page.getByRole('dialog', { name: 'Dialog title', exact: true })).toBeVisible();
  });

  it('forwards aria-label when there is no heading', async () => {
    await render('<cc-dialog aria-label="Billing details" open>Body</cc-dialog>');
    await expect.element(page.getByRole('dialog', { name: 'Billing details', exact: true })).toBeVisible();
  });

  it('omits the header when there is no heading or description', async () => {
    const el = await render('<cc-dialog open>Body</cc-dialog>');
    expect(header(el)).toBeNull();
    expect(title(el)).toBeNull();
    expect(description(el)).toBeNull();
  });

  it('shows the heading and description in the header', async () => {
    const el = await render('<cc-dialog heading="Title" description="Supporting text" open>Body</cc-dialog>');
    expect(title(el)!.textContent).toBe('Title');
    expect(description(el)!.textContent).toBe('Supporting text');
  });

  it('hides the body and actions when they are empty', async () => {
    const el = await render('<cc-dialog heading="Title" open></cc-dialog>');
    expect(getComputedStyle(body(el)).display).toBe('none');
    expect(getComputedStyle(actions(el)).display).toBe('none');
  });

  it('shows slotted body content and actions', async () => {
    const el = await render(
      '<cc-dialog heading="Title" open><p>Body text</p><button slot="actions">Done</button></cc-dialog>',
    );
    await expect.element(page.getByText('Body text', { exact: true })).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Done', exact: true })).toBeVisible();
    expect(getComputedStyle(actions(el)).display).toBe('flex');
  });

  it('aligns actions to the right edge of the content', async () => {
    const el = await render(
      '<cc-dialog heading="Title" open><button slot="actions">First</button><button slot="actions">Done</button></cc-dialog>',
    );
    const done = el.querySelector<HTMLButtonElement>('button[slot="actions"]:last-of-type')!;
    expect(done.getBoundingClientRect().right).toBeCloseTo(content(el).getBoundingClientRect().right, 0);
  });

  it('uses the Figma colours', async () => {
    const el = await render('<cc-dialog heading="Title" description="Supporting text" open>Body</cc-dialog>');
    expect(getComputedStyle(dialogEl(el)).backgroundColor).toBe(tokenColor('--cc-surface-surface-1'));
    expect(getComputedStyle(title(el)!).color).toBe(tokenColor('--cc-text-high-emphasis'));
    expect(getComputedStyle(description(el)!).color).toBe(tokenColor('--cc-text-medium-emphasis'));
    expect(getComputedStyle(dialogEl(el), '::backdrop').backgroundColor).toBe(tokenColor('--cc-scrim-scrim-50'));
  });

  it('moves focus to the first focusable control on open', async () => {
    const el = await render('<cc-dialog heading="Title" open><button>First</button><button>Second</button></cc-dialog>');
    expect(document.activeElement).toBe(el.querySelector('button'));
  });

  it('keeps Tab focus inside the dialog', async () => {
    const el = await render(
      '<button id="outside">Outside</button><cc-dialog heading="Title" open><button>First</button><button>Second</button></cc-dialog>',
    );
    for (let i = 0; i < 4; i++) {
      await userEvent.tab();
      expect(el.contains(document.activeElement)).toBe(true);
    }
  });

  it('wraps Tab between custom-element controls', async () => {
    const el = await render(
      '<cc-dialog heading="Title" open><cc-button slot="actions">First</cc-button><cc-button slot="actions">Second</cc-button></cc-dialog>',
    );
    const [first, second] = el.querySelectorAll('cc-button');
    expect(document.activeElement).toBe(first);
    await userEvent.tab();
    expect(document.activeElement).toBe(second);
    await userEvent.tab();
    expect(document.activeElement).toBe(first);
  });

  it('wraps Shift+Tab between custom-element controls', async () => {
    const el = await render(
      '<cc-dialog heading="Title" open><cc-button slot="actions">First</cc-button><cc-button slot="actions">Second</cc-button></cc-dialog>',
    );
    const [first, second] = el.querySelectorAll('cc-button');
    expect(document.activeElement).toBe(first);
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
    expect(document.activeElement).toBe(second);
  });

  it('skips a disabled last control when wrapping', async () => {
    const el = await render(
      '<cc-dialog heading="Title" open><button>First</button><cc-button slot="actions" disabled>Save</cc-button></cc-dialog>',
    );
    const first = el.querySelector('button')!;
    expect(document.activeElement).toBe(first);
    await userEvent.tab();
    expect(document.activeElement).toBe(first);
  });

  it('skips a hidden last control when wrapping', async () => {
    const el = await render(
      '<cc-dialog heading="Title" open><button>First</button><button hidden>Hidden</button></cc-dialog>',
    );
    const first = el.querySelector('button')!;
    expect(document.activeElement).toBe(first);
    await userEvent.tab();
    expect(document.activeElement).toBe(first);
  });

  it('wraps Shift+Tab from the first control to the last', async () => {
    const el = await render('<cc-dialog heading="Title" open><button>First</button><button>Second</button></cc-dialog>');
    expect(document.activeElement).toBe(el.querySelector('button'));
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
    expect(document.activeElement).toBe(el.querySelectorAll('button')[1]);
  });

  describe('sizes', () => {
    beforeEach(async () => {
      await page.viewport(1280, 800);
    });

    it.each([
      ['dialog width', 448, (el: CcDialog) => dialogEl(el).getBoundingClientRect().width],
      ['dialog padding', 24, (el: CcDialog) => parseFloat(getComputedStyle(dialogEl(el)).paddingTop)],
      ['title font size', 24, (el: CcDialog) => parseFloat(getComputedStyle(title(el)!).fontSize)],
      ['title line height', 32, (el: CcDialog) => parseFloat(getComputedStyle(title(el)!).lineHeight)],
      ['description font size', 16, (el: CcDialog) => parseFloat(getComputedStyle(description(el)!).fontSize)],
      ['description line height', 28, (el: CcDialog) => parseFloat(getComputedStyle(description(el)!).lineHeight)],
    ])('%s should be %d px', async (_name, expected, read) => {
      const el = await render('<cc-dialog heading="Title" description="Supporting text" open>Body</cc-dialog>');
      expect(read(el)).toBeCloseTo(expected, 0);
    });
  });
});
