import { html, nothing } from 'lit';
import './cc-checkbox.js';

type Args = {
  label: string;
  checked: boolean;
  disabled: boolean;
  size: 'medium' | 'large';
};

const checkbox = (a: Args, ariaLabel?: string) =>
  html`<cc-checkbox ?checked=${a.checked} ?disabled=${a.disabled} size=${a.size} aria-label=${ariaLabel ?? nothing}
    >${a.label}</cc-checkbox
  >`;

export default {
  title: 'Components/Checkbox',
  component: 'cc-checkbox',
  tags: ['autodocs'],
  args: { label: 'Remember me', checked: false, disabled: false, size: 'medium' } satisfies Args,
  argTypes: {
    size: { control: 'inline-radio', options: ['medium', 'large'] },
  },
  render: checkbox,
};

export const Default = {};
export const Checked = { args: { checked: true } };
export const Disabled = { args: { disabled: true, checked: true } };
export const WithoutLabel = { render: () => html`<cc-checkbox aria-label="Select row"></cc-checkbox>` };

export const AllVariants = {
  parameters: { controls: { disable: true } },
  render: () => html`<div style="display: grid; grid-template-columns: repeat(4, auto); gap: 16px; width: max-content">
    ${(['large', 'medium'] as const).flatMap((size) =>
      [true, false].flatMap((checked) =>
        [false, true].map((disabled) =>
          checkbox({ label: '', checked, disabled, size }, `${size}, ${checked ? 'checked' : 'unchecked'}${disabled ? ', disabled' : ''}`),
        ),
      ),
    )}
  </div>`,
};
