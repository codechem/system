import { html, nothing } from 'lit';
import './cc-accordion.js';

const sizes = ['large', 'medium', 'small'] as const;

type Args = {
  heading: string;
  subtitle: string;
  hideSubtitle: boolean;
  open: boolean;
  size: (typeof sizes)[number];
};

const accordion = (a: Args) =>
  html`<cc-accordion
    heading=${a.heading}
    subtitle=${a.subtitle || nothing}
    ?hide-subtitle=${a.hideSubtitle}
    ?open=${a.open}
    size=${a.size}
    >Accordion content goes here.</cc-accordion
  >`;

export default {
  title: 'Components/Accordion',
  component: 'cc-accordion',
  tags: ['autodocs'],
  args: {
    heading: 'Title',
    subtitle: 'Subtitle',
    hideSubtitle: false,
    open: false,
    size: 'medium',
  } satisfies Args,
  argTypes: {
    size: { control: 'inline-radio', options: sizes },
  },
  render: accordion,
};

export const Default = {};
export const Open = { args: { open: true } };
export const WithoutSubtitle = { args: { hideSubtitle: true } };
export const Small = { args: { size: 'small' } };

export const AllVariants = {
  parameters: { controls: { disable: true } },
  render: () => html`<div style="display: grid; gap: 24px; width: 640px">
    ${sizes.flatMap((size) =>
      [false, true].map((open) =>
        accordion({ heading: 'Title', subtitle: 'Subtitle', hideSubtitle: false, open, size }),
      ),
    )}
  </div>`,
};
