import { LitElement, css, html, nothing } from 'lit';
import { iconStyles } from '../shared/icon-styles.js';
import '../shared/load-tokens.js';

/**
 * Avatar. Mirrors the Figma "Avatar" component set. Not interactive. The host is `role="img"`, named by `alt` (default "Avatar").
 *
 * @slot badge - Notification badge content, shown with `notification-badge`. Large avatars show a number here; medium and small show a dot, so leave their badge slot empty.
 * @csspart avatar - The circular container
 * @csspart image - The profile image, rendered when `src` is set
 */
export class CcAvatar extends LitElement {
  static properties = {
    size: { type: String, reflect: true },
    src: { type: String },
    alt: { type: String },
    notificationBadge: { type: Boolean, attribute: 'notification-badge', reflect: true },
  };

  declare size: 'large' | 'medium' | 'small';
  declare src: string | undefined;
  declare alt: string | undefined;
  declare notificationBadge: boolean;

  constructor() {
    super();
    this.size = 'medium';
    this.notificationBadge = false;
  }

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'img');
  }

  updated() {
    this.setAttribute('aria-label', this.alt || 'Avatar');
  }

  static styles = [
    iconStyles,
    css`
      :host {
        --_size: var(--cc-unit-5x);
        --_icon: var(--cc-icon-md);
        --_badge: var(--cc-unit-2x);
        --_badge-font: var(--cc-text-size-label-s);
        --_badge-line: var(--cc-line-height-label-xs);
        display: inline-block;
        position: relative;
        box-sizing: border-box;
        width: var(--_size);
        height: var(--_size);
        vertical-align: middle;
      }
      :host([size='large']) {
        --_size: var(--cc-unit-6x);
        --_icon: var(--cc-icon-lg);
      }
      :host([size='small']) {
        --_size: var(--cc-unit-2-5x);
        --_icon: var(--cc-icon-xs);
        --_badge: 6px;
      }
      :host([size='medium']) {
        --_badge: 6px;
      }
      :host([hidden]) {
        display: none;
      }

      .avatar {
        box-sizing: border-box;
        display: grid;
        place-items: center;
        width: 100%;
        height: 100%;
        border-radius: var(--cc-round);
        background: var(--cc-surface-surface-highlight);
        color: var(--cc-text-medium-emphasis);
        overflow: hidden;
      }
      .material-icon {
        font-size: var(--_icon);
      }
      .image {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .badge {
        position: absolute;
        top: 0;
        right: 0;
        box-sizing: border-box;
        display: grid;
        place-items: center;
        min-width: var(--_badge);
        width: var(--_badge);
        height: var(--_badge);
        padding-inline: 0;
        border-radius: var(--cc-round);
        background: var(--cc-status-green-main);
        color: var(--cc-status-green-contrast);
        box-shadow: 0 0 0 3px var(--cc-background);
        font-family: var(--cc-typeface-typeface);
        font-size: var(--_badge-font);
        line-height: var(--_badge-line);
        font-weight: var(--cc-font-weight-bold);
        font-variation-settings: 'YOPQ' 300;
        white-space: nowrap;
        overflow: hidden;
      }
      :host([size='large']) .badge {
        width: auto;
        padding-inline: var(--cc-padding-padding-0-5);
      }
    `,
  ];

  render() {
    return html`<span class="avatar" part="avatar">
        ${this.src
          ? html`<img class="image" part="image" src=${this.src} alt="" />`
          : html`<span class="material-icon" aria-hidden="true">person</span>`}
      </span>${this.notificationBadge
        ? html`<span class="badge"><slot name="badge"></slot></span>`
        : nothing}`;
  }
}

if (!customElements.get('cc-avatar')) customElements.define('cc-avatar', CcAvatar);

declare global {
  interface HTMLElementTagNameMap {
    'cc-avatar': CcAvatar;
  }
}
