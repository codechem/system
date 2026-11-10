import { html, nothing } from 'lit';
import './cc-chip.js';

const types = ['filter', 'input'] as const;
const variants = ['outlined', 'filled'] as const;
const avatarSrc =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Crect width='20' height='20' fill='%23008853'/%3E%3Ccircle cx='10' cy='10' r='4' fill='%23fff'/%3E%3C/svg%3E";

type Args = {
  label: string;
  type: (typeof types)[number];
  variant: (typeof variants)[number];
  selected: boolean;
  disabled: boolean;
  removable: boolean;
  leadingIcon: boolean;
  trailingIcon: boolean;
  avatar: boolean;
};

const chip = (a: Args) =>
  html`<cc-chip
    type=${a.type}
    variant=${a.variant}
    ?selected=${a.selected}
    ?disabled=${a.disabled}
    ?removable=${a.removable}
    >${a.leadingIcon
      ? html`<span slot="leading" class="material-icons-round" aria-hidden="true">home</span>`
      : nothing}${a.trailingIcon
      ? html`<span slot="trailing" class="material-icons-round" aria-hidden="true">expand_more</span>`
      : nothing}${a.avatar ? html`<img slot="avatar" src=${avatarSrc} alt="" />` : nothing}${a.label}</cc-chip
  >`;

const base: Args = {
  label: 'Label',
  type: 'filter',
  variant: 'outlined',
  selected: false,
  disabled: false,
  removable: false,
  leadingIcon: false,
  trailingIcon: false,
  avatar: false,
};

export default {
  title: 'Components/Chip',
  component: 'cc-chip',
  tags: ['autodocs'],
  args: base satisfies Args,
  argTypes: {
    type: { control: 'inline-radio', options: types },
    variant: { control: 'inline-radio', options: variants },
  },
  render: chip,
};

export const Filter = {};
export const FilterSelected = { args: { selected: true } };
export const FilterWithIcons = { args: { leadingIcon: true, trailingIcon: true } };
export const Input = { args: { type: 'input', removable: true } };
export const InputWithAvatar = { args: { type: 'input', removable: true, avatar: true, label: 'John Doe' } };
export const Disabled = { args: { disabled: true } };

const grid = 'display: grid; gap: 16px 24px; align-items: center; justify-items: start; width: max-content';

export const AllVariants = {
  parameters: { controls: { disable: true } },
  render: () => html`<div style="display: grid; gap: 40px">
    <div style="${grid}; grid-template-columns: repeat(5, auto)">
      ${variants.flatMap((variant) =>
        [false, true].flatMap((selected) =>
          [
            { ...base },
            { ...base, leadingIcon: true },
            { ...base, trailingIcon: true },
            { ...base, leadingIcon: true, trailingIcon: true },
            { ...base, disabled: true },
          ].map((a) => chip({ ...a, type: 'filter', variant, selected })),
        ),
      )}
    </div>
    <div style="${grid}; grid-template-columns: repeat(6, auto)">
      ${variants.flatMap((variant) =>
        [false, true].flatMap((selected) =>
          [
            { ...base },
            { ...base, removable: true },
            { ...base, leadingIcon: true, removable: true },
            { ...base, avatar: true, removable: true, label: 'John Doe' },
            { ...base, avatar: true, label: 'John Doe' },
            { ...base, removable: true, disabled: true },
          ].map((a) => chip({ ...a, type: 'input', variant, selected })),
        ),
      )}
    </div>
  </div>`,
};
