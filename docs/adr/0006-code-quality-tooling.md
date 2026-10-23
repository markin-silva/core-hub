# ADR-0006: Code Quality Tooling with Linters, Formatters and Lefthook

- Status: Accepted
- Date: 2026-10-23

## Context

Style and correctness problems should be caught before code reaches review or CI, and the same checks should run identically on a laptop and in CI. Conventional Commits (ADR-0005) also needs enforcement at commit time.

## Decision

Tools by package:

- **Backend (Ruby)**: RuboCop for linting and formatting (auto-correct). The exact rule set is decided in the linting step and will get its own ADR.
- **Frontend (TypeScript)**: ESLint for linting, Prettier for formatting, and `tsc --noEmit` for type checking.
- **Commit messages**: commitlint with the `@commitlint/config-conventional` preset.
- **Hooks**: Lefthook runs the checks locally:
  - `pre-commit`: formatters and linters on staged files.
  - `commit-msg`: commitlint.
- **CI**: runs the same linters and type checks on every pull request, and blocks merge on failure.

commitlint runs on Node, which the frontend already requires, so the root `package.json` will carry commitlint and Lefthook as dev dependencies.

## Consequences

**Positive:**

- Consistent style without review debates.
- Problems are caught locally and again in CI.
- Lefthook is a single binary with a declarative YAML config, which works across languages.

**Negative:**

- Contributors need to install Lefthook (`lefthook install`) once.
- Adds a root-level Node dependency for commitlint, even though the backend is Ruby.

## Alternatives Considered

- **Husky + lint-staged**: popular in the Node ecosystem, but it is tied to Node and needs more configuration for a multi-language repository.
- **pre-commit (Python framework)**: language-agnostic, but adds a Python dependency to a Ruby and Node project.

## References

- [RuboCop](https://rubocop.org/)
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)
- [Lefthook](https://lefthook.dev/)
- [commitlint](https://commitlint.js.org/)
