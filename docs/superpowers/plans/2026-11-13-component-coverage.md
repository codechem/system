# Component Coverage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Report component coverage in existing CI and require at least 85% across four metrics (updated user requirement).

**Architecture:** Extend the existing Vitest browser configuration with V8 coverage and global thresholds. Run a dedicated root coverage command in the existing CI test job and always attempt report upload without masking failures.

**Tech Stack:** npm workspaces, Vitest, Playwright Chromium, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-11-13-component-coverage-design.md`

## Global Constraints
- Component production source only, including untested files; exclude stories, tests, declarations, and generated files.
- Global lines/statements/functions/branches thresholds: 85%.
- Reports: console, HTML, LCOV; reports remain available when the gate fails.
- No application, token, or release-script coverage; no production behavior changes.

## Review Focus
- Coverage below 85% must not pass: verify configured thresholds are 85.
- Untested source must count: verify explicit source includes against a coverage run.
- Documentation/test files must not inflate coverage: inspect report file list.
- Failed coverage must block publishing: retain `publish.needs: test` and normal failing test step.
- Failure must not discard reports: verify upload condition and paths.

### Task 1: Component coverage command and CI integration

**Files:**
- Modify: `packages/components/vitest.config.ts`, `packages/components/package.json`, `package.json`, `package-lock.json`.
- Modify: `.github/workflows/release.yml`, `.gitignore`, `README.md`.
- Create: `scripts/component-coverage.test.mjs` (configuration/workflow regression tests).
- Create: `docs/superpowers/2026-11-13-component-coverage.md` (verification and review results).

**Interfaces:**
- Consumes: existing Chromium component tests and CI `test` job.
- Produces: root `npm run test:coverage`, workspace `test:coverage` (`vitest run --coverage`), reports in `packages/components/coverage/`.

- [ ] Add Node regression tests checking root/workspace commands, all four thresholds, explicit source inclusion and nonproduction exclusions, matching provider dependency, CI coverage command, failure-safe artifact upload, and preserved publish dependency.
- [ ] Run `node --test scripts/component-coverage.test.mjs`; confirm failures identify missing coverage integration.
- [ ] Install `@vitest/coverage-v8` matching installed Vitest into the components workspace; update lockfile.
- [ ] Configure V8 with text/HTML/LCOV reporters, explicit source includes/exclusions, `reportOnFailure`, and global 85 thresholds. Add root/workspace coverage commands and ignore `coverage/`.
- [ ] Replace CI `npm test` with `npm run test:coverage` (components are the only workspace exposing `test`); retain release-script test step. Upload `packages/components/coverage/` with `if: always()` and warn on missing files, without suppressing test failures.
- [ ] Document local command, scope, threshold semantics, artifact location, and build/Chromium prerequisites in README.
- [ ] Run regression tests, `node --test scripts/*.test.mjs`, `npm run build`, and `npm run test:coverage`. Inspect report file list and metrics; report gaps without relaxing the gate.
- [ ] Self-review diff and record verification/review results; obtain independent review if authorized by the selected execution method.
