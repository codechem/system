# Storybook Developer Documentation Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the existing Storybook useful to developers consuming the npm packages, not just component authors.

**Architecture:** Keep Storybook, Lit stories, existing URLs and generated Custom Elements Manifest. Add a shared consumer-documentation template backed by reviewed per-component guidance and public API metadata. Fix Markdown rendering centrally and retain playground stories separately.

**Tech Stack:** Storybook 10, MDX, React documentation blocks, Lit custom elements, Playwright browser checks.

**Scope:** User requested immediate implementation without further design questions. No component behavior changes, publishing, deployment or commits without request.

## Review focus
- Fenced examples must be visible and copyable; tables must render semantically.
- API references must not advertise internal reactive state as supported attributes.
- Examples must use real exports and describe state ownership and event payloads accurately.
- Existing story URLs and developer controls must remain available.
- Long API types, code and token tables must not cause page overflow at 390px.

## Tasks
- [x] Reproduce blank code and raw tables; add browser regression checks that fail against current output.
- [x] Fix MDX rendering with GFM and a shared accessible copyable code renderer. Verify regression checks.
- [x] Implement a shared documentation page and complete guidance for all 21 component story groups; include live examples, imports, usage, events, accessibility, API tables and related links. Filter internal state using real runtime property metadata.
- [x] Rewrite Getting started and add framework integration, forms/events and styling guides. Improve foundations navigation and reading layout without changing existing URLs.
- [x] Run the Storybook production build, browser-check every documentation page on desktop and mobile, exercise live interactions and copy, run all existing tests, self-review and record limitations.

## Evidence
- Baseline browser reproduction: Getting started renders both Markdown tables as paragraphs; six fenced blocks become empty `<pre><div></div></pre>`. Screenshot: `/tmp/opencode/storybook-before.png`.
- Regression tests observed failing for blank code, raw Markdown tables, missing component guidance, missing method references, manager theme bundling and mobile token palette overflow, then passing after their fixes.
- Production build passes; **12 browser tests pass**, covering all 27 documentation pages at 1440px and 390px, existing story links, clipboard contents, dialog dismissal, chip removal, numeric validation method references, public package import resolution and a real submission using copied quickstart snippets.
- Ruling: preserve the existing checkout on a dedicated feature branch rather than move the active workspace; keep all changes uncommitted for user review. No component implementation or deployment behavior changed.
- Independent read-only review found an unresolved purple-opacity token, ambiguous drawer routing guidance, SSR registration concerns and insufficient selected-navigation contrast. Fixed each with an observed failing regression followed by a passing production test. The theme example now derives transparency from an existing token; drawer handlers ignore native links; React registration runs in a client effect; selected navigation uses a darker token-derived color.
- Verification refined the SSR finding: bare imports succeed in this Node environment because Lit supplies a server registry and font/token loaders guard document access. The revised example avoids server registration altogether; the test renders the copied React snippet with ReactDOMServer and verifies no registry is installed. No blanket claim that all imports crash on Node remains.
- Final existing suites: **491 component tests** and **25 automation tests** pass. `git diff --check` passes. Captured 55 desktop/phone screenshots under `/tmp/opencode/storybook-docs-visual/` and reviewed contact sheets and the complete manager layout. Prose, link and code contrasts measured 10.98:1, 9.08:1 and 17.50:1; the selected manager row now passes the browser's 4.5:1 contrast assertion.
- Limits: framework recipes were checked against the component contracts and the React snippet is server-render tested; full Vue, Angular and Next.js application builds were not added. Existing dependency audit findings remain unchanged (two low, four moderate). No commit, push, publication or deployment was performed.
