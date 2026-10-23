# core-hub

Private, self-hosted hub for managing personal life. Data ownership is the top priority; cross-domain insights come later.

Chat with the maintainer happens in Portuguese. Everything in the repository (code, docs, ADRs, commits, this file) is in English.

## Stack

- **Backend**: Ruby on Rails API, PostgreSQL, RSpec.
- **Frontend**: React + Vite + TypeScript + Tailwind CSS.
- **Layout**: monorepo. `backend/` and `frontend/` at the root, shared tooling at the root.
- **Production**: Render (Dockerfile-based services, managed PostgreSQL).

## Principles

- Minimalist and strictly functional UX. No speculative features or customization.
- No tracking, telemetry, or third-party scripts.
- Every module exports its data in an open format.
- Small, atomic steps. Each step is approved before it is implemented.

## Conventions

- **Commits**: Conventional Commits, enforced by commitlint on `commit-msg`.
- **Versioning**: SemVer. Releases are driven by release-please from merged release PRs.
- **Changelog**: Keep a Changelog format in `CHANGELOG.md`.
- **Local checks**: Lefthook runs formatters, linters and commitlint.
- **Config**: 12-factor. Secrets come from environment variables. Only `.env.example` files are committed.
- **Decisions**: every architectural decision is recorded in `docs/adr/NNNN-title.md`, using the template in `docs/adr/template.md`, and summarized below.

## Architecture Decisions

| ADR | Decision |
|---|---|
| [0001](docs/adr/0001-monorepo-architecture.md) | Single repository with `backend/` (Rails API) and `frontend/` (React). |
| [0002](docs/adr/0002-render-paas-deployment.md) | Production on Render, deployed from Dockerfiles, with managed PostgreSQL. |
| [0003](docs/adr/0003-session-based-authentication.md) | Rails native sessions with `has_secure_password`. Signed, encrypted, `HttpOnly` cookie. No extra auth gems. |
| [0004](docs/adr/0004-rspec-backend-testing.md) | RSpec with factory_bot and shoulda-matchers. Request specs for the API. |
| [0005](docs/adr/0005-release-please-automated-releases.md) | Conventional Commits drive release-please, which opens release PRs with version bumps and changelog. |
| [0006](docs/adr/0006-code-quality-tooling.md) | RuboCop (backend), ESLint + Prettier + `tsc` (frontend), commitlint, Lefthook hooks, same checks in CI. |
| [0007](docs/adr/0007-privacy-first-minimalist-ux.md) | Data ownership, no tracking, minimalist UX, modules are features and not plugins. |

## Roadmap: Phase 1 (Foundation for Production)

1. Monorepo and Docker (Rails and Vite scaffolds, Dockerfiles, Docker Compose for local development).
2. Linters and formatters (RuboCop, ESLint, Prettier, `tsc`), with Lefthook and commitlint.
3. Tests (RSpec, Vitest).
4. Authentication and authorization (User model, sessions, access control).
5. CI/CD (GitHub Actions, release-please) and first deploy to Render.

Business modules start only after phase 1 is running in production.
