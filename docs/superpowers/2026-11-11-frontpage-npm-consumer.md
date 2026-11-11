# Frontpage: consuming `@codechem/components` from npm

## Goal

First version of a frontpage in `apps/site` (Vite, vanilla TS) built only from the published `@codechem/components@0.0.4`, to see what a real consumer experiences. The page is a hero, a sticky "Token Lab" bar and a bento grid of live `<cc-*>` demos.

## What was built

- `apps/site`: `index.html`, `src/main.ts`, `src/style.css`. One side-effect import, `import '@codechem/components'`, registers everything. Fonts come from Google Fonts `<link>` tags, as the package README says.
- Token Lab: eight accent swatches and a radius slider. The swatches set `--cc-accent-{light,main,dark,shade,transparent}` to `--cc-palette-<name>-{300,600,800,900,opacity}`. The slider sets `--cc-radius`.

## Findings

- **Registry copy, not a symlink.** The site pins `@codechem/components` and `@codechem/tokens` to exactly `0.0.4`. Local packages are `0.0.0`, so npm installs the registry copies into `apps/site/node_modules/@codechem/`. Without the explicit `@codechem/tokens` pin, the components' own `"@codechem/tokens": "*"` dependency would match the local `0.0.0` workspace.
- **`@codechem/tokens: "*"` is loose.** Published components accept any tokens version. Consider a caret or exact range on publish.
- **Tokens are dark-only.** `tokens.css` has no light mode or `data-theme` switch, so the Token Lab has no light/dark toggle and the page is dark. A light theme would need new token modes.
- **Accent re-theming works from the page.** Overriding `--cc-accent-*` on `:root` re-themes buttons, chips, switches, radios and the calendar with no `!important`, thanks to `@layer cc-tokens`.
- **Radius works.** `--cc-radius` is read by most components (accordion, alert, chip, calendar, dialog, pagination, search-bar, tab, tooltip).
- **Bundle:** about 132 kB JS (26 kB gzipped) for the whole library, 2.4 kB CSS.
- **No console errors** on load.
- **Calendar needs about 20rem.** It overflowed a 16rem grid column, so the bento grid uses `minmax(21rem, 1fr)`.

## Brand pass

The first version used the accent too sparingly. After reading the Figma colour board (node `171:10145`): surfaces are a dark slate-blue, and the green is vivid (hexagon "C" logo, active nav, "+" icons, solid green success blocks). The page now has a hexagon mark, a strong green glow behind the hero, green-tinted tiles with a green glow on hover, hexagon bullets on tile titles and a solid green call-to-action band. Everything is driven by `--cc-accent-*`, so the Token Lab still re-themes it.

## Redesign (multi-page)

Feedback: no proper navigation, too much in one place. The single bento page was replaced, taking inspiration from Radix, shadcn/ui, Park UI and Kokonut UI. `apps/site/PRODUCT.md` holds the brand brief (public showcase, "precise, calm, crafted", WCAG 2.2 AA; avoid neon/glass and generic SaaS layouts).

- Four pages: Home, Getting started, Components and Theming (Vite multi-page, `vite.config.ts`). A shared header and footer are rendered by `src/main.ts`, with `aria-current` on the active page and a native `popover` menu under 52rem.
- Light page chrome (green-tinted off-white, slate ink) with the CC green for actions. Because the tokens are dark-only, components always sit on dark "stages" that use the token surfaces, so they look like product screenshots.
- Home has four sections: a hero with a live 3RM-style profile screen, a framework snippet switcher built on `cc-tab`, a green theming band with an inline Token Lab, and a component index.
- Components: all 19 components, grouped, each with a live demo and a copyable per-component import line. The data is in `src/catalog.ts`.
- Theming: accent and radius controls, a large preview, and the generated `:root` CSS to copy.
- Storybook links appear only when `VITE_STORYBOOK_URL` is set at build time, because there is no public Storybook URL yet.
- Checked at desktop and at 390px (no horizontal overflow on any page). Type-check and build pass.

New finding: **0.0.4 on npm does not include `cc-navigation-drawer`** (no export, not in `dist/`), so the site shows 19 components and the hero builds its sidebar from `cc-list-item`.

## Not done (deferred)

Live code playground, navigation drawer (wait for the next release), deploy, DESIGN.md via `/impeccable document`.
