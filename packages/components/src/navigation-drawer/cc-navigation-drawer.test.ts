import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import '@codechem/tokens/tokens.css';
import './cc-navigation-drawer.js';
import type { CcNavigationDrawer, NavigationItem } from './cc-navigation-drawer.js';

const sample: NavigationItem[] = [
  { label: 'Projects', icon: 'grid_view', href: '#projects', selected: true },
  { label: 'People', icon: 'people', href: '#people' },
  {
    label: 'Finance',
    icon: 'account_balance',
    children: [
      { label: 'Accounts', icon: 'savings', href: '#accounts' },
      { label: 'Ledger', icon: 'class', href: '#ledger' },
    ],
  },
  { label: 'Resources', icon: 'collections_bookmark' },
];

async function render(collapsed = false, items = sample) {
  document.body.innerHTML = `<cc-navigation-drawer aria-label="Main"${collapsed ? ' collapsed' : ''}></cc-navigation-drawer>`;
  const el = document.querySelector('cc-navigation-drawer') as CcNavigationDrawer;
  el.items = items;
  await el.updateComplete;
  return el;
}

const shadow = (el: CcNavigationDrawer) => el.shadowRoot!;
const itemButton = (el: CcNavigationDrawer, label: string) =>
  [...shadow(el).querySelectorAll<HTMLElement>('.item')].find((i) => i.querySelector('.label')?.textContent === label)!;

const tokenColor = (token: string) => {
  const probe = document.createElement('div');
  probe.style.color = `var(${token})`;
  document.body.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
};

