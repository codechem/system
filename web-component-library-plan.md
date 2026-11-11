# From Figma to a Framework-Agnostic Web Component Library (Lit)

**Project plan and research notes** · November 2026

---

## 1. Goal

Build a reusable, framework-agnostic **component library** that implements our Figma design system, plus a **presentation layer** where the components can be seen, tried, and documented.

The finished product consists of:

| Deliverable | What it is | Who uses it |
|---|---|---|
| `@codechem/tokens` | Design tokens (colors, typography, spacing…) exported from Figma and compiled to CSS custom properties and JS/TS | Every other package; consumer apps |
| `@codechem/foundations` | Base CSS: reset, typography styles, layout/grid utilities, scrollbar styling | Consumer apps |
| `@codechem/components` | The Lit-based web components (`<cc-button>`, `<cc-dialog>`, …). Also bundles the Kumbh Sans and Material Icons Round fonts, so no separate icon package or font link is needed ([write-up](docs/superpowers/2026-11-11-bundled-fonts.md)) | Consumer apps in any framework |
| `@codechem/react` (optional) | Thin React wrappers, only if needed | React apps on React < 19 |
| **Storybook site** | The presentation layer: live examples, controls, docs, accessibility checks | Developers, designers, QA |
| **Sandbox apps** | Minimal real apps (plain HTML, React, Vue/Angular) consuming the published packages | Integration testing |

> **Naming:** packages are published under the `@codechem` npm scope, while tag names and CSS variables use the shorter `cc-` prefix (`<cc-button>`, `--cc-color-action-primary`). Confirm the CodeChem npm organization owns `@codechem` before the first publish.

---

## 2. Key research findings (state of the ecosystem, Nov 2026)

These shape the decisions below. Versions move fast, so re-check before pinning.

**Design tokens have a stable standard.** The W3C Design Tokens Community Group published the first stable specification, version **2025.10**, on 28 October 2025. It covers theming, multi-file token sets, and modern color spaces, and Style Dictionary, Tokens Studio, and Terrazzo serve as reference implementations. New token files should use this format (`$value`, `$type`, `$description`).

**Figma can export DTCG JSON natively.** Right-click a variable collection in the Variables panel and export its modes: you get a ZIP with one DTCG-aligned JSON file per mode, with aliases preserved as references. Limitations reported by users: one collection per export (repeat for each collection), and the export has omitted `$description`. The Figma **REST** Variables API does not return DTCG and requires an Enterprise plan. Plugins such as **TokensBrücke** (open source) or **Tokens Studio** (Git sync) are fallbacks if the native export is insufficient.

**Style Dictionary v5** supports DTCG, including the 2025.10 color and dimension formats. The separate DTCG *Resolver* module (for complex theme merging) is not supported yet, so we handle themes with one token file per mode (see Phase 2).

**Lit 3.x is current** and stable. Lit moved to the **OpenJS Foundation** in October 2025 under open governance, which reduces single-vendor risk. Lit decorators work with TypeScript's experimental decorators (still recommended for smallest output) or standard decorators with the `accessor` keyword.

**Storybook 10** supports web components through `@storybook/web-components-vite`. Former "essentials" (controls, actions, viewport, backgrounds) are built in. Storybook can read a Custom Elements Manifest to generate controls and docs automatically.

**Vitest 4** (October 2025) made **Browser Mode stable**, running component tests in a real browser through Playwright, with built-in visual regression (`toMatchScreenshot`). This is a good fit for web components, which need real Shadow DOM, focus, and layout.

**Figma Code Connect supports HTML / Web Components.** You map Figma component properties to your tag's attributes, and Dev Mode then shows real `<cc-button variant="primary">` snippets instead of auto-generated CSS. Requires a Dev or Full seat on an Organization or Enterprise plan.

**React 19 supports custom elements properly** (properties and events), so React wrappers are optional for React 19+ consumers.

