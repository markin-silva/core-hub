# ADR-0012: Development Container Images and Compose Layout

- Status: Accepted
- Date: 2026-10-27

## Context

ADR-0010 requires development to run in containers through Docker Compose. ADR-0008 says that Dockerfiles receive runtime versions from `.tool-versions`. Docker Compose cannot read that file without an extra build script, and that script adds machinery for little gain at this stage.

## Decision

- **Image versions are pinned directly in the Dockerfiles**: `ruby:4.0.9-slim` for the backend and `node:24.22.1-slim` for the frontend. This replaces the mechanism described in ADR-0008 for Dockerfiles only. `.tool-versions` remains the reference for local tooling.
- **A CI check (step 5) compares the Dockerfile versions with `.tool-versions`** and fails on divergence, so the two cannot drift silently.
- **Compose services**: `db` (`postgres:17`), `backend` (Rails dev server) and `frontend` (Vite dev server, in its own container).
- **Source is bind-mounted** for live reload. Dependencies are installed at image build time, and `node_modules` is kept in an anonymous volume so the host bind mount does not overwrite it.
- **Ports are bound to `127.0.0.1`** on the host. The database is not reachable from the network.
- **The database volume is named** (`db-data`), so data survives `docker compose down`.
- **The frontend reaches the API through the Compose network** (`VITE_API_PROXY_TARGET=http://backend:3000`), so the Vite proxy from ADR-0009 works unchanged.
- **Secrets come from `.env`**, which is git-ignored. `.env.example` documents the required variables.

The production Dockerfile (multi-stage, serving the built frontend from Rails) is out of scope here and will be recorded in a later ADR.

## Consequences

**Positive:**

- Dependencies are installed once at build time, not on every `docker compose up`.
- The database is reachable only from the host, and only on loopback.
- Local and CI environments run the same images.

**Negative:**

- Two places hold the runtime version (`.tool-versions` and the Dockerfiles) until the CI check exists. Step 5 closes this gap.
- Rebuilding is needed after changing `Gemfile` or `package.json`.

## Alternatives Considered

- **Build arguments read from `.tool-versions`**: a single source of truth, but it needs a wrapper script for `docker compose`.
- **Rails serving the frontend in development**: fewer services, but it hides the Vite dev server and its hot reload.

## References

- [Docker Compose file reference](https://docs.docker.com/reference/compose-file/)
- [Official Ruby image](https://hub.docker.com/_/ruby)
- [Official Node image](https://hub.docker.com/_/node)
- [Official Postgres image](https://hub.docker.com/_/postgres)
