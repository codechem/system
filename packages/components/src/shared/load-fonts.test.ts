import { describe, expect, it } from 'vitest';
import './load-tokens.js';

describe('bundled fonts', () => {
  it('registers Kumbh Sans and Material Icons Round without any app setup', async () => {
    await document.fonts.load('16px "Kumbh Sans"');
    await document.fonts.load('24px "Material Icons Round"');
    expect(document.fonts.check('16px "Kumbh Sans"')).toBe(true);
    expect(document.fonts.check('24px "Material Icons Round"')).toBe(true);
  });

  it('loads both faces from the package, not from Google Fonts', async () => {
    await document.fonts.load('16px "Kumbh Sans"');
    await document.fonts.load('24px "Material Icons Round"');
    const urls = performance.getEntriesByType('resource').map((entry) => entry.name);
    expect(urls.some((url) => url.endsWith('/fonts/kumbh-sans.woff2'))).toBe(true);
    expect(urls.some((url) => url.endsWith('/fonts/material-icons-round.woff2'))).toBe(true);
    expect(urls.some((url) => url.includes('fonts.gstatic.com') || url.includes('fonts.googleapis.com'))).toBe(false);
  });

  it('draws icon names as glyphs, not as text', async () => {
    await document.fonts.load('24px "Material Icons Round"');
    const icon = document.createElement('span');
    icon.className = 'material-icon';
    icon.textContent = 'menu';
    icon.style.cssText = 'font-family: "Material Icons Round"; font-size: 24px; font-feature-settings: "liga"; white-space: nowrap;';
    document.body.append(icon);
    const width = icon.getBoundingClientRect().width;
    icon.remove();
    expect(width).toBeCloseTo(24, 0);
  });

  it('styles the .material-icons-round class used in icon slots', async () => {
    await document.fonts.load('24px "Material Icons Round"');
    const icon = document.createElement('span');
    icon.className = 'material-icons-round';
    icon.textContent = 'add';
    document.body.append(icon);
    const width = icon.getBoundingClientRect().width;
    icon.remove();
    expect(width).toBeCloseTo(24, 0);
  });
});
