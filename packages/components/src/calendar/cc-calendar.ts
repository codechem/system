import { LitElement, css, html, type PropertyValues } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import '../shared/load-tokens.js';
import '../button/cc-button.js';

const DAY_MS = 86_400_000;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const fromIso = (iso: string) => Date.parse(`${iso}T00:00:00Z`);
const toIso = (time: number) => new Date(time).toISOString().slice(0, 10);
const isIsoDate = (value?: string | null): value is string => {
  if (!value || !ISO_DATE.test(value)) return false;
  const time = fromIso(value);
  return !Number.isNaN(time) && toIso(time) === value;
};
const addDays = (iso: string, days: number) => toIso(fromIso(iso) + days * DAY_MS);
const addMonths = (iso: string, months: number) => {
  const date = new Date(fromIso(iso));
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + months;
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return toIso(Date.UTC(year, month, Math.min(date.getUTCDate(), lastDay)));
};
const weekday = (iso: string) => new Date(fromIso(iso)).getUTCDay();
const monthKey = (iso: string) => iso.slice(0, 7);
const todayIso = () => {
  const now = new Date();
  return toIso(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
};

/**
 * Calendar date picker. Mirrors the Figma "Calendar date picker" component.
 *
 * @fires input - When the user picks a date, before Done confirms it
 * @fires change - When the user confirms the picked date with Done
 */
export class CcCalendar extends LitElement {
  /** @internal */
  static formAssociated = true;

  static properties = {
    value: { type: String, reflect: true },
    min: { type: String, reflect: true },
    max: { type: String, reflect: true },
    locale: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
    draft: { state: true },
    focusDate: { state: true },
  };

  /** @internal */
  private internals = this.attachInternals();

  declare value: string;
  declare min: string;
  declare max: string;
  declare locale?: string;
  declare disabled: boolean;
  declare required: boolean;
  /** @internal */
  declare draft: string;
  /** @internal */
  declare focusDate: string;

  constructor() {
    super();
    this.value = '';
    this.min = '';
    this.max = '';
    this.disabled = false;
    this.required = false;
    this.draft = '';
    this.focusDate = todayIso();
    this.addEventListener('click', this.handleHostClick);
  }

  /** @internal */
  private handleHostClick = (event: MouseEvent) => {
    if (this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };

  /** @internal */
  willUpdate(changed: PropertyValues<this>) {
    if (changed.has('value')) {
      this.draft = this.value;
      if (isIsoDate(this.value)) this.focusDate = this.value;
    }
  }

  updated() {
    const committed = isIsoDate(this.value) ? this.value : '';
    this.internals.setFormValue(committed || null);
    this.validate(committed);
  }

  /** @internal */
  private validate(committed: string) {
    if (!committed) {
      if (this.required) this.internals.setValidity({ valueMissing: true }, 'Select a date.');
      else this.internals.setValidity({});
      return;
    }
    const underflow = isIsoDate(this.min) && committed < this.min;
    const overflow = isIsoDate(this.max) && committed > this.max;
    if (underflow || overflow) {
      this.internals.setValidity(
        { rangeUnderflow: underflow, rangeOverflow: overflow },
        'Select a date within the allowed range.',
      );
    } else {
      this.internals.setValidity({});
    }
  }

  /** @internal */
  formResetCallback() {
    this.value = '';
    this.draft = '';
  }

  /** @internal */
  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  /** @internal */
  private isUnavailable(iso: string) {
    return (isIsoDate(this.min) && iso < this.min) || (isIsoDate(this.max) && iso > this.max);
  }

  /** @internal */
  private select(iso: string) {
    if (this.disabled || this.isUnavailable(iso)) return;
    this.draft = iso;
    this.focusDate = iso;
    this.dispatchEvent(new Event('input', { bubbles: true }));
    this.updateComplete.then(() => this.focusCell(iso));
  }

  /** @internal */
  private done() {
    if (this.disabled || this.draft === this.value) return;
    this.value = this.draft;
    this.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /** @internal */
  private cancel() {
    if (this.disabled) return;
    this.draft = this.value;
    if (isIsoDate(this.value)) this.focusDate = this.value;
  }

  /** @internal */
  private moveMonth(months: number) {
    this.focusDate = addMonths(this.focusDate, months);
  }

  /** @internal */
  private nextFocusDate(key: string) {
    const current = this.focusDate;
    switch (key) {
      case 'ArrowLeft':
        return addDays(current, -1);
      case 'ArrowRight':
        return addDays(current, 1);
      case 'ArrowUp':
        return addDays(current, -7);
      case 'ArrowDown':
        return addDays(current, 7);
      case 'Home':
        return addDays(current, -weekday(current));
      case 'End':
        return addDays(current, 6 - weekday(current));
      case 'PageUp':
        return addMonths(current, -1);
      case 'PageDown':
        return addMonths(current, 1);
      default:
        return undefined;
    }
  }

  /** @internal */
  private handleGridKeydown(event: KeyboardEvent) {
    const next = this.nextFocusDate(event.key);
    if (!next) return;
    event.preventDefault();
    this.focusDate = next;
    this.updateComplete.then(() => this.focusCell(next));
  }

  /** @internal */
  private focusCell(iso: string) {
    this.shadowRoot?.querySelector<HTMLButtonElement>(`button[data-date="${iso}"]`)?.focus();
  }

  /** @internal */
  private get locales() {
    return this.locale || undefined;
  }

  /** @internal */
  private monthTitle() {
    return new Intl.DateTimeFormat(this.locales, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
      fromIso(this.focusDate),
    );
  }

  /** @internal */
  private weekdayNames() {
    const format = new Intl.DateTimeFormat(this.locales, { weekday: 'short', timeZone: 'UTC' });
    return Array.from({ length: 7 }, (_, index) => format.format(Date.UTC(2024, 0, 7 + index)));
  }

  /** @internal */
  private weeks() {
    const date = new Date(fromIso(this.focusDate));
    const first = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1);
    const offset = weekday(toIso(first));
    const daysInMonth = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
    const rowCount = Math.max(5, Math.ceil((offset + daysInMonth) / 7));
    return Array.from({ length: rowCount }, (_, row) =>
      Array.from({ length: 7 }, (_, column) => toIso(first + (row * 7 + column - offset) * DAY_MS)),
    );
  }

  /** @internal */
  private renderDay(iso: string) {
    const selected = iso === this.draft;
    const outside = monthKey(iso) !== monthKey(this.focusDate);
    const unavailable = this.isUnavailable(iso);
    const label = new Intl.DateTimeFormat(this.locales, { dateStyle: 'full', timeZone: 'UTC' }).format(fromIso(iso));
    return html`<div class="cell" role="gridcell" aria-selected=${selected ? 'true' : 'false'}>
      <button
        type="button"
        data-date=${iso}
        aria-label=${label}
        ?disabled=${this.disabled}
        aria-disabled=${unavailable ? 'true' : 'false'}
        tabindex=${iso === this.focusDate ? 0 : -1}
        ?data-selected=${selected}
        ?data-outside=${outside}
        @click=${() => this.select(iso)}
      >${Number(iso.slice(8))}</button>
    </div>`;
  }

  static styles = css`
      :host {
        display: inline-block;
        --_cell: 36px;
      }
      :host([hidden]) {
        display: none;
      }
      :host([disabled]) .calendar {
        cursor: not-allowed;
      }
      :host([disabled]) .header,
      :host([disabled]) .grid,
      :host([disabled]) hr {
        opacity: 0.4;
      }

      .calendar {
        display: flex;
        flex-direction: column;
        gap: var(--cc-gap-gap-2);
        padding: var(--cc-padding-padding-2);
        width: max-content;
        border-radius: var(--cc-radius);
        background: var(--cc-surface-surface-2);
        color: var(--cc-text-high-emphasis);
        font-family: var(--cc-typeface-typeface);
        font-variation-settings: 'YOPQ' 300;
      }

      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: var(--_cell);
      }
      .title {
        font-size: var(--cc-text-size-label-l);
        line-height: var(--cc-line-height-label-l);
        font-weight: var(--cc-font-weight-semi-bold);
      }
      .nav {
        display: grid;
        place-items: center;
        width: var(--_cell);
        height: var(--_cell);
        padding: 0;
        border: none;
        border-radius: var(--cc-radius);
        background: transparent;
        color: var(--cc-text-medium-emphasis);
        cursor: pointer;
      }
      .nav:hover {
        background: var(--cc-surface-surface-highlight-transparent);
      }
      .nav:active {
        opacity: 0.7;
      }
      .nav:disabled {
        cursor: not-allowed;
      }
      .nav:focus-visible,
      .cell button:focus-visible {
        outline: 2px solid var(--cc-border-focus);
      }
      .chevron::before {
        font-family: 'Material Icons Round';
        font-size: var(--cc-icon-sm);
        line-height: 1;
        content: '\\e5cb';
      }
      .chevron-right::before {
        content: '\\e5cc';
      }

      .grid {
        display: flex;
        flex-direction: column;
        gap: var(--cc-gap-gap-0-5);
      }
      .weekdays,
      .week {
        display: grid;
        grid-template-columns: repeat(7, var(--_cell));
        gap: var(--cc-gap-gap-0-5);
      }
      .weekday {
        display: grid;
        place-items: center;
        height: var(--_cell);
        color: var(--cc-text-low-emphasis);
        font-size: var(--cc-text-size-label-m);
        line-height: var(--cc-line-height-label-m);
      }

      .cell button {
        width: var(--_cell);
        height: var(--_cell);
        padding: 0;
        border: none;
        border-radius: var(--cc-unit-1x);
        background: transparent;
        color: inherit;
        font-family: var(--cc-typeface-typeface);
        font-size: var(--cc-text-size-label-l);
        line-height: var(--cc-line-height-label-l);
        font-variation-settings: 'YOPQ' 300;
        cursor: pointer;
      }
      .cell button:hover {
        background: var(--cc-surface-surface-highlight-transparent);
      }
      .cell button:active {
        opacity: 0.7;
      }
      .cell button[data-outside] {
        color: var(--cc-text-low-emphasis);
      }
      .cell button[data-selected] {
        border-radius: var(--cc-radius);
        background: var(--cc-accent-main);
        color: var(--cc-text-high-emphasis);
      }
      .cell button[aria-disabled='true'] {
        cursor: not-allowed;
      }
      :host(:not([disabled])) .cell button[aria-disabled='true'] {
        opacity: 0.4;
      }

      hr {
        margin: 0;
        border: none;
        border-top: 2px solid var(--cc-border-low-contrast);
      }
      .footer {
        display: flex;
        justify-content: flex-end;
        gap: var(--cc-gap-gap-2);
      }
    `;

  render() {
    const weeks = this.weeks();
    return html`<div class="calendar">
      <div class="header">
        <button
          type="button"
          class="nav"
          aria-label="Previous month"
          ?disabled=${this.disabled}
          @click=${() => this.moveMonth(-1)}
        >
          <span class="chevron chevron-left" aria-hidden="true"></span>
        </button>
        <div class="title" id="title" aria-live="polite">${this.monthTitle()}</div>
        <button
          type="button"
          class="nav"
          aria-label="Next month"
          ?disabled=${this.disabled}
          @click=${() => this.moveMonth(1)}
        >
          <span class="chevron chevron-right" aria-hidden="true"></span>
        </button>
      </div>
      <div class="grid" role="grid" aria-labelledby="title" @keydown=${this.handleGridKeydown}>
        <div role="row" class="weekdays">
          ${this.weekdayNames().map((name) => html`<div role="columnheader" class="weekday">${name}</div>`)}
        </div>
        ${repeat(
          weeks,
          (week) => week[0],
          (week) => html`<div role="row" class="week">
            ${repeat(
              week,
              (iso) => iso,
              (iso) => this.renderDay(iso),
            )}
          </div>`,
        )}
      </div>
      <hr />
      <div class="footer">
        <cc-button variant="text" color="secondary" ?disabled=${this.disabled} @click=${this.cancel}>Cancel</cc-button>
        <cc-button variant="filled" color="primary" ?disabled=${this.disabled} @click=${this.done}>Done</cc-button>
      </div>
    </div>`;
  }
}

if (!customElements.get('cc-calendar')) {
  customElements.define('cc-calendar', CcCalendar);
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-calendar': CcCalendar;
  }
}
