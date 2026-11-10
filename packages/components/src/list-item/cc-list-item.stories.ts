import { html, nothing } from 'lit';
import './cc-list-item.js';

const leadings = ['checkbox', 'icon', 'none'] as const;

type Args = {
  label: string;
  supportingText: string;
  leading: (typeof leadings)[number];
  icon: string;
  selected: boolean;
  hideRemoveButton: boolean;
};

const item = (a: Args) =>
  html`<cc-list-item
    label=${a.label}
    supporting-text=${a.supportingText || nothing}
    leading=${a.leading}
    icon=${a.icon}
    ?selected=${a.selected}
    ?hide-remove-button=${a.hideRemoveButton}
  ></cc-list-item>`;

const defaults: Args = {
  label: 'List item',
  supportingText: '',
  leading: 'none',
  icon: 'person_2',
  selected: false,
  hideRemoveButton: false,
};

export default {
  title: 'Components/List item',
  component: 'cc-list-item',
  tags: ['autodocs'],
  args: defaults,
  argTypes: {
    leading: { control: 'inline-radio', options: leadings },
  },
  render: (a: Args) => html`<div role="list" style="width: 260px">${item(a)}</div>`,
};

export const Default = {};
export const WithCheckbox = { args: { leading: 'checkbox' } };
export const Selected = { args: { leading: 'checkbox', selected: true } };
export const WithIcon = { args: { leading: 'icon' } };
export const WithSupportingText = { args: { supportingText: 'Smaller text' } };

export const AllVariants = {
  parameters: { controls: { disable: true } },
  render: () => html`<div role="list" style="display: grid; gap: 16px; width: 260px">
    ${leadings.map((leading) => item({ ...defaults, leading }))}
    ${item({ ...defaults, leading: 'checkbox', selected: true, label: 'Selected item' })}
    ${item({ ...defaults, supportingText: 'Smaller text', label: 'With supporting text' })}
    ${item({ ...defaults, hideRemoveButton: true, label: 'Without remove button' })}
  </div>`,
};
