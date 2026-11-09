import { LitElement, css, html, nothing } from 'lit';
import { live } from 'lit/directives/live.js';
import { iconStyles } from '../shared/icon-styles.js';

/**
 * Checkbox. Mirrors the Figma "Checkbox" component set.
 *
 * @slot - Label text. Without one, set `aria-label`.
 * @fires change - When the user toggles the checkbox
 * @fires input - When the user toggles the checkbox
 */
export class CcCheckbox extends LitElement {
  /** @internal */
  static formAssociated = true;
  /** @internal */
  static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

  static properties = {
    checked: { type: Boolean },
    disabled: { type: Boolean, reflect: true },
    size: { type: String, reflect: true },
    name: { type: String, reflect: true },
    value: { type: String },
    ariaLabel: { attribute: 'aria-label' },
  };

  /** @internal */
  private internals = this.attachInternals();

  declare checked: boolean;
  declare disabled: boolean;
  declare size: 'medium' | 'large';
  declare name: string;
  declare value: string;
  declare ariaLabel: string | null;

  constructor() {
    super();
    this.checked = false;
    this.disabled = false;
    this.size = 'medium';
    this.value = 'on';
  }

  click() {
    this.shadowRoot?.querySelector('input')?.click();
  }

  /** @internal */
  formResetCallback() {
    this.checked = this.hasAttribute('checked');
  }

  updated() {
    this.internals.setFormValue(this.checked ? this.value : null);
  }

  /** @internal */
  private handleInput(event: Event) {
    this.checked = (event.target as HTMLInputElement).checked;
  }

  /** @internal */
  private handleChange() {
    this.dispatchEvent(new Event('change', { bubbles: true }));
  }

  static styles = [
    iconStyles,
    css`
    :host {
      display: inline-block;
      --_box: var(--cc-unit-4x);
      --_icon: var(--cc-icon-sm);
      --_color: var(--cc-border-medium-contrast);
      --_color-hover: var(--cc-border-low-contrast);
    }
    :host([size='large']) {
      --_box: var(--cc-unit-5x);
      --_icon: var(--cc-icon-md);
    }
    :host([hidden]) {
      display: none;
    }

    label {
      display: inline-flex;
      align-items: center;
      cursor: pointer;
      font-family: var(--cc-typeface-typeface);
      font-weight: var(--cc-font-weight-regular);
      font-size: var(--cc-text-size-label-m);
      line-height: var(--cc-line-height-label-m);
      font-variation-settings: 'YOPQ' 300;
      color: var(--cc-text-high-emphasis);
    }

    .box {
      position: relative;
      display: grid;
      place-items: center;
      flex: none;
      width: var(--_box);
      height: var(--_box);
    }

    input {
      position: absolute;
      inset: 0;
      margin: 0;
      opacity: 0;
      cursor: inherit;
    }

    .material-icon {
      position: relative;
      overflow: visible;
      clip-path: inset(-2px);
      font-size: var(--_icon);
      color: var(--_color);
    }
    input:checked + .material-icon {
      --_color: var(--cc-accent-light);
      --_color-hover: var(--cc-accent-dark);
    }
    label:hover .material-icon {
      color: var(--_color-hover);
    }
    label:active .box {
      opacity: 0.7;
    }

    input:focus-visible + .material-icon::after {
      content: '';
      position: absolute;
      inset: calc(1em / 24);
      border-radius: calc(2.44em / 24);
      outline: 2px solid var(--cc-border-focus);
    }

    :host([disabled]) label {
      cursor: not-allowed;
      opacity: 0.4;
    }
    :host([disabled]) label:hover .material-icon {
      color: var(--_color);
    }
    :host([disabled]) label:active .box {
      opacity: 1;
    }
  `,
  ];

  render() {
    return html`<label>
      <span class="box">
        <input
          type="checkbox"
          .checked=${live(this.checked)}
          ?disabled=${this.disabled}
          aria-label=${this.ariaLabel ?? nothing}
          @input=${this.handleInput}
          @change=${this.handleChange}
        />
        <span class="material-icon" aria-hidden="true">${this.checked ? 'check_box' : 'check_box_outline_blank'}</span>
      </span>
      <slot></slot>
    </label>`;
  }
}

if (!customElements.get('cc-checkbox')) {
  customElements.define('cc-checkbox', CcCheckbox);
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-checkbox': CcCheckbox;
  }
}
