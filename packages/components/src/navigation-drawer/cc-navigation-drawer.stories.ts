import { html } from 'lit';
import './cc-navigation-drawer.js';
import type { NavigationItem } from './cc-navigation-drawer.js';

type Args = {
  collapsed: boolean;
  selected: string;
};

const items = (selected: string): NavigationItem[] => {
  const item = (label: string, icon: string, children?: NavigationItem[]): NavigationItem => ({
    label,
    icon,
    selected: label === selected,
    children,
  });
  return [
    item('Projects', 'grid_view'),
    item('People', 'people'),
    item('Clients', 'business_center'),
    item('Talent', 'assignment_ind', [
      item('Flow', 'person_add_alt'),
      item('Profiles', 'person_search'),
      item('Requests', 'route'),
    ]),
    item('Absence', 'calendar_month', [
      item('Dashboard', 'dashboard'),
      item('Overview', 'view_timeline'),
      item('My Calendar', 'edit_calendar'),
      item('Absence Manager', 'perm_contact_calendar'),
      item('Attendance', 'event_available'),
      item('Attendance Manager', 'manage_accounts'),
    ]),
    item('Finance', 'account_balance', [
      item('Accounts', 'savings'),
      item('Journal', 'menu_book'),
      item('Ledger', 'class'),
    ]),
    item('Inventory', 'chair_alt'),
    item('Resources', 'collections_bookmark'),
  ];
};

const drawer = (a: Args) => html`<div style="height: 900px">
  <cc-navigation-drawer
    aria-label="Main navigation"
    ?collapsed=${a.collapsed}
    .items=${items(a.selected)}
  >
    <span slot="logo" class="story-logo">3RM</span>
    <span slot="logomark" class="story-logo">3</span>
  </cc-navigation-drawer>
</div>`;

export default {
  title: 'Components/Navigation drawer',
  component: 'cc-navigation-drawer',
  tags: ['autodocs'],
  args: { collapsed: false, selected: 'Projects' } satisfies Args,
  argTypes: {
    collapsed: { control: 'boolean' },
    selected: { control: 'select', options: ['Projects', 'People', 'Clients', 'Flow', 'Dashboard', 'Accounts', 'Resources'] },
  },
  render: drawer,
};

export const Expanded = {};
export const Collapsed = { args: { collapsed: true } };
export const SelectedInGroup = { args: { selected: 'Dashboard' } };

export const AllVariants = {
  parameters: { controls: { disable: true } },
  render: () => html`<div style="display: flex; gap: 24px; height: 900px">
    ${drawer({ collapsed: false, selected: 'Projects' })}
    ${drawer({ collapsed: true, selected: 'Projects' })}
  </div>`,
};
