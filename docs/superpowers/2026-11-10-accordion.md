# cc-accordion

## Goal

Build `<cc-accordion>`, the Wave B accordion from the plan, from the Figma "Accordion" component set (node `920:3754`, linked from the documentation frame `1188:3471`). The plan says: build it on the native `<details>`/`<summary>`.

## Requirements

### From Figma

Component set `Accordion` (6 variants): `Expanded` (True/False) x `Size` (L/M/S).

| Property | Figma | Built as |
|---|---|---|
| Title | TEXT, default "Title" | `heading` attribute |
| Subtitle | TEXT, default "Subtitle" | `subtitle` attribute |
| Show Subtitle | BOOLEAN, default true | `hide-subtitle` (off switch, per the house rule) |
| Expanded | VARIANT True/False, default False | `open` (reflected) |
| Size | VARIANT L/M/S, default L | `size`: `large` / `medium` / `small` |
| Content | INSTANCE_SWAP (content slot) | default slot |

Measurements per size (all read from the Figma API, bound to tokens):

| | L (`large`) | M (`medium`) | S (`small`) |
|---|---|---|---|
| Header padding (top/bottom, start, end) | 12 / 24 / 16 | 8 / 20 / 12 | 4 / 16 / 8 |
| Header height (closed) | 48 | 40 | 32 |
| Title font / line height | `title-m` 20 / 24 | `title-s` 16 / 24 | `title-s` 16 / 24 |
| Title to subtitle gap | `gap-3` (24) | `gap-2-5` (20) | `gap-2` (16) |
| Chevron (`expand_more`) | `icon-md` 24 | `icon-md` 24 | `icon-sm` 20 |

Shared: header background `surface-2`, radius `--cc-radius`, title `text-high-emphasis` semi-bold, subtitle `text-medium-emphasis` regular, gap `gap-1` (8) between header and content when open. The chevron points down when closed and up when open (confirmed on the screenshot).

### Expected behaviour

- Clicking the header, or pressing Enter or Space on it, toggles the content.
- `open` attribute and `.open` property mirror the native state, in both directions.
- `click()` and `focus()` forward to the header.
- Visible focus ring on keyboard focus, using `--cc-border-focus`.
- `aria-label` on the host goes to the header.

## Steps taken

1. Read the Figma set (`920:3754`) with the inspection script, took the screenshot, and checked that every bound variable exists in `packages/tokens/dist/tokens.css`.
2. Read the plan's Accordion row (Wave B: "Accordion on `<details>`/`<summary>`") and the Definition of Done.
3. Wrote `packages/components/src/accordion/cc-accordion.ts` on native `<details>`/`<summary>`. `delegatesFocus: true`, `click()` forwarded to the `<summary>`, `aria-label` forwarded to the `<summary>`, icon from Material Icons Round with `aria-hidden`.
4. Wrote `cc-accordion.stories.ts` (Default, Open, WithoutSubtitle, Small, AllVariants) and `cc-accordion.test.ts` (14 tests).
5. Registered in `src/index.ts`, `package.json` exports (before `custom-elements.json`), and `README.md` (components row and project layout).
6. Ran typecheck, the full Vitest browser suite, and the build.
7. Visual check in Storybook against the Figma screenshot, including Tab focus.

### Decisions

- **Names avoid the global `title` attribute.** `title` on the host would also trigger the browser's tooltip for the whole component, so the heading is `heading`.
- **Default size is `medium`.** The house rule says "default `medium` when it exists". Figma's default is L (see designer questions).
- **Chevron rotates 180° when open** instead of swapping icons. Figma uses the same `expand_more` glyph in both states, and the screenshot shows it flipped.
- **No pressed or disabled state.** The Figma set has neither, so only `:focus-visible` is styled. The shared pressed rule (opacity 0.7) is not applied because there's no design for it.
- **No animation.** Figma specifies none, so there is no transition. That makes the reduced-motion item in the Definition of Done not applicable for now.
- **No custom events.** The native `toggle` event fires on the inner `<details>` and does not cross the shadow boundary. Re-dispatching it is left for a later decision.

