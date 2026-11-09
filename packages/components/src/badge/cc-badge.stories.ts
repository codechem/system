import { html } from 'lit';
import './cc-badge.js';

const colors = ['gray', 'purple', 'blue', 'cyan', 'teal', 'green', 'yellow', 'orange', 'red', 'pink'] as const;
const variants = ['solid', 'subtle', 'outline'] as const;

type Args = {
  label: string;
  variant: (typeof variants)[number];
  color: (typeof colors)[number];
  type: 'text' | 'number' | 'dot';
  size: 'medium' | 'small';
};

const badge = (a: Args) =>
  html`<cc-badge variant=${a.variant} color=${a.color} type=${a.type} size=${a.size}>${a.label}</cc-badge>`;

export default {
  title: 'Components/Badge',
  component: 'cc-badge',
  tags: ['autodocs'],
  args: { label: 'Badge', variant: 'solid', color: 'gray', type: 'text', size: 'medium' } satisfies Args,
  argTypes: {
    variant: { control: 'inline-radio', options: variants },
    color: { control: 'select', options: colors },
    type: { control: 'inline-radio', options: ['text', 'number', 'dot'] },
    size: { control: 'inline-radio', options: ['medium', 'small'] },
  },
  render: badge,
};

export const Text = {};
export const Count = { args: { type: 'number', label: '1', color: 'red' } };
export const Dot = { args: { type: 'dot', label: 'Online', color: 'green' } };

export const AllVariants = {
  parameters: { controls: { disable: true } },
  render: () => html`<div style="display: grid; grid-template-columns: repeat(11, auto); gap: 24px 16px; align-items: center; justify-items: center; width: max-content">
    ${colors.map((color) => [
      ...variants.map((variant) => badge({ label: 'Badge', variant, color, type: 'text', size: 'medium' })),
      ...(['medium', 'small'] as const).flatMap((size) =>
        variants.map((variant) => badge({ label: '1', variant, color, type: 'number', size })),
      ),
      ...(['medium', 'small'] as const).map((size) => badge({ label: color, variant: 'solid', color, type: 'dot', size })),
    ])}
  </div>`,
};
