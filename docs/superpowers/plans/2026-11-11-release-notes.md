# Automatic Release Notes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automatically create detailed, commit-based GitHub Releases after successful tag-driven npm publication.

**Architecture:** A dependency-free Node script reads Git history and renders categorized Markdown. A separate release job runs it after npm publishing, then uses GitHub CLI to create the release only if it does not already exist.

**Tech Stack:** Node.js built-ins, Git, GitHub Actions, GitHub CLI.

**Spec:** `docs/superpowers/specs/2026-11-11-release-notes-design.md`

## Global Constraints

- Keep tag-driven npm publication and deployment behavior unchanged.
- No new dependencies, label configuration, historical backfill, live release creation, or npm publishing during verification.
- Grant contents write permission only to the release job.
- Treat commit metadata as data; never interpolate it into executable shell code.
- Preserve existing releases on reruns; do not invent migration advice.

## Review Focus

- Annotated tags, unrelated branches, and tags at the same commit must not cause an empty or unrelated range.
- Initial releases must include all reachable commits; malformed or missing tags must fail clearly.
- Scoped subjects, breaking footers, multiline metadata, and Markdown characters must render safely and retain their meaning.
- Existing releases must be untouched; authentication and API errors must not be mistaken for a missing release.
- Failed publication must block release creation, and failed release jobs must be independently retryable.

## File Structure

- `scripts/release-notes.mjs`: Git range selection, commit parsing, Markdown rendering, CLI writing notes to an explicit output path.
- `scripts/release-notes.test.mjs`: Node test runner tests using temporary Git repositories.
- `scripts/create-release.mjs`: GitHub CLI orchestration and existing-release handling.
- `scripts/create-release.test.mjs`: orchestration tests using an injected command runner, without network access.
- `.github/workflows/release.yml`: run automation tests in CI and add a release job after publication.
- `README.md`: explain generated notes, commit conventions, and retries.

### Task 1: Commit-based notes generator

**Interfaces:** Export `generateNotes({ cwd, tag, repository }) -> string`; CLI `node scripts/release-notes.mjs --tag <tag> --repository <owner/repo> --output <path>` writes UTF-8 Markdown. Git commands use argument arrays.

- [ ] Write `scripts/release-notes.test.mjs` with temporary repositories asserting: `feat(button): add size` appears under Features with a commit link; `fix:` under Fixes; `docs:` under Documentation; `build/ci/chore/refactor/perf/style/test` under Maintenance; unknown subjects under Other changes; breaking markers and supplied breaking footer explanations under Breaking changes; empty categories omitted; unique escaped author credits, PR subject references linked, and a factual commit count summary.
- [ ] Add fixtures asserting first release includes root commits and a history link; subsequent releases exclude the previous tag's history and include a compare link; annotated tags work; prerelease and unprefixed tags are ignored as baselines; unrelated tags are ignored; same-commit aliases cannot produce an empty range. Select the nearest strictly ancestral stable `vMAJOR.MINOR.PATCH` tag by Git graph distance with deterministic tie-breaking. Reject invalid/missing target tags and invalid repository identifiers.
- [ ] Add assertions for multiline bodies, Markdown metacharacters, quotes, backticks, and shell-looking subjects; no metadata executes and output stays readable. Preserve author names without requiring GitHub username discovery.
- [ ] Run `mise exec -- node --test scripts/release-notes.test.mjs`; confirm failure because the module does not exist.
- [ ] Implement `scripts/release-notes.mjs` with Git subprocess argument arrays, unambiguous record parsing, deterministic category ordering, relative GitHub links built from the supplied repository, and explicit CLI validation. Use the existing Node version; install no dependencies.
- [ ] Run the same test command; expect all tests to pass.
- [ ] Review and commit explicit generator/test paths.

### Task 2: Release orchestration, CI integration, and documentation

**Interfaces:** Export `createRelease({ tag, repository, notesFile, run })`; injected `run(args)` executes GitHub CLI and returns `{ status, stdout, stderr }`. Production runner uses `spawnSync('gh', args)` without a shell. CLI reads tag/repository from explicit arguments and uses `GH_TOKEN` through the inherited environment.

- [ ] Write `scripts/create-release.test.mjs` asserting: HTTP 200 from `gh api repos/OWNER/REPO/releases/tags/TAG --include` skips creation; only HTTP 404 permits `gh release create TAG --repo OWNER/REPO --verify-tag --title TAG --notes-file PATH`; authentication, rate-limit, network, unexpected status, and create failures throw; existing releases are never edited. Assert arguments remain separate for unusual input and CLI validation rejects invalid repository/tag values.
- [ ] Run `mise exec -- node --test scripts/create-release.test.mjs`; confirm missing-module failure.
- [ ] Implement `scripts/create-release.mjs`; parse the last HTTP response status from GitHub CLI response headers, fail closed when no status is present, and retain useful nonsecret error messages.
- [ ] Run both test files with `mise exec -- node --test scripts/*.test.mjs`; expect all tests to pass.
- [ ] Add the automation test command to the existing `test` job. Add `release` with `needs: publish`, the version-tag guard, `contents: write`, checkout `fetch-depth: 0`, and existing setup-node version configuration. Generate notes to runner temporary storage, then run the create-release CLI with `GH_TOKEN: ${{ github.token }}`. Keep npm publication steps and deployment triggers untouched.
- [ ] Update README releasing section: commit-based categories and conventional commit examples; first-release behavior; credits are author names, not inferred usernames; PR links require PR references in subjects; no invented upgrade instructions; existing releases stay unchanged; rerun failed jobs to retry release creation without republishing npm packages.
- [ ] Verify workflow structure, least-privilege permissions, and `needs: publish` by inspection. Run the full automation tests and generate notes locally for `v0.0.5` into `/tmp/opencode` without invoking the production create-release CLI; inspect the Markdown and run `git diff --check`.
- [ ] Review and commit explicit orchestration/test/workflow/README paths. Do not push or create live releases unless subsequently requested.

## Completion

- [ ] Self-review plan coverage and final diff; obtain independent review if authorized by the chosen execution method.
- [ ] Record exact verification results and any limitations. Update this checklist as work progresses.
