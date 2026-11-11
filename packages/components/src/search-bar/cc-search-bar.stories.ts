import { html, nothing } from 'lit';
import './cc-search-bar.js';

type Args = {
  placeholder: string;
  value: string;
  disabled: boolean;
  hideTrailingIcon: boolean;
  leadingIcon: boolean;
};

const searchBar = (a: Args) =>
  html`<cc-search-bar
    aria-label="Search"
    placeholder=${a.placeholder}
    value=${a.value}
    ?disabled=${a.disabled}
    ?hide-trailing-icon=${a.hideTrailingIcon}
    >${a.leadingIcon
      ? html`<span slot="leading" class="material-icons-round" aria-hidden="true">add_box</span>`
      : nothing}</cc-search-bar
  >`;

const defaults: Args = {
  placeholder: 'Search',
  value: '',
  disabled: false,
  hideTrailingIcon: false,
  leadingIcon: false,
};

export default {
  title: 'Components/Search bar',
  component: 'cc-search-bar',
  tags: ['autodocs'],
  args: defaults,
  render: searchBar,
};

export const Default = {};
export const WithValue = { args: { value: 'Input text' } };
export const WithLeadingIcon = { args: { leadingIcon: true } };
export const HiddenTrailingIcon = { args: { hideTrailingIcon: true } };
export const Disabled = { args: { disabled: true } };

export const AllVariants = {
  parameters: { controls: { disable: true } },
  render: () => html`<div style="display: grid; gap: 24px; width: max-content">
    ${searchBar({ ...defaults })}
    ${searchBar({ ...defaults, value: 'Input text' })}
    ${searchBar({ ...defaults, leadingIcon: true })}
    ${searchBar({ ...defaults, hideTrailingIcon: true })}
    ${searchBar({ ...defaults, disabled: true })}
  </div>`,
};
