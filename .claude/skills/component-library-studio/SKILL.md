---
name: component-library-studio
description: Design and build polished pages from an existing component library and its design tokens, such as landing pages, showcase/docs sites, app screens, dashboards and settings pages. It works in the style of the best component-library sites (Radix, shadcn/ui, Park UI, Kokonut UI): realistic composed product blocks, quiet token-driven colour and clear navigation. Use it whenever someone wants a page, layout, screen, demo, gallery or frontpage built from their own components (web components, React, Vue and others) and tokens (CSS custom properties, Tailwind theme, Figma variables). That includes "make it look nice with our components", "build a showcase/frontpage for our design system", "lay out this screen using our tokens" and "the page looks crowded or off-brand". Use it even when the user doesn't say "design system".
---

# Component library studio

Build pages that make a component library look its best: composed, calm and on-brand. Every colour comes from the project's own tokens, and every widget is the project's own component.

The bar is the top component-library sites. Study `references/inspiration.md` once per task to recall what they do. In short, all four (Radix, shadcn/ui, Park UI, Kokonut UI) show components **inside realistic product blocks** (a team list, a sign-up form, notification settings, a KPI card), not as loose buttons on a page. Their chrome is quiet, and colour comes from the components rather than the page.

## Workflow

### 1. Inventory what the project already has

Never design before you know the materials.

- **Tokens.** Run `node <skill-dir>/scripts/extract_tokens.mjs <tokens css file or dir>`. It groups every CSS custom property by role (surface, text, accent, border, status, radius, spacing, typography), resolves `var()` chains, and reports whether the default theme is **light or dark** and whether **theme modes exist**. For Tailwind or JS themes, read the theme config instead and build the same role map by hand.
- **Components.** Find the real API: `custom-elements.json`, the package `exports`, `.d.ts` files, stories or docs. Note each component's attributes, slots and events, and anything it needs from the host, such as a `role="tablist"` parent or a property that must be set from JS. Check the version the app actually installs. A component that exists in the repo may be missing from the published package.
- **Fonts and icons.** Check what the components expect to be loaded.

If the project is **this repo's CodeChem system** (`@codechem/components`, `--cc-*` tokens), also read `references/codechem.md`. It records the gotchas already learned.

### 1b. Know what already exists, then differ from it

A design system usually already powers one or more products. Screenshots of those products sit in Figma, docs and Storybook. Each product has its own layout identity: where navigation lives, how dense it is, how surfaces stack, where the accent shows. **Shared tokens and components are materials, not a layout.** A new screen that copies an existing product's composition looks like a clone, and people who know the company notice at once. Usually that's the opposite of what they want.

So before step 3, write one line describing each existing product you know of, for example "left dark sidebar, a stack of slate cards, green active item". Then choose a composition that differs from it on at least **two** of these axes:

- **Navigation:** sidebar, top bar, section rail, command bar, breadcrumb-only, or none
- **Density:** airy single column, a comfortable two-pane layout, or a dense table or canvas
- **Surfaces:** bordered blocks, flat sections divided only by hairlines and space, or one large canvas with floating panels
- **Accent placement:** the primary action only, a drenched header band, a data highlight, or selection state
- **Type scale:** a big editorial page title against a compact utility header

Even "make it look like the rest of the app" means the same tokens, components and voice. Copy an existing screen's layout only when the user explicitly asks for the same layout.

### 2. Build a role map before writing any CSS

Write it as a short comment or note. Every colour on the page must come from a role, and every role must point at a token:

| Role | Use | Token (example) |
|---|---|---|
| canvas | page background | `--cc-background` |
| surface-1, surface-2 | blocks, raised elements (max two levels) | `--cc-surface-surface-1`, `-2` |
| line | hairlines, dividers, block borders | `--cc-surface-surface-highlight` or a border token |
| ink, ink-muted, ink-subtle | headings, body, captions | `--cc-text-high/medium/low-emphasis` |
| accent, accent-ink | primary action, links, focus, the single brand moment | `--cc-accent-main`, `-light` |
| status | only for real status (success, error and so on) | `--cc-alert-*` |

