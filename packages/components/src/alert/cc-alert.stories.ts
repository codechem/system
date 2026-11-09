import { html, nothing } from 'lit';
import './cc-alert.js';

type Args = {
  title: string;
  description: string;
  status: 'error' | 'warning' | 'info' | 'success';
  variant: 'subtle' | 'solid';
  dismissible: boolean;
  action: boolean;
};

const alert = (a: Args) => html`<cc-alert status=${a.status} variant=${a.variant} ?dismissible=${a.dismissible} style="width: 400px">
  <span slot="title">${a.title}</span>
  ${a.action ? html`<button slot="action">ACTION</button>` : nothing}
  ${a.description}
</cc-alert>`;

export default {
  title: 'Components/Alert',
  component: 'cc-alert',
  tags: ['autodocs'],
  args: {
    title: 'Title',
    description: 'Alert description goes here.',
    status: 'error',
    variant: 'subtle',
    dismissible: true,
    action: true,
  } satisfies Args,
  argTypes: {
    status: { control: 'inline-radio', options: ['error', 'warning', 'info', 'success'] },
    variant: { control: 'inline-radio', options: ['subtle', 'solid'] },
  },
  render: alert,
};

export const Subtle = {};
export const Solid = { args: { variant: 'solid' } };
export const WithoutAction = { args: { action: false } };
export const TitleOnly = { args: { description: '', action: false, dismissible: false } };

export const AllVariants = {
  parameters: { controls: { disable: true } },
  render: () => html`<div style="display: grid; grid-template-columns: repeat(4, 400px); gap: 24px">
    ${(['subtle', 'solid'] as const).flatMap((variant) =>
      [true, false].flatMap((action) =>
        (['error', 'warning', 'info', 'success'] as const).map((status) =>
          alert({ title: 'Title', description: 'Alert description goes here.', status, variant, dismissible: true, action }),
        ),
      ),
    )}
  </div>`,
};
