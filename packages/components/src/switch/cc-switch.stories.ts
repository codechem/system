import { html, nothing } from 'lit';
import './cc-switch.js';

type Args = {
  label: string;
  checked: boolean;
  disabled: boolean;
  size: 'small' | 'large';
};

const toggle = (a: Args, ariaLabel?: string) =>
  html`<cc-switch ?checked=${a.checked} ?disabled=${a.disabled} size=${a.size} aria-label=${ariaLabel ?? nothing}
    >${a.label}</cc-switch
  >`;

export default {
  title: 'Components/Switch',
  component: 'cc-switch',
  tags: ['autodocs'],
  args: { label: 'Notifications', checked: false, disabled: false, size: 'small' } satisfies Args,
  argTypes: {
    size: { control: 'inline-radio', options: ['small', 'large'] },
  },
  render: toggle,
};

export const Default = {};
export const On = { args: { checked: true } };
export const Disabled = { args: { disabled: true, checked: true } };
export const WithoutLabel = { render: () => html`<cc-switch aria-label="Enable notifications"></cc-switch>` };

export const AllVariants = {
  parameters: { controls: { disable: true } },
  render: () => html`<div style="display: grid; grid-template-columns: repeat(2, auto); gap: 16px 32px; width: max-content">
    ${[true, false].flatMap((checked) =>
      [false, true].flatMap((disabled) =>
        (['small', 'large'] as const).map((size) =>
          toggle({ label: '', checked, disabled, size }, `${size}, ${checked ? 'on' : 'off'}${disabled ? ', disabled' : ''}`),
        ),
      ),
    )}
  </div>`,
};
