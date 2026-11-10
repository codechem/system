import { LitElement, css, html } from 'lit';
import '../shared/load-tokens.js';

/**
 * Button. Mirrors the Figma "Button" component set.
 *
 * @slot - Label text
 * @slot leading - Icon before the label
 * @slot trailing - Icon after the label
 * @csspart button - The inner native button element
 */
export class CcButton extends LitElement {
  /** @internal */
  static formAssociated = true;

  static properties = {
    variant: { type: String, reflect: true },
    color: { type: String, reflect: true },
    size: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    type: { type: String, reflect: true },
  };

  /** @internal */
  private internals = this.attachInternals();

  declare variant: 'filled' | 'outlined' | 'text';
  declare color: 'primary' | 'secondary' | 'destructive';
  declare size: 'small' | 'medium' | 'large';
  declare disabled: boolean;
  declare type: 'button' | 'submit' | 'reset';

  constructor() {
    super();
    this.variant = 'filled';
    this.color = 'primary';
    this.size = 'medium';
    this.disabled = false;
    this.type = 'button';
    this.addEventListener('click', this.handleHostClick);
  }

  /** @internal */
  private handleHostClick = (event: MouseEvent) => {
    if (this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    const form = this.internals.form;
    if (!form) return;
    if (this.type === 'submit') form.requestSubmit();
    if (this.type === 'reset') form.reset();
  };

  static styles = css`
    :host {
      display: inline-block;
      --_bg: var(--cc-accent-main);
      --_bg-hover: var(--cc-accent-dark);
      --_fg: var(--cc-text-high-emphasis);
      --_tone: var(--cc-accent-light);
      --_stroke: var(--cc-accent-light);
      --_tint: color-mix(in srgb, var(--cc-accent-transparent) 60%, transparent); 
    }
    :host([color='destructive']) {
      --_bg: var(--cc-alert-error-main);
      --_bg-hover: var(--cc-alert-error-dark);
      --_tone: var(--cc-alert-error-light);
      --_stroke: var(--cc-alert-error-light);
      --_tint: color-mix(in srgb, var(--cc-alert-error-transparent) 60%, transparent);
    }
    :host([color='secondary']) {
      --_bg: var(--cc-surface-surface-highlight);
      --_bg-hover: var(--cc-surface-surface-2);
      --_tone: var(--cc-text-medium-emphasis);
      --_stroke: var(--cc-border-medium-contrast);
      --_tint: color-mix(in srgb, var(--cc-surface-surface-highlight-transparent) 50%, transparent);
    }

    :host {
      --_py: var(--cc-padding-padding-1);
      --_px: var(--cc-padding-padding-2);
      --_gap: var(--cc-gap-gap-1);
      --_icon: var(--cc-icon-md);
      --_font-size: var(--cc-text-size-label-l);
      --_line-height: var(--cc-line-height-label-l);
    }
    :host([size='small']) {
      --_py: var(--cc-padding-padding-0-5);
      --_px: var(--cc-padding-padding-1-5);
      --_gap: var(--cc-gap-gap-0-5);
      --_icon: var(--cc-icon-sm);
      --_font-size: var(--cc-text-size-label-m);
      --_line-height: var(--cc-line-height-label-m);
    }
    :host([size='large']) {
      --_py: var(--cc-padding-padding-1-5);
      --_px: var(--cc-padding-padding-2-5);
      --_gap: var(--cc-gap-gap-1-5);
    }

    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--_gap);
      padding: var(--_py) var(--_px);
      border: none;
      border-radius: var(--cc-radius);
      font-family: var(--cc-typeface-typeface);
      font-weight: var(--cc-font-weight-semi-bold);
      font-size: var(--_font-size);
      line-height: var(--_line-height);
      font-variation-settings: 'YOPQ' 300;
      white-space: nowrap;
      cursor: pointer;
      background: var(--_bg);
      color: var(--_fg);
    }
    button:hover {
      background: var(--_bg-hover);
    }

    :host([variant='outlined']) button,
    :host([variant='text']) button {
      background: transparent;
      color: var(--_tone);
    }
    :host([variant='outlined']) button {
      box-shadow: inset 0 0 0 2px var(--_stroke);
    }
    :host([variant='outlined']) button:hover,
    :host([variant='text']) button:hover {
      background: var(--_tint);
    }

    button:active {
      opacity: 0.7;
    }
    button:focus-visible {
      outline: 2px solid var(--cc-border-focus);
      outline-offset: 4px;
    }
    button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      background: var(--_bg);
    }
    :host([variant='outlined']) button:disabled,
    :host([variant='text']) button:disabled {
      background: transparent;
    }

    ::slotted([slot='leading']),
    ::slotted([slot='trailing']) {
      width: var(--_icon);
      height: var(--_icon);
      font-size: var(--_icon) !important;
      flex: none;
    }

    ::slotted([slot='leading']) {
      margin-inline-start: calc(var(--cc-padding-padding-0-5) * -1);
    }
    ::slotted([slot='trailing']) {
      margin-inline-end: calc(var(--cc-padding-padding-0-5) * -1);
    }
  `;

  render() {
    return html`<button part="button" ?disabled=${this.disabled}>
      <slot name="leading"></slot><slot></slot><slot name="trailing"></slot>
    </button>`;
  }
}

if (!customElements.get('cc-button')) {
  customElements.define('cc-button', CcButton);
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-button': CcButton;
  }
}
