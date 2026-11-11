import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import '@codechem/tokens/tokens.css';
import './cc-avatar.js';
import type { CcAvatar } from './cc-avatar.js';

const portrait = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

async function render(markup: string) {
  document.body.innerHTML = markup;
  const el = document.querySelector('cc-avatar') as CcAvatar;
  await el.updateComplete;
  await document.fonts.ready;
  return el;
}

const probeColor = (cssVar: string, prop: 'backgroundColor' | 'color') => {
  const probe = document.createElement('div');
  probe.style.background = `var(${cssVar})`;
  probe.style.color = `var(${cssVar})`;
  document.body.append(probe);
  const value = getComputedStyle(probe)[prop];
  probe.remove();
  return value;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('cc-avatar', () => {
  it('defaults to a medium icon avatar named "Avatar"', async () => {
    const el = await render('<cc-avatar></cc-avatar>');
    expect(el.getAttribute('size')).toBe('medium');
    expect(el.getBoundingClientRect().width).toBe(40);
    expect(el.getBoundingClientRect().height).toBe(40);
    await expect.element(page.getByRole('img', { name: 'Avatar', exact: true })).toBeInTheDocument();
  });

  it.each([
    ['large', 48],
    ['medium', 40],
    ['small', 20],
  ])('size=%s is %i px, like Figma', async (size, px) => {
    const el = await render(`<cc-avatar size="${size}"></cc-avatar>`);
    expect(el.getBoundingClientRect().width).toBeCloseTo(px, 1);
    expect(el.getBoundingClientRect().height).toBeCloseTo(px, 1);
  });

  it.each([
    ['large', 32],
    ['medium', 24],
    ['small', 16],
  ])('size=%s icon is %i px', async (size, px) => {
    const el = await render(`<cc-avatar size="${size}"></cc-avatar>`);
    const icon = el.shadowRoot!.querySelector<HTMLElement>('.material-icon')!;
    expect(icon.getBoundingClientRect().width).toBeCloseTo(px, 1);
    expect(icon.getBoundingClientRect().height).toBeCloseTo(px, 1);
  });

  it('uses the Figma surface colour and medium emphasis icon colour', async () => {
    const el = await render('<cc-avatar></cc-avatar>');
    const avatar = el.shadowRoot!.querySelector('.avatar')!;
    expect(getComputedStyle(avatar).backgroundColor).toBe(probeColor('--cc-surface-surface-highlight', 'backgroundColor'));
    const icon = el.shadowRoot!.querySelector('.material-icon')!;
    expect(getComputedStyle(icon).color).toBe(probeColor('--cc-text-medium-emphasis', 'color'));
  });

  it('hides the icon ligature from assistive technology', async () => {
    const el = await render('<cc-avatar></cc-avatar>');
    const icon = el.shadowRoot!.querySelector('.material-icon')!;
    expect(icon.getAttribute('aria-hidden')).toBe('true');
    expect(icon.textContent).toBe('person');
    await expect.element(page.getByRole('img', { name: 'Avatar', exact: true })).toBeInTheDocument();
  });

  it('updates the accessible name when alt changes', async () => {
    const el = await render('<cc-avatar alt="Jane Roe"></cc-avatar>');
    el.alt = 'John Doe';
    await el.updateComplete;
    await expect.element(page.getByRole('img', { name: 'John Doe', exact: true })).toBeInTheDocument();
  });

  it('renders the image and names the avatar with alt', async () => {
    const el = await render(`<cc-avatar src="${portrait}" alt="John Doe"></cc-avatar>`);
    const img = el.shadowRoot!.querySelector<HTMLImageElement>('img[part="image"]')!;
    expect(img.getBoundingClientRect().width).toBeCloseTo(40, 1);
    expect(el.shadowRoot!.querySelector('.material-icon')).toBeNull();
    await expect.element(page.getByRole('img', { name: 'John Doe', exact: true })).toBeInTheDocument();
  });

  it('stays hidden with the hidden attribute', async () => {
    const el = await render('<cc-avatar hidden></cc-avatar>');
    expect(getComputedStyle(el).display).toBe('none');
  });

  it('shows no badge by default', async () => {
    const el = await render('<cc-avatar size="large"></cc-avatar>');
    expect(el.shadowRoot!.querySelector('.badge')).toBeNull();
  });

  it.each([
    ['large', 16, 16],
    ['medium', 6, 6],
    ['small', 6, 6],
  ])('notification badge at size=%s is %i x %i, like Figma', async (size, w, h) => {
    const el = await render(`<cc-avatar size="${size}" notification-badge></cc-avatar>`);
    const badge = el.shadowRoot!.querySelector<HTMLElement>('.badge')!;
    expect(badge.getBoundingClientRect().width).toBeCloseTo(w, 1);
    expect(badge.getBoundingClientRect().height).toBeCloseTo(h, 1);
  });

  it('places the badge flush with the top-right corner', async () => {
    const el = await render('<cc-avatar size="large" notification-badge></cc-avatar>');
    const badge = el.shadowRoot!.querySelector('.badge')!.getBoundingClientRect();
    const host = el.getBoundingClientRect();
    expect(badge.right).toBeCloseTo(host.right, 1);
    expect(badge.top).toBeCloseTo(host.top, 1);
  });

  it('draws the badge with a 3px outside stroke in the background colour', async () => {
    const el = await render('<cc-avatar notification-badge></cc-avatar>');
    const badge = el.shadowRoot!.querySelector('.badge')!;
    expect(getComputedStyle(badge).boxShadow).toBe(`${probeColor('--cc-background', 'color')} 0px 0px 0px 3px`);
  });

  it('uses the Figma green status colour for the badge', async () => {
    const el = await render('<cc-avatar notification-badge></cc-avatar>');
    const badge = el.shadowRoot!.querySelector('.badge')!;
    expect(getComputedStyle(badge).backgroundColor).toBe(probeColor('--cc-status-green-main', 'backgroundColor'));
  });

  it('large badge grows for two digits and stays flush top-right', async () => {
    const el = await render('<cc-avatar size="large" notification-badge><span slot="badge">12</span></cc-avatar>');
    const badge = el.shadowRoot!.querySelector('.badge')!.getBoundingClientRect();
    const host = el.getBoundingClientRect();
    expect(badge.height).toBeCloseTo(16, 1);
    expect(badge.width).toBeGreaterThan(16);
    expect(badge.right).toBeCloseTo(host.right, 1);
    expect(badge.top).toBeCloseTo(host.top, 1);
  });

  it('reacts to runtime changes to the badge, src and size', async () => {
    const el = await render('<cc-avatar size="medium" notification-badge></cc-avatar>');
    el.notificationBadge = false;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.badge')).toBeNull();
    el.src = portrait;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.material-icon')).toBeNull();
    el.size = 'small';
    await el.updateComplete;
    expect(el.getBoundingClientRect().width).toBeCloseTo(20, 1);
  });

  it('shows the large badge count from the badge slot', async () => {
    const el = await render('<cc-avatar size="large" notification-badge><span slot="badge">3</span></cc-avatar>');
    expect(el.querySelector('[slot="badge"]')!.textContent).toBe('3');
    const slot = el.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="badge"]')!;
    expect(slot.assignedElements()[0].textContent).toBe('3');
  });
});
