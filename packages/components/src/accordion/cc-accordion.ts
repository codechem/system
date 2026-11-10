import { LitElement, css, html, nothing } from 'lit';
import { iconStyles } from '../shared/icon-styles.js';
import '../shared/load-tokens.js';

/**
 * Accordion. Mirrors the Figma "Accordion" component set.
 *
 * @slot - Content shown when the accordion is open
 * @csspart details - The inner native details element
 * @csspart summary - The inner native summary element (the header row)
 */
export class CcAccordion extends LitElement {
  /** @internal */
  static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

  static properties = {
    heading: { type: String },
    subtitle: { type: String },
    hideSubtitle: { type: Boolean, attribute: 'hide-subtitle', reflect: true },
    open: { type: Boolean, reflect: true },
    size: { type: String, reflect: true },
    ariaLabel: { attribute: 'aria-label' },
  };

  declare heading: string | undefined;
  declare subtitle: string | undefined;
  declare hideSubtitle: boolean;
  declare open: boolean;
  declare size: 'small' | 'medium' | 'large';
  declare ariaLabel: string | null;

  constructor() {
    super();
    this.hideSubtitle = false;
    this.open = false;
    this.size = 'medium';
  }

  click() {
    this.shadowRoot?.querySelector('summary')?.click();
  }

  /** @internal */
  private handleToggle = (event: Event) => {
    this.open = (event.target as HTMLDetailsElement).open;
  };

  static styles = [
    iconStyles,
    css`
      :host {
        display: block;
        --_pad-y: var(--cc-padding-padding-1);
        --_pad-start: var(--cc-padding-padding-2-5);
        --_pad-end: var(--cc-padding-padding-1-5);
        --_heading-gap: var(--cc-gap-gap-2-5);
        --_title-size: var(--cc-text-size-title-s);
        --_title-line-height: var(--cc-line-height-title-s);
        --_icon: var(--cc-icon-md);
      }
      :host([size='large']) {
        --_pad-y: var(--cc-padding-padding-1-5);
        --_pad-start: var(--cc-padding-padding-3);
        --_pad-end: var(--cc-padding-padding-2);
        --_heading-gap: var(--cc-gap-gap-3);
        --_title-size: var(--cc-text-size-title-m);
        --_title-line-height: var(--cc-line-height-title-m);
      }
      :host([size='small']) {
        --_pad-y: var(--cc-padding-padding-0-5);
        --_pad-start: var(--cc-padding-padding-2);
        --_pad-end: var(--cc-padding-padding-1);
        --_heading-gap: var(--cc-gap-gap-2);
        --_icon: var(--cc-icon-sm);
      }
      :host([hidden]) {
        display: none;
      }

      details {
        font-family: var(--cc-typeface-typeface);
        font-variation-settings: 'YOPQ' 300;
      }

      summary {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--_pad-y) var(--_pad-end) var(--_pad-y) var(--_pad-start);
        border-radius: var(--cc-radius);
        background: var(--cc-surface-surface-2);
        color: var(--cc-text-high-emphasis);
        list-style: none;
        cursor: pointer;
        user-select: none;
      }
      summary::-webkit-details-marker {
        display: none;
      }
      summary:focus-visible {
        outline: 2px solid var(--cc-border-focus);
        outline-offset: 2px;
      }

      .heading {
        display: flex;
        align-items: center;
        gap: var(--_heading-gap);
        min-width: 0;
      }
      .title {
        font-size: var(--_title-size);
        line-height: var(--_title-line-height);
        font-weight: var(--cc-font-weight-semi-bold);
      }
      .subtitle {
        font-size: var(--cc-text-size-title-s);
        line-height: var(--cc-line-height-title-s);
        font-weight: var(--cc-font-weight-regular);
        color: var(--cc-text-medium-emphasis);
      }

      .chevron {
        font-size: var(--_icon);
      }
      details[open] .chevron {
        transform: rotate(180deg);
      }

      .content {
        padding-top: var(--cc-gap-gap-1);
      }
    `,
  ];

  render() {
    return html`<details part="details" ?open=${this.open} @toggle=${this.handleToggle}>
      <summary part="summary" aria-label=${this.ariaLabel ?? nothing}>
        <span class="heading">
          <span class="title">${this.heading}</span>
          ${this.subtitle && !this.hideSubtitle ? html`<span class="subtitle">${this.subtitle}</span>` : nothing}
        </span>
        <span class="material-icon chevron" aria-hidden="true">expand_more</span>
      </summary>
      <div class="content"><slot></slot></div>
    </details>`;
  }
}

if (!customElements.get('cc-accordion')) {
  customElements.define('cc-accordion', CcAccordion);
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-accordion': CcAccordion;
  }
}