const tokenBackground = (token: string) => {
  const probe = document.createElement('div');
  probe.style.backgroundColor = `var(${token})`;
  document.body.append(probe);
  const color = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return color;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('cc-navigation-drawer', () => {
  it('is 256px wide expanded and 64px wide when collapsed', async () => {
    const expanded = await render(false);
    expect(expanded.getBoundingClientRect().width).toBeCloseTo(256, 0);
    expect(itemButton(expanded, 'Projects').getBoundingClientRect().height).toBeCloseTo(48, 0);

    const collapsed = await render(true);
    expect(collapsed.getBoundingClientRect().width).toBeCloseTo(64, 0);
    expect(itemButton(collapsed, 'Projects').getBoundingClientRect().width).toBeCloseTo(48, 0);
  });

  it('renders the items in order and marks the selected one as the current page', async () => {
    const el = await render();
    const labels = [...shadow(el).querySelectorAll('.menu > li > .item > .label')].map((l) => l.textContent);
    expect(labels).toEqual(['Projects', 'People', 'Finance', 'Resources']);
    expect(itemButton(el, 'Projects').getAttribute('aria-current')).toBe('page');
    expect(itemButton(el, 'People').hasAttribute('aria-current')).toBe(false);
  });

  it('moves the selection to the item the user clicks', async () => {
    const el = await render();
    expect(itemButton(el, 'Projects').getAttribute('aria-current')).toBe('page');
    itemButton(el, 'People').click();
    await el.updateComplete;
    expect(itemButton(el, 'People').getAttribute('aria-current')).toBe('page');
    expect(itemButton(el, 'Projects').hasAttribute('aria-current')).toBe(false);
  });

  it('moves the selection to a child of a group', async () => {
    const el = await render();
    itemButton(el, 'Finance').click();
    await el.updateComplete;
    itemButton(el, 'Ledger').click();
    await el.updateComplete;
    expect(itemButton(el, 'Ledger').getAttribute('aria-current')).toBe('page');
    expect(itemButton(el, 'Projects').hasAttribute('aria-current')).toBe(false);
  });

  it('marks a selected item without href as the current page', async () => {
    const el = await render(false, [{ label: 'Settings', icon: 'settings', selected: true }]);
    await expect.element(page.getByRole('button', { name: 'Settings', exact: true })).toHaveAttribute('aria-current', 'page');
  });

  it('gives every group its own controlled list, even when parents nest groups at the same index', async () => {
    const el = await render(false, [
      { label: 'A', icon: 'folder', children: [{ label: 'A1', icon: 'folder', children: [{ label: 'A1a', icon: 'description', href: '#a' }] }] },
      { label: 'B', icon: 'folder', children: [{ label: 'B1', icon: 'folder', children: [{ label: 'B1a', icon: 'description', href: '#b' }] }] },
    ]);
    const ids = [...shadow(el).querySelectorAll('[aria-controls]')].map((b) => b.getAttribute('aria-controls'));
    expect(new Set(ids).size).toBe(ids.length);
    itemButton(el, 'B').click();
    await el.updateComplete;
    expect(itemButton(el, 'B').getAttribute('aria-expanded')).toBe('true');
    expect(itemButton(el, 'A').getAttribute('aria-expanded')).toBe('false');
  });

  it('colours the selected item with the accent token', async () => {
    const el = await render();
    expect(getComputedStyle(itemButton(el, 'Projects')).color).toBe(tokenColor('--cc-accent-light'));
  });

  it('fills an item on hover with the surface-1 token', async () => {
    const el = await render();
    await userEvent.hover(itemButton(el, 'People'));
    expect(getComputedStyle(itemButton(el, 'People')).backgroundColor).toBe(tokenBackground('--cc-surface-surface-1'));
    await userEvent.unhover(document.body);
  });

  it('darkens a hovered selected item and an open group, to surface-0', async () => {
    const el = await render();
    await userEvent.hover(itemButton(el, 'Projects'));
    expect(getComputedStyle(itemButton(el, 'Projects')).backgroundColor).toBe(tokenBackground('--cc-surface-surface-0'));
    await userEvent.unhover(document.body);
  });

  it('puts an open group\'s children on a surface-1 panel and darkens a hovered child', async () => {
    const el = await render();
    itemButton(el, 'Finance').click();
    await el.updateComplete;
    const panel = shadow(el).querySelector<HTMLElement>('.sub')!;
    expect(getComputedStyle(panel).backgroundColor).toBe(tokenBackground('--cc-surface-surface-1'));
    await userEvent.hover(itemButton(el, 'Accounts'));
    expect(getComputedStyle(itemButton(el, 'Accounts')).backgroundColor).toBe(tokenBackground('--cc-surface-surface-0'));
    await userEvent.unhover(document.body);
  });

  it('keeps the background behind every item and the collapse button when all groups are open', async () => {
    const el = await render(false, [
      { label: 'Talent', icon: 'assignment_ind', children: [{ label: 'Flow', icon: 'person_add_alt', href: '#flow' }, { label: 'Profiles', icon: 'person_search', href: '#profiles' }, { label: 'Requests', icon: 'route', href: '#requests' }] },
      { label: 'Absence', icon: 'calendar_month', children: [{ label: 'Dashboard', icon: 'dashboard', href: '#dashboard' }, { label: 'Overview', icon: 'view_timeline', href: '#overview' }, { label: 'My Calendar', icon: 'edit_calendar', href: '#my-calendar' }, { label: 'Attendance', icon: 'event_available', href: '#attendance' }] },
      { label: 'Finance', icon: 'account_balance', children: [{ label: 'Accounts', icon: 'savings', href: '#accounts' }, { label: 'Journal', icon: 'menu_book', href: '#journal' }, { label: 'Ledger', icon: 'class', href: '#ledger' }] },
      { label: 'Inventory', icon: 'chair_alt' },
      { label: 'Resources', icon: 'collections_bookmark' },
    ]);
    for (const button of shadow(el).querySelectorAll<HTMLElement>('.item[aria-expanded="false"]')) button.click();
    await el.updateComplete;
    const background = el.getBoundingClientRect();
    const collapse = shadow(el).querySelector('.collapse')!.getBoundingClientRect();
    expect(collapse.bottom).toBeLessThanOrEqual(background.bottom + 0.5);
    for (const item of shadow(el).querySelectorAll<HTMLElement>('.item')) {
      expect(item.getBoundingClientRect().bottom).toBeLessThanOrEqual(background.bottom + 0.5);
    }
  });

  it('opens and closes a group and reveals its children', async () => {
    const el = await render();
    const finance = itemButton(el, 'Finance');
    expect(finance.getAttribute('aria-expanded')).toBe('false');
    const children = shadow(el).querySelector<HTMLElement>(`#${finance.getAttribute('aria-controls')}`)!;
    expect(children.hidden).toBe(true);
    expect(children.getBoundingClientRect().height).toBe(0);

    finance.click();
    await el.updateComplete;
    expect(finance.getAttribute('aria-expanded')).toBe('true');
    expect(children.hidden).toBe(false);
    expect(itemButton(el, 'Accounts').tagName).toBe('A');

    finance.click();
    await el.updateComplete;
    expect(finance.getAttribute('aria-expanded')).toBe('false');
    expect(children.hidden).toBe(true);
  });

  it('keeps every label as the accessible name when collapsed, without icon ligatures', async () => {
    const el = await render(true);
    finance(el).click();
    await el.updateComplete;
    await expect.element(page.getByRole('link', { name: 'Accounts', exact: true })).toBeInTheDocument();
    await expect.element(page.getByRole('button', { name: 'Finance', exact: true })).toBeInTheDocument();
    await expect.element(page.getByRole('link', { name: 'Projects', exact: true })).toBeInTheDocument();
  });

  it('hides the labels visually when collapsed', async () => {
    const el = await render(true);
    const label = itemButton(el, 'Projects').querySelector<HTMLElement>('.label')!;
    expect(label.getBoundingClientRect().width).toBeLessThanOrEqual(1);
    const expandedEl = await render(false);
    expect(itemButton(expandedEl, 'Projects').querySelector<HTMLElement>('.label')!.getBoundingClientRect().width)
      .toBeGreaterThan(20);
  });

  it('dispatches select with the item when a leaf is activated, but not for a group', async () => {
    const el = await render();
    const onSelect = vi.fn();
    el.addEventListener('select', (event) => onSelect((event as CustomEvent).detail));

    itemButton(el, 'People').click();
    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect.mock.calls[0][0]).toMatchObject({ label: 'People', href: '#people' });

    itemButton(el, 'Finance').click();
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('collapses and expands from its button and dispatches change', async () => {
    const el = await render();
    const onChange = vi.fn();
    el.addEventListener('change', (event) => onChange((event as CustomEvent).detail));
    const toggle = () => shadow(el).querySelector<HTMLButtonElement>('.collapse')!;

    const toggleLabel = () => toggle().querySelector('.label')!.textContent!.trim();
    expect(toggleLabel()).toBe('Collapse navigation');
    await expect.element(page.getByRole('button', { name: 'Collapse navigation', exact: true })).toBeInTheDocument();
    toggle().click();
    await el.updateComplete;
    expect(el.collapsed).toBe(true);
    expect(el.hasAttribute('collapsed')).toBe(true);
    expect(toggleLabel()).toBe('Expand navigation');
    await expect.element(page.getByRole('button', { name: 'Expand navigation', exact: true })).toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith({ collapsed: true });

    toggle().click();
    await el.updateComplete;
    expect(el.collapsed).toBe(false);
    expect(onChange).toHaveBeenLastCalledWith({ collapsed: false });
  });

  it('keeps the collapse icon at 24px and hides its label when collapsed', async () => {
    const el = await render();
    const icon = () => shadow(el).querySelector<HTMLElement>('.collapse .material-icon')!;
    expect(icon().getBoundingClientRect().width).toBeCloseTo(24, 0);

    shadow(el).querySelector<HTMLButtonElement>('.collapse')!.click();
    await el.updateComplete;
    expect(shadow(el).querySelector<HTMLElement>('.collapse .label')!.getBoundingClientRect().width).toBeLessThanOrEqual(1);
    expect(icon().getBoundingClientRect().width).toBeCloseTo(24, 0);
  });

  it('forwards aria-label to the navigation landmark', async () => {
    const el = await render();
    expect(shadow(el).querySelector('nav')!.getAttribute('aria-label')).toBe('Main');
  });

  it('shows a focus ring on keyboard focus', async () => {
    const el = await render();
    itemButton(el, 'People').focus();
    expect(shadow(el).activeElement).toBe(itemButton(el, 'People'));
    const style = getComputedStyle(itemButton(el, 'People'));
    expect(style.outlineStyle).toBe('solid');
    expect(style.outlineWidth).toBe('2px');
    expect(style.outlineColor).toBe(tokenColor('--cc-border-focus'));
  });

  it('opens a group from the keyboard with Enter', async () => {
    const el = await render();
    itemButton(el, 'Finance').focus();
    await userEvent.keyboard('{Enter}');
    await el.updateComplete;
    expect(itemButton(el, 'Finance').getAttribute('aria-expanded')).toBe('true');
  });
});

function finance(el: CcNavigationDrawer) {
  return itemButton(el, 'Finance');
}
