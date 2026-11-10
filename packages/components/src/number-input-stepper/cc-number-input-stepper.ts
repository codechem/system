import { LitElement, css, html, nothing } from 'lit';
import { live } from 'lit/directives/live.js';
import { iconStyles } from '../shared/icon-styles.js';
import '../shared/load-tokens.js';

/**
 * Number input stepper. Mirrors the Figma "Number input stepper" component set.
 *
 * @slot leading - Icon before the number, inside the field
 * @fires input - When the user edits the number or steps it
 * @fires change - When the user commits an edit (on blur) or steps it
 * @csspart input - The inner native number input
 * @csspart increase - The up arrow button
 * @csspart decrease - The down arrow button
 */
export class CcNumberInputStepper extends LitElement {
  /** @internal */
  static formAssociated = true;
  /** @internal */
  static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

  static properties = {
    value: { type: String },
    name: { type: String, reflect: true },
    min: { type: Number },
    max: { type: Number },
    step: { type: Number },
    placeholder: { type: String },
    required: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    formDisabled: { state: true },
    hasLeading: { state: true },
    ariaLabel: { attribute: 'aria-label' },
  };

  /** @internal */
  private internals = this.attachInternals();

  declare value: string;
  declare name: string;
  declare min: number | undefined;
  declare max: number | undefined;
  declare step: number | undefined;
  declare placeholder: string;
  declare required: boolean;
  declare disabled: boolean;
  /** @internal */
  declare formDisabled: boolean;
  /** @internal */
  declare hasLeading: boolean;
  declare ariaLabel: string | null;

