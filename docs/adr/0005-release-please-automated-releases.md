# ADR-0005: Automated Releases with Conventional Commits and release-please

- Status: Accepted
- Date: 2026-10-23

## Context

Manual versioning and changelog editing are error-prone. We want:

- SemVer version bumps derived from commit history.
- A changelog in Keep a Changelog format that stays in sync with the code.
- Tagged releases with notes, without manual steps.

Options considered:

1. release-please (GitHub Action maintained by Google). Reads Conventional Commits and opens a release PR that bumps the version and updates `CHANGELOG.md`. Merging the PR creates the tag and the GitHub Release.
2. semantic-release. Publishes on every merge to the default branch, with less control over timing.
3. git-cliff with manual tagging. Good changelog generation, but versioning and tagging stay manual.

## Decision

We will use:

- **Conventional Commits** for every commit message (see ADR-0006).
- **release-please** in GitHub Actions, configured with its manifest mode so `backend/` and `frontend/` can be versioned independently if needed. Start with one version for the repository.
- **Keep a Changelog** layout for `CHANGELOG.md`, with an `## [Unreleased]` section at the top.

Releases happen when the release PR is merged, which gives us a human checkpoint.

## Consequences

**Positive:**

- Versioning and changelog are derived from commits and stay consistent.
- The release PR is a review point before anything is tagged.
- Works with multi-package monorepos through manifest configuration.

**Negative:**

- Every commit on the default branch must follow Conventional Commits. The commit-msg hook enforces this locally, and CI enforces it on PRs.
- Tied to GitHub. Moving hosts means reconfiguring release automation.

## Alternatives Considered

- **semantic-release**: fully automatic, but releases on every merge, with no review point.
- **git-cliff with manual tags**: full control, but more manual steps and easier to forget.

## References

- [release-please](https://github.com/googleapis/release-please)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Semantic Versioning](https://semver.org/)
