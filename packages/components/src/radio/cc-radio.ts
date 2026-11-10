import { LitElement, css, html } from 'lit';
import { iconStyles } from '../shared/icon-styles.js';
import '../shared/load-tokens.js';

/**
 * Radio button. Mirrors the Figma "Radio button" component set. Place it inside `<cc-radio-group>`.
 *
 * @slot - Label text. Without one, set `aria-label`.
 */
export class CcRadio extends LitElement {
  static properties = {
    value: { type: String },
    checked: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
  };

  declare value: string;
  declare checked: boolean;
  declare disabled: boolean;

  constructor() {
    super();
    this.value = 'on';
    this.checked = false;
    this.disabled = false;
    this.addEventListener('click', this.handleHostClick);
  }

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'radio');
  }

  updated() {
    this.setAttribute('aria-checked', String(this.checked));
    if (this.disabled) this.setAttribute('aria-disabled', 'true');
    else this.removeAttribute('aria-disabled');
  }

  /** @internal */
  private handleHostClick = (event: MouseEvent) => {
    if (!this.disabled) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  };

  static styles = [
    iconStyles,
    css`
      :host {
        display: inline-flex;
        align-items: center;
        cursor: pointer;
        outline: none;
        font-family: var(--cc-typeface-typeface);
        font-weight: var(--cc-font-weight-regular);
        font-size: var(--cc-text-size-label-m);
        line-height: var(--cc-line-height-label-m);
        font-variation-settings: 'YOPQ' 300;
        color: var(--cc-text-high-emphasis);
        --_color: var(--cc-border-medium-contrast);
        --_color-hover: var(--cc-border-low-contrast);
      }
      :host([checked]) {
        --_color: var(--cc-accent-light);
        --_color-hover: var(--cc-accent-main);
      }
      :host([hidden]) {
        display: none;
      }

      .box {
        display: grid;
        place-items: center;
        flex: none;
        width: var(--cc-unit-5x);
        height: var(--cc-unit-5x);
      }
      .material-icon {
        position: relative;
        overflow: visible;
        clip-path: inset(-2px);
        font-size: var(--cc-icon-md);
        color: var(--_color);
      }
      :host(:hover) .material-icon {
        color: var(--_color-hover);
      }
      :host(:active) .box {
        opacity: 0.7;
      }
      :host(:focus-visible) .material-icon::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 50%;
        outline: 2px solid var(--cc-border-focus);
      }

      :host([disabled]) {
        cursor: not-allowed;
        opacity: 0.4;
        --_color: var(--cc-border-medium-contrast);
        --_color-hover: var(--cc-border-medium-contrast);
      }
      :host([disabled]:active) .box {
        opacity: 1;
      }
    `,
  ];

  render() {
    return html`<span class="box">
        <span class="material-icon" aria-hidden="true">${this.checked ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
      </span>
      <slot></slot>`;
  }
}

if (!customElements.get('cc-radio')) {
  customElements.define('cc-radio', CcRadio);
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-radio': CcRadio;
  }
}
