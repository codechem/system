import { html, nothing } from 'lit';
import './cc-textarea.js';

type Args = {
  label: string;
  placeholder: string;
  value: string;
  supportingText: string;
  required: boolean;
  disabled: boolean;
  hideInfoIcon: boolean;
};

const textarea = (a: Args) =>
  html`<cc-textarea
    label=${a.label}
    placeholder=${a.placeholder}
    value=${a.value}
    supporting-text=${a.supportingText || nothing}
    ?required=${a.required}
    ?disabled=${a.disabled}
    ?hide-info-icon=${a.hideInfoIcon}
  ></cc-textarea>`;

const defaults: Args = {
  label: 'Label',
  placeholder: 'Placeholder text',
  value: '',
  supportingText: '',
  required: true,
  disabled: false,
  hideInfoIcon: false,
};

export default {
  title: 'Components/Text area',
  component: 'cc-textarea',
  tags: ['autodocs'],
  args: defaults,
  render: textarea,
};

export const Default = {};
export const WithSupportingText = { args: { supportingText: 'Below field supporting text' } };
export const WithValue = { args: { value: 'Input text' } };
export const Disabled = { args: { disabled: true } };

export const AllVariants = {
  parameters: { controls: { disable: true } },
  render: () => html`<div style="display: grid; gap: 24px; width: max-content">
    ${textarea({ ...defaults, label: 'Enabled' })}
    ${textarea({ ...defaults, label: 'With text', value: 'Input text' })}
    ${textarea({ ...defaults, label: 'With supporting text', supportingText: 'Below field supporting text' })}
    ${textarea({ ...defaults, label: 'Disabled', disabled: true })}
  </div>`,
};
