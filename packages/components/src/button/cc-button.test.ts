/// <reference types="@vitest/browser-playwright" />
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cdp, page, userEvent } from 'vitest/browser';
import '@codechem/tokens/tokens.css';
import './cc-button.js';
import type { CcButton } from './cc-button.js';

async function render(markup: string) {
  document.body.innerHTML = markup;
  const buttons = [...document.querySelectorAll('cc-button')];
  await Promise.all(buttons.map((b) => b.updateComplete));
  return buttons;
}

const inner = (b: CcButton) => b.shadowRoot!.querySelector('button')!;

const tokenValue = (property: 'color' | 'backgroundColor' | 'borderRadius', token: string) => {
  const probe = document.createElement('div');
  probe.style[property] = `var(${token})`;
  document.body.append(probe);
  return getComputedStyle(probe)[property];
};

async function mouse(target: HTMLElement, type: 'mousePressed' | 'mouseReleased') {
  const frame = window.frameElement!.getBoundingClientRect();
  const rect = target.getBoundingClientRect();
  await cdp().send('Input.dispatchMouseEvent', {
    type,
    x: frame.left + rect.left + rect.width / 2,
    y: frame.top + rect.top + rect.height / 2,
    button: 'left',
    clickCount: 1,
  });
}

const icon = '<span class="material-icon" aria-hidden="true">close</span>';

afterEach(async () => {
  document.body.innerHTML = '';
  await userEvent.unhover(document.body);
});

