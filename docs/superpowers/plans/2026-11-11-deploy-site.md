# Front-page Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an independent Dokploy deployment workflow for the front page.

**Architecture:** Mirror Storybook's webhook-only workflow using the `site` environment. Dokploy builds the existing site Dockerfile; GitHub Actions only requests deployment.

**Tech Stack:** GitHub Actions YAML, Bash, jq, curl, Dokploy, Astro.

**Spec:** `docs/superpowers/specs/2026-11-11-deploy-site-design.md`

## Global Constraints

- Preserve Storybook behavior and application code.
- Use `site` and its own `DOKPLOY_WEBHOOK_URL` secret.
- Deploy automatically only after successful push CI on `main`; support manual dispatch.
- Document `apps/site/Dockerfile`, repository-root build context, and port `8080`.
- No live deployment, remote configuration, or credential exposure.

## Review Focus

- Missing secret must fail before calling curl.
- Dokploy skip/error replies (301, 400, 500) must fail.
- Commit messages with quotes/newlines must produce valid JSON.
- Failed CI and pull-request CI must not deploy.
- Site and Storybook environment secrets and concurrency groups must remain independent.

## Task 1: Add and document the deployment workflow

**Files:**
- Create: `.github/workflows/deploy-site.yml`
- Modify: `README.md` (add front-page deployment instructions beside Storybook)
- Reference: `.github/workflows/deploy-storybook.yml`, `apps/site/Dockerfile`

**Interfaces:** Consumes GitHub workflow-run metadata and `secrets.DOKPLOY_WEBHOOK_URL`; produces a Dokploy GitHub-push webhook request.

- [x] Create a temporary local verification harness outside the repo. Assert the workflow exists and matches Storybook except for site-specific name, environment, concurrency, comments, and fallback message. Run before implementation and confirm failure because the file is absent.
- [x] Copy the Storybook workflow to `deploy-site.yml`, replacing Storybook-specific identifiers/text with site equivalents; retain payload construction, guard, permissions, and HTTP error handling.
- [x] Add README instructions for the `site` environment secret, Auto Deploy, Dockerfile, build context, port, and optional `PUBLIC_STORYBOOK_URL` build argument. Warn that a repository-level Storybook webhook must not be reused for the site.
- [x] Run structural comparison, Bash syntax validation, and local mocked shell-step checks for missing secret, HTTP 200/301/400/500, curl failure, and quoted/multiline commit metadata. Check success/failure/PR/manual trigger guards and independent concurrency/environment identifiers.
- [x] Review `git diff --check` and the scoped diff; confirm Storybook remains unchanged. Report results and leave implementation changes uncommitted unless the user requests a commit.

## Execution record

- Task 1 complete on `feat/deploy-site`; user subsequently requested committing to `main` and pushing.
- Local harness: `/tmp/opencode/verify-system-deploy-site.py`; observed missing-workflow failure before implementation, then all six webhook cases plus parity, Bash syntax, and documentation checks passed. Event guards were checked structurally against Storybook, not executed in GitHub.
- Fresh reviewer: no actionable findings; repository-secret fallback remains an explicitly documented setup risk matching Storybook.
- `mise exec -- npm test` attempted: blocked by missing `vitest` (fresh clone dependencies not installed). No application test success is claimed.
- Validation made no live webhook calls or infrastructure changes. Pushing to `main` can trigger CI and the deployment workflows.
