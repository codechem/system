import { LitElement, css, html, nothing } from 'lit';
import { iconStyles } from '../shared/icon-styles.js';
import '../shared/load-tokens.js';

/**
 * Pagination. Mirrors the Figma "Pagination" component set.
 *
 * @fires change - When the page changes; read the new value from `page`
 * @csspart nav - The inner nav landmark
 * @csspart button - Each arrow and page-number button
 */
export class CcPagination extends LitElement {
  /** @internal */
  static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

  static properties = {
    type: { type: String, reflect: true },
    page: { type: Number, reflect: true },
    total: { type: Number, reflect: true },
    pageSize: { type: Number, attribute: 'page-size', reflect: true },
    ariaLabel: { attribute: 'aria-label' },
  };

  declare type: 'pages' | 'numbers';
  declare page: number;
  declare total: number;
  declare pageSize: number;
  declare ariaLabel: string | null;

  constructor() {
    super();
    this.type = 'pages';
    this.page = 1;
    this.total = 0;
    this.pageSize = 10;
  }

  willUpdate() {
    if (this.page !== this.current) this.page = this.current;
  }

  /** @internal */
  private get pageCount() {
    return Math.max(1, Math.ceil(this.total / Math.max(1, this.pageSize)));
  }

  /** @internal */
  private get current() {
    return Math.min(Math.max(1, this.page), this.pageCount);
  }

  /** @internal */
  private get range() {
    if (this.total <= 0) return '0-0 of 0';
    const size = Math.max(1, this.pageSize);
    const start = (this.current - 1) * size + 1;
    const end = Math.min(this.current * size, this.total);
    return `${start}-${end} of ${this.total}`;
  }

  /** @internal */
  private get pageNumbers() {
    const count = this.pageCount;
    const start = Math.max(1, Math.min(this.current - 2, count - 4));
    const end = Math.min(count, start + 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  /** @internal */
  private go(page: number) {
    const next = Math.min(Math.max(1, page), this.pageCount);
    if (next === this.current) return;
    this.page = next;
    this.dispatchEvent(new Event('change', { bubbles: true }));
  }

  static styles = [
    iconStyles,
    css`
      :host {
        display: inline-block;
      }
      :host([hidden]) {
        display: none;
      }

      nav {
        display: inline-flex;
        align-items: center;
        gap: var(--cc-gap-gap-1-5);
        font-family: var(--cc-typeface-typeface);
        font-variation-settings: 'YOPQ' 300;
      }
      :host([type='pages']) nav {
        gap: var(--cc-gap-gap-2);
      }

      .range {
        font-size: var(--cc-text-size-body-md);
        line-height: var(--cc-line-height-body-md);
        font-weight: var(--cc-font-weight-medium);
        color: var(--cc-text-low-emphasis);
        white-space: nowrap;
      }
      .arrows,
      .numbers {
        display: inline-flex;
        align-items: center;
      }
      .arrows {
        gap: var(--cc-gap-gap-1-5);
      }

      button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: var(--cc-unit-3-5x);
        height: var(--cc-unit-3-5x);
        padding: 0;
        border: none;
        border-radius: var(--cc-radius);
        background: transparent;
        color: var(--cc-text-medium-emphasis);
        font-family: inherit;
        font-size: var(--cc-text-size-label-m);
        line-height: var(--cc-line-height-label-m);
        font-weight: var(--cc-font-weight-semi-bold);
        font-variation-settings: 'YOPQ' 300;
        cursor: pointer;
      }
      button:hover {
        background: var(--cc-surface-surface-highlight-transparent);
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
        background: transparent;
      }
      button[aria-current='page'] {
        background: var(--cc-surface-surface-highlight);
        color: var(--cc-text-high-emphasis);
      }
      .material-icon {
        font-size: var(--cc-icon-sm);
      }

      :host([type='pages']) .arrow {
        background: var(--cc-surface-surface-highlight);
        color: var(--cc-text-medium-emphasis);
      }
      :host([type='pages']) .arrow:hover {
        background: var(--cc-surface-surface-2);
      }
      :host([type='pages']) .arrow:disabled {
        background: var(--cc-surface-surface-highlight);
      }
    `,
  ];

  render() {
    const current = this.current;
    const last = this.pageCount;
    const prev = html`<button
      part="button"
      class="arrow"
      aria-label="Previous page"
      ?disabled=${current <= 1}
      @click=${() => this.go(current - 1)}
    >
      <span class="material-icon" aria-hidden="true">chevron_left</span>
    </button>`;
    const next = html`<button
      part="button"
      class="arrow"
      aria-label="Next page"
      ?disabled=${current >= last}
      @click=${() => this.go(current + 1)}
    >
      <span class="material-icon" aria-hidden="true">chevron_right</span>
    </button>`;

    return html`<nav part="nav" aria-label=${this.ariaLabel ?? 'Pagination'}>
      ${this.type === 'pages'
        ? html`<span class="range">${this.range}</span>
            <span class="arrows">${prev}${next}</span>`
        : html`<span class="arrows">${prev}</span>
            <span class="numbers">
              ${this.pageNumbers.map(
                (n) => html`<button
                  part="button"
                  aria-label=${`Page ${n}`}
                  aria-current=${n === current ? 'page' : nothing}
                  @click=${() => this.go(n)}
                >
                  ${n}
                </button>`,
              )}
            </span>
            <span class="arrows">${next}</span>`}
    </nav>`;
  }
}

if (!customElements.get('cc-pagination')) {
  customElements.define('cc-pagination', CcPagination);
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-pagination': CcPagination;
  }
}
