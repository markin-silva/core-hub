# ADR-0002: Render PaaS for Production Deployment

- Status: Accepted
- Date: 2026-10-23

## Context

Data ownership is the top priority, so the hosting choice must keep the data under our control. Options considered:

1. Self-hosted VPS (for example, Hetzner) with Kamal or Docker Compose.
2. Managed PaaS: Fly.io, Render, or Railway.

A VPS gives the most control but makes us responsible for backups, OS patching, security hardening and monitoring. A PaaS removes most of that work and still keeps the data in a provider we can export from and migrate away from.

## Decision

We will deploy production on Render, using:

- Docker-based web service for the Rails API, with the React build served as static assets.
- Render Managed PostgreSQL.
- Render environment variables for secrets (never committed to git).
- GitHub integration for deploys triggered from CI.

Dockerfiles are the deployment artifact, so the same image runs locally and in production. This keeps us portable if we move to a VPS later.

## Consequences

**Positive:**

- Little operational overhead for OS, TLS and database maintenance.
- Dockerfile-based deploys keep us portable.
- Simple monorepo setup: one service per package, each with its own root directory.

**Negative:**

- Render does not have a Brazil region. Latency is higher than a São Paulo deployment would give.
- Less low-level control than a VPS (no SSH access to the host).
- Managed database backup and retention rules depend on the Render plan. We must verify them before going live.
- Migrating to another provider requires rework of the deployment config.

## Alternatives Considered

- **Fly.io**: has a São Paulo region and good monorepo support. Not chosen because Render's setup is simpler for this phase. Revisit if latency becomes a real problem.
- **Self-hosted VPS with Kamal**: maximum control, but more operational work than a single owner should carry in phase 1. Can be adopted later because the app is already containerized.
- **Railway**: good developer experience, but usage-based pricing makes costs harder to predict.

## References

- [Render Docs](https://render.com/docs)
- [Render Managed PostgreSQL](https://render.com/docs/postgresql)
