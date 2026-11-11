# cc-navigation-drawer: Navigation drawer and rail

## Goal

Build `<cc-navigation-drawer>`, one element with a `collapsed` attribute, from the Figma "Navigation Drawer" component on the "Navigation Drawer - Rail" page (node `386:1149`, file `K7Z7bb2IjqiyDjik5qjEoN`). The expanded drawer is 256px wide; the rail (`collapsed`) is 64px wide. Plan section 7 lists it as Wave D, size L.

## Requirements

From Figma (expanded `3940:1004`, rail `3940:1005`):

- Drawer: Surface-2 background, 8px padding, 40px gap between the logo and the menu. The menu fills the height, and the collapse button sits at the bottom.
- Menu item: 48px tall, 4px radius, 12px padding and gap, 16px Medium label (`label-l`). Text is high emphasis. Hovered and selected items use the Surface-1 fill. A selected item's label uses Accent-light.
- Sub-items (inside a group): medium-emphasis text with a 32px left padding.
- Groups: a trailing `arrow_drop_down` chevron in the expanded drawer. Groups open to show their children.
- Rail: icon-only, centred items; logomark in place of the full logo.
- Collapse button: "Collapse navigation" (medium emphasis, SemiBold) with a trailing `left_panel_close` icon, or "Expand navigation" with `left_panel_open` in the rail.

Icons are Material Icons Round ligatures, as in the Figma instance names (`grid_view`, `people`, `business_center`, `assignment_ind`, `calendar_month`, `account_balance`, `chair_alt`, `collections_bookmark`, and the sub-item icons).

Expected behaviour (from the plan and WAI-ARIA):

- Items are native links (`<a href>`) when they have an `href`, otherwise buttons. Groups are buttons with `aria-expanded` and `aria-controls`.
- The selected item is marked `aria-current="page"`.
- In the rail the labels are visually hidden but stay the accessible name.
- Activating a leaf fires `select` with the item as `detail`. Toggling the collapse button fires `change` with `{ collapsed }`.

## Steps taken

1. Read the page with read-only `use_figma` calls. The linked node is the whole "Navigation Drawer - Rail" page, so I inspected the two drawer components (`3940:1004`, `3940:1005`) and the Menu Item set (`937:223`).
2. Found the copy error the plan mentioned. The rail's second and third groups carry the Finance sub-items under the icons of Inventory (`chair_alt`) and Resources (`collections_bookmark`). Inventory and Resources have no sub-items in the expanded drawer. The rail therefore mirrors the expanded drawer: Inventory and Resources have no children, and the three groups have their own icons and children. Resolved with the user: the rail is built from the expanded drawer.
3. Confirmed every token used exists in `tokens.css` (surfaces, emphasis text, accent, radius, the 8/12/24/32/40 spacing scale, `label-l`, and the icon sizes).
4. Built `packages/components/src/navigation-drawer/cc-navigation-drawer.ts`. Items are data (`items` property), so the component renders the states and manages group open state. Logos come through `logo` and `logomark` slots, because the brand logo is not a library asset.
5. Wrote stories (Expanded, Collapsed, SelectedInGroup, AllVariants) and 12 tests.
6. Registered the element: `src/index.ts`, the `./navigation-drawer.js` export, the README components row and project layout.

## Verification

- `tsc --noEmit` on `@codechem/components`: pass (after adding the explicit `TemplateResult` return type to the recursive `renderItem`).
- `vitest run navigation-drawer`: 14 of 14 pass (after the review). One test failed on the first run because it read the toggle's full text, which includes the icon ligature. It now reads only the label span.
- `vitest run` (full): 21 files, 460 tests, all pass.
- `npm run build`: pass.
- Storybook visual check (`components-navigation-drawer--all-variants`): the expanded drawer and the rail match the Figma screenshot. Items, the selected accent, the group chevrons, the collapse button and the rail's icon column all line up. The screenshot is scaled to fit, so widths were checked by the tests (256px and 64px) rather than by eye.

## Left out

- **Logos.** The full logo and the logomark are slot content. The component does not ship the brand assets.
- **Flyout menus in the rail.** Figma draws the rail's group children with a zero-height container, so the flyout placement is not clear. The build opens a group's icon-only children inline beneath it, the same as the expanded drawer.
- **Responsive behaviour.** The plan notes it "may need responsive behaviour". Not built; the width is set by the `collapsed` attribute only.
- **A "current group" rule.** A group does not open automatically when one of its children is selected. Consumers can keep it open by not collapsing it; this is a possible follow-up.
- **Keyboard shortcuts beyond the native model.** Tab and Enter/Space work because the items are native links and buttons. Arrow-key navigation through the menu is not built.

## Designer questions

1. The rail as drawn has three "Finance" groups, the second and third of which show Inventory and Resources icons with Finance sub-items. The build follows the expanded drawer (Finance, Inventory, Resources). Please confirm.
2. Inventory has a chevron in the expanded drawer but no sub-items. The build renders it as a group with no children, so the chevron shows and opens nothing. Should it be a plain link, or does it have sub-items that are missing from the file?
3. How should a collapsed group's sub-items appear: an inline list (as built) or a flyout to the right?
4. Figma draws the chevron as `arrow_drop_down` in both states. The build rotates it 180° when the group is open. Is there an open-state icon to use instead?
5. The collapse and expand icons are `left_panel_close` and `left_panel_open`. The Figma icons are named `icon/sidebar-collapse` and `icon/sidebar-expand`. Please confirm the Material names match those glyphs.

