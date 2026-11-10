import { html } from 'lit';
import './cc-radio-group.js';

type Args = {
  value: string;
  disabledOption: boolean;
};

const group = (a: Args) =>
  html`<cc-radio-group aria-label="Contact method" name="contact" .value=${a.value}>
    <cc-radio value="email">Email</cc-radio>
    <cc-radio value="phone">Phone</cc-radio>
    <cc-radio value="post" ?disabled=${a.disabledOption}>Post</cc-radio>
  </cc-radio-group>`;

export default {
  title: 'Components/Radio',
  component: 'cc-radio-group',
  subcomponents: { Radio: 'cc-radio' },
  tags: ['autodocs'],
  args: { value: 'email', disabledOption: false } satisfies Args,
  argTypes: {
    value: { control: 'inline-radio', options: ['', 'email', 'phone', 'post'] },
  },
  render: group,
};

export const Default = {};
export const NoneSelected = { args: { value: '' } };
export const WithDisabledOption = { args: { disabledOption: true } };

export const AllVariants = {
  parameters: { controls: { disable: true } },
  render: () => html`<div style="display: grid; grid-template-columns: repeat(2, auto); gap: 16px; width: max-content">
    ${[true, false].flatMap((checked) =>
      [false, true].map(
        (disabled) =>
          html`<cc-radio-group aria-label=${`${checked ? 'Selected' : 'Not selected'}${disabled ? ', disabled' : ''}`} value=${checked ? 'a' : ''}>
            <cc-radio value="a" ?disabled=${disabled} aria-label="Option"></cc-radio>
          </cc-radio-group>`,
      ),
    )}
  </div>`,
};
