# Number input stepper

**Date:** 2026-11-10
**Changes:** uncommitted in the working tree.

## Goal

Build `<cc-number-input-stepper>` from the Figma "Number input stepper" component set (file `K7Z7bb2IjqiyDjik5qjEoN`, set `337:655`, 4 variants). The linked node `373:15106` is the page's documentation frame ("Number Input Stepper"), not the component. The plan (Wave C) lists the number input stepper as a form-associated component. It has a value, `min`/`max`/`step`, `required`, `disabled`, form submit and reset, and labelling.

## Requirements

### From Figma

- **Set:** `Property 1` = Enabled, Active/ Focused, Hover, Pressed. The set is a composition: a Text Input instance (320 × 40, leading icon `add_box`, no chips, no trailing chevron) next to a `.Number stepper` instance (`337:637`, 32 × 40). The row is 352 × 40 with no gap.
- **Stepper (`337:637`):** a vertical column, 32 × 40, fill `Surface/surface-2`, right corners radius `Unit/0,5x` (4px). Two halves of 32 × 20 each (`icon-sm` height), each with an arrow glyph filled `Text/high-emphasis`. Up is `arrow_drop_up`, down is `arrow_drop_down`.
- **Field:** fill `Surface/surface-2`, left corners radius 4px, 8px padding (the leading icon sets the left padding).
- **States:**
  - Hover: stepper fill `Surface/surface-highlight`.
  - Active/Focused: green (`Border/focus`) inside stroke on the stepper (top, right, bottom; no left stroke, as the stepper's `strokeWeight` says). The Figma screenshot shows the green outline around the whole control, so the field also gets its top, left and bottom edges.
  - Pressed: the whole component at opacity 0.7, with the hover fill on the stepper.
  - Enabled: no stroke, surface fills.
- **Disabled:** the screenshot shows a dimmed row. The set has no disabled variant, so the disabled state uses the shared opacity 0.4 and `cursor: not-allowed`.
- **Tokens:** every colour, size, radius, gap and padding is bound to a `--cc-*` token. The check is in Verification.

### Expected behaviour

- Native `<input type="number">` in the shadow root, named by `aria-label` or an external `<label for>`, with `delegatesFocus`.
- The arrow buttons step the value with the native `stepUp()`/`stepDown()`, respecting `min`, `max` and `step`, and fire `input` (composed) and `change`.
- The arrow keys work inside the field (native).
- Form-associated: submits its value under `name`, resets to the `value` attribute, is left out when disabled, is invalid while `required` and empty, is invalid when outside `min`/`max` (the inner field's validity is mirrored), and restores state.
- Disabled blocks clicks, the arrow buttons and stepping.

## Steps taken

1. Read the design: the set, its variant properties, bound variables, the stepper's internals, and a screenshot (`337:655`). Read the plan's Wave C notes (form-associated, `ElementInternals`, "Radio buttons need a group element", "Switch uses `role="switch"`"). This component has no special wave note.
2. Read the house conventions in `cc-button`, `cc-checkbox`, `cc-link`, `icon-styles` and `cc-text-input`. The form and label code follows `cc-text-input`.
3. Element: `packages/components/src/number-input-stepper/cc-number-input-stepper.ts`, class `CcNumberInputStepper`, tag `cc-number-input-stepper`. The Figma name is "Number input stepper", so the tag is literal, not `cc-number-input`.
4. Built the field as a native `<input type="number">`. Hid the native spin buttons (`appearance: none` on the webkit spinners) so only the Figma arrows show.
5. The arrows are `<button type="button" tabindex="-1">` with `aria-label` "Increase" and "Decrease" and a `material-icon` span (Material Icons Round `arrow_drop_up`/`arrow_drop_down`, `aria-hidden`). Stepping calls the native `stepUp()`/`stepDown()` on the inner input, then dispatches `input` (composed) and `change`.
6. Form association: `formAssociated`, `setFormValue` in `updated()`, `setValidity` mirrors the inner field's validity unless disabled, `formResetCallback`, `formStateRestoreCallback`, `formDisabledCallback`. Labels: `ariaLabelledByElements` from `internals.labels` unless `aria-label` is set.
7. The leading slot follows `cc-text-input`: `hasLeading` state toggles the 8px padding.
8. Styles: `--_stroke` and `--_step-bg` on `.root`, set by `:focus-within`, `:hover` and `:active`. Stroke is an inset `box-shadow` (the field and the stepper each draw the sides that sit on the outer edge).
9. Stories (`cc-number-input-stepper.stories.ts`) follow the badge and text-input stories. `AllVariants` shows Enabled, leading icon with value, and disabled.
10. Tests (`cc-number-input-stepper.test.ts`) in Vitest Browser Mode with Chromium.
11. Registered in `src/index.ts`, `packages/components/package.json` exports (`./number-input-stepper.js`, before `./custom-elements.json`), and `README.md` (components row and project layout).
12. First `tsc` run caught a real bug: the method `step()` clashed with the `step` property. Renamed the method to `stepBy()`.
13. The first test run had one failure: `getByRole` did not find the external-label name. The repo's own external-label test (`cc-text-input.test.ts`) reads the Chromium accessibility tree over CDP, so this test does the same. The component was fine.
14. Visual check in Storybook (`AllVariants`) against the Figma screenshot. Hover lights the stepper, and focus draws the green stroke. The first build drew the focus stroke on the stepper only; the Figma screenshot shows the outline around the whole control, so the field now draws its three outer edges too.

## Verification

- `tsc --noEmit -p .` exits 0.
- `vitest run`: 18 files, 402 tests pass. Of these, 23 cases are in `cc-number-input-stepper.test.ts` (21 `it` tests plus 2 `it.each` rows).
- `npm run build` exits 0. `custom-elements.json` and `dist/number-input-stepper/` include the component.
- **Token check:** every `--cc-*` name used in the component exists in `packages/tokens/dist/tokens.css` (`unit-2-5x`, `unit-4x`, `unit-5x`, `icon-sm`, `icon-md`, `padding-padding-1`, `padding-padding-1-5`, `gap-gap-0-5`, `surface-surface-2`, `surface-surface-highlight`, `border-focus`, `radius`, `text-high-emphasis`, `text-low-emphasis`, `text-size-body-md`, `line-height-body-md-tight`, `font-weight-regular`, `typeface-typeface`).
- **Measured in Chrome (Storybook):** host 352 × 40, field 320 wide, stepper 32 × 40, arrow buttons 32 × 20. These match Figma and are asserted in the tests.
- **Visual check in Chrome (Storybook, `AllVariants`):** hover, focus and disabled rows compared with the Figma screenshot. The check is by eye, not a pixel diff. Pressed (opacity 0.7) is not checked visually; it is a CSS rule covered by the shared pressed convention.

## Left out

- **Label and supporting text:** the Figma set has no label or supporting text on the stepper. Only `aria-label` and an external `<label for>` name it. Add a `label` slot or attribute when the designer adds one.
- **Error state:** the set has no error variant. The field is invalid through `min`/`max`/`required` but shows no error text.
- **Trailing chevron:** the set's text input has none, so the component has none.
- **Arrow buttons in the tab order:** `tabindex="-1"` keeps the two arrows out of the tab order, since the keyboard arrows on the number field already step. A screen-reader pass may show whether a focusable stepper is wanted.
- **Long-press repeat on the arrows:** not in Figma; not built.
- **352px host width:** hard-coded. No `--cc-*` token holds this width, and it is the sum of two token-sized parts (320px field + 32px stepper). Left as a literal rather than a made-up token.
- **Shared form-control controller:** not built. The form code is copied from `cc-text-input` and `cc-textarea`, as the text input write-up already plans. This is the second copy, so the extraction is more urgent now.
- **Screen reader pass, axe checks, `custom-elements.json` description review, Code Connect mapping, changeset, React and HTML sandbox checks:** the Definition of Done items for the whole library, not done here.

## Designer questions

- **Focus outline:** Figma's Active/Focused variant puts the green stroke on the stepper, but the screenshot shows it around the whole control. The text input child is `State=Enabled` in all four variants. Which is intended? The build follows the screenshot: the whole outline, with the seam left open.
- **Hover:** the Figma Hover variant lightens only the stepper. The build lightens it when the pointer is anywhere on the control. Is hovering the field meant to light the stepper?
- **Leading icon:** the set shows an `add_box` leading icon. Is it a default, a sample, or left to the consumer? The component has a `leading` slot with no default icon.
- **Arrow glyph size:** Figma's arrow vectors are 9.25 × 5.91 px. The build uses the Material `arrow_drop_up`/`arrow_drop_down` glyphs at `icon-sm` (20px), which render a little smaller. Is the vector a custom shape that needs a glyph match, or is the Material arrow fine?
- **Disabled state:** the set has no disabled variant, so opacity 0.4 is the shared convention, not a design value. Confirm the value.
- **Pressed:** the set's Pressed variant is opacity 0.7 on the whole component, the same as the text input's pressed state, which flickers during a text drag-select. Should the stepper press dim the whole control?

## Review

**Verdict:** Ready after fixes. Reviewed by a `general-purpose` subagent, read-only, in a scratch copy of the repo (the user's working tree was not touched). It ran throwaway probes and mutation checks on the first version.

**Confirmed by the reviewer (first version):**
- `tsc` exits 0. The stepper suite passed 21/21. Full suite passed.
- Probes in a browser: the disabled host click is blocked by the guard (and the listener fires without it); a disabled field is left out of `FormData`; form reset returns to the `value` attribute, including after keyboard stepping; typed `1e` gives `badInput`, an empty value, and `checkValidity()` false; an external `<label for>` focuses the field; fractional `step` works (1.2 → 1.5 at step 0.5); disabled plus required is valid, as expected.
- Mutations: removing the `min`/`max` attributes failed 1 test; removing the validity mirror failed 2; removing `change` on step failed 1; putting the arrows in the tab order failed 1. Removing the hover gating for disabled failed 0 (not covered at the time).

**Findings and outcomes:**

| Severity | Location | Finding | Outcome |
|---|---|---|---|
| Important | `cc-number-input-stepper.ts` arrow buttons | Clicking an arrow moved focus onto the button, so keyboard arrows stopped stepping and the focus stroke landed on the button. | Fixed: `mousedown` calls `preventDefault()` on both buttons. New test "keeps focus in the field when an arrow button is clicked" covers it. |
| Important | `cc-number-input-stepper.test.ts` disabled test | The "blocks clicks when disabled" test called `el.click()`, which forwards to a disabled input and fires nothing. It passed even with the host guard removed. | Fixed: the test dispatches a real `click` event on the host, which fails without the guard. |
| Important | `cc-number-input-stepper.ts` CSS | Hard-coded `2px` strokes and focus outline, against the tokens-only rule. | Fixed: `var(--cc-unit-0-25x)` (2px). The 352px width has no token and stays a literal (see Left out). |
| Minor | `cc-number-input-stepper.test.ts` leading icon | "keeps the leading icon out of the accessible name" passed with or without `aria-hidden`, since `aria-label` sets the name. | Replaced with "hides the leading icon and the arrow glyphs from assistive technology": asserts `aria-hidden="true"` on the leading wrapper and on both arrow glyphs. |
| Minor | `cc-number-input-stepper.test.ts` hover | Hover gating for disabled was untested. | Fixed: new test "does not highlight the stepper on hover when disabled". |
| Minor | `cc-number-input-stepper.test.ts` sizes | A one-row `it.each` was noise. | Fixed: now a plain `it`. |

**Results after the fixes:**
- `tsc --noEmit -p .` exits 0.
- `vitest run`: 18 files, 402 tests pass (up from 400: the focus-retention test and the disabled-hover test are new).
- `npm run build` exits 0.

**Not re-run after the fixes:** the reviewer's mutation checks were run on the first version. The suite was re-run after the fixes, but the mutations were not repeated.

**Declined or not judged by the reviewer (carried to Left out and Designer questions):** the Figma pixel match and the Pressed opacity; screen-reader output and axe; whether `tabindex="-1"` is the right call; `custom-elements.json` and Code Connect; back/forward restore in a browser history test; and the press dimming and `font-variation-settings` against sibling files.
