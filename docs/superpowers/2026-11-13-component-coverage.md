# Component coverage

## Implementation
- Added root/workspace `test:coverage` commands and matching Vitest V8 provider.
- Includes production component TypeScript, including untested files; excludes tests, stories, declarations. Generated outputs are outside `src`.
- User raised the gate to at least 85% overall for statements, branches, functions, and lines.
- Existing CI runs coverage and uploads HTML/LCOV reports with `always()`. Publishing still depends on the test job.
- GitHub branch rules must separately require the `test` status check to block merging.

## Verification
- Baseline and final `npm test`: 501 tests across 23 files pass.
- `node --test scripts/*.test.mjs`: 32 pass.
- `npm run build`: passes.
- `npm run test:coverage` at 85%: passes; statements 97.45%, branches 89.60%, functions 96.38%, lines 98.23%.
- Temporary real-browser probes at the original 80.01% threshold proved exactly 80% fails with exit 1 and an unimported source file counts as 0%. Probe files removed afterward.
- Inspected LCOV source list: all 26 production TypeScript files, no tests or stories.
- Configuration-only changes verified through actual CLI runs rather than source-text assertion tests.

## Review
Fresh read-only reviewer found no issues with the updated 85% gate, scope, failure-safe artifact upload, or publishing dependency. Reviewer did not independently execute commands; verification above was performed by the implementer. No remote settings changed, no merge or push performed.
