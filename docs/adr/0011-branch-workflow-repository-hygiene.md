# ADR-0011: Branch Workflow and Public Repository Hygiene

- Status: Accepted
- Date: 2026-10-23

## Context

The repository is public. Changes should be reviewable and traceable, history should stay atomic (ADR-0005), and no secret may ever reach it.

## Decision

- `main` is the only long-lived branch. Work happens in short-lived branches named `<type>/<short-description>` (for example `feat/health-endpoint`), where `<type>` follows Conventional Commits.
- Every change reaches `main` through a pull request with CI green.
- Pull requests are merged with **rebase merge**, so atomic commits are preserved and history stays linear. Every commit must be a valid Conventional Commit.
- Secrets are never committed. Only `.env.example` with placeholder values is versioned. Rails credentials keys (`*.key`) are git-ignored.
- GitHub secret scanning and push protection are enabled on the repository.

## Consequences

**Positive:**

- Atomic, linear history that release-please can read.
- Secret leaks are blocked by tooling, not only by discipline.

**Negative:**

- Slightly more ceremony for small changes.
- Every commit, not only the PR title, must pass commitlint.

## Alternatives Considered

- **Squash merge**: simpler, but loses atomic commits.
- **Direct commits to `main`**: fastest, but no review point and no CI gate.

## References

- [Trunk Based Development](https://trunkbaseddevelopment.com/)
- [GitHub secret scanning](https://docs.github.com/en/code-security/secret-scanning)
