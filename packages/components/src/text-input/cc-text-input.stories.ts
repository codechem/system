import { html, nothing } from 'lit';
import '../chip/cc-chip.js';
import './cc-text-input.js';

type Args = {
  label: string;
  placeholder: string;
  value: string;
  supportingText: string;
  error: string;
  required: boolean;
  optional: boolean;
  disabled: boolean;
  showInfoIcon: boolean;
  hideTrailingIcon: boolean;
  leadingIcon: boolean;
  chips: boolean;
};

const textInput = (a: Args) =>
  html`<cc-text-input
    label=${a.label}
    placeholder=${a.placeholder}
    value=${a.value}
    supporting-text=${a.supportingText || nothing}
    error=${a.error || nothing}
    ?required=${a.required}
    ?optional=${a.optional}
    ?disabled=${a.disabled}
    ?show-info-icon=${a.showInfoIcon}
    ?hide-trailing-icon=${a.hideTrailingIcon}
    >${a.leadingIcon
      ? html`<span slot="leading" class="material-icons-round" aria-hidden="true">add_box</span>`
      : nothing}${a.chips
      ? html`<cc-chip slot="chips" type="input" removable>Label</cc-chip><cc-chip slot="chips" type="input" removable>Label</cc-chip>`
      : nothing}</cc-text-input
  >`;

const defaults: Args = {
  label: 'Label',
  placeholder: 'Placeholder text',
  value: '',
  supportingText: '',
  error: '',
  required: false,
  optional: false,
  disabled: false,
  showInfoIcon: false,
  hideTrailingIcon: false,
  leadingIcon: false,
  chips: false,
};

export default {
  title: 'Components/Text input',
  component: 'cc-text-input',
  tags: ['autodocs'],
  args: defaults,
  render: textInput,
};

export const Default = {};
export const WithSupportingText = { args: { supportingText: 'Below the label' } };
export const WithValue = { args: { value: 'Input text' } };
export const Required = { args: { required: true } };
export const Optional = { args: { optional: true } };
export const WithLeadingIcon = { args: { leadingIcon: true } };
export const WithChips = { args: { chips: true } };
export const WithInfoIcon = { args: { showInfoIcon: true } };
export const Error = { args: { error: 'Error text goes here' } };
export const Disabled = { args: { disabled: true } };

export const AllVariants = {
  parameters: { controls: { disable: true } },
  render: () => html`<div style="display: grid; gap: 24px; width: max-content">
    ${textInput({ ...defaults, label: 'Enabled' })}
    ${textInput({ ...defaults, label: 'With leading icon', leadingIcon: true })}
    ${textInput({ ...defaults, label: 'With chips', chips: true })}
    ${textInput({ ...defaults, label: 'With value', value: 'Input text' })}
    ${textInput({ ...defaults, label: 'Error', error: 'Error text goes here' })}
    ${textInput({ ...defaults, label: 'Disabled', disabled: true })}
  </div>`,
};
