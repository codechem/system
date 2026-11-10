# Pagination

**Date:** 2026-11-10
**Changes:** uncommitted in the working tree.

## Goal

Build `<cc-pagination>` from the Figma "Pagination" component set (`2624:32`, file `K7Z7bb2IjqiyDjik5qjEoN`). The linked node `1064:10005` is the page's documentation frame ("Header"), not the component. The page also holds a second set, **Pagination arrows** (`578:13475`). The plan (Wave D) says: "Pagination: `<nav>` landmark, current page via `aria-current`, compact mode for many pages."

## Requirements

### From Figma

- **Variant property:** `Type` (Pages, Numbers). Default `Pages`.
- **Pages:** a range label ("1-10 of 30", `Body text/medium`, `Text/low-emphasis`), then two arrow buttons (28px, filled `Surface/surface-highlight`). Gap 16 between the label and the arrows.
- **Numbers:** a previous arrow, a row of page buttons (28px, `Button` Text Secondary Small; the current page is Filled Secondary Small), then a next arrow. Gap 12 between groups; 0 between page buttons.
- **Tokens:** `Gap/gap - 2`, `Gap/gap - 1,5`, `Gap/gap - 0`, `Surface/surface-highlight`, `Text/low-emphasis`, `Body text/medium`, `Button` label text.

### Expected behaviour (from the plan and the ARIA pagination pattern)

- The host wraps a `<nav>` landmark, named "Pagination" by default and overridable with `aria-label`.
- Arrows are native buttons named "Previous page" and "Next page". Page buttons are named "Page N", and the current one carries `aria-current="page"`.
- Arrows are disabled at the first and last page.
- A bubbling `change` event fires when the page changes; the new page is read from `page`. Choosing the current page does nothing.
- Keyboard: Tab through the controls, Enter or Space to activate.

## Steps taken

1. Parsed the link to node `1064:10005`. The page holds two component sets; used `Pagination` (the plan row) and inlined its arrows.
2. Read the Figma set, its nested arrows set, and a screenshot. Built `packages/components/src/pagination/cc-pagination.ts` with:
   - `type` (`pages` | `numbers`, default `pages`), `page` (1-based), `total` (item count), `page-size` (default 10).
   - Page count = `ceil(total / page-size)`, minimum 1.
   - Numbers shows a window of up to 5 pages centred on the current page.
   - Arrow icons use the Material Icons Round font, `aria-hidden`, so ligatures never leak into names.
   - Colours and sizes come from `--cc-*` tokens. The 28px control size uses `--cc-unit-3-5x`.
3. Stories (`cc-pagination.stories.ts`): Default, Numbers, MiddlePage, LastPage, AllVariants.
4. Tests (`cc-pagination.test.ts`): 17 cases in Vitest browser mode, covering defaults, the landmark and names, bounds, navigation, events, numbers windowing, keyboard, sizes, colour and hidden.
5. Registered in `src/index.ts`, `package.json` exports (`./pagination.js`), and the README (components row and project layout).

## Verification

- `npm exec -w @codechem/components -- tsc --noEmit -p .` : pass.
- `npm exec -w @codechem/components -- vitest run` : 12 files, 251 tests pass (22 from this component). One test was first written to click a disabled button, which Playwright rejects; it was rewritten to click the current page number, which exercises the same no-op guard.
- `npm run build` : pass.
- Visual check in Storybook (`iframe.html?id=components-pagination--all-variants`): both rows match the Figma layout (range and arrows; arrows plus numbers, with the current page filled). Tab focus shows the `--cc-border-focus` outline; hover shows the expected background.

## Left out

- **Compact / ellipsis mode** (the plan's "compact mode for many pages"). The numbers row shows a fixed window of 5 with no `…`. Add when the designer specifies it.
- **Pagination arrows as their own component.** Arrows are inlined in `cc-pagination`. Extract them if another component needs them.
- **Code Connect, changeset, React/HTML sandbox checks** (plan Definition of Done). Not part of this skill; still open.

## Designer questions

1. **Arrow state.** The Pages variant shows both arrows as filled on page 1. The implementation disables the previous arrow at the first page, and the next arrow at the last, by dimming it to 0.4 opacity. Which is intended? The Figma arrows set has an `Active` property (Right, Left, Both), but its states do not map clearly onto the Pages and Numbers instances. Please confirm.
2. **Numbers window.** How many page numbers should show, and should there be an ellipsis for long ranges? The Figma frame shows five.
3. **Range text.** Figma uses a hyphen ("1-10 of 30"); the screenshot looks like an en dash. The implementation uses a hyphen, matching the Figma text characters.

## Review

**Verdict:** With fixes. All fixes below are applied and verified.

**Reviewer confirmed:** native buttons in the shadow root with `delegatesFocus`; `aria-label` forwarded to the nav; `aria-current` on the current page number; arrows named and icons `aria-hidden`; arrows disabled at the bounds; a clamped `go()` with a no-op guard; a bubbling `change` event; the numbers window correct at the start, middle and end; all `--cc-*` names exist in `tokens.css`; `:host([hidden])` present; registration follows the existing pattern.

| Severity | Finding | Fix or reason left |
|---|---|---|
| Important | `page` could drift out of range (`page="99"` on 30 items kept `el.page === 99`; changing `page-size` left a stale page) | Fixed: `willUpdate()` clamps `page` to the displayed page. Tests added. |
| Important | Test gaps: Space key, out-of-range page, partial last page, type-specific markup, range colour, page size change | Fixed: tests added (22 total for this component). |
| Minor | The ligature test asserted only names, so removing `aria-hidden` would still pass | Fixed: the test now asserts `aria-hidden="true"` on the icon. |
| Minor | `pageSize` 0 gave "1-0 of 30"; a non-numeric `total` gave NaN | Fixed: `pageSize` is floored at 1 in the range and page count. Non-numeric `total` left: invalid input, not in spec. |
| Minor | `--_control` was a constant private variable on `:host` | Fixed: `var(--cc-unit-3-5x)` inlined on `button`. |
| Minor | README project-layout row listed files, unlike the other rows | Fixed: folder only. |

**Left out (reviewer agreed these are spec questions):** disabled-arrow style (designer question 1), fixed window of 5 with no ellipsis or compact mode (question 2), hyphen vs en dash (question 3), the numbers type with 0 items showing "1", Code Connect, changeset and sandbox checks.

**Results after the fixes:** `tsc --noEmit` passes; Vitest passes 251/251 across 12 files; `npm run build` passes.
