import { html } from 'lit';
import '../button/cc-button.js';
import './cc-tooltip.js';
import type { CcTooltip } from './cc-tooltip.js';

const placements = ['top', 'bottom', 'left', 'right'] as const;

type Args = {
  text: string;
  placement: (typeof placements)[number];
};

let count = 0;

const tooltip = (a: Args, id = `trigger-${++count}`) =>
  html`<div style="padding: 64px 160px">
    <cc-button id=${id}>Hover or focus me</cc-button>
    <cc-tooltip for=${id} placement=${a.placement}>${a.text}</cc-tooltip>
  </div>`;

export default {
  title: 'Components/Tooltip',
  component: 'cc-tooltip',
  tags: ['autodocs'],
  args: { text: 'Tooltip content', placement: 'top' } satisfies Args,
  argTypes: {
    placement: { control: 'inline-radio', options: placements },
  },
  render: (a: Args) => tooltip(a),
};

export const Default = {};
export const Bottom = { args: { placement: 'bottom' } };

export const AllVariants = {
  parameters: { controls: { disable: true } },
  render: () => {
    setTimeout(() => document.querySelectorAll<CcTooltip>('cc-tooltip[for^="all-variants-"]').forEach((t) => t.show()));
    return html`<div style="display: grid; grid-template-columns: repeat(2, auto); width: max-content">
      ${placements.map((placement) => tooltip({ text: 'Tooltip content', placement }, `all-variants-${placement}`))}
    </div>`;
  },
};
