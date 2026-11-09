# Badge component and README

**Date:** 2026-11-09
**Commits:** `e47e215 feat: add badge`, plus uncommitted `packages/components/package.json` and `README.md`

## Goal

1. Build `<cc-badge>` from the Figma "Badge" component set (file `K7Z7bb2IjqiyDjik5qjEoN`, node `472:5368`; the linked selection `579:2566` is only the page header).
2. Write a root README explaining how to set up the repo and run it locally.

## Requirements

### Badge (from Figma)

- Properties: Style (Solid, Subtle, Outline), Color (Gray, Purple, Blue, Cyan, Teal, Green, Yellow, Orange, Red, Pink), Variant (Text, Number, Dot), Size (Medium, Small). 110 variants.
- Colours come from the existing `--cc-status-{color}-{main|light|dark|contrast}` tokens:
  - Solid: background `main`, text `contrast`
  - Subtle: background `light`, text `dark`
  - Outline: transparent, 1px **inside** stroke `light`, text `light`
  - Dot: fill `light` (Figma has Solid dots only)
- Text: padding `0.25 / 1`, radius `--cc-radius` (4px), 20px tall, label small bold, uppercase, 2% letter spacing. Medium only.
- Number: padding `0.25 / 0.5`, radius `--cc-round`. Medium 20×20, small 16×16 (line height `label-xs`).
- Dot: medium 14×14, small 6×6.
- Not interactive (Figma description).

### README

- How to install, build, test and run Storybook from a fresh clone.
- Commands must actually work.

## Steps taken

1. Read the Figma selection; it held only the title, so searched the page and found the `Badge` component set.
2. Read padding, radius, fills, strokes, text styles and bound variables of representative variants with `use_figma` (read-only).
3. Confirmed all needed tokens exist in `packages/tokens/dist/tokens.css`; no badge-specific tokens are needed.
4. Wrote `cc-badge.ts`:
   - Attributes `variant`, `color`, `type`, `size`, all reflected, defaults `solid` / `gray` / `text` / `medium`. `variant` matches the naming of `cc-button` and `cc-alert`; Figma's "Variant" became `type`.
   - Styles live on `:host` (no wrapper element). One rule per colour sets private `--_main/--_light/--_dark/--_contrast`, kept explicit so token names stay searchable.
   - Outline uses `box-shadow: inset` to mimic Figma's inside stroke without changing size.
   - Number badges use `min-width`, so multi-digit values grow into a pill.
   - Dot hides the slotted text visually but keeps it for screen readers.
5. Wrote `cc-badge.stories.ts` (Text, Count, Dot, AllVariants laid out like the Figma frame) and `cc-badge.test.ts` (11 tests).
6. Registered the component in `src/index.ts` and `package.json` `exports` (`./badge.js`).
7. Ran `vitest` (31/31 pass), `tsc --noEmit` and `cem analyze` (clean).
8. Compared the AllVariants story in Storybook against the Figma screenshot: matches.
9. Wrote `README.md` and ran its commands (`npm run build`, `npm test`, `npm exec -w @codechem/components -- vitest`) to confirm they work.

## Deliberately left out

- `max` attribute (e.g. "99+"): not in Figma; add when needed.
- `size="small"` on text badges: Figma has none, so it has no effect.
- Variant on dots: Figma has Solid dots only.

## Review

Reviewed with `superpowers:requesting-code-review`, using a separate reviewer agent. The verdict was "ready with fixes", with no critical issues. Every finding was checked against the repo and fixed:

| Severity | Finding | Fix |
|---|---|---|
| Important | `cd web_component_library` fails after cloning, because the remote clones into `system` | Clone URL and `cd system` |
| Important | README implied `packages/tokens/modes/` is built. Style Dictionary only reads `src/**/*.json` | Marked `modes/` as "exported but not built yet" |
| Important | "Works in plain HTML" was false, since bare imports and a CSS import need a bundler. Packages aren't published either | Said a bundler is needed; added a note that the packages aren't published yet |
| Minor | Node "22+" is too loose: Vite needs `>=22.12` | Prerequisite set to 22.12 |
| Minor | "Component changes reload live" skipped that Controls/Docs need the manifest regenerated | Restart note for new or renamed properties, slots and events |
| Minor | VS Code `html.customData` relative path only works in workspace settings | Pointed to the gitignored `.vscode/settings.json` |
| Minor | `export const Count ={` formatting | Added the missing space |
| Minor | Outline test didn't check colours | Asserts text and inset stroke both use `--cc-status-gray-light` |

## Verification after fixes

- `vitest`: 31/31 pass.
- Ran the README Setup block literally in a fresh clone (`git clone` → `cd system` → `npm install` → `npm run build` → `npx playwright install chromium` → `npm test`): every step works, and 31/31 tests pass.
