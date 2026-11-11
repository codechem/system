# Search bar (`<cc-search-bar>`)

## Goal

Build the `<cc-search-bar>` web component from the Figma "Search bar" component set, with stories, tests, registration, and a visual check against Figma.

Figma: file `K7Z7bb2IjqiyDjik5qjEoN` (CC Design System). The linked node `373:14785` is the page's documentation frame "Search bar". The component set is `313:2141` (4 variants).

## Requirements

### From Figma

- Component set "Search bar", 320 x 40, vertical wrapper with 4px gap (the gap is a wrapper around the field; the field is the visible part).
- Field: fill `Surface/surface-2`, radius 4 (`--cc-radius`), padding 8 on top, bottom and right, 12 on the left (`--cc-padding-padding-1-5`), horizontal row, content gap 161 (text and icon spread apart).
- Variants (interaction states): Enabled, Focused/Active, Hover, Pressed.
  - Focused: 2px inside stroke `Border/focus`.
  - Hover: fill `Surface/surface-highlight`.
  - Pressed: whole component at opacity 0.7, hover fill.
- Placeholder text "Search", 16px, line height 24, Kumbh Sans regular, colour `160,174,192` (`--cc-text-low-emphasis`).
- Trailing icon: Material "search" (Round), 24 x 24, shown by default. Boolean "Show trailing icon" default true.
- Leading icon: Material "add_box" placeholder, hidden by default. Boolean "Show leading icon" default false. Its icon is swappable (instance swap), so it is exposed as a slot.
- Input text property (default hidden) and a placeholder property (default shown, default text "Search").

### Expected behaviour (not in Figma, from the shared house rules)

- Native `<input type="search">`, so it has the `searchbox` role. The native cancel button is hidden.
- Accessible name from `aria-label`, or the placeholder when there is no `aria-label`. Icons are `aria-hidden` and never part of the name.
- Form-associated (like `<cc-text-input>`): `name`, value submission, reset, state restore, disabled through a disabled `<fieldset>`.
- Disabled: opacity 0.4, `cursor: not-allowed`, native input disabled, click listeners blocked. Figma has no disabled variant for this set; the values come from the shared disabled rule.
- Focus is drawn as the Figma inside stroke on `:focus-within`, matching `<cc-text-input>`.

## Steps taken

1. Read the Figma set with the figma-inspect scripts (variants, sizes, padding, gap, radius, fills, bound variables, text styles, instances). All Figma calls were read-only.
2. Checked every token used exists in `packages/tokens/dist/tokens.css`.
3. Checked the plan. Section 7 row "Search bar": "Composition of Text input", Wave C, S–M, not started. Section 6 Wave C: "Search bar = text input + search icon + clear button; likely a thin composition of Text input."
4. **Decision: standalone `<cc-search-bar>`, not a wrapper around `<cc-text-input>`.** The wrapper's trailing icon is hard-coded to a chevron, and it has label, supporting-text, error, and chips slots that this Figma set does not have. Wrapping it would mean overriding its internals. The plan said "likely", so the standalone component follows the Figma set directly.
5. **Decision: `hide-trailing-icon` attribute** (Figma "Show trailing icon" default on, so the off switch is `hide-trailing-icon`, as in `<cc-text-input>`).
6. **Decision: trailing slot with the search glyph as fallback.** This covers the Figma instance-swap property without an extra attribute.
7. Wrote `packages/components/src/search-bar/cc-search-bar.ts`, `.stories.ts`, `.test.ts`.
8. Registered: `packages/components/src/index.ts`, `packages/components/package.json` (`./search-bar.js` before `./custom-elements.json`), `README.md` (components row and project layout).
9. Ran the verification gate and the visual check (below).

## Verification

Run after the first build, before the review. Results after the review fixes are in the Review section.

