import { LitElement, css, html } from 'lit';

/**
 * Badge. Mirrors the Figma "Badge" component set. Not interactive.
 *
 * @slot - Label or number. With `type="dot"` it is visually hidden and only read by screen readers.
 */
export class CcBadge extends LitElement {
  static properties = {
    variant: { type: String, reflect: true },
    color: { type: String, reflect: true },
    type: { type: String, reflect: true },
    size: { type: String, reflect: true },
  };

  declare variant: 'solid' | 'subtle' | 'outline';
  declare color: 'gray' | 'purple' | 'blue' | 'cyan' | 'teal' | 'green' | 'yellow' | 'orange' | 'red' | 'pink';
  declare type: 'text' | 'number' | 'dot';
  /** Applies to `number` and `dot`; Figma has text badges in medium only. */
  declare size: 'medium' | 'small';

  constructor() {
    super();
    this.variant = 'solid';
    this.color = 'gray';
    this.type = 'text';
    this.size = 'medium';
  }

  static styles = css`
    :host {
      --_main: var(--cc-status-gray-main);
      --_light: var(--cc-status-gray-light);
      --_dark: var(--cc-status-gray-dark);
      --_contrast: var(--cc-status-gray-contrast);
    }
    :host([color='purple']) { --_main: var(--cc-status-purple-main); --_light: var(--cc-status-purple-light); --_dark: var(--cc-status-purple-dark); --_contrast: var(--cc-status-purple-contrast); }
    :host([color='blue']) { --_main: var(--cc-status-blue-main); --_light: var(--cc-status-blue-light); --_dark: var(--cc-status-blue-dark); --_contrast: var(--cc-status-blue-contrast); }
    :host([color='cyan']) { --_main: var(--cc-status-cyan-main); --_light: var(--cc-status-cyan-light); --_dark: var(--cc-status-cyan-dark); --_contrast: var(--cc-status-cyan-contrast); }
    :host([color='teal']) { --_main: var(--cc-status-teal-main); --_light: var(--cc-status-teal-light); --_dark: var(--cc-status-teal-dark); --_contrast: var(--cc-status-teal-contrast); }
    :host([color='green']) { --_main: var(--cc-status-green-main); --_light: var(--cc-status-green-light); --_dark: var(--cc-status-green-dark); --_contrast: var(--cc-status-green-contrast); }
    :host([color='yellow']) { --_main: var(--cc-status-yellow-main); --_light: var(--cc-status-yellow-light); --_dark: var(--cc-status-yellow-dark); --_contrast: var(--cc-status-yellow-contrast); }
    :host([color='orange']) { --_main: var(--cc-status-orange-main); --_light: var(--cc-status-orange-light); --_dark: var(--cc-status-orange-dark); --_contrast: var(--cc-status-orange-contrast); }
    :host([color='red']) { --_main: var(--cc-status-red-main); --_light: var(--cc-status-red-light); --_dark: var(--cc-status-red-dark); --_contrast: var(--cc-status-red-contrast); }
    :host([color='pink']) { --_main: var(--cc-status-pink-main); --_light: var(--cc-status-pink-light); --_dark: var(--cc-status-pink-dark); --_contrast: var(--cc-status-pink-contrast); }

    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      vertical-align: middle;
      padding: var(--cc-padding-padding-0-25) var(--cc-padding-padding-1);
      border-radius: var(--cc-radius);
      background: var(--_main);
      color: var(--_contrast);
      font-family: var(--cc-typeface-typeface);
      font-size: var(--cc-text-size-label-s);
      line-height: var(--cc-line-height-label-s);
      font-weight: var(--cc-font-weight-bold);
      letter-spacing: 0.02em;
      text-transform: uppercase;
      white-space: nowrap;
    }
    :host([hidden]) {
      display: none;
    }
    :host([variant='subtle']) {
      background: var(--_light);
      color: var(--_dark);
    }
    :host([variant='outline']) {
      background: transparent;
      color: var(--_light);
      box-shadow: inset 0 0 0 1px var(--_light);
    }

    :host([type='number']) {
      min-width: 20px;
      padding-inline: var(--cc-padding-padding-0-5);
      border-radius: var(--cc-round);
    }
    :host([type='number'][size='small']) {
      min-width: 16px;
      line-height: var(--cc-line-height-label-xs);
    }

    :host([type='dot']) {
      width: 14px;
      height: 14px;
      padding: 0;
      border-radius: var(--cc-round);
      background: var(--_light);
      box-shadow: none;
    }
    :host([type='dot'][size='small']) {
      width: 6px;
      height: 6px;
    }
    :host([type='dot']) .label {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
    }
  `;

  render() {
    return html`<span class="label"><slot></slot></span>`;
  }
}

if (!customElements.get('cc-badge')) customElements.define('cc-badge', CcBadge);

declare global {
  interface HTMLElementTagNameMap {
    'cc-badge': CcBadge;
  }
}
