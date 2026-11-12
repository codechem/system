import { LitElement, css, html, nothing } from 'lit';
import { iconStyles } from '../shared/icon-styles.js';
import '../shared/load-tokens.js';
import '../button/cc-button.js';
import '../checkbox/cc-checkbox.js';

/**
 * List item. Mirrors the Figma "List Item" component set. Put items in a container with `role="list"`.
 *
 * @fires change - When the leading checkbox is toggled
 * @fires remove - When the user clicks the remove button. Cancelable: the item removes itself from the DOM unless `preventDefault()` is called
 */
export class CcListItem extends LitElement {
  static properties = {
    label: { type: String },
    supportingText: { type: String, attribute: 'supporting-text' },
    leading: { type: String, reflect: true },
    icon: { type: String },
    selected: { type: Boolean, reflect: true },
    hideRemoveButton: { type: Boolean, attribute: 'hide-remove-button', reflect: true },
  };

  /** @internal */
  private internals = this.attachInternals();

  declare label: string;
  declare supportingText: string;
  declare leading: 'checkbox' | 'icon' | 'none';
  declare icon: string;
  declare selected: boolean;
  declare hideRemoveButton: boolean;

  constructor() {
    super();
    this.label = '';
    this.supportingText = '';
    this.leading = 'none';
    this.icon = 'person_2';
    this.selected = false;
    this.hideRemoveButton = false;
    this.internals.role = 'listitem';
  }

  /** @internal */
  private handleRowClick(event: MouseEvent) {
    if (this.leading !== 'checkbox' || (event.target as Element).closest('.remove, cc-checkbox')) return;
    this.shadowRoot?.querySelector('cc-checkbox')?.click();
  }

  /** @internal */
  private handleChange(event: Event) {
    this.selected = (event.target as HTMLInputElement).checked;
    this.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /** @internal */
  private handleRemove() {
    if (this.dispatchEvent(new Event('remove', { bubbles: true, cancelable: true }))) this.remove();
  }

  static styles = [
    iconStyles,
    css`
      :host {
        display: block;
        --_py: var(--cc-padding-padding-0-5);
        --_pl: var(--cc-padding-padding-1-5);
        --_gap: var(--cc-gap-gap-0-5);
        --_bg: transparent;
      }
      :host([leading='checkbox']) {
        --_pl: var(--cc-padding-padding-0-5);
        --_gap: var(--cc-gap-gap-0-25);
      }
      :host([leading='icon']) {
        --_py: var(--cc-padding-padding-1);
        --_pl: var(--cc-padding-padding-1);
        --_gap: var(--cc-gap-gap-1);
      }
      :host([hidden]) {
        display: none;
      }

      .row {
        display: flex;
        align-items: center;
        gap: var(--_gap);
        padding: var(--_py) var(--cc-padding-padding-0-5) var(--_py) var(--_pl);
        border-radius: var(--cc-radius);
        background-color: var(--_bg);
        font-family: var(--cc-typeface-typeface);
        font-variation-settings: 'YOPQ' 300;
        color: var(--cc-text-high-emphasis);
      }
      :host([leading='checkbox']) .row {
        cursor: pointer;
      }
      .row:hover {
        --_bg: var(--cc-surface-surface-highlight-transparent);
      }
      .row:active:not(:has(.remove:active)) {
        opacity: 0.7;
      }

      .leading {
        font-size: var(--cc-icon-sm);
        color: var(--cc-text-medium-emphasis);
      }

      .content {
        display: flex;
        flex: 1;
        align-items: center;
        justify-content: space-between;
        gap: var(--cc-gap-gap-1);
        min-inline-size: 0;
        min-block-size: var(--cc-unit-3-5x);
      }
      .text {
        min-inline-size: 0;
        overflow-wrap: anywhere;
      }
      .label {
        font-weight: var(--cc-font-weight-regular);
        font-size: var(--cc-text-size-body-s);
        line-height: var(--cc-line-height-body-s);
      }
      .supporting {
        font-weight: var(--cc-font-weight-regular);
        font-size: var(--cc-text-size-body-xs);
        line-height: var(--cc-line-height-body-xs);
        color: var(--cc-text-low-emphasis);
      }

      .remove {
        display: flex;
        flex: none;
      }
      .remove::part(button) {
        color: var(--cc-text-low-emphasis);
      }
    `,
  ];

  render() {
    return html`<div class="row" @click=${this.handleRowClick}>
      ${this.leading === 'checkbox'
        ? html`<cc-checkbox
            .checked=${this.selected}
            aria-label=${this.label || nothing}
            @change=${this.handleChange}
          ></cc-checkbox>`
        : nothing}
      ${this.leading === 'icon' ? html`<span class="material-icon leading" aria-hidden="true">${this.icon}</span>` : nothing}
      <div class="content">
        <div class="text">
          <div class="label">${this.label}</div>
          ${this.supportingText ? html`<div class="supporting">${this.supportingText}</div>` : nothing}
        </div>
        ${this.hideRemoveButton
          ? nothing
          : html`<cc-button
              class="remove"
              icon-only
              variant="text"
              color="secondary"
              size="small"
              aria-label=${this.label ? `Remove ${this.label}` : 'Remove'}
              @click=${this.handleRemove}
            >
              <span class="material-icon" aria-hidden="true">close</span>
            </cc-button>`}
      </div>
    </div>`;
  }
}

if (!customElements.get('cc-list-item')) {
  customElements.define('cc-list-item', CcListItem);
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-list-item': CcListItem;
  }
}
