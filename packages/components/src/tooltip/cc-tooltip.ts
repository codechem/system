import { LitElement, css, html, type PropertyValues } from 'lit';

let count = 0;

const anchorNames = (el: HTMLElement) =>
  el.style
    .getPropertyValue('anchor-name')
    .split(',')
    .map((n) => n.trim())
    .filter((n) => n && n !== 'none');

/**
 * Tooltip. Mirrors the Figma "Tooltip" component set. Shows next to the element whose id is in `for`,
 * on hover and keyboard focus, and describes it to assistive tech.
 *
 * @slot - Tooltip text
 * @csspart bubble - The bubble around the text
 */
export class CcTooltip extends LitElement {
  static properties = {
    for: { type: String, reflect: true },
    placement: { type: String, reflect: true },
  };

  declare for: string;
  declare placement: 'top' | 'bottom' | 'left' | 'right';

  /** @internal */
  private anchor: HTMLElement | null = null;
  /** @internal */
  private root: Document | ShadowRoot | null = null;
  /** @internal */
  private anchorName = `--cc-tooltip-${++count}`;
  /** @internal */
  private hovered = false;
  /** @internal */
  private focused = false;
  /** @internal */
  private hideTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    super();
    this.for = '';
    this.placement = 'top';
    this.addEventListener('mouseenter', () => this.setHovered(true));
    this.addEventListener('mouseleave', () => this.setHovered(false));
  }

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'tooltip');
    this.setAttribute('popover', 'manual');
    this.root = this.getRootNode() as Document | ShadowRoot;
    for (const [type, listener] of this.rootListeners) this.root.addEventListener(type, listener as EventListener);
    document.addEventListener('keydown', this.handleKeyDown);
    this.resolve();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    for (const [type, listener] of this.rootListeners) this.root?.removeEventListener(type, listener as EventListener);
    document.removeEventListener('keydown', this.handleKeyDown);
    this.root = null;
    this.hovered = this.focused = false;
    this.attach(null);
  }

  updated(changed: PropertyValues<this>) {
    if (changed.has('for')) this.resolve();
  }

  show = () => {
    clearTimeout(this.hideTimer);
    if (!this.anchor || !this.isConnected || this.matches(':popover-open')) return;
    this.showPopover();
  };

  hide = () => {
    clearTimeout(this.hideTimer);
    if (this.matches(':popover-open')) this.hidePopover();
  };

  /** @internal */
  private resolve() {
    if (!this.root) return;
    this.attach(this.for ? (this.root.getElementById(this.for) as HTMLElement | null) : null);
  }

  /** @internal */
  private setHovered(hovered: boolean) {
    this.hovered = hovered;
    this.sync();
  }

  /** @internal */
  private sync() {
    if (this.hovered || this.focused) return this.show();
    clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(this.hide, 100);
  }

  /** @internal */
  private trigger(event: Event) {
    const target = this.for ? this.root?.getElementById(this.for) : null;
    const trigger = target && event.composedPath().includes(target) ? (target as HTMLElement) : null;
    if (trigger && trigger !== this.anchor) this.attach(trigger);
    return trigger ?? null;
  }

  /** @internal */
  private get rootListeners(): [string, (event: Event) => void][] {
    return [
      ['mouseover', (e) => this.trigger(e) && this.setHovered(true)],
      ['mouseout', (e) => {
        const trigger = this.trigger(e);
        const to = (e as MouseEvent).relatedTarget as Node | null;
        if (trigger && !(to && (trigger.contains(to) || this.contains(to)))) this.setHovered(false);
      }],
      ['focusin', (e) => {
        if (!this.trigger(e)) return;
        this.focused = true;
        this.sync();
      }],
      ['focusout', (e) => {
        if (!this.trigger(e)) return;
        this.focused = false;
        if (!this.hovered) this.hide();
      }],
    ];
  }

  /** @internal */
  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || !this.matches(':popover-open')) return;
    event.preventDefault();
    this.hide();
  };

  /** @internal */
  private attach(anchor: HTMLElement | null) {
    if (anchor === this.anchor) return;
    const old = this.anchor;
    this.anchor = anchor;
    this.hide();
    if (old) {
      const rest = anchorNames(old).filter((n) => n !== this.anchorName);
      if (rest.length) old.style.setProperty('anchor-name', rest.join(', '));
      else old.style.removeProperty('anchor-name');
      this.describe(old, false);
    }
    if (!anchor) return this.style.removeProperty('position-anchor');
    anchor.style.setProperty('anchor-name', [...anchorNames(anchor), this.anchorName].join(', '));
    this.style.setProperty('position-anchor', this.anchorName);
    this.describe(anchor, true);
  }

  /** @internal */
  private async describe(anchor: HTMLElement, on: boolean) {
    if (anchor.localName.includes('-')) await customElements.whenDefined(anchor.localName);
    await (anchor as Partial<LitElement>).updateComplete;
    if (on && this.anchor !== anchor) return;
    const target = anchor.shadowRoot?.querySelector<HTMLElement>('button, a, input, select, textarea') ?? anchor;
    const others = (target.ariaDescribedByElements ?? []).filter((el) => el !== this);
    target.ariaDescribedByElements = on ? [...others, this] : others;
  }

  static styles = css`
    :host {
      --_arrow-width: 16px;
      --_arrow-depth: 6px;
      --_offset: var(--cc-gap-gap-1);
      position-area: top;
      margin: 0 0 var(--_offset);
      inset: auto;
      border: 0;
      padding: 0;
      overflow: visible;
      background: none;
    }
    :host([placement='bottom']) {
      position-area: bottom;
      margin: var(--_offset) 0 0;
    }
    :host([placement='left']) {
      position-area: left;
      margin: 0 var(--_offset) 0 0;
    }
    :host([placement='right']) {
      position-area: right;
      margin: 0 0 0 var(--_offset);
    }
    :host([hidden]) {
      display: none;
    }

    .bubble {
      position: relative;
      padding: var(--cc-padding-padding-0-5) var(--cc-padding-padding-1);
      border-radius: var(--cc-radius);
      background: var(--cc-surface-surface-black, var(--cc-palette-black));
      color: var(--cc-text-high-emphasis);
      font-family: var(--cc-typeface-typeface);
      font-weight: var(--cc-font-weight-regular);
      font-size: var(--cc-text-size-label-m);
      line-height: var(--cc-line-height-label-m);
      font-variation-settings: 'YOPQ' 300;
      white-space: nowrap;
    }
    .bubble::after {
      content: '';
      position: absolute;
      background: inherit;
      width: var(--_arrow-width);
      height: calc(var(--_arrow-depth) + 2px);
      left: calc(50% - var(--_arrow-width) / 2);
      bottom: calc(var(--_arrow-depth) * -1);
      clip-path: polygon(0 0, 100% 0, 50% 100%);
    }
    :host([placement='bottom']) .bubble::after {
      bottom: auto;
      top: calc(var(--_arrow-depth) * -1);
      clip-path: polygon(50% 0, 100% 100%, 0 100%);
    }
    :host([placement='left']) .bubble::after,
    :host([placement='right']) .bubble::after {
      width: calc(var(--_arrow-depth) + 2px);
      height: var(--_arrow-width);
      top: calc(50% - var(--_arrow-width) / 2);
      bottom: auto;
    }
    :host([placement='left']) .bubble::after {
      left: auto;
      right: calc(var(--_arrow-depth) * -1);
      clip-path: polygon(0 0, 100% 50%, 0 100%);
    }
    :host([placement='right']) .bubble::after {
      left: calc(var(--_arrow-depth) * -1);
      clip-path: polygon(100% 0, 100% 100%, 0 50%);
    }
  `;

  render() {
    return html`<div class="bubble" part="bubble"><slot></slot></div>`;
  }
}

if (!customElements.get('cc-tooltip')) {
  customElements.define('cc-tooltip', CcTooltip);
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-tooltip': CcTooltip;
  }
}
