# Calendar month and year dropdowns

## Problem

`cc-calendar` did not match the Figma "Calendar date picker" (node `1118:162`). Figma's header is a Month dropdown (122px) on the left and a year chip on the right. The build had prev/next arrows and a static title, so reaching a distant year meant clicking month by month. See [2026-11-11-calendar.md](2026-11-11-calendar.md), "Left out", where this was deferred.

## Decisions (confirmed by the user)

- The dropdowns live inside `cc-calendar`. No reusable `cc-select` for now.
- The prev/next arrows are removed, as Figma does not draw them. PageUp and PageDown in the grid still change month.

## Change

- `packages/components/src/calendar/cc-calendar.ts`
  - Header is two trigger buttons styled from the Figma Filter Chip: 1px `--cc-border-medium-contrast`, `--cc-radius`, 8px/16px padding, label/m text, `expand_more` icon. The month trigger is 122px wide.
  - Each trigger opens a listbox below it. It scrolls, the current month or year is pre-focused and centred, and it closes on pick, Escape (focus returns to the trigger) or an outside click.
  - ArrowUp and ArrowDown move between options.
  - Picking a month or year moves `focusDate` and clamps the day (31 Jan to Feb gives 29 Feb in a leap year). It does not change the pending pick or `value`.
  - Years span `min` to `max` when set, otherwise the focused year ±100. Months entirely outside `min` and `max` are disabled.
  - The title stays as a visually hidden `aria-live` region, so the grid keeps its `aria-labelledby` and month changes are announced.
  - Triggers have the accessible names "Month, November" and "Year, 2024". When the calendar is disabled they are disabled.
- `cc-calendar.test.ts`: the arrow tests are replaced by tests for the header size, month and year picking with day clamping, selection and focus on open, Escape, arrow keys, outside click, and the `min`/`max` limits. The disabled and accessible-name tests are updated.

## Follow-ups found while clicking through Storybook

- **Year list with one entry:** the Docs example and `WithLimits` used a `min`/`max` inside a single year, so the year list had one item and looked broken. The year button is now disabled when `min`/`max` leave fewer than two years, and the Docs example uses `2025-01-01` to `2028-12-31`.
- **Height jumped between months:** the grid had 5 or 6 week rows depending on the month, so the example moved up and down. The grid now always has 6 rows, with the neighbouring months' days filling the rest, so the height is constant. Figma shows 5 rows for November 2024. Always-6 is the usual date-picker trade-off, and the frame is one row (40px) taller than Figma.
- **Page scrolled when a list opened:** `scrollIntoView` on the selected option scrolled every ancestor, including the Docs page. It now sets the list's own `scrollTop` and focuses with `preventScroll`.
- Tests: a 6-row height test over several months (replacing the 5-or-6 row test) and a disabled-year test.

## Verification

- `npm test`: 500 tests pass (26 in the calendar after the follow-ups; calendar file re-run, full suite not re-run).
- `apps/storybook` docs tests: 12 pass against the dev server (`STORYBOOK_URL=http://localhost:6006`). Without that variable they use a stale `storybook-static` build and fail.
- Docs page: switching November → August → February 2026 keeps the Example heading and Done button at the same position.
- Storybook `Components/Calendar`: the header matches the Figma screenshot; both lists open with the current value highlighted.

## Open points

- The Figma "Opened" state of `.Month Component` was not inspected. The list styling (`--cc-surface-surface-1` panel, accent-selected option, 2px gap under the trigger) is my interpretation. Compare it with the Figma Opened variant.
- The year chip is not a toggling `cc-chip`. It is a plain trigger button, because `cc-chip` toggles `selected` on click and has uncommitted changes in the working tree.
- Not covered: type-ahead in the lists, Home and End, and closing the list when a date in the grid is clicked.

## Review

Self-reviewed only; not yet run through `/code-review`.
