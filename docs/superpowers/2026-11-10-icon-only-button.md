# Icon-only buttons

**Date:** 2026-11-10
**Changes:** uncommitted in the working tree.

## Goal

Support the Figma "Icon Button" component set (file `K7Z7bb2IjqiyDjik5qjEoN`, set `332:12886`, 360 variants) in `<cc-button>`, then use it for the trailing close button of `<cc-list-item>`. The linked node `751:15490` is the Buttons documentation frame, which also holds "Button" (`304:85658`) and "Favourite Button" (`3866:9187`); only the Icon Button set is in scope.

## Requirements

### From Figma

- **Properties:** `Style` (Filled, Outlined, Icon Only, Accent), `Color` (Primary, Secondary, Destructive), `Size` (Large, Medium, Small), `State` (Enabled, Hovered, Focused, Pressed, Disabled), `Shape` (Square, Round), and an icon swap.
- **Sizes:** Large 48 (padding 12, icon 24), Medium 40 (padding 8, icon 24), Small 28 (padding 4, icon 20). Always square. The paddings equal the labelled button's vertical paddings.
- **Shape:** Square uses `radius` (4px), Round uses `round` (999).
- **Styles:**
  - Filled and Outlined: the same fills, strokes and icon colours as the labelled Button.
  - Icon Only: no fill, icon in the colour of the Button "Text" style. This is our existing `text` variant.
  - Accent (new): fill `Surface/surface-2`, hover `surface-1`, pressed `surface-shade`. Icon `Accent/light` (primary), `Text/high-emphasis` (secondary), `Alert/error/light` (destructive).
- **States:** Pressed is opacity 0.7. Disabled is opacity 0.4. Focused is a 2px `Border/focus` ring, 4px outside the button (already how `cc-button` draws focus), following the shape.

### Behaviour

- Same click, disabled and form behaviour as the labelled button.
- Needs an accessible name, since it has no text.

## Steps taken

1. **Read Figma** (read-only `use_figma`): properties, every Icon Only variant for the three sizes, Filled/Outlined/Accent in Medium for Primary and Secondary, the Destructive colours and the focus ring.
2. **API on `cc-button`:**
   - **`icon-only`:** the icon goes in the default slot, sized by the button (`--_icon`: 20px small, 24px otherwise). No new element: the labelled and icon-only buttons share colours, states, form behaviour and focus.
   - **`shape="square|round"`:** only applies with `icon-only` (Figma designs no round labelled button).
   - **`variant="accent"`:** new variant. Only designed for icon buttons; it also works on labelled buttons but nothing in Figma shows it.
   - **`aria-label`:** forwarded to the inner `<button>`, like the other components. This is the accessible name of an icon-only button.
3. **Styles:**
   - Square padding is `--_px: var(--_py)` on `:host([icon-only])`, placed after the size rules.
   - Accent sets `--_bg`, `--_bg-hover`, `--_fg`, plus a `button:active` fill of `surface-shade`.
   - Round is `border-radius: var(--cc-round)`.
4. **Stories:** `IconOnly`, `IconOnlyRound` and `AllIconOnlyVariants` (colour × style columns, size × shape × disabled rows, like the Figma frame). The existing `Args` gained `iconOnly` and `shape`.
5. **Tests:** 13 new in `cc-button.test.ts`: sizes and icon sizes (`it.each`), accessible name, round only with `icon-only`, text-variant hover tint, blocked clicks when disabled, accent colours (3 colours), accent hover/pressed fills (pressed with a real mouse press through CDP), accent disabled. Mutation-checked: removing the square padding, the pressed fill or the round radius each fails tests.
6. **List item:** the trailing button is now `<cc-button icon-only variant="text" color="secondary" size="small">`. Figma's Icon Button instance inside the list item overrides the icon to `Text/low-emphasis` (the Icon Only secondary default is `medium-emphasis`), so the list item sets `::part(button) { color: var(--cc-text-low-emphasis) }`. Its own native button, hover/focus styles and the "can't reuse `cc-button`" note are gone.

