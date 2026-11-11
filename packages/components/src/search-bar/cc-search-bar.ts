import { LitElement, css, html, nothing } from 'lit';
import { live } from 'lit/directives/live.js';
import { iconStyles } from '../shared/icon-styles.js';
import '../shared/load-tokens.js';

/**
 * Search bar. Mirrors the Figma "Search bar" component set.
 *
 * @slot leading - Icon before the text, inside the field
 * @slot trailing - Icon after the text, replaces the default search icon
 * @fires input - When the user edits the text
 * @fires change - When the user commits an edit (on blur)
 * @csspart input - The inner native search input element
 */
export class CcSearchBar extends LitElement {
  /** @internal */
  static formAssociated = true;
  /** @internal */
  static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

  static properties = {
    placeholder: { type: String },
    value: { type: String },
    name: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    hideTrailingIcon: { type: Boolean, attribute: 'hide-trailing-icon', reflect: true },
    formDisabled: { state: true },
    ariaLabel: { attribute: 'aria-label' },
  };

  /** @internal */
  private internals = this.attachInternals();

  declare placeholder: string;
  declare value: string;
  declare name: string;
  declare disabled: boolean;
  declare hideTrailingIcon: boolean;
  /** @internal */
  declare formDisabled: boolean;
  declare ariaLabel: string | null;

  constructor() {
    super();
    this.placeholder = 'Search';
    this.value = '';
    this.disabled = false;
    this.hideTrailingIcon = false;
    this.formDisabled = false;
    this.addEventListener('click', (event) => {
      if (this.disabled || this.formDisabled) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    });
  }

  click() {
    this.shadowRoot?.querySelector('input')?.click();
  }

  /** @internal */
  formResetCallback() {
    this.value = this.getAttribute('value') ?? '';
  }

  /** @internal */
  formDisabledCallback(disabled: boolean) {
    this.formDisabled = disabled;
  }

  /** @internal */
  formStateRestoreCallback(state: string | File | FormData | null) {
    this.value = typeof state === 'string' ? state : '';
  }

  get form() {
    return this.internals.form;
  }
  get validity() {
    return this.internals.validity;
  }
  get validationMessage() {
    return this.internals.validationMessage;
  }
  get willValidate() {
    return this.internals.willValidate;
  }
  checkValidity() {
    return this.internals.checkValidity();
  }
  reportValidity() {
    return this.internals.reportValidity();
  }

  updated() {
    this.internals.setFormValue(this.value);
  }

  /** @internal */
  private handleInput(event: Event) {
    this.value = (event.target as HTMLInputElement).value;
  }

  /** @internal */
  private handleChange() {
    this.dispatchEvent(new Event('change', { bubbles: true }));
  }

  static styles = [
    iconStyles,
    css`
      :host {
        display: block;
        inline-size: 320px;
        max-inline-size: 100%;
        --_bg-hover: var(--cc-surface-surface-highlight);
        --_stroke: transparent;
      }
      :host([hidden]) {
        display: none;
      }

      .root {
        font-family: var(--cc-typeface-typeface);
        font-variation-settings: 'YOPQ' 300;
        color: var(--cc-text-high-emphasis);
      }

      .field {
        display: flex;
        align-items: center;
        gap: var(--cc-gap-gap-0-5);
        box-sizing: border-box;
        min-block-size: var(--cc-unit-5x);
        padding: var(--cc-padding-padding-1) var(--cc-padding-padding-1) var(--cc-padding-padding-1)
          var(--cc-padding-padding-1-5);
        border-radius: var(--cc-radius);
        background-color: var(--cc-surface-surface-2);
        box-shadow: inset 0 0 0 2px var(--_stroke);
      }
      .root:not(.disabled) .field:hover {
        background-color: var(--_bg-hover);
      }
      .field:focus-within {
        --_stroke: var(--cc-border-focus);
      }

      .leading {
        display: contents;
      }
      ::slotted([slot='leading']),
      ::slotted([slot='trailing']) {
        width: var(--cc-icon-md);
        height: var(--cc-icon-md);
        font-size: var(--cc-icon-md) !important;
        flex: none;
      }
      ::slotted([slot='leading']) {
        color: var(--cc-text-low-emphasis);
      }

      input {
        flex: 1 1 0;
        min-width: 4rem;
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        border: 0;
        outline: 0;
        background: none;
        color: var(--cc-text-high-emphasis);
        font: inherit;
        font-weight: var(--cc-font-weight-regular);
        font-size: var(--cc-text-size-body-md);
        line-height: var(--cc-line-height-body-md-tight);
        -webkit-appearance: none;
        appearance: none;
      }
      input::-webkit-search-cancel-button {
        -webkit-appearance: none;
        display: none;
      }
      input::placeholder {
        color: var(--cc-text-low-emphasis);
        opacity: 1;
      }

      .trailing {
        display: flex;
        flex: none;
        width: var(--cc-icon-md);
        height: var(--cc-icon-md);
        font-size: var(--cc-icon-md);
        color: var(--cc-text-low-emphasis);
      }

      .root:not(.disabled):active {
        opacity: 0.7;
      }
      .disabled,
      .disabled .field,
      .disabled input {
        cursor: not-allowed;
      }
      .disabled {
        opacity: 0.4;
      }
    `,
  ];

  render() {
    const disabled = this.disabled || this.formDisabled;
    return html`<div class=${disabled ? 'root disabled' : 'root'}>
      <div class="field">
        <span class="leading" aria-hidden="true"><slot name="leading"></slot></span>
        <input
          part="input"
          type="search"
          .value=${live(this.value)}
          placeholder=${this.placeholder || nothing}
          ?disabled=${disabled}
          aria-label=${this.ariaLabel ?? nothing}
          @input=${this.handleInput}
          @change=${this.handleChange}
        />
        ${this.hideTrailingIcon
          ? nothing
          : html`<span class="trailing" aria-hidden="true"
              ><slot name="trailing"><span class="material-icon">search</span></slot></span
            >`}
      </div>
    </div>`;
  }
}

if (!customElements.get('cc-search-bar')) {
  customElements.define('cc-search-bar', CcSearchBar);
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-search-bar': CcSearchBar;
  }
}
