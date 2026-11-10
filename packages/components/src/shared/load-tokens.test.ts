import { afterEach, describe, expect, it } from 'vitest';
import '../textarea/cc-textarea.js';
import type { CcTextarea } from '../textarea/cc-textarea.js';

const rootVar = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

afterEach(() => {
  document.head.querySelectorAll('style').forEach((s) => s.remove());
  document.body.innerHTML = '';
});

describe('default tokens', () => {
  it('are available once a component is imported, without importing tokens.css', async () => {
    expect(rootVar('--cc-radius')).toBe('4px');
    document.body.innerHTML = '<cc-textarea label="Label"></cc-textarea>';
    const el = document.querySelector('cc-textarea') as CcTextarea;
    await el.updateComplete;
    expect(getComputedStyle(el.shadowRoot!.querySelector('.field')!).borderTopLeftRadius).toBe('4px');
  });

  it('are added to the document only once', async () => {
    await import('./load-tokens.js');
    const own = document.adoptedStyleSheets.filter((s) => [...s.cssRules].some((r) => r instanceof CSSLayerBlockRule && r.name === 'cc-tokens'));
    expect(own).toHaveLength(1);
  });

  it('lose to an unlayered override from the app', () => {
    const style = document.createElement('style');
    style.textContent = ':root { --cc-radius: 9px; }';
    document.head.append(style);
    expect(rootVar('--cc-radius')).toBe('9px');
  });
});
