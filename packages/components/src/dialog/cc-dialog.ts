import { LitElement, css, html, nothing } from 'lit';
import type { PropertyValues } from 'lit';
import '../shared/load-tokens.js';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const focusInside = (el: HTMLElement) => {
  const inner = el.shadowRoot?.querySelector<HTMLElement>(FOCUSABLE);
  (inner ?? el).focus();
};

const focusWhenReady = async (el: HTMLElement) => {
  await (el as Partial<LitElement>).updateComplete;
  focusInside(el);
};

const focusables = (root: HTMLElement) =>
  [...root.querySelectorAll<HTMLElement>('*')].filter(
    (el) =>
      (el.matches(FOCUSABLE) || el.localName.includes('-')) &&
      !el.hasAttribute('disabled') &&
      el.getClientRects().length > 0,
  );

/**
 * Dialog. Mirrors the Figma "Dialog" component.
 *
 * @slot - Body content, laid out by the consumer. Hidden when empty.
 * @slot actions - Buttons, right-aligned at the bottom. Hidden when empty.
 * @csspart dialog - The inner native dialog element
 * @fires close - When the dialog closes, including with Escape
 */
export class CcDialog extends LitElement {
  static properties = {
    heading: { type: String },
    description: { type: String },
    open: { type: Boolean, reflect: true },
    ariaLabel: { attribute: 'aria-label' },
  };

  declare heading: string | undefined;
  declare description: string | undefined;
  declare open: boolean;
  declare ariaLabel: string | null;

  constructor() {
    super();
    this.open = false;
  }

  updated(changed: PropertyValues<this>) {
    if (!changed.has('open')) return;
    const dialog = this.shadowRoot!.querySelector('dialog')!;
    if (this.open && !dialog.open) {
      dialog.showModal();
      const first = focusables(this)[0];
      if (first) void focusWhenReady(first);
    }
    if (!this.open && dialog.open) dialog.close();
  }

  /** @internal */
  private handleClose = () => {
    this.open = false;
    this.dispatchEvent(new Event('close'));
  };

  /** @internal */
  private handleKeydown(event: KeyboardEvent) {
    if (event.key !== 'Tab') return;
    const focusable = focusables(this);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    const outside = active === this || !this.contains(active);
    const wrapForward = !event.shiftKey && (active === last || outside);
    const wrapBackward = event.shiftKey && (active === first || outside);
    if (!wrapForward && !wrapBackward) return;
    event.preventDefault();
    focusInside(wrapForward ? first : last);
  }

  /** @internal */
  private get hasBody() {
    return [...this.childNodes].some((node) =>
      node.nodeType === Node.ELEMENT_NODE
        ? (node as Element).slot !== 'actions'
        : node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim() !== '',
    );
  }

  /** @internal */
  private get hasActions() {
    return [...this.children].some((child) => child.slot === 'actions');
  }

  static styles = css`
    :host {
      display: block;
    }
    :host([hidden]) {
      display: none;
    }

    dialog {
      box-sizing: border-box;
      width: 448px;
      max-width: calc(100vw - 2 * var(--cc-padding-padding-3));
      margin: auto;
      padding: var(--cc-padding-padding-3);
      border: none;
      border-radius: var(--cc-radius);
      background: var(--cc-surface-surface-1);
      color: var(--cc-text-high-emphasis);
      font-family: var(--cc-typeface-typeface);
      font-variation-settings: 'YOPQ' 300;
    }
    dialog:focus-visible {
      outline: none;
    }
    dialog::backdrop {
      background: var(--cc-scrim-scrim-50);
    }

    .content {
      display: flex;
      flex-direction: column;
      gap: var(--cc-gap-gap-5);
    }
    .header {
      display: flex;
      flex-direction: column;
      gap: var(--cc-gap-gap-2-5);
    }
    .title {
      margin: 0;
      font-size: var(--cc-text-size-title-l);
      line-height: var(--cc-line-height-title-l);
      font-weight: var(--cc-font-weight-semi-bold);
      color: var(--cc-text-high-emphasis);
    }
    .description {
      margin: 0;
      font-size: var(--cc-text-size-body-md);
      line-height: var(--cc-line-height-body-md);
      font-weight: var(--cc-font-weight-medium);
      color: var(--cc-text-medium-emphasis);
    }
    .body[hidden],
    .actions[hidden] {
      display: none;
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--cc-gap-gap-2);
    }
  `;

  render() {
    const hasHeader = Boolean(this.heading || this.description);
    return html`<dialog
      part="dialog"
      aria-labelledby=${this.heading ? 'title' : nothing}
      aria-label=${this.ariaLabel ?? nothing}
      @close=${this.handleClose}
      @keydown=${this.handleKeydown}
    >
      <div class="content">
        ${hasHeader
          ? html`<div class="header">
              ${this.heading ? html`<h2 class="title" id="title">${this.heading}</h2>` : nothing}
              ${this.description ? html`<p class="description">${this.description}</p>` : nothing}
            </div>`
          : nothing}
        <div class="body" ?hidden=${!this.hasBody}>
          <slot @slotchange=${() => this.requestUpdate()}></slot>
        </div>
        <div class="actions" ?hidden=${!this.hasActions}>
          <slot name="actions" @slotchange=${() => this.requestUpdate()}></slot>
        </div>
      </div>
    </dialog>`;
  }
}

if (!customElements.get('cc-dialog')) {
  customElements.define('cc-dialog', CcDialog);
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-dialog': CcDialog;
  }
}