  constructor() {
    super();
    this.value = '';
    this.placeholder = '';
    this.required = false;
    this.disabled = false;
    this.formDisabled = false;
    this.hasLeading = false;
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

  get validity() {
    return this.internals.validity;
  }
  checkValidity() {
    return this.internals.checkValidity();
  }
  reportValidity() {
    return this.internals.reportValidity();
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

  updated() {
    this.internals.setFormValue(this.value);
    const field = this.shadowRoot?.querySelector('input');
    if (field && !(this.disabled || this.formDisabled)) {
      this.internals.setValidity(field.validity, field.validationMessage, field);
    } else {
      this.internals.setValidity({});
    }
    if (field) {
      const external = this.ariaLabel ? [] : [...this.internals.labels];
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
  private stepBy(direction: 'up' | 'down') {
    const field = this.shadowRoot?.querySelector('input');
    if (!field) return;
    if (direction === 'up') field.stepUp();
    else field.stepDown();
    this.value = field.value;
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    this.dispatchEvent(new Event('change', { bubbles: true }));
  }

  static styles = [
    iconStyles,
    css`
      :host {
        display: inline-block;
        inline-size: 352px;
        max-inline-size: 100%;
      }
      :host([hidden]) {
        display: none;
      }

      .root {
        display: flex;
        block-size: var(--cc-unit-5x);
        --_stroke: transparent;
        --_step-bg: var(--cc-surface-surface-2);
        font-family: var(--cc-typeface-typeface);
        font-variation-settings: 'YOPQ' 300;
        color: var(--cc-text-high-emphasis);
      }
      .root:focus-within {
        --_stroke: var(--cc-border-focus);
      }
      .root:not(.disabled):hover {
        --_step-bg: var(--cc-surface-surface-highlight);
      }
      .root:not(.disabled):active {
        opacity: 0.7;
      }
      .root.disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .field {
        display: flex;
        flex: 1 1 0;
        align-items: center;
        gap: var(--cc-gap-gap-0-5);
        min-inline-size: 0;
        box-sizing: border-box;
        padding: var(--cc-padding-padding-1) var(--cc-padding-padding-1) var(--cc-padding-padding-1)
          var(--cc-padding-padding-1-5);
        border-radius: var(--cc-radius) 0 0 var(--cc-radius);
        background: var(--cc-surface-surface-2);
        box-shadow:
          inset 0 var(--cc-unit-0-25x) 0 var(--_stroke),
          inset var(--cc-unit-0-25x) 0 0 var(--_stroke),
          inset 0 calc(var(--cc-unit-0-25x) * -1) 0 var(--_stroke);
      }
      .field.has-leading {
        padding: var(--cc-padding-padding-1);
      }
      .leading {
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
        min-inline-size: 0;
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        border: 0;
        outline: 0;
        background: none;
        appearance: textfield;
        color: var(--cc-text-high-emphasis);
        font: inherit;
        font-weight: var(--cc-font-weight-regular);
        font-size: var(--cc-text-size-body-md);
        line-height: var(--cc-line-height-body-md-tight);
      }
      input::-webkit-inner-spin-button,
      input::-webkit-outer-spin-button {
        appearance: none;
        margin: 0;
      }
      input::placeholder {
        color: var(--cc-text-low-emphasis);
        opacity: 1;
      }

      .stepper {
        display: flex;
        flex: none;
        flex-direction: column;
        inline-size: var(--cc-unit-4x);
        box-sizing: border-box;
        border-radius: 0 var(--cc-radius) var(--cc-radius) 0;
        background: var(--_step-bg);
        box-shadow:
          inset 0 var(--cc-unit-0-25x) 0 var(--_stroke),
          inset calc(var(--cc-unit-0-25x) * -1) 0 0 var(--_stroke),
          inset 0 calc(var(--cc-unit-0-25x) * -1) 0 var(--_stroke);
      }
      .step {
        display: grid;
        flex: 1 1 0;
        place-items: center;
        margin: 0;
        padding: 0;
        border: 0;
        background: none;
        color: var(--cc-text-high-emphasis);
        cursor: pointer;
      }
      .step .material-icon {
        font-size: var(--cc-icon-sm);
      }
      .step:focus-visible {
        outline: var(--cc-unit-0-25x) solid var(--cc-border-focus);
        outline-offset: calc(var(--cc-unit-0-25x) * -1);
      }
      .step:disabled,
      .disabled input,
      .disabled .step {
        cursor: not-allowed;
      }
    `,
  ];

  render() {
    const disabled = this.disabled || this.formDisabled;
    return html`<div class=${disabled ? 'root disabled' : 'root'}>
      <div class=${this.hasLeading ? 'field has-leading' : 'field'}>
        <span class="leading" aria-hidden="true"
          ><slot name="leading" @slotchange=${this.handleLeadingSlot}></slot
        ></span>
        <input
          part="input"
          type="number"
          .value=${live(this.value)}
          min=${this.min ?? nothing}
          max=${this.max ?? nothing}
          step=${this.step ?? nothing}
          placeholder=${this.placeholder || nothing}
          ?required=${this.required}
          ?disabled=${disabled}
          aria-label=${this.ariaLabel ?? nothing}
          @input=${this.handleInput}
          @change=${this.handleChange}
        />
      </div>
      <div class="stepper">
        <button
          part="increase"
          type="button"
          class="step"
          tabindex="-1"
          aria-label="Increase"
          ?disabled=${disabled}
          @mousedown=${(event: Event) => event.preventDefault()}
          @click=${() => this.stepBy('up')}
        >
          <span class="material-icon" aria-hidden="true">arrow_drop_up</span>
        </button>
        <button
          part="decrease"
          type="button"
          class="step"
          tabindex="-1"
          aria-label="Decrease"
          ?disabled=${disabled}
          @mousedown=${(event: Event) => event.preventDefault()}
          @click=${() => this.stepBy('down')}
        >
          <span class="material-icon" aria-hidden="true">arrow_drop_down</span>
        </button>
      </div>
    </div>`;
  }
}

if (!customElements.get('cc-number-input-stepper')) {
  customElements.define('cc-number-input-stepper', CcNumberInputStepper);
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-number-input-stepper': CcNumberInputStepper;
  }
}
