import { LitElement, css, html, nothing } from 'lit';
import { live } from 'lit/directives/live.js';
import { iconStyles } from '../shared/icon-styles.js';
import '../shared/load-tokens.js';

/**
 * Text input. Mirrors the Figma "Text Input" component set.
 *
 * @slot leading - Icon before the text, inside the field
 * @slot chips - Input chips (`<cc-chip type="input">`) before the text, inside the field
 * @fires input - When the user edits the text
 * @fires change - When the user commits an edit (on blur)
 * @csspart input - The inner native input element
 */
export class CcTextInput extends LitElement {
  /** @internal */
  static formAssociated = true;
  /** @internal */
  static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

  static properties = {
    label: { type: String },
    placeholder: { type: String },
    value: { type: String },
    name: { type: String, reflect: true },
    supportingText: { type: String, attribute: 'supporting-text' },
    error: { type: String },
    required: { type: Boolean, reflect: true },
    optional: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    showInfoIcon: { type: Boolean, attribute: 'show-info-icon', reflect: true },
    hideTrailingIcon: { type: Boolean, attribute: 'hide-trailing-icon', reflect: true },
    formDisabled: { state: true },
    hasLeading: { state: true },
    hasChips: { state: true },
    ariaLabel: { attribute: 'aria-label' },
  };

  /** @internal */
  private internals = this.attachInternals();

  declare label: string;
  declare placeholder: string;
  declare value: string;
  declare name: string;
  declare supportingText: string;
  declare error: string;
  declare required: boolean;
  declare optional: boolean;
  declare disabled: boolean;
  declare showInfoIcon: boolean;
  declare hideTrailingIcon: boolean;
  /** @internal */
  declare formDisabled: boolean;
  /** @internal */
  declare hasLeading: boolean;
  /** @internal */
  declare hasChips: boolean;
  declare ariaLabel: string | null;

