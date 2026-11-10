import { LitElement, css, html, nothing } from 'lit';
import { iconStyles } from '../shared/icon-styles.js';
import '../shared/load-tokens.js';

/**
 * Chip. Mirrors the Figma "Filter Chip" and "Input Chip" component sets.
 *
 * @slot - Label text
 * @slot leading - Icon before the label. A selected filter chip shows a check instead.
 * @slot trailing - Icon after the label (filter chips)
 * @slot avatar - Avatar before the label (input chips). The chip becomes pill-shaped.
 * @fires change - When the user toggles the chip
 * @fires remove - When the user clicks the close button or presses Delete or Backspace (input chips with `removable`). The chip does not remove itself.
 * @csspart chip - The chip container
 * @csspart button - The inner native button that toggles the chip
 * @csspart close - The close button
 */
export class CcChip extends LitElement {
  /** @internal */
  static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

  static properties = {
    type: { type: String, reflect: true },
    variant: { type: String, reflect: true },
    selected: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    removable: { type: Boolean, reflect: true },
    ariaLabel: { attribute: 'aria-label' },
    hasLeading: { state: true },
    hasTrailing: { state: true },
    hasAvatar: { state: true },
    labelText: { state: true },
  };

  declare type: 'filter' | 'input';
  declare variant: 'outlined' | 'filled';
  declare selected: boolean;
  declare disabled: boolean;
  declare removable: boolean;
  declare ariaLabel: string | null;
  /** @internal */
  declare hasLeading: boolean;
  /** @internal */
  declare hasTrailing: boolean;
  /** @internal */
  declare hasAvatar: boolean;
  /** @internal */
  declare labelText: string;

  constructor() {
    super();
    this.type = 'filter';
    this.variant = 'outlined';
    this.selected = false;
    this.disabled = false;
    this.removable = false;
    this.hasLeading = false;
    this.hasTrailing = false;
    this.hasAvatar = false;
    this.labelText = '';
    this.addEventListener('click', this.handleHostClick);
  }

  click() {
    this.shadowRoot?.querySelector<HTMLButtonElement>('.body')?.click();
  }

