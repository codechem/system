# Layout archetypes

Pick one per page. The CSS below is plain CSS using role variables (see SKILL.md, step 2). Map `--canvas`, `--surface-1`, `--line`, `--ink`, `--ink-muted` and `--accent` to the project's tokens at the top of the stylesheet:

```css
:root {
  --canvas: var(--cc-background);
  --surface-1: var(--cc-surface-surface-1);
  --surface-2: var(--cc-surface-surface-2);
  --line: var(--cc-surface-surface-highlight);
  --ink: var(--cc-text-high-emphasis);
  --ink-muted: var(--cc-text-medium-emphasis);
  --ink-subtle: var(--cc-text-low-emphasis);
  --accent: var(--cc-accent-main);
  --accent-ink: var(--cc-accent-light);
  --radius-block: calc(var(--cc-radius) * 3);
  --page: 80rem;
  --gutter: clamp(1rem, 4vw, 2.5rem);
}
```

## Contents

1. Split hero with a block wall
2. Centered hero with a masonry wall
3. Spec-sheet grid
4. Docs layout
5. App screens (top-bar workspace, list–detail, overview canvas, focused column, sidebar shell)
6. Shared pieces: header, block, install pill, stage
7. Overflow check

## 1. Split hero with a block wall (Radix, Park UI)

The text column gets about 40% of the width, and the wall takes the rest, bleeding off the right edge.

```css
.hero { display: grid; grid-template-columns: minmax(0, 30rem) minmax(0, 1fr); gap: clamp(2rem, 5vw, 4rem);
  align-items: center; min-height: min(56rem, 100vh); padding-left: max(var(--gutter), calc((100vw - var(--page)) / 2));
  overflow: hidden; }
.wall { columns: 3 18rem; column-gap: 1rem; margin-right: -6rem; /* bleed */
  /* No rotate(): tilted text and components render blurry. Use staggered column offsets instead. */
  mask-image: linear-gradient(to bottom, #000 75%, transparent); }
.wall > * { break-inside: avoid; margin-bottom: 1rem; }
@media (max-width: 60rem) { .hero { grid-template-columns: minmax(0, 1fr); padding-right: var(--gutter); }
  .wall { columns: 1; margin-right: 0; transform: none; } }
```

The wall holds 5–8 blocks of different heights, and the tallest goes in the middle column. Blocks inside a tilted wall should still work, because people do click them.

## 2. Centered hero with a masonry wall (shadcn)

```css
.hero { text-align: center; max-width: 44rem; margin: 0 auto; padding: clamp(4rem, 10vw, 7rem) var(--gutter) 3rem; }
.wall { columns: 4 16rem; column-gap: 1rem; max-width: var(--page); margin: 0 auto; padding: 0 var(--gutter);
  max-height: 64rem; overflow: hidden; mask-image: linear-gradient(to bottom, #000 80%, transparent); }
.wall > * { break-inside: avoid; margin-bottom: 1rem; }
```

Use 8–14 blocks. Mix tall ones (a list or a chart) with short ones (one action), so the columns end unevenly and the fade hides that.

## 3. Spec-sheet grid (Kokonut)

```css
.sheet { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 20rem), 1fr));
  border-top: 1px solid var(--line); border-left: 1px solid var(--line); }
.cell { display: grid; grid-template-rows: auto 1fr auto; min-height: 20rem; padding: 1rem;
  border-right: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.cell-top { display: flex; justify-content: space-between; font: 0.75rem/1.4 ui-monospace, monospace; color: var(--ink-subtle); }
.cell-code { color: var(--accent-ink); }
.cell-demo { display: grid; place-items: center; padding: 1.5rem 0; }
.cell-foot { display: flex; justify-content: space-between; align-items: end; gap: 1rem; }
```

Cell anatomy: a code (BT-01) with a hint ("Press and hold"), then the demo, then the name and import path with Copy buttons. Codes are fine here because a catalog really is a numbered list.

## 4. Docs layout

```css
.docs { display: grid; grid-template-columns: 14rem minmax(0, 1fr); gap: clamp(2rem, 5vw, 4rem);
  max-width: var(--page); margin: 0 auto; padding: 3rem var(--gutter); }
.side { position: sticky; top: calc(var(--header-h) + 2rem); align-self: start; max-height: calc(100vh - 8rem); overflow: auto; }
.prose { max-width: 46rem; } .prose p { max-width: 68ch; }
@media (max-width: 52rem) { .docs { grid-template-columns: minmax(0, 1fr); } .side { display: none; } }
```

Each topic gets a heading, a sentence of explanation, a live **stage**, then the copyable code. On component pages, show the import line for each component.

## 5. App screens: pick one that differs from existing products

Choose by the task, then check SKILL.md step 1b: it must differ from the company's existing products on at least two axes. All of these use `grid-template-columns: minmax(0, 1fr)` for single-column tracks.

**5a. Top-bar workspace.** No sidebar. A slim top bar holds the product mark, 3–5 section tabs and the account. Under it sits a page header with a big title (32–44px), a one-line summary and the primary action, then a full-width content area. Feels like a modern SaaS workspace, not an admin panel.

