# ADR-0008: Runtime Versions Pinned in .tool-versions

- Status: Accepted
- Date: 2026-10-23

## Context

Ruby and Node versions must match across local tooling, Docker images and CI. Defining them in several places makes them drift.

## Decision

We will pin runtime versions in a single root `.tool-versions` file, compatible with mise and asdf. Dockerfiles receive the versions as build arguments read from that file, and CI uses the same file to select runtimes. Development happens in containers (ADR-0010), so mise is optional on the host.

## Consequences

**Positive:**

- One place to bump a version.
- Local tools, containers and CI stay aligned.

**Negative:**

- Dockerfiles need a small step to read the file (a build script or a Compose build argument).
- `.ruby-version` and `.nvmrc` are not generated. Tools that only read those files need a manual mapping.

## Alternatives Considered

- **Versions only in Dockerfiles, `.ruby-version` and `.nvmrc`**: no extra tool, but the version lives in more places.

## References

- [mise](https://mise.jdx.dev/)
- [asdf](https://asdf-vm.com/)
