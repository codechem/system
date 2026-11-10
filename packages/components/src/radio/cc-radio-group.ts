import { LitElement, css, html } from 'lit';
import type { CcRadio } from './cc-radio.js';
export { CcRadio } from './cc-radio.js';

/**
 * Radio group. Holds `<cc-radio>` options, submits the selected value and handles arrow keys.
 *
 * @slot - `<cc-radio>` elements
 * @fires change - When the user selects a radio
 * @fires input - When the user selects a radio
 */
export class CcRadioGroup extends LitElement {
  /** @internal */
  static formAssociated = true;

  static properties = {
    name: { type: String, reflect: true },
    value: { type: String },
  };

  /** @internal */
  private internals = this.attachInternals();
  /** @internal */
  private observer = new MutationObserver(() => this.syncRadios());

  declare name: string;
  declare value: string;

  constructor() {
    super();
    this.value = '';
    this.addEventListener('click', this.handleClick);
    this.addEventListener('keydown', this.handleKeyDown);
  }

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'radiogroup');
    this.observer.observe(this, { childList: true, subtree: true, attributeFilter: ['disabled'] });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.observer.disconnect();
  }

  /** @internal */
  formResetCallback() {
    this.value = this.getAttribute('value') ?? '';
  }

  focus(options?: FocusOptions) {
    this.radios.find((r) => r.tabIndex === 0)?.focus(options);
  }

  updated() {
    this.syncRadios();
  }

  /** @internal */
  private get radios() {
    return [...this.querySelectorAll<CcRadio>('cc-radio')].filter((r) => r.closest('cc-radio-group') === this);
  }

  /** @internal */
  private syncRadios() {
    const radios = this.radios;
    for (const radio of radios) radio.checked = radio.value === this.value;
    this.internals.setFormValue(radios.some((r) => r.checked) ? this.value : null);
    const tabbable = radios.find((r) => r.checked && !r.disabled) ?? radios.find((r) => !r.disabled);
    for (const radio of radios) {
      if (radio.disabled) radio.removeAttribute('tabindex');
      else radio.tabIndex = radio === tabbable ? 0 : -1;
    }
  }

  /** @internal */
  private select(radio: CcRadio) {
    if (radio.checked || radio.disabled) return;
    this.value = radio.value;
    this.syncRadios();
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    this.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /** @internal */
  private handleClick = (event: MouseEvent) => {
    const radio = (event.target as Element).closest('cc-radio');
    if (radio && !radio.disabled) this.select(radio);
  };

  /** @internal */
  private handleKeyDown = (event: KeyboardEvent) => {
    const radio = (event.target as Element).closest('cc-radio');
    if (!radio) return;
    if (event.key === ' ') {
      event.preventDefault();
      this.select(radio);
      return;
    }
    const step = ({ ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 } as Record<string, number>)[event.key];
    if (!step) return;
    event.preventDefault();
    const radios = this.radios;
    const start = radios.indexOf(radio);
    for (let i = 1; i < radios.length; i++) {
      const next = radios[(((start + step * i) % radios.length) + radios.length) % radios.length];
      if (next.disabled) continue;
      this.select(next);
      next.focus();
      return;
    }
  };

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
    }
    :host([hidden]) {
      display: none;
    }
  `;

  render() {
    return html`<slot></slot>`;
  }
}

if (!customElements.get('cc-radio-group')) {
  customElements.define('cc-radio-group', CcRadioGroup);
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-radio-group': CcRadioGroup;
  }
}
