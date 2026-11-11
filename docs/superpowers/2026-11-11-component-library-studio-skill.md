# component-library-studio skill

## Goal

A project skill (`.claude/skills/component-library-studio/`) that designs and builds pages from an existing component library and its design tokens: frontpages, docs and showcase sites, app screens, dashboards and settings. It works in the style of the best component-library sites. It's generic, with CodeChem as the first worked example.

## Research

Radix UI, shadcn/ui, Park UI and Kokonut UI were studied in a real browser (notes in `references/inspiration.md`). They share these patterns:

- Components shown inside realistic product blocks, not as loose widgets.
- Neutral chrome with at most one accent.
- One surface level with hairline borders.
- Short navigation.
- Copy affordances everywhere.
- A "wall" of blocks, masonry or tilted (Radix, Park) or a ruled spec grid (Kokonut), carrying the visuals.

## Contents

- **`SKILL.md`:** the workflow. Inventory tokens and components, check existing products and differ from them (step 1b), build a token role map, pick a layout archetype, compose with blocks, set type, spacing and motion, verify in a browser (390px overflow, console, contrast), and report findings about the library.
- **`references/`:**
  - `archetypes.md`: hero walls, spec-sheet grid, docs layout, five app-screen layouts, and an overflow-check snippet.
  - `blocks.md`: realistic block recipes.
  - `tokens.md`: token discovery, role mapping, light/dark handling and contrast.
  - `codechem.md`: `cc-*` API traps, token facts, and "don't clone C3RM".
- **`scripts/extract_tokens.mjs`:** groups the CSS custom properties by role, resolves `var()` chains, and detects light or dark theme and any theme modes.
- **`evals/`:** three test cases (design-system frontpage, HR settings screen, recruiting dashboard), with 7–8 checks each.

## Review results

- **Iteration 1:** the skill passed 100% of the checks and the no-skill baseline 82%. The baseline failed phone-width overflow twice, set pagination wrongly once, and used too few components once. The user liked both frontpages but rejected both app screens because they looked like C3RM, the existing CodeChem product (sidebar plus slate cards). The skill versions were rated worse than the baseline.
- **Fix:** added step 1b, "Know what already exists, then differ from it" (differ on at least two of navigation, density, surfaces, accent placement and type scale). The single app-shell layout became five app-screen layouts, and `codechem.md` now lists C3RM as a layout to avoid rather than a brand reference.
- **Iteration 2:** still 100% on the checks. Settings became a top bar with a section rail and flat hairline sections. The dashboard became a top bar with a green headline band of unboxed metrics. The user approved it with no further feedback.

## Findings about the library (0.0.4)

- Every `--cc-status-*-transparent` token resolves to `#ffffff`, which looks like a Figma export bug.
- `cc-navigation-drawer` is not in the published 0.0.4.
- The package README's import table leaves out `calendar.js` and `search-bar.js`.
- `cc-text-input` and `cc-textarea` default to a 320px width.
- `cc-text-input` has no `type="email"`.
- Only green, blue, orange and red have an `-opacity` palette colour.

## Not done

- Optimising the trigger description (`run_loop`).
- Committing the skill. The user commits.
