import { LitElement, css, html, nothing } from 'lit';
import { iconStyles } from '../shared/icon-styles.js';
import '../shared/load-tokens.js';

/**
 * Link. Mirrors the Figma "Link" component set.
 *
 * @slot - Label text
 * @slot leading - Icon before the label
 * @csspart link - The inner native anchor element
 */
export class CcLink extends LitElement {
  /** @internal */
  static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

  static properties = {
    href: { type: String },
    target: { type: String },
    rel: { type: String },
    size: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    hideIcon: { type: Boolean, attribute: 'hide-icon', reflect: true },
    ariaLabel: { attribute: 'aria-label' },
  };

  declare href: string | undefined;
  declare target: string | undefined;
  declare rel: string | undefined;
  declare size: 'small' | 'medium' | 'large' | 'extra-large';
  declare disabled: boolean;
  declare hideIcon: boolean;
  declare ariaLabel: string | null;

  constructor() {
    super();
    this.size = 'medium';
    this.disabled = false;
    this.hideIcon = false;
    this.addEventListener('click', this.handleHostClick);
  }

  click() {
    this.shadowRoot?.querySelector('a')?.click();
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
        display: inline-block;
        --_font-size: var(--cc-text-size-label-l);
        --_line-height: var(--cc-line-height-label-l);
        --_icon: var(--cc-icon-md);
        --_gap: var(--cc-gap-gap-0-5);
        --_underline: 1.2px;
      }
      :host([size='small']) {
        --_font-size: var(--cc-text-size-label-m);
        --_line-height: var(--cc-line-height-label-m);
        --_icon: var(--cc-icon-sm);
        --_underline: 1px;
      }
      :host([size='large']) {
        --_font-size: var(--cc-text-size-title-m);
        --_line-height: var(--cc-line-height-title-m);
        --_gap: var(--cc-gap-gap-1);
        --_underline: 1.5px;
      }
      :host([size='extra-large']) {
        --_font-size: var(--cc-text-size-title-l);
        --_line-height: var(--cc-line-height-title-l);
        --_icon: var(--cc-icon-lg);
        --_gap: var(--cc-gap-gap-1);
        --_underline: 1.5px;
      }
      :host([hidden]) {
        display: none;
      }

      a {
        display: inline-flex;
        align-items: center;
        gap: var(--_gap);
        border-radius: var(--cc-radius);
        color: var(--cc-accent-light);
        font-family: var(--cc-typeface-typeface);
        font-weight: var(--cc-font-weight-semi-bold);
        font-size: var(--_font-size);
        line-height: var(--_line-height);
        font-variation-settings: 'YOPQ' 300;
        text-decoration: none;
        cursor: pointer;
      }
      a:active {
        color: var(--cc-accent-main);
      }
      a:focus-visible {
        outline: 2px solid var(--cc-border-focus);
        outline-offset: 2px;
      }

      .label {
        position: relative;
        white-space: nowrap;
      }
      .label::after {
        content: '';
        display: none;
        position: absolute;
        inset-inline: 0;
        bottom: calc(var(--_underline) / -2);
        height: var(--_underline);
        background: currentColor;
      }
      a:hover .label::after,
      a:active .label::after {
        display: block;
      }

      .icon {
        font-size: var(--_icon);
      }
      .leading {
        display: contents;
      }
      ::slotted([slot='leading']) {
        width: var(--cc-icon-sm);
        height: var(--cc-icon-sm);
        font-size: var(--cc-icon-sm) !important;
        flex: none;
      }

      :host([disabled]) a {
        opacity: 0.4;
        cursor: not-allowed;
        color: var(--cc-accent-light);
      }
      :host([disabled]) .label::after {
        display: none;
      }
    `,
  ];

  render() {
    return html`<a
      part="link"
      href=${this.disabled ? nothing : (this.href ?? nothing)}
      target=${this.target ?? nothing}
      rel=${this.rel ?? nothing}
      role=${this.disabled ? 'link' : nothing}
      aria-disabled=${this.disabled ? 'true' : nothing}
      aria-label=${this.ariaLabel ?? nothing}
    >
      <span class="leading" aria-hidden="true"><slot name="leading"></slot></span>
      <span class="label"><slot></slot></span>
      ${this.hideIcon ? nothing : html`<span class="material-icon icon" aria-hidden="true">link</span>`}
    </a>`;
  }
}

if (!customElements.get('cc-link')) {
  customElements.define('cc-link', CcLink);
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-link': CcLink;
  }
}
