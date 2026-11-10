import { html, nothing } from 'lit';
import '../button/cc-button.js';
import '../checkbox/cc-checkbox.js';
import './cc-dialog.js';
import type { CcDialog } from './cc-dialog.js';

type Args = {
  heading: string;
  description: string;
  open: boolean;
};

const items = ['List item', 'List item', 'List item', 'List item', 'List item'];
const description =
  'Before you end this process, select closing state. This will help us to have relevant information about this candidate if we need them in the future.';

const openDialog = (e: Event) => (((e.currentTarget as Element).nextElementSibling as CcDialog).open = true);
const closeDialog = (e: Event) => ((e.currentTarget as Element).closest<CcDialog>('cc-dialog')!.open = false);

// Each dialog sits next to a button that opens it. The dialog is modal, so on
// the docs page an open one would cover the page and block every other story.
const dialog = (a: Args, { body = true, actions = true } = {}) => html`<div>
  <cc-button @click=${openDialog}>Open dialog</cc-button>
  <cc-dialog heading=${a.heading || nothing} description=${a.description || nothing} ?open=${a.open}
    >${body
      ? html`<div style="display: grid; gap: 8px">
          ${items.map((label) => html`<cc-checkbox>${label}</cc-checkbox>`)}
        </div>`
      : nothing}${actions
      ? html`<cc-button slot="actions" variant="text" color="secondary" @click=${closeDialog}>Secondary</cc-button>
          <cc-button slot="actions" @click=${closeDialog}>Button</cc-button>`
      : nothing}</cc-dialog
  >
</div>`;

export default {
  title: 'Components/Dialog',
  component: 'cc-dialog',
  tags: ['autodocs'],
  args: {
    heading: 'Dialog title',
    description,
    open: false,
  } satisfies Args,
  argTypes: {
    open: { control: 'boolean' },
  },
  render: (a: Args) => dialog(a),
  // Opens the dialog when a story is viewed on its own. Play functions don't
  // run on the docs page, so there the dialogs stay closed until clicked.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = canvasElement.querySelector<CcDialog>('cc-dialog');
    if (el) el.open = true;
  },
};

export const Default = {};
export const WithoutDescription = { args: { description: '' } };

export const Confirmation = {
  args: { heading: 'Discard changes?', description: 'Your unsaved changes will be lost.' },
  render: (a: Args) => dialog(a, { body: false }),
};

export const AllVariants = {
  parameters: { controls: { disable: true } },
  render: () => dialog({ heading: 'Dialog title', description, open: false }),
};
