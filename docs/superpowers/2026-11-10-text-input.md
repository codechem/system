# Text input

**Date:** 2026-11-10
**Changes:** uncommitted in the working tree.

## Goal

Build `<cc-text-input>` from the Figma "Text Input" component set (file `K7Z7bb2IjqiyDjik5qjEoN`, set `306:18576`, 18 variants). The linked node `373:14451` is the documentation frame ("Text Input"), not the component. The plan (Wave C) asks for a form-associated component with value, validity, `required`, `disabled` and form reset, and the first use of the shared form-control logic.

## Requirements

### From Figma

- **Properties:** `State` (Enabled, Hover, Pressed, Active/Focused, Error, Disabled); `Show Leading Icon` (False, True); `Show Input Chips` (False, True). Booleans: Show (Optional) (off), Show Asterisk (off), Show Info Icon (off), Show Trailing Icon (on), Show Supporting Text (off), Show Label (upper part) (on). Text properties: Label, Placeholder text, Input text, Supporting text, Error text, (optional).
- **Variants in use:** 6 states × 3 columns. The columns are "no icon", "leading icon", and "input chips". A leading icon with chips is not designed.
- **Layout:** 320px wide column, gap `gap-1` (8px) between the upper part and the field, and between the field and the error text. The upper part holds the label row (24px, gap `gap-0-5`) and the supporting text (16px, gap `gap-0-25`).
- **Label row:** `Label/large, semiBold` (16/24) in `Text/high-emphasis`, a `*` in `Alert/error/main`, `(optional)` in `Label/small` (12/16, `Text/low-emphasis`), and a 16px info icon in `Text/low-emphasis`.
- **Field:** 40px tall, fill `Surface/surface-2`, radius `radius` (4px). Padding 8px all round, except 12px on the left without a leading icon, and 4px all round with input chips.
- **Text:** `Body text/medium-tight` (16/24) for the input and placeholder (`Text/low-emphasis` placeholder, `Text/high-emphasis` input).
- **Icons:** the default leading icon is a 24px vector component (`Style=Round`), and the default trailing icon is a chevron (a 24px vector component, `Style=Round`). Both are vectors, not Material Icons glyphs, so the leading one is a slot.
- **States:**
  - Hover: an extra `Surface/surface-highlight-transparent` fill on the field.
  - Pressed: the whole component at opacity 0.7, with the hover fill.
  - Active/Focused: 2px inside stroke `Border/focus`.
  - Error: 2px inside stroke `Alert/error/main`, and the error text in `Alert/error/light` (12/16) 8px below the field.
  - Disabled: the whole component at opacity 0.4.
- **Input chips:** the Figma chips are `Input Chip` instances (`cc-chip type="input"`), so the component takes them through a slot and does not build chip logic.

### Behaviour

