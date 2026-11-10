import { html, nothing } from 'lit';
import './cc-number-input-stepper.js';

type Args = {
  value: string;
  placeholder: string;
  min: number;
  max: number;
  step: number;
  required: boolean;
  disabled: boolean;
  leadingIcon: boolean;
};

const numberInput = (a: Args) =>
  html`<cc-number-input-stepper
    aria-label="Quantity"
    value=${a.value}
    placeholder=${a.placeholder}
    min=${a.min}
    max=${a.max}
    step=${a.step}
    ?required=${a.required}
    ?disabled=${a.disabled}
    >${a.leadingIcon
      ? html`<span slot="leading" class="material-icons-round" aria-hidden="true">add_box</span>`
      : nothing}</cc-number-input-stepper
  >`;

const defaults: Args = {
  value: '',
  placeholder: 'Placeholder text',
  min: 0,
  max: 10,
  step: 1,
  required: false,
  disabled: false,
  leadingIcon: false,
};

export default {
  title: 'Components/Number input stepper',
  component: 'cc-number-input-stepper',
  tags: ['autodocs'],
  args: defaults,
  argTypes: {
    min: { control: 'inline-radio', options: [0, 1] },
    step: { control: 'inline-radio', options: [1, 5] },
  },
  render: numberInput,
};

export const Default = {};
export const WithValue = { args: { value: '3' } };
export const WithLeadingIcon = { args: { leadingIcon: true } };
export const Required = { args: { required: true } };
export const Disabled = { args: { disabled: true, value: '3' } };

export const AllVariants = {
  parameters: { controls: { disable: true } },
  render: () => html`<div style="display: grid; gap: 24px; width: max-content">
    ${numberInput({ ...defaults })}
    ${numberInput({ ...defaults, value: '3', leadingIcon: true })}
    ${numberInput({ ...defaults, value: '3', disabled: true })}
  </div>`,
};