## Verification

- `tsc` is clean, `vitest` passes 181/181 (24 for the button, 29 for the list item, after the review fixes), `npm run build` succeeds.
- **Storybook against Figma:** the icon-only grid shows the three sizes (28/40/48), square and round, the four styles in the three colours and the disabled rows; the list item looks the same as before with the real button.

## Left out

- **Favourite Button** (`3866:9187`): a separate set, not part of this request.
- **`delegatesFocus` and `click()` forwarding on `cc-button`:** the pilot button never had them; only `aria-label` was added because an icon-only button needs a name.
- **Warning when an icon-only button has no name:** documented in the JSDoc only.
- **Round and Accent on the labelled button:** works through the attributes but isn't designed.
- **`custom-elements.json`, axe checks, visual snapshot, Code Connect, changeset:** Definition of Done items for the whole library.

## Designer questions

- **Accent on labelled buttons:** only the Icon Button set has it. Should the labelled Button get an Accent style too?
- **Round on labelled buttons:** same question for Round.
- **Close button colour in the list item:** the instance overrides the icon to `low-emphasis`; is that a deliberate difference from the Icon Only default (`medium-emphasis`)?
- **Hover on the list item's close button:** the icon button now tints on hover (the Icon Only hover state); Figma's list-item frames only show it Enabled.

## Review

Reviewed with a separate reviewer agent, in a scratch clone with throwaway probes (72 icon-only combinations, a before/after comparison of the labelled button, 9 button and 5 list-item mutations).

**Verdict:** no Critical issues; two Important findings (one fixed, one documented), four Minor.

**What the reviewer confirmed:**
- **Labelled button:** no regression across 3 variants × 3 colours × 3 sizes × enabled/disabled with both icon slots (width, height, padding, background, colour, radius, opacity identical to HEAD); submit and reset in a form fire once per click, Enter and Space.
- **Icon-only:** every variant × colour × size × shape is square at 28/40/48px, radius 4px or 999px, outlined stroke present, accent fills and icon colours match the spec, hover is surface-1, disabled stays at surface-2 at 0.4 and doesn't react to hover.
- **Specificity and ordering:** no problems.
- **Focus ring:** follows the round shape.
- **`aria-label`:** reaches the inner button.
- **List item:** the `::part(button)` colour resolves to low-emphasis, the button is 28×28, and `remove` fires once on click, Enter and Space with no row toggle.

| Severity | Finding | Fix or reason left |
|---|---|---|
| Important | The "does not reach click listeners when disabled" tests (the old labelled one and the new icon-only one) passed vacuously: `click()` on a disabled host is dropped by Chrome, so removing the guard in `handleHostClick` left all tests green | Both now dispatch a real `MouseEvent`; removing the guard fails both |
| Important | An icon-only button without `aria-label` has an empty name (or the ligature text, `close`, if the icon isn't `aria-hidden`); the host also shows up as a named generic in the AX tree | Documented in the JSDoc (`icon-only` needs `aria-label`); the host attribute follows the convention of the other components. No runtime warning, see Left out |
| Minor | Non-icon content in `icon-only` mode (text, a leading slot, two icons) breaks the square (88×40, 68×40, 72×40) | Left: outside the design; the JSDoc says the slot holds the icon |
| Minor | `shape` and `accent` matter only in some modes | As designed, see designer questions |
| Minor | No list-item test for keyboard Enter/Space on the remove button | Added (2 tests; the inner button is focused directly, since `cc-button` has no `delegatesFocus`) |
| Minor | The list item's 28px test measures the `.remove` host | Left: the reviewer measured the inner button too (28×28) |

**Declined by the reviewer:** Figma fidelity (it didn't open Figma), Storybook visuals, docs wording, whether `cc-button` needs `delegatesFocus` and `click()` forwarding (the skill asks for both; deliberately left out here), axe and screen readers, non-Chromium browsers.

**After the fixes:** `tsc` is clean, `vitest` passes 181/181, `npm run build` succeeds.
