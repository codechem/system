import { html } from 'lit';
import './cc-tab.js';

const types = ['enclosed', 'line'] as const;

type Args = {
  label: string;
  type: (typeof types)[number];
  selected: boolean;
  disabled: boolean;
};

const tab = (a: Args) =>
  html`<cc-tab type=${a.type} ?selected=${a.selected} ?disabled=${a.disabled}>${a.label}</cc-tab>`;

export default {
  title: 'Components/Tab',
  component: 'cc-tab',
  tags: ['autodocs'],
  args: {
    label: 'Label',
    type: 'enclosed',
    selected: false,
    disabled: false,
  } satisfies Args,
  argTypes: {
    type: { control: 'inline-radio', options: types },
  },
  render: (a: Args) => tablist(tab(a)),
};

const tablist = (content: unknown) =>
  html`<div role="tablist" style="display: inline-flex">${content}</div>`;

export const Default = {};
export const Line = { args: { type: 'line' } };
export const Selected = { args: { selected: true } };
export const SelectedLine = { args: { type: 'line', selected: true } };
export const Disabled = { args: { disabled: true } };

export const AllVariants = {
  parameters: { controls: { disable: true } },
  render: () =>
    tablist(html`<div style="display: grid; grid-template-columns: repeat(2, auto); gap: 24px 48px; align-items: center; width: max-content">
      ${types.flatMap((type) =>
        [false, true].map((selected) =>
          [false, true].map((disabled) => tab({ label: 'Label', type, selected, disabled })),
        ),
      )}
    </div>`),
};
