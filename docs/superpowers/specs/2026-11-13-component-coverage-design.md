# Component coverage design

## Intent and scope
Add actionable component coverage reports and prevent CI/publishing from passing with insufficient component coverage. Release scripts, applications, and token generation are outside coverage scope.

## Approaches
1. Extend existing CI: reuse Chromium tests, publish reports as artifacts, and preserve the existing publishing dependency on the test job. Selected by the user.
2. Separate workflow: isolates coverage, but would require additional release dependencies to block publishing. Not selected.

## Approved behavior
- Measure production TypeScript under `packages/components/src`, including untested files. Exclude tests, stories, declaration files, and generated files.
- Require at least 85% overall for statements, branches, functions, and lines (user raised the original >80% requirement during implementation).
- Generate console, HTML, and LCOV reports. Upload reports in existing CI even when tests or coverage fail, when files exist.
- Preserve existing test checks and publishing dependencies; do not weaken thresholds or exclude production files to make existing coverage pass.
- Document the local coverage command and report location. Report existing coverage gaps rather than silently expanding the task into component behavior changes.

## Constraints and non-goals
Use existing Vitest browser mode with Chromium and a matching coverage-provider version. No external reporting service, credentials, PR-writing permissions, or deployment changes. Existing component behavior stays unchanged.

## Approval
User approved the design in conversation before implementation.
