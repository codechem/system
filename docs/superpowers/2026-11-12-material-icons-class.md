# Material Icons class fix

## Problem

Commit `5ee1a3d` replaced the Google Fonts `<link>` tags with bundled fonts. The Google icon stylesheet was also what defined the `.material-icons-round` class (font-family, ligatures, sizing). Only the `@font-face` was carried over, so icons slotted by consumers (`<span slot="leading" class="material-icons-round">add</span>`) rendered as plain text, for example "add" and "content_copy" overlapping the button label.

Components that draw their own icons were unaffected because they use `iconStyles` (`.material-icon`) inside their shadow roots.

## Change

- `packages/components/src/shared/load-fonts.ts`: the injected document stylesheet now also defines `.material-icons-round` with the same properties the Google stylesheet used.
- `packages/components/src/shared/load-fonts.test.ts`: new test that a `.material-icons-round` span with the ligature name `add` renders 24px wide, a glyph instead of text.

## Verification

- `vitest run src/shared/load-fonts.test.ts src/button`: 28 tests pass.
- Storybook `Components/Button` `AllVariants` and `AllIconOnlyVariants` render real icons after rebuilding `@codechem/components`.
- Storybook's `preview.ts` imports the built `dist`, whose `load-fonts` runs first and wins the once-only guard. Rebuild (`npm run build`) after changing it, or the old behaviour stays.

## Review

Self-reviewed. The class is global (document level) on purpose, since slotted icons live in the light DOM. It is the same name consumers were already told to use in the docs and READMEs.
