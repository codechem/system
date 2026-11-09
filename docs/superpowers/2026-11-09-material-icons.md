# Icons: Figma audit and the switch to the Material Icons font

**Date:** 2026-11-09
**Base:** `585a743`. Changes are uncommitted in the working tree.

## Goal

1. Find out how many icons on the Figma "Icons" page (`299:10630`) are custom and how many come from Material.
2. Draw component icons with the Material icon font from Google Fonts instead of inline SVG paths.

## Figma audit

The page has 2,132 icon component sets.

| Source | Count | How to tell |
|---|---|---|
| Google Material Icons (classic set) | 2,122 | Material names such as `check_box` and `wb_sunny`, plus all five classic styles: Filled, Outlined, Round, Sharp and Two Tone |
| Material Design Icons (Pictogrammers, a community set, not Google) | 5 | `mdi:web`, `mdi:linkedin`, `mdi:github`, `mdi:facebook`, `mdi:instagram` |
| Bootstrap Icons | 2 | `bi:twitter-x`, `bi:google` |
| Custom-drawn | 3 | `icon/sidebar-collapse`, `icon/sidebar-expand`, `minimize/hide sidebar` |

**About the third-party icons:** the `mdi:` and `bi:` prefixes are Iconify's naming, so those 7 were most likely imported with the Iconify plugin, not drawn in-house.

**Which style the components use:** Material's **Round** style. The checkbox paths match Round `check_box` exactly, and the alert icons have Round's rounded corners.

## Requirements

- Component icons come from Google's hosted **Material Icons Round** font, the same set and style as Figma. Material Symbols was not used, because its glyphs differ slightly from the Figma icons.
- Icon sizes, colours and states look the same as before.
- Consumers know they need to load the font.

## Steps taken

1. **Shared styles.** Added `src/shared/icon-styles.ts` (`iconStyles`): a copy of Google's `.material-icons-round` rules, plus a fixed 1em × 1em box. The fonts' `@font-face` applies inside shadow DOM, but the page's class does not, so each component needs these rules itself.
2. **`cc-alert`:** the status and close icons are now ligature spans: `error`, `warning`, `info`, `check_circle` and `close`. Their sizes are set with `font-size` (`--cc-icon-md`, `--cc-icon-sm`).
3. **`cc-checkbox`:**
   - The icon is a `check_box` / `check_box_outline_blank` ligature span, coloured with `color`.
   - The focus ring moved from the SVG `rect` to a CSS `::after` sized in `em`: inset 1/24em, radius 2.44/24em, 2px outline. That matches Figma exactly at both sizes, which the SVG version didn't at Medium.
4. **Slotted icons in `cc-button` and `cc-alert`:**
   - Both components now set `font-size` on slotted icons, so a font icon follows the component size.
   - It's marked `!important` because Google's class sets `font-size: 24px` in the page, and page styles normally beat `::slotted` rules. For `!important` rules the component's rule wins.
5. **Stories:** the button stories use `<span class="material-icons-round">` in place of the inline SVGs.
6. **Storybook:** `preview-head.html` loads the font.
7. **README:** "Using the components in an app" shows the font link, says what happens without it, and how to use the font for slot icons.
8. **Tests:** the checkbox tests read `color` in place of `fill`. The label-click tests click by position, because the label's text now includes the icon's ligature name.

## Verification

- `vitest`: 46/46 pass. `tsc` is clean, and `npm run build` succeeds.
- **Storybook with the font loaded:**
  - the checkbox (with the keyboard focus ring), all alert variants and all button variants render the Material glyphs;
  - slotted button icons measure 24px at large and medium and 20px at small.

## Trade-offs

- **The font must be loaded.** Without it, each icon shows the start of its name as text, such as "ch", cut off to the icon's box so the layout doesn't break. The font blocks text rendering for a short time while it loads, so this rarely shows.
- **Slotted font icons can't be resized from outside.** Because of the `!important`, a page style or an inline `font-size` won't change their size. They always follow the component size. Slotted SVGs can still be resized with `width`/`height`.
- **It's a network dependency on Google Fonts.** To self-host, the `material-icons` npm package ships the same font files.
- **Assistive tech:** ligature names are `aria-hidden`, so screen readers don't read them. Accessible names are unchanged; this is covered by the tests.

## Left out

- **The 10 non-Google icons:** no component uses them yet. If one does, it will need an SVG or a different source, because the Google font doesn't contain them.
- **Bundling the font** into `@codechem/tokens`: not needed while Google Fonts serves it.

## Review

Reviewed with `superpowers:requesting-code-review` by a separate reviewer agent. It used throwaway browser tests in a scratch clone, both with the real font and without it.

**Verdict:** "ready with fixes", with no critical issues.

**What the reviewer confirmed:**
- **Glyphs:** the font glyphs overlap the old SVGs at 0.91–0.99 (1.0 means identical).
- **Sizes and colours** are unchanged.
- **`!important`:** the cascade claim holds; a small button gets a 20px icon.
- **Accessible names:** they don't include ligature names, and copying text doesn't pick them up either.
- **Focus ring:** it equals the old SVG ring at 24px, and the outline follows `border-radius`.
- **Alert icon slot:** it works for both SVG and font icons.
- **Clean-up:** no dead code is left.

| Severity | Finding | Fix |
|---|---|---|
| Important | The checkbox's `overflow: visible` (needed for the focus ring) let the ligature name overflow onto the label when the font is missing | Added `clip-path: inset(-2px)`: the name is clipped and the ring still shows |
| Important | The README slot example had no `aria-hidden`, so buttons were named "add Save" | Added `aria-hidden="true"` and a sentence on why |
| Minor | Slotted font icons can't be resized by consumers | Documented under Trade-offs |
| Minor | The fallback trade-off note understated what's shown | Rewritten |
| Minor | No alert test that ligatures are hidden from assistive tech | Added a test |
| Minor | `clickLabelText` clicks a hard-coded point | Left as is; it's the simplest reliable way while the label contains the ligature text |