describe('cc-button', () => {
  it('has Figma defaults', async () => {
    const [b] = await render('<cc-button>Save</cc-button>');
    expect(b.getAttribute('variant')).toBe('filled');
    expect(b.getAttribute('color')).toBe('primary');
    expect(b.getAttribute('size')).toBe('medium');
    expect(b.type).toBe('button');
  });

  it('does not reach click listeners when disabled', async () => {
    const [b] = await render('<cc-button disabled>Save</cc-button>');
    const onClick = vi.fn();
    b.addEventListener('click', onClick);
    b.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('reaches click listeners when enabled', async () => {
    const [b] = await render('<cc-button>Save</cc-button>');
    const onClick = vi.fn();
    b.addEventListener('click', onClick);
    inner(b).click();
    expect(onClick).toHaveBeenCalledOnce();
  });

  describe('in a form', () => {
    const form = (button: string) => `<form><input name="name" value="John Doe" required />${button}</form>`;
    const onSubmit = () => {
      const spy = vi.fn((e: Event) => e.preventDefault());
      document.querySelector('form')!.addEventListener('submit', spy);
      return spy;
    };

    it('submits with type="submit"', async () => {
      const [b] = await render(form('<cc-button type="submit">Send</cc-button>'));
      const submit = onSubmit();
      inner(b).click();
      expect(submit).toHaveBeenCalledOnce();
    });

    it('does not submit by default', async () => {
      const [b] = await render(form('<cc-button>Send</cc-button>'));
      const submit = onSubmit();
      inner(b).click();
      expect(submit).not.toHaveBeenCalled();
    });

    it('does not submit when disabled', async () => {
      const [b] = await render(form('<cc-button type="submit" disabled>Send</cc-button>'));
      const submit = onSubmit();
      inner(b).click();
      expect(submit).not.toHaveBeenCalled();
    });

    it('does not submit when a required field is empty', async () => {
      const [b] = await render(form('<cc-button type="submit">Send</cc-button>'));
      const submit = onSubmit();
      document.querySelector('input')!.value = '';
      inner(b).click();
      expect(submit).not.toHaveBeenCalled();
    });

    it('resets with type="reset"', async () => {
      const [b] = await render(form('<cc-button type="reset">Reset</cc-button>'));
      const input = document.querySelector('input')!;
      input.value = 'changed';
      inner(b).click();
      expect(input.value).toBe('John Doe');
    });
  });

  it.each([
    ['small', 28],
    ['medium', 40],
    ['large', 48],
  ])('size=%s is %ipx tall, like Figma', async (size, height) => {
    const [b] = await render(`<cc-button size="${size}">Button</cc-button>`);
    expect(inner(b).getBoundingClientRect().height).toBe(height);
  });
  describe('icon-only', () => {
    it.each([
      ['small', 28, 20],
      ['medium', 40, 24],
      ['large', 48, 24],
    ])('size=%s is a %ipx square with a %ipx icon, like Figma', async (size, box, glyph) => {
      const [b] = await render(`<cc-button icon-only aria-label="Close" size="${size}">${icon}</cc-button>`);
      const rect = inner(b).getBoundingClientRect();
      expect([rect.width, rect.height]).toEqual([box, box]);
      const iconRect = b.querySelector('span')!.getBoundingClientRect();
      expect([iconRect.width, iconRect.height]).toEqual([glyph, glyph]);
    });

    it('is named by aria-label', async () => {
      await render(`<cc-button icon-only aria-label="Close">${icon}</cc-button>`);
      await expect.element(page.getByRole('button', { name: 'Close', exact: true })).toBeVisible();
    });

    it('is round only with shape="round"', async () => {
      const [square, round, loose] = await render(`
        <cc-button icon-only aria-label="A">${icon}</cc-button>
        <cc-button icon-only shape="round" aria-label="B">${icon}</cc-button>
        <cc-button shape="round">Label</cc-button>`);
      expect(getComputedStyle(inner(square)).borderTopLeftRadius).toBe(tokenValue('borderRadius', '--cc-radius'));
      expect(getComputedStyle(inner(round)).borderTopLeftRadius).toBe(tokenValue('borderRadius', '--cc-round'));
      expect(getComputedStyle(inner(loose)).borderTopLeftRadius).toBe(tokenValue('borderRadius', '--cc-radius'));
    });

    it('keeps the labelled button wider than tall', async () => {
      const [b] = await render('<cc-button>Save</cc-button>');
      const rect = inner(b).getBoundingClientRect();
      expect(rect.width).toBeGreaterThan(rect.height);
    });

    it('tints the text variant on hover', async () => {
      const [b] = await render(`<cc-button icon-only variant="text" aria-label="Close">${icon}</cc-button>`);
      expect(getComputedStyle(inner(b)).backgroundColor).toBe('rgba(0, 0, 0, 0)');
      await userEvent.hover(inner(b));
      expect(getComputedStyle(inner(b)).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    });

    it('does not reach click listeners when disabled', async () => {
      const [b] = await render(`<cc-button icon-only disabled aria-label="Close">${icon}</cc-button>`);
      const onClick = vi.fn();
      b.addEventListener('click', onClick);
      b.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('accent variant', () => {
    it.each([
      ['primary', '--cc-accent-light'],
      ['secondary', '--cc-text-high-emphasis'],
      ['destructive', '--cc-alert-error-light'],
    ] as const)('color=%s uses surface-2 and the Figma icon colour', async (color, token) => {
      const [b] = await render(`<cc-button icon-only variant="accent" color="${color}" aria-label="Add">${icon}</cc-button>`);
      expect(getComputedStyle(inner(b)).backgroundColor).toBe(tokenValue('backgroundColor', '--cc-surface-surface-2'));
      expect(getComputedStyle(inner(b)).color).toBe(tokenValue('color', token));
    });

    it('goes to surface-1 on hover and surface-shade while pressed', async () => {
      const [b] = await render(`<cc-button icon-only variant="accent" aria-label="Add">${icon}</cc-button>`);
      await userEvent.hover(inner(b));
      expect(getComputedStyle(inner(b)).backgroundColor).toBe(tokenValue('backgroundColor', '--cc-surface-surface-1'));
      await mouse(inner(b), 'mousePressed');
      expect(getComputedStyle(inner(b)).backgroundColor).toBe(tokenValue('backgroundColor', '--cc-surface-surface-shade'));
      expect(getComputedStyle(inner(b)).opacity).toBe('0.7');
      await mouse(inner(b), 'mouseReleased');
    });

    it('stays at surface-2 when disabled', async () => {
      const [b] = await render(`<cc-button icon-only variant="accent" disabled aria-label="Add">${icon}</cc-button>`);
      expect(getComputedStyle(inner(b)).backgroundColor).toBe(tokenValue('backgroundColor', '--cc-surface-surface-2'));
    });
  });
});
