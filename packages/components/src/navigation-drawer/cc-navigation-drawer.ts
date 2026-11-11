import { LitElement, type PropertyValues, type TemplateResult, css, html, nothing } from 'lit';
import { iconStyles } from '../shared/icon-styles.js';
import '../shared/load-tokens.js';

export type NavigationItem = {
  label: string;
  icon: string;
  href?: string;
  selected?: boolean;
  children?: NavigationItem[];
};

const findSelectedPath = (items: NavigationItem[], prefix = ''): string | undefined => {
  for (const [index, item] of items.entries()) {
    const path = prefix ? `${prefix}-${index}` : `${index}`;
    if (item.children?.length) {
      const nested = findSelectedPath(item.children, path);
      if (nested !== undefined) return nested;
    } else if (item.selected) {
      return path;
    }
  }
  return undefined;
};

/**
 * Navigation drawer. Mirrors the Figma "Navigation Drawer" component, expanded (256px) and as the rail (64px, `collapsed`).
 *
 * @slot logo - Full logo, shown when expanded
 * @slot logomark - Logo mark, shown when collapsed
 * @fires select - When the user activates a menu item; `detail` is the item
 * @fires change - When the user expands or collapses the drawer; `detail` is `{ collapsed }`
 */
export class CcNavigationDrawer extends LitElement {
  static properties = {
    collapsed: { type: Boolean, reflect: true },
    items: { attribute: false },
    ariaLabel: { attribute: 'aria-label' },
    openGroups: { state: true },
    currentPath: { state: true },
  };

  /** @internal */
  declare collapsed: boolean;
  declare items: NavigationItem[];
  declare ariaLabel: string | null;
  /** @internal */
  declare openGroups: Set<string>;
  /** @internal */
  declare currentPath: string;

  constructor() {
    super();
    this.collapsed = false;
    this.items = [];
    this.openGroups = new Set();
    this.currentPath = '';
  }

  /** @internal */
  willUpdate(changed: PropertyValues<this>) {
    if (changed.has('items')) this.currentPath = findSelectedPath(this.items) ?? '';
  }

  /** @internal */
  private toggleGroup(label: string) {
    const next = new Set(this.openGroups);
    if (next.has(label)) next.delete(label);
    else next.add(label);
    this.openGroups = next;
  }

  /** @internal */
  private select(item: NavigationItem, path: string) {
    this.currentPath = path;
    this.dispatchEvent(new CustomEvent<NavigationItem>('select', { bubbles: true, detail: item }));
  }

  /** @internal */
  private toggleCollapsed() {
    this.collapsed = !this.collapsed;
    this.dispatchEvent(new CustomEvent('change', { bubbles: true, detail: { collapsed: this.collapsed } }));
  }

  /** @internal */
  private renderItem(item: NavigationItem, path: string): TemplateResult {
    const icon = html`<span class="material-icon" aria-hidden="true">${item.icon}</span>`;
    const label = html`<span class="label">${item.label}</span>`;

    if (item.children?.length) {
      const open = this.openGroups.has(path);
      const id = `group-${path}`;
      return html`<li>
        <button
          type="button"
          class="item"
          aria-expanded=${open ? 'true' : 'false'}
          aria-controls=${id}
          @click=${() => this.toggleGroup(path)}
        >
          ${icon}${label}<span class="chevron material-icon" aria-hidden="true">arrow_drop_down</span>
        </button>
        <ul class="sub" id=${id} ?hidden=${!open}>
          ${item.children.map((child, childIndex) => this.renderItem(child, `${path}-${childIndex}`))}
        </ul>
      </li>`;
    }

    const current = path === this.currentPath ? 'page' : nothing;
    if (item.href === undefined) {
      return html`<li>
        <button type="button" class="item" aria-current=${current} @click=${() => this.select(item, path)}>
          ${icon}${label}
        </button>
      </li>`;
    }
    return html`<li>
      <a class="item" href=${item.href} aria-current=${current} @click=${() => this.select(item, path)}>
        ${icon}${label}
      </a>
    </li>`;
  }

