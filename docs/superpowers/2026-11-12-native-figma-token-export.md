# Native Figma token export as the token source

## Change
`packages/tokens/src/*.tokens.json` are now the raw files from Figma's Variables "Export modes" (DTCG). The hand-converted files and `modes/` were removed.

Figma writes the resolved value in `$value` and keeps the alias only in `$extensions["com.figma.aliasData"]`. A Style Dictionary preprocessor (`figma-export` in `packages/tokens/style-dictionary.config.mjs`) restores the aliases so `outputReferences` still produces `var(--cc-…)` chains. It also:
- converts colour objects to hex, or `rgba()` when alpha < 1
- turns numbers into `px` dimensions (Font Weight stays unitless)
- adds the `sans-serif` fallback to the typeface
- drops the Figma metadata

`typography-mobile.tokens.json` is kept in `src/` but excluded from the build (same paths as desktop, not built before either).

## Update flow
Figma Variables → Export modes → replace the files in `packages/tokens/src/` → `npm run build -w @codechem/tokens`.

## Review
Built CSS compared with the previous `dist/tokens.css`: identical declarations; only the order of `--cc-round`, `--cc-background` and `--cc-radius` changed. Two harmless "collision" warnings come from the top-level `$extensions` (mode name) in each file.
