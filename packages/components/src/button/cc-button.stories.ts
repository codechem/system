import { html, nothing } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import './cc-button.js';

const add = '<span slot="leading" class="material-icons-round" aria-hidden="true">add</span>';
const copy = '<span slot="trailing" class="material-icons-round" aria-hidden="true">content_copy</span>';

type Args = {
  label: string;
  variant: 'filled' | 'outlined' | 'text';
  color: 'primary' | 'secondary' | 'destructive';
  size: 'small' | 'medium' | 'large';
  disabled: boolean;
  leadingIcon: boolean;
  trailingIcon: boolean;
};

const button = (a: Args) => html`<cc-button variant=${a.variant} color=${a.color} size=${a.size} ?disabled=${a.disabled}>
  ${a.leadingIcon ? unsafeHTML(add) : nothing}${a.label}${a.trailingIcon ? unsafeHTML(copy) : nothing}
</cc-button>`;

export default {
  title: 'Components/Button',
  component: 'cc-button',
  tags: ['autodocs'],
  args: {
    label: 'Button',
    variant: 'filled',
    color: 'primary',
    size: 'medium',
    disabled: false,
    leadingIcon: true,
    trailingIcon: true,
  } satisfies Args,
  argTypes: {
    variant: { control: 'inline-radio', options: ['filled', 'outlined', 'text'] },
    color: { control: 'inline-radio', options: ['primary', 'secondary', 'destructive'] },
    size: { control: 'inline-radio', options: ['small', 'medium', 'large'] },
    type: { control: 'inline-radio', options: ['button', 'submit', 'reset'] },
  },
  render: button,
};

export const Filled = {};
export const Outlined = { args: { variant: 'outlined' } };
export const Text = { args: { variant: 'text' } };
export const Destructive = { args: { color: 'destructive' } };
export const Disabled = { args: { disabled: true } };

export const AllVariants = {
  parameters: { controls: { disable: true } },
  render: () => {
    const colors = ['primary', 'secondary', 'destructive'] as const;
    const variants = ['filled', 'outlined', 'text'] as const;
    const rows = (['large', 'medium', 'small'] as const).flatMap((size) =>
      [false, true].map((disabled) => ({ size, disabled })),
    );
    return html`<table style="border-spacing: 16px 12px">
      <tr>
        <td></td>
        ${colors.flatMap((c) => variants.map((v) => html`<th style="font-size: 12px; text-align: left">${c} / ${v}</th>`))}
      </tr>
      ${rows.map(({ size, disabled }) => html`<tr>
        <th style="font-size: 12px; text-align: left; white-space: nowrap">${size}${disabled ? ' · disabled' : ''}</th>
        ${colors.flatMap((color) => variants.map((variant) => html`<td>
          ${button({ label: 'Button', variant, color, size, disabled, leadingIcon: true, trailingIcon: true })}
        </td>`))}
      </tr>`)}
    </table>`;
  },
};