- `npm exec -w @codechem/components -- tsc --noEmit -p .`: exit 0.
- `npm exec -w @codechem/components -- vitest run`: 19 files, 425 tests, all passing. The search bar file has 23 tests.
- `npm run build`: exit 0.
- Visual check in Storybook (`components-search-bar--all-variants`) against the Figma screenshot: enabled, with value, leading icon, hidden trailing icon, and disabled rows match. With the cursor on the first field, the Chrome check shows the green inside focus stroke and the hover fill.

## Left out

- **Clear button.** The plan's Wave C note says "search icon + clear button", but the Figma set has no clear button. Left out to match the design. Add it if the designer adds it.
- **Figma's variant property.** The set uses an unnamed "Property 1" with the four states. The component handles those states with native `:hover`, `:focus-within`, and `:active`, so there is no `state` attribute.
- **Stories for each state.** Hover, focus and pressed are browser states. The AllVariants story shows enabled, value, leading icon, hidden trailing icon and disabled. Focus and hover are checked by the tests and the Chrome check, not by separate stories.
- **Code Connect file.** Not part of this skill's scope.

## Designer questions

1. **Trailing icon colour.** The Figma instance reports a white fill, but the screenshot renders it grey, the same as the placeholder. I used `--cc-text-low-emphasis` to match the screenshot. Please confirm.
2. **Hover fill.** Hover uses the solid `Surface/surface-highlight` (`#4A5568`). `<cc-text-input>` uses a transparent highlight. Is the difference intended?
3. **Disabled state.** The set has no disabled variant. I used opacity 0.4 from the shared rule. Is there a disabled design to match?
4. **Clear button.** The plan mentions a clear button; the Figma set has none. Should a clear button be added?
5. **Default placeholder.** The component defaults the placeholder to "Search", from the Figma text property default. Confirm this should be the default and not required per usage.

## Review

**Reviewer:** a general-purpose subagent, read-only, working in a scratch copy. It did not dispatch subagents.

**Verdict:** With fixes. Behaviour is correct. The findings were test-quality gaps and process steps.

### Confirmed by the reviewer

- Form association, reset, state restore, disabled through a fieldset, and the `change` re-dispatch (non-composed) follow the house rules.
- Both icon slots are `aria-hidden`; the trailing icon is never part of the accessible name.
- Every token used exists; sizes and padding match the spec.
- Mutation probes: removing `aria-hidden`, the reset callback, the disabled `stopImmediatePropagation`, `setFormValue`, the focus stroke, the hover fill, or the `aria-label` forwarding each makes a test fail.
- Full suite before fixes: 425 of 425. Type check and build passed.

### Findings

| Severity | Finding | Fix or reason left |
|----------|---------|--------------------|
| Minor | Icon-exclusion tests set `aria-label`, so the name assertion passed regardless of the icon. | Fixed. Both tests now use the placeholder as the name (no `aria-label`). |
| Minor | No test for `:host([hidden])`; breaking the rule passed all tests. | Fixed. Added `applies the hidden attribute`. |
| Minor | No test for a fieldset-disabled click; only the attribute case was covered. | Fixed. Added `blocks click listeners when a parent fieldset is disabled`. |
| Minor | No test for native cancel-button hiding. | Not fixed. My first assertion (`getComputedStyle` on `::-webkit-search-cancel-button`) returned `block` whether or not the rule applied, so it could not detect the behaviour. I removed it rather than keep a test that passes or fails for the wrong reason. The `input::-webkit-search-cancel-button { display: none }` rule remains and is **not covered by an automated test**. |
| Minor | With no `aria-label` and an empty `placeholder`, the searchbox has no accessible name. | Not changed. Documented here: set `aria-label` when the placeholder is empty. |
| Minor | Props lack JSDoc; stories lack `argTypes` and `satisfies Args`. | Not changed. `<cc-text-input>` has the same shape, and the sibling convention is followed. |
| Process | Plan row still "Not started"; no Review section. | Fixed. Plan row marked Done with the decisions noted; this section added. |

### Results after the fixes

- `tsc --noEmit -p .`: exit 0.
- `vitest run`: 19 files, 427 of 427 passing (the search bar file has 25 tests).
- `npm run build`: exit 0.
