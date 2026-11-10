import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import '@codechem/tokens/tokens.css';
import './cc-switch.js';
import type { CcSwitch } from './cc-switch.js';

async function render(markup: string) {
  document.body.innerHTML = markup;
  const el = document.querySelector('cc-switch') as CcSwitch;
  await el.updateComplete;
  await document.fonts.ready;
  return el;
}

const input = (el: CcSwitch) => el.shadowRoot!.querySelector('input')!;
const track = (el: CcSwitch) => el.shadowRoot!.querySelector('.track')!;
const thumb = (el: CcSwitch) => el.shadowRoot!.querySelector('.thumb')!;
const label = (el: CcSwitch) => el.shadowRoot!.querySelector('label')!;

const clickLabelText = (el: CcSwitch, options = {}) =>
  userEvent.click(el, { position: { x: el.offsetWidth - 4, y: el.offsetHeight / 2 }, ...options });

const tokenColor = (token: string) => {
  const probe = document.createElement('div');
  probe.style.color = `var(${token})`;
  document.body.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
};

const bgColor = (element: Element) => getComputedStyle(element).backgroundColor;

afterEach(async () => {
  await userEvent.unhover(document.body);
  document.body.innerHTML = '';
});

describe('cc-switch', () => {
  it('defaults to an off small switch', async () => {
    const el = await render('<cc-switch>Notifications</cc-switch>');
    expect(el.checked).toBe(false);
    expect(el.getAttribute('size')).toBe('small');
    expect(input(el).checked).toBe(false);
  });

  it('toggles on click and fires change', async () => {
    const el = await render('<cc-switch>Notifications</cc-switch>');
    const onChange = vi.fn();
    el.addEventListener('change', onChange);
    el.click();
    await el.updateComplete;
    expect(el.checked).toBe(true);
    expect(onChange).toHaveBeenCalledOnce();
  });

  it('toggles when the label text is clicked', async () => {
    const el = await render('<cc-switch>Notifications</cc-switch>');
    await clickLabelText(el);
    expect(el.checked).toBe(true);
  });

  it('is already updated when input fires', async () => {
    const el = await render('<cc-switch>Notifications</cc-switch>');
    const seen: boolean[] = [];
    el.addEventListener('input', () => seen.push(el.checked));
    el.click();
    expect(seen).toEqual([true]);
  });

  it('keeps the inner input in sync when a listener reverts the change', async () => {
    const el = await render('<cc-switch checked>Notifications</cc-switch>');
    el.addEventListener('change', () => (el.checked = true));
    el.click();
    await el.updateComplete;
    expect(el.checked).toBe(true);
    expect(input(el).checked).toBe(true);
  });

  it('toggles with the keyboard', async () => {
    const el = await render('<cc-switch>Notifications</cc-switch>');
    el.focus();
    await userEvent.keyboard(' ');
    expect(el.checked).toBe(true);
  });

  it('exposes itself as a switch named by its slotted text', async () => {
    await render('<cc-switch>Notifications</cc-switch>');
    await expect.element(page.getByRole('switch', { name: 'Notifications', exact: true })).toBeVisible();
  });

  it('is named by aria-label when it has no text', async () => {
    await render('<cc-switch aria-label="Enable notifications"></cc-switch>');
    await expect.element(page.getByRole('switch', { name: 'Enable notifications', exact: true })).toBeVisible();
  });

  it('reports its checked state to assistive technology', async () => {
    const el = await render('<cc-switch checked>Notifications</cc-switch>');
    await expect.element(page.getByRole('switch', { name: 'Notifications', checked: true, exact: true })).toBeVisible();
    el.click();
    await el.updateComplete;
    await expect.element(page.getByRole('switch', { name: 'Notifications', checked: false, exact: true })).toBeVisible();
  });

  describe('when disabled', () => {
    it('does not toggle on click', async () => {
      const el = await render('<cc-switch disabled>Notifications</cc-switch>');
      el.click();
      await clickLabelText(el, { force: true });
      await el.updateComplete;
      expect(el.checked).toBe(false);
    });

    it('blocks listeners added to the host', async () => {
      const el = await render('<cc-switch disabled>Notifications</cc-switch>');
      const onClick = vi.fn();
      el.addEventListener('click', onClick);
      el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, composed: true }));
      expect(onClick).not.toHaveBeenCalled();
      expect(el.checked).toBe(false);
    });

    it('marks the native input as disabled for assistive technology', async () => {
      const el = await render('<cc-switch disabled>Notifications</cc-switch>');
      expect(input(el).disabled).toBe(true);
      await expect.element(page.getByRole('switch', { name: 'Notifications', disabled: true, exact: true })).toBeVisible();
    });

    it('dims the switch to 40% opacity with a not-allowed cursor', async () => {
      const el = await render('<cc-switch disabled>Notifications</cc-switch>');
      expect(getComputedStyle(label(el)).opacity).toBe('0.4');
      expect(getComputedStyle(label(el)).cursor).toBe('not-allowed');
    });
  });

  it('is hidden with the hidden attribute', async () => {
    const el = await render('<cc-switch hidden>Notifications</cc-switch>');
    expect(getComputedStyle(el).display).toBe('none');
  });

  it('dims the track to 70% opacity while pressed', async () => {
    const el = await render('<cc-switch>Notifications</cc-switch>');
    await userEvent.pointer([{ keys: '[MouseLeft>]', target: label(el) }]);
    expect(getComputedStyle(track(el)).opacity).toBe('0.7');
    await userEvent.pointer([{ keys: '[/MouseLeft]', target: label(el) }]);
    expect(getComputedStyle(track(el)).opacity).toBe('1');
  });

  it('uses the Figma colours for off and on', async () => {
    const el = await render('<cc-switch>Notifications</cc-switch>');
    expect(bgColor(track(el))).toBe(tokenColor('--cc-surface-surface-highlight'));
    expect(bgColor(thumb(el))).toBe(tokenColor('--cc-text-low-emphasis'));
    el.checked = true;
    await el.updateComplete;
    expect(bgColor(track(el))).toBe(tokenColor('--cc-accent-main'));
    expect(bgColor(thumb(el))).toBe(tokenColor('--cc-text-high-emphasis'));
  });

  it('darkens the track on hover, like Figma', async () => {
    const el = await render('<cc-switch>Notifications</cc-switch>');
    await userEvent.hover(el);
    expect(bgColor(track(el))).toBe(tokenColor('--cc-surface-surface-2'));
    el.checked = true;
    await el.updateComplete;
    expect(bgColor(track(el))).toBe(tokenColor('--cc-accent-dark'));
  });

  it('does not change colour on hover when disabled', async () => {
    const el = await render('<cc-switch disabled>Notifications</cc-switch>');
    await userEvent.hover(el);
    expect(bgColor(track(el))).toBe(tokenColor('--cc-surface-surface-highlight'));
  });

  it.each([
    ['small', 26, 16, 12, 12],
    ['large', 40, 24, 18.82, 19.2],
  ])('size=%s is a %ipx by %ipx track with a %fpx by %fpx thumb, like Figma', async (size, w, h, tw, th) => {
    const el = await render(`<cc-switch size="${size}"></cc-switch>`);
    const trackRect = track(el).getBoundingClientRect();
    const thumbRect = thumb(el).getBoundingClientRect();
    expect(trackRect.width).toBeCloseTo(w, 1);
    expect(trackRect.height).toBeCloseTo(h, 1);
    expect(thumbRect.width).toBeCloseTo(tw, 1);
    expect(thumbRect.height).toBeCloseTo(th, 1);
  });

  it.each([
    ['small', 2],
    ['large', 2.35],
  ])('size=%s keeps the thumb %fpx from the track edge when off and on', async (size, inset) => {
    const el = await render(`<cc-switch size="${size}"></cc-switch>`);
    const trackRect = track(el).getBoundingClientRect();
    expect(thumb(el).getBoundingClientRect().left - trackRect.left).toBeCloseTo(inset, 1);
    el.checked = true;
    await el.updateComplete;
    expect(trackRect.right - thumb(el).getBoundingClientRect().right).toBeCloseTo(inset, 1);
  });

  it('draws a 2px focus ring around the track on keyboard focus', async () => {
    const el = await render('<cc-switch>Notifications</cc-switch>');
    await userEvent.tab();
    expect(el.shadowRoot!.activeElement).toBe(input(el));
    const style = getComputedStyle(track(el));
    expect(style.outlineStyle).toBe('solid');
    expect(style.outlineWidth).toBe('2px');
    expect(style.outlineColor).toBe(tokenColor('--cc-border-focus'));
  });

  describe('in a form', () => {
    const form = (switchMarkup: string) => `<form>${switchMarkup}</form>`;
    const data = () => new FormData(document.querySelector('form')!);

    it('submits its value only when on', async () => {
      const el = await render(form('<cc-switch name="alerts" value="yes">Alerts</cc-switch>'));
      expect(data().get('alerts')).toBeNull();
      el.click();
      await el.updateComplete;
      expect(data().get('alerts')).toBe('yes');
    });

    it('is left out of the form data when disabled', async () => {
      await render(form('<cc-switch name="alerts" checked disabled>Alerts</cc-switch>'));
      expect(data().get('alerts')).toBeNull();
    });

    it('resets to its initial state', async () => {
      const el = await render(form('<cc-switch name="alerts" checked>Alerts</cc-switch>'));
      el.click();
      await el.updateComplete;
      expect(el.checked).toBe(false);
      document.querySelector('form')!.reset();
      await el.updateComplete;
      expect(el.checked).toBe(true);
      expect(data().get('alerts')).toBe('on');
    });
  });
});
