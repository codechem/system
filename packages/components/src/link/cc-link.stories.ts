import { html, nothing } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import './cc-link.js';

const sizes = ['extra-large', 'large', 'medium', 'small'] as const;
const add = '<span slot="leading" class="material-icons-round" aria-hidden="true">add</span>';

type Args = {
  label: string;
  href: string;
  size: (typeof sizes)[number];
  disabled: boolean;
  hideIcon: boolean;
  leadingIcon: boolean;
};

const link = (a: Args) =>
  html`<cc-link href=${a.href || nothing} size=${a.size} ?disabled=${a.disabled} ?hide-icon=${a.hideIcon}
    >${a.leadingIcon ? unsafeHTML(add) : nothing}${a.label}</cc-link
  >`;

export default {
  title: 'Components/Link',
  component: 'cc-link',
  tags: ['autodocs'],
  args: {
    label: 'Link Label',
    href: '#',
    size: 'medium',
    disabled: false,
    hideIcon: false,
    leadingIcon: false,
  } satisfies Args,
  argTypes: {
    size: { control: 'inline-radio', options: sizes },
  },
  render: link,
};

export const Default = {};
export const WithLeadingIcon = { args: { leadingIcon: true } };
export const WithoutIcon = { args: { hideIcon: true } };
export const Disabled = { args: { disabled: true } };

export const AllVariants = {
  parameters: { controls: { disable: true } },
  render: () => html`<div style="display: grid; grid-template-columns: repeat(2, auto); gap: 24px 48px; align-items: center; width: max-content">
    ${sizes.flatMap((size) =>
      [false, true].map((disabled) =>
        link({ label: 'Link Label', href: '#', size, disabled, hideIcon: false, leadingIcon: false }),
      ),
    )}
  </div>`,
};
