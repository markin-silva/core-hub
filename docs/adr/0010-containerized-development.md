# ADR-0010: Containerized Development with Docker Compose

- Status: Accepted
- Date: 2026-10-23

## Context

A reproducible development environment avoids "works on my machine" problems and keeps development close to production.

## Decision

Day-to-day development runs entirely in containers through `docker compose`: PostgreSQL, the Rails backend and the Vite frontend. Source code is bind-mounted for live reload. Configuration comes from environment variables, with `.env.example` as the documented template. Commands such as the Rails generators run inside the backend container, as the host user, to avoid root-owned files.

## Consequences

**Positive:**

- No Ruby or Node required on the host.
- Same dependencies for every environment.
- A new machine needs only Docker.

**Negative:**

- Bind mounts and file watching are slower than native execution on some platforms.
- Editor tooling (language servers) may need extra setup to see container dependencies.

## Alternatives Considered

- **Only PostgreSQL in a container**: faster iteration, but less reproducible.

## References

- [Docker Compose](https://docs.docker.com/compose/)
