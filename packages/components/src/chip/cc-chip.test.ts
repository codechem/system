import { afterEach, describe, expect, it, vi } from 'vitest';
import { cdp, page, userEvent } from 'vitest/browser';
import '@codechem/tokens/tokens.css';
import './cc-chip.js';
import type { CcChip } from './cc-chip.js';

async function render(markup: string) {
  document.body.innerHTML = markup;
  const el = document.querySelector('cc-chip') as CcChip;
  await el.updateComplete;
  await document.fonts.ready;
  return el;
}

const chip = (el: CcChip) => el.shadowRoot!.querySelector<HTMLElement>('.chip')!;
const body = (el: CcChip) => el.shadowRoot!.querySelector<HTMLButtonElement>('.body')!;
const close = (el: CcChip) => el.shadowRoot!.querySelector<HTMLButtonElement>('.close');

const labelWidth = (el: CcChip) => {
  const text = Array.from(el.childNodes).find((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim())!;
  const range = document.createRange();
  range.selectNodeContents(text);
  return range.getBoundingClientRect().width;
};
const chrome = (el: CcChip) => chip(el).getBoundingClientRect().width - labelWidth(el);

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

const tokenColor = (token: string) => {
  const probe = document.createElement('div');
  probe.style.color = `var(${token})`;
  document.body.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
};

const home = '<span slot="leading" class="material-icons-round" aria-hidden="true">home</span>';
const more = '<span slot="trailing" class="material-icons-round" aria-hidden="true">expand_more</span>';
const bareHome = '<span slot="leading" class="material-icons-round">home</span>';
const bareMore = '<span slot="trailing" class="material-icons-round">expand_more</span>';
const namedAvatar = '<img slot="avatar" alt="Portrait" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" />';
const avatar = '<img slot="avatar" alt="" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" />';

afterEach(async () => {
  document.body.innerHTML = '';
  await userEvent.unhover(document.body);
});

describe('cc-chip', () => {
  it('defaults to an unselected outlined filter chip', async () => {
    const el = await render('<cc-chip>Label</cc-chip>');
    expect(el.getAttribute('type')).toBe('filter');
    expect(el.getAttribute('variant')).toBe('outlined');
    expect(el.selected).toBe(false);
    expect(close(el)).toBeNull();
  });

  describe('accessibility', () => {
    it('is a toggle button named by its text only', async () => {
      await render(`<cc-chip>${home}Label${more}</cc-chip>`);
      await expect.element(page.getByRole('button', { name: 'Label', exact: true, pressed: false })).toBeVisible();
    });

    it('does not leak icon or check names into the name', async () => {
      await render(`<cc-chip selected>${home}Label</cc-chip>`);
      await expect.element(page.getByRole('button', { name: 'Label', exact: true, pressed: true })).toBeVisible();
    });

    it('is named by aria-label when it has no text', async () => {
      await render('<cc-chip aria-label="Favorites"></cc-chip>');
      await expect.element(page.getByRole('button', { name: 'Favorites', exact: true })).toBeVisible();
    });

    it('keeps slotted icons and avatars out of the names', async () => {
      await render(`<cc-chip type="input" removable>${namedAvatar}${bareHome}Label</cc-chip>`);
      await expect.element(page.getByRole('button', { name: 'Label', exact: true })).toBeVisible();
      await expect.element(page.getByRole('button', { name: 'Remove Label', exact: true })).toBeVisible();
      document.body.innerHTML = `<cc-chip>${bareHome}Label${bareMore}</cc-chip>`;
      await expect.element(page.getByRole('button', { name: 'Label', exact: true })).toBeVisible();
    });

    it('names the close button after the label', async () => {
      await render(`<cc-chip type="input" removable>${avatar}John Doe</cc-chip>`);
      await expect.element(page.getByRole('button', { name: 'Remove John Doe', exact: true })).toBeVisible();
      await expect.element(page.getByRole('button', { name: 'John Doe', exact: true })).toBeVisible();
    });
  });

  describe('toggling', () => {
    it('toggles selected and fires change on click', async () => {
      const el = await render('<cc-chip>Label</cc-chip>');
      const onChange = vi.fn();
      el.addEventListener('change', onChange);
      await page.getByRole('button', { name: 'Label' }).click();
      expect(el.selected).toBe(true);
      expect(el.hasAttribute('selected')).toBe(true);
      expect(onChange).toHaveBeenCalledTimes(1);
      await page.getByRole('button', { name: 'Label' }).click();
      expect(el.selected).toBe(false);
      expect(onChange).toHaveBeenCalledTimes(2);
    });

    it('toggles with Space and Enter', async () => {
      const el = await render('<cc-chip>Label</cc-chip>');
      el.focus();
      await userEvent.keyboard(' ');
      expect(el.selected).toBe(true);
      await userEvent.keyboard('{Enter}');
      expect(el.selected).toBe(false);
    });

    it('forwards focus() and click() to the inner button', async () => {
      const el = await render('<cc-chip>Label</cc-chip>');
      el.focus();
      expect(el.shadowRoot!.activeElement).toBe(body(el));
      el.click();
      expect(el.selected).toBe(true);
    });

    it('does nothing when disabled, and blocks click listeners', async () => {
      const el = await render('<cc-chip disabled>Label</cc-chip>');
      const onClick = vi.fn();
      el.addEventListener('click', onClick);
      el.click();
      const event = new MouseEvent('click', { bubbles: true, composed: true, cancelable: true });
      chip(el).dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
      expect(el.selected).toBe(false);
      expect(onClick).not.toHaveBeenCalled();
      expect(body(el).disabled).toBe(true);
    });
  });

  describe('filter chip', () => {
    it('shows a check in place of the leading icon when selected', async () => {
      const el = await render(`<cc-chip>${home}Label</cc-chip>`);
      const slot = el.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="leading"]')!;
      expect(el.shadowRoot!.querySelector('.material-icon')).toBeNull();
      expect(getComputedStyle(slot.parentElement!).display).toBe('contents');
      el.selected = true;
      await el.updateComplete;
      expect(el.shadowRoot!.querySelector('.material-icon')?.textContent).toBe('check');
      expect(getComputedStyle(slot.parentElement!).display).toBe('none');
    });

    it('shows the check on a label-only chip too', async () => {
      const el = await render('<cc-chip selected>Label</cc-chip>');
      expect(el.shadowRoot!.querySelector('.material-icon')?.textContent).toBe('check');
    });

    it('ignores removable', async () => {
      const el = await render('<cc-chip removable>Label</cc-chip>');
      expect(close(el)).toBeNull();
    });

    it.each([
      ['label only', 32, 'Label', ''],
      ['leading icon', 52, `${home}Label`, ''],
      ['trailing icon', 52, `Label${more}`, ''],
      ['both icons', 72, `${home}Label${more}`, ''],
      ['selected', 52, 'Label', ' selected'],
    ])('%s: %ipx around the label and 36px high, like Figma', async (_name, around, content, attrs) => {
      const el = await render(`<cc-chip${attrs}>${content}</cc-chip>`);
      expect(chrome(el)).toBeCloseTo(around, 1);
      expect(chip(el).getBoundingClientRect().height).toBe(36);
    });
  });

  describe('input chip', () => {
    it.each([
      ['label only', 24, 'Label', ''],
      ['with close', 48, 'Label', ' removable'],
      ['icon and close', 72, `${home}Label`, ' removable'],
      ['avatar and close', 68, `${avatar}Label`, ' removable'],
    ])('%s: %ipx around the label and 28px high, like Figma', async (_name, around, content, attrs) => {
      const el = await render(`<cc-chip type="input"${attrs}>${content}</cc-chip>`);
      expect(chrome(el)).toBeCloseTo(around, 1);
      expect(chip(el).getBoundingClientRect().height).toBe(28);
    });

    it('is pill-shaped with an avatar and square otherwise', async () => {
      const el = await render(`<cc-chip type="input">${avatar}Label</cc-chip>`);
      expect(getComputedStyle(chip(el)).borderTopLeftRadius).toBe('999px');
      document.body.innerHTML = '<cc-chip type="input">Label</cc-chip>';
      const plain = document.querySelector('cc-chip') as CcChip;
      await plain.updateComplete;
      expect(getComputedStyle(chip(plain)).borderTopLeftRadius).toBe('4px');
    });

    it('fires remove and not change when the close button is clicked', async () => {
      const el = await render('<cc-chip type="input" removable>Label</cc-chip>');
      const onRemove = vi.fn();
      const onChange = vi.fn();
      el.addEventListener('remove', onRemove);
      el.addEventListener('change', onChange);
      await page.getByRole('button', { name: 'Remove Label' }).click();
      expect(onRemove).toHaveBeenCalledTimes(1);
      expect(onChange).not.toHaveBeenCalled();
      expect(el.selected).toBe(false);
    });

    it('removes itself from the DOM, unless the remove event is cancelled', async () => {
      const el = await render('<cc-chip type="input" removable>Label</cc-chip>');
      el.addEventListener('remove', (e) => e.preventDefault(), { once: true });
      await page.getByRole('button', { name: 'Remove Label' }).click();
      expect(el.isConnected).toBe(true);
      await page.getByRole('button', { name: 'Remove Label' }).click();
      expect(el.isConnected).toBe(false);
    });

    it.each(['Delete', 'Backspace'])('fires remove on %s', async (key) => {
      const el = await render('<cc-chip type="input" removable>Label</cc-chip>');
      const onRemove = vi.fn();
      el.addEventListener('remove', onRemove);
      el.focus();
      await userEvent.keyboard(`{${key}}`);
      expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it('does not remove with Delete when it is not removable', async () => {
      const el = await render('<cc-chip type="input">Label</cc-chip>');
      const onRemove = vi.fn();
      el.addEventListener('remove', onRemove);
      el.focus();
      await userEvent.keyboard('{Delete}');
      expect(onRemove).not.toHaveBeenCalled();
    });

    it.each([
      ['Control+Backspace', '{Control>}{Backspace}{/Control}'],
      ['Shift+Delete', '{Shift>}{Delete}{/Shift}'],
    ])('does not remove on %s', async (_name, keys) => {
      const el = await render('<cc-chip type="input" removable>Label</cc-chip>');
      const onRemove = vi.fn();
      el.addEventListener('remove', onRemove);
      el.focus();
      await userEvent.keyboard(keys);
      expect(onRemove).not.toHaveBeenCalled();
    });

    it('bubbles change and remove', async () => {
      const el = await render('<cc-chip type="input" removable>Label</cc-chip>');
      const seen: string[] = [];
      document.body.addEventListener('change', () => seen.push('change'));
      document.body.addEventListener('remove', () => seen.push('remove'));
      el.click();
      await page.getByRole('button', { name: 'Remove Label' }).click();
      expect(seen).toEqual(['change', 'remove']);
    });

    it('only renders the avatar slot on input chips and the trailing slot on filter chips', async () => {
      const input = await render(`<cc-chip type="input">${bareMore}Label</cc-chip>`);
      expect(input.shadowRoot!.querySelector('slot[name="trailing"]')).toBeNull();
      expect(input.shadowRoot!.querySelector('slot[name="avatar"]')).not.toBeNull();
      const filter = await render(`<cc-chip>${avatar}Label</cc-chip>`);
      expect(filter.shadowRoot!.querySelector('slot[name="avatar"]')).toBeNull();
      expect(filter.shadowRoot!.querySelector('slot[name="trailing"]')).not.toBeNull();
    });

    it('names the close button after the text only, even for icons without aria-hidden', async () => {
      const el = await render(`<cc-chip type="input" removable>${bareHome}Label</cc-chip>`);
      expect(close(el)!.getAttribute('aria-label')).toBe('Remove Label');
    });

    it('follows text edited in place', async () => {
      const el = await render('<cc-chip type="input" removable>Label</cc-chip>');
      (el.firstChild as Text).data = 'Other';
      await vi.waitFor(() => expect(close(el)!.getAttribute('aria-label')).toBe('Remove Other'));
    });

    it('disables the close button too', async () => {
      const el = await render('<cc-chip type="input" removable disabled>Label</cc-chip>');
      expect(close(el)!.disabled).toBe(true);
    });

    it('updates the close button name when the label changes', async () => {
      const el = await render('<cc-chip type="input" removable>Label</cc-chip>');
      el.append(' Two');
      el.insertAdjacentHTML('beforeend', '<span slot="leading"></span>');
      await vi.waitFor(() => expect(close(el)!.getAttribute('aria-label')).toBe('Remove Label Two'));
    });
  });

  describe('styling', () => {
    const style = (el: CcChip) => getComputedStyle(chip(el));

    it('uses the Figma colours for the outlined chip', async () => {
      const el = await render('<cc-chip>Label</cc-chip>');
      expect(style(el).color).toBe(tokenColor('--cc-text-medium-emphasis'));
      expect(style(el).backgroundColor).toBe('rgba(0, 0, 0, 0)');
      expect(style(el).boxShadow).toContain(tokenColor('--cc-border-medium-contrast'));
    });

    it('uses the Figma colours for the filled chip', async () => {
      const el = await render('<cc-chip variant="filled">Label</cc-chip>');
      expect(style(el).backgroundColor).toBe(tokenColor('--cc-surface-surface-2'));
      expect(style(el).boxShadow).toBe('none');
    });

    it('uses the Figma colours for a selected filled chip', async () => {
      const el = await render('<cc-chip variant="filled" selected>Label</cc-chip>');
      expect(style(el).backgroundColor).toBe(tokenColor('--cc-accent-dark'));
      expect(style(el).color).toBe(tokenColor('--cc-accent-contrast'));
      expect(style(el).boxShadow).toContain(tokenColor('--cc-accent-light'));
    });

    it('lets a selected input chip override its filled fill', async () => {
      const el = await render('<cc-chip type="input" variant="filled" selected>Label</cc-chip>');
      expect(style(el).backgroundColor).toBe(tokenColor('--cc-accent-dark'));
    });

    it('lightens a filled chip on hover and a selected one to accent main', async () => {
      const el = await render('<cc-chip variant="filled">Label</cc-chip>');
      await userEvent.hover(body(el));
      expect(style(el).backgroundColor).toBe(tokenColor('--cc-surface-surface-highlight'));
      el.selected = true;
      await el.updateComplete;
      expect(style(el).backgroundColor).toBe(tokenColor('--cc-accent-main'));
    });

    it('is hidden with the hidden attribute', async () => {
      const el = await render('<cc-chip hidden>Label</cc-chip>');
      expect(getComputedStyle(el).display).toBe('none');
    });

    it('dims to 0.7 while pressed, but not when disabled', async () => {
      const el = await render('<cc-chip>Label</cc-chip>');
      await mouse(body(el), 'mousePressed');
      expect(style(el).opacity).toBe('0.7');
      await mouse(body(el), 'mouseReleased');
      el.disabled = true;
      await el.updateComplete;
      await mouse(body(el), 'mousePressed');
      expect(style(el).opacity).toBe('0.4');
      await mouse(body(el), 'mouseReleased');
    });

    it('has no hover fill when disabled', async () => {
      const el = await render('<cc-chip variant="filled" disabled>Label</cc-chip>');
      await userEvent.hover(body(el), { force: true });
      expect(style(el).backgroundColor).toBe(tokenColor('--cc-surface-surface-2'));
    });

    it('tints an outlined chip on hover and keeps the selected tint', async () => {
      const el = await render('<cc-chip>Label</cc-chip>');
      expect(style(el).backgroundColor).toBe('rgba(0, 0, 0, 0)');
      await userEvent.hover(body(el));
      expect(style(el).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
      await userEvent.unhover(document.body);
      el.selected = true;
      await el.updateComplete;
      expect(style(el).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
      const resting = style(el).backgroundImage;
      await userEvent.hover(body(el));
      expect(style(el).backgroundImage).not.toBe(resting);
    });

    it('fills an input chip on keyboard focus', async () => {
      const el = await render('<cc-chip type="input">Label</cc-chip>');
      const resting = style(el).backgroundImage;
      await userEvent.tab();
      expect(style(el).backgroundImage).not.toBe(resting);
    });

    it('is dimmed to 0.4 when disabled', async () => {
      const el = await render('<cc-chip disabled>Label</cc-chip>');
      expect(style(el).opacity).toBe('0.4');
      expect(style(el).cursor).toBe('not-allowed');
    });

    it('shows the shared focus ring on keyboard focus', async () => {
      const el = await render('<cc-chip>Label</cc-chip>');
      expect(style(el).outlineStyle).toBe('none');
      await userEvent.tab();
      expect(style(el).outlineStyle).toBe('solid');
      expect(style(el).outlineWidth).toBe('2px');
      expect(style(el).outlineColor).toBe(tokenColor('--cc-border-focus'));
    });

    it('sizes slotted icons to 20px', async () => {
      const el = await render(`<cc-chip>${home}Label${more}</cc-chip>`);
      const [a, b] = Array.from(el.querySelectorAll('[slot]')).map((n) => n.getBoundingClientRect());
      expect([a.width, a.height, b.width, b.height]).toEqual([20, 20, 20, 20]);
    });
  });
});
