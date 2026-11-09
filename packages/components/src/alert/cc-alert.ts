import { LitElement, css, html, svg } from 'lit';

const icons = {
  error: svg`<path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 13C11.45 13 11 12.55 11 12L11 8C11 7.45 11.45 7 12 7C12.55 7 13 7.45 13 8L13 12C13 12.55 12.55 13 12 13ZM13 17L11 17L11 15L13 15L13 17Z"/>`,
  warning: svg`<path d="M4.47 20.51L19.53 20.51C21.07 20.51 22.03 18.84 21.26 17.51L13.73 4.5C12.96 3.17 11.04 3.17 10.27 4.5L2.74 17.51C1.97 18.84 2.93 20.51 4.47 20.51ZM12 13.51C11.45 13.51 11 13.06 11 12.51L11 10.51C11 9.96 11.45 9.51 12 9.51C12.55 9.51 13 9.96 13 10.51L13 12.51C13 13.06 12.55 13.51 12 13.51ZM13 17.51L11 17.51L11 15.51L13 15.51L13 17.51Z"/>`,
  info: svg`<path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 17C11.45 17 11 16.55 11 16L11 12C11 11.45 11.45 11 12 11C12.55 11 13 11.45 13 12L13 16C13 16.55 12.55 17 12 17ZM13 9L11 9L11 7L13 7L13 9Z"/>`,
  success: svg`<path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM9.29 16.29L5.7 12.7C5.31 12.31 5.31 11.68 5.7 11.29C6.09 10.9 6.72 10.9 7.11 11.29L10 14.17L16.88 7.29C17.27 6.9 17.9 6.9 18.29 7.29C18.68 7.68 18.68 8.31 18.29 8.7L10.7 16.29C10.32 16.68 9.68 16.68 9.29 16.29Z"/>`,
};

const close = svg`<path d="M15.25 4.76C14.93 4.44 14.4 4.44 14.08 4.76L10 8.83L5.93 4.75C5.6 4.43 5.08 4.43 4.75 4.75C4.43 5.08 4.43 5.6 4.75 5.93L8.83 10L4.75 14.08C4.43 14.4 4.43 14.93 4.75 15.25C5.08 15.58 5.6 15.58 5.93 15.25L10 11.18L14.08 15.25C14.4 15.58 14.93 15.58 15.25 15.25C15.58 14.93 15.58 14.4 15.25 14.08L11.18 10L15.25 5.93C15.57 5.61 15.57 5.08 15.25 4.76Z"/>`;

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

  static styles = css`
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
    .icon svg,
    ::slotted([slot='icon']) {
      width: var(--cc-icon-md);
      height: var(--cc-icon-md);
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
    .close svg {
      width: var(--cc-icon-sm);
      height: var(--cc-icon-sm);
      fill: currentColor;
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
  `;

  render() {
    const urgent = this.status === 'error' || this.status === 'warning';
    return html`<div part="base" class="base" role=${urgent ? 'alert' : 'status'}>
      <span class="icon" aria-hidden="true">
        <slot name="icon"><svg viewBox="0 0 24 24">${icons[this.status] ?? icons.info}</svg></slot>
      </span>
      <div class="title"><slot name="title"></slot></div>
      <div class="actions">
        <slot name="action"></slot>
        ${this.dismissible
          ? html`<button part="close-button" class="close" aria-label=${this.closeLabel} @click=${this.handleClose}>
              <svg viewBox="0 0 20 20" aria-hidden="true">${close}</svg>
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