### Deviation from the skill's test rule

The skill asks for `page.getByRole(...)`. Chromium exposes the `<details>` as role `group` (unnamed), and the `<summary>` matches no role that Playwright's `getByRole` can address. Probes confirmed this. The tests therefore assert the header's text content (`.heading` textContent, with whitespace stripped) and the forwarded `aria-label` attribute, instead of querying by role and name. Adding `role="button"` to the summary would make it queryable, but it changes the native disclosure semantics, so I did not do it. Review item for the reviewer.

## Verification

- `tsc --noEmit`: pass.
- `vitest run`: 15 files, 316 tests pass (16 new in `cc-accordion.test.ts`).
- `npm run build`: pass. Tracked files are unchanged, and the generated output is gitignored.
- Storybook `components-accordion--all-variants` against the Figma screenshot: all six variants match in layout, sizes, colours and chevron direction. Tab focus shows the focus ring.

## Left out

- Badge: the Figma set has a Badge instance in every variant, but it is hidden. Not built.
- Pressed, hover and disabled states: not in Figma.
- Animation and the reduced-motion handling that goes with it.
- Custom events (see Decisions).
- Rich header slot: header content is only `heading` and `subtitle`.
- Code Connect mapping, changeset and framework sandboxes: not part of this skill's scope.

## Designer questions

1. **Badge:** every variant contains a hidden Badge (`Badge/Style=Solid, Color=Red, Variant=Dot`). Is it meant for a future state, or can it be removed?
2. **Default size:** the Figma default is L, but the house convention makes M the default. Which should the component default to? Built as M for now.
3. **Collapsed content container:** in `Expanded=False, Size=L` the content container is hidden (`hidden: true`, height 0). In M and S it has `opacity 0`, height 0 and is not hidden. Both collapse to nothing, so there is no visual effect, but the variants are built differently. Worth tidying up.
4. **Chevron:** confirm the open chevron is a 180° rotation of `expand_more` and not a separate `expand_less` glyph. The screenshot looks like a rotation, but the Figma API did not expose the transform.
5. **Hover and focus:** the set has no hover state. Should the header change on hover, or stay as is?

## Review

**Verdict:** Ready after fixes. Two Important test gaps fixed; the rest accepted or documented.

**Confirmed by the reviewer** (scratch clone, repo untouched):
- Accordion tests 14/14, typecheck clean, build emits `dist/accordion/cc-accordion.{js,d.ts}`, `custom-elements.json` lists the element, `./accordion.js` resolves.
- Every `--cc-*` token used exists in `tokens.css`; per-size values match the spec table.
- In Chromium: `open` sets and clears the native state in both directions; Enter opens; click toggles; `hidden` gives `display: none`; no console errors.
- Accessibility tree: the summary is a focusable disclosure with expanded state tracking `open`; forwarded `aria-label` becomes its name.
- Mutation testing, 15 mutants: 12 caught. The two that were not caught (`:host([hidden])` removed, chevron `aria-hidden` removed) now have tests. The 15th mutant was equivalent to the original.

| Severity | Finding | Fix or reason left |
|---|---|---|
| Important | `:host([hidden])` rule untested | Fixed: test "is not rendered with the hidden attribute" |
| Important | Chevron `aria-hidden` untested; ligature would leak into the name | Fixed: test "hides the chevron from assistive tech" |
| Minor | Host and summary both carry `aria-label`; the host's label sits on a generic node and is redundant | Left as is. It is a fallback for consumers who set the label on the host, and it does no harm |
| Minor | No test asserts the summary's accessible name or expanded state | Accepted. This is the `getByRole` deviation above; `details.open` is asserted and the native state was confirmed through the accessibility tree during review |
| Minor | Plan row still "Not started" | Fixed: row updated to Done |

**Results after the fixes:** `vitest run` 316/316 pass; `tsc --noEmit` clean; `npm run build` clean. The reviewer's count of 315 was from before the two tests were added, and the suite now has 316.
