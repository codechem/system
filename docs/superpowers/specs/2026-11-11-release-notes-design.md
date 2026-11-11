# Automatic GitHub release notes

## Intent

Create standard, automatically generated GitHub Releases for successful version-tag npm publications, covering direct commits as well as merged PRs without changing the existing release process.

## Approaches

1. **GitHub-native generated notes:** minimal workflow changes, but primarily lists merged PRs and does not reliably summarize direct commits. Initially selected, then rejected after discussing that limitation.
2. **Commit-based notes on version tags (selected):** retain tag-driven publication and generate categorized notes from all commits since the preceding stable version tag. Covers the project's direct-commit workflow; descriptions are derived from commit messages rather than invented prose.
3. **Release Please:** generate release PRs and a changelog from conventional commits. Changes the release process. Not selected.

## Design

- Keep the existing CI, version tags, npm publishing, and deployment workflows unchanged in behavior.
- Add a GitHub Release job after successful npm publication, restricted to the existing version-tag release path.
- Grant repository contents write permission only to the release job.
- Generate Markdown from the full commit range since the closest preceding stable semantic-version tag reachable in the release's history. For the first version tag, include all history up to that tag. Fetch complete history and tags so the range is reliable.
- Group conventional commit subjects into breaking changes, features, fixes, documentation, and maintenance, with an other-changes fallback for unrecognized subjects. Recognize both `!` markers and `BREAKING CHANGE:` footers; include supplied breaking-change explanations without inventing migration advice.
- Include a short factual summary, linked commit references, PR links when present in commit subjects, contributor credits from commit authors, and a full comparison link (or history link for the first release). Omit empty sections.
- Keep commit metadata as data, not executable shell input. Use a small dependency-free script with automated tests for ranges, categorization, Markdown generation, and unusual commit metadata.
- Document commit conventions and the automatic release process. No label configuration is needed for commit-based notes.
- Make reruns safe: an existing release is left unchanged, preserving any human edits. A failed release creation can be retried without repeating successful npm publication by rerunning the failed job.

## Scope and constraints

No new release manager, version automation, checked-in changelog, npm publication changes, historical release backfill, repository label creation, or live release creation during implementation. Existing prerelease publishing behavior remains outside this change.

## Verification

Validate workflow structure, dependency and permission scoping, commit range selection, generated notes, and release creation/rerun behavior with local fixtures and mocked GitHub CLI calls. Do not publish packages or create a live release as a test.