```css
.topbar { display: flex; align-items: center; gap: 2rem; height: 3.5rem; padding: 0 var(--gutter); border-bottom: 1px solid var(--line); }
.page-head { display: flex; flex-wrap: wrap; align-items: end; justify-content: space-between; gap: 1.5rem; padding: 2.5rem var(--gutter) 1.5rem; }
.page-head h1 { font-size: clamp(2rem, 4vw, 2.75rem); letter-spacing: -0.03em; }
.content { padding: 0 var(--gutter) 4rem; max-width: 90rem; margin: 0 auto; }
```

**5b. List–detail.** A scrollable list pane (about 22rem) next to a detail pane. Good for candidates, people, tickets and inbox-like work. The list is flat rows divided by hairlines, the selected row takes the accent tint, and the detail opens with a large header and tabs.

```css
.split { display: grid; grid-template-columns: minmax(16rem, 22rem) minmax(0, 1fr); height: calc(100vh - 3.5rem); }
.list { overflow: auto; border-right: 1px solid var(--line); }
.row { padding: 0.9rem 1rem; border-bottom: 1px solid var(--line); }
.row[aria-selected='true'] { background: color-mix(in oklch, var(--accent) 14%, transparent); }
.detail { overflow: auto; padding: 2rem clamp(1rem, 4vw, 3rem); }
@media (max-width: 52rem) { .split { grid-template-columns: minmax(0, 1fr); height: auto; } }
```

**5c. Overview canvas.** For dashboards. Skip the grid of identical cards. Use one wide **headline band**: the metrics set large in a single row on the canvas, with no boxes, separated by space or hairlines. Optionally drench this band in the accent's dark shade. Below it put an asymmetric pair: the main working surface (a table or pipeline, about 2/3) and a quieter side column (activity, about 1/3) without its own box, separated only by a hairline. Filters sit inline in the header as chips or a segmented control, not in a separate card.

```css
.band { display: grid; grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr)); gap: 2rem; padding: 2rem var(--gutter);
  background: var(--accent-shade, var(--surface-1)); }
.metric strong { display: block; font-size: clamp(2.25rem, 4vw, 3.25rem); letter-spacing: -0.03em; line-height: 1; }
.work { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); gap: 0; }
.work > :last-child { border-left: 1px solid var(--line); padding-left: 2rem; }
@media (max-width: 64rem) { .work { grid-template-columns: minmax(0, 1fr); } .work > :last-child { border-left: 0; padding-left: 0; } }
```

**5d. Focused column with a section rail.** For settings, forms and onboarding. A centered column (40–46rem) of **flat sections**: each section's title and description sit in a narrow left column (about 14rem) and its controls on the right. Sections are divided by hairlines, not boxed. A small sticky rail of section links sits on the far left or in the top bar. This is the GitHub or Linear settings pattern, and it reads lighter than stacked cards.

```css
.settings { max-width: 62rem; margin: 0 auto; padding: 3rem var(--gutter); }
.section { display: grid; grid-template-columns: 14rem minmax(0, 1fr); gap: 2rem; padding: 2rem 0; border-top: 1px solid var(--line); }
.section-intro h2 { font-size: 1rem; } .section-intro p { color: var(--ink-muted); font-size: 0.875rem; }
.fields { display: grid; gap: 1.25rem; grid-template-columns: minmax(0, 1fr); }
@media (max-width: 48rem) { .section { grid-template-columns: minmax(0, 1fr); gap: 1rem; } }
```

**5e. Sidebar shell (last resort).** A left nav with the content grid. Use it only when the product genuinely needs persistent deep navigation *and* no sibling product already looks like this.

Dashboard content order in any layout: headline metrics, then the main working surface, then secondary context (activity), then actions.

## 6. Shared pieces

**Header.** Use a sticky header with 1px hairline at the bottom and a canvas background at about 90% opacity. Put the logo on the left and the primary links next to it, with `aria-current="page"` on the active link. Keep the right side for version, GitHub and search. Under 52rem, show a menu button with `popovertarget` instead.

**Block:**

```css
.block { display: grid; gap: 1rem; padding: 1.25rem; background: var(--surface-1);
  border: 1px solid var(--line); border-radius: var(--radius-block); }
.block-head h3 { font-size: 1rem; font-weight: 600; margin: 0; }
.block-head p { font-size: 0.875rem; color: var(--ink-muted); margin: 0.25rem 0 0; }
.block-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.75rem 0; border-top: 1px solid var(--line); }
```

**Install pill.** A `<button>` holding the command in mono and a copy icon. Copy with `navigator.clipboard.writeText` and show a check for about 1.5s.

**Stage.** A container that carries the token surfaces, so components look right even when the page chrome uses the other light/dark mode. Give it `background: var(--canvas-of-tokens); color: var(--ink-of-tokens); border-radius; padding`.

## 7. Overflow check

Paste this into the page (or into the browser automation JS tool). It lists elements wider than the viewport, skipping scroll containers on purpose:

```js
(() => {
  const w = document.documentElement.clientWidth;
  return [...document.querySelectorAll('body *')]
    .filter((e) => e.getBoundingClientRect().right > w + 1 && !e.closest('pre, [data-scroll]'))
    .filter((e) => e.parentElement.getBoundingClientRect().right <= w + 1)
    .map((e) => `${e.tagName.toLowerCase()}.${[...e.classList].join('.')} → ${Math.round(e.getBoundingClientRect().right)}px`);
})();
```

To test 390px when the browser window can't resize, replace the body with same-origin iframes: `document.body.innerHTML = '<iframe src="/" style="width:390px;height:844px">'`, then run the check inside `iframe.contentDocument`.
