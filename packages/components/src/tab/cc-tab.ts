import { LitElement, css, html, nothing } from 'lit';
import '../shared/load-tokens.js';

/**
 * Tab. Mirrors the Figma "Tab" component set. Place it inside an element with `role="tablist"`.
 *
 * @slot - Label text
 * @csspart tab - The inner native button element
 */
export class CcTab extends LitElement {
  /** @internal */
  static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

  static properties = {
    type: { type: String, reflect: true },
    selected: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    ariaLabel: { attribute: 'aria-label' },
  };

  declare type: 'enclosed' | 'line';
  declare selected: boolean;
  declare disabled: boolean;
  declare ariaLabel: string | null;

  constructor() {
    super();
    this.type = 'enclosed';
    this.selected = false;
    this.disabled = false;
    this.addEventListener('click', this.handleHostClick);
  }

  click() {
    this.shadowRoot?.querySelector('button')?.click();
  }

  /** @internal */
  private handleHostClick = (event: MouseEvent) => {
    if (!this.disabled) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  };

  static styles = css`
    :host {
      display: inline-block;
      --_stroke: var(--cc-border-low-contrast);
      --_fg: var(--cc-text-low-emphasis);
      --_edge: inset 0 -2px 0 var(--_stroke);
    }
    :host([selected]) {
      --_fg: var(--cc-accent-light);
    }
    :host([type='enclosed'][selected]) {
      --_edge:
        inset 2px 0 0 var(--_stroke), inset -2px 0 0 var(--_stroke), inset 0 2px 0 var(--_stroke);
    }
    :host([type='line'][selected]) {
      --_stroke: var(--cc-accent-light);
      --_edge: inset 0 -3px 0 var(--_stroke);
    }
    :host([hidden]) {
      display: none;
    }

    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      padding: var(--cc-padding-padding-1) var(--cc-padding-padding-3);
      border: none;
      border-radius: var(--cc-radius) var(--cc-radius) 0 0;
      background: transparent;
      color: var(--_fg);
      box-shadow: var(--_edge);
      font-family: var(--cc-typeface-typeface);
      font-weight: var(--cc-font-weight-medium);
      font-size: var(--cc-text-size-body-md);
      line-height: var(--cc-line-height-body-md);
      font-variation-settings: 'YOPQ' 300;
      white-space: nowrap;
      cursor: pointer;
    }
    button:hover:not(:disabled) {
      background: var(--cc-surface-surface-2);
    }
    button:active:not(:disabled) {
      opacity: 0.7;
    }
    button:focus-visible {
      outline: 2px solid var(--cc-border-focus);
      outline-offset: var(--cc-unit-0-5x);
    }
    button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  `;

  render() {
    return html`<button
      part="tab"
      type="button"
      role="tab"
      aria-selected=${this.selected ? 'true' : 'false'}
      ?disabled=${this.disabled}
      aria-label=${this.ariaLabel ?? nothing}
    >
      <slot></slot>
    </button>`;
  }
}

if (!customElements.get('cc-tab')) {
  customElements.define('cc-tab', CcTab);
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-tab': CcTab;
  }
}
