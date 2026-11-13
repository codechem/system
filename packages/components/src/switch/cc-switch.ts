import { LitElement, css, html, nothing } from 'lit';
import { live } from 'lit/directives/live.js';
import '../shared/load-tokens.js';

/**
 * Switch. Mirrors the Figma "Switch" component set.
 *
 * @slot - Label text. Without one, set `aria-label`.
 * @fires change - When the user toggles the switch
 * @fires input - When the user toggles the switch
 * @csspart switch - The inner native checkbox input
 */
export class CcSwitch extends LitElement {
  /** @internal */
  static formAssociated = true;
  /** @internal */
  static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

  static properties = {
    checked: { type: Boolean },
    disabled: { type: Boolean, reflect: true },
    formDisabled: { state: true },
    size: { type: String, reflect: true },
    name: { type: String, reflect: true },
    value: { type: String },
    ariaLabel: { attribute: 'aria-label' },
  };

  /** @internal */
  private internals = this.attachInternals();

  declare checked: boolean;
  declare disabled: boolean;
  /** @internal */
  declare formDisabled: boolean;
  declare size: 'small' | 'large';
  declare name: string;
  declare value: string;
  declare ariaLabel: string | null;

  constructor() {
    super();
    this.checked = false;
    this.disabled = false;
    this.formDisabled = false;
    this.size = 'small';
    this.value = 'on';
    this.addEventListener('click', this.handleHostClick);
  }

  click() {
    this.shadowRoot?.querySelector('input')?.click();
  }

  /** @internal */
  private handleHostClick = (event: MouseEvent) => {
    if (!(this.disabled || this.formDisabled)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  };

  /** @internal */
  formResetCallback() {
    this.checked = this.hasAttribute('checked');
  }

  /** @internal */
  formDisabledCallback(disabled: boolean) {
    this.formDisabled = disabled;
    const input = this.shadowRoot?.querySelector('input');
    if (input) input.disabled = disabled;
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
      --_w: 26px;
      --_h: var(--cc-unit-2x);
      --_inset-x: var(--cc-unit-0-25x);
      --_inset-y: var(--cc-unit-0-25x);
      --_thumb-w: var(--cc-unit-1-5x);
      --_thumb-h: var(--cc-unit-1-5x);
    }
    :host([size='large']) {
      --_w: var(--cc-unit-5x);
      --_h: var(--cc-unit-3x);
      --_inset-x: 2.35px;
      --_inset-y: 2.4px;
      --_thumb-w: 18.82px;
      --_thumb-h: 19.2px;
    }
    :host([hidden]) {
      display: none;
    }

    label {
      display: inline-flex;
      align-items: center;
      gap: var(--cc-gap-gap-1);
      cursor: pointer;
      font-family: var(--cc-typeface-typeface);
      font-weight: var(--cc-font-weight-regular);
      font-size: var(--cc-text-size-label-m);
      line-height: var(--cc-line-height-label-m);
      font-variation-settings: 'YOPQ' 300;
      color: var(--cc-text-high-emphasis);
    }

    .switch {
      position: relative;
      display: inline-flex;
      flex: none;
    }

    input {
      position: absolute;
      inset: 0;
      margin: 0;
      opacity: 0;
      cursor: inherit;
    }

    .track {
      display: flex;
      align-items: center;
      box-sizing: border-box;
      width: var(--_w);
      height: var(--_h);
      padding: var(--_inset-y) var(--_inset-x);
      border-radius: var(--cc-round);
      background: var(--cc-surface-surface-highlight);
    }

    .thumb {
      flex: none;
      width: var(--_thumb-w);
      height: var(--_thumb-h);
      border-radius: var(--cc-round);
      background: var(--cc-text-low-emphasis);
    }

    input:checked + .track {
      justify-content: flex-end;
      background: var(--cc-accent-main);
    }
    input:checked + .track .thumb {
      background: var(--cc-text-high-emphasis);
    }

    input:focus-visible + .track {
      outline: 2px solid var(--cc-border-focus);
      outline-offset: 2px;
    }

    :host(:not(:disabled)) label:hover .track {
      background: var(--cc-surface-surface-2);
    }
    :host(:not(:disabled)) label:hover input:checked + .track,
    :host(:not(:disabled)) label:active input:checked + .track {
      background: var(--cc-accent-dark);
    }
    :host(:not(:disabled)) label:active .track {
      opacity: 0.7;
    }

    :host(:disabled) label {
      cursor: not-allowed;
      opacity: 0.4;
    }
  `;

  render() {
    return html`<label>
      <span class="switch">
        <input
          part="switch"
          type="checkbox"
          role="switch"
          .checked=${live(this.checked)}
          ?disabled=${this.disabled || this.formDisabled}
          aria-label=${this.ariaLabel ?? nothing}
          @input=${this.handleInput}
          @change=${this.handleChange}
        />
        <span class="track"><span class="thumb"></span></span>
      </span>
      <slot></slot>
    </label>`;
  }
}

if (!customElements.get('cc-switch')) {
  customElements.define('cc-switch', CcSwitch);
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-switch': CcSwitch;
  }
}