---

## 3. Architecture overview

```
Figma Variables ──export──▶ tokens/*.json (DTCG)
                                  │
                          Style Dictionary v5
                                  │
          ┌───────────────────────┼────────────────────────┐
          ▼                       ▼                        ▼
   tokens.css (CSS vars)    tokens.js / .d.ts       themes/[mode].css
          │
          ├──▶ @codechem/foundations (reset, typography, layout, scrollbar)
          │
          └──▶ @codechem/components (Lit) ──▶ custom-elements.json (manifest)
                         │                         │
                         ├──▶ npm / CDN            ├──▶ Storybook (presentation)
                         ├──▶ @codechem/react (opt.)     ├──▶ IDE autocomplete
                         └──▶ sandbox apps         └──▶ Figma Code Connect
```

**Guiding principles**

1. **Tokens are the single source of truth for values.** Components never contain raw hex codes or pixel values; they use semantic CSS variables.
2. **Prefer the platform.** Use CSS on native elements where that's enough; use native `<dialog>`, `<details>`, and the Popover API before writing JavaScript.
3. **Components use semantic tokens only** (`--cc-color-action-primary`), never primitives (`--cc-blue-600`), so theming is a token swap.
4. **Accessibility is part of "done,"** not a later phase. Target WCAG 2.2 AA.
5. **The published package is the contract.** Sandbox apps consume it exactly as real users would.

---

## 4. Repository structure

A single monorepo using pnpm workspaces and Turborepo:

```
codechem-design-system/
├── packages/
│   ├── tokens/
│   │   ├── src/                 # DTCG JSON exported from Figma
│   │   │   ├── primitives.json
│   │   │   ├── semantic.light.json
│   │   │   └── semantic.dark.json
│   │   ├── style-dictionary.config.mjs
│   │   └── dist/                # generated: CSS, JS, d.ts
│   ├── foundations/
│   │   └── src/                 # reset.css, typography.css, layout.css, scrollbar.css
│   ├── components/
│   │   ├── src/
│   │   │   ├── fonts/           # Kumbh Sans and Material Icons Round, with licence texts
│   │   │   ├── shared/          # base styles, font and token loaders, utils
│   │       ├── button/
│   │       │   ├── cc-button.ts
│   │       │   ├── cc-button.styles.ts
│   │       │   ├── cc-button.test.ts
│   │       │   ├── cc-button.stories.ts
│   │       │   └── cc-button.figma.ts   # Code Connect
│   │       └── …
│   └── react/                   # optional wrappers
├── apps/
│   ├── storybook/               # presentation layer
│   ├── sandbox-html/
│   ├── sandbox-react/
│   └── sandbox-vue/             # or sandbox-angular, based on consumers
├── .changeset/
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

Stories can live next to components (shown above) or inside `apps/storybook`. Co-location is the more common choice because a component and its examples change together.

---

## 5. Tech stack

| Concern | Choice | Notes |
|---|---|---|
| Language | TypeScript | Strict mode |
| Component library | Lit 3.x | `lit` as a dependency of `@codechem/components` |
| Package manager / monorepo | pnpm workspaces + Turborepo | Nx is an alternative |
| Build | `tsc` or Vite library mode | ESM only; keep one file per component for tree-shaking |
| Tokens | DTCG 2025.10 JSON + Style Dictionary v5 | Terrazzo is an alternative |
| Manifest | `@custom-elements-manifest/analyzer` | Produces `custom-elements.json` |
| Presentation | Storybook 10 (`@storybook/web-components-vite`) | Plus a11y addon |
| Unit / component tests | Vitest 4 Browser Mode + Playwright provider | Real browser, visual regression built in |
| Accessibility tests | axe-core (in tests) + Storybook a11y addon | Plus manual screen reader passes |
| Linting | ESLint + `eslint-plugin-lit` + `eslint-plugin-wc`, Stylelint, Prettier | |
| Versioning / release | Changesets | Coordinated versions across packages |
| CI | GitHub Actions (or your platform) | Build, test, Storybook deploy, publish |
| Design–code link | Figma Code Connect (HTML) | Requires suitable Figma plan |

---

## 6. Phased plan

Each phase lists its goal, main tasks, and an exit criterion. Phases 0–5 build the foundation and one fully finished pilot component; Phase 6 is the bulk of component work.

### Phase 0 — Discovery and decisions

**Goal:** settle the questions that are expensive to change later.

Tasks:

- **Audit the Figma file.** For each item in the inventory (Section 7), note variants, sizes, states (hover, focus, disabled, error), and whether it's built on Figma Variables or hard-coded values.
- **Check Figma Variables hygiene.** Primitives and semantic tokens should be separate collections; semantic tokens should alias primitives; modes (light/dark, brands) should be modes, not duplicate collections. Fixing this in Figma first saves pipeline workarounds.
- **List consumers.** Which apps and frameworks will use the library (React version? Angular? server-rendered pages?). This decides whether wrappers and SSR matter.
- **Set browser support.** E.g. "last 2 versions of evergreen browsers." This determines whether you can rely on Popover API, anchor positioning, `ElementInternals`, etc.
- **Decide conventions:**
  - Tag and CSS variable prefix: `cc-` (decided)
  - Package scope: `@codechem` (decided); registry: public npm vs private
  - Shadow DOM policy (default on; document exceptions)
  - Form control strategy (form-associated custom elements via `ElementInternals` vs styled native inputs; see Phase 6, Wave C)
  - Event naming (`cc-change`, `cc-close`, …) and whether events bubble/compose
  - Accessibility target (WCAG 2.2 AA)
- **Clarify "Presentation"** in the Figma inventory: component, page template, or a documentation page?

**Exit criterion:** a short decisions document (an ADR file in the repo) that the team agrees on.

### Phase 1 — Repository foundation

**Goal:** an empty but fully wired monorepo.

Tasks:

- Initialize pnpm workspace, Turborepo pipeline (`build`, `test`, `lint`, `storybook`).
- Shared `tsconfig` base, ESLint/Stylelint/Prettier configs.
- Changesets initialized.
- CI pipeline: install → lint → build → test on every pull request.
- `README`, `CONTRIBUTING.md`, and the ADR from Phase 0 committed.

**Exit criterion:** CI passes on an empty skeleton; `pnpm build` runs across all packages.

### Phase 2 — Token pipeline (`@codechem/tokens`)

**Goal:** Figma Variables become versioned CSS variables and TS constants.

Tasks:

1. **Export** each Figma variable collection (all modes) as DTCG JSON. Commit the files to `packages/tokens/src/`, renamed to stable names (don't rely on Figma's generated file names as the contract).
2. **Verify the export:** aliases preserved, `$type` present on every token, units correct. Add missing descriptions in code if Figma omits them.
3. **Configure Style Dictionary v5** to output:
   - `tokens.css`: primitives and default (light) semantic tokens on `:root`
   - `themes/dark.css`: semantic overrides under `[data-theme="dark"]` (and optionally `@media (prefers-color-scheme: dark)`)
   - `tokens.js` + `tokens.d.ts`: for JS consumers and documentation
4. **Name transform:** `color.action.primary` → `--cc-color-action-primary`.
5. **Typography:** composite typography tokens (family, size, weight, line height) → individual variables plus ready-made classes in foundations.
6. **Validation in CI:** fail the build on broken aliases or missing types.
7. **Later (Phase 9):** automate the Figma → repo sync so a designer's change opens a pull request.

**Exit criterion:** importing `@codechem/tokens/tokens.css` in a plain HTML page gives working variables, and switching `data-theme` swaps the theme.

### Phase 3 — Foundations and icons

**Goal:** everything that isn't a component.

`@codechem/foundations`:

- Minimal reset/normalize
- Typography classes mapped to Figma text styles (`.cc-heading-1`, `.cc-body`, …)
- Spacing, grid, and layout utilities matching Figma's spacing scale and layout grids
- Scrollbar styling (`scrollbar-color`, `scrollbar-width`, plus `::-webkit-scrollbar` fallbacks) applied opt-in via a class
- Focus ring style shared by all interactive elements

Icons (decided differently from the original plan):

- No `@codechem/icons` package and no `<cc-icon>` element. Icons come from the Material Icons Round font, which is bundled inside `@codechem/components` and registered when a component is imported ([write-up](docs/superpowers/2026-11-11-bundled-fonts.md)).
- Components render icons as ligature spans (`<span class="material-icon" aria-hidden="true">name</span>`), so names must exist in the bundled font.
- Open: Figma icons that are not in Material Icons Round (for example the sidebar collapse glyph in the navigation drawer). Options are to draw them as SVG inside the component or to add them to a custom icon font. Decision pending.

**Exit criterion:** a static page using only foundations + icons matches the Figma typography, spacing, and icon specimens.

### Phase 4 — Component infrastructure and the pilot component

**Goal:** one component (**Button**) done to the full standard, end to end. Everything after this is repetition.

Infrastructure tasks:

- `shared/` folder: shared focus-ring styles, a small base class only if genuinely needed (prefer composition via Lit reactive controllers), utility functions.
- Build config: ESM output, one entry per component, `exports` map in `package.json`, `sideEffects` listing the files that call `customElements.define`.
- Registration strategy: each component file defines its own element; guard against double registration (`if (!customElements.get(...))`) to survive duplicate package versions.
- Custom Elements Manifest analyzer wired into the build; manifest referenced via `"customElements"` in `package.json`.
- JSDoc conventions for documenting properties, slots, CSS parts, CSS custom properties, and events (the analyzer reads these).
- Vitest Browser Mode configured with Playwright; axe-core helper for accessibility assertions.

Button tasks:

- Implement `<cc-button>`: variants, sizes, disabled, loading, icon slots, `type="submit"` form participation.
- Styles only from semantic tokens.
- Tests: rendering, attribute/property sync, keyboard activation, form submission, axe check, visual snapshot.
- Story with controls for every variant.
- Code Connect file mapping the Figma Button properties to attributes.

**Exit criterion:** Button is published to a test registry (or `pnpm pack`), installed in the HTML and React sandboxes, works in a real `<form>`, and shows correct snippets in Figma Dev Mode.

### Phase 5 — Presentation layer (Storybook)

**Goal:** the place where anyone can see and try every component.

Tasks:

- Storybook 10 with `@storybook/web-components-vite`.
- Load the Custom Elements Manifest (`setCustomElementsManifest`) so controls and API tables are generated from the code's JSDoc.
- Import `@codechem/tokens` and `@codechem/foundations` globally; add a **toolbar theme switcher** that toggles `data-theme`.
- **Foundations pages (MDX):** color palette, typography scale, spacing scale, icons gallery, generated from `tokens.js` so they never drift from the real values.
- **Per-component docs page:** overview, live examples, do/don't usage guidance, accessibility notes, API table (auto-generated).
- Enable the accessibility addon.
- Deploy a static build on every merge to main (GitHub Pages, Netlify, or Chromatic for visual review).

Optional, later: a public documentation website (e.g. Astro Starlight or Eleventy) that embeds the components directly. Storybook remains the developer workshop; the website becomes the polished guide for wider audiences. Not needed to start.

**Exit criterion:** a deployed Storybook URL showing foundations and the Button, with working theme switching.

### Phase 6 — Component waves

**Goal:** implement the full inventory, ordered from least to most risky so the team builds confidence and shared utilities before the hard parts.

Every component goes through the **Definition of Done** in Section 8.

**Wave A: simple, mostly CSS (size S)**
Link, Badge, Avatar, Chip, Alert

- Link may be just a styled `<a>` (CSS class) rather than a custom element. Decide per component whether it needs to be an element at all.
- Chip: if removable or selectable, it gains interactive behavior; scope carefully.
- Alert: role `status` vs `alert` depending on urgency; dismiss button optional.

**Wave B: built on native primitives (size M)**
Accordion, Dialog, Tooltip, List item

- Accordion on `<details>`/`<summary>`.
- Dialog on native `<dialog>` with `showModal()`: Escape and the inert background come free. Focus trapping does not: Chrome lets Tab leave a modal once, so `<cc-dialog>` wraps Tab and Shift+Tab itself (WAI-ARIA dialog pattern).
- Tooltip using the Popover API and CSS anchor positioning. No JS fallback: anchor positioning is in every evergreen engine (decided when building `<cc-tooltip>`).
- List item: clarify whether lists are static, selectable, or navigational; each implies different ARIA.

Build reusable **reactive controllers** here (e.g. keyboard roving focus, click-outside) for Waves C and D.

**Wave C: form controls (size M–L, highest risk)**
Text input, Text area, Checkbox, Radio button (+ radio group), Switch, Number input stepper, Search bar

- This is the riskiest wave because native inputs inside Shadow DOM don't participate in the surrounding `<form>`.
- Recommended approach: **form-associated custom elements** (`static formAssociated = true` + `ElementInternals`) implementing value, validity, `required`, `disabled`, form reset, and form state restore.
- Labels: support both an internal `label` attribute and external `<label for>`; test with screen readers.
- Build one shared **form-control controller** with Text input first, then reuse it.
- Radio buttons need a group element to manage roving tabindex and arrow-key selection.
- Switch uses `role="switch"`.
- Search bar: built as a standalone `<cc-search-bar>` (native search input, search icon, no clear button) rather than a composition of Text input, because the Figma set has no label or error slots and Text input's trailing icon is fixed to a chevron.

**Wave D: composite navigation (size M–L)**
Tab button (tabs), Pagination, Navigation drawer – rail

- Tabs: full WAI-ARIA tabs pattern (arrow keys, automatic vs manual activation). Built as `<cc-tab>` first (single item, `role="tab"`, must sit in a `role="tablist"`); the tablist container with arrow keys is still to build.
- Pagination: `<nav>` landmark, current page via `aria-current`, compact mode for many pages.
- Navigation rail: collapsed/expanded states, active item, keyboard navigation; may need responsive behavior.

**Wave E: complex (size XL)**
Calendar component

- Date math, locale formatting (use `Intl.DateTimeFormat`), first-day-of-week, keyboard grid navigation (WAI-ARIA grid pattern), min/max and disabled dates, single vs range selection.
- Consider a small, framework-free date library for the math; keep the UI in Lit.
- If a date *picker* (input + popover calendar) is needed, it combines this with Wave B and C work; plan it as a separate item.

**Exit criterion:** every inventory item is either implemented and passing its Definition of Done, or explicitly deferred with a reason.

### Phase 7 — Framework integration

**Goal:** confirm the library works idiomatically in every consumer framework.

Tasks:

- **React:** test in the React sandbox. For React 19+, plain custom elements should work. For older React, generate wrappers with `@lit/react` into `@codechem/react`.
- **Vue:** configure `compilerOptions.isCustomElement` for the `cc-` prefix; verify `v-model` patterns with your form controls.
- **Angular:** `CUSTOM_ELEMENTS_SCHEMA`; verify reactive forms integration (may need a small `ControlValueAccessor` directive package).
- **TypeScript users:** ship `HTMLElementTagNameMap` declarations so `document.querySelector('cc-button')` is typed.
- **Server-rendered pages:** decide whether SSR is in scope. If not, document how to avoid layout shift (e.g. `:not(:defined)` styles).

**Exit criterion:** each sandbox app uses at least one component from every wave, including a full form submission.

### Phase 8 — Release and distribution

**Goal:** predictable, versioned releases.

Tasks:

- Semantic versioning policy written down: what counts as breaking (removed attribute, renamed event, changed token name).
- Changesets in every pull request; automated release PR and publish from CI.
- Publish to npm (public or private registry).
- Verify CDN usage via jsDelivr / unpkg for no-build consumers.
- Ship the font licence texts with the package (SIL OFL 1.1 for Kumbh Sans, Apache 2.0 for Material Icons Round).
- Changelog published in Storybook.

**Exit criterion:** version 1.0.0 published; a consumer can install, upgrade, and read what changed.

### Phase 9 — Design–code sync and governance

**Goal:** keep Figma and code from drifting apart after launch.

Tasks:

- **Token automation:** a scheduled or on-demand job (or a plugin with Git sync such as Tokens Studio) that turns Figma Variables changes into a pull request.
- **Code Connect** published for all components so Dev Mode shows real usage.
- **Naming parity:** Figma component properties named exactly like code attributes (`variant`, `size`, `disabled`).
- **Contribution process:** how designers propose a new component, how it moves from Figma to code, who reviews.
- **Deprecation policy:** mark deprecated in code and Figma, keep for one major version, then remove.

**Exit criterion:** a token change made in Figma reaches production through a reviewed pull request with no manual copying.

---

## 7. Figma inventory mapped to deliverables

| Figma item | Deliverable | Wave / phase | Size | Status |
|---|---|---|---|---|
| Colors | Tokens | Phase 2 | M | Done: `--cc-*` tokens |
| Typography | Tokens + foundation classes | Phases 2–3 | M | Tokens done; foundation classes not started |
| Spacing, grids and layouts | Tokens + layout utilities | Phases 2–3 | M | Tokens done; layout utilities not started |
| Icons | `@codechem/icons` + `<cc-icon>` | Phase 3 | M | Done differently: Material Icons Round font, no `@codechem/icons` ([write-up](docs/superpowers/2026-11-09-material-icons.md)); the font is bundled inside `@codechem/components` (no separate package, no Google Fonts link) ([write-up](docs/superpowers/2026-11-11-bundled-fonts.md)) |
| Scrollbar | Foundation CSS | Phase 3 | S | Not started |
| Presentation | **To clarify** | Phase 0 | ? | Not started |
| Button | Component (pilot) | Phase 4 | M | Done: `<cc-button>`; icon-only buttons (`icon-only`, `shape`, `accent` variant) added ([write-up](docs/superpowers/2026-11-10-icon-only-button.md)) |
| Link | Component | Wave A | S | Done: `<cc-link>` component ([write-up](docs/superpowers/2026-11-09-link.md)) |
| Badge | Component | Wave A | S | Done: `<cc-badge>` ([write-up](docs/superpowers/2026-11-09-badge-and-readme.md)) |
| Avatar | Component | Wave A | S | Done: `<cc-avatar>` ([write-up](docs/superpowers/2026-11-11-avatar.md)) |
| Chip | Component | Wave A | S–M | Done: `<cc-chip>` filter and input types ([write-up](docs/superpowers/2026-11-10-chip.md)); no dragged state, avatar is a slot until `<cc-avatar>` exists |
| Alert | Component | Wave A | S | Done: `<cc-alert>` |
| Accordion | Component on `<details>` | Wave B | M | Done: `<cc-accordion>` ([write-up](docs/superpowers/2026-11-10-accordion.md)); Badge (hidden in Figma) not built |
| Dialogs | Component on `<dialog>` | Wave B | M | Done: `<cc-dialog>` ([write-up](docs/superpowers/2026-11-10-dialog.md)); Text input selector and list-item rows are consumer content until Wave C and list items |
| Tooltips | Component on Popover API | Wave B | M | Done: `<cc-tooltip>` ([write-up](docs/superpowers/2026-11-10-tooltip.md)) |
| List items | Component | Wave B | M | Done: `<cc-list-item>` ([write-up](docs/superpowers/2026-11-10-list-item.md)); no disabled state, awaiting designer; needs a `role="list"` container |
| Text input | Form-associated component | Wave C | L | Done: `<cc-text-input>` ([write-up](docs/superpowers/2026-11-10-text-input.md)); leading icon and input chips are slots (chips are `<cc-chip type="input">`); pressed dims the whole component as in Figma; designer questions open (leading icon with chips, chevron behaviour, supporting text position) |
| Text area | Form-associated component | Wave C | M | Done: `<cc-textarea>` ([write-up](docs/superpowers/2026-11-10-textarea.md)); Pressed state skipped, awaiting designer |
| Checkbox | Form-associated component | Wave C | M | Done: `<cc-checkbox>` ([write-up](docs/superpowers/2026-11-09-checkbox.md)) |
| Radio button | Form-associated component + group | Wave C | L | Done: `<cc-radio-group>` + `<cc-radio>` ([write-up](docs/superpowers/2026-11-10-radio.md)); disabled `<fieldset>`, `required` waiting on the shared form-control controller |
| Switch button | Form-associated component | Wave C | M | Done: `<cc-switch>` ([write-up](docs/superpowers/2026-11-10-switch.md)); Figma "On" default is True, the element uses `checked` (default off) like `<cc-checkbox>`; label spacing and the large thumb geometry await the designer |
| Number input stepper | Form-associated component | Wave C | M | Done: `<cc-number-input-stepper>` ([write-up](docs/superpowers/2026-11-10-number-input-stepper.md)); label, error state and the Figma-stroke question await the designer |
| Search bar | Composition of Text input | Wave C | S–M | Done: `<cc-search-bar>` built standalone, not on `<cc-text-input>` (its chevron and label/error slots don't fit the Figma set); no clear button in Figma; cancel-button hiding not covered by an automated test ([write-up](docs/superpowers/2026-11-10-search-bar.md)) |
| Tab button | Tabs component set | Wave D | L | Done: `<cc-tab>`; tablist group (arrow keys, roving tabindex, activation mode) not started ([write-up](docs/superpowers/2026-11-10-tab.md)) |
| Pagination | Component | Wave D | M | Done: `<cc-pagination>`; compact/ellipsis mode not started, awaiting designer ([write-up](docs/superpowers/2026-11-10-pagination.md)) |
| Navigation drawer – rail | Component | Wave D | L | Done: `<cc-navigation-drawer>` with a `collapsed` attribute ([write-up](docs/superpowers/2026-11-11-navigation-drawer.md)); rail mirrors the expanded drawer (Figma's copy error resolved); collapsed-group flyouts and the responsive behaviour not built |
| Calendar component | Component | Wave E | XL | Done: `<cc-calendar>` single-date picker ([write-up](docs/superpowers/2026-11-11-calendar.md)); Figma's Month dropdown and year chip not built (prev/next buttons instead); range selection and the input-plus-popover picker not started |

**Status** is updated whenever a component is finished (the `create-cc-component` skill does this). Each "Done" links to its write-up in `docs/superpowers/`.

Sizes are relative effort, not calendar time: S ≈ a day or two, M ≈ several days, L ≈ one to two weeks, XL ≈ several weeks, for one developer including tests and docs. Adjust after the pilot.

---

## 8. Component Definition of Done

A component is finished when:

- [ ] Matches Figma for every variant, size, and state, in all themes
- [ ] Uses only semantic tokens; no hard-coded colors or sizes
- [ ] Attributes and properties documented with JSDoc; appears correctly in `custom-elements.json`
- [ ] Slots, CSS parts, and public CSS custom properties documented
- [ ] Events use the agreed naming convention and are documented
- [ ] Keyboard operable following the relevant WAI-ARIA pattern
- [ ] Correct roles, names, and states; passes axe checks; spot-checked with a screen reader
- [ ] Visible focus indicator using the shared focus style
- [ ] Respects `prefers-reduced-motion`
- [ ] Form controls: submit, reset, validation, and disabled state work in a real `<form>`
- [ ] Tests in Vitest Browser Mode, including a visual snapshot
- [ ] Storybook story with controls and a docs page with usage guidance
- [ ] Code Connect mapping published
- [ ] Verified in at least the HTML and React sandboxes
- [ ] Changeset added

---

## 9. Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Figma Variables are inconsistent (hard-coded values, duplicated collections) | Messy tokens, manual fixes forever | Clean up in Figma during Phase 0 before building the pipeline |
| Form controls inside Shadow DOM don't work with forms | Broken forms in consumer apps | Form-associated custom elements via `ElementInternals`; prototype Text input and Checkbox early |
| Shadow DOM blocks consumers' global styles | Frustration, workarounds | Theme via CSS variables; expose `::part()` for deliberate customization; document it |
| React (pre-19) handles custom element props/events poorly | Awkward React usage | `@lit/react` wrappers in `@codechem/react` |
| Angular/Vue form integration | Two-way binding doesn't work out of the box | Small adapter directives; test in sandboxes |
| Figma and code drift apart | Loss of trust in the system | Token automation, Code Connect, matching property names (Phase 9) |
| Calendar scope creep | Delays release | Treat as its own mini-project; ship single-date selection first |
| Native Figma export limitations (e.g. missing descriptions) | Incomplete token metadata | Keep descriptions in code, or use a plugin export |

---

## 10. Suggested milestones

1. **M1 — Foundations live:** Phases 0–3 complete. Tokens, foundations, and the bundled icon font published; usable in plain HTML.
2. **M2 — Pilot complete:** Phases 4–5. Button finished to full standard; Storybook deployed.
3. **M3 — Core set:** Waves A and B. Enough for simple pages.
4. **M4 — Forms:** Wave C. Enough for real application screens.
5. **M5 — Navigation and calendar:** Waves D and E.
6. **M6 — 1.0 release:** Phases 7–9. Framework integration verified, release process and governance in place.

---

## 11. Open questions to answer in Phase 0

1. Which frameworks and versions will consume the library?
2. Public npm or private registry?
3. Which Figma plan does the team have (affects REST Variables API and Code Connect access)?
4. Are multiple themes or brands needed beyond light/dark?
5. Is server-side rendering required anywhere?
6. What is "Presentation" in the Figma inventory?
7. Does the Calendar need range selection or only single dates?

---

## 12. Sources

- Design Tokens specification 2025.10 announcement — https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/
- Design Tokens Community Group FAQ — https://www.designtokens.org/faq/
- Exporting Figma Variables to DTCG JSON — https://atomize.tools/blog/figma-variables-export-json/
- Figma community thread on native variable export — https://forum.figma.com/ask-the-community-7/native-variable-export-feature-47831
- Style Dictionary / Figma DTCG support notes — https://project.pages.drupalcode.org/design_system_api/prior-art/tokens/
- TokensBrücke Figma plugin — https://github.com/tokens-bruecke/figma-plugin
- Lit joins the OpenJS Foundation — https://lit.dev/blog/2025-10-14-openjs/
- Lit decorators documentation — https://lit.dev/docs/components/decorators/
- Storybook for Web Components & Vite — https://storybook.js.org/docs/get-started/frameworks/web-components-vite
- Vitest 4 announcement (stable Browser Mode) — https://voidzero.dev/posts/announcing-vitest-4
- Figma Code Connect for Web Components — https://developers.figma.com/docs/code-connect/html
- Figma Code Connect overview — https://developers.figma.com/docs/code-connect