  constructor() {
    super();
    this.label = '';
    this.placeholder = '';
    this.value = '';
    this.supportingText = '';
    this.error = '';
    this.required = false;
    this.optional = false;
    this.disabled = false;
    this.showInfoIcon = false;
    this.hideTrailingIcon = false;
    this.formDisabled = false;
    this.hasLeading = false;
    this.hasChips = false;
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
  get labels() {
    return this.internals.labels;
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
    const field = this.shadowRoot?.querySelector('input');
    const disabled = this.disabled || this.formDisabled;
    if (field && !disabled && this.error) {
      this.internals.setValidity({ customError: true }, this.error, field);
    } else if (field && !disabled && this.required && !this.value) {
      this.internals.setValidity({ valueMissing: true }, field.validationMessage, field);
    } else {
      this.internals.setValidity({});
    }
    if (field) {
      const external = this.label || this.ariaLabel ? [] : [...this.internals.labels];
      field.ariaLabelledByElements = external.length ? (external as HTMLElement[]) : null;
    }
  }

  /** @internal */
  private handleInput(event: Event) {
    this.value = (event.target as HTMLInputElement).value;
  }

  /** @internal */
  private handleChange() {
    this.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /** @internal */
  private handleLeadingSlot(event: Event) {
    this.hasLeading = (event.target as HTMLSlotElement).assignedElements().length > 0;
  }

  /** @internal */
  private handleChipsSlot(event: Event) {
    this.hasChips = (event.target as HTMLSlotElement).assignedElements().length > 0;
  }

  static styles = [
    iconStyles,
    css`
      :host {
        display: block;
        inline-size: 320px;
        max-inline-size: 100%;
        --_bg-hover: transparent;
        --_stroke: transparent;
      }
      :host([hidden]) {
        display: none;
      }

      .root {
        display: flex;
        flex-direction: column;
        gap: var(--cc-gap-gap-1);
        font-family: var(--cc-typeface-typeface);
        font-variation-settings: 'YOPQ' 300;
        color: var(--cc-text-high-emphasis);
      }

      .upper {
        display: flex;
        flex-direction: column;
        gap: var(--cc-gap-gap-0-25);
      }

      .label {
        display: flex;
        align-items: center;
        gap: var(--cc-gap-gap-0-5);
        font-weight: var(--cc-font-weight-semi-bold);
        font-size: var(--cc-text-size-label-l);
        line-height: var(--cc-line-height-label-l);
      }
      .optional {
        font-weight: var(--cc-font-weight-regular);
        font-size: var(--cc-text-size-label-s);
        line-height: var(--cc-line-height-label-s);
        color: var(--cc-text-low-emphasis);
      }
      .asterisk {
        color: var(--cc-alert-error-main);
      }
      .info {
        font-size: var(--cc-icon-xs);
        color: var(--cc-text-low-emphasis);
      }

      .supporting {
        font-size: var(--cc-text-size-label-s);
        line-height: var(--cc-line-height-label-s);
        color: var(--cc-text-low-emphasis);
      }

      .field {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--cc-gap-gap-0-5);
        box-sizing: border-box;
        min-block-size: var(--cc-unit-5x);
        padding: var(--cc-padding-padding-1) var(--cc-padding-padding-1) var(--cc-padding-padding-1)
          var(--cc-padding-padding-1-5);
        border-radius: var(--cc-radius);
        background-color: var(--cc-surface-surface-2);
        background-image: linear-gradient(var(--_bg-hover), var(--_bg-hover));
        box-shadow: inset 0 0 0 2px var(--_stroke);
      }
      .field.has-leading {
        padding: var(--cc-padding-padding-1);
      }
      .field.has-chips {
        padding: var(--cc-padding-padding-0-5);
      }
      .root:not(.disabled) .field:hover {
        --_bg-hover: var(--cc-surface-surface-highlight-transparent);
      }
      .field.invalid {
        --_stroke: var(--cc-alert-error-main);
      }
      .field:focus-within {
        --_stroke: var(--cc-border-focus);
      }

      .leading,
      .chips {
        display: contents;
      }
      ::slotted([slot='leading']) {
        width: var(--cc-icon-md);
        height: var(--cc-icon-md);
        font-size: var(--cc-icon-md) !important;
        flex: none;
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
      }
      input::placeholder {
        color: var(--cc-text-low-emphasis);
        opacity: 1;
      }

      .trailing {
        font-size: var(--cc-icon-md);
        color: var(--cc-text-high-emphasis);
      }

      .error {
        font-size: var(--cc-text-size-label-s);
        line-height: var(--cc-line-height-label-s);
        color: var(--cc-alert-error-light);
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
    const describedBy = [this.supportingText ? 'supporting' : '', this.error ? 'error' : '']
      .filter(Boolean)
      .join(' ');
    const fieldClass = ['field', this.hasLeading ? 'has-leading' : '', this.hasChips ? 'has-chips' : '', this.error ? 'invalid' : '']
      .filter(Boolean)
      .join(' ');
    return html`<div class=${disabled ? 'root disabled' : 'root'}>
      ${this.label || this.supportingText
        ? html`<div class="upper">
            ${this.label
              ? html`<label class="label" for="field">
                  ${this.label}
                  ${this.optional ? html`<span class="optional">(optional)</span>` : nothing}
                  ${this.required ? html`<span class="asterisk" aria-hidden="true">*</span>` : nothing}
                  ${this.showInfoIcon ? html`<span class="material-icon info" aria-hidden="true">info</span>` : nothing}
                </label>`
              : nothing}
            ${this.supportingText ? html`<div class="supporting" id="supporting">${this.supportingText}</div>` : nothing}
          </div>`
        : nothing}
      <div class=${fieldClass}>
        <span class="leading" aria-hidden="true"
          ><slot name="leading" @slotchange=${this.handleLeadingSlot}></slot
        ></span>
        <span class="chips"><slot name="chips" @slotchange=${this.handleChipsSlot}></slot></span>
        <input
          id="field"
          part="input"
          type="text"
          .value=${live(this.value)}
          placeholder=${this.placeholder || nothing}
          ?required=${this.required}
          ?disabled=${disabled}
          aria-label=${this.ariaLabel ?? nothing}
          aria-describedby=${describedBy || nothing}
          aria-invalid=${this.error ? 'true' : nothing}
          @input=${this.handleInput}
          @change=${this.handleChange}
        />
        ${this.hideTrailingIcon ? nothing : html`<span class="material-icon trailing" aria-hidden="true">chevron_right</span>`}
      </div>
      ${this.error ? html`<div class="error" id="error">${this.error}</div>` : nothing}
    </div>`;
  }
}

if (!customElements.get('cc-text-input')) {
  customElements.define('cc-text-input', CcTextInput);
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-text-input': CcTextInput;
  }
}
