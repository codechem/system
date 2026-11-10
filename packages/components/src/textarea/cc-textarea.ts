import { LitElement, css, html, nothing } from 'lit';
import { live } from 'lit/directives/live.js';
import { iconStyles } from '../shared/icon-styles.js';
import '../shared/load-tokens.js';

/**
 * Multi-line text field. Mirrors the Figma "Text area" component set.
 *
 * @fires input - When the user edits the text
 * @fires change - When the user commits an edit (on blur)
 */
export class CcTextarea extends LitElement {
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
    required: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    hideInfoIcon: { type: Boolean, attribute: 'hide-info-icon', reflect: true },
    formDisabled: { state: true },
    ariaLabel: { attribute: 'aria-label' },
  };

  /** @internal */
  private internals = this.attachInternals();

  declare label: string;
  declare placeholder: string;
  declare value: string;
  declare name: string;
  declare supportingText: string;
  declare required: boolean;
  declare disabled: boolean;
  declare hideInfoIcon: boolean;
  /** @internal */
  declare formDisabled: boolean;
  declare ariaLabel: string | null;

  constructor() {
    super();
    this.label = '';
    this.placeholder = '';
    this.value = '';
    this.supportingText = '';
    this.required = false;
    this.disabled = false;
    this.hideInfoIcon = false;
    this.formDisabled = false;
    this.addEventListener('click', (event) => {
      if (this.disabled || this.formDisabled) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    });
  }

  click() {
    this.shadowRoot?.querySelector('textarea')?.click();
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
    const field = this.shadowRoot?.querySelector('textarea');
    if (this.required && !this.value && !this.disabled && !this.formDisabled && field) {
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
    this.value = (event.target as HTMLTextAreaElement).value;
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

      .label {
        display: flex;
        align-items: center;
        gap: var(--cc-gap-gap-0-5);
        font-weight: var(--cc-font-weight-semi-bold);
        font-size: var(--cc-text-size-label-l);
        line-height: var(--cc-line-height-label-l);
      }
      .asterisk {
        color: var(--cc-alert-error-main);
      }
      .info {
        font-size: var(--cc-icon-xs);
        color: var(--cc-text-low-emphasis);
      }

      .field {
        padding: var(--cc-padding-padding-1) var(--cc-padding-padding-1-5);
        border-radius: var(--cc-radius);
        background-color: var(--cc-surface-surface-2);
        background-image: linear-gradient(var(--_bg-hover), var(--_bg-hover));
        box-shadow: inset 0 0 0 2px var(--_stroke);
      }
      .root:not(.disabled) .field:hover {
        --_bg-hover: var(--cc-surface-surface-highlight-transparent);
      }
      .field:focus-within {
        --_stroke: var(--cc-border-focus);
      }

      textarea {
        display: block;
        box-sizing: border-box;
        inline-size: 100%;
        block-size: var(--cc-unit-10x);
        min-block-size: var(--cc-unit-4x);
        margin: 0;
        padding: 0;
        border: 0;
        outline: 0;
        background: none;
        resize: vertical;
        color: var(--cc-text-high-emphasis);
        font: inherit;
        font-weight: var(--cc-font-weight-regular);
        font-size: var(--cc-text-size-body-md);
        line-height: var(--cc-line-height-body-md);
      }
      textarea::placeholder {
        color: var(--cc-text-low-emphasis);
        opacity: 1;
      }

      .supporting {
        font-size: var(--cc-text-size-label-s);
        line-height: var(--cc-line-height-label-s);
      }

      .disabled,
      .disabled .field,
      .disabled textarea {
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
      ${this.label
        ? html`<label class="label" for="field">
            ${this.label}
            ${this.required ? html`<span class="asterisk" aria-hidden="true">*</span>` : nothing}
            ${this.hideInfoIcon ? nothing : html`<span class="material-icon info" aria-hidden="true">info</span>`}
          </label>`
        : nothing}
      <div class="field">
        <textarea
          id="field"
          .value=${live(this.value)}
          placeholder=${this.placeholder || nothing}
          ?required=${this.required}
          ?disabled=${disabled}
          aria-label=${this.ariaLabel ?? nothing}
          aria-describedby=${this.supportingText ? 'supporting' : nothing}
          @input=${this.handleInput}
          @change=${this.handleChange}
        ></textarea>
      </div>
      ${this.supportingText ? html`<div class="supporting" id="supporting">${this.supportingText}</div>` : nothing}
    </div>`;
  }
}

if (!customElements.get('cc-textarea')) {
  customElements.define('cc-textarea', CcTextarea);
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-textarea': CcTextarea;
  }
}
