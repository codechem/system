# Site: rebuilt with Astro

## Goal

Move `apps/site` from a Vite multi-page app to Astro and make it as polished as possible, using the `component-library-studio` skill. The Getting started page stays as it was.

## What changed

- **Astro 7** (`astro dev`, `astro build`) replaces Vite. Each page is a `.astro` file in `src/pages/`. The shared `Base` layout, `Header`, `Footer`, `Logo` and `Code` (a copyable code block) live in `src/layouts/` and `src/components/`. The header, footer, catalog, swatches and framework snippets are now rendered at build time, not injected with JS.
- **One client script** (`src/scripts/site.ts`) registers the components and handles copy buttons, tab selection, the dialog, the theme labs and pagination.
- **URLs** are now directory-style: `/getting-started/`, `/components/`, `/theming/`.
- **Storybook link** env var renamed to `PUBLIC_STORYBOOK_URL`.
- **Colours** now come from tokens. The light chrome is derived from `--cc-palette-gray-*` and `green-*` instead of hand-written oklch values. `global.css` imports `@codechem/tokens/tokens.css` into `layer(cc-tokens)`, so the chrome has its colours before the components' JS runs.

## Pages

- **Home:** stacked hero. The copy is on top. Below it, a dark token stage inside the page width holds a staggered three-column wall of eight realistic blocks: team invite, open roles (search, tabs, pagination), design-review booking (calendar, time chips), an invoice-paid alert, recent activity (list items), monthly KPIs, notification switches, and a new-project form (stepper, radio, checkbox). This replaces the earlier 3RM-style sidebar profile, which looked like a clone of C3RM. The framework switcher, green theming band and component index follow.
- **Components:** a Kokonut-style spec sheet. Groups are numbered (`01 / Actions`), and each cell has a mono code (`IN-08`), a hint, a live demo on a dark stage, and the name, summary and a copyable import. Empty space in short rows is hatched so the ruled frame stays closed. Group jump pills sit at the top.
- **Theming:** the same lab, with the theme CSS output on its own full-width row and an "Apply it" note on scoping a theme to a selector.
- **Getting started:** same content and layout, with code blocks moved into the `Code` component.

## Verification

- `astro build` passes. 4 pages, about 132 kB JS for the full library.
- Checked in Chrome at 1440px and at 390px (iframes). No horizontal overflow on any page.
- Framework tabs, swatches (accent changes to purple), the dialog open/close and pagination all work. No console errors.

## Findings

- **Astro boolean trap:** on custom elements, `checked={false}` renders `checked="false"`, which is still checked. Use `{value || undefined}`. Added to the skill's `codechem.md`.
- `cc-text-input` sets `inline-size: 320px` on `:host`. Outer CSS `inline-size: 100%` overrides it.
- The calendar needs about 19.5rem, which only just fits a phone-width cell.

## Follow-up: logo

The hand-drawn logo (pointy hexagon, white "C" stroke) was wrong. `Logo.astro` now uses the paths from the Figma "Logo" frame (`373:15603`): a rounded `#00B871` hexagon with a solid `#1A202C` "C". The skill's `codechem.md` had the wrong description and is corrected.

## Follow-up: sharp wall

The −4° tilt on the home wall made text and component edges blurry, because rotated layers are resampled off the pixel grid. The wall is now upright, with staggered column offsets instead. The skill's `archetypes.md` now warns about this.

## Follow-up: wall is display-only

The home wall is `inert`, so its components can't be clicked, focused or hovered. The frame is `role="img"` with an `aria-label` that lists the blocks, so screen readers get a summary instead of the inert controls.
