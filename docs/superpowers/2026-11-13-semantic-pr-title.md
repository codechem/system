# Semantic PR title workflow

## Design
Add a metadata-only GitHub Actions job named `Semantic PR title` on PR creation,
title edits, pushes, reopening, and transition to ready for review. Accept standard
Conventional Commit types, optional scopes, and optional breaking-change `!`.
Reject empty descriptions and multiline titles. This matches the repository's
conventional release-note grouping. No checkout, dependencies, credentials, or
write permissions are needed; read the title as data from the event payload,
never interpolate it into shell or JavaScript source.

This small configuration-only addition implements the workflow requested in the
conversation. GitHub ruleset settings remain manual: require `Semantic PR title`
alongside `test`; allow squash only and default its commit title to the PR title.
Individual branch commit messages are not validated. A merger can still edit the
final squash message; the PR-title check does not validate that edited message.

## Verification
Executed the actual inline Node script against 26 event payloads: standard types,
scopes, breaking markers, shell-like text, invalid types, empty descriptions,
invalid scopes, and multiline titles. All expected exit codes matched.

## Review and existing automation limitation
Fresh reviewer identified an existing integration constraint: site-bump PRs are
created with `GITHUB_TOKEN`, whose events do not trigger PR workflows. Once checks
are required, a human must trigger a qualifying event (for example editing the
title) or the bot authentication must be migrated to an appropriately scoped
GitHub App token. The existing CI check has the same constraint. Also, the
site-bump workflow's direct pushes to main conflict with the newly configured
PR requirement when no bypass is allowed. No bot credentials, bypasses, or site
release behavior were changed as part of this title-validation request.
