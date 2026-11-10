---
name: create-cc-component
description: Build a new <cc-*> Lit web component in this repo from a Figma link — component, stories, tests, registration, visual check, superpowers write-up, code review with fixes, and a project plan status update. Use when the user gives a Figma link and asks to create/implement a component. Never commits.
argument-hint: <figma-url>
---

# Create a cc-* component from Figma

Figma link: $ARGUMENTS

If no link was given, ask for one and stop.

**Never commit, stage or push.** The user commits. Do not touch editor settings (`.vscode/`).

## 1. Read the design

1. **Parse the URL.** `figma.com/design/<fileKey>/...?node-id=<a-b>` gives the nodeId `a:b`.
2. **Load the Figma skills.** Call `create_session` (fileKey, short task). Load `skill://figma/figma-design-to-code/SKILL.md` and `skill://figma/figma-use/SKILL.md` with `get_figma_skill`. All Figma calls here are **read-only**.
3. **Find the component set.** The linked node is usually the page's *documentation frame*, not the component. Run [figma-inspect.md](figma-inspect.md) step A with `use_figma` to find the `COMPONENT_SET` on that page. If there are several, pick the one matching the user's request, or ask.
4. **Inspect the set.** Run step B on the set id. It returns the variant properties, sizes, padding, gap, radius, opacity, text styles, fills and strokes, with **bound variable names**. Variable names map to tokens: `Accent/light` → `--cc-accent-light`, `Gap/gap - 0,5` → `--cc-gap-gap-0-5`, `icon-sm` → `--cc-icon-sm`. Check every token exists in `packages/tokens/dist/tokens.css` (run `npm run build -w @codechem/tokens` first if `dist` is missing).
5. **Take the visual target.** Call `get_screenshot` on the set.
6. **Read the plan.** Find the component's row in section 7 of `web-component-library-plan.md`, and its wave notes in section 6 (Phase 6). They hold decisions and scope warnings, e.g. "Switch uses `role="switch"`" or "Radio buttons need a group element". Follow them, or note why not. The Definition of Done is in section 8.
7. **Note designer questions.** Write down Figma inconsistencies (e.g. one state with a different opacity than its siblings). Don't copy them silently.

## 2. Follow the house conventions

Read `packages/components/src/button/cc-button.ts`, `checkbox/cc-checkbox.ts`, `link/cc-link.ts` and `shared/icon-styles.ts` before writing. Then apply these rules.

### Element and properties

- **File:** `packages/components/src/<name>/cc-<name>.ts`. Class `Cc<Name>`, tag `cc-<name>`.
- **Properties:** `static properties` plus `declare` fields, with defaults set in the constructor. Reflect the attributes that drive styling (`variant`, `size`, `disabled`, ...).
- **Naming:**
  - Figma "Style" becomes `variant` and "Size" becomes `size` (kebab-case values, e.g. `extra-large`).
  - When Figma's "Variant" means a kind, name it `type`.
  - The default size is `medium` when it exists.
  - A boolean that is on by default in Figma becomes an off switch, e.g. `hide-icon`.
- **Registration:** a guarded `customElements.define`, plus a `declare global { interface HTMLElementTagNameMap }` entry.
- **Comments:** JSDoc only, for tools: the class summary "Mirrors the Figma "X" component set.", `@slot`, `@fires`, `@csspart`, and `/** @internal */` on private members. No other comments.

### Styles

- **Tokens only:** use `--cc-*` tokens for every colour, size, spacing and font value. Raw numbers are allowed only where no token exists (opacity 0.4 / 0.7, stroke widths).
- **Private variables:** set a `--_*` layer on `:host`, then switch it per attribute with `:host([size='small'])` and similar.
- **Always include** `:host([hidden]) { display: none; }`.
- **Text:** `font-family: var(--cc-typeface-typeface)` and `font-variation-settings: 'YOPQ' 300`.
- **Inside strokes:** Figma's inside stroke becomes `box-shadow: inset 0 0 0 Npx`.
- **Shared states:**
  - Pressed is `:active` with opacity 0.7.
  - Disabled is opacity 0.4 with `cursor: not-allowed`.
  - Focus is `:focus-visible` with `outline: 2px solid var(--cc-border-focus)`.

### Icons

- Use the Material Icons Round font, never inline SVG: `static styles = [iconStyles, css`...`]`, rendering `<span class="material-icon" aria-hidden="true">name</span>` sized with `font-size`.
- **Slotted icons:**
  - Size them with `::slotted([slot='leading']) { width; height; font-size: var(...) !important; flex: none }`. The `!important` is needed to beat Google's 24px class.
  - Wrap icon slots that sit inside a named control in `aria-hidden="true"` with `display: contents`, so slotted icon names never become part of the accessible name.

### Behaviour

- **Interactive elements:**
  - Use a real native element inside the shadow root: `<button>`, `<a>` or `<input>`.
  - Set `delegatesFocus: true` (as `/** @internal */ static shadowRootOptions`).
  - Forward `click()` to the inner element.
  - Forward a host `aria-label` (`ariaLabel: { attribute: 'aria-label' }`) to the inner element.
  - When disabled, add a host click listener in the constructor that calls `preventDefault()` and `stopImmediatePropagation()`.