## Follow-up: selection on click

Clicking another item fired `select` but did not move the selected item, because the drawer only showed the `selected` flag from the items it was given. The drawer now tracks the selected item itself: clicking an item (or a child of a group) moves `aria-current="page"` to it. The `selected` flag on an item only sets the starting selection, and the `select` event still fires with the item, so apps can route on it. Results: drawer 20 of 20, full suite and build pass. The stories now use buttons instead of placeholder `#` links: clicking a link inside the Storybook preview navigates the preview frame and drops the Storybook sidebar. The Link story prevents its placeholder `href` from navigating for the same reason.

## Follow-up: collapse icon

The collapse button showed no icon. Its icon name, `left_panel_close`, is not a glyph in the Material Icons Round font the library loads, so the ligature text was clipped to a 16px box and nothing showed. Measured in Storybook: the text was 288px wide where a glyph is 24px. Fixed by using glyphs that exist in the font: `menu_open` when expanded and `menu` when collapsed. The icon is also set to the 24px icon size (it had inherited 16px). When collapsed, the label is clipped to 1px and only the icon shows. Results: drawer 18 of 18, full suite 464 of 464, build passes.

Note for the designer question on icons: these are the closest glyphs in the font to Figma's sidebar icons. The Figma icons (`icon/sidebar-collapse`, `icon/sidebar-expand`) are not in the font.

## Follow-up: background and hover colours

Reviewed in the browser after the first review. Two problems:

- **Background did not cover expanded content.** The host and the nav had a fixed 100% height, so when every group was open the last items and the collapse button sat below the Surface-2 background. Measured in Storybook: the content ran 280px past the background. Fixed: the host is a flex column with `min-height: 100%` and no fixed height, and the background sits on the host, so it grows with the content. The nav fills the remaining space and the collapse button stays at its end. Measured after the fix: 0px uncovered.
- **Hover and open colours did not match Figma.** Figma's Menu Item set shows: a hovered unselected primary item is Surface-1; a hovered selected item, a hovered open group and any hovered sub-item are Surface-0 (darker); an open group is Surface-1; a group's children sit on a Surface-1 panel. Fixed to match. Figma does not show a resting colour for a selected sub-item; the build uses Surface-0 (designer question 6).

Tests added: the background covers every item and the collapse button with all groups open; a hovered selected item turns Surface-0; the children panel is Surface-1 and a hovered child turns Surface-0. Results after the follow-up: drawer 17 of 17, full suite 463 of 463, build passes.

6. A selected sub-item (child of an open group) has no resting colour in the Figma set. The build uses Surface-0. Please confirm.

## Review

**Verdict:** Approve with fixes. The reviewer confirmed the group toggle, the `select` and `change` payloads, the collapsed labels (clipped but still the accessible name), the logo switch, the `aria-label` forwarding and the focus outline. It killed 8 of 10 mutations on the first pass. The 2 survivors (`aria-current` on a button, and the `.sub[hidden]` rule) are now covered by tests.

| Severity | Finding | Fix or reason left |
|---|---|---|
| Important | Nested group ids collided: `group-nested-0` repeated under two parents, so `aria-controls` could point at the wrong list | Fixed: groups are keyed by their full index path (`0`, `0-1`, `1-0`…); the id and the open state use the path |
| Minor | `openGroups` was keyed by label, so two groups with the same label opened together | Fixed by the same path keying |
| Minor | Group test did not prove the closed list is removed from layout | Fixed: asserts the closed list is 0px tall |
| Minor | No test for `aria-current` on a button (a selected leaf without `href`) | Fixed: "marks a selected item without href as the current page" |
| Minor | Collapse button name only checked as text, not with `getByRole` | Fixed: `getByRole` checks in both states |
| Minor | Focus test pressed Tab before focusing, so the Tab did nothing | Fixed: removed the stray key press |
| Minor | `prefers-reduced-motion` | Not applicable: the component has no transitions (the chevron rotate is instant) |
| Minor | Raw px for the 256/64/48 widths and heights | Accepted: no token exists for these sizes |

**Confirmed by the reviewer:** `tsc` clean; the drawer tests passing before the fixes; the full suite at 458; `.sub[hidden]` wins over `display: flex`; the accessible-name test fails if the icon loses `aria-hidden`; `aria-expanded` hardcoded to false fails two tests.

**Results after the fixes:** `tsc --noEmit` exit 0. `vitest run navigation-drawer` 14 of 14. Full `vitest run` 21 files, 460 tests, all passing. `npm run build` exit 0.

**Declined to judge (reviewer):** Figma values not checked against the file (no Figma access in review); token names not checked against `tokens.css` beyond the three used in probes; Storybook visual check and screen-reader behaviour (done separately, see Verification); Code Connect, changeset, React and Angular sandboxes (out of scope); the spec's designer questions.