- Form-associated: submits its value under `name`, resets to the `value` attribute, is left out when disabled, is invalid while `required` and empty, and restores state.
- An `error` message makes the field invalid (`customError`, with the message as the validation message), sets `aria-invalid`, and describes the field with the error text.
- A real `<input type="text">` inside the shadow root, named by its `<label>` or `aria-label`, with `delegatesFocus`.
- `input` bubbles from the inner input (native, composed); `change` is re-dispatched (it isn't composed).

## Steps taken

1. **Read Figma** (read-only `use_figma`): the page's component sets, all 18 variants with bound variables, the text styles of the default and chips variants, the error text colour, the icon components, and the screenshot as the visual target. Also `.Caret` (`1386:1990`) and the loose `.Icon information` (`306:18472`). Those two are not built; see Left out.
2. **API:** `<cc-text-input label placeholder value name supporting-text error required optional disabled show-info-icon hide-trailing-icon aria-label>` plus `slot="leading"` and `slot="chips"`.
   - **Booleans on by default become off switches.** The trailing chevron is on in Figma, so it is `hide-trailing-icon`. The info icon is off in Figma, so it is `show-info-icon`.
   - **`required` drives the asterisk**, as in `cc-textarea`.
   - **`error` is a text attribute.** Figma's error state has no separate switch; a non-empty message turns it on and becomes the validation message.
   - **Leading icon and chips are slots**, because the Figma icons are vectors and the chips are `cc-chip` instances. The field's padding changes when a slot has content (`slotchange` → `has-leading` / `has-chips`).
3. **Trailing chevron:** rendered as the Material Icons Round glyph `chevron_right`, the house icon font, not a copy of the Figma vector.
4. **Styles:** tokens only. The field is a flex row (`gap-0-5`, wrapping), 40px minimum. The input uses `body-md-tight` so an empty field is exactly 40px. Hover is a `background-image` layer, as in `cc-textarea`. The focus stroke and the error stroke are both `box-shadow: inset 0 0 0 2px`. The focus rule comes after the error rule, so a focused invalid field keeps the focus ring (accessibility).
5. **Pressed:** `.root:not(.disabled):active { opacity: 0.7 }`, as in Figma (the whole component). See designer questions.
6. **Form behaviour:** `formAssociated`, `setFormValue` and validity in `updated()`, `formResetCallback`, `formDisabledCallback`, `formStateRestoreCallback`, `live()` binding, `delegatesFocus`, `click()` forwarding, `aria-label` forwarding, and the disabled click blocker. The form-control code is copied from `cc-textarea`; see Left out.
7. **Stories:** `Default`, `WithSupportingText`, `WithValue`, `Required`, `Optional`, `WithLeadingIcon`, `WithChips`, `WithInfoIcon`, `Error`, `Disabled`, and `AllVariants` (a grid of 6 variants with `controls: { disable: true }`). Chips use real `<cc-chip type="input" removable>`.
8. **Tests:** `cc-text-input.test.ts`, 36 tests. They cover the accessible name, asterisk and optional text, info icon, trailing icon, leading and chips slots (position, padding, name), the Figma geometry (320×40 field, 24px label, 2px and 8px gaps, 16px rows, padding), colours by token, hover, press (`userEvent.pointer` holds the mouse, opacity 0.7), focus, error stroke with focus precedence, `aria-describedby` and the accessible description, forwarding, events, value, disabled, external `<label for>`, validity (required, custom error, disabled), state restore, and the form cases (fieldset, submit, disabled, required, reset).
9. **Registered** in `src/index.ts`, `package.json` exports (`./text-input.js`) before `./custom-elements.json`, and the README (components row and project layout).

## Verification

- `tsc --noEmit` exits 0.
- `vitest run`: 17 files, 378 tests pass before the review (36 for the text input); 379 after the review fix (37 for the text input). The first run failed one geometry test (field 44px) because the input used `body-md` (28px line height); switched to `body-md-tight`, which matches Figma's default style.
- `npm run build` exits 0.
- **Storybook (`AllVariants`) against the Figma screenshot** in Chrome: the label row, leading icon, input chips, value, error (stroke and text) and disabled rows match. Hover lightens the field. Focus draws the green 2px inside stroke, as in Figma. The Chrome check is by eye, not pixel diff.

## Left out

- **`type`, `readonly`, `maxlength`, `autocomplete`, `pattern`:** Figma defines none of them. A search bar (Wave C) will need `type="search"`; add it then.
- **Leading icon with input chips:** not in Figma, so the CSS allows it (the padding of `has-leading` then `has-chips` wins) but it is untested. See designer questions.
- **The `.Caret` component set** (`1386:1990`): a blinking caret. The browser's native caret is used instead.
- **The loose `.Icon information` component** (`306:18472`): `show-info-icon` draws the Material `info` glyph, not the Figma vector.
- **Shared form-control controller:** not built. The plan asks for one, built here first. The form code is copied from `cc-textarea` (about 90 lines), so the two drift apart if someone changes one. This is the first candidate for extraction.
- **Pressed state while selecting text:** implemented as Figma specifies, so the field dims during a drag-select. See designer questions.
- **Screen reader pass, axe checks, visual snapshot test, `custom-elements.json` description review, Code Connect mapping, changeset, React and HTML sandbox checks:** the Definition of Done items for the whole library, not done here.

## Designer questions

- **Leading icon with chips:** the Figma grid has no column for it. Should it exist? The CSS currently allows it without a designed padding.
- **Leading icon padding:** the Figma field has 8px on all sides with a leading icon and 12px on the left without one (4px all round with chips). Is the 12px left padding deliberate, or should all three match?
- **Trailing chevron:** what does it do? A decorative marker, or an action (open a list, a date picker)? It is decorative here and visible by default, which is odd for a plain text field.
- **Supporting text position:** Figma puts it between the label and the field (the upper part). `cc-textarea` puts it below the field. Which is right for text input?
- **Pressed:** should a text field dim to 0.7 while the user selects text? It flickers during a drag-select. The textarea pressed state was skipped for the same reason.
- **Error text colour:** Figma uses `Alert/error/light` for the error text and `Alert/error/main` for the stroke. Confirm the pairing.
- **Chevron colour:** built as `Text/high-emphasis`, chosen by eye from the screenshot. The Figma vector's fill was not read.
- **Placeholder in the chips variant:** Figma shows no placeholder beside the chips (the input is only a caret). The code shows the placeholder, which is clipped to a few characters when the row is full. Should it be hidden when chips are present?
- **Error validation:** a non-empty `error` blocks form submission (`customError`). Is that the intent, or should the error be visual only?

## Review

Reviewed with `superpowers:requesting-code-review` by a separate reviewer agent, read-only, in a scratch copy with throwaway probes. The reviewer used this document as the spec.

**Verdict:** needs fixes, one Important finding, fixed. No Critical findings.

**What the reviewer confirmed:** `tsc` exits 0; 36/36 text-input tests and 378 total passed; build exits 0; every `--cc-*` token used exists in `tokens.css`; registration (index, `exports`, README) is consistent with `./textarea.js`. Mutation probes, each applied alone and reverted, were caught by the suite: dropping the `:active` opacity, swapping focus and error precedence, removing the `:not(.disabled)` hover guard, removing `stopImmediatePropagation`, removing reset-to-attribute, `valueMissing`, `delegatesFocus`, `has-chips`, the formDisabled path, state restore, and the asterisk's `aria-hidden`. Focus-over-error precedence holds by source order. The disabled click blocker and `setValidity({})` when disabled are correct.

| Severity | Finding | Fix or reason left |
|---|---|---|
| Important | Required and empty with an `error`, the validity was `valueMissing` (native "Please fill out this field."), not `customError`, contradicting the Behaviour section | Error now takes priority in `updated()`; test "uses the error text, not the native message, when required and empty with an error" |
| Minor | "keeps chips in the accessibility tree" only checks that `aria-hidden` is absent, not the accessibility tree | Left. The test is weak but the chips are not hidden; a stronger AT check is part of the screen-reader pass |
| Minor | External `<label for>` test uses `frameTree.childFrames[0]` from CDP, which depends on the runner's frame order | Left. Copied from `cc-textarea.test.ts`; fix both together if it ever breaks |
| Minor | The leading slot wrapper is `aria-hidden`, which would also hide interactive slotted content | Left. It is meant for a decorative icon; slotting interactive content there is not a supported use |
| Minor | The host keeps `aria-label`, and the host has no role (same pattern as `cc-textarea`) | Left. House convention; not new |

**After the fixes:** `tsc --noEmit` exits 0, `vitest run` passes 379/379 (37 for the text input), and `npm run build` exits 0.