  render() {
    return html`<nav class="drawer" aria-label=${this.ariaLabel ?? 'Main navigation'}>
      <div class="brand">
        <span class="logo-full"><slot name="logo"></slot></span>
        <span class="logo-mark"><slot name="logomark"></slot></span>
      </div>
      <ul class="menu">
        ${this.items.map((item, index) => this.renderItem(item, `${index}`))}
      </ul>
      <button type="button" class="collapse" @click=${this.toggleCollapsed}>
        <span class="label">${this.collapsed ? 'Expand navigation' : 'Collapse navigation'}</span>
        <span class="material-icon" aria-hidden="true">${this.collapsed ? 'menu' : 'menu_open'}</span>
      </button>
    </nav>`;
  }

  static styles = [
    iconStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        width: 256px;
        min-height: 100%;
        padding: var(--cc-padding-padding-1);
        background: var(--cc-surface-surface-2);
      }
      :host([collapsed]) {
        width: 64px;
      }
      :host([hidden]) {
        display: none;
      }

      .drawer {
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: var(--cc-gap-gap-5);
        font-family: var(--cc-typeface-typeface);
        font-variation-settings: 'YOPQ' 300;
      }

      .brand {
        display: flex;
        align-items: center;
        padding: 0 var(--cc-padding-padding-1-5);
      }
      .logo-mark {
        display: none;
      }
      :host([collapsed]) .logo-full {
        display: none;
      }
      :host([collapsed]) .logo-mark {
        display: block;
      }

      .menu,
      .sub {
        display: flex;
        flex-direction: column;
        gap: var(--cc-gap-gap-0-5);
        margin: 0;
        padding: 0;
        list-style: none;
      }
      .menu {
        flex: 1;
      }
      .sub[hidden] {
        display: none;
      }

      .item,
      .collapse {
        box-sizing: border-box;
        position: relative;
        display: flex;
        align-items: center;
        gap: var(--cc-gap-gap-1-5);
        width: 100%;
        min-height: 48px;
        margin: 0;
        padding: var(--cc-padding-padding-1-5);
        border: none;
        border-radius: var(--cc-radius);
        background: transparent;
        color: var(--cc-text-high-emphasis);
        font-family: var(--cc-typeface-typeface);
        font-size: var(--cc-text-size-label-l);
        line-height: var(--cc-line-height-label-l);
        font-weight: var(--cc-font-weight-medium);
        text-align: left;
        text-decoration: none;
        cursor: pointer;
      }
      .item:hover,
      .collapse:hover {
        background: var(--cc-surface-surface-1);
      }
      .item:active,
      .collapse:active {
        opacity: 0.7;
      }
      .item:focus-visible,
      .collapse:focus-visible {
        outline: 2px solid var(--cc-border-focus);
      }
      .item .material-icon,
      .collapse .material-icon {
        font-size: var(--cc-icon-md);
      }
      .item[aria-current='page'],
      .item[aria-expanded='true'] {
        background: var(--cc-surface-surface-1);
      }
      .item[aria-current='page'] {
        color: var(--cc-accent-light);
      }
      .item[aria-expanded='true'] .chevron {
        transform: rotate(180deg);
      }
      .chevron {
        margin-left: auto;
      }
      .sub {
        background: var(--cc-surface-surface-1);
      }
      .sub .item {
        color: var(--cc-text-medium-emphasis);
        padding-left: var(--cc-padding-padding-4);
      }
      .item[aria-current]:hover,
      .item[aria-expanded='true']:hover,
      .sub .item:hover {
        background: var(--cc-surface-surface-0);
      }
      .sub .item[aria-current='page'] {
        background: var(--cc-surface-surface-0);
        color: var(--cc-accent-light);
      }

      .collapse {
        padding: var(--cc-padding-padding-1-5) var(--cc-padding-padding-2) var(--cc-padding-padding-1-5)
          var(--cc-padding-padding-2-5);
        justify-content: space-between;
        color: var(--cc-text-medium-emphasis);
        font-weight: var(--cc-font-weight-semi-bold);
      }

      :host([collapsed]) .label {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
      }
      :host([collapsed]) .chevron {
        display: none;
      }
      :host([collapsed]) .item,
      :host([collapsed]) .sub .item,
      :host([collapsed]) .collapse {
        justify-content: center;
        padding: var(--cc-padding-padding-1-5);
      }
    `,
  ];
}

if (!customElements.get('cc-navigation-drawer')) {
  customElements.define('cc-navigation-drawer', CcNavigationDrawer);
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-navigation-drawer': CcNavigationDrawer;
  }
}
