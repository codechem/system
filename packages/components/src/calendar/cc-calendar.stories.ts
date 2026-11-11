import { html, nothing } from 'lit';
import './cc-calendar.js';

type Args = {
  value: string;
  min: string;
  max: string;
  disabled: boolean;
};

const calendar = (a: Args) =>
  html`<cc-calendar
    locale="en-US"
    value=${a.value || nothing}
    min=${a.min || nothing}
    max=${a.max || nothing}
    ?disabled=${a.disabled}
  ></cc-calendar>`;

export default {
  title: 'Components/Calendar',
  component: 'cc-calendar',
  tags: ['autodocs'],
  args: { value: '2024-11-14', min: '', max: '', disabled: false } satisfies Args,
  argTypes: {
    value: { control: 'text' },
    min: { control: 'text' },
    max: { control: 'text' },
    disabled: { control: 'boolean' },
  },
  render: calendar,
};

export const Default = {};
export const NoSelection = { args: { value: '' } };
export const WithLimits = { args: { value: '2024-11-14', min: '2024-11-05', max: '2024-11-22' } };
export const Disabled = { args: { disabled: true } };

export const AllVariants = {
  parameters: { controls: { disable: true } },
  render: () => html`<div style="display: flex; flex-wrap: wrap; gap: 24px; align-items: flex-start">
    ${calendar({ value: '2024-11-14', min: '', max: '', disabled: false })}
    ${calendar({ value: '', min: '', max: '', disabled: false })}
    ${calendar({ value: '2024-11-14', min: '2024-11-05', max: '2024-11-22', disabled: false })}
    ${calendar({ value: '2024-11-14', min: '', max: '', disabled: true })}
  </div>`,
};
