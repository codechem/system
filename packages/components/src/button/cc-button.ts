import { LitElement, css, html } from 'lit';

export class CcButton extends LitElement {
  static properties = {
    variant: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
  };

  declare variant: 'primary' | 'secondary';
  declare disabled: boolean;

  constructor() {
    super();
    this.variant = 'primary';
    this.disabled = false;
    this.addEventListener('click', this.handleHostClick);
  }

  private handleHostClick = (event: MouseEvent) => {
  };

  static styles = css`
    :host {
      display: inline-block;
    }
    :host([disabled]) {
      cursor: not-allowed;
    }
    button {
      font: inherit;
      font-family: var(--cc-font-family);
      padding: var(--cc-space-2) var(--cc-space-4);
      border: none;
      border-radius: var(--cc-radius-md);
      cursor: inherit;
      background: var(--cc-color-action-primary);
      color: var(--cc-color-on-action-primary);
    }
    button:hover:not(:disabled) {
      background: var(--cc-color-action-primary-hover);
    }
    :host([variant='secondary']) button {
      background: var(--cc-color-action-secondary);
      color: var(--cc-color-on-action-secondary);
    }
    :host([variant='secondary']) button:hover:not(:disabled) {
      background: var(--cc-color-action-secondary-hover);
    }
    button:focus-visible {
      outline: 2px solid var(--cc-color-focus-ring);
      outline-offset: 2px;
    }
    button:disabled {
      opacity: 0.5;
    }
  `;

  render() {
    return html`<button part="button" ?disabled=${this.disabled}><slot></slot></button>`;
  }
}

if (!customElements.get('cc-button')) {
  customElements.define('cc-button', CcButton);
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-button': CcButton;
  }
}
