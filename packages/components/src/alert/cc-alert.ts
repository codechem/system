import { LitElement, css, html } from 'lit';
import { iconStyles } from '../shared/icon-styles.js';
import '../shared/load-tokens.js';

const icons = {
  error: 'error',
  warning: 'warning',
  info: 'info',
  success: 'check_circle',
};

/**
 * Alert. Mirrors the Figma "Alert" component set.
 *
 * @slot - Description text
 * @slot title - Title text
 * @slot action - An action, usually a native button
 * @slot icon - Replaces the status icon
 * @fires cc-close - When the close button is clicked. Cancelable; call preventDefault() to keep the alert visible.
 * @csspart base - The alert container
 * @csspart close-button - The close button
 */
export class CcAlert extends LitElement {
  static properties = {
    status: { type: String, reflect: true },
    variant: { type: String, reflect: true },
    dismissible: { type: Boolean, reflect: true },
    closeLabel: { type: String, attribute: 'close-label' },
    hasDescription: { state: true },
  };

  declare status: 'error' | 'warning' | 'info' | 'success';
  declare variant: 'subtle' | 'solid';
  declare dismissible: boolean;
  declare closeLabel: string;
  /** @internal */
  declare hasDescription: boolean;

  constructor() {
    super();
    this.status = 'info';
    this.variant = 'subtle';
    this.dismissible = false;
    this.closeLabel = 'Close';
    this.hasDescription = false;
  }

  /** @internal */
  private handleClose() {
    const event = new CustomEvent('cc-close', { bubbles: true, composed: true, cancelable: true });
    if (this.dispatchEvent(event)) this.hidden = true;
  }

  /** @internal */
  private handleDescriptionChange(e: Event) {
    const slot = e.target as HTMLSlotElement;
    this.hasDescription = slot
      .assignedNodes({ flatten: true })
      .some((n) => n.nodeType === Node.ELEMENT_NODE || n.textContent?.trim());
  }

  static styles = [
    iconStyles,
    css`
    :host {
      display: block;
      --_main: var(--cc-alert-info-main);
      --_dark: var(--cc-alert-info-dark);
      --_light: var(--cc-alert-info-light);
      --_contrast: var(--cc-alert-info-contrast);
    }
    :host([hidden]) {
      display: none;
    }
    :host([status='error']) {
      --_main: var(--cc-alert-error-main);
      --_dark: var(--cc-alert-error-dark);
      --_light: var(--cc-alert-error-light);
      --_contrast: var(--cc-alert-error-contrast);
    }
    :host([status='warning']) {
      --_main: var(--cc-alert-warning-main);
      --_dark: var(--cc-alert-warning-dark);
      --_light: var(--cc-alert-warning-light);
      --_contrast: var(--cc-alert-warning-contrast);
    }
    :host([status='success']) {
      --_main: var(--cc-alert-success-main);
      --_dark: var(--cc-alert-success-dark);
      --_light: var(--cc-alert-success-light);
      --_contrast: var(--cc-alert-success-contrast);
    }

    .base {
      display: grid;
      grid-template-columns: var(--cc-icon-md) 1fr auto;
      align-items: center;
      column-gap: var(--cc-gap-gap-2);
      row-gap: var(--cc-gap-gap-0-5);
      padding: var(--cc-padding-padding-2);
      border-radius: var(--cc-radius);
      background: var(--_dark);
      box-shadow: inset 0 4px 0 var(--_main);
      color: var(--_contrast);
      font-family: var(--cc-typeface-typeface);
      font-variation-settings: 'YOPQ' 300;
    }
    :host([variant='solid']) .base {
      background: var(--_main);
      box-shadow: none;
    }

    .icon {
      display: flex;
      color: var(--_light);
    }
    :host([variant='solid']) .icon {
      color: var(--_contrast);
    }
    .icon .material-icon {
      font-size: var(--cc-icon-md);
    }
    ::slotted([slot='icon']) {
      width: var(--cc-icon-md);
      height: var(--cc-icon-md);
      font-size: var(--cc-icon-md) !important;
      fill: currentColor;
    }

    .title {
      font-size: var(--cc-text-size-title-s);
      line-height: var(--cc-line-height-title-s);
      font-weight: var(--cc-font-weight-semi-bold);
    }

    .actions {
      display: flex;
      align-items: center;
      gap: var(--cc-gap-gap-1);
    }
    ::slotted(button[slot='action']),
    .close {
      border: none;
      border-radius: var(--cc-radius);
      background: transparent;
      color: inherit;
      font: inherit;
      cursor: pointer;
    }
    ::slotted(button[slot='action']) {
      padding: var(--cc-padding-padding-0-5) var(--cc-padding-padding-1-5);
      font-size: var(--cc-text-size-label-m);
      line-height: var(--cc-line-height-label-m);
      font-weight: var(--cc-font-weight-semi-bold);
    }
    .close {
      display: flex;
      padding: var(--cc-padding-padding-0-5);
    }
    .close .material-icon {
      font-size: var(--cc-icon-sm);
    }
    ::slotted(button[slot='action']:hover),
    .close:hover {
      background: color-mix(in srgb, currentColor 15%, transparent);
    }
    ::slotted(button[slot='action']:focus-visible),
    .close:focus-visible {
      outline: 2px solid var(--cc-border-focus);
      outline-offset: 2px;
    }

    .description {
      grid-column: 2 / -1;
      font-size: var(--cc-text-size-body-md);
      line-height: var(--cc-line-height-body-md);
      font-weight: var(--cc-font-weight-regular);
    }
  `,
  ];

  render() {
    const urgent = this.status === 'error' || this.status === 'warning';
    return html`<div part="base" class="base" role=${urgent ? 'alert' : 'status'}>
      <span class="icon" aria-hidden="true">
        <slot name="icon"><span class="material-icon">${icons[this.status] ?? icons.info}</span></slot>
      </span>
      <div class="title"><slot name="title"></slot></div>
      <div class="actions">
        <slot name="action"></slot>
        ${this.dismissible
          ? html`<button part="close-button" class="close" aria-label=${this.closeLabel} @click=${this.handleClose}>
              <span class="material-icon" aria-hidden="true">close</span>
            </button>`
          : null}
      </div>
      <div class="description" ?hidden=${!this.hasDescription}>
        <slot @slotchange=${this.handleDescriptionChange}></slot>
      </div>
    </div>`;
  }
}

if (!customElements.get('cc-alert')) {
  customElements.define('cc-alert', CcAlert);
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-alert': CcAlert;
  }
}
