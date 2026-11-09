import { html, nothing } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import './cc-button.js';

const add = '<svg slot="leading" viewBox="0 0 24 24"><path fill="currentColor" d="M18 13H13V18C13 18.55 12.55 19 12 19C11.45 19 11 18.55 11 18V13H6C5.45 13 5 12.55 5 12C5 11.45 5.45 11 6 11H11V6C11 5.45 11.45 5 12 5C12.55 5 13 5.45 13 6V11H18C18.55 11 19 11.45 19 12C19 12.55 18.55 13 18 13Z"/></svg>';
const copy = '<svg slot="trailing" viewBox="0 0 24 24"><path fill="currentColor" d="M15.5 20H5.5V7C5.5 6.45 5.05 6 4.5 6C3.95 6 3.5 6.45 3.5 7V20C3.5 21.1 4.4 22 5.5 22H15.5C16.05 22 16.5 21.55 16.5 21C16.5 20.45 16.05 20 15.5 20ZM20.5 16V4C20.5 2.9 19.6 2 18.5 2H9.5C8.4 2 7.5 2.9 7.5 4V16C7.5 17.1 8.4 18 9.5 18H18.5C19.6 18 20.5 17.1 20.5 16ZM18.5 16H9.5V4H18.5V16Z"/></svg>';

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
