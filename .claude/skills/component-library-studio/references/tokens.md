# Tokens: discovery, role mapping, contrast

## Where tokens live

- **CSS custom properties:** a built `tokens.css`, `:root` blocks, or `[data-theme]` blocks. Run `scripts/extract_tokens.mjs` on the file or folder.
- **Tailwind:** `tailwind.config.*` `theme.extend.colors`, or in v4 the `@theme { --color-* }` blocks in CSS (the script reads those too).
- **JS themes:** files such as `theme.ts`, `tokens.json` or Style Dictionary sources. Read the built output if it exists, because it's what the components actually use.
- **Inside components:** if components ship their own token sheet (for example they inject `:root` variables in a cascade layer), check the installed package. That copy is the source of truth for the app, not the repo source.

## Map tokens to roles

Prefer **semantic tokens** (`surface`, `text-high-emphasis`, `accent-main`) over palette primitives (`gray-700`). Use primitives only for things the semantics don't cover, such as a theme switcher that swaps accent palettes:

```css
--cc-accent-main: var(--cc-palette-purple-600);
```

If a project has no semantic layer, create the role variables yourself at the top of the page stylesheet and point them at primitives once. The rest of the CSS uses only the roles.

## Light or dark?

The extractor reports the default theme and any mode selectors.

- **Match the tokens.** If the tokens are dark-only, the page is dark. Don't invent a light theme by overriding the components' tokens.
- **If the brief needs the other mode** (for example a light marketing page with dark-only components), keep the page chrome in the brief's mode with your own neutral role variables. Put every component on a **stage** whose background and text come from the token surfaces. The stages then read as product screenshots, which is honest and looks intentional.
- **If modes exist** (`[data-theme="dark"]`, `prefers-color-scheme` blocks), honour them and test both.
- Never offer a light/dark toggle the tokens can't support.

## Colour strategy

- Chrome is neutral (canvas, surfaces, lines and ink). The accent covers well under 10% of the page: primary actions, links, focus rings and one brand moment, such as a hero word, a CTA band, or the theming section.
- The status colours (success, error, warning and info) mean status only. Never use them for decoration.
- One brand moment may be **drenched**: a full-bleed band in the accent's dark shade with white text. Keep it to one per page.
- No glows, gradient text or glass. A soft radial tint of the accent behind the hero is the most you need, and you rarely need it at all.

## Contrast

- Body text needs at least 4.5:1 and large text (24px, or 18.66px bold) at least 3:1, measured against the surface it actually sits on.
- Text on an accent fill: check the token's `contrast` partner, such as `--cc-accent-contrast`. For white text, mid-range greens and blues often only reach about 4.5:1 at the 600 step, so use the 700 or 800 step for small text.
- Muted ink on raised surfaces is the usual failure. If `ink-subtle` is under 4.5:1 on `surface-2`, use `ink-muted` for anything that must be read.
- Quick check in the browser console:

```js
const L = (c) => { const [r, g, b] = c.match(/\d+(\.\d+)?/g).slice(0, 3).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [L(a), L(b)].sort((m, n) => n - m); return ((x + 0.05) / (y + 0.05)).toFixed(2); };
ratio(getComputedStyle(el).color, getComputedStyle(el.closest('.block')).backgroundColor);
```

## Theming controls (a "token lab")

A live theme control is the best demo a token-driven library has. Scope the overrides to a stage element, not `:root`, so the rest of the page keeps the brand. Swap only the roles that palette primitives back (the accent family and the radius). Also show the generated CSS so the user can copy it.
