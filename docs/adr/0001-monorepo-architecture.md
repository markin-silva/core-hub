# ADR-0001: Monorepo with Rails API and React Frontend

- Status: Accepted
- Date: 2026-10-23

## Context

nexus-hub will grow into several business modules (finances, workouts, car maintenance, tasks, music studies). They share infrastructure: Docker, CI/CD, deployment, and authentication. Splitting them across repositories would duplicate that setup for a single-owner system and add coordination overhead.

## Decision

We will keep a single Git repository with two top-level packages:

- `backend/`: Ruby on Rails API (PostgreSQL)
- `frontend/`: React + Vite + TypeScript + Tailwind CSS

Shared infrastructure (Docker, GitHub Actions, root tooling such as Lefthook and commitlint) lives at the repository root.

## Consequences

**Positive:**

- One deployment unit and one CI pipeline to maintain.
- Refactors that span backend and frontend land in a single atomic commit.
- Infrastructure code is defined once.

**Negative:**

- The repository grows larger over time.
- A change in one package may trigger CI for both, until path filters are added.

## Alternatives Considered

- **Separate repositories**: more isolation, but duplicates CI and deployment configuration and makes cross-cutting changes harder.
- **Microservices**: adds network boundaries, service discovery and operational cost that a single-owner app does not need.

## References

- [Monorepos (Atlassian)](https://www.atlassian.com/git/tutorials/monorepos)
