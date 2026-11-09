import { LitElement, css, html, nothing, svg } from 'lit';
import { live } from 'lit/directives/live.js';

const boxPath = 'M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z';
const checkedIcon = svg`<path fill-rule="evenodd" d="${boxPath}M10.71 16.29C10.32 16.68 9.69 16.68 9.3 16.29L5.71 12.7C5.32 12.31 5.32 11.68 5.71 11.29C6.1 10.9 6.73 10.9 7.12 11.29L10 14.17L16.88 7.29C17.27 6.9 17.9 6.9 18.29 7.29C18.68 7.68 18.68 8.31 18.29 8.7L10.71 16.29Z"/>`;
const uncheckedIcon = svg`<path fill-rule="evenodd" d="${boxPath}M18 19H6C5.45 19 5 18.55 5 18V6C5 5.45 5.45 5 6 5H18C18.55 5 19 5.45 19 6V18C19 18.55 18.55 19 18 19Z"/>`;

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

  static styles = css`
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

    svg {
      width: var(--_icon);
      height: var(--_icon);
      overflow: visible;
      fill: var(--_color);
    }
    input:checked + svg {
      --_color: var(--cc-accent-light);
      --_color-hover: var(--cc-accent-dark);
    }
    label:hover svg {
      fill: var(--_color-hover);
    }
    label:active .box {
      opacity: 0.7;
    }

    .ring {
      display: none;
      fill: none;
      stroke: var(--cc-border-focus);
      stroke-width: 2;
    }
    input:focus-visible + svg .ring {
      display: inline;
    }

    :host([disabled]) label {
      cursor: not-allowed;
      opacity: 0.4;
    }
    :host([disabled]) label:hover svg {
      fill: var(--_color);
    }
    :host([disabled]) label:active .box {
      opacity: 1;
    }
  `;

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
        <svg viewBox="0 0 24 24" aria-hidden="true">
          ${this.checked ? checkedIcon : uncheckedIcon}
          <rect class="ring" x="0" y="0" width="24" height="24" rx="3.44" vector-effect="non-scaling-stroke" />
        </svg>
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