Read `references/tokens.md` for discovery and contrast rules. It also covers the case where the tokens are dark-only (or light-only) but the page needs the other mode. Short version: **match the token theme**. If you must break from it, put components on "stages" that carry the token surfaces, rather than restyling the components.

Derived colours are fine when they derive from tokens: `color-mix(in oklch, var(--accent) 12%, var(--canvas))`. Hard-coded hex values are not, apart from pure black and white for overlays.

### 3. Pick one layout archetype per page

Read `references/archetypes.md` and choose one:

- **Split hero with a block wall** (Radix, Park UI): headline and actions on the left, a wall of realistic blocks on the right that runs off the edge. Best for a frontpage.
- **Centered hero with a masonry wall** (shadcn): short centered headline, then a dense masonry of blocks. Best for a "look at everything" frontpage.
- **Spec-sheet grid** (Kokonut): a hairline-ruled grid of cells, each with a code, a hint, a live demo and a footer with copy actions. Best for galleries and catalogs.
- **Docs layout:** sticky sidebar plus a prose column with live demo stages and copyable code. Best for getting-started and component pages.
- **App screens:** a family of options, not one shell. Top-bar workspace, list–detail, overview canvas, focused column with a section rail, or a sidebar shell. Pick the one that fits the task *and* differs from the company's existing products (step 1b). The sidebar-plus-cards shell is the most common and the most likely to read as a clone, so it's the last resort.

Then decide the **one job** of each section. If a section has two jobs, split it or cut one. Crowding is the most common failure, and the user will notice it first.

### 4. Compose with blocks, not widgets

Build from the recipes in `references/blocks.md`: team list, sign-up, notification settings, KPI card, activity feed, profile header, payment method, file upload, invite dialog and so on. Each block:

- has a **title and a one-line description** in the header, like a real product card
- uses **real-sounding content**: names, dates, amounts and states. Use "John Doe" or neutral invented names, never the user's name, and never lorem ipsum.
- uses **3–6 components**, chosen so the block shows the library's range: a form control, an action, a status and a list
- sits on **one surface level**. Never nest cards inside cards. Group inside a block with spacing and hairlines.

### 5. Typography, spacing and motion

- One family is fine when it's the brand font. Get hierarchy from size and weight: display 48–80px with -0.02 to -0.035em tracking, block titles 15–17px semibold, descriptions 13–14px in the muted ink.
- Use a 4px or 8px spacing rhythm taken from the spacing tokens if they exist. Vary the spacing: generous between sections (64–112px), tight inside blocks (12–20px).
- Navigation: logo, 3–5 primary links, then search, version, GitHub or theme on the right. Below about 52rem, collapse it into a menu (the native `popover` attribute is enough).
- Motion: at most one orchestrated entrance (hero and wall), plus hover and press feedback. Always add a `prefers-reduced-motion` alternative. No glows, no glassmorphism and no gradient text.

### 6. Verify in a real browser

This step is not optional. The layout bugs that matter only show up when the page renders.

1. Run the dev server and screenshot every page at desktop width. Look for crowding, empty holes in grids, and blocks of very uneven height.
2. Check phone width (390px). If the window can't resize, load each page in a 390px-wide `<iframe>` from the same origin. Run the overflow check in `references/archetypes.md` → "Overflow check". The usual fix is `grid-template-columns: minmax(0, 1fr)` on single-column grids, because plain `1fr` lets `<pre>` and long words stretch the track.
3. Click the interactive parts (tabs, dialogs, theme controls) and read the console for errors.
4. Check contrast: body text at least 4.5:1 and large text at least 3:1 against the surface it actually sits on.

### 7. Report

Tell the user what each page or section is for, which tokens drive the colour, which components appear where, and anything you found about the library itself (missing exports, token oddities, API traps). Those findings are often worth more than the page.

## Principles worth remembering

- **Show, don't tell.** A live, realistic block beats a feature bullet every time.
- **Quiet chrome, loud components.** The page frame stays neutral, and the accent appears where an action is.
- **One idea per screen.** Use navigation and more pages rather than one crowded page.
- **Practice what you preach.** Use the library exactly as a consumer would: the published package, public APIs and documented tokens.
- **Same materials, new composition.** The tokens make it feel like the family. The layout makes it its own product.
