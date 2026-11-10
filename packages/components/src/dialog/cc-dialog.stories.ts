import { html, nothing } from 'lit';
import '../button/cc-button.js';
import '../checkbox/cc-checkbox.js';
import './cc-dialog.js';

type Args = {
  heading: string;
  description: string;
  open: boolean;
};

const items = ['List item', 'List item', 'List item', 'List item', 'List item'];
const description =
  'Before you end this process, select closing state. This will help us to have relevant information about this candidate if we need them in the future.';

const dialog = (a: Args, { body = true, actions = true } = {}) => html`<cc-dialog
  heading=${a.heading || nothing}
  description=${a.description || nothing}
  ?open=${a.open}
  >${body
    ? html`<div style="display: grid; gap: 8px">
        ${items.map((label) => html`<cc-checkbox>${label}</cc-checkbox>`)}
      </div>`
    : nothing}${actions
    ? html`<cc-button slot="actions" variant="text" color="secondary">Secondary</cc-button>
        <cc-button slot="actions">Button</cc-button>`
    : nothing}</cc-dialog
  >`;

export default {
  title: 'Components/Dialog',
  component: 'cc-dialog',
  tags: ['autodocs'],
  args: {
    heading: 'Dialog title',
    description,
    open: true,
  } satisfies Args,
  argTypes: {
    open: { control: 'boolean' },
  },
  render: (a: Args) => dialog(a),
};

export const Default = {};
export const WithoutDescription = { args: { description: '' } };

export const Confirmation = {
  args: { heading: 'Discard changes?', description: 'Your unsaved changes will be lost.' },
  render: (a: Args) => dialog(a, { body: false }),
};

export const AllVariants = {
  parameters: { controls: { disable: true } },
  render: () => dialog({ heading: 'Dialog title', description, open: true }),
};