  /** @internal */
  private handleHostClick = (event: MouseEvent) => {
    if (this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };

  /** @internal */
  private handleSlotChange() {
    this.hasLeading = !!this.querySelector(':scope > [slot="leading"]');
    this.hasTrailing = !!this.querySelector(':scope > [slot="trailing"]');
    this.hasAvatar = !!this.querySelector(':scope > [slot="avatar"]');
    const label = this.shadowRoot?.querySelector<HTMLSlotElement>('slot:not([name])');
    this.labelText = (label?.assignedNodes() ?? []).map((n) => n.textContent).join('').trim();
  }

  /** @internal */
  private observer = new MutationObserver(() => this.handleSlotChange());

  connectedCallback() {
    super.connectedCallback();
    this.observer.observe(this, { characterData: true, childList: true, subtree: true });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.observer.disconnect();
  }

  /** @internal */
  private handleToggle() {
    this.selected = !this.selected;
    this.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /** @internal */
  private handleRemove() {
    this.dispatchEvent(new Event('remove', { bubbles: true }));
  }

  /** @internal */
  private handleKeydown(event: KeyboardEvent) {
    const plain = !event.repeat && !event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey;
    if (plain && this.type === 'input' && this.removable && (event.key === 'Delete' || event.key === 'Backspace')) {
      event.preventDefault();
      this.handleRemove();
    }
  }

  static styles = [
    iconStyles,
    css`
      :host {
        display: inline-block;
        --_py: var(--cc-padding-padding-1);
        --_px: var(--cc-padding-padding-2);
        --_px-icon: var(--cc-padding-padding-1);
        --_gap: var(--cc-gap-gap-1);
        --_icon: var(--cc-icon-sm);
        --_radius: var(--cc-radius);
        --_fg: var(--cc-text-medium-emphasis);
        --_stroke: var(--cc-border-medium-contrast);
        --_bg: transparent;
        --_hover-bg: var(--cc-surface-surface-highlight-transparent);
        --_overlay: transparent;
      }
      :host([hidden]) {
        display: none;
      }

      :host([variant='filled']) {
        --_bg: var(--cc-surface-surface-2);
        --_hover-bg: var(--cc-surface-surface-highlight);
        --_stroke: transparent;
      }

      :host([type='input']) {
        --_py: var(--cc-padding-padding-0-5);
        --_px: var(--cc-padding-padding-1-5);
        --_hover-bg: var(--_bg);
        --_overlay: var(--cc-surface-transparent-transparent-highlight-2);
      }
      :host([type='input'][variant='filled']) {
        --_bg: var(--cc-surface-surface-highlight);
      }

      :host([selected]) {
        --_fg: var(--cc-accent-contrast);
        --_stroke: var(--cc-accent-light);
      }
      :host([selected][variant='outlined']) {
        --_bg: color-mix(in srgb, var(--cc-accent-transparent) 60%, transparent);
        --_hover-bg: var(--_bg);
        --_overlay: var(--cc-surface-transparent-transparent-highlight-2);
      }
      :host([selected][variant='filled']) {
        --_bg: var(--cc-accent-dark);
        --_hover-bg: var(--cc-accent-main);
        --_overlay: transparent;
      }

      .chip {
        --_pl: var(--_px);
        --_pr: var(--_px);
        display: inline-flex;
        align-items: center;
        box-sizing: border-box;
        border-radius: var(--_radius);
        background-color: var(--_bg);
        background-image: linear-gradient(var(--_overlay-now, transparent), var(--_overlay-now, transparent));
        box-shadow: inset 0 0 0 1px var(--_stroke);
        color: var(--_fg);
        font-family: var(--cc-typeface-typeface);
        font-weight: var(--cc-font-weight-regular);
        font-size: var(--cc-text-size-label-m);
        line-height: var(--cc-line-height-label-m);
        font-variation-settings: 'YOPQ' 300;
        white-space: nowrap;
      }
      :host([variant='filled']:not([selected])) .chip {
        box-shadow: none;
      }
      .chip[data-leading] {
        --_pl: var(--_px-icon);
      }
      .chip[data-trailing] {
        --_pr: var(--_px-icon);
      }
      .chip[data-avatar] {
        --_pl: var(--cc-padding-padding-0-5);
        --_radius: var(--cc-round);
      }
      .chip[data-removable] {
        --_pr: var(--cc-padding-padding-1);
      }
      :host([type='input']) .chip[data-leading]:not([data-removable]) {
        --_pr: var(--_px);
      }

      :host(:not([disabled])) .chip:hover {
        background-color: var(--_hover-bg);
        --_overlay-now: var(--_overlay);
      }
      :host([type='input']) .chip:has(.body:focus-visible) {
        --_overlay-now: var(--cc-surface-transparent-transparent-highlight-3);
      }
      .chip:has(.body:focus-visible),
      .chip:has(.close:focus-visible) {
        outline: 2px solid var(--cc-border-focus);
        outline-offset: 4px;
      }
      :host(:not([disabled])) .chip:has(.body:active) {
        opacity: 0.7;
      }
      :host([disabled]) .chip {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .body {
        all: unset;
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        gap: var(--_gap);
        padding: var(--_py) var(--_pr) var(--_py) var(--_pl);
        border-radius: inherit;
        cursor: pointer;
      }
      .chip[data-removable] .body {
        padding-inline-end: var(--_gap);
      }
      .body:disabled {
        cursor: not-allowed;
      }

      .icon {
        display: contents;
      }
      .icon[hidden] {
        display: none;
      }
      .material-icon,
      ::slotted([slot='leading']),
      ::slotted([slot='trailing']) {
        width: var(--_icon);
        height: var(--_icon);
        font-size: var(--_icon) !important;
        flex: none;
      }
      ::slotted([slot='avatar']) {
        width: var(--_icon);
        height: var(--_icon);
        border-radius: var(--cc-round);
        object-fit: cover;
        flex: none;
      }

      .close {
        all: unset;
        box-sizing: border-box;
        display: grid;
        place-items: center;
        flex: none;
        width: var(--_icon);
        height: var(--_icon);
        margin-inline-end: var(--_px-icon);
        border-radius: var(--_radius);
        cursor: pointer;
      }
      .close:hover {
        background: var(--cc-surface-transparent-transparent-highlight-2);
      }
      .close:focus-visible {
        outline: 2px solid var(--cc-border-focus);
        outline-offset: 2px;
      }
      .close:disabled {
        cursor: not-allowed;
      }
    `,
  ];

  render() {
    const checked = this.type === 'filter' && this.selected;
    const removable = this.type === 'input' && this.removable;
    const avatar = this.type === 'input' && this.hasAvatar;
    const avatarSlot = this.type === 'input'
      ? html`<span class="icon" aria-hidden="true"><slot name="avatar" @slotchange=${this.handleSlotChange}></slot></span>`
      : nothing;
    const trailingSlot = this.type === 'filter'
      ? html`<span class="icon" aria-hidden="true"><slot name="trailing" @slotchange=${this.handleSlotChange}></slot></span>`
      : nothing;
    return html`<span
      class="chip"
      part="chip"
      ?data-leading=${this.hasLeading || checked}
      ?data-trailing=${this.hasTrailing}
      ?data-avatar=${avatar}
      ?data-removable=${removable}
    >
      <button
        class="body"
        part="button"
        type="button"
        aria-pressed=${this.selected ? 'true' : 'false'}
        aria-label=${this.ariaLabel ?? nothing}
        ?disabled=${this.disabled}
        @click=${this.handleToggle}
        @keydown=${this.handleKeydown}
      >
        ${avatarSlot}
        ${checked ? html`<span class="material-icon" aria-hidden="true">check</span>` : nothing}
        <span class="icon" aria-hidden="true" ?hidden=${checked}
          ><slot name="leading" @slotchange=${this.handleSlotChange}></slot
        ></span>
        <slot @slotchange=${this.handleSlotChange}></slot>
        ${trailingSlot}
      </button>
      ${removable
        ? html`<button
            class="close"
            part="close"
            type="button"
            aria-label=${this.labelText ? `Remove ${this.labelText}` : 'Remove'}
            ?disabled=${this.disabled}
            @click=${this.handleRemove}
          >
            <span class="material-icon" aria-hidden="true">close</span>
          </button>`
        : nothing}
    </span>`;
  }
}

if (!customElements.get('cc-chip')) {
  customElements.define('cc-chip', CcChip);
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-chip': CcChip;
  }
}