- **Form controls:**
  - `static formAssociated = true` with `attachInternals()`.
  - Call `setFormValue` in `updated()` and implement `formResetCallback`.
  - Re-dispatch `change`, which is not composed.
  - Sync state on `input`.
  - Bind the inner `.checked`/`.value` with `live()`.
- **Text content:** English only. Use "John Doe" when a person's name is needed.

## 3. Stories: `cc-<name>.stories.ts`

Match `badge`/`link` stories:
- `type Args`, a render helper, and a default export with `title: 'Components/<Name>'`, `component: 'cc-<name>'`, `tags: ['autodocs']`, and `args ... satisfies Args`.
- `argTypes` use `inline-radio` or `select` controls.
- A few named stories, plus `AllVariants`, a grid laid out like the Figma frame with `controls: { disable: true }`.
- Icons in stories are `<span slot=... class="material-icons-round" aria-hidden="true">name</span>`.
- Every story element has an accessible name.

## 4. Tests: `cc-<name>.test.ts`

Vitest browser mode in Chromium; `vitest/browser` exports `page` and `userEvent`. Match the existing tests:
- An `async render(markup)` helper (wait for `updateComplete` and `document.fonts.ready`), with `afterEach` clearing the body. If you use hover, also call `userEvent.unhover(document.body)`.
- **Colours:** compare against a `tokenColor('--cc-...')` probe div, never against hard-coded rgb values.
- **Sizes:** use `it.each` over Figma's pixel sizes. Chrome rounds to 1/64px, so compare fractional values with `toBeCloseTo`.
- **Accessibility:** use `page.getByRole(role, { name, exact: true })`. Also check that ligatures and icons don't leak into names.
- **Behaviour:** cover keyboard, click, disabled (including blocked listeners), forms, and `focus()`/`click()` forwarding where it applies.
- Each test must fail if the behaviour breaks.

## 5. Register

- `packages/components/src/index.ts`: `export { Cc<Name> } from './<name>/cc-<name>.js';`
- `packages/components/package.json` → `exports`: add a `"./<name>.js": { types, default }` entry **before** `"./custom-elements.json"`.
- `README.md`: add the tag to the components row of "What's inside", and add the folder to "Project layout".

## 6. Verify (all must pass)

Use Node from mise: `export PATH="$(mise where node@26.13.0)/bin:$PATH"` (or `mise exec --`).

```sh
npm exec -w @codechem/components -- tsc --noEmit -p .
npm exec -w @codechem/components -- vitest run
npm run build
```

If a new Lit directive causes "Vite unexpectedly reloaded", add it to `optimizeDeps.include` in `packages/components/vitest.config.ts`.

**Visual check:**
1. Start Storybook in the background with `npm run storybook -- --no-open`, and wait for `http://localhost:6006/iframe.html`.
2. Open `iframe.html?id=components-<name>--all-variants` with the Chrome tools.
3. Compare it with the Figma screenshot, including hover and Tab focus.
4. Close the tab and run `pkill -f "storybook dev -p 6006"`.

## 7. Write the superpowers doc

Create `docs/superpowers/<YYYY-MM-DD>-<name>.md` with these sections: Goal, Requirements (from Figma, and expected behaviour), Steps taken, Verification, Left out, Designer questions.

## 8. Review the code (mandatory)

1. Invoke `superpowers:requesting-code-review`.
2. Send a `general-purpose` reviewer agent. Give it the doc as the spec, and point it at:
   - the conventions in section 2 of this skill;
   - the plan's Definition of Done (section 8 of `web-component-library-plan.md`);
   - the existing components for comparison.

   Tell it to work read-only in a scratch clone, verify claims by running code (throwaway browser probes), and list what it declined to judge.
3. **Fix the findings.** Fix every Critical and Important finding, and the cheap Minor ones. If you push back on one, give the technical reason in the doc.
4. **Re-run section 6.** Every check must pass again.
5. **Record the review.** Append a `## Review` section to the doc: the verdict, what the reviewer confirmed, a findings table (severity | finding | fix or reason left), and the results after the fixes.

## 9. Update the project plan

In `web-component-library-plan.md`:

1. **Mark the row done.** In the section 7 inventory table, set the component's **Status** to ``Done: `<cc-name>` ([write-up](docs/superpowers/<file>.md))``. If only part is done, write what is left, e.g. ``Done: `<cc-radio>`; group element not started``.
2. **Record changed decisions.** If the build changed a plan decision, update that text too. Examples: "CSS class or component" became a component; a different approach was used than the wave notes describe.
3. **Leave the rest alone.** Don't rewrite other parts of the plan.

## 10. Report to the user

Briefly cover:
- which Figma node was used (if the link was the documentation frame);
- the attribute and usage summary;
- design decisions;
- review findings and fixes;
- designer questions;
- test count;
- the plan status change;
- the list of uncommitted files to commit.

Do not commit.
